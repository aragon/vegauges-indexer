import { getGeneratedByChainId } from "../../generated/src/ConfigYAML.gen";

export function getVotingEscrowIncreasingAddresses(chainId: number): string[] {
  const config = getGeneratedByChainId(chainId);

  if (!config || !config.contracts) {
    return [];
  }

  const votingEscrowContract = Object.values(config.contracts).find(
    (contract) => contract.name === "VotingEscrowIncreasing",
  );

  if (!votingEscrowContract || !votingEscrowContract.addresses) {
    return [];
  }

  return votingEscrowContract.addresses.map((address) => address.toLowerCase());
}

export function isVotingEscrowIncreasing(
  chainId: number,
  contract: string,
): boolean {
  const addresses = getVotingEscrowIncreasingAddresses(chainId);

  return addresses.includes(contract.toLowerCase());
}
