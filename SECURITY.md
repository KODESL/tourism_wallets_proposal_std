# Security and isolation

This repository is the **vendor-neutral** reference for fellowship 2029-01-1530. It is not the live BOGOWALLET deployment. The rules below exist so a later public release does not leak product, customers, or keys.

## Never commit

| Class | Examples | Lives in |
| --- | --- | --- |
| Cloud project configs | `GoogleService-Info*.plist`, `google-services.json`, Firebase `firestore-key.json` | Product repos only |
| Operator keys | Camino/EVM private keys, `b3-prod-key.json`, `.env` with secrets | Product repos only |
| Identity-document material | Passport **CSCA** PEMs, DNIe readers, MRZ captures, ICAO DG files | `eudi` prototype only |
| Customer and tenant data | Firestore dumps, SQL, PII, booking feeds | Never in git |
| Live TSS | Go TSS server, Binance tss-lib binaries, operator-held shares | `bogo-ncw` only |
| Brand / marketplace | White-label JSON, admin panels, HubSpot, Awin | Product repos only |
| Fellowship personal files | Contracts, CVs, photos | `OpenHorizons/final report/` locally |

`.gitignore` already blocks `.env`, `*.pem`, Google/Firebase plist/json, and `*-key.json`. Do not force-add them.

## What is allowed

- Protocol clients and tests with **example.tourism** hosts
- Architecture notes that name product repos only as provenance
- `specs/tss/tss.proto` as an **interface** (no share material)
- In-memory `KeyStore` / `CredentialStore` for Node tests
- Static **test** trust lists with fictional issuers

## Key handling in this reference

- D2.2 puts production KMS **out of scope**.
- `packages/wallet` uses `MemoryKeyStore`. That is for tests. A device adapter must use platform secure storage (see `docs/architecture/native/secure-storage-patterns.md`).
- Do not hard-code encryption keys in source. The EUDI prototype `UnifiedStorage.ts` did; it was not copied.
- Do not fall back to plaintext preferences for private keys. The Android product code has such a fallback; the reference must not.

## Recovery without custody

Share 1 = device, Share 2 = coordinator, Share 3 = holder recovery secret the coordinator does not know. 2-of-3. The coordinator must not retain Share 1 or Share 3 in recoverable form. See `specs/tss/tss-protocol-flows.md`. Implementing the Go MPC server here would re-import a custodial-adjacent product; use a test double instead.

## If this repository is made public

1. Keep it Apache-2.0 and vendor-neutral.
2. Remove or relocate `docs/fellowship/reporting/` (Trust-Grants working notes).
3. Re-scan for product hostnames, key material, and CSCA paths.
4. Do not point README at live customer wallets.

## Reporting a leak

If product secrets or PII appear in this git history, rotate the credentials in the product systems first, then purge the commit. Contact hugo@kode.zone.
