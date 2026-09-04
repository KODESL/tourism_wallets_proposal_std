# Source map

| This repo | Origin | Treatment |
| --- | --- | --- |
| `docs/fellowship/original/*.docx` | `OpenHorizons/final report/` | Copy |
| `docs/fellowship/original/tourism_wallet_bp.pdf` | same | Copy |
| `docs/fellowship/markdown/D*.md` | pandoc from those DOCX | Generated |
| `docs/fellowship/reporting/00_FINAL_REPORT_FILL_PACK.md` | `OpenHorizons/final report/` | Copy (internal) |
| `docs/architecture/eudi-prototype/**` | `eudi/docs/article_*` | Copy + provenance note |
| `packages/wallet/src/issuance/OpenID4VCIClient.ts` | `eudi/src/issuance/OpenID4VCIClient.ts` | Extract, sanitise |
| `packages/wallet/src/presentation/OpenID4VPClient.ts` | `eudi/src/presentation/OpenID4VPClient.ts` | Extract, sanitise |
| `packages/wallet/src/crypto/KeyManager.ts` | `eudi/src/crypto/KeyManager.ts` | Rewrite onto `KeyStore` |
| `packages/wallet/src/crypto/KeyStore.ts` | new | Isolation adapter |
| `packages/wallet/src/storage/CredentialStore.ts` | types from `eudi/src/storage/CredentialStore.ts` | Rewrite (memory) |
| `packages/wallet/src/telemetry/metrics.ts` | new | No-op (replaces RN Metrics) |
| `packages/wallet/src/**/__tests__` | `eudi/src/**/__tests__` plus new KeyManager/store tests | Adapted |
| `specs/tss/tss.proto` | `bogo-ncw/packages/tss-service/proto/tss.proto` | Package rename |
| `specs/tss/tss-protocol-flows.md` | `bogo-ncw/docs/architecture/tss-protocol-flows.md` | Rewritten, de-branded |
| `docs/architecture/native/secure-storage-patterns.md` | iOS `SecureStorage.swift`, Android `SecureStorage.kt` | Notes only |
