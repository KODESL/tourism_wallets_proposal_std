/**
 * In-memory credential store for the reference wallet.
 *
 * Provenance: types taken from eudi/src/storage/CredentialStore.ts.
 * The prototype store (1,209 lines) is bound to op-sqlite, MMKV,
 * AsyncStorage and Keychain and is not copied here.
 */

export interface StoredCredential {
  id: string;
  type: string;
  format: string;
  credential: string;
  issuer: string;
  issuedAt: number;
  expiresAt?: number;
  keyId: string;
  folderId?: string;
}

export class MemoryCredentialStore {
  private readonly credentials = new Map<string, StoredCredential>();

  async initialize(): Promise<void> {
    return;
  }

  async save(credential: StoredCredential): Promise<void> {
    this.credentials.set(credential.id, { ...credential });
  }

  async get(id: string): Promise<StoredCredential | undefined> {
    const found = this.credentials.get(id);
    return found ? { ...found } : undefined;
  }

  async list(): Promise<StoredCredential[]> {
    return [...this.credentials.values()].map((c) => ({ ...c }));
  }

  async listByType(type: string): Promise<StoredCredential[]> {
    return (await this.list()).filter((c) => c.type === type);
  }

  async delete(id: string): Promise<void> {
    this.credentials.delete(id);
  }

  async sdJwts(): Promise<string[]> {
    return (await this.list()).map((c) => c.credential);
  }
}
