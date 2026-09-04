# Trust registry stub

D2.2 §9.2: issuer/verifier legitimacy data in an eIDAS-aligned shape for the test environment.

Not a production trust-list operator. No source extract: none of the four product repos implements an eIDAS trust registry.

## First implementation slice

- Static JSON list of test issuers and verifiers
- Shape aligned with ETSI TS 119 612 / EU Trusted List concepts
- Used by the verifier when checking issuer keys
