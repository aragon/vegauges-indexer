import assert from "assert";
import { TestHelpers } from "envio";
const { MockDb, SimpleGaugeVoter } = TestHelpers;

import voteEvents from "./fixtures/Votes.json";
import resetEvents from "./fixtures/Resets.json";

describe("SimpleGaugeVoter contract Vote/Reset events tests", () => {
  // Create mock db
  let mockDb = MockDb.createMockDb();
  const chainId = 34443;
  const srcAddress = "0x71439Ae82068E19ea90e4F506c74936aE170Cf58";

  // Creating mock for SimpleGaugeVoter contract Reset event
  const resetLogs = resetEvents.map((resetEvent, i) =>
    SimpleGaugeVoter.Reset.createMockEvent({
      voter: resetEvent.voter,
      gauge: resetEvent.gauge,
      epoch: BigInt(resetEvent.epoch),
      tokenId: BigInt(resetEvent.tokenId),
      votingPowerRemovedFromGauge: BigInt(
        resetEvent.votingPowerRemovedFromGauge,
      ),
      totalVotingPowerInGauge: BigInt(resetEvent.totalVotingPowerInGauge),
      totalVotingPowerInContract: BigInt(resetEvent.totalVotingPowerInContract),
      timestamp: BigInt(resetEvent.timestamp),
      mockEventData: {
        chainId,
        srcAddress,
        logIndex: 1,
        block: {
          number: 17290000 + i,
        },
      },
    }),
  );

  // Creating mock for SimpleGaugeVoter contract Vote event
  const voteLogs = voteEvents.map((voteEvent, i) =>
    SimpleGaugeVoter.Voted.createMockEvent({
      voter: voteEvent.voter,
      gauge: voteEvent.gauge,
      epoch: BigInt(voteEvent.epoch),
      tokenId: BigInt(voteEvent.tokenId),
      votingPowerCastForGauge: BigInt(voteEvent.votingPowerCastForGauge),
      totalVotingPowerInGauge: BigInt(voteEvent.totalVotingPowerInGauge),
      totalVotingPowerInContract: BigInt(voteEvent.totalVotingPowerInContract),
      timestamp: BigInt(voteEvent.timestamp),
      mockEventData: {
        chainId,
        srcAddress,
        logIndex: 1,
        block: {
          number: 17290000,
        },
      },
    }),
  );

  it("SimpleGaugeVoter aggregates the votes and reset correctly", async () => {
    // Processing the events
    for (const resetLog of resetLogs) {
      mockDb = await SimpleGaugeVoter.Reset.processEvent({
        event: resetLog,
        mockDb,
      });
    }

    for (const voteLog of voteLogs) {
      mockDb = await SimpleGaugeVoter.Voted.processEvent({
        event: voteLog,
        mockDb,
      });
    }

    let gaugeDailyVotingMetrics = mockDb.entities.GaugeDailyVotingMetrics.get(
      `0xd2d87c07c512Dc2351EeD3df77Ce04A73674C5f2-${srcAddress}-20020-${chainId}`,
    );

    let resetVp = resetEvents.reduce(
      (acc, resetEvent) => acc + BigInt(resetEvent.votingPowerRemovedFromGauge),
      BigInt(0),
    );
    let voteVp = voteEvents.reduce(
      (acc, voteEvent) => acc + BigInt(voteEvent.votingPowerCastForGauge),
      BigInt(0),
    );

    //console.log("gaugeDailyVotingMetrics:" + JSON.stringify(gaugeDailyVotingMetrics, (_, v) => typeof v === 'bigint' ? v.toString() : v));

    assert.equal(
      gaugeDailyVotingMetrics?.totalVotingPowerChange,
      voteVp - resetVp,
      "totalVotingPowerChange should be the same as the sum of votes and reset events",
    );
    assert.equal(
      gaugeDailyVotingMetrics?.totalVotingPowerChange,
      gaugeDailyVotingMetrics?.totalVotingPowerInGauge,
      "totalVotingPowerChange should be the same as totalVotingPowerInGauge",
    );
  });
});
