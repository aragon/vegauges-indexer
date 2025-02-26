/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  SimpleGaugeVoter,
  SimpleGaugeVoter_AdminChanged,
  SimpleGaugeVoter_BeaconUpgraded,
  SimpleGaugeVoter_GaugeActivated,
  SimpleGaugeVoter_GaugeCreated,
  SimpleGaugeVoter_GaugeDeactivated,
  SimpleGaugeVoter_GaugeMetadataUpdated,
  SimpleGaugeVoter_Initialized,
  SimpleGaugeVoter_Paused,
  SimpleGaugeVoter_Reset,
  SimpleGaugeVoter_Unpaused,
  SimpleGaugeVoter_Upgraded,
  SimpleGaugeVoter_Voted,
  VotingEscrowIncreasing,
  VotingEscrowIncreasing_AdminChanged,
  VotingEscrowIncreasing_BeaconUpgraded,
  VotingEscrowIncreasing_Deposit,
  VotingEscrowIncreasing_Initialized,
  VotingEscrowIncreasing_MinDepositSet,
  VotingEscrowIncreasing_Paused,
  VotingEscrowIncreasing_Sweep,
  VotingEscrowIncreasing_SweepNFT,
  VotingEscrowIncreasing_Unpaused,
  VotingEscrowIncreasing_Upgraded,
  VotingEscrowIncreasing_Withdraw,
} from "generated";

SimpleGaugeVoter.AdminChanged.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_AdminChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousAdmin: event.params.previousAdmin,
    newAdmin: event.params.newAdmin,
  };

  context.SimpleGaugeVoter_AdminChanged.set(entity);
});

SimpleGaugeVoter.BeaconUpgraded.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_BeaconUpgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    beacon: event.params.beacon,
  };

  context.SimpleGaugeVoter_BeaconUpgraded.set(entity);
});

SimpleGaugeVoter.GaugeActivated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeActivated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
  };

  context.SimpleGaugeVoter_GaugeActivated.set(entity);
});

SimpleGaugeVoter.GaugeCreated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    creator: event.params.creator,
    metadataURI: event.params.metadataURI,
  };

  context.SimpleGaugeVoter_GaugeCreated.set(entity);
});

SimpleGaugeVoter.GaugeDeactivated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeDeactivated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
  };

  context.SimpleGaugeVoter_GaugeDeactivated.set(entity);
});

SimpleGaugeVoter.GaugeMetadataUpdated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeMetadataUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    metadataURI: event.params.metadataURI,
  };

  context.SimpleGaugeVoter_GaugeMetadataUpdated.set(entity);
});

SimpleGaugeVoter.Initialized.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
  };

  context.SimpleGaugeVoter_Initialized.set(entity);
});

SimpleGaugeVoter.Paused.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.SimpleGaugeVoter_Paused.set(entity);
});

SimpleGaugeVoter.Reset.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Reset = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerRemovedFromGauge: event.params.votingPowerRemovedFromGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
  };

  context.SimpleGaugeVoter_Reset.set(entity);
});

SimpleGaugeVoter.Unpaused.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.SimpleGaugeVoter_Unpaused.set(entity);
});

SimpleGaugeVoter.Upgraded.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    implementation: event.params.implementation,
  };

  context.SimpleGaugeVoter_Upgraded.set(entity);
});

SimpleGaugeVoter.Voted.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Voted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerCastForGauge: event.params.votingPowerCastForGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
  };

  context.SimpleGaugeVoter_Voted.set(entity);
});

VotingEscrowIncreasing.AdminChanged.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_AdminChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousAdmin: event.params.previousAdmin,
    newAdmin: event.params.newAdmin,
  };

  context.VotingEscrowIncreasing_AdminChanged.set(entity);
});

VotingEscrowIncreasing.BeaconUpgraded.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_BeaconUpgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    beacon: event.params.beacon,
  };

  context.VotingEscrowIncreasing_BeaconUpgraded.set(entity);
});

VotingEscrowIncreasing.Deposit.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Deposit = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    startTs: event.params.startTs,
    value: event.params.value,
    newTotalLocked: event.params.newTotalLocked,
  };

  context.VotingEscrowIncreasing_Deposit.set(entity);
});

VotingEscrowIncreasing.Initialized.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
  };

  context.VotingEscrowIncreasing_Initialized.set(entity);
});

VotingEscrowIncreasing.MinDepositSet.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_MinDepositSet = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    minDeposit: event.params.minDeposit,
  };

  context.VotingEscrowIncreasing_MinDepositSet.set(entity);
});

VotingEscrowIncreasing.Paused.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.VotingEscrowIncreasing_Paused.set(entity);
});

VotingEscrowIncreasing.Sweep.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Sweep = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    to: event.params.to,
    amount: event.params.amount,
  };

  context.VotingEscrowIncreasing_Sweep.set(entity);
});

VotingEscrowIncreasing.SweepNFT.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_SweepNFT = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    to: event.params.to,
    tokenId: event.params.tokenId,
  };

  context.VotingEscrowIncreasing_SweepNFT.set(entity);
});

VotingEscrowIncreasing.Unpaused.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.VotingEscrowIncreasing_Unpaused.set(entity);
});

VotingEscrowIncreasing.Upgraded.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    implementation: event.params.implementation,
  };

  context.VotingEscrowIncreasing_Upgraded.set(entity);
});

VotingEscrowIncreasing.Withdraw.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Withdraw = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    value: event.params.value,
    ts: event.params.ts,
    newTotalLocked: event.params.newTotalLocked,
  };

  context.VotingEscrowIncreasing_Withdraw.set(entity);
});
