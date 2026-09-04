# Non-custodial tourism wallets — brief for WG/TC

**For:** UNE CTN 71/SC 307 (GT 1 identity, GT 4 assets), onward to CEN/CLC/JTC 19 and ISO/TC 307 (WG 7 / TS 23516, AWI 7603, JWG 4). Parallel interest: W3C VCWG/CCG, ETSI ISG PDL, ETSI TC ESI, OpenID Foundation.

**From:** Hugo Perez · KODE DE HUGO A PEREZ SOLORZANO S.L. (Spain) · hugo@kode.zone · +34 636 349 614  
**Fellowship:** StandICT.eu 2029 Open Call 1 · Application **2029-01-1530** · Contract 01/70  
**Project:** Standardizing Non-Custodial Wallet Infrastructure for Tourism  
**Ask:** Guest slot to present the drafts; national entry so the notes can be circulated. StandICT funding is disclosed.

This brief is two pages. Full drafts: D1.1, D1.2, D2.1 (especially C2 and C6), D2.2 in this folder. Isolated OSS: https://github.com/KODESL/tourism_wallets_proposal_std (private while implementation is incomplete).

---

## Why this group

Tourism is the highest-volume identity interaction in travel (hospitality and aviation, not only borders). Entitlements are time- and venue-bound, often verified **offline**, and frequently exist **both** as a verifiable credential and as a ledger token. No current profile pins those choices. ISO/TS 23516 is the interoperability home; AWI 7603 and JWG 4 cover decentralized identity and privacy; the EUDI Wallet is the European baseline this work aligns with rather than duplicates.

## Priority gaps (D1.1)

| Gap | Problem | Severity |
| --- | --- | --- |
| **G1** | No interoperable **credential–token binding** | High |
| **G2** | Offline gate verification not profiled for entitlements | High |
| **G3** | Time/venue validity not wallet-portable | High |
| **G8** | No tourism **data-minimisation** profile | High |
| **G10** | No tourism attestation profile in the EUDI framework | High |

Fourteen gaps in all (G1–G14). Phase-2 work concentrates on G1, G2, G3, G8, G10.

## Phase-2 requirements (D1.2)

TW-F-03 binding · TW-F-04 time/venue · TW-NF-01 offline tiers 0–1 · TW-SP-01 minimisation · TW-TL-04 EUDI-compatible tourism attestation.

## Six draft contributions (D2.1) — not yet formally submitted

| Ref | Title | Target |
| --- | --- | --- |
| C1 | Tourism entitlements: use cases and requirements | W3C VCWG / CCG |
| **C2** | Interoperability requirements for tourism entitlements | **ISO/TC 307 (TS 23516)** |
| C3 | Credential–token binding (technical note) | W3C CCG; ETSI PDL; ISO 23516 |
| C4 | Offline verification profile | OpenID Foundation; ISO 18013 |
| C5 | Tourism attestation for the EUDI Wallet | eIDAS / ETSI ESI |
| **C6** | Tourism data-minimisation profile | **ISO JWG 4; W3C** |

C2 and C6 are the natural first papers for this committee. All six are vendor-neutral; they do not mandate a ledger or a wallet product.

## Architecture in one paragraph (D2.2)

Nine interoperability dimensions (issuance, presentation, format, semantics, trust, status, binding, portability, cross-border). A **Tourism Interoperability Profile** pins OpenID4VCI 1.0, OpenID4VP 1.0+DCQL, SD-JWT VC plus mdoc offline, Bitstring Status List, HAIP where assurance requires it, CAIP locators for binding. Conformance rides on the OpenID Foundation suite plus a small set of tourism vectors — not a new certification scheme.

## Reference implementation (in progress)

Public, Apache-2.0, isolated from the commercial wallet. Holder OpenID4VCI/VP and ES256 cores are extracted. Issuer, verifier, mdoc, binding and OIDF harness are still stubs. Demonstration target: issuance + selective disclosure; offline tiers 0–1; binding mismatch reject; time/venue offline; recovery without custody; EUDI-compatible tourism attestation.

## What we are asking today

1. Note that this work is StandICT.eu 2029-funded (required disclosure).
2. Accept C2 (and C6 if the privacy GT is present) as discussion drafts.
3. Advise the path onto ISO/TC 307 WG 7 (TS 23516) and JWG 4.
4. A short guest presentation slot (this brief + C2).

No request to chair, ballot, or adopt text in this meeting.
