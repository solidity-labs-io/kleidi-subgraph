# Subgraph Query Examples

## SystemInstance Queries

### Fetch All Timelock and Safe Addresses

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

### Fetch Instances Created by a Specific Address

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

### Fetch Instances Created After a Specific Timestamp

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

### Fetch Instances with Pagination

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

### Fetch a Specific Instance by ID

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

### Fetch Instances by Safe Address

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

### Fetch Instances by Timelock Address

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
```

## Safe Queries

### Fetch a Safe by Address

This query fetches a Safe entity by its address:

```graphql
{
  safe(id: "0x1234567890123456789012345678901234567890") {
    id
    owners
    threshold
    modules
    systemInstance {
      id
      creator
      creationTime
    }
  }
}
```

### Fetch Safes with a Specific Owner

This query fetches all Safe entities that have a specific address as an owner:

```graphql
{
  safes(where: { owners_contains: ["0x1234567890123456789012345678901234567890"] }) {
    id
    owners
    threshold
    systemInstance {
      id
    }
  }
}
```

### Fetch Safes with a Specific Threshold

This query fetches all Safe entities with a specific threshold:

```graphql
{
  safes(where: { threshold: "2" }) {
    id
    owners
    threshold
    modules
  }
}
```

### Fetch Safes with a Specific Module

This query fetches all Safe entities that have a specific module enabled:

```graphql
{
  safes(where: { modules_contains: ["0x1234567890123456789012345678901234567890"] }) {
    id
    owners
    threshold
    modules
  }
}
```

## Timelock Queries

### Fetch a Timelock by Address

This query fetches a Timelock entity by its address:

```graphql
{
  timelock(id: "0x1234567890123456789012345678901234567890") {
    id
    minDelay
    expirationPeriod
    guardian
    pauseDuration
    isPaused
    pauseEndTime
    systemInstance {
      id
      creator
    }
  }
}
```

### Fetch Timelocks with a Specific Minimum Delay

This query fetches all Timelock entities with a specific minimum delay:

```graphql
{
  timelocks(where: { minDelay: "86400" }) {
    id
    minDelay
    expirationPeriod
    systemInstance {
      id
    }
  }
}
```

### Fetch Paused Timelocks

This query fetches all Timelock entities that are currently paused:

```graphql
{
  timelocks(where: { isPaused: true }) {
    id
    pauseEndTime
    guardian
    systemInstance {
      id
    }
  }
}
```

### Fetch Timelocks with a Specific Guardian

This query fetches all Timelock entities with a specific guardian address:

```graphql
{
  timelocks(where: { guardian: "0x1234567890123456789012345678901234567890" }) {
    id
    minDelay
    pauseDuration
    isPaused
  }
}
```

## TimelockProposal Queries

### Fetch All Proposals for a Specific Timelock

This query fetches all TimelockProposal entities for a specific Timelock:

```graphql
{
  timelockProposals(where: { timelock: "0x1234567890123456789012345678901234567890" }) {
    id
    targets
    values
    payloads
    executionTime
    executed
    cancelled
    expired
  }
}
```

### Fetch Executed Proposals

This query fetches all TimelockProposal entities that have been executed:

```graphql
{
  timelockProposals(where: { executed: true }) {
    id
    targets
    values
    payloads
    executionTime
    timelock {
      id
    }
  }
}
```

### Fetch Cancelled Proposals

This query fetches all TimelockProposal entities that have been cancelled:

```graphql
{
  timelockProposals(where: { cancelled: true }) {
    id
    targets
    values
    payloads
    executionTime
    timelock {
      id
    }
  }
}
```

### Fetch Expired Proposals

This query fetches all TimelockProposal entities that have expired:

```graphql
{
  timelockProposals(where: { expired: true }) {
    id
    targets
    values
    payloads
    executionTime
    timelock {
      id
    }
  }
}
```

### Fetch Pending Proposals

This query fetches all TimelockProposal entities that are pending (not executed, not cancelled, and not expired):

```graphql
{
  timelockProposals(
    where: { 
      executed: false, 
      cancelled: false, 
      expired: false 
    }
  ) {
    id
    targets
    values
    payloads
    executionTime
    timelock {
      id
    }
  }
}
```

## Relationship Queries

### Fetch a SystemInstance with its Safe and Timelock Data

This query fetches a SystemInstance entity with its associated Safe and Timelock data:

```graphql
{
  systemInstance(id: "12345678-1") {
    id
    safe
    timelock
    creator
    creationTime
    safeData {
      owners
      threshold
      modules
    }
    timelockData {
      minDelay
      expirationPeriod
      guardian
      isPaused
      pauseEndTime
      proposals {
        id
        executionTime
        executed
      }
    }
  }
}
```

### Fetch a Safe with its SystemInstance

This query fetches a Safe entity with its associated SystemInstance:

```graphql
{
  safe(id: "0x1234567890123456789012345678901234567890") {
    id
    owners
    threshold
    modules
    systemInstance {
      id
      creator
      timelock
      creationTime
    }
  }
}
```

### Fetch a Timelock with its Proposals

This query fetches a Timelock entity with its associated TimelockProposal entities:

```graphql
{
  timelock(id: "0x1234567890123456789012345678901234567890") {
    id
    minDelay
    expirationPeriod
    guardian
    isPaused
    proposals {
      id
      targets
      values
      payloads
      executionTime
      executed
      cancelled
      expired
    }
  }
}
```

### Fetch a Timelock with its SystemInstance and Safe Data

This query fetches a Timelock entity with its associated SystemInstance and Safe data:

```graphql
{
  timelock(id: "0x1234567890123456789012345678901234567890") {
    id
    minDelay
    expirationPeriod
    guardian
    isPaused
    systemInstance {
      id
      creator
      creationTime
      safeData {
        owners
        threshold
        modules
      }
    }
  }
}
```
