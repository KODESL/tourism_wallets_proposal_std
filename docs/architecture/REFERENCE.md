# Reference architecture (this repository)

This is the architecture of the **isolated** tourism-wallet reference, as specified in D2.2 §5 and §9. It is not the architecture of the live BOGOWALLET product, and it is not the React Native EUDI prototype documented under `eudi-prototype/`.

Normative concepts: [D2.2](../fellowship/markdown/D2.2.md). Profile choices: [tourism-profile.md](../../specs/tourism-profile.md). Status: [STATUS.md](../../STATUS.md).

## Layers (D2.2 §5.1)

```
Identity & trust     DIDs, VCs/attestations, trust registry, status     D5 D6 D9
Exchange             OpenID4VCI, OpenID4VP, mdoc, selective disclosure  D1 D2 D3
Ledger & entitlement Tokens, redemption, credential–token binding       D7
Cross-cutting        Semantics, privacy, portability                    D4 D8
```

## Components in this repo

```
                    ┌──────────── tourism profile + vectors ────────────┐
                    │  specs/tourism-profile.md   vectors/tourism/      │
                    └───────────────────────────────────────────────────┘
  traveller                 operator                    venue
       │                        │                         │
       ▼                        ▼                         ▼
 packages/wallet          packages/issuer           packages/verifier
  OpenID4VCI holder        OpenID4VCI issuer         OpenID4VP / DCQL
  OpenID4VP holder         SD-JWT + mdoc             online + offline
  KeyManager ES256         status list               time/venue eval
  MemoryCredentialStore    optional bind+mint        binding check
       │                        │                         │
       │                        └──────────┬──────────────┘
       │                                   ▼
       │                         packages/trust-registry
       │                         packages/ledger-adapter
       │                                   │
       └──────────── packages/conformance ─┘
                     OIDF suite + tourism vectors
```

Solid today: `packages/wallet` (holder VCI/VP/ES256/SD-JWT). Everything else is a stub.

## Roles (D2.2 §5.2)

| Role | Must implement (profile) | This repo |
| --- | --- | --- |
| Wallet | VCI receipt; VP online; mdoc offline; selective disclosure; status; recovery without custody; hold bindings | VCI + VP (PD) + SD-JWT + ES256. No mdoc, status, recovery runtime, binding |
| Issuer | VCI; SD-JWT and/or mdoc; Bitstring Status List; optional mint+bind; listed in trust registry | Stub |
| Verifier | VP with DCQL; offline cached trust/status; trust-list; optional binding; redemption record | Stub |
| Trust registry | eIDAS-shaped issuer/verifier legitimacy for tests | Stub |

## Flows (D2.2 §7) mapped to packages

| Flow | Happy path | Negative case (when vectors exist) |
| --- | --- | --- |
| 7.1 Issuance | issuer → wallet via OpenID4VCI as `vc+sd-jwt` | Unknown issuer; failed PoP |
| 7.2 Online presentation | verifier → wallet via OpenID4VP; purpose-scoped disclosure | Over-request vs data-minimisation profile (C6) |
| 7.3 Offline presentation | 18013-5 device retrieval; cached trust; tiers 0–1 (C4) | Stale status cache; no proximity |
| 7.4 Binding verification | CAIP-19 locator + mutual digest (C3) | Digest mismatch **must reject** (TW-F-03) |
| 7.5 Cross-border | Same credential, other Member State verifier; coded semantics | Unknown trust-list entry |

## What the EUDI articles are

`docs/architecture/eudi-prototype/` explains how the **extracted holder cores** were built (ES256, DID:key, VCI/VP). They describe a mobile prototype on ARF 1.4.0, including ICAO/MRZ paths that are **out of this reference**. Use them as provenance. Use this file as the target design.

## Out of scope (D2.2 §9.4)

Production KMS, a deployed trust list, multi-ledger support, PMS, payments, tokenomics, and any live-operator backend.
