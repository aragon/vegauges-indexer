import { Context } from "vm";
import {
  VotingEscrowIncreasing,
  Deposit,
  MinDepositSet,
  Withdraw,
} from "generated";
import {
  updateWithdrawalDailyMetrics,
  updateDepositDailyMetrics,
  addUniqueStaker,
  updateEscrowDailyMetrics,
  setContractData,
  updateEscrowLocksDailyMetrics,
  updateEscrowLocksMetrics,
} from "./helpers";
import { buildContractId, buildProxyContractId, buildDepositId } from "./utils/idBuilder";

VotingEscrowIncreasing.Initialized.handler(async ({ event, context }: any) => {
  setContractData(event.chainId, event.srcAddress, context);
});

VotingEscrowIncreasing.Upgraded.handler(async ({ event, context }: any) => {
  const contractId = buildProxyContractId(event.chainId, event.srcAddress, event.params.implementation);
  const implementationId = buildContractId(event.chainId, event.params.implementation);

  await setContractData(event.chainId, event.params.implementation, context);

  context.ProxyContractUpdates.set({
    id: contractId,
    chainId: event.chainId,
    address: event.srcAddress,
    implementation_id: implementationId,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});

VotingEscrowIncreasing.Deposit.handler(async ({ event, context }: any) => {
  const entity: Deposit = {
    id: buildDepositId(event.params.tokenId, event.srcAddress, event.chainId),
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    startTs: event.params.startTs,
    value: event.params.value,
    newTotalLocked: event.params.newTotalLocked,
    active: true,
    withdrawalTime: undefined,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.Deposit.set(entity);

  await addUniqueStaker(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.tokenId,
    context,
  );
  await updateDepositDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.value,
    Number(event.params.startTs),
    context,
  );
  await updateEscrowDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.newTotalLocked,
    Number(event.params.startTs),
    true,
    context,
  );
  await updateEscrowLocksDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.newTotalLocked,
    Number(event.params.startTs),
    true,
    context,
  );
  await updateEscrowLocksMetrics(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.newTotalLocked,
    true,
    context,
  );
});

VotingEscrowIncreasing.MinDepositSet.handler(async ({ event, context }: any) => {
  const entity: MinDepositSet = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    minDeposit: event.params.minDeposit,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.MinDepositSet.set(entity);
});

VotingEscrowIncreasing.Withdraw.handler(async ({ event, context }: any) => {
  const entity: Withdraw = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    value: event.params.value,
    ts: event.params.ts,
    newTotalLocked: event.params.newTotalLocked,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.Withdraw.set(entity);

  await setLockActiveStatusToInactive(
    event.chainId,
    event.srcAddress,
    event.params.tokenId,
    event.params.ts,
    context,
  );

  await updateWithdrawalDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.value,
    Number(event.params.ts),
    context,
  );
  await updateEscrowDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.newTotalLocked,
    Number(event.params.ts),
    false,
    context,
  );
  await updateEscrowLocksDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.newTotalLocked,
    Number(event.params.ts),
    false,
    context,
  );
  await updateEscrowLocksMetrics(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.newTotalLocked,
    false,
    context,
  );
});

// Function to set Lock active status as false
async function setLockActiveStatusToInactive(
  chainId: number,
  srcAddress: string,
  tokenId: BigInt,
  withdrawalTime: bigint,
  context: Context,
) {
  const depositId = `${tokenId}-${srcAddress}-${chainId}`;
  const deposit = await context.Deposit.get(depositId);
  const entity: Deposit = {
    id: depositId,
    depositor: deposit.depositor,
    tokenId: deposit.tokenId,
    startTs: deposit.startTs,
    value: deposit.value,
    newTotalLocked: deposit.newTotalLocked,
    active: false,
    withdrawalTime: withdrawalTime,
    contract_id: deposit.contract_id,
  };

  await context.Deposit.set(entity);
}
