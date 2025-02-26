import assert from "assert";
import { 
  TestHelpers,
  SimpleGaugeVoter_AdminChanged
} from "generated";
const { MockDb, SimpleGaugeVoter } = TestHelpers;

describe("SimpleGaugeVoter contract AdminChanged event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for SimpleGaugeVoter contract AdminChanged event
  const event = SimpleGaugeVoter.AdminChanged.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("SimpleGaugeVoter_AdminChanged is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await SimpleGaugeVoter.AdminChanged.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualSimpleGaugeVoterAdminChanged = mockDbUpdated.entities.SimpleGaugeVoter_AdminChanged.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedSimpleGaugeVoterAdminChanged: SimpleGaugeVoter_AdminChanged = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      previousAdmin: event.params.previousAdmin,
      newAdmin: event.params.newAdmin,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualSimpleGaugeVoterAdminChanged, expectedSimpleGaugeVoterAdminChanged, "Actual SimpleGaugeVoterAdminChanged should be the same as the expectedSimpleGaugeVoterAdminChanged");
  });
});
