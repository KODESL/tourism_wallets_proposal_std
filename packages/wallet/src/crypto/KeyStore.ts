/**
 * Pluggable private-key storage.
 *
 * Extracted from the EUDI prototype KeyManager, which was bound to
 * react-native-keychain. The reference implementation uses MemoryKeyStore
 * so protocol tests run in Node. Device wallets should supply a Keychain /
 * Android Keystore adapter; see docs/architecture/native/.
 */

export interface KeyStore {
  set(keyId: string, privateKeyHex: string): Promise<void>;
  get(keyId: string): Promise<string | null>;
  delete(keyId: string): Promise<void>;
}

export class MemoryKeyStore implements KeyStore {
  private readonly keys = new Map<string, string>();

  async set(keyId: string, privateKeyHex: string): Promise<void> {
    this.keys.set(keyId, privateKeyHex);
  }

  async get(keyId: string): Promise<string | null> {
    return this.keys.get(keyId) ?? null;
  }

  async delete(keyId: string): Promise<void> {
    this.keys.delete(keyId);
  }
}
