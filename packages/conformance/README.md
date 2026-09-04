# Conformance harness (stub)

D2.2 §8 / §9.2: run OpenID Foundation OpenID4VCI / OpenID4VP / HAIP tests plus tourism profile vectors.

## Status

Scaffold only. No OIDF suite wiring yet.

## Planned

1. Wrap OIDF conformance suite against `packages/issuer` and `packages/wallet`
2. Tourism vectors in `vectors/tourism/` for D4 (semantics), D6 (offline), D7 (binding)
3. Negative cases: binding mismatch reject; expired time/venue; status-list revoked
