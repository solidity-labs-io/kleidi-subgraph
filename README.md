# Instance Deployer Subgraph

This subgraph indexes safe and timelock addresses created by the Instance Deployer contract on the Base network.

## Query Examples

See [query-examples.md](query-examples.md) for example GraphQL queries to fetch data from this subgraph.

## Schema

The subgraph stores the following data:

- `SystemInstance`: A record of a safe and timelock pair created by the Instance Deployer
  - `id`: A unique identifier for the instance
  - `safe`: The address of the safe
  - `timelock`: The address of the timelock
  - `creator`: The address that created the instance
  - `creationTime`: When the instance was created

## Contract Information

### Base
- InstanceDeployer: 0xE138136bFF8c6A9337805DE19177E3b29fef2783
- Start Block: 23801110

## Deploying the subgraph:

**First time only**
```ssh
yarn install
```

**Base deployment**

Base is not indexed by The Graph so we use Goldsky

First run:

```ssh
goldsky login
```

If you already have an existing subgraph you will have to delete it to deploy the new one

**Deploy** 

```ssh
yarn prepare:base
yarn codegen
yarn build
yarn deploy:base
```

You may need to add `--product hosted-service --access-token {TOKEN}` as extra parameters just after "goldsky subgraph deploy" in the package.json file.

## Example Query

To fetch all timelock and Gnosis Safe addresses created:

```graphql
{
  systemInstances(first: 1000) {
    id
    safe
    timelock
    creator
    creationTime
  }
}
```

For more query examples, see the [query-examples.md](query-examples.md) file.
