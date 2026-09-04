# Provenance of the architecture articles

Copied from the EUDI wallet prototype documentation (`eudi/docs/`, also described at https://github.com/KODESL/eudi-es).

These articles document a **React Native prototype** that implemented OpenID4VCI 1.0, OpenID4VP 1.0, SD-JWT, DID:key, and ES256 via `@noble/curves`. They are the best written explanation of the protocol cores extracted into `packages/wallet`.

## Read with these caveats

- Prototype targeted **eIDAS 2.0 ARF 1.4.0**, not ARF v2.4.0 / HAIP as required by D2.2.
- Articles mention ICAO 9303, MRZ, DNIe and Spanish-authority UX. That identity-document capture stack is **product/prototype** and was not copied into `packages/`.
- Diagrams that show React Native, Firebase, or native NFC modules describe the prototype, not the isolated OSS layout in this repo.
- Licence on the source README was a placeholder (“Your License”). Material in this repo is Apache-2.0.

## What to reuse

- Article 2: 4-layer split (presentation / business logic / data / native) and the VCI/VP/KeyManager/CredentialStore responsibilities.
- Article 3: why ES256/P-256, DID:key, and `@noble/curves`.
- Article 4: DID:key encoding used by `KeyManager.getDidKey`.
