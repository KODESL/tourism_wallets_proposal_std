import { OpenID4VPClient } from '../OpenID4VPClient';
import { KeyManager } from '../../crypto/KeyManager';

// Mock fetch globally
global.fetch = jest.fn();

// Mock KeyManager
jest.mock('../../crypto/KeyManager');

describe('OpenID4VPClient', () => {
  let client: OpenID4VPClient;
  let mockKeyManager: jest.Mocked<KeyManager>;

  const MOCK_PRESENTATION_REQUEST = {
    response_uri: 'https://bank.example/verify',
    nonce: 'n-0S6_WzA2Mj',
    client_id: 'bank-client-123',
    presentation_definition: {
      id: 'kyc-check',
      input_descriptors: [
        {
          id: 'pid',
          format: { 'vc+sd-jwt': {} },
          constraints: {
            fields: [
              { path: ['$.vct'], filter: { const: 'eu.europa.ec.eudi.pid.1' } },
              { path: ['$.family_name'] },
              { path: ['$.given_name'] },
              { path: ['$.birth_date'] },
            ],
          },
        },
      ],
    },
    client_metadata: {
      client_name: 'Banco Example',
      logo_uri: 'https://bank.example/logo.png',
    },
  };

  const MOCK_CREDENTIAL =
    'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3BpZC5zcGFpbi5nb3YiLCJ2Y3QiOiJldS5ldXJvcGEuZWMuZXVkaS5waWQuMSIsInN1YiI6IjEyMzQ1Njc4OSJ9.mock-signature~WyJzYWx0MSIsImdpdmVuX25hbWUiLCJKb2huIl0~WyJzYWx0MiIsImZhbWlseV9uYW1lIiwiRG9lIl0~WyJzYWx0MyIsImJpcnRoX2RhdGUiLCIxOTkwLTAxLTAxIl0~';

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

    client = new OpenID4VPClient(mockKeyManager);
  });

  describe('parsePresentationRequest', () => {
    it('should parse request from request_uri', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => MOCK_PRESENTATION_REQUEST,
      });

      const uri = 'openid4vp://authorize?request_uri=https://bank.example/request/123';
      const result = await client.parsePresentationRequest(uri);

      expect(result).toEqual(MOCK_PRESENTATION_REQUEST);
      expect(global.fetch).toHaveBeenCalledWith('https://bank.example/request/123');
    });

    it('should parse JWT-secured request object', async () => {
      const mockJwt =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJyZXNwb25zZV91cmkiOiJodHRwczovL2JhbmsuZXhhbXBsZS92ZXJpZnkiLCJub25jZSI6Im4tMFM2X1d6QTJNaiIsImNsaWVudF9pZCI6ImJhbmstY2xpZW50LTEyMyIsInByZXNlbnRhdGlvbl9kZWZpbml0aW9uIjp7ImlkIjoia3ljLWNoZWNrIiwiaW5wdXRfZGVzY3JpcHRvcnMiOlt7ImlkIjoicGlkIiwiZm9ybWF0Ijp7InZjK3NkLWp3dCI6e319LCJjb25zdHJhaW50cyI6eyJmaWVsZHMiOlt7InBhdGgiOlsiJC52Y3QiXSwiZmlsdGVyIjp7ImNvbnN0IjoiZXUuZXVyb3BhLmVjLmV1ZGkucGlkLjEifX0seyJwYXRoIjpbIiQuZmFtaWx5X25hbWUiXX0seyJwYXRoIjpbIiQuZ2l2ZW5fbmFtZSJdfSx7InBhdGgiOlsiJC5iaXJ0aF9kYXRlIl19XX19XX0sImNsaWVudF9tZXRhZGF0YSI6eyJjbGllbnRfbmFtZSI6IkJhbmNvIEV4YW1wbGUiLCJsb2dvX3VyaSI6Imh0dHBzOi8vYmFuay5leGFtcGxlL2xvZ28ucG5nIn19.mock-signature';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/jwt',
        },
        text: async () => mockJwt,
      });

      const uri = 'openid4vp://authorize?request_uri=https://bank.example/request/123';
      const result = await client.parsePresentationRequest(uri);

      expect(result).toHaveProperty('response_uri');
      expect(result).toHaveProperty('presentation_definition');
    });

    it('should parse embedded request parameter', async () => {
      const requestParam = encodeURIComponent(JSON.stringify(MOCK_PRESENTATION_REQUEST));
      const uri = `openid4vp://authorize?request=${requestParam}`;

      const result = await client.parsePresentationRequest(uri);

      expect(result).toEqual(MOCK_PRESENTATION_REQUEST);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw error if request_uri fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const uri = 'openid4vp://authorize?request_uri=https://bank.example/request/123';

      await expect(client.parsePresentationRequest(uri)).rejects.toThrow(
        'Failed to fetch request object'
      );
    });

    it('should throw error if missing request_uri and request', async () => {
      const uri = 'openid4vp://authorize?other_param=value';

      await expect(client.parsePresentationRequest(uri)).rejects.toThrow(
        'Missing request_uri or request parameter'
      );
    });
  });

  describe('selectCredentials', () => {
    it('should select matching credential', () => {
      const credentials = [MOCK_CREDENTIAL];
      const result = client.selectCredentials(
        credentials,
        MOCK_PRESENTATION_REQUEST.presentation_definition
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(MOCK_CREDENTIAL);
    });

    it('should filter out non-matching credentials', () => {
      const nonMatchingCredential =
        'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL290aGVyLmlzc3VlciIsInZjdCI6Im90aGVyLnR5cGUiLCJzdWIiOiI5ODc2NTQzMjEifQ.mock-signature~';

      const credentials = [MOCK_CREDENTIAL, nonMatchingCredential];
      const result = client.selectCredentials(
        credentials,
        MOCK_PRESENTATION_REQUEST.presentation_definition
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(MOCK_CREDENTIAL);
    });

    it('should return empty array if no credentials match', () => {
      const nonMatchingCredential =
        'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL290aGVyLmlzc3VlciIsInZjdCI6Im90aGVyLnR5cGUiLCJzdWIiOiI5ODc2NTQzMjEifQ.mock-signature~';

      const credentials = [nonMatchingCredential];
      const result = client.selectCredentials(
        credentials,
        MOCK_PRESENTATION_REQUEST.presentation_definition
      );

      expect(result).toHaveLength(0);
    });

    it('should handle invalid credentials gracefully', () => {
      const invalidCredential = 'invalid-credential-format';

      const credentials = [MOCK_CREDENTIAL, invalidCredential];
      const result = client.selectCredentials(
        credentials,
        MOCK_PRESENTATION_REQUEST.presentation_definition
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(MOCK_CREDENTIAL);
    });

    it('should match credentials with enum filter', () => {
      const customRequest = {
        ...MOCK_PRESENTATION_REQUEST,
        presentation_definition: {
          ...MOCK_PRESENTATION_REQUEST.presentation_definition,
          input_descriptors: [
            {
              ...MOCK_PRESENTATION_REQUEST.presentation_definition.input_descriptors[0],
              constraints: {
                fields: [
                  {
                    path: ['$.vct'],
                    filter: {
                      enum: ['eu.europa.ec.eudi.pid.1', 'other.type'],
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const credentials = [MOCK_CREDENTIAL];
      const result = client.selectCredentials(credentials, customRequest.presentation_definition);

      expect(result).toHaveLength(1);
    });
  });

  describe('createVPToken', () => {
    it('should create VP token with key binding', async () => {
      const credentials = [MOCK_CREDENTIAL];
      const result = await client.createVPToken(credentials, MOCK_PRESENTATION_REQUEST);

      expect(result).toHaveLength(1);
      expect(mockKeyManager.generateKeyPair).toHaveBeenCalled();
      expect(mockKeyManager.sign).toHaveBeenCalled();

      // VP token should have KB-JWT appended
      const parts = result[0].split('~');
      expect(parts.length).toBeGreaterThan(1);
    });

    it('should include only requested disclosures', async () => {
      const credentials = [MOCK_CREDENTIAL];
      const result = await client.createVPToken(credentials, MOCK_PRESENTATION_REQUEST);

      // Check that the VP token has disclosures
      const parts = result[0].split('~');
      expect(parts.length).toBeGreaterThan(2); // JWT + disclosures + KB-JWT
    });

    it('should generate valid key binding JWT', async () => {
      const credentials = [MOCK_CREDENTIAL];
      const result = await client.createVPToken(credentials, MOCK_PRESENTATION_REQUEST);

      // Verify sign was called with appropriate payload
      expect(mockKeyManager.sign).toHaveBeenCalledWith(
        'mock-key-123',
        expect.objectContaining({
          payload: expect.objectContaining({
            aud: 'bank-client-123',
            nonce: 'n-0S6_WzA2Mj',
            iat: expect.any(Number),
            sd_hash: expect.any(String),
          }),
        })
      );
    });

    it('should handle multiple credentials', async () => {
      const credentials = [MOCK_CREDENTIAL, MOCK_CREDENTIAL];
      const result = await client.createVPToken(credentials, MOCK_PRESENTATION_REQUEST);

      expect(result).toHaveLength(2);
      expect(mockKeyManager.generateKeyPair).toHaveBeenCalledTimes(2);
    });
  });

  describe('submitPresentation', () => {
    it('should submit presentation to verifier', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const vpToken = ['mock-vp-token-1'];
      await client.submitPresentation(vpToken, MOCK_PRESENTATION_REQUEST);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://bank.example/verify',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toHaveProperty('vp_token');
      expect(callBody).toHaveProperty('presentation_submission');
      expect(callBody.presentation_submission).toHaveProperty('id');
      expect(callBody.presentation_submission).toHaveProperty('definition_id', 'kyc-check');
      expect(callBody.presentation_submission).toHaveProperty('descriptor_map');
    });

    it('should create valid presentation submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const vpToken = ['mock-vp-token-1', 'mock-vp-token-2'];
      await client.submitPresentation(vpToken, MOCK_PRESENTATION_REQUEST);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.presentation_submission.descriptor_map).toHaveLength(1);
      expect(callBody.presentation_submission.descriptor_map[0]).toMatchObject({
        id: 'pid',
        format: 'vc+sd-jwt',
        path: '$[0]',
      });
    });

    it('should throw error if submission fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const vpToken = ['mock-vp-token-1'];

      await expect(
        client.submitPresentation(vpToken, MOCK_PRESENTATION_REQUEST)
      ).rejects.toThrow('Presentation submission failed');
    });
  });

  describe('Integration test', () => {
    it('should complete full presentation flow', async () => {
      // Mock presentation request fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => MOCK_PRESENTATION_REQUEST,
      });

      // Parse request
      const uri = 'openid4vp://authorize?request_uri=https://bank.example/request/123';
      const request = await client.parsePresentationRequest(uri);

      // Select credentials
      const credentials = [MOCK_CREDENTIAL];
      const selectedCredentials = client.selectCredentials(
        credentials,
        request.presentation_definition
      );

      expect(selectedCredentials).toHaveLength(1);

      // Create VP token
      const vpToken = await client.createVPToken(selectedCredentials, request);

      expect(vpToken).toHaveLength(1);

      // Submit presentation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await client.submitPresentation(vpToken, request);

      expect(global.fetch).toHaveBeenCalledTimes(2); // Request fetch + submission
    });
  });
});
