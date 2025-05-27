import { getDayId } from "./timeHelpers";

export const buildContractId = (chainId: Number, address: String) => {
  return `${chainId}-${address}`;
}

export const buildProxyContractId = (chainId: Number, address: String, implementation: String) => {
  return `${chainId}-${address}-${implementation}`;
}

export const buildGaugeId = (gauge: String, gaugePlugin: String, chainId: Number) => {
  return `${gauge}-${gaugePlugin}-${chainId}`;
}

export const buildGaugePluginId = (gaugePlugin: String, chainId: Number) => {
  return `${chainId}-${gaugePlugin}`;
}

export const buildStakerId = (gaugePlugin: String, staker: String, chainId: Number) => {
  return `${gaugePlugin}-${staker}-${chainId}`;
}

export const buildVoterId = (gaugePlugin: String, voter: String, chainId: Number) => {
  return `${gaugePlugin}-${voter}-${chainId}`;
}

export const aggregatedDataId = (address: String, timestamp: number, chainId: Number,) => {
  const dayId = getDayId(timestamp);
  return `${address}-${dayId}-${chainId}`;
}

export const buildDepositId = (tokenId: BigInt, srcAddress: String, chainId: Number) => {
  return `${tokenId}-${srcAddress}-${chainId}`;
}

export const buildAllTimeMetrictsId = (address: String, chainId: Number) => {
  return `${address}-${chainId}`;
}

export const buildDailyMetrictsId = (gauge: String, gaugePlugin: String, timestamp: number, chainId: Number) => {
  const dayId = getDayId(timestamp);
  return `${gauge}-${gaugePlugin}-${dayId}-${chainId}`;
}

export const buildVoterMetrictsId = (voter: String, gauge: String, gaugePlugin: String, chainId: Number) => {
  return `${voter}-${gauge}-${gaugePlugin}-${chainId}`;
}