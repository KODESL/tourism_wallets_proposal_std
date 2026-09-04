# Article 3: Building a Production-Ready Cryptographic Key Manager

**Target Audience:** Security engineers, backend developers
**Length:** ~1,750 words
**Focus:** ES256 implementation, hardware-backed storage, and DID:key generation

---

## Overview

This article provides a comprehensive deep-dive into building a production-grade cryptographic key manager for digital identity systems. It covers the engineering decisions, implementation patterns, and security considerations essential for handling sensitive cryptographic material on mobile devices.

---

## Key Topics

### 1. Algorithm Selection: Why ES256?
- Comparison with RSA and EdDSA
- Performance benchmarks across devices
- Security tradeoffs and regulatory compliance
- NIST standardization requirements

### 2. Key Generation Deep-Dive
- Library choice: @noble/curves vs WebCrypto API
- Cryptographically secure entropy sources
- Key derivation (and why it's NOT used in EUDI)
- Performance optimization strategies

### 3. Secure Storage Implementation

#### iOS Keychain Architecture
- Keychain API integration with react-native-keychain
- Secure Enclave protection on A7+ chips
- Data Protection encryption (AES-256-XTS)
- Accessibility level policies (WHEN_UNLOCKED vs AFTER_FIRST_UNLOCK)

#### Android KeyStore Architecture
- KeyStore API and key generation
- TEE (Trusted Execution Environment) integration
- StrongBox hardware-backed keys
- Biometric authentication gating

### 4. Digital Signatures
- SHA-256 hashing implementation
- ECDSA signature generation and verification
- Signature format (r || s format, 64 bytes raw, 88 chars base64url)
- Performance metrics and batch optimization

### 5. DID:key Implementation
- Decentralized Identifier (DID) standards (W3C)
- Multicodec prefix for P-256 (0x1200)
- Base58-btc encoding/decoding
- DID resolver integration and DID Document generation

---

## Code Examples

The article includes production-ready TypeScript implementations:

- Complete `KeyManager.ts` walkthrough
- P-256 key pair generation with entropy validation
- ES256 signature creation and verification
- DID:key generation and resolution
- Keychain/KeyStore integration patterns
- JWK format conversion and handling

---

## Performance Benchmarks

**Device measurements (average of 100 iterations):**

| Operation | iPhone 13 | Galaxy S21 | iPad Pro |
|-----------|-----------|-----------|----------|
| Key Generation | 25-30ms | 35-45ms | 22-28ms |
| ECDSA Signature | 35-50ms | 45-65ms | 30-45ms |
| Keychain Retrieval | 10-20ms | 10-15ms | 8-12ms |
| DID:key Generation | 8-15ms | 12-20ms | 7-12ms |

**Batch Operations:**
- Single signature: 35-50ms
- 10 signatures (optimized): 365ms
- 100 signatures: 3500ms

---

## Security Architecture

### 5-Layer Defense in Depth

1. **Protocol Security:** PKCE, Proof of Possession, nonces
2. **Cryptographic Strength:** P-256 (128-bit equivalent), SHA-256, ECDSA
3. **Storage Encryption:** Hardware-backed keys, AES-256-GCM
4. **Operational Security:** Key lifecycle management, automatic rotation
5. **Verification Security:** Signature validation, certificate verification

### Threat Model Coverage

✓ Credential theft → Hardware-backed keys
✓ Man-in-the-middle → HTTPS + pinning
✓ Replay attacks → Nonces + KB-JWT
✓ SQL injection → Parameterized queries
✓ Code interception → PKCE

---

## Technical Specifications

### Cryptographic Parameters

| Parameter | Value | Standard |
|-----------|-------|----------|
| **Elliptic Curve** | P-256 (secp256r1) | NIST FIPS 186-4 |
| **Algorithm** | ECDSA (ES256) | RFC 7518 (JWA) |
| **Hashing** | SHA-256 | FIPS 180-4 |
| **Key Size** | 256 bits | NIST approved |
| **Key Format** | Uncompressed (65 bytes) | RFC 7517 (JWK) |

### Storage Implementation

**iOS (Keychain + Secure Enclave):**
- API: `kSecAttrAccessibleWhenUnlocked`
- Encryption: AES-256-GCM
- Hardware backing: A7+ chips
- Status: Production ready

**Android (KeyStore + StrongBox):**
- API: `KeyGenParameterSpec`
- Encryption: AES-256-GCM
- Hardware backing: Pixel 3+, Galaxy S10+
- Fallback: TEE (all Android 6+)

---

## Lessons Learned

### Key Insights from Production Implementation

1. **Library Selection Matters:** Complete control (via @noble/curves) outweighs raw performance for key management

2. **Hardware-Backing is Non-Negotiable:** Private keys must never exist in application memory

3. **Performance is Acceptable:** 25-50ms per operation is imperceptible to users, well within UX requirements

4. **Cross-Platform Consistency:** Same cryptographic behavior on iOS and Android is essential for compliance

5. **Key Lifecycle Planning:** Rotation, retirement, and deletion must be designed upfront, not bolted on

---

## References & Standards

### W3C & IETF Standards
- [DID Core 1.0](https://www.w3.org/TR/did-core/)
- [DID Method: key](https://w3c-ccg.github.io/did-method-key/)
- [RFC 7517: JSON Web Key (JWK)](https://datatracker.ietf.org/doc/html/rfc7517)
- [RFC 7518: JSON Web Algorithms (JWA)](https://datatracker.ietf.org/doc/html/rfc7518)

### NIST & Government Standards
- [NIST SP 800-186: Discrete Logarithm-based Cryptography](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf)
- [eIDAS 2.0 Regulation (EU) 2024/1183](https://eur-lex.europa.eu/eli/reg/2024/1183/oj)

### OpenID & Protocol Standards
- [OpenID for Verifiable Credential Issuance 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)
- [OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)

### Implementation References
- [@noble/curves GitHub](https://github.com/paulmillr/noble-curves)
- [iOS Keychain Services Documentation](https://developer.apple.com/documentation/security/keychain_services)
- [Android KeyStore System](https://developer.android.com/training/articles/keystore)

---

## Related Topics

- **Article 2:** [EUDI Wallet Architecture Deep-Dive](../article_2/ARTICLE_2_ARCHITECTURE.md)
- **Diagrams:** [Cryptographic Key Manager Architecture Diagrams](diagrams.md)

---

## Next Steps

**Article 4 (Coming Soon):** "Selective Disclosure & Privacy-Preserving Presentation"
- Deep-dive into SD-JWT disclosure filtering
- JSONPath constraint evaluation
- Zero-knowledge proof techniques
- Minimum data exposure patterns

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-23
**Authors:** Hugo (KODE)
**License:** MIT
