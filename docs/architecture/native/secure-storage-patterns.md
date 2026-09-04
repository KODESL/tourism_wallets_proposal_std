# Native secure-storage patterns (notes, not product code)

Device-bound storage is required for a non-custodial holder wallet. The iOS and Android apps contain working patterns. **Those apps are not copied** (Web3Auth, Firebase tokens, brand identifiers, white-label config).

This note records only the portable constraints the reference implementation should honour when a mobile adapter is added.

## iOS (from `bogo-wallet` Keychain usage)

- Store private material as `kSecClassGenericPassword`.
- Accessibility: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` (no iCloud Keychain sync, no backup restore of the key).
- For holder keys, attach `SecAccessControl` with biometry current-set so a biometric enrolment change invalidates access.
- Service identifier must be the wallet app’s own; do not share a Keychain group with an operator backend.
- TSS Share 1 belongs in this store. Seed phrases, if any, are a separate item. Operator session tokens are **not** keys.

## Android (from `bogo-wallet-android` `SecureStorage`)

- `MasterKey` with `KeyScheme.AES256_GCM` (Android Keystore).
- `EncryptedSharedPreferences` with `AES256_SIV` (keys) and `AES256_GCM` (values).
- Do not fall back to plaintext `SharedPreferences` for private keys (the product code has such a fallback; the reference must not).
- Prefer StrongBox / hardware-backed Keystore when `isInsideSecureHardware` is true.
- Biometric gate belongs in front of key use, not instead of encryption.

## EUDI prototype (what not to copy)

- `UnifiedStorage.ts` hard-codes an encryption key string in source. That pattern is rejected.
- `CredentialStore.ts` mixes SQLCipher intent, Keychain, and AsyncStorage by platform. The reference uses `MemoryCredentialStore` until a real adapter exists.
- `BiometricAuthManager.ts` is a full RN product auth UX (PIN hash, hard-block counters). Not extracted.

## Mapping to D2.2

These notes support TW-TL-02 (recovery without custody) and the wallet component’s “holds keys non-custodially” requirement. They are not a substitute for a hardware-backed `KeyStore` adapter.
