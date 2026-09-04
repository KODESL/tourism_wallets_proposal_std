/**
 * ES256 (P-256) key manager for the tourism wallet reference.
 *
 * Provenance: eudi/src/crypto/KeyManager.ts
 * Isolation: React Native, Keychain, and telemetry removed. Private keys
 * go through KeyStore so Node tests and future hardware adapters share
 * the same signing/DID:key logic.
 */

import { p256 } from '@noble/curves/p256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import bs58 from 'bs58';
import base64js from 'base64-js';
import { KeyStore, MemoryKeyStore } from './KeyStore';

interface KeyPair {
  publicKeyJwk: JsonWebKey;
  keyId: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const base64 = base64js.fromByteArray(bytes);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return new Uint8Array(base64js.toByteArray(base64));
}

function publicKeyToJwk(publicKey: Uint8Array): JsonWebKey {
  if (publicKey.length !== 65 || publicKey[0] !== 0x04) {
    throw new Error('Invalid uncompressed P-256 public key');
  }
  const x = publicKey.slice(1, 33);
  const y = publicKey.slice(33, 65);
  return {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToBase64Url(x),
    y: bytesToBase64Url(y),
  };
}

export interface KeyMetadata {
  keyId: string;
  label?: string;
  purpose?: 'signing' | 'encryption' | 'authentication';
  createdAt: number;
  expiresAt?: number;
  publicKeyJwk: JsonWebKey;
  did: string;
}

export class KeyManager {
  private metadata: Map<string, Omit<KeyMetadata, 'publicKeyJwk' | 'did'>> =
    new Map();

  constructor(private store: KeyStore = new MemoryKeyStore()) {}

  async generateKeyPair(): Promise<KeyPair> {
    const privateKey = p256.utils.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey, false);
    const publicKeyJwk = publicKeyToJwk(publicKey);
    const publicKeyHex = bytesToHex(publicKey);
    const keyId = `key-${publicKeyHex.substring(0, 8)}`;
    await this.store.set(keyId, bytesToHex(privateKey));
    return { publicKeyJwk, keyId };
  }

  async sign(keyId: string, payload: object): Promise<string> {
    const privateKeyHex = await this.store.get(keyId);
    if (!privateKeyHex) {
      throw new Error(`Key not found: ${keyId}`);
    }
    const privateKey = hexToBytes(privateKeyHex);
    const payloadString = JSON.stringify(payload);
    const hash = sha256(new TextEncoder().encode(payloadString));
    const signature = p256.sign(hash, privateKey);
    return bytesToBase64Url(signature.toCompactRawBytes());
  }

  async getDidKey(keyId: string): Promise<string> {
    const privateKeyHex = await this.requirePrivateKey(keyId);
    const privateKey = hexToBytes(privateKeyHex);
    const publicKey = p256.getPublicKey(privateKey, false);
    const multicodecPrefix = new Uint8Array([0x12, 0x00]);
    const multicodecKey = new Uint8Array([...multicodecPrefix, ...publicKey]);
    return `did:key:z${bs58.encode(multicodecKey)}`;
  }

  async getPublicKeyJwk(keyId: string): Promise<JsonWebKey> {
    const privateKeyHex = await this.requirePrivateKey(keyId);
    const privateKey = hexToBytes(privateKeyHex);
    return publicKeyToJwk(p256.getPublicKey(privateKey, false));
  }

  async deleteKey(keyId: string): Promise<void> {
    await this.store.delete(keyId);
    this.metadata.delete(keyId);
  }

  async listKeys(): Promise<string[]> {
    throw new Error(
      'Key enumeration not implemented. Maintain a separate key index.'
    );
  }

  async verifySignature(
    publicKeyJwk: JsonWebKey,
    payload: object,
    signature: string
  ): Promise<boolean> {
    try {
      const xBytes = base64UrlToBytes(publicKeyJwk.x as string);
      const yBytes = base64UrlToBytes(publicKeyJwk.y as string);
      const publicKeyBytes = new Uint8Array([0x04, ...xBytes, ...yBytes]);
      const payloadString = JSON.stringify(payload);
      const hash = sha256(new TextEncoder().encode(payloadString));
      const signatureBytes = base64UrlToBytes(signature);
      const sig = p256.Signature.fromCompact(signatureBytes);
      return p256.verify(sig as never, hash, publicKeyBytes);
    } catch {
      return false;
    }
  }

  async setKeyMetadata(
    keyId: string,
    metadata: {
      label?: string;
      purpose?: 'signing' | 'encryption' | 'authentication';
      expiresAt?: number;
    }
  ): Promise<void> {
    this.metadata.set(keyId, {
      keyId,
      createdAt: Date.now(),
      ...metadata,
    });
  }

  async getKeyMetadata(keyId: string): Promise<KeyMetadata> {
    const basicMetadata = this.metadata.get(keyId) || {
      keyId,
      createdAt: Date.now(),
    };
    const publicKeyJwk = await this.getPublicKeyJwk(keyId);
    const did = await this.getDidKey(keyId);
    return { ...basicMetadata, publicKeyJwk, did };
  }

  async exportPublicKeyJWK(keyId: string): Promise<JsonWebKey> {
    return this.getPublicKeyJwk(keyId);
  }

  async signBatch(keyId: string, payloads: object[]): Promise<string[]> {
    return Promise.all(payloads.map((payload) => this.sign(keyId, payload)));
  }

  private async requirePrivateKey(keyId: string): Promise<string> {
    const privateKeyHex = await this.store.get(keyId);
    if (!privateKeyHex) {
      throw new Error(`Key not found: ${keyId}`);
    }
    return privateKeyHex;
  }
}
