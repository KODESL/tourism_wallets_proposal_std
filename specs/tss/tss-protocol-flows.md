# Threshold recovery without custody (interface note)

This note restates the **2-of-3** pattern that D2.2 requires the reference implementation to demonstrate: recovery after device loss without the operator reconstructing the holder’s key (TW-TL-02 / D8).

It is **not** a product runbook. Live TSS server code, PIN encryption, operator-held shares in a production database, and chain-specific address derivation are out of this repository.

## Parties

| Party | Share | Held by |
| --- | --- | --- |
| P1 | Share 1 | Holder device (device-bound secure storage) |
| P2 | Share 2 | Operator / coordinator (encrypted, never combined with P1 except inside an MPC session) |
| P3 | Share 3 | Holder recovery material (encrypted with a recovery secret the operator does not know) |

Threshold: any 2 of 3 can produce a signature. No party ever holds the full private key.

## Key generation (DKG)

1. Holder requests wallet creation.
2. Coordinator starts a DKG session (`threshold=2`, `party_count=3`) via the interface in `tss.proto`.
3. GG20-style rounds produce three shares and one public key.
4. Share 1 is returned to the device. Share 2 stays with the coordinator. Share 3 is returned to the holder as recovery material.
5. The coordinator **must not** retain Share 1 or Share 3 in recoverable form.

## Normal signing

Share 1 (device) + Share 2 (coordinator). Message hashed by the holder; coordinator never sees a reconstructed key.

## Recovery after device loss

Share 2 (coordinator) + Share 3 (holder recovery material) produce a signature or a new Share 1 for a replacement device. The coordinator still never sees Share 3 in the clear together with Share 2 outside the MPC session.

## What this repo will implement later

A **test double** of `TSSService` sufficient to demonstrate the recovery flow in conformance vectors. Not a production MPC server.

## Provenance

Interface shape: `bogo-ncw/packages/tss-service/proto/tss.proto`.
Narrative source (product names and datastore stripped): `bogo-ncw/docs/architecture/tss-protocol-flows.md`.
