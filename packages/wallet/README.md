# `@tourism-wallets/wallet`

Wallet component of the D2.2 reference architecture (fellowship 2029-01-1530).

Holds keys and credentials on the holder side. This package is an **isolated extract** of the EUDI prototype protocol cores, not a product wallet.

## What is here

| Module | Source | Isolation |
| --- | --- | --- |
| `OpenID4VCIClient` | `eudi/src/issuance/OpenID4VCIClient.ts` | RN telemetry removed; `client_id` is constructor-injected (`tourism-wallet-ref`) |
| `OpenID4VPClient` | `eudi/src/presentation/OpenID4VPClient.ts` | RN telemetry removed |
| `KeyManager` | `eudi/src/crypto/KeyManager.ts` | Keychain/RN replaced by `KeyStore` |
| `MemoryCredentialStore` | types only from `eudi/src/storage/CredentialStore.ts` | 1,209-line RN store not copied |

## Not yet (D2.2 roadmap)

- ISO/IEC 18013-5 mdoc device retrieval
- OpenID4VP DCQL
- Offline tiers 0–1
- Credential–token binding
- Recovery without custody (see `specs/tss/`)
- EUDI ARF v2.4.0 / HAIP alignment (prototype targeted ARF 1.4.0)

## Test

```bash
cd packages/wallet && npm test
```
