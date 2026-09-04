# Verifier service (stub)

D2.2 §9.2: request presentations via OpenID4VP/DCQL; verify online and offline; check trust and status; optionally verify credential–token binding.

## Status

Scaffold only. Presentation protocol knowledge currently lives in `packages/wallet` as the **holder** OpenID4VP client extracted from the EUDI prototype (presentation-definition + SD-JWT selective disclosure; **not** DCQL).

## First implementation slice

1. Presentation request (`request_uri`) for a tourism entitlement
2. VP token + presentation_submission verification
3. Time/venue validity evaluated from claims (TW-F-04)
4. Offline tiers 0–1 (TW-NF-01) — not in any source repo
