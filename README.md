# Kleidi Multichain Subgraph

This subgraph indexes Safes, Timelocks, and related governance data created by the Kleidi Instance Deployer contract across multiple networks.

## Supported Networks

This subgraph is deployed across the following networks:

- **Base** (Chain ID: 8453)
- **Ethereum Mainnet** (Chain ID: 1)
- **Optimism** (Chain ID: 10)

## Query Examples

See [query-examples.md](query-examples.md) for example GraphQL queries to fetch data from this subgraph.

## Schema

The subgraph tracks the following entities:

### Core Entities

- **`SystemInstance`**: Links a Safe and Timelock created together by the Instance Deployer
  - `id`: Unique identifier for the instance
  - `safe`: The Safe contract address (hex string)
  - `timelock`: The Timelock contract address (hex string)
  - `safeData`: Reference to the Safe entity
  - `timelockData`: Reference to the Timelock entity
  - `creator`: Address that deployed the instance
  - `creationTime`: Timestamp of creation

- **`Safe`**: A Gnosis Safe multisig wallet
  - `id`: The Safe contract address
  - `owners`: Array of owner addresses
  - `threshold`: Number of signatures required for execution
  - `systemInstance`: Reference to the SystemInstance that created it

- **`Owner`**: An EOA that owns one or more Safes (enables reverse lookup by owner address)
  - `id`: The owner's address
  - `safes`: Array of Safes this address owns

- **`Timelock`**: Governance module with time delays and hot signer capabilities
  - `id`: The Timelock contract address
  - `minDelay`: Minimum delay for scheduled operations (in seconds)
  - `expirationPeriod`: Time window for executing scheduled operations
  - `guardian`: Current pause guardian address
  - `pauseDuration`: How long a pause lasts
  - `isPaused`: Whether the timelock is currently paused
  - `pauseEndTime`: When the pause will end (if paused)
  - `hotSigners`: Array of hot signer addresses
  - `hotSignerEntities`: Reference to HotSigner entities for reverse lookup
  - `systemInstance`: Reference to the SystemInstance that created it

- **`HotSigner`**: An address with instant execution privileges on a Timelock
  - `id`: The hot signer's address
  - `timelocks`: Array of Timelocks where this address is a hot signer

- **`TimelockProposal`**: A scheduled operation in the Timelock
  - `id`: Unique identifier (bytes32 proposal hash)
  - `timelock`: Reference to the parent Timelock
  - `targets`: Array of target contract addresses
  - `values`: Array of ETH values to send
  - `payloads`: Array of calldata for each operation
  - `executionTime`: When the proposal can be executed
  - `executed`: Whether the proposal has been executed
  - `cancelled`: Whether the proposal has been cancelled
  - `expired`: Whether the proposal has expired
  - `scheduledAt`: When the proposal was scheduled (null for historical)
  - `executedAt`: When executed (null if not)
  - `cancelledAt`: When cancelled (null if not)

- **`CalldataWhitelist`**: Whitelisted function calls that hot signers can execute instantly
  - `id`: Unique identifier (timelock-contract-selector-startIndex-endIndex)
  - `timelock`: Reference to the parent Timelock
  - `contractAddress`: Contract address the call is allowed on
  - `selector`: Function selector (bytes4)
  - `startIndex`: Calldata check start position
  - `endIndex`: Calldata check end position
  - `dataHashes`: Array of whitelisted data hashes
  - `isActive`: Whether currently active
  - `addedAtBlock`: Block when added

## Contract Information

The InstanceDeployer contract is deployed at the same address across all supported networks:

**InstanceDeployer**: `0xE138136bFF8c6A9337805DE19177E3b29fef2783`

### Network-Specific Start Blocks

- **Base**: 23801110
- **Ethereum Mainnet**: 21674801
- **Optimism**: 129396729

## Deploying the Subgraph

### First Time Setup

```bash
yarn install
```

### Deployment by Network

The subgraph can be deployed to different networks using the following commands:

#### Base
```bash
yarn prepare:base && yarn codegen && yarn build && yarn deploy:base
```

#### Ethereum Mainnet
```bash
yarn prepare:mainnet && yarn codegen && yarn build && yarn deploy:mainnet
```

#### Optimism
```bash
yarn prepare:optimism && yarn codegen && yarn build && yarn deploy:optimism
```

### Deployment Notes

- For networks not indexed by The Graph (like Base), we use Goldsky
- First time deploying with Goldsky: run `goldsky login`
- If you already have an existing subgraph, you may need to delete it before deploying a new version
- You may need to add `--product hosted-service --access-token {TOKEN}` as extra parameters after "goldsky subgraph deploy" in the package.json file

## Example Queries

### Fetch All System Instances

To fetch all timelock and Gnosis Safe pairs created:

```graphql
{
  systemInstances(first: 1000) {
    id
    safe
    safeData {
      id
      owners
      threshold
    }
    timelock
    timelockData {
      id
      minDelay
    }
    creator
    creationTime
  }
}
```

### Find All Safes Owned by an EOA

Query all Safes where a specific address is an owner:

```graphql
{
  owners(where: { id: "0xYOUR_ADDRESS" }) {
    safes {
      id
      threshold
      owners
    }
  }
}
```

### Find All Timelocks Where an Address is a Hot Signer

Query all Timelocks where a specific address has hot signer privileges:

```graphql
{
  hotSigners(where: { id: "0xYOUR_ADDRESS" }) {
    timelocks {
      id
      minDelay
    }
  }
}
```

### Query Timelock Proposals

Fetch all pending proposals for a specific Timelock:

```graphql
{
  timelockProposals(where: {
    timelock: "0xTIMELOCK_ADDRESS",
    executed: false,
    cancelled: false
  }) {
    id
    targets
    values
    payloads
    executionTime
    scheduledAt
  }
}
```

For more query examples, see the [query-examples.md](query-examples.md) file.
