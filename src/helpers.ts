import { Context } from "vm";
import {
  buildContractId,
  buildGaugeId,
  buildGaugePluginId,
  buildStakerId,
  buildVoterId,
  aggregatedDataId,
  buildDepositId,
  buildAllTimeMetrictsId,
  buildDailyMetrictsId,
  buildVoterMetrictsId,
} from "./utils/idBuilder";
import { getDayId, getDayStartTimestamp } from "./utils/timeHelpers";

export const setContractData = async (
  chainId: Number,
  srcAddress: String,
  context: Context,
) => {
  const contract_id = buildContractId(chainId, srcAddress);
  let contract = await context.Contract.get(contract_id);

  if (!contract) {
    await context.Contract.set({
      id: contract_id,
      address: srcAddress,
      chainId: chainId,
    });
  }
};

export const setGauge = async (
  chainId: Number,
  gaugePlugin: String,
  gauge: String,
  creator: String,
  metadataURI: String,
  metadata: String,
  name: String,
  logo: String,
  active: boolean,
  context: Context,
) => {
  const gaugeId = buildGaugeId(gauge, gaugePlugin, chainId);
  const gaugePluginId = buildGaugePluginId(gaugePlugin, chainId);

  await context.Gauge.set({
    id: gaugeId,
    address: gauge,
    creator: creator,
    metadataURI: metadataURI,
    metadata: metadata,
    name: name,
    logo: logo,
    active: active,
    gaugePlugin_id: gaugePluginId,
  });
};

export const updateGaugeMetadata = async (
  chainId: Number,
  pluginId: String,
  gauge: String,
  metadataURI: String,
  metadata: String,
  name: String,
  logo: String,
  context: Context,
) => {
  const gaugeId = buildGaugeId(gauge, pluginId, chainId);

  let gaugeData = await context.Gauge.get(gaugeId);

  await context.Gauge.set({
    ...gaugeData,
    metadataURI: metadataURI,
    metadata: metadata,
    name: name,
    logo: logo,
  });
};

export const deactivateGauge = async (
  chainId: Number,
  pluginId: String,
  gauge: String,
  context: Context,
) => {
  const gaugeId = buildGaugeId(gauge, pluginId, chainId);

  let gaugeData = await context.Gauge.get(gaugeId);

  await context.Gauge.set({
    ...gaugeData,
    active: false,
  });
}

export const activateGauge = async (
  chainId: Number,
  pluginId: String,
  gauge: String,
  context: Context,
) => {
  const gaugeId = buildGaugeId(gauge, pluginId, chainId);

  let gaugeData = await context.Gauge.get(gaugeId);

  await context.Gauge.set({
    ...gaugeData,
    active: true,
  });
}


export const addUniqueStaker = async (
  chainId: Number,
  srcAddress: String,
  staker: String,
  tokenId: BigInt,
  context: Context,
) => {
  const stakerKey = buildStakerId(srcAddress, staker, chainId);
  const stakerContractId = buildContractId(chainId, srcAddress);

  let stakerData = await context.StakerRegistry.get(stakerKey);

  if (!stakerData) {
    await context.StakerRegistry.set({
      id: stakerKey,
      address: staker,
      votingEscrow_id: stakerContractId,
      tokenIds: [tokenId],
    });
  } else {
    await context.StakerRegistry.set({
      id: stakerKey,
      address: staker,
      votingEscrow_id: stakerContractId,
      tokenIds: [...stakerData.tokenIds, tokenId],
    });
  }
};

export const addUniqueVoter = async (
  chainId: Number,
  srcAddress: String,
  voter: String,
  context: Context,
) => {
  const voterKey = buildVoterId(srcAddress, voter, chainId);
  const voterContractId = buildContractId(chainId, srcAddress);

  let voterData = await context.VoterRegistry.get(voterKey);

  if (!voterData) {
    await context.VoterRegistry.set({
      id: voterKey,
      address: voter,
      gaugeVoter_id: voterContractId,
    });
  }
};

export const updateDepositDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  lockedAmount: BigInt,
  timestamp: number,
  context: Context,
) => {
  const dayID = getDayId(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = aggregatedDataId(srcAddress, timestamp, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let locksData = await context.EscrowDepositDailyMetrics.get(aggregatedDataID);

  if (!locksData) {
    await context.EscrowDepositDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalLocked: lockedAmount,
      amountOfLocks: BigInt(1),
    });
  } else {
    await context.EscrowDepositDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalLocked: locksData.totalLocked + lockedAmount,
      amountOfLocks: locksData.amountOfLocks + BigInt(1),
    });
  }
};
export const updateWithdrawalDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  value: BigInt,
  timestamp: number,
  context: Context,
) => {
  const dayID = getDayId(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = aggregatedDataId(srcAddress, timestamp, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let locksData =
    await context.EscrowWithdrawDailyMetrics.get(aggregatedDataID);

  if (!locksData) {
    await context.EscrowWithdrawDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalWithdraw: value,
      amountOfWithdrawals: BigInt(1),
    });
  } else {
    await context.EscrowWithdrawDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalWithdraw: locksData.totalWithdraw + value,
      amountOfWithdrawals: locksData.amountOfWithdrawals + BigInt(1),
    });
  }
};

export const updateEscrowDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  totalLocked: BigInt,
  timestamp: number,
  isLocking: boolean,
  context: Context,
) => {
  const dayID = getDayId(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = aggregatedDataId(srcAddress, timestamp, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let locksData = await context.EscrowDailyMetrics.get(aggregatedDataID);

  if (!locksData) {
    await context.EscrowDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? BigInt(1) : BigInt(0),
    });
  } else {
    await context.EscrowDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalLocked: totalLocked,
      amountOfLocks: isLocking
        ? locksData.amountOfLocks + BigInt(1)
        : locksData.amountOfLocks - BigInt(1),
    });
  }
};

export const updateEscrowLocksDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  staker: String,
  totalLocked: BigInt,
  timestamp: number,
  isLocking: boolean,
  context: Context,
) => {
  const dayID = getDayId(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = aggregatedDataId(srcAddress, timestamp, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let locksData = await context.EscrowLocksDailyMetrics.get(aggregatedDataID);

  const stakerKey = buildStakerId(srcAddress, staker, chainId);
  let stakerRecord = await context.StakerRegistry.get(stakerKey); // Assume StakerRegistry exists

  const amountActiveLocks = await stakerRecord.tokenIds.reduce(
    async (acc: number, tokenId: BigInt) => {
      const lock = await context.Deposit.get(
        buildDepositId(tokenId, srcAddress, chainId),
      );
      if (lock.active) {
        acc += 1;
      }
    },
    0,
  );

  const isNewHolder =
    isLocking && stakerRecord.tokenIds.length === 1 ? true : false;

  let activeHolder = 0;

  // If isNewHolder --> +1
  // If Depositing
  // --> If amountActiveLocks === 1 --> +1
  // --> Else --> +0
  // If Withdrawing
  // --> If amountActiveLocks > 0 --> 0
  // --> Esle --> -1
  if (isNewHolder) activeHolder += 1;
  else {
    if (isLocking) {
      if (amountActiveLocks === 1) activeHolder = 1;
      else activeHolder = 0;
    } else {
      if (amountActiveLocks > 0) activeHolder = 0;
      else activeHolder = -1;
    }
  }

  if (!locksData) {
    await context.EscrowLocksDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? 1 : 0,
      totalHolders: isNewHolder ? 1 : 0,
      activeHolders: activeHolder,
    });
  } else {
    await context.EscrowLocksDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: contractId,
      totalLocked: totalLocked,
      amountOfLocks: isLocking
        ? locksData.amountOfLocks + 1
        : locksData.amountOfLocks - 1,
      totalHolders: isNewHolder
        ? locksData.totalHolders + 1
        : locksData.totalHolders,
      activeHolders: locksData.activeHolders + activeHolder,
    });
  }
};


export const updateEscrowLocksMetrics = async (
  chainId: Number,
  srcAddress: String,
  staker: String,
  totalLocked: BigInt,
  isLocking: boolean,
  context: Context,
) => {
  const contractId = buildContractId(chainId, srcAddress);

  let locksData = await context.EscrowLocksMetrics.get(contractId);

  const stakerKey = buildStakerId(srcAddress, staker, chainId);
  let stakerRecord = await context.StakerRegistry.get(stakerKey); // Assume StakerRegistry exists

  const amountActiveLocks = await stakerRecord.tokenIds.reduce(
    async (acc: number, tokenId: BigInt) => {
      const lock = await context.Deposit.get(
        buildDepositId(tokenId, srcAddress, chainId),
      );
      if (lock.active) {
        acc += 1;
      }
    },
    0,
  );

  const isNewHolder =
    isLocking && stakerRecord.tokenIds.length === 1 ? true : false;

  let activeHolder = 0;

  // If isNewHolder --> +1
  // If Depositing
  // --> If amountActiveLocks === 1 --> +1
  // --> Else --> +0
  // If Withdrawing
  // --> If amountActiveLocks > 0 --> 0
  // --> Esle --> -1
  if (isNewHolder) activeHolder += 1;
  else {
    if (isLocking) {
      if (amountActiveLocks === 1) activeHolder = 1;
      else activeHolder = 0;
    } else {
      if (amountActiveLocks > 0) activeHolder = 0;
      else activeHolder = -1;
    }
  }

  if (!locksData) {
    await context.EscrowLocksMetrics.set({
      id: contractId,
      contract_id: contractId,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? 1 : 0,
      totalHolders: isNewHolder ? 1 : 0,
      activeHolders: activeHolder,
    });
  } else {
    await context.EscrowLocksMetrics.set({
      id: contractId,
      contract_id: contractId,
      totalLocked: totalLocked,
      amountOfLocks: isLocking
        ? locksData.amountOfLocks + 1
        : locksData.amountOfLocks - 1,
      totalHolders: isNewHolder
        ? locksData.totalHolders + 1
        : locksData.totalHolders,
      activeHolders: locksData.activeHolders + activeHolder,
    });
  }
};

export const updateVotingMetrics = async (
  chainId: Number,
  srcAddress: String,
  gauge: String,
  voter: String,
  epoch: BigInt,
  votingPower: BigInt,
  totalVotingPowerInGauge: BigInt,
  totalVotingPowerInContract: BigInt,
  timestamp: number,
  isNewVote: boolean, // true for new votes, false for resets
  context: Context,
) => {
  const dayId = getDayId(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayId);

  // Update gauge daily metrics
  await updateGaugeDailyMetrics(
    chainId,
    srcAddress,
    gauge,
    voter,
    votingPower,
    totalVotingPowerInGauge,
    dayId,
    dayStartTimestamp,
    isNewVote,
    context,
  );

  // Update contract-wide daily metrics
  await updateGaugePluginDailyMetrics(
    chainId,
    srcAddress,
    votingPower,
    dayId,
    dayStartTimestamp,
    isNewVote,
    context,
  );

  // Update all-time metrics
  await updateAllTimeMetrics(
    chainId,
    srcAddress,
    voter,
    votingPower,
    timestamp,
    isNewVote,
    context,
  );

  await updateEpochGaugeVoterVotesMetrics(
    chainId,
    srcAddress,
    gauge,
    voter,
    epoch,
    votingPower,
    timestamp,
    isNewVote,
    context,
  )
};

// Helper to update metrics for a specific gauge for a specific day
const updateGaugeDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  gauge: String,
  voter: String,
  votingPower: BigInt,
  totalVotingPowerInGauge: BigInt,
  dayId: number,
  dayTimestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const gaugeMetricsId = buildDailyMetrictsId(gauge, srcAddress, dayTimestamp, chainId);
  const contractMetricsId = aggregatedDataId(srcAddress, dayTimestamp, chainId);
  const contractId = buildContractId(chainId, srcAddress);
  const gaugeId = buildGaugeId(gauge, srcAddress, chainId);

  let gaugeMetrics = await context.GaugeDailyVotingMetrics.get(gaugeMetricsId);

  // Track if this voter has already voted for this gauge today
  // In a real implementation, you would need a more sophisticated approach
  // to track unique voters per gauge per day
  const voterChangeCount = isNewVote ? BigInt(1) : BigInt(-1);
  if (!gaugeMetrics) {
    await context.GaugeDailyVotingMetrics.set({
      id: gaugeMetricsId,
      date: dayTimestamp,
      gauge_id: gaugeId,
      contract_id: contractId,
      totalVotingPowerChange: isNewVote ? BigInt(votingPower.toString()) : -BigInt(votingPower.toString()),
      totalVotingPowerInGauge: totalVotingPowerInGauge,
      voterCount: isNewVote ? BigInt(1) : BigInt(0),
      gaugePlugin_id: contractMetricsId,
    });
  } else {
    // Update existing metrics
    const newVotingPower = isNewVote
      ? BigInt(gaugeMetrics.totalVotingPowerChange) + BigInt(votingPower.toString())
      : BigInt(gaugeMetrics.totalVotingPowerChange) - BigInt(votingPower.toString());

    const newVoterCount = gaugeMetrics.voterCount + voterChangeCount;

    await context.GaugeDailyVotingMetrics.set({
      id: gaugeMetricsId,
      date: dayTimestamp,
      gauge_id: gaugeId,
      contract_id: contractId,
      totalVotingPowerChange: newVotingPower,
      totalVotingPowerInGauge: totalVotingPowerInGauge,
      voterCount: newVoterCount < BigInt(0) ? BigInt(0) : newVoterCount,
      gaugePlugin_id: contractMetricsId,
    });
  }
};

// Helper to update contract-wide metrics for a specific day
const updateGaugePluginDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  votingPower: BigInt,
  dayId: number,
  dayTimestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const contractMetricsId = aggregatedDataId(srcAddress, dayTimestamp, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let contractMetrics =
    await context.GaugePluginDailyVotingMetrics.get(contractMetricsId);

  // Calculate the voting power change
  const votingPowerChange = isNewVote ? votingPower : -votingPower;

  if (!contractMetrics) {
    // First metrics for this day
    await context.GaugePluginDailyVotingMetrics.set({
      id: contractMetricsId,
      date: dayTimestamp,
      contract_id: contractId,
      totalVotingPowerChange: votingPowerChange,
      votesCount: BigInt(1),
    });
  } else {
    // Update existing metrics
    const newTotalVotingPowerChange =
      contractMetrics.totalVotingPowerChange + votingPowerChange;

    // For accurate voter counts, you'd need a separate tracking mechanism
    // This is a simplified approximation
    const voterCountChange = isNewVote ? BigInt(1) : BigInt(0);

    await context.GaugePluginDailyVotingMetrics.set({
      id: contractMetricsId,
      date: dayTimestamp,
      contract_id: contractId,
      totalVotingPowerChange: newTotalVotingPowerChange,
      votesCount: contractMetrics.votesCount + voterCountChange,
    });
  }
};

const updateEpochGaugeVoterVotesMetrics = async (
  chainId: Number,
  srcAddress: String,
  gauge: String,
  voter: String,
  epoch: BigInt,
  votingPower: BigInt,
  timestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const metricsId = buildVoterMetrictsId(voter, gauge, srcAddress, chainId);
  const gaugeId = buildGaugeId(gauge, srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let votesMetrics = await context.EpochGaugeVoterVotes.get(metricsId);

  if (!votesMetrics) {
    votesMetrics = {
      votingPower: BigInt(0),
    }
  }

  let newVotingPower = isNewVote ? votesMetrics.votingPower + BigInt(votingPower.toString()) : votesMetrics.votingPower - BigInt(votingPower.toString());

  await context.EpochGaugeVoterVotes.set({
    id: metricsId,
    epoch: epoch,
    gauge_id: gaugeId,
    contract_id: contractId,
    voter: voter,
    votingPower: newVotingPower,
    timestamp: timestamp,
  });
};

/*
const updateEpochGaugeVoterVotesMetrics = async (
  chainId: Number,
  srcAddress: String,
  gauge: String,
  voter: String,
  epoch: BigInt,
  votingPower: BigInt,
  timestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const metricsId = buildVoterMetrictsId(voter, gauge, srcAddress, chainId);
  const gaugeId = buildGaugeId(gauge, srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  context.EpochGaugeVoterVotes.set({
    id: metricsId,
    epoch: epoch,
    gauge_id: gaugeId,
    contract_id: contractId,
    voter: voter,
    votingPower: isNewVote ? votingPower : BigInt(0),
    timestamp: timestamp,
  });
};
*/

// Helper to update all-time metrics
const updateAllTimeMetrics = async (
  chainId: Number,
  srcAddress: String,
  voter: String,
  votingPower: BigInt,
  timestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const metricsId = buildAllTimeMetrictsId(srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let metrics = await context.GaugePluginVotingMetrics.get(metricsId);

  // Store a record of whether this voter has voted before to accurately track unique voters
  const voterKey = buildVoterId(srcAddress, voter, chainId);
  let voterRecord = await context.VoterRegistry.get(voterKey); // Assume VoterRegistry exists

  let isNewVoter = false;
  if (!voterRecord) {
    await addUniqueVoter(chainId, srcAddress, voter, context);
    isNewVoter = true;
  }

  if (!metrics) {
    await context.GaugePluginVotingMetrics.set({
      id: metricsId,
      contract_id: contractId,
      allTimeVotingPower: isNewVote ? votingPower : BigInt(0),
      allTimeVoterCount: isNewVoter ? BigInt(1) : BigInt(0),
      allTimeVotesCount: isNewVote ? BigInt(1) : BigInt(0),
      lastUpdated: timestamp,
    });
  } else {
    // Update existing metrics
    const newVotingPower = isNewVote
      ? metrics.allTimeVotingPower + votingPower
      : metrics.allTimeVotingPower;

    const newVoterCount = isNewVoter
      ? metrics.allTimeVoterCount + BigInt(1)
      : metrics.allTimeVoterCount;

    const newVotesCount = isNewVote
      ? metrics.allTimeVotesCount + BigInt(1)
      : metrics.allTimeVotesCount;

    await context.GaugePluginVotingMetrics.set({
      id: metricsId,
      contract_id: contractId,
      allTimeVotingPower: newVotingPower,
      allTimeVoterCount: newVoterCount,
      allTimeVotesCount: newVotesCount,
      lastUpdated: timestamp,
    });
  }
};
