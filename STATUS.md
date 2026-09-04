# Implementation status

Fellowship **2029-01-1530**. This file is the honest map of D2.2 §9.3 demos versus what is in this repository. It is not a claim that the open-source reference is finished.

Last updated: 2026-09-04.

## D2.2 demonstrations

| Demo (D2.2 §9.3) | Requirement | Code status | Where |
| --- | --- | --- | --- |
| Issuance + online presentation with selective disclosure | TW-F-07, TW-SP-01; D1–D3 | **Partial.** Holder OpenID4VCI 1.0 and OpenID4VP 1.0 (presentation definition, not DCQL) + SD-JWT parse. No issuer, no verifier. | `packages/wallet` |
| Offline gate verification, tiers 0–1 | TW-NF-01, TW-SP-04; D2, D6 | **Missing.** No ISO/IEC 18013-5 mdoc, no cached status. | — |
| Credential–token binding issuance and verification | TW-F-03; D7 | **Missing.** Ledger adapter is a stub. Do not lift Camino product code. | `packages/ledger-adapter` |
| Time- and venue-bound validity evaluated offline | TW-F-04 | **Missing.** Claim schema not encoded; no verifier to evaluate it. | — |
| Recovery after device loss without custody | TW-TL-02; D8 | **Interface only.** `specs/tss/tss.proto` + flow note. No test double. | `specs/tss` |
| EUDI-compatible tourism attestation | TW-TL-04; D9 | **Partial protocol, wrong ARF.** Holder VCI/VP exist. Prototype targeted ARF 1.4.0, not ARF v2.4.0 / HAIP. No tourism `vct`. | `packages/wallet`; `specs/tourism-profile.md` |

## Roles (D2.2 §9.2)

| Package | Role | Status |
| --- | --- | --- |
| `packages/wallet` | Holder | Isolated extract; Node tests pass (43) |
| `packages/issuer` | Issuer | Stub README |
| `packages/verifier` | Verifier | Stub README |
| `packages/trust-registry` | Trust registry | Stub README |
| `packages/ledger-adapter` | Optional EVM adapter | Stub README |
| `packages/conformance` | OIDF + tourism vectors | Stub README |
| `vectors/tourism` | Profile test vectors | Empty |

## Protocol coverage

| Spec | In this repo | Notes |
| --- | --- | --- |
| OpenID4VCI 1.0 | Holder client | Authorization code + PKCE + SD-JWT |
| OpenID4VP 1.0 | Holder client | Presentation definition; **not DCQL** |
| SD-JWT VC | Parse + selective disclosure on holder | No issuer signing of real VCs |
| ISO/IEC 18013-5 mdoc | No | Required for offline |
| OpenID4VP DCQL | No | Required by the tourism profile |
| W3C Bitstring Status List | No | |
| HAIP 1.0 / EUDI ARF v2.4.0 | No | Extracted docs describe ARF 1.4.0 |
| OIDF conformance suite | No | |

## Roadmap (unchanged from D2.2 §9.4)

1. Issuer + online presentation (complete the holder extract)
2. Offline tiers 0–1
3. Credential–token binding
4. Tourism vectors + OIDF conformance run
5. Interop with a second independent implementation

Until stage 1 has an issuer, do not describe this repository as a working reference implementation in SDO or Trust-Grants text. Say: *isolated holder cores extracted; remaining roles stubbed; implementation in progress.*
