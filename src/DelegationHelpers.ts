import { Context } from "vm";
import { buildContractId } from "./utils/idBuilder";

/**
 * Build account ID: address-contract-chainId
 */
export const buildAccountId = (
  address: String,
  srcAddress: String,
  chainId: Number,
) => {
  return `${address}-${srcAddress}-${chainId}`;
};

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
 * Ensure an Account entity exists for the given address
 * Creates it if it doesn't exist, otherwise returns existing
 */
export const ensureAccount = async (
  chainId: Number,
  srcAddress: String,
  address: String,
  context: Context,
) => {
  const accountId = buildAccountId(address, srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let account = await context.Account.get(accountId);

  if (!account) {
    await context.Account.set({
      id: accountId,
      address: address,
      contract_id: contractId,
    });
  }

  return accountId;
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
  const delegateVotingPowerId = buildDelegateVotingPowerId(
    newDelegate,
    srcAddress,
    chainId,
  );

  // Ensure Account entities exist for both delegator and delegate
  const delegatorAccountId = await ensureAccount(
    chainId,
    srcAddress,
    delegator,
    context,
  );
  const delegateAccountId = await ensureAccount(
    chainId,
    srcAddress,
    newDelegate,
    context,
  );

  await context.Delegation.set({
    id: delegationId,
    delegator_id: delegatorAccountId,
    delegate_id: delegateAccountId,
    delegateVotingPower_id: delegateVotingPowerId,
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

  // Ensure Account entity exists for the delegate
  const delegateAccountId = await ensureAccount(
    chainId,
    srcAddress,
    delegate,
    context,
  );

  await context.DelegateVotingPower.set({
    id: votingPowerId,
    delegate_id: delegateAccountId,
    votingPower: newBalance,
    contract_id: contractId,
    lastUpdated: BigInt(timestamp),
  });
};
