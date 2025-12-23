# Kleidi Subgraph Development Guide

## Project Overview
This subgraph indexes Kleidi wallet system data (Safe multisigs + Timelocks) created via the InstanceDeployer factory contract across multiple EVM chains.

## Principles
Follow SOLID principles:
- Single Responsibility: Each handler function handles one event type
- Keep mappings focused on state updates, not complex business logic
- Use helper functions for common operations (deduplication, ID generation)

## Development Process

### 1. Writing New Code
1. Define the entity in schema.graphql
2. Add the event handler mapping in subgraph.template.yaml
3. Implement the handler in src/mapping.ts
4. Run codegen and build to verify

### 2. Testing Process

**Local Testing with Matchstick:**
```bash
# Install matchstick (first time only)
yarn add -D matchstick-as

# Write tests in tests/ directory
# Run tests
graph test
```

**Build Verification:**
```bash
yarn prepare:base    # Generate subgraph.yaml from template
yarn codegen         # Generate TypeScript types from ABI/schema
yarn build           # Compile to WebAssembly
```
If build succeeds without errors, the code is syntactically correct.

**Local Node Testing (optional):**
```bash
# Start local graph node with docker
docker-compose up -d

# Create and deploy locally
yarn create-local
yarn deploy-local

# Query at http://localhost:8000/subgraphs/name/solidity-labs/instance-deployer
```

**Query Testing:**
After deployment, test queries against the deployed subgraph:
```graphql
# Verify system instances are indexed
{ systemInstances(first: 5) { id safe timelock creator } }

# Verify Safe data is populated
{ safes(first: 5) { id owners threshold modules } }

# Verify Timelock data is populated
{ timelocks(first: 5) { id minDelay guardian isPaused } }

# Query wallets by owner
{ owners(where: { id: "0x..." }) { safes { id } } }
```

### 3. Deployment

**Base (via Goldsky):**
```bash
yarn prepare:base && yarn codegen && yarn build && yarn deploy:base
```

**Other Networks:**
```bash
yarn prepare:mainnet && yarn codegen && yarn build && yarn deploy:mainnet
yarn prepare:optimism && yarn codegen && yarn build && yarn deploy:optimism
```

## Code Style
- Use lowercase hex strings for addresses (toHexString())
- Use BigInt for all numeric values
- Deduplicate arrays before saving to prevent duplicates
- Always check if entity exists before loading (Entity.load())
- Use descriptive event ID formats: blockNumber-logIndex or address-specific-identifiers

## Entity Relationships
- SystemInstance is the root entity linking Safe and Timelock
- Owner entity enables reverse lookup: "find all Safes owned by EOA"
- HotSigner entity enables reverse lookup: "find all Timelocks where address is hot signer"
- TimelockProposal references its parent Timelock
- CalldataWhitelist references its parent Timelock
