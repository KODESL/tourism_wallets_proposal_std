/**
 * OpenID4VP 1.0 holder client (presentation definition + SD-JWT).
 * Provenance: eudi/src/presentation/OpenID4VPClient.ts (RN Metrics removed).
 * DCQL is not implemented here.
 */
import { KeyManager } from '../crypto/KeyManager';
import { sha256 } from '@noble/hashes/sha256';
import { JSONPath } from 'jsonpath-plus';
import { metrics } from '../telemetry/metrics';

interface PresentationRequest {
  response_uri: string;
  nonce: string;
  presentation_definition: {
    id: string;
    input_descriptors: Array<{
      id: string;
      format: { 'vc+sd-jwt': {} };
      constraints: {
        fields: Array<{
          path: string[];
          filter?: object;
        }>;
      };
    }>;
  };
  client_metadata: {
    client_name: string;
    logo_uri?: string;
  };
  client_id?: string;
}

interface PresentationSubmission {
  id: string;
  definition_id: string;
  descriptor_map: Array<{
    id: string;
    format: string;
    path: string;
  }>;
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
 * Generates a random UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
 * OpenID4VP 1.0 Credential Presentation Client
 *
 * Implements credential presentation with selective disclosure and key binding
 */
export class OpenID4VPClient {
  constructor(private keyManager: KeyManager) {}

  /**
   * Parse presentation request from URI
   *
   * @param uri - openid4vp://authorize?request_uri=https://...
   * @returns Parsed presentation request
   */
  async parsePresentationRequest(uri: string): Promise<PresentationRequest> {
    return metrics.time('VP Request Parse', async () => {
      try {
        const url = new URL(uri);
        const requestUri = url.searchParams.get('request_uri');

        if (!requestUri) {
          // Check if request is embedded directly
          const requestParam = url.searchParams.get('request');
          if (requestParam) {
            return this.parseRequestObject(requestParam);
          }
          throw new Error('Missing request_uri or request parameter');
        }

        // Fetch request object from request_uri
        const response = await fetch(requestUri);

        if (!response.ok) {
          throw new Error(`Failed to fetch request object: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let requestObject: string;

        if (contentType?.includes('application/jwt')) {
          // JWT-secured request object
          requestObject = await response.text();
        } else {
          // Plain JSON
          const json = await response.json();
          requestObject = JSON.stringify(json);
        }

        return this.parseRequestObject(requestObject);
      } catch (error) {
        throw new Error(
          `Failed to parse presentation request: ${(error as Error).message}`
        );
      }
    }, { uri });
  }

  /**
   * Parse request object (JWT or JSON)
   */
  private parseRequestObject(requestObject: string): PresentationRequest {
    try {
      // Check if it's a JWT (three parts separated by dots)
      if (requestObject.includes('.') && requestObject.split('.').length === 3) {
        // Parse JWT
        const parts = requestObject.split('.');
        const payloadBytes = base64UrlToBytes(parts[1]);
        const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
        return payload as PresentationRequest;
      } else {
        // Parse as JSON
        return JSON.parse(requestObject) as PresentationRequest;
      }
    } catch (error) {
      throw new Error(`Invalid request object format: ${(error as Error).message}`);
    }
  }

  /**
   * Select credentials matching presentation definition
   *
   * @param storedCredentials - Array of SD-JWT credentials from wallet storage
   * @param presentationDef - presentation_definition from request
   * @returns Array of selected credentials
   */
  selectCredentials(
    storedCredentials: string[],
    presentationDef: PresentationRequest['presentation_definition']
  ): string[] {
    const selectedCredentials: string[] = [];

    for (const descriptor of presentationDef.input_descriptors) {
      // Find first matching credential
      const matchingCredential = storedCredentials.find((credential) => {
        try {
          return this.matchesDescriptor(credential, descriptor);
        } catch {
          return false;
        }
      });

      if (matchingCredential) {
        selectedCredentials.push(matchingCredential);
      }
    }

    return selectedCredentials;
  }

  /**
   * Check if credential matches input descriptor
   */
  private matchesDescriptor(
    credential: string,
    descriptor: PresentationRequest['presentation_definition']['input_descriptors'][0]
  ): boolean {
    // Parse SD-JWT credential and merge disclosures into the claim set
    // used for matching (names live in disclosures, not the JWT payload).
    const parsed = this.parseSDJWT(credential);
    const disclosed: Record<string, unknown> = { ...parsed.claims };
    for (const [name, value] of parsed.disclosures) {
      disclosed[name] = value;
    }

    // Check format matches
    if (!descriptor.format['vc+sd-jwt']) {
      return false;
    }

    // Evaluate all constraint fields
    for (const field of descriptor.constraints.fields) {
      for (const path of field.path) {
        const values = this.evaluateJSONPath(disclosed, path);

        // If filter is provided, check if value matches
        if (field.filter) {
          if (!this.matchesFilter(values, field.filter)) {
            return false;
          }
        } else {
          // No filter means we just need the field to exist
          if (values.length === 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Evaluate JSONPath expression on claims
   */
  private evaluateJSONPath(claims: Record<string, any>, path: string): any[] {
    try {
      return JSONPath({ path, json: claims, wrap: true });
    } catch {
      return [];
    }
  }

  /**
   * Check if values match filter
   */
  private matchesFilter(values: any[], filter: any): boolean {
    if (values.length === 0) {
      return false;
    }

    // Handle 'const' filter (exact match)
    if (filter.const !== undefined) {
      return values.some((v) => v === filter.const);
    }

    // Handle 'enum' filter (one of)
    if (filter.enum !== undefined && Array.isArray(filter.enum)) {
      return values.some((v) => filter.enum.includes(v));
    }

    // Handle 'pattern' filter (regex)
    if (filter.pattern !== undefined) {
      const regex = new RegExp(filter.pattern);
      return values.some((v) => typeof v === 'string' && regex.test(v));
    }

    // If no recognized filter, consider it a match
    return true;
  }

  /**
   * Create VP Token (presentation response)
   *
   * @param credentials - Selected SD-JWT credentials
   * @param request - Original presentation request
   * @returns Array of credentials with KB-JWT
   */
  async createVPToken(
    credentials: string[],
    request: PresentationRequest
  ): Promise<string[]> {
    const vpTokens: string[] = [];

    for (const credential of credentials) {
      // Parse SD-JWT to get claims and disclosures
      const parsed = this.parseSDJWT(credential);

      // Filter disclosures based on requested fields
      const requestedFields = this.getRequestedFields(request.presentation_definition);
      const filteredDisclosures = this.filterDisclosures(
        parsed.disclosures,
        requestedFields
      );

      // Reconstruct SD-JWT with filtered disclosures
      const parts = credential.split('~');
      const mainJwt = parts[0];

      // Build new SD-JWT: <jwt>~<disclosure1>~<disclosure2>~...
      let filteredSDJWT = mainJwt;
      for (const disclosure of filteredDisclosures) {
        filteredSDJWT += `~${disclosure}`;
      }

      // Create Key Binding JWT
      const kbJwt = await this.createKeyBindingJWT(
        filteredSDJWT,
        request.nonce,
        request.client_id || request.client_metadata.client_name
      );

      // Append KB-JWT
      const vpToken = `${filteredSDJWT}~${kbJwt}`;
      vpTokens.push(vpToken);
    }

    return vpTokens;
  }

  /**
   * Get all requested field names from presentation definition
   */
  private getRequestedFields(
    presentationDef: PresentationRequest['presentation_definition']
  ): Set<string> {
    const fields = new Set<string>();

    for (const descriptor of presentationDef.input_descriptors) {
      for (const constraint of descriptor.constraints.fields) {
        for (const path of constraint.path) {
          // Extract field name from JSONPath (e.g., "$.given_name" -> "given_name")
          const match = path.match(/\$\.(\w+)/);
          if (match) {
            fields.add(match[1]);
          }
        }
      }
    }

    return fields;
  }

  /**
   * Filter disclosures to only include requested fields
   */
  private filterDisclosures(
    disclosures: Array<[string, any]>,
    requestedFields: Set<string>
  ): string[] {
    const filtered: string[] = [];

    for (const [fieldName, fieldValue] of disclosures) {
      if (requestedFields.has(fieldName)) {
        // Re-encode disclosure in original format: [salt, claim_name, claim_value]
        const disclosureArray = [this.generateSalt(), fieldName, fieldValue];
        const disclosureJson = JSON.stringify(disclosureArray);
        const disclosureBase64 = bytesToBase64Url(
          new TextEncoder().encode(disclosureJson)
        );
        filtered.push(disclosureBase64);
      }
    }

    return filtered;
  }

  /**
   * Generate random salt for disclosure
   */
  private generateSalt(): string {
    return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  }

  /**
   * Create Key Binding JWT
   */
  private async createKeyBindingJWT(
    sdJwt: string,
    nonce: string,
    audience: string
  ): Promise<string> {
    // Calculate sd_hash (SHA-256 of SD-JWT without KB-JWT)
    const sdJwtBytes = new TextEncoder().encode(sdJwt);
    const sdHash = sha256(sdJwtBytes);

    // Generate or retrieve key for signing
    const keyPair = await this.keyManager.generateKeyPair();

    const header = {
      typ: 'kb+jwt',
      alg: 'ES256',
      kid: keyPair.keyId,
    };

    const payload = {
      aud: audience,
      nonce,
      iat: Math.floor(Date.now() / 1000),
      sd_hash: bytesToBase64Url(sdHash),
    };

    // Sign the KB-JWT
    const signature = await this.keyManager.sign(keyPair.keyId, {
      header,
      payload,
    });

    return createJWT(header, payload, signature);
  }

  /**
   * Submit presentation to verifier
   *
   * @param vpToken - Array of credentials with KB-JWT
   * @param request - Original presentation request
   */
  async submitPresentation(
    vpToken: string[],
    request: PresentationRequest
  ): Promise<void> {
    return metrics.time('Credential Presentation (OpenID4VP)', async () => {
      // Create presentation submission
      const presentationSubmission: PresentationSubmission = {
        id: generateUUID(),
        definition_id: request.presentation_definition.id,
        descriptor_map: request.presentation_definition.input_descriptors.map(
          (descriptor, index) => ({
            id: descriptor.id,
            format: 'vc+sd-jwt',
            path: `$[${index}]`,
          })
        ),
      };

      // Submit to verifier
      const response = await fetch(request.response_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vp_token: vpToken,
          presentation_submission: presentationSubmission,
        }),
      });

      if (!response.ok) {
        throw new Error(`Presentation submission failed: ${response.statusText}`);
      }
    }, { responseUri: request.response_uri, tokenCount: vpToken.length });
  }

  /**
   * Parse SD-JWT credential
   *
   * SD-JWT format: <jwt>~<disclosure1>~<disclosure2>~...~<key_binding_jwt>
   */
  private parseSDJWT(sdJwt: string): {
    claims: Record<string, any>;
    disclosures: Array<[string, any]>;
  } {
    try {
      const parts = sdJwt.split('~');

      if (parts.length < 1) {
        throw new Error('Invalid SD-JWT format');
      }

      // Parse main JWT
      const jwtParts = parts[0].split('.');
      if (jwtParts.length !== 3) {
        throw new Error('Invalid JWT format in SD-JWT');
      }

      const payloadBytes = base64UrlToBytes(jwtParts[1]);
      const claims = JSON.parse(new TextDecoder().decode(payloadBytes));

      // Parse disclosures
      const disclosures: Array<[string, any]> = [];
      const lastIndex = parts.length - 1;

      for (let i = 1; i < lastIndex; i++) {
        if (parts[i]) {
          try {
            const disclosureBytes = base64UrlToBytes(parts[i]);
            const disclosure = JSON.parse(
              new TextDecoder().decode(disclosureBytes)
            );

            if (Array.isArray(disclosure) && disclosure.length >= 2) {
              disclosures.push([disclosure[1], disclosure[2]]);
            }
          } catch {
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
