const fs = require("fs");

const getEpochVotes = async (epoch: string, escrow: string) => {
  // Assuming the result of the GraphQL endpoint is stored in a variable called 'result'
  // You can use the 'fetch' function to make a POST request to the GraphQL endpoint
  //const response = await fetch('https://indexer.hyperindex.xyz/f347812/v1/graphql', {
  const response = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query EpochVotes($epoch: numeric!, $escrow: String!) {
        EpochGaugeVoterVotes(
          where: {contract: {address: {_eq: $escrow}}, epoch: {_lte: $epoch}}
          order_by: {timestamp: desc, voter: desc}
          distinct_on: voter
        ) {
          voter
          votingPower
        }
      }`,
      variables: {
        epoch,
        escrow,
      },
    }),
  });

  const result = await response.json();

  return result.data.EpochGaugeVoterVotes;
};

const removeZeroVotes = (votes: any[]) => {
  return votes.filter((vote) => vote.votingPower > 0);
};

const getVotesPerEpoch = async (
  startEpoch: number,
  endEpoch: number,
  escrow: string,
) => {
  const votesPerEpoch = [] as any[];
  for (let i = startEpoch; i <= endEpoch; i++) {
    const votes = await getEpochVotes(i.toString(), escrow);
    const filteredVotes = removeZeroVotes(votes);
    const sortedVotes = filteredVotes.sort(
      (a, b) => b.votingPower - a.votingPower,
    );
    console.log(`Epoch ${i}: ${sortedVotes.length} votes`);
    votesPerEpoch.push({ epoch: i, votes: sortedVotes });
  }
  return votesPerEpoch;
};

const writeToFile = (fileName: string, votesPerEpoch: any[]) => {
  fs.writeFileSync(fileName, JSON.stringify(votesPerEpoch, null, 2));
};

const writeCSV = (fileName: string, votesPerEpoch: any[]) => {
  const header = "epoch,voter,votingPower";
  const csv = votesPerEpoch
    .map((epoch) => {
      return epoch.votes
        .map((vote) => {
          return `${epoch.epoch},${vote.voter},${vote.votingPower}`;
        })
        .join("\n");
    })
    .join("\n");
  const data = `${header}\n${csv}`;
  fs.writeFileSync(fileName, data);
};

const currentEpoch = Math.floor(new Date().getTime() / 1000 / (86400 * 7 * 2));

console.log(`Current epoch: ${currentEpoch}`);

// BTP
//const bptResult = await getVotesPerEpoch(1430, currentEpoch, '0x2aA8A5C1Af4EA11A1f1F10f3b73cfB30419F77Fb');
//writeToFile('bpt-votes-per-epoch.json', bptResult);
//writeCSV('bpt-votes-per-epoch.csv', bptResult);

// MODE
//const modeResult = await getVotesPerEpoch(1430, currentEpoch, '0x71439Ae82068E19ea90e4F506c74936aE170Cf58');
//writeToFile('mode-votes-per-epoch.json', modeResult);
//writeCSV('mode-votes-per-epoch.csv', modeResult);

// BEDROCK
const bedrockResult = await getVotesPerEpoch(
  currentEpoch - 5,
  currentEpoch,
  "0xcee845c5db2d8595C6086401a79501c10bb97a0f",
);
writeToFile("bedrock-votes-per-epoch.json", bedrockResult);
writeCSV("bedrock-votes-per-epoch.csv", bedrockResult);

export {};
