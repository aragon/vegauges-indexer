import {
  EscrowIVotesAdapter,
  DelegateChanged,
  DelegateVotesChanged,
} from "generated";
import {
  updateDelegationRegistry,
  updateDelegateVotingPower,
} from "./DelegationHelpers";
import { buildContractId } from "./utils/idBuilder";

/**
 * Handler for DelegateChanged event
 * Tracks when a delegator changes their delegate from one address to another
 */
EscrowIVotesAdapter.DelegateChanged.handler(async ({ event, context }: any) => {
  // Store the event data
  const entity: DelegateChanged = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    delegator: event.params.delegator,
    fromDelegate: event.params.fromDelegate,
    toDelegate: event.params.toDelegate,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.DelegateChanged.set(entity);

  // Update the delegation registry to track current delegation state
  await updateDelegationRegistry(
    event.chainId,
    event.srcAddress,
    event.params.delegator,
    event.params.toDelegate,
    Number(event.block.timestamp),
    context,
  );
});

/**
 * Handler for DelegateVotesChanged event
 * Tracks when a delegate's voting power changes
 */
EscrowIVotesAdapter.DelegateVotesChanged.handler(
  async ({ event, context }: any) => {
    // Store the event data
    const entity: DelegateVotesChanged = {
      id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
      delegate: event.params.delegate,
      previousBalance: event.params.previousBalance,
      newBalance: event.params.newBalance,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      contract_id: buildContractId(event.chainId, event.srcAddress),
    };

    await context.DelegateVotesChanged.set(entity);

    // Update the delegate voting power registry to track current voting power
    await updateDelegateVotingPower(
      event.chainId,
      event.srcAddress,
      event.params.delegate,
      event.params.newBalance,
      Number(event.block.timestamp),
      context,
    );
  },
);
