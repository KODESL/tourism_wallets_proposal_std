# Tourism Interoperability Profile (working draft)

**Status:** Working draft extracted from D2.2 §6 for incubation. Not submitted to an SDO.  
**Fellowship:** 2029-01-1530 · KODE DE HUGO A PEREZ SOLORZANO S.L.  
**Companion:** D1.2 (TW-\*), D2.1 (C1–C6), D2.2 (dimensions D1–D9).  
**Precedent:** OpenID High Assurance Interoperability Profile (HAIP) 1.0 — a named, testable set of choices. This is a **sector profile** of the same kind, compatible with the EUDI ARF and, where assurance requires it, building on HAIP.

A profile removes optionality so independently built wallets, issuers and verifiers interoperate. The EUDI/OpenID baseline leaves tourism-specific choices open: entitlement representation, validity and scope, offline tiers, data-minimisation sets, and credential–token binding.

## 1. Profile choices (D2.2 §6.2)

| Aspect | Tourism profile choice (proposed) |
| --- | --- |
| Issuance | OpenID4VCI 1.0 |
| Presentation (online) | OpenID4VP 1.0 with **DCQL** |
| Presentation (offline) | ISO/IEC 18013-5 device retrieval |
| Formats | SD-JWT VC (primary); ISO mdoc (offline / higher assurance); W3C VC 2.0 for linked-data contexts |
| High-assurance base | HAIP 1.0 where assurance requires it |
| Selective disclosure | Mandatory; purpose sets per D2.1 C6 |
| Status | W3C Bitstring Status List; cached per D2.1 C4 |
| Validity and scope | Machine-evaluable time/venue constraints (TW-F-04) |
| Credential–token binding | D2.1 C3; CAIP locators; ERC-721/6672 on the token side |
| Trust | eIDAS trust lists plus a sector registry for operators and venues |

## 2. Conformance classes (D2.2 §6.3)

Conformance is **per role and per capability**. A party declares which dimensions (D1–D9) and which optional capabilities (offline tier, binding) it supports, and shows them:

- OpenID Foundation suite for D1–D3 (VCI, VP, HAIP; SD-JWT VC and mdoc)
- Tourism vectors in `vectors/tourism/` for D4 (semantics), D6 (status/offline), D7 (binding)

No parallel certification scheme.

| Class | Roles | Capabilities |
| --- | --- | --- |
| TIP-online | wallet, issuer, verifier | VCI + VP + SD-JWT VC + selective disclosure |
| TIP-offline | wallet, verifier | TIP-online + mdoc device retrieval + status cache tiers 0–1 |
| TIP-binding | issuer, verifier (wallet holds the locator) | TIP-online + C3 mutual digest + CAIP-19 |
| TIP-eudi | wallet, issuer, verifier | TIP-online + EUDI-compatible tourism attestation (C5) |

This repository currently exercises **none** of these classes end to end. Holder fragments of TIP-online exist in `packages/wallet`. See [STATUS.md](../STATUS.md).

## 3. Entitlement types (from D2.1 C1 / D1.2 use cases)

Stable identifiers are still to be registered. Working names only:

| Working `vct` | Use case | Notes |
| --- | --- | --- |
| `org.example.tourism.pass.multientry.1` | UC-A city attractions pass | Time/venue; group holding later |
| `org.example.tourism.transport.crossborder.1` | UC-B multi-operator transport | Coded semantics; offline |
| `org.example.tourism.stay.checkin.1` | UC-C hotel check-in | Minimal disclosure (C6) |
| `org.example.tourism.entitlement.tokenbound.1` | UC-D token-backed entitlement | Binding (C3) required |

Do not use product or Member-State PID types as the tourism `vct`. EUDI PID remains a separate identity credential.

## 4. Claims every tourism entitlement carries

Minimum, machine-evaluable (TW-F-04):

- `vct` — entitlement type
- `iss` — issuer
- `iat` / `exp` or an explicit validity window
- `scope` — coded venue or zone, language-independent
- `status` — Bitstring Status List reference
- optional `cnf` — holder key binding
- optional `binding` — CAIP-19 locator + token descriptor digest (C3)

Verifiers **MUST** accept or reject from these claims without a product-specific parser.

## 5. Offline tiers (D2.1 C4, TW-NF-01)

To be profiled in the C4 note; recorded here so implementers do not invent a fourth scheme:

| Tier | Connectivity | Status | Binding |
| --- | --- | --- | --- |
| 0 | None | Cached list; reject if cache missing or stale beyond declared freshness | Credential commits to token; reconcile later |
| 1 | None at gate; recent cache refresh | Cached list within freshness | Same |
| 2+ | Online | Live status | Live token resolve |

Tiers 0 and 1 are in D2.2 scope. Live product “offline because the app cached a QR” is not a tier.

## 6. Data minimisation (D2.1 C6, TW-SP-01)

Purpose → allowed attributes. Illustrative:

| Purpose | Allowed |
| --- | --- |
| `venue-entry` | entitlement type; `valid_now` predicate; `venue_in_scope` predicate |
| `hotel-checkin` | entitlement type; booking window; given name **or** holder confirmation — not full PID |
| `inspection` | entitlement type; validity; issuer; status |

A wallet **SHOULD** warn if a request exceeds the purpose set.

## 7. Binding (D2.1 C3, TW-F-03)

Where both a credential and a ledger token exist:

1. Credential contains the token locator (CAIP-19) and a digest of the token descriptor.
2. Token (or its metadata) contains the credential digest.
3. Online: verifier checks mutual digests and issuer authority over both.
4. Offline: verifier relies on the credential commitment; reconciles the token later.
5. **Mismatch → reject.**

No mandated chain. One adapter in this repo (EVM example).

## 8. What this profile is not

Not a new TC. Not a product. Not HAIP. Not an EUDI PID profile. Incubate across W3C (credential), OpenID Foundation (protocol, beside HAIP), and ETSI/ISO (trust and interoperability), coordinated through liaison — D2.2 §10.
