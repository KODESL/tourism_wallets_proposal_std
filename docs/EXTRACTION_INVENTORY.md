# Extraction inventory

StandICT.eu 2029 fellowship **2029-01-1530**  
Project: *Standardizing Non-Custodial Wallet Infrastructure for Tourism*  
This repository is the isolated home for deliverables and the D2.2 open-source reference. It is **not** a dump of the live BOGOWALLET product.

Sources inspected (2026-09-04):

| Tree | Role | Verdict for this repo |
| --- | --- | --- |
| `bogo-ncw` | Live wallets + TSS, used with clients | Interface + recovery concept only |
| `bogo-wallet` | Partial iOS app | Native Keychain pattern notes only |
| `bogo-wallet-android` | Android app | Native EncryptedSharedPreferences pattern notes only |
| `eudi` | EUDI protocol prototype (RN) | Protocol cores + architecture articles |
| `OpenHorizons/final report` | Fellowship packages | D1.1–D2.2 + business plan + reporting fill-pack |

---

## 1. What D2.2 actually needs

From D2.2 §9.2–9.4 the public reference must be vendor-neutral and demonstrate:

1. Issuance + online presentation with selective disclosure (OpenID4VCI 1.0, OpenID4VP 1.0, SD-JWT VC)
2. Offline gate verification, tiers 0–1 (ISO/IEC 18013-5 mdoc)
3. Credential–token binding (ERC-721/6672, CAIP locators)
4. Time/venue validity evaluated offline
5. Recovery without custody
6. EUDI-compatible tourism attestation (ARF v2.4.0 / HAIP)

Roles: `wallet/`, `issuer/`, `verifier/`, `trust-registry/`, `ledger-adapter/`, `conformance/`.  
Licence: MIT or Apache-2.0 (this repo: Apache-2.0).

Out of scope: production KMS, full trust registry, multi-ledger, PMS, payments, tokenomics.

---

## 2. Extracted (in this repo)

### 2.1 Fellowship packages — copy as-is

| File | Path |
| --- | --- |
| D1.1 SoTA & gaps | `docs/fellowship/original/Tourism_Wallets_SoTA_Gaps_D1.1.docx` + markdown |
| D1.2 Requirements (TW-*) | `docs/fellowship/original/Tourism_Wallets_Requirements_D1.2.docx` + markdown |
| D2.1 Draft contributions C1–C6 | `docs/fellowship/original/Tourism_Wallets_Draft_Contributions_D2.1.docx` + markdown |
| D2.2 Interoperability concepts | `docs/fellowship/original/Tourism_Wallets_Interoperability_Concepts_D2.2.docx` + markdown |
| Tourism wallet business plan PDF | `docs/fellowship/original/tourism_wallet_bp.pdf` |
| Final-report fill pack | `docs/fellowship/reporting/` (internal working notes) |

### 2.2 Protocol code — extract and isolate

From `eudi/src` (no Firebase imports in these files):

| Original | Lines | Here | Change |
| --- | --- | --- | --- |
| `issuance/OpenID4VCIClient.ts` | 444 | `packages/wallet/src/issuance/` | Drop RN Metrics; injectable `client_id` |
| `presentation/OpenID4VPClient.ts` | 504 | `packages/wallet/src/presentation/` | Drop RN Metrics |
| `crypto/KeyManager.ts` | 374 | rewritten with `KeyStore` | No Keychain, no `Platform` |
| VCI/VP/KeyManager tests | ~1,557 | adapted | Keychain mocks replaced; issuer host sanitised |
| `CredentialStore` **types** | — | `MemoryCredentialStore` | RN/SQLCipher/MMKV store not copied |

These are the only source files that implement OpenID4VCI, OpenID4VP, or SD-JWT in the four trees.

### 2.3 Architecture writing — copy with provenance

`eudi/docs/article_{1,2,3,4}` markdown, PlantUML, and PNG diagrams → `docs/architecture/eudi-prototype/`.  
See `PROVENANCE.md` (ARF 1.4.0, ICAO/MRZ is prototype context).

### 2.4 TSS — interface only

`bogo-ncw/packages/tss-service/proto/tss.proto` → `specs/tss/tss.proto` (package renamed).  
Recovery flow rewritten without Camino, Firestore, or product URLs → `specs/tss/tss-protocol-flows.md`.

### 2.5 Native patterns — notes only

iOS Keychain (`WhenUnlockedThisDeviceOnly` + biometric ACL) and Android `EncryptedSharedPreferences` / Keystore MasterKey → `docs/architecture/native/secure-storage-patterns.md`.

---

## 3. Not copied (and why)

Copying these would either leak the live product, fail D2.2 vendor-neutrality, or both.

### 3.1 Secrets, identity documents, live config

- `bogo-ncw/config/firestore-key.json`, `b3-prod-key.json`, `*.env`
- `GoogleService-Info*.plist`, `google-services.json` (iOS, Android, eudi)
- `eudi/ios/**/CSCA_*.pem` (passport country-signing CA certificates)
- `eudi` DNIe / MRZ / NFC reader modules (`DnieReader`, `MRZScanner`, `org/jmrtd`)
- `updigital/*.sql`, operator credentials

### 3.2 Live product applications

- `bogo-ncw` frontend, backend, webapp, brand admin, marketplace, Camino minting, HubSpot, Awin, white-label
- `bogo-wallet` SwiftUI app, Web3Auth, Firebase Cloud Functions (`us-central1-aguita-d5cbe`)
- `bogo-wallet-android` Kotlin app, Web3Auth, ERC-20/721 product screens, white-label JSON
- `brand-id-connect` admin
- `eudi` RN shell, screens, Firebase validator hosting, `UnifiedStorage.ts` (hard-coded encryption key)

### 3.3 TSS implementation (not the proto)

- `packages/tss-service` Go server, Binance `tss-lib`, Docker, `tss-server` binaries
- Backend share storage is **custodial-adjacent** if treated as the OSS

### 3.4 Protocol gaps (nothing to extract)

None of the four trees implement:

- OpenID4VP **DCQL**
- ISO/IEC **18013-5 mdoc** device engagement / offline gate
- W3C **Bitstring Status List**
- EUDI **ARF v2.4.0** / **HAIP**
- Credential–token **binding** as specified in D2.1 C2
- OIDF **conformance harness**
- Tourism **test vectors**

`eudi` claims OpenID4VCI/VP 1.0 + SD-JWT + ARF 1.4.0. That is the ceiling of existing code.

### 3.5 Fellowship / personal files kept out of git

- StandICT third-party contracts (unsigned and countersigned)
- CVs and photos
- OpenHorizons commercial application pack (GTM, company overview, gender questionnaire)

Those remain in `OpenHorizons/final report/` locally. They are not this OSS.

---

## 4. How this sets the project in the best position

1. **Evidence pack for the fellowship** is in one cloneable private repo (D1.1–D2.2).
2. **OSS skeleton matches D2.2 §9.2** so the remaining work is fill-in, not archaeology.
3. **Protocol cores that already exist** (VCI, VP, ES256, SD-JWT parse, DID:key) run in Node without RN, Firebase, or Keychain.
4. **Product blast radius is documented** so a later public release does not accidentally include Camino keys, CSCA PEMs, or customer stacks.
5. **Honest gap list** (mdoc, DCQL, status list, binding, ARF 2.4.0) is the Phase-2 implementation backlog, not a surprise at reporting.

## 5. Suggested next implementation order

Matches D2.2 §9.4 roadmap:

1. Issuer + wallet issuance/online presentation (this extract is the holder side)
2. Offline tiers 0–1 (new)
3. Credential–token binding + ledger adapter (new; do not lift Camino product)
4. Tourism vectors + OIDF conformance
5. Second-implementation interop
