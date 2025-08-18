import { Context } from "vm";
import {
  buildContractId,
  buildGaugeId,
  buildVoterId,
  aggregatedDataId,
  buildAllTimeMetrictsId,
  buildDailyMetrictsId,
  buildEpochVoterMetrictsId,
  buildVoterMetrictsId,
} from "../utils/idBuilder";
import { getDayId, getDayStartTimestamp } from "../utils/timeHelpers";

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

  await updateEpochGaugeVoterMetrics(
    chainId,
    srcAddress,
    gauge,
    voter,
    epoch,
    votingPower,
    timestamp,
    isNewVote,
    context,
  );

  await updateCurrentGaugeVoterMetrics(
    chainId,
    srcAddress,
    gauge,
    voter,
    epoch,
    votingPower,
    timestamp,
    isNewVote,
    context,
  );
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
  const gaugeMetricsId = buildDailyMetrictsId(
    gauge,
    srcAddress,
    dayTimestamp,
    chainId,
  );
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
      totalVotingPowerChange: isNewVote
        ? BigInt(votingPower.toString())
        : -BigInt(votingPower.toString()),
      totalVotingPowerInGauge: totalVotingPowerInGauge,
      voterCount: isNewVote ? BigInt(1) : BigInt(0),
      gaugePlugin_id: contractMetricsId,
    });
  } else {
    // Update existing metrics
    const newVotingPower = isNewVote
      ? BigInt(gaugeMetrics.totalVotingPowerChange) +
        BigInt(votingPower.toString())
      : BigInt(gaugeMetrics.totalVotingPowerChange) -
        BigInt(votingPower.toString());

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

const updateCurrentGaugeVoterMetrics = async (
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

  let votesMetrics = await context.CurrentGaugeVoterVotes.get(metricsId);

  if (!votesMetrics) {
    votesMetrics = {
      votingPower: BigInt(0),
    };
  }

  let newVotingPower = isNewVote
    ? votesMetrics.votingPower + BigInt(votingPower.toString())
    : votesMetrics.votingPower - BigInt(votingPower.toString());

  await context.CurrentGaugeVoterVotes.set({
    id: metricsId,
    epoch: epoch,
    gauge_id: gaugeId,
    contract_id: contractId,
    voter: voter,
    votingPower: newVotingPower,
    timestamp: timestamp,
  });
};

const updateEpochGaugeVoterMetrics = async (
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
  let logVoter = false;
  if (
    voter === "0x11f30e28966ab642586a0150123cdb63ec60128b" ||
    voter === "0x11f30e28966Ab642586A0150123cDb63EC60128B"
  ) {
    logVoter = true;
  }

  const metricsId = buildEpochVoterMetrictsId(
    epoch,
    voter,
    gauge,
    srcAddress,
    chainId,
  );
  const gaugeId = buildGaugeId(gauge, srcAddress, chainId);
  const contractId = buildContractId(chainId, srcAddress);

  let votesMetrics = await context.EpochGaugeVoterVotes.get(metricsId);

  if (!votesMetrics) {
    if (logVoter) {
      context.log.info(`No votesMetrics for ${voter}`);
    }
    let currentMetricsId = buildVoterMetrictsId(
      voter,
      gauge,
      srcAddress,
      chainId,
    );
    let currentVp = await context.CurrentGaugeVoterVotes.get(currentMetricsId);
    if (!currentVp) {
      if (logVoter) {
        context.log.info(`No currentVp for ${voter}`);
      }
      currentVp = {
        votingPower: BigInt(0),
      };
    }
    votesMetrics = {
      votingPower: currentVp.votingPower,
    };
  }

  let newVotingPower = isNewVote
    ? votesMetrics.votingPower + BigInt(votingPower.toString())
    : votesMetrics.votingPower - BigInt(votingPower.toString());

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
