import { KeyManager } from '../KeyManager';
import { MemoryKeyStore } from '../KeyStore';

describe('KeyManager', () => {
  let keyManager: KeyManager;
  let store: MemoryKeyStore;

  beforeEach(() => {
    store = new MemoryKeyStore();
    keyManager = new KeyManager(store);
  });

  describe('generateKeyPair', () => {
    it('should generate a valid ES256 key pair', async () => {
      const result = await keyManager.generateKeyPair();
      expect(result).toHaveProperty('publicKeyJwk');
      expect(result).toHaveProperty('keyId');
      expect(result.keyId).toMatch(/^key-[0-9a-f]{8}$/);
    });

    it('should generate public key JWK with correct structure', async () => {
      const result = await keyManager.generateKeyPair();
      expect(result.publicKeyJwk).toMatchObject({
        kty: 'EC',
        crv: 'P-256',
        x: expect.any(String),
        y: expect.any(String),
      });
      expect(result.publicKeyJwk.x).not.toMatch(/[+/=]/);
      expect(result.publicKeyJwk.y).not.toMatch(/[+/=]/);
    });

    it('should store the private key in the KeyStore', async () => {
      const result = await keyManager.generateKeyPair();
      const stored = await store.get(result.keyId);
      expect(stored).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate different key pairs on subsequent calls', async () => {
      const result1 = await keyManager.generateKeyPair();
      const result2 = await keyManager.generateKeyPair();
      expect(result1.keyId).not.toBe(result2.keyId);
      expect(result1.publicKeyJwk.x).not.toBe(result2.publicKeyJwk.x);
    });
  });

  describe('sign and verify', () => {
    it('should sign and verify a payload', async () => {
      const { keyId, publicKeyJwk } = await keyManager.generateKeyPair();
      const payload = { aud: 'verifier.example', nonce: 'n1' };
      const signature = await keyManager.sign(keyId, payload);
      expect(signature).toMatch(/^[A-Za-z0-9_-]+$/);
      await expect(
        keyManager.verifySignature(publicKeyJwk, payload, signature)
      ).resolves.toBe(true);
    });

    it('should reject a tampered payload', async () => {
      const { keyId, publicKeyJwk } = await keyManager.generateKeyPair();
      const signature = await keyManager.sign(keyId, { n: 1 });
      await expect(
        keyManager.verifySignature(publicKeyJwk, { n: 2 }, signature)
      ).resolves.toBe(false);
    });

    it('should throw when signing with an unknown key', async () => {
      await expect(keyManager.sign('key-deadbeef', { n: 1 })).rejects.toThrow(
        'Key not found'
      );
    });
  });

  describe('did:key', () => {
    it('should return a did:key:z identifier', async () => {
      const { keyId } = await keyManager.generateKeyPair();
      const did = await keyManager.getDidKey(keyId);
      expect(did).toMatch(/^did:key:z[1-9A-HJ-NP-Za-km-z]+$/);
    });
  });

  describe('deleteKey', () => {
    it('should remove the key from the store', async () => {
      const { keyId } = await keyManager.generateKeyPair();
      await keyManager.deleteKey(keyId);
      expect(await store.get(keyId)).toBeNull();
    });
  });
});
