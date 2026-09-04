# Issuer service (stub)

D2.2 §9.2: issue SD-JWT VC and mdoc entitlements via OpenID4VCI; publish a status list; optionally mint a token and write the credential–token binding.

## Status

Scaffold only. Issuance protocol knowledge currently lives in `packages/wallet` as the **holder** OpenID4VCI client extracted from the EUDI prototype.

## First implementation slice (roadmap stage 1)

1. `/.well-known/openid-credential-issuer` metadata
2. Authorization-code + PKCE token endpoint
3. Credential endpoint returning `vc+sd-jwt` tourism entitlements
4. W3C Bitstring Status List (not present in any source repo)

Out of scope here: production KMS, PMS, payments, tokenomics.
