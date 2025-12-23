# Kinun — ERC-1155 Omamori NFT

This repo contains:
- Starknet ERC-1155 contract (`/src/lib.cairo`)
- Viewer + metadata for GitHub Pages (`/docs`)

## GitHub Pages setup
1. Create a GitHub repo and push this project.
2. In repo settings → Pages, set **Source** to `main` and **/docs` folder**.
3. Replace placeholders in `docs/metadata/1.json`:
   - `https://<GITHUB_USER>.github.io/<REPO>/...`

## Contract details
- ERC-1155 single ID: `1`
- Max supply: `10000`
- Public mint enabled (anyone can mint)
- Owner can update base URI and toggle minting

## Deploy (example)
```
scarb build

# declare
starkli declare target/dev/kinun_Kinun1155.contract_class.json --network sepolia --account <ACCOUNT>

# deploy
starkli deploy <CLASS_HASH> \
  --network sepolia \
  --account <ACCOUNT> \
  --constructor-calldata \
  "https://<GITHUB_USER>.github.io/<REPO>/metadata/1.json" <OWNER_ADDRESS>
```

## Mint (example)
```
starkli invoke <CONTRACT_ADDRESS> mint \
  --network sepolia \
  --account <ACCOUNT> \
  --calldata <TO_ADDRESS> 1 0
```

## Update base URI (for IPFS later)
```
starkli invoke <CONTRACT_ADDRESS> set_base_uri \
  --network sepolia \
  --account <ACCOUNT> \
  --calldata "ipfs://<CID>/1.json"
```
