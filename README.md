# Tourism wallets — isolated standards reference

StandICT.eu 2029 fellowship **2029-01-1530**  
**Standardizing Non-Custodial Wallet Infrastructure for Tourism**

This repository is the isolated home for:

1. Fellowship deliverables D1.1, D1.2, D2.1, D2.2
2. The D2.2 open-source reference skeleton (wallet / issuer / verifier / trust-registry / ledger-adapter / conformance)
3. Protocol cores extracted from the EUDI prototype, stripped of product coupling

It is **not** the live BOGOWALLET stack (`bogo-ncw`, iOS, Android). Those remain private product repositories.

Licence: [Apache-2.0](LICENSE).

## Start here

| Document | What it is |
| --- | --- |
| [STATUS.md](STATUS.md) | What is implemented vs stub vs missing (read before citing the OSS) |
| [docs/architecture/REFERENCE.md](docs/architecture/REFERENCE.md) | Architecture of **this** repo (not the EUDI mobile prototype) |
| [specs/tourism-profile.md](specs/tourism-profile.md) | Tourism Interoperability Profile working draft (D2.2 §6) |
| [SECURITY.md](SECURITY.md) | Isolation rules: what must never land in this git tree |
| [docs/fellowship/WG_BRIEF.md](docs/fellowship/WG_BRIEF.md) | Two-page brief for UNE CTN 71/SC 307 / ISO/TC 307 |

## Layout

```
docs/fellowship/          D1.1–D2.2 (DOCX + markdown) and reporting notes
docs/architecture/        EUDI prototype articles (provenance) + native storage notes
docs/EXTRACTION_INVENTORY.md
packages/wallet/          Isolated OpenID4VCI / OpenID4VP / ES256 / SD-JWT holder
packages/issuer/          Stub (D2.2 §9.2)
packages/verifier/        Stub
packages/trust-registry/  Stub
packages/ledger-adapter/  Stub
packages/conformance/     Stub
specs/tss/                2-of-3 interface + recovery-without-custody note
vectors/tourism/          Placeholder for profile test vectors
```

## What was reused

Full decision record: [`docs/EXTRACTION_INVENTORY.md`](docs/EXTRACTION_INVENTORY.md).

| Keep | Drop |
| --- | --- |
| OpenID4VCI/VP clients, SD-JWT parse, ES256 KeyManager, DID:key | Firebase, Web3Auth, Camino keys, brand admin, marketplace |
| EUDI architecture articles (ARF 1.4.0 context) | Passport CSCA PEMs, DNIe, MRZ, NFC |
| TSS `tss.proto` as an interface | Go TSS server and operator-held shares |
| iOS/Android secure-storage *patterns* | Native product apps |
| Fellowship D1.1–D2.2 | Contracts, CVs, photos |

## Run tests

```bash
cd packages/wallet
npm install
npm test
```

## Roadmap (D2.2 §9.4)

Tracked with evidence in [STATUS.md](STATUS.md):

1. Issuance and online presentation — holder clients are in `packages/wallet`; issuer is still a stub
2. Offline tiers 0–1 (mdoc) — not present in any source tree
3. Credential–token binding — not present; do not lift Camino product code
4. Tourism vectors + OpenID Foundation conformance
5. Interop with a second independent implementation

## Contact

Hugo Perez · KODE DE HUGO A PEREZ SOLORZANO S.L. · hugo@kode.zone
