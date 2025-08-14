import {
  SimpleGaugeVoter,
  GaugeActivated,
  GaugeCreated,
  GaugeDeactivated,
  GaugeMetadataUpdated,
  VoteReset,
  Vote,
} from "generated";
import {
  setGauge,
  updateGaugeMetadata,
  activateGauge,
  deactivateGauge,
  setContractData,
  updateVotingMetrics,
  addUniqueVoter,
} from "./helpers";
import { fetchIpfs } from "./utils/ipfs";
import { buildContractId, buildProxyContractId } from "./utils/idBuilder";
import { getVotingEscrowIncreasingAddresses } from "./utils/contractAddresses";

SimpleGaugeVoter.Initialized.handler(async ({ event, context }: any) => {
  await setContractData(event.chainId, event.srcAddress, context);

  await context.GaugePlugin.set({
    id: buildContractId(event.chainId, event.srcAddress),
    pluginContract_id: buildContractId(event.chainId, event.srcAddress),
  });
});

SimpleGaugeVoter.Upgraded.handler(async ({ event, context }: any) => {
  const contractId = buildProxyContractId(event.chainId, event.srcAddress, event.params.implementation);
  const implementationId = buildContractId(event.chainId, event.params.implementation);

  await setContractData(event.chainId, event.params.implementation, context);

  await context.ProxyContractUpdates.set({
    id: contractId,
    chainId: event.chainId,
    address: event.srcAddress,
    implementation_id: implementationId,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});

SimpleGaugeVoter.GaugeActivated.handler(async ({ event, context }: any) => {
  const entity: GaugeActivated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.GaugeActivated.set(entity);
  await activateGauge(event.chainId, event.srcAddress, event.params.gauge, context);
});

type GaugeMetadata = {
  name: string;
  address: string;
  description: string;
  logo: string;
  resources: {
    name: string;
    url: string;
  }[];
};

SimpleGaugeVoter.GaugeCreated.handler(async ({ event, context }: any) => {
  const metadata = await fetchIpfs<GaugeMetadata>(event.params.metadataURI, context);

  const entity: GaugeCreated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    creator: event.params.creator,
    metadataURI: event.params.metadataURI,
    metadata: JSON.stringify(metadata),
    name: metadata.name,
    logo: metadata.logo,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.GaugeCreated.set(entity);

  await setGauge(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.creator,
    event.params.metadataURI,
    JSON.stringify(metadata),
    metadata.name,
    metadata.logo,
    true,
    context,
  );
});

SimpleGaugeVoter.GaugeDeactivated.handler(async ({ event, context }: any) => {
  const entity: GaugeDeactivated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.GaugeDeactivated.set(entity);
  await deactivateGauge(event.chainId, event.srcAddress, event.params.gauge, context);
});

SimpleGaugeVoter.GaugeMetadataUpdated.handler(async ({ event, context }: any) => {
  const metadata = await fetchIpfs<GaugeMetadata>(event.params.metadataURI, context);

  const entity: GaugeMetadataUpdated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    metadataURI: event.params.metadataURI,
    metadata: JSON.stringify(metadata),
    name: metadata.name,
    logo: metadata.logo,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.GaugeMetadataUpdated.set(entity);
  await updateGaugeMetadata(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.metadataURI,
    JSON.stringify(metadata),
    metadata.name,
    metadata.logo,
    context,
  );
});

SimpleGaugeVoter.Reset.handler(async ({ event, context }: any) => {
  let voter = event.params.voter;

  if (getVotingEscrowIncreasingAddresses(event.chainId).includes(voter)) {
    voter = event.transaction.from;
  }

  const entity: VoteReset = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerRemovedFromGauge: event.params.votingPowerRemovedFromGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.VoteReset.set(entity);
  await updateVotingMetrics(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    voter,
    event.params.epoch,
    event.params.votingPowerRemovedFromGauge,
    event.params.totalVotingPowerInGauge,
    event.params.totalVotingPowerInContract,
    Number(event.params.timestamp),
    false,
    context,
  );
});

SimpleGaugeVoter.Voted.handler(async ({ event, context }: any) => {
  const entity: Vote = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerCastForGauge: event.params.votingPowerCastForGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
    contract_id: buildContractId(event.chainId, event.srcAddress),
  };

  await context.Vote.set(entity);

  await addUniqueVoter(
    event.chainId,
    event.srcAddress,
    event.params.voter,
    context,
  );
  await updateVotingMetrics(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.voter,
    event.params.epoch,
    event.params.votingPowerCastForGauge,
    event.params.totalVotingPowerInGauge,
    event.params.totalVotingPowerInContract,
    Number(event.params.timestamp),
    true,
    context,
  );
});
