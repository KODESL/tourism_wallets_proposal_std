# Article 4: Understanding Decentralized Identifiers (DID:key)

## Overview

This directory contains the complete Article 4 from the EUDI Wallet LinkedIn article series.

**Title:** Understanding Decentralized Identifiers (DID:key)  
**Subtitle:** Self-Certifying Identifiers Without Blockchain or Infrastructure Overhead  
**Target Audience:** Identity architects, blockchain developers, EUDI implementers  
**Word Count:** ~1,850 words  
**Document Version:** 1.1  

## Contents

### Main Article
- **ARTICLE_4_DECENTRALIZED_IDENTIFIERS.md** - Complete article with integrated images and code examples

### Diagrams (PNG format, suitable for GitBook/web viewing)

1. **did-key-structure.png** - Encoding flow from P-256 public key to did:key identifier
   - Shows 4-step process: Public Key → Multicodec Prefix → Base58-btc Encoding → DID:key Format
   - Visual representation of encoding pipeline

2. **did-document-structure.png** - W3C DID Document JSON structure
   - Shows verificationMethod, authentication arrays
   - Example JWK (JSON Web Key) format
   - @context declarations

3. **did-methods-comparison.png** - Comparison matrix of DID methods
   - did:key vs did:web vs did:ion
   - Infrastructure requirements, key rotation, resolution time, privacy, and best use cases

4. **did-resolution-flow.png** - Client-side resolution process
   - From DID:key string to DID Document
   - Validation, decoding, verification steps
   - No network calls required

5. **holder-credential-flow.png** - Complete EUDI credential lifecycle
   - Key generation → Credential issuance → Credential presentation
   - Shows interaction between holder (EUDI wallet), issuer, and verifier
   - Key Binding JWT creation and verification

### Source Diagrams (PlantUML format)

Original PlantUML files are in `ldiagrams/` subdirectory:
- 01-did-key-structure.puml
- 02-did-resolution-flow.puml
- 03-did-methods-comparison.puml
- 04-did-document-structure.puml
- 05-holder-credential-flow.puml

## Key Topics Covered

### Foundation
- What are Decentralized Identifiers (DIDs)
- W3C DID Core v1.0 specification
- Traditional vs. decentralized identifiers

### did:key Method
- Self-certifying identifier concept
- Generation process (4 steps)
- Supported key types (Ed25519, X25519, secp256k1, P-256)
- Resolution algorithm (entirely offline)

### Why did:key for EUDI?
- Zero infrastructure requirements
- Offline operation capability
- Privacy preservation
- Instant verification (10-20ms)
- Trade-offs: no key rotation, no revocation

### Comparison with Other Methods
- did:web (HTTPS-hosted)
- did:ion (blockchain-anchored)
- Architectural choice matrix

### Implementation
- TypeScript code examples
  - `generateDIDKey()` - Create did:key from P-256 public key
  - `resolveDIDKey()` - Resolve did:key to DID Document
- Base58-btc encoding/decoding
- Multicodec prefix handling
- JWK conversion

### Security & Integration
- Key compromise mitigation strategies
- Key backup approaches
- EUDI wallet integration patterns
- Credential issuance and presentation flows

### Performance
- Resolution performance: 10-20ms (client-side)
- Storage footprint: ~400 bytes per DID Document
- No network dependencies

## Code Examples

The article includes complete, production-ready TypeScript code:

```typescript
// Generate a did:key from P-256 public key
const didKey = await generateDIDKey(publicKeyJwk);
// Output: did:key:z6MkhaXgBZDvotDkL5257faWLpa6CBu1QoGPAcMULUUi1SLi

// Resolve did:key to DID Document
const document = resolveDIDKey(didKey);
// Returns W3C-compliant DID Document with public key
```

## Standards References

1. [W3C DID Core v1.0](https://www.w3.org/TR/did-core/)
2. [DID Method: key (W3C CCG)](https://w3c-ccg.github.io/did-method-key/)
3. [Multicodec specification](https://github.com/multiformats/multicodec)
4. [Multibase encoding](https://github.com/multiformats/multibase)
5. [RFC 7517: JSON Web Key (JWK)](https://datatracker.ietf.org/doc/html/rfc7517)
6. [eIDAS 2.0 ARF](https://digital-strategy.ec.europa.eu/en/library/european-digital-identity-wallet-architecture-and-reference-framework)

## Integration Notes for GitBook

When publishing to GitBook:

1. **Image paths** - All image references use relative paths: `./ldiagrams/image-name.png`
2. **Markdown compatibility** - Full CommonMark compliance
3. **Code highlighting** - TypeScript code blocks with syntax highlighting
4. **Cross-references** - Links to W3C specifications and standards

## Key Takeaways

1. DIDs don't require blockchain - did:key proves simplicity wins
2. Decentralization ≠ complexity - did:key is simpler than traditional PKI
3. W3C standards enable interoperability - DID Core ensures cross-border compatibility
4. Offline-first design - Client-side resolution enables offline presentations
5. Privacy by architecture - No central registry means no surveillance vector

## Related Articles

- **Article 1:** EUDI Wallet Overview
- **Article 2:** EUDI Wallet Architecture: A Technical Deep-Dive
- **Article 3:** Building a Production-Ready Cryptographic Key Manager
- **Article 5:** OpenID for Verifiable Credential Issuance (OpenID4VCI) Explained

## Version History

- **1.1** (2025-11-05) - Integrated PNG diagrams, refined prose with fact-checking, optimized for GitBook
- **1.0** (2025-11-05) - Initial comprehensive version with PlantUML diagrams

## License

MIT License - See main repository for details

---

**Authors:** Hugo (KODE)  
**Last Updated:** 2025-11-05
