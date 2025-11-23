import { Context } from "vm";
import { buildContractId } from "./utils/idBuilder";

/**
 * Build delegation ID: delegator-contract-chainId
 */
export const buildDelegationId = (
  delegator: String,
  srcAddress: String,
  chainId: Number,
) => {
  return `${delegator}-${srcAddress}-${chainId}`;
};

/**
 * Build delegate voting power ID: delegate-contract-chainId
 */
export const buildDelegateVotingPowerId = (
  delegate: String,
  srcAddress: String,
  chainId: Number,
) => {
  return `${delegate}-${srcAddress}-${chainId}`;
};

/**
 * Update the current delegation state for a delegator
 */
export const updateDelegationRegistry = async (
  chainId: Number,
  srcAddress: String,
  delegator: String,
  newDelegate: String,
  timestamp: number,
  context: Context,
) => {
  const delegationId = buildDelegationId(delegator, srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  await context.Delegation.set({
    id: delegationId,
    delegator: delegator,
    currentDelegate: newDelegate,
    contract_id: contractId,
    lastUpdated: BigInt(timestamp),
  });
};

/**
 * Update the current voting power for a delegate
 */
export const updateDelegateVotingPower = async (
  chainId: Number,
  srcAddress: String,
  delegate: String,
  newBalance: BigInt,
  timestamp: number,
  context: Context,
) => {
  const votingPowerId = buildDelegateVotingPowerId(delegate, srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  await context.DelegateVotingPower.set({
    id: votingPowerId,
    delegate: delegate,
    votingPower: newBalance,
    contract_id: contractId,
    lastUpdated: BigInt(timestamp),
  });
};
