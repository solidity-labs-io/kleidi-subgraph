# Subgraph Query Examples

## Fetch All Timelock and Safe Addresses

This query fetches all SystemInstance entities with their safe and timelock addresses:

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

## Fetch Instances Created by a Specific Address

This query fetches all SystemInstance entities created by a specific address:

```graphql
{
  systemInstances(where: { creator: "0x1234567890123456789012345678901234567890" }) {
    id
    safe
    timelock
    creationTime
  }
}
```

## Fetch Instances Created After a Specific Timestamp

This query fetches all SystemInstance entities created after a specific timestamp:

```graphql
{
  systemInstances(where: { creationTime_gt: "1672531200" }) {
    id
    safe
    timelock
    creator
    creationTime
  }
}
```

## Fetch Instances with Pagination

This query fetches a paginated list of SystemInstance entities:

```graphql
{
  systemInstances(first: 10, skip: 10, orderBy: creationTime, orderDirection: desc) {
    id
    safe
    timelock
    creator
    creationTime
  }
}
```

## Fetch a Specific Instance by ID

This query fetches a specific SystemInstance entity by its ID:

```graphql
{
  systemInstance(id: "12345678-1") {
    id
    safe
    timelock
    creator
    creationTime
  }
}
```

## Fetch Instances by Safe Address

This query fetches all SystemInstance entities with a specific safe address:

```graphql
{
  systemInstances(where: { safe: "0x1234567890123456789012345678901234567890" }) {
    id
    safe
    timelock
    creator
    creationTime
  }
}
```

## Fetch Instances by Timelock Address

This query fetches all SystemInstance entities with a specific timelock address:

```graphql
{
  systemInstances(where: { timelock: "0x1234567890123456789012345678901234567890" }) {
    id
    safe
    timelock
    creator
    creationTime
  }
}
