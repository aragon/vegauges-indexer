import { indexer, ExitQueue, ExitQueued } from "envio";
import { setContractData } from "./helpers";
import { getDayId, getDayStartTimestamp } from "./utils/timeHelpers";
import { Context } from "vm";
import { buildContractId, buildProxyContractId } from "./utils/idBuilder";
import { getGeneratedByChainId } from "../generated/src/ConfigYAML.gen";

indexer.onEvent(
  { contract: "ExitQueue", event: "Initialized" },
  async ({ event, context }: any) => {
  await setContractData(event.chainId, event.srcAddress, context);
}
);

indexer.onEvent(
  { contract: "ExitQueue", event: "Upgraded" },
  async ({ event, context }: any) => {
  const contractId = buildProxyContractId(
    event.chainId,
    event.srcAddress,
    event.params.implementation,
  );
  const implementationId = buildContractId(
    event.chainId,
    event.params.implementation,
  );

  await setContractData(event.chainId, event.params.implementation, context);

  await context.ProxyContractUpdates.set({
    id: contractId,
    chainId: event.chainId,
    address: event.srcAddress,
    implementation_id: implementationId,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
}
);

indexer.onEvent(
  { contract: "ExitQueue", event: "ExitQueued" },
  async ({ event, context }: any) => {
  const votingEscrowAddress = votingEscrowFromExitQueue(
    event.chainId,
    event.srcAddress,
  );
  if (!votingEscrowAddress) {
    throw new Error(
      `Voting escrow address not found for exit queue ${event.srcAddress} on chain ${event.chainId}`,
    );
  }
  const contractId = buildContractId(event.chainId, votingEscrowAddress);

  const entity: ExitQueued = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    contract_id: contractId,
    tokenId: event.params.tokenId,
    holder: event.params.holder,
    exitDate: event.params.exitDate,
  };

  await context.ExitQueued.set(entity);

  await updateExitQueueDailyMetrics(
    event.chainId,
    votingEscrowAddress,
    event.params.tokenId,
    event.params.exitDate,
    context,
  );
}
);

const updateExitQueueDailyMetrics = async (
  chainId: Number,
  votingEscrow: String,
  tokenId: BigInt,
  exitDate: BigInt,
  context: Context,
) => {
  const dayID = getDayId(Number(exitDate));
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${votingEscrow}-${dayID}-${chainId}`;
  const contractId = buildContractId(chainId, votingEscrow);

  let exitQueueData = await context.ExitQueueDailyMetrics.get(aggregatedDataID);

  // Get deposit by tokenId
  const lock = await context.Deposit.get(
    `${tokenId}-${votingEscrow}-${chainId}`,
  );

  if (!lock) {
    throw new Error(`Deposit not found for tokenId ${tokenId}`);
  }

  if (!exitQueueData) {
    const newExitQueueData = {
      id: aggregatedDataID,
      contract_id: contractId,
      date: dayStartTimestamp,
      amountOfExits: BigInt(1),
      totalTokens: lock.value,
    };
    await context.ExitQueueDailyMetrics.set(newExitQueueData);
  } else {
    const updatedExitQueueData = {
      id: aggregatedDataID,
      contract_id: contractId,
      date: dayStartTimestamp,
      amountOfExits: exitQueueData.amountOfExits + BigInt(1),
      totalTokens: exitQueueData.totalTokens + lock.value,
    };
    await context.ExitQueueDailyMetrics.set(updatedExitQueueData);
  }
};

const votingEscrowFromExitQueue = (
  chainId: number,
  exitQueue: string,
): String | undefined => {
  const config = getGeneratedByChainId(chainId);

  const exitContracts = config.contracts["ExitQueue"];
  const exitAddresses = exitContracts.addresses;
  const exitQueueIndex = exitAddresses.indexOf(exitQueue);
  if (exitQueueIndex !== -1) {
    const votingContracts = config.contracts["VotingEscrowIncreasing"];
    const votingAddresses = votingContracts.addresses;
    return votingAddresses[exitQueueIndex];
  }
  return undefined;
};
