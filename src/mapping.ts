import {
  ethereum,
  BigInt
} from '@graphprotocol/graph-ts'

import {
  SystemInstanceCreated as SystemInstanceCreatedEvent
} from '../generated/InstanceDeployer/InstanceDeployer'

import {
  SystemInstance
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
  
  // Save the entity to the store
  systemInstance.save();
}
