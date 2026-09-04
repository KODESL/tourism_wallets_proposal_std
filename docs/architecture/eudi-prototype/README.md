# EUDI Wallet Documentation

> Copied from the EUDI prototype for provenance. Read [`PROVENANCE.md`](PROVENANCE.md) first. This is not the isolated OSS layout; protocol code lives in `packages/wallet`.

Welcome to the comprehensive technical documentation for the Spanish EUDI (European Digital Identity) Wallet implementation.

## About This Documentation

This documentation covers the architecture, implementation, and technical deep-dives of a production-ready EUDI Wallet built with React Native, supporting both iOS and Android platforms.

## Contents

### Articles Series

#### Article 1: Overview
- **Status:** Published ✅
- **Location:** `article_1/`
- Introduction to EUDI Wallets
- Technology stack overview
- Real-world use cases

#### Article 2: Architecture Deep-Dive
- **Status:** Complete ✅
- **Location:** `article_2/`
- 4-layer clean architecture
- Design patterns
- Security architecture
- Cross-platform strategy

#### Article 3: Cryptographic Key Manager
- **Status:** Complete ✅
- **Location:** `article_3/`
- ES256 algorithm selection
- Key generation and storage
- Digital signatures
- DID:key implementation
- Hardware-backed security

#### Article 4: Understanding Decentralized Identifiers (DID:key)
- **Status:** Complete ✅
- **Location:** `article_4/`
- W3C DID Core v1.0 specification
- Self-certifying identifiers
- did:key method deep-dive
- DID methods comparison
- EUDI wallet integration
- 5 visual diagrams included

### Technical Documentation

- **[Performance Metrics](METRICS.md)** - System performance tracking and benchmarks

## Technology Stack

- **React Native 0.73.9** - Cross-platform mobile framework
- **TypeScript 5.3.3** - Type-safe development
- **@noble/curves ^1.3.0** - Cryptographic operations
- **OpenID4VCI/VP** - Standards-compliant credential exchange
- **Native Modules** - Swift (iOS) and Kotlin (Android)

## Standards Compliance

- ✅ OpenID4VCI 1.0
- ✅ OpenID4VP 1.0
- ✅ SD-JWT (Selective Disclosure)
- ✅ ICAO 9303 (Biometric Passports)
- ✅ eIDAS 2.0 ARF 1.4.0

## Architecture Highlights

- **4-Layer Architecture:** Presentation → Business Logic → Data → Native
- **Hardware-Backed Security:** iOS Secure Enclave, Android StrongBox
- **Privacy by Design:** Selective disclosure with 90%+ data reduction
- **Cross-Border Ready:** EU-wide interoperability

## Quick Links

- [GitHub Repository](https://github.com/KODESL/eudi-es)
- [Article Series Plan](/LINKEDIN_ARTICLE_SERIES.md)

## Contributing

This is an open-source implementation of the EUDI Wallet standards. Contributions, feedback, and questions are welcome.

## License

[Your License]

---

*Built with ❤️ for the European Digital Identity ecosystem*
