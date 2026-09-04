# Ledger adapter (stub)

D2.2 §9.2: optional, swappable adapter (for example an EVM chain) that mints ERC-721/6672 tokens and exposes data needed to verify credential–token binding (TW-F-03).

## Isolation note

Live Camino / marketplace / NFT minting code in `bogo-ncw` is **product** and is not copied here. This package starts empty on purpose.

## First implementation slice

- Interface: `mintBinding(credentialHash, tokenLocator) → CAIP locator`
- One in-memory or local Anvil adapter
- No production RPC URLs, no brand keys
