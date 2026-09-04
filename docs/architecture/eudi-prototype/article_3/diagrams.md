# Cryptographic Key Manager Diagrams

This page contains the PlantUML diagrams for Article 3: Building a Production-Ready Cryptographic Key Manager.

---

## ES256 Algorithm Comparison

![ES256 vs RSA vs EdDSA Comparison](algorithm-comparison.png)

**Algorithm Selection Matrix:**
- RSA-2048: Large keys (256 bytes), slow operations (80-120ms)
- EdDSA (Ed25519): Fast (25-35ms), not NIST approved
- **ES256 (P-256):** Balanced - Fast (35-50ms), NIST approved, OpenID standard

---

## Key Generation Flow

![P-256 Key Generation Process](key-generation-flow.png)

**Key Generation Steps:**
1. Generate 32 bytes of cryptographically secure random entropy
2. Validate entropy is in valid range [1, n-1]
3. Derive public key from private key (deterministic)
4. Convert to uncompressed format (0x04 + x + y coordinates)
5. Format as JWK (RFC 7517) for standard representation
6. Store private key in hardware-backed secure storage
7. Return public key and keyId to application

**Performance:** 25-50ms per device

---

## iOS Keychain Architecture

![iOS Secure Enclave & Keychain Storage](ios-keychain-architecture.png)

**Storage Hierarchy:**
```
Application Layer (React Native)
    ↓ (via react-native-keychain)
iOS Keychain API (Objective-C)
    ├─ kSecClass: Generic Password
    ├─ kSecAttrAccessible: WhenUnlocked
    └─ kSecUseDataProtectionKeychain: YES
    ↓
Data Protection (File Encryption)
    ├─ AES-256-XTS encryption
    └─ Per-file encryption keys
    ↓
Secure Enclave (A7+ Hardware)
    ├─ Hardware security module
    ├─ Private key never leaves enclave
    └─ All operations within HSM
```

**Accessibility Levels:**
- `WHEN_UNLOCKED`: Key accessible only when device unlocked (default for EUDI)
- `AFTER_FIRST_UNLOCK`: Key accessible after first unlock per boot
- `ALWAYS`: Key always accessible (not recommended)

---

## Android KeyStore Architecture

![Android KeyStore & StrongBox Hardware](android-keystore-architecture.png)

**KeyStore Storage Variants:**

```
Android Application (React Native)
    ↓
Android KeyStore API (Java)
    │
    ├─ Software-backed (all devices)
    │  └─ CPU-based encryption (AES-256-GCM)
    │
    └─ Hardware-backed (Android 6+)
       └─ TEE (Trusted Execution Environment)
           │
           └─ StrongBox (Android 9+ on supported devices)
              └─ Dedicated security chip (Titan M)
```

**Hardware Availability:**
- TEE: All Android 6+ devices
- StrongBox: Pixel 3+, Galaxy S10+, Note 10+
- Software fallback: Devices without dedicated security hardware

---

## Signature Generation & Verification Flow

![ECDSA Signature Lifecycle](signature-flow.png)

**Signature Generation (35-50ms):**
1. Retrieve private key from secure storage (10-20ms)
2. Hash payload with SHA-256 (2-5ms)
3. Sign hash with ECDSA P-256 (30-45ms)
4. Convert signature to base64url format (1-2ms)
5. Return 88-character base64url signature

**Signature Verification:**
1. Reconstruct public key from JWK format
2. Hash the payload with SHA-256
3. Convert signature from base64url to bytes
4. Verify signature using public key
5. Return boolean (valid/invalid)

**Signature Format:**
```
Raw: 64 bytes (r: 32 bytes || s: 32 bytes)
Base64url: 88 characters (0-9, a-z, A-Z, -, _)
Used in: JWT format "header.payload.signature"
```

---

## DID:key Encoding/Decoding

![DID:key Generation & Resolution](didkey-encoding.png)

**Encoding Process:**
```
Public Key (65 bytes)
    ↓ 0x04 prefix + 32-byte x + 32-byte y coordinates
Multicodec Prefix (67 bytes)
    ↓ Add 0x1200 (P-256 identifier)
Base58-btc Encoding (85-90 chars)
    ↓ 58-character alphabet
DID:key Format (95-100 chars)
    ↓ "did:key:z" + encoded
did:key:zDnaeUr9eC9Zw8XAMLZvXLb5D8...
```

**Decoding Process:**
```
did:key:zDnae...
    ↓
Extract encoded portion
    ↓
Base58-btc decode
    ↓
Verify multicodec prefix (0x1200)
    ↓
Extract public key (65 bytes)
    ↓
Convert to JWK
    ↓
Generate DID Document
```

**DID Resolver Output:**
```json
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:key:zDnae...",
  "publicKey": [{
    "id": "did:key:zDnae...#key-1",
    "type": "JsonWebKey2020",
    "publicKeyJwk": { kty, crv, x, y }
  }]
}
```

---

## Key Lifecycle State Machine

![Key Lifecycle Management](key-lifecycle.png)

**Key States:**
```
┌─────────────┐
│  Generated  │  ← New device/app install
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  Active (In Use)     │  ← Signing credentials, proof of possession
└──────┬───────────────┘
       │ (Key rotation requested OR device wipe)
       ▼
┌───────────────────────┐
│  Retired (Archived)   │  ← Verification only, no new signatures
└──────┬────────────────┘
       │ (30-day grace period for certificate verification)
       ▼
┌───────────────────────┐
│  Deleted (Erased)     │  ← Securely removed from Keychain/KeyStore
└───────────────────────┘
```

**Transitions:**
- Active → Retired: Manual rotation OR periodic key rollover
- Retired → Deleted: Automatic after 30-day period
- Active → Deleted: Manual key deletion (device wipe)

---

## Performance Comparison

![Key Operations Performance (ms)](performance-benchmarks.png)

**Benchmark Summary (ms):**

| Operation | iPhone 13 | Galaxy S21 | iPad Pro |
|-----------|-----------|-----------|----------|
| Key Generation | 25-30 | 35-45 | 22-28 |
| P-256 Signature | 35-50 | 45-65 | 30-45 |
| Keychain Retrieve | 10-20 | 10-15 | 8-12 |
| Base64url Encode | 1-2 | 1-2 | 1-2 |
| DID:key Generation | 8-15 | 12-20 | 7-12 |

**Scalability:**
```
Single signature: 50ms
10 signatures: 365ms (optimized batch)
100 signatures: 3500ms
1000 signatures: 35+ seconds (batch with progress UI)
```

---

## Security Layers in Key Management

![Defense in Depth for Keys](security-layers.png)

**5-Layer Security Architecture:**

```
Layer 1: Protocol Security
    ├─ PKCE for authorization code flow
    ├─ Proof of Possession JWT
    └─ Replay protection (nonces)

Layer 2: Cryptographic Strength
    ├─ P-256 (128-bit symmetric equivalent)
    ├─ SHA-256 hashing
    └─ ECDSA signature validation

Layer 3: Storage Security
    ├─ Hardware-backed keys (Secure Enclave/StrongBox)
    ├─ AES-256-GCM encryption
    └─ Access control (WHEN_UNLOCKED policy)

Layer 4: Operational Security
    ├─ Key lifecycle management
    ├─ Automatic key rotation
    └─ Secure key deletion

Layer 5: Verification Security
    ├─ Signature verification before storage
    ├─ Key existence validation before use
    └─ Certificate chain verification
```

---

## Library Comparison: @noble/curves vs WebCrypto

![Key Generation Library Trade-offs](library-comparison.png)

**@noble/curves (Pure JavaScript):**
- ✅ Complete control (export to JWK, integrate with Keychain)
- ✅ Cross-platform consistency
- ✅ Audited by Trail of Bits
- ✅ No hardware differences
- ⚠️ Not hardware-accelerated (~25-30ms)

**WebCrypto (Platform Native):**
- ✅ Hardware-accelerated
- ✅ Built-in, no dependencies
- ❌ Can't export non-extractable keys
- ❌ Platform-specific behavior variations
- ❌ Can't integrate with Keychain/KeyStore

**Decision:** @noble/curves for EUDI (complete control > raw speed)

---

[← Back to Article 3](README.md)
