import { OpenID4VCIClient } from '../OpenID4VCIClient';
import { KeyManager } from '../../crypto/KeyManager';

// Mock fetch globally
global.fetch = jest.fn();

// Mock KeyManager
jest.mock('../../crypto/KeyManager');

describe('OpenID4VCIClient', () => {
  let client: OpenID4VCIClient;
  let mockKeyManager: jest.Mocked<KeyManager>;

  const MOCK_ISSUER = 'https://issuer.example.tourism';
  const MOCK_METADATA = {
    credential_issuer: MOCK_ISSUER,
    authorization_endpoint: `${MOCK_ISSUER}/authorize`,
    token_endpoint: `${MOCK_ISSUER}/token`,
    credential_endpoint: `${MOCK_ISSUER}/credential`,
    credentials_supported: [
      {
        format: 'vc+sd-jwt',
        vct: 'eu.europa.ec.eudi.pid.1',
      },
    ],
  };

  const MOCK_CREDENTIAL_OFFER = {
    credential_issuer: MOCK_ISSUER,
    credentials: ['eu.europa.ec.eudi.pid.1'],
    grants: {
      authorization_code: {
        issuer_state: 'test-state-123',
      },
    },
  };

  const MOCK_TOKEN_RESPONSE = {
    access_token: 'mock-access-token',
    token_type: 'Bearer',
    expires_in: 3600,
    c_nonce: 'mock-nonce-123',
  };

  const MOCK_CREDENTIAL = {
    credential:
      'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BpZC5zcGFpbi5nb3YiLCJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSJ9.mock-signature~WyJzYWx0MSIsImdpdmVuX25hbWUiLCJKb2huIl0~',
    format: 'vc+sd-jwt' as const,
    c_nonce: 'next-nonce-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup KeyManager mock
    mockKeyManager = new KeyManager() as jest.Mocked<KeyManager>;
    mockKeyManager.generateKeyPair = jest.fn().mockResolvedValue({
      keyId: 'mock-key-123',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'mock-x-value',
        y: 'mock-y-value',
      },
    });
    mockKeyManager.sign = jest.fn().mockResolvedValue('mock-signature');

    client = new OpenID4VCIClient(mockKeyManager);
  });

  describe('issueCredential', () => {
    it('should complete full issuance flow', async () => {
      // Mock fetch responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          // Metadata fetch
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          // Token exchange
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          // Credential request
          ok: true,
          json: async () => MOCK_CREDENTIAL,
        });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      const result = await client.issueCredential(offerUri);

      expect(result).toEqual({
        credential: MOCK_CREDENTIAL.credential,
        format: 'vc+sd-jwt',
        c_nonce: 'next-nonce-456',
      });

      // Verify metadata was fetched
      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_ISSUER}/.well-known/openid-credential-issuer`
      );

      // Verify token exchange happened
      expect(global.fetch).toHaveBeenCalledWith(
        MOCK_METADATA.token_endpoint,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      // Verify credential request happened
      expect(global.fetch).toHaveBeenCalledWith(
        MOCK_METADATA.credential_endpoint,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-access-token',
          },
        })
      );
    });

    it('should handle base64url encoded credential offer', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_CREDENTIAL,
        });

      const offerJson = JSON.stringify(MOCK_CREDENTIAL_OFFER);
      const offerBase64 = Buffer.from(offerJson)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const offerUri = `openid-credential-offer://?credential_offer=${offerBase64}`;

      const result = await client.issueCredential(offerUri);

      expect(result.credential).toBe(MOCK_CREDENTIAL.credential);
    });

    it('should handle authorization callback', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_CREDENTIAL,
        });

      const authCallback = jest
        .fn()
        .mockResolvedValue('custom-auth-code-789');

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      await client.issueCredential(offerUri, authCallback);

      expect(authCallback).toHaveBeenCalledWith(
        expect.stringContaining(MOCK_METADATA.authorization_endpoint)
      );
    });

    it('should throw error for invalid credential offer URI', async () => {
      const invalidUri = 'openid-credential-offer://?invalid=true';

      await expect(client.issueCredential(invalidUri)).rejects.toThrow(
        'Missing credential_offer parameter'
      );
    });

    it('should throw error if metadata fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      await expect(client.issueCredential(offerUri)).rejects.toThrow(
        'Failed to fetch issuer metadata'
      );
    });

    it('should throw error if token exchange fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Unauthorized',
        });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      await expect(client.issueCredential(offerUri)).rejects.toThrow(
        'Token exchange failed'
      );
    });

    it('should throw error if credential request fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Bad Request',
        });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      await expect(client.issueCredential(offerUri)).rejects.toThrow(
        'Credential request failed'
      );
    });

    it('should generate valid PKCE challenge', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_CREDENTIAL,
        });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      await client.issueCredential(offerUri);

      // Verify token request includes code_verifier
      const tokenCall = (global.fetch as jest.Mock).mock.calls.find((call) =>
        call[0].includes('token')
      );
      expect(tokenCall).toBeDefined();
      expect(tokenCall[1].body).toContain('code_verifier=');
      expect(tokenCall[1].body).toContain('grant_type=authorization_code');
    });

    it('should generate proof of possession JWT', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_CREDENTIAL,
        });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      await client.issueCredential(offerUri);

      // Verify key was generated for proof
      expect(mockKeyManager.generateKeyPair).toHaveBeenCalled();

      // Verify credential request includes proof
      const credentialCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].endsWith('/credential') &&
          call[1]?.body
      );
      expect(credentialCall).toBeDefined();

      const body = JSON.parse(credentialCall[1].body);
      expect(body.proof).toBeDefined();
      expect(body.proof.proof_type).toBe('jwt');
      expect(body.proof.jwt).toBeTruthy();
    });
  });

  describe('parseSDJWT', () => {
    it('should parse valid SD-JWT with disclosures', () => {
      const mockJwt =
        'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BpZC5zcGFpbi5nb3YiLCJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSIsInN1YiI6IjEyMzQ1Njc4OSJ9.mock-signature';
      const disclosure1 = Buffer.from(
        JSON.stringify(['salt1', 'given_name', 'John'])
      )
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      const disclosure2 = Buffer.from(
        JSON.stringify(['salt2', 'family_name', 'Doe'])
      )
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const sdJwt = `${mockJwt}~${disclosure1}~${disclosure2}~`;

      const result = client.parseSDJWT(sdJwt);

      expect(result.claims).toHaveProperty('iss', 'https://pid.spain.gov');
      expect(result.claims).toHaveProperty('vct', 'eu.europa.ec.eudi.pid.1');
      expect(result.disclosures).toHaveLength(2);
      expect(result.disclosures[0]).toEqual(['given_name', 'John']);
      expect(result.disclosures[1]).toEqual(['family_name', 'Doe']);
    });

    it('should parse SD-JWT without disclosures', () => {
      const mockJwt =
        'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BpZC5zcGFpbi5nb3YiLCJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSJ9.mock-signature';

      const result = client.parseSDJWT(mockJwt);

      expect(result.claims).toHaveProperty('iss', 'https://pid.spain.gov');
      expect(result.disclosures).toHaveLength(0);
    });

    it('should handle invalid SD-JWT format', () => {
      const invalidSdJwt = 'invalid.jwt.format';

      expect(() => client.parseSDJWT(invalidSdJwt)).toThrow(
        'Failed to parse SD-JWT'
      );
    });

    it('should skip invalid disclosures', () => {
      const mockJwt =
        'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BpZC5zcGFpbi5nb3YiLCJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSJ9.mock-signature';
      const validDisclosure = Buffer.from(
        JSON.stringify(['salt1', 'given_name', 'John'])
      )
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const sdJwt = `${mockJwt}~${validDisclosure}~invalid-disclosure~`;

      const result = client.parseSDJWT(sdJwt);

      expect(result.disclosures).toHaveLength(1);
      expect(result.disclosures[0]).toEqual(['given_name', 'John']);
    });

    it('should handle empty disclosure sections', () => {
      const mockJwt =
        'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BpZC5zcGFpbi5nb3YiLCJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSJ9.mock-signature';

      const sdJwt = `${mockJwt}~~~`;

      const result = client.parseSDJWT(sdJwt);

      expect(result.claims).toBeDefined();
      expect(result.disclosures).toHaveLength(0);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete flow with all components', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_METADATA,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_TOKEN_RESPONSE,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_CREDENTIAL,
        });

      const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(
        JSON.stringify(MOCK_CREDENTIAL_OFFER)
      )}`;

      // Issue credential
      const credential = await client.issueCredential(offerUri);

      // Parse the received credential
      const parsed = client.parseSDJWT(credential.credential);

      expect(parsed.claims).toBeDefined();
      expect(credential.format).toBe('vc+sd-jwt');
      expect(credential.c_nonce).toBe('next-nonce-456');
    });
  });
});
