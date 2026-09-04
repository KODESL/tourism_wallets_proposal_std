import { MemoryCredentialStore } from '../CredentialStore';

describe('MemoryCredentialStore', () => {
  it('saves, lists and deletes credentials', async () => {
    const store = new MemoryCredentialStore();
    await store.initialize();
    await store.save({
      id: 'c1',
      type: 'org.example.tourism.ticket.1',
      format: 'vc+sd-jwt',
      credential: 'header.payload.sig~disclosure~',
      issuer: 'https://issuer.example.tourism',
      issuedAt: Date.now(),
      keyId: 'key-abc',
    });
    expect((await store.list()).map((c) => c.id)).toEqual(['c1']);
    expect(await store.sdJwts()).toHaveLength(1);
    await store.delete('c1');
    expect(await store.list()).toEqual([]);
  });
});
