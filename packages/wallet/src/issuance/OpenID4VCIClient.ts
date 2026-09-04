/**
 * OpenID4VCI 1.0 holder client.
 * Provenance: eudi/src/issuance/OpenID4VCIClient.ts (RN Metrics removed).
 */
import { KeyManager } from '../crypto/KeyManager';
import { sha256 } from '@noble/hashes/sha256';
import { metrics } from '../telemetry/metrics';

interface CredentialOffer {
  credential_issuer: string;
  credentials: string[];
  grants: {
    authorization_code?: {
      issuer_state: string;
    };
  };
}

interface IssuerMetadata {
  credential_issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  credential_endpoint: string;
  credentials_supported: Array<{
    format: string;
    vct: string;
  }>;
}

interface IssuedCredential {
  credential: string; // SD-JWT format
  format: 'vc+sd-jwt';
  c_nonce?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  c_nonce?: string;
  c_nonce_expires_in?: number;
}

/**
 * Converts bytes to base64url encoding
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Converts base64url to bytes
 */
function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Generates a random base64url string of specified byte length
 */
function generateRandomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  // Use crypto.getRandomValues in browser, or fallback for Node
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for Node.js environment
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToBase64Url(bytes);
}

/**
 * Creates a compact JWT (header.payload.signature)
 */
function createJWT(header: object, payload: object, signature: string): string {
  const headerB64 = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * OpenID4VCI 1.0 Credential Issuance Client
 *
 * Implements the complete authorization code flow with PKCE for credential issuance
 */
export class OpenID4VCIClient {
  constructor(
    private keyManager: KeyManager,
    private clientId: string = 'tourism-wallet-ref'
  ) {}

  /**
   * Complete OpenID4VCI authorization code flow
   *
   * @param offerUri - URI from QR code: openid-credential-offer://?credential_offer=...
   * @param authorizationCallback - Callback to handle user authorization (returns auth code)
   * @returns Issued credential in SD-JWT format
   */
  async issueCredential(
    offerUri: string,
    authorizationCallback?: (authUrl: string) => Promise<string>
  ): Promise<IssuedCredential> {
    // Step 1: Parse credential offer from URI
    const offer = this.parseCredentialOffer(offerUri);

    // Step 2: Fetch issuer metadata
    const metadata = await this.fetchIssuerMetadata(offer.credential_issuer);

    // Step 3: Generate PKCE challenge
    const codeVerifier = generateRandomBase64Url(32); // 43 chars in base64url
    const codeChallenge = bytesToBase64Url(
      sha256(new TextEncoder().encode(codeVerifier))
    );

    // Step 4: Build authorization request
    const authorizationResponse = await this.authorize(
      metadata,
      offer,
      codeChallenge,
      authorizationCallback
    );

    // Step 6: Exchange code for token
    const tokenResponse = await this.exchangeCodeForToken(
      metadata.token_endpoint,
      authorizationResponse.code,
      codeVerifier
    );

    // Step 7 & 8: Generate proof and request credential
    const credential = await this.requestCredential(
      metadata.credential_endpoint,
      tokenResponse.access_token,
      tokenResponse.c_nonce || 'default-nonce',
      offer.credentials[0],
      offer.credential_issuer
    );

    return {
      credential: credential.credential,
      format: 'vc+sd-jwt',
      c_nonce: credential.c_nonce,
    };
  }

  /**
   * Step 1: Parse credential offer from URI
   */
  private parseCredentialOffer(offerUri: string): CredentialOffer {
    try {
      // Extract credential_offer parameter
      const url = new URL(offerUri);
      const offerParam = url.searchParams.get('credential_offer');

      if (!offerParam) {
        throw new Error('Missing credential_offer parameter');
      }

      // Offer may be raw JSON or base64url-encoded JSON. Prefer JSON so a
      // Node Buffer decode of `{...}` is not treated as success.
      let offerJson: string;
      const trimmed = offerParam.trim();
      if (trimmed.startsWith('{')) {
        offerJson = offerParam;
      } else {
        try {
          const decoded = base64UrlToBytes(offerParam);
          offerJson = new TextDecoder().decode(decoded);
          JSON.parse(offerJson);
        } catch {
          offerJson = offerParam;
        }
      }

      const offer = JSON.parse(offerJson) as CredentialOffer;

      // Validate required fields
      if (
        !offer.credential_issuer ||
        !offer.credentials ||
        offer.credentials.length === 0
      ) {
        throw new Error('Invalid credential offer structure');
      }

      return offer;
    } catch (error) {
      throw new Error(
        `Failed to parse credential offer: ${(error as Error).message}`
      );
    }
  }

  /**
   * Step 2: Fetch issuer metadata
   */
  private async fetchIssuerMetadata(
    credentialIssuer: string
  ): Promise<IssuerMetadata> {
    return metrics.time('VCI Metadata Fetch', async () => {
      const metadataUrl = `${credentialIssuer}/.well-known/openid-credential-issuer`;

      const response = await fetch(metadataUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch issuer metadata: ${response.statusText}`
        );
      }

      const metadata = (await response.json()) as IssuerMetadata;

      // Validate required endpoints
      if (
        !metadata.authorization_endpoint ||
        !metadata.token_endpoint ||
        !metadata.credential_endpoint
      ) {
        throw new Error('Issuer metadata missing required endpoints');
      }

      return metadata;
    }, { url: credentialIssuer });
  }

  /**
   * Step 4 & 5: Build and submit authorization request
   */
  private async authorize(
    metadata: IssuerMetadata,
    offer: CredentialOffer,
    codeChallenge: string,
    authorizationCallback?: (authUrl: string) => Promise<string>
  ): Promise<{ code: string }> {
    const authRequest = {
      response_type: 'code',
      client_id: this.clientId,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      authorization_details: [
        {
          type: 'openid_credential',
          format: 'vc+sd-jwt',
          vct: offer.credentials[0],
        },
      ],
      issuer_state: offer.grants.authorization_code?.issuer_state,
    };

    // In production: redirect user to authorization endpoint
    // For testing: use callback or mock
    if (authorizationCallback) {
      const authUrl = `${metadata.authorization_endpoint}?${new URLSearchParams(
        authRequest as any
      ).toString()}`;
      const code = await authorizationCallback(authUrl);
      return { code };
    }

    // Mock response for testing
    return { code: 'mock-auth-code-12345' };
  }

  /**
   * Step 6: Exchange authorization code for access token
   */
  private async exchangeCodeForToken(
    tokenEndpoint: string,
    code: string,
    codeVerifier: string
  ): Promise<TokenResponse> {
    return metrics.time('VCI Token Exchange', async () => {
      const tokenRequest = {
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        client_id: this.clientId,
      };

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequest).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenResponse = (await response.json()) as TokenResponse;

      if (!tokenResponse.access_token) {
        throw new Error('Token response missing access_token');
      }

      return tokenResponse;
    }, { url: tokenEndpoint });
  }

  /**
   * Step 7: Generate proof of possession JWT
   */
  private async generateProofJWT(
    nonce: string,
    audience: string,
    keyId: string
  ): Promise<string> {
    // Generate new key pair for proof
    const keyPair = await this.keyManager.generateKeyPair();

    const header = {
      typ: 'openid4vci-proof+jwt',
      alg: 'ES256',
      kid: keyPair.keyId,
    };

    const payload = {
      aud: audience,
      iat: Math.floor(Date.now() / 1000),
      nonce,
    };

    // Sign the proof
    const signature = await this.keyManager.sign(keyPair.keyId, {
      header,
      payload,
    });

    return createJWT(header, payload, signature);
  }

  /**
   * Step 8: Request credential from issuer
   */
  private async requestCredential(
    credentialEndpoint: string,
    accessToken: string,
    nonce: string,
    vct: string,
    audience: string
  ): Promise<IssuedCredential> {
    return metrics.time('Credential Request (SD-JWT)', async () => {
      // Generate proof of possession
      const proofJwt = await this.generateProofJWT(
        nonce,
        audience,
        'temp-key-for-proof'
      );

      const credentialRequest = {
        format: 'vc+sd-jwt',
        vct,
        proof: {
          proof_type: 'jwt',
          jwt: proofJwt,
        },
      };

      const response = await fetch(credentialEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(credentialRequest),
      });

      if (!response.ok) {
        throw new Error(`Credential request failed: ${response.statusText}`);
      }

      const credentialResponse = (await response.json()) as IssuedCredential;

      if (!credentialResponse.credential) {
        throw new Error('Credential response missing credential');
      }

      return credentialResponse;
    }, { url: credentialEndpoint, vct });
  }

  /**
   * Parse SD-JWT credential
   *
   * SD-JWT format: <jwt>~<disclosure1>~<disclosure2>~...~<key_binding_jwt>
   *
   * @param sdJwt - SD-JWT string
   * @returns Parsed claims and disclosures
   */
  parseSDJWT(sdJwt: string): {
    claims: Record<string, any>;
    disclosures: Array<[string, any]>;
  } {
    try {
      // Split by '~'
      const parts = sdJwt.split('~');

      if (parts.length < 1) {
        throw new Error('Invalid SD-JWT format');
      }

      // Parse main JWT (first part)
      const jwtParts = parts[0].split('.');
      if (jwtParts.length !== 3) {
        throw new Error('Invalid JWT format in SD-JWT');
      }

      const payloadBytes = base64UrlToBytes(jwtParts[1]);
      const claims = JSON.parse(new TextDecoder().decode(payloadBytes));

      // Parse disclosures (all parts except first and last)
      const disclosures: Array<[string, any]> = [];
      const lastIndex = parts.length - 1;

      for (let i = 1; i < lastIndex; i++) {
        if (parts[i]) {
          try {
            const disclosureBytes = base64UrlToBytes(parts[i]);
            const disclosure = JSON.parse(
              new TextDecoder().decode(disclosureBytes)
            );

            // Disclosure format: [salt, claim_name, claim_value]
            if (Array.isArray(disclosure) && disclosure.length >= 2) {
              disclosures.push([disclosure[1], disclosure[2]]);
            }
          } catch {
            // Skip invalid disclosures
            continue;
          }
        }
      }

      return { claims, disclosures };
    } catch (error) {
      throw new Error(`Failed to parse SD-JWT: ${(error as Error).message}`);
    }
  }
}
