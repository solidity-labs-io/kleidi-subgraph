import {
  ethereum,
  BigInt,
  Address,
  Bytes
} from '@graphprotocol/graph-ts'

/**
 * Utility function to deduplicate an array of addresses
 * @param addresses Array of address strings to deduplicate
 * @returns Array with unique addresses only
 */
function deduplicateAddresses(addresses: string[]): string[] {
  let uniqueAddresses: string[] = [];
  
  for (let i = 0; i < addresses.length; i++) {
    let address = addresses[i];
    let isDuplicate = false;
    
    for (let j = 0; j < uniqueAddresses.length; j++) {
      if (address == uniqueAddresses[j]) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueAddresses.push(address);
    }
  }
  
  return uniqueAddresses;
}

import {
  SystemInstanceCreated as SystemInstanceCreatedEvent
} from '../generated/InstanceDeployer/InstanceDeployer'

import {
  InstanceDeployer as InstanceDeployerContract
} from '../generated/InstanceDeployer/InstanceDeployer'

import {
  Safe as SafeContract
} from '../generated/templates/Safe/Safe'

import {
  Timelock as TimelockContract
} from '../generated/templates/Timelock/Timelock'

import {
  Safe as SafeTemplate,
  Timelock as TimelockTemplate
} from '../generated/templates'

import {
  AddedOwner as AddedOwnerEvent,
  RemovedOwner as RemovedOwnerEvent,
  ChangedThreshold as ChangedThresholdEvent,
  EnabledModule as EnabledModuleEvent,
  DisabledModule as DisabledModuleEvent
} from '../generated/templates/Safe/Safe'

import {
  CallScheduled as CallScheduledEvent,
  CallExecuted as CallExecutedEvent,
  Cancelled as CancelledEvent,
  Cleanup as CleanupEvent,
  MinDelayChange as MinDelayChangeEvent,
  ExpirationPeriodChange as ExpirationPeriodChangeEvent,
  PauseDurationUpdated as PauseDurationUpdatedEvent,
  PauseGuardianUpdated as PauseGuardianUpdatedEvent,
  PauseTimeUpdated as PauseTimeUpdatedEvent,
  Paused as PausedEvent
} from '../generated/templates/Timelock/Timelock'

import {
  SystemInstance,
  Safe,
  Timelock,
  TimelockProposal
} from '../generated/schema'

/**
 * Creates a unique ID for an event
 * @param event The ethereum event
 * @returns A string ID in the format blockNumber-logIndex
 */
function createEventID(event: ethereum.Event): string {
  return event.block.number.toString().concat('-').concat(event.logIndex.toString());
}

/**
 * Handles the SystemInstanceCreated event
 * Stores the safe and timelock addresses in a single entity
 * @param event The SystemInstanceCreated event
 */
export function handleSystemInstanceCreated(event: SystemInstanceCreatedEvent): void {
  // Create a new SystemInstance entity with a unique ID
  let systemInstance = new SystemInstance(createEventID(event));
  
  // Set the properties from the event
  systemInstance.safe = event.params.safe.toHexString();
  systemInstance.timelock = event.params.timelock.toHexString();
  systemInstance.creator = event.params.creator.toHexString();
  systemInstance.creationTime = event.params.creationTime;
  
  // Create Safe entity
  let safe = new Safe(systemInstance.safe);
  safe.owners = [];
  safe.threshold = BigInt.fromI32(0);
  safe.modules = [];
  safe.systemInstance = systemInstance.id;
  
  // Create Timelock entity
  let timelock = new Timelock(systemInstance.timelock);
  timelock.minDelay = BigInt.fromI32(0);
  timelock.expirationPeriod = BigInt.fromI32(0);
  timelock.guardian = "";
  timelock.pauseDuration = BigInt.fromI32(0);
  timelock.isPaused = false;
  timelock.pauseEndTime = null;
  timelock.systemInstance = systemInstance.id;
  
  // Link entities
  systemInstance.safeData = safe.id;
  systemInstance.timelockData = timelock.id;
  
  // Save entities
  safe.save();
  timelock.save();
  systemInstance.save();
  
  // Create data source templates
  SafeTemplate.create(event.params.safe);
  TimelockTemplate.create(event.params.timelock);
  
  // Load initial data
  loadSafeData(event.params.safe, safe);
  loadTimelockData(event.params.timelock, timelock);
}

/**
 * Loads the initial data for a Safe
 * @param safeAddress The address of the Safe
 * @param safe The Safe entity
 */
function loadSafeData(safeAddress: Address, safe: Safe): void {
  let safeContract = SafeContract.bind(safeAddress);
  
  // Load owners
  let ownersResult = safeContract.try_getOwners();
  if (!ownersResult.reverted) {
    let owners: string[] = [];
    for (let i = 0; i < ownersResult.value.length; i++) {
      owners.push(ownersResult.value[i].toHexString());
    }
    // Deduplicate owners to ensure uniqueness
    safe.owners = deduplicateAddresses(owners);
  }
  
  // Load threshold
  let thresholdResult = safeContract.try_getThreshold();
  if (!thresholdResult.reverted) {
    safe.threshold = thresholdResult.value;
  }
  
  // Load modules
  let modules: string[] = [];
  let start = Address.fromString("0x0000000000000000000000000000000000000001"); // SENTINEL_MODULES
  let pageSize = 10;
  let hasMore = true;
  
  while (hasMore) {
    let moduleResult = safeContract.try_getModulesPaginated(start, BigInt.fromI32(pageSize));
    if (!moduleResult.reverted) {
      for (let i = 0; i < moduleResult.value.value0.length; i++) {
        modules.push(moduleResult.value.value0[i].toHexString());
      }
      
      if (moduleResult.value.value1.equals(Address.fromString("0x0000000000000000000000000000000000000001"))) {
        hasMore = false;
      } else {
        start = moduleResult.value.value1;
      }
    } else {
      hasMore = false;
    }
  }
  
  // Deduplicate modules to ensure uniqueness
  safe.modules = deduplicateAddresses(modules);
  safe.save();
}

/**
 * Loads the initial data for a Timelock
 * @param timelockAddress The address of the Timelock
 * @param timelock The Timelock entity
 */
function loadTimelockData(timelockAddress: Address, timelock: Timelock): void {
  let timelockContract = TimelockContract.bind(timelockAddress);
  
  // Load minDelay
  let minDelayResult = timelockContract.try_minDelay();
  if (!minDelayResult.reverted) {
    timelock.minDelay = minDelayResult.value;
  }
  
  // Load expirationPeriod
  let expirationPeriodResult = timelockContract.try_expirationPeriod();
  if (!expirationPeriodResult.reverted) {
    timelock.expirationPeriod = expirationPeriodResult.value;
  }
  
  // Load guardian
  let guardianResult = timelockContract.try_pauseGuardian();
  if (!guardianResult.reverted) {
    timelock.guardian = guardianResult.value.toHexString();
  }
  
  // Load pauseDuration
  let pauseDurationResult = timelockContract.try_pauseDuration();
  if (!pauseDurationResult.reverted) {
    timelock.pauseDuration = pauseDurationResult.value;
  }
  
  // Load isPaused
  let pausedResult = timelockContract.try_paused();
  if (!pausedResult.reverted) {
    timelock.isPaused = pausedResult.value;
    
    // If paused, calculate pause end time
    if (timelock.isPaused) {
      let pauseStartTimeResult = timelockContract.try_pauseStartTime();
      if (!pauseStartTimeResult.reverted) {
        timelock.pauseEndTime = pauseStartTimeResult.value.plus(
          timelock.pauseDuration
        );
      }
    }
  }
  
  // Load proposals
  let proposalsResult = timelockContract.try_getAllProposals();
  if (!proposalsResult.reverted) {
    for (let i = 0; i < proposalsResult.value.length; i++) {
      let proposalId = proposalsResult.value[i].toHexString();
      let proposal = new TimelockProposal(proposalId);
      proposal.timelock = timelock.id;
      proposal.targets = [];
      proposal.values = [];
      proposal.payloads = [];
      
      // Check if the proposal is executed, cancelled, or expired
      let isOperationDoneResult = timelockContract.try_isOperationDone(proposalsResult.value[i]);
      if (!isOperationDoneResult.reverted) {
        proposal.executed = isOperationDoneResult.value;
      } else {
        proposal.executed = false;
      }
      
      let isOperationResult = timelockContract.try_isOperation(proposalsResult.value[i]);
      if (!isOperationResult.reverted) {
        proposal.cancelled = !isOperationResult.value && !proposal.executed;
      } else {
        proposal.cancelled = false;
      }
      
      let isOperationExpiredResult = timelockContract.try_isOperationExpired(proposalsResult.value[i]);
      if (!isOperationExpiredResult.reverted) {
        proposal.expired = isOperationExpiredResult.value;
      } else {
        proposal.expired = false;
      }
      
      // Get execution time
      let timestampResult = timelockContract.try_timestamps(proposalsResult.value[i]);
      if (!timestampResult.reverted) {
        proposal.executionTime = timestampResult.value;
      }
      
      proposal.save();
    }
  }
  
  timelock.save();
}

// Safe Event Handlers

export function handleAddedOwner(event: AddedOwnerEvent): void {
  let safeAddress = event.address.toHexString();
  let safe = Safe.load(safeAddress);
  
  if (safe) {
    let owners = safe.owners;
    let ownerAddress = event.params.owner.toHexString();
    
    // Only add the owner if it doesn't already exist in the array
    if (owners.indexOf(ownerAddress) === -1) {
      owners.push(ownerAddress);
      safe.owners = owners;
      safe.save();
    }
  }
}

export function handleRemovedOwner(event: RemovedOwnerEvent): void {
  let safeAddress = event.address.toHexString();
  let safe = Safe.load(safeAddress);
  
  if (safe) {
    let owners = safe.owners;
    let ownerAddress = event.params.owner.toHexString();
    
    // Remove all occurrences of the owner address
    let filteredOwners: string[] = [];
    for (let i = 0; i < owners.length; i++) {
      if (owners[i] !== ownerAddress) {
        filteredOwners.push(owners[i]);
      }
    }
    
    if (filteredOwners.length !== owners.length) {
      safe.owners = filteredOwners;
      safe.save();
    }
  }
}

export function handleChangedThreshold(event: ChangedThresholdEvent): void {
  let safeAddress = event.address.toHexString();
  let safe = Safe.load(safeAddress);
  
  if (safe) {
    safe.threshold = event.params.threshold;
    safe.save();
  }
}

export function handleEnabledModule(event: EnabledModuleEvent): void {
  let safeAddress = event.address.toHexString();
  let safe = Safe.load(safeAddress);
  
  if (safe) {
    let modules = safe.modules;
    let moduleAddress = event.params.module.toHexString();
    
    // Only add the module if it doesn't already exist in the array
    if (modules.indexOf(moduleAddress) === -1) {
      modules.push(moduleAddress);
      safe.modules = modules;
      safe.save();
    }
  }
}

export function handleDisabledModule(event: DisabledModuleEvent): void {
  let safeAddress = event.address.toHexString();
  let safe = Safe.load(safeAddress);
  
  if (safe) {
    let modules = safe.modules;
    let moduleAddress = event.params.module.toHexString();
    
    // Remove all occurrences of the module address
    let filteredModules: string[] = [];
    for (let i = 0; i < modules.length; i++) {
      if (modules[i] !== moduleAddress) {
        filteredModules.push(modules[i]);
      }
    }
    
    if (filteredModules.length !== modules.length) {
      safe.modules = filteredModules;
      safe.save();
    }
  }
}

// Timelock Event Handlers

export function handleCallScheduled(event: CallScheduledEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    let proposalId = event.params.id.toHexString();
    let proposal = TimelockProposal.load(proposalId);
    
    if (!proposal) {
      proposal = new TimelockProposal(proposalId);
      proposal.timelock = timelockAddress;
      proposal.targets = [];
      proposal.values = [];
      proposal.payloads = [];
      proposal.executed = false;
      proposal.cancelled = false;
      proposal.expired = false;
    }
    
    let targets = proposal.targets;
    let values = proposal.values;
    let payloads = proposal.payloads;
    
    targets.push(event.params.target.toHexString());
    values.push(event.params.value);
    payloads.push(event.params.data.toHexString());
    
    proposal.targets = targets;
    proposal.values = values;
    proposal.payloads = payloads;
    proposal.executionTime = event.block.timestamp.plus(event.params.delay);
    
    proposal.save();
  }
}

export function handleCallExecuted(event: CallExecutedEvent): void {
  let proposalId = event.params.id.toHexString();
  let proposal = TimelockProposal.load(proposalId);
  
  if (proposal) {
    proposal.executed = true;
    proposal.save();
  }
}

export function handleCancelled(event: CancelledEvent): void {
  let proposalId = event.params.id.toHexString();
  let proposal = TimelockProposal.load(proposalId);
  
  if (proposal) {
    proposal.cancelled = true;
    proposal.save();
  }
}

export function handleCleanup(event: CleanupEvent): void {
  let proposalId = event.params.id.toHexString();
  let proposal = TimelockProposal.load(proposalId);
  
  if (proposal) {
    proposal.expired = true;
    proposal.save();
  }
}

export function handleMinDelayChange(event: MinDelayChangeEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    timelock.minDelay = event.params.newDuration;
    timelock.save();
  }
}

export function handleExpirationPeriodChange(event: ExpirationPeriodChangeEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    timelock.expirationPeriod = event.params.newPeriod;
    timelock.save();
  }
}

export function handlePauseDurationUpdated(event: PauseDurationUpdatedEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    timelock.pauseDuration = event.params.newPauseDuration;
    timelock.save();
  }
}

export function handlePauseGuardianUpdated(event: PauseGuardianUpdatedEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    timelock.guardian = event.params.newPauseGuardian.toHexString();
    timelock.save();
  }
}

export function handlePauseTimeUpdated(event: PauseTimeUpdatedEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    if (timelock.isPaused) {
      timelock.pauseEndTime = event.params.newPauseStartTime.plus(timelock.pauseDuration);
    }
    timelock.save();
  }
}

export function handlePaused(event: PausedEvent): void {
  let timelockAddress = event.address.toHexString();
  let timelock = Timelock.load(timelockAddress);
  
  if (timelock) {
    timelock.isPaused = true;
    
    // Calculate pause end time
    let timelockContract = TimelockContract.bind(event.address);
    let pauseStartTimeResult = timelockContract.try_pauseStartTime();
    let pauseDurationResult = timelockContract.try_pauseDuration();
    
    if (!pauseStartTimeResult.reverted && !pauseDurationResult.reverted) {
      timelock.pauseEndTime = pauseStartTimeResult.value.plus(
        pauseDurationResult.value
      );
    }
    
    timelock.save();
  }
}
