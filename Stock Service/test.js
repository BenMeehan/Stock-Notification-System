require("dotenv").config();

const { fetchAndPublishStockPrices } = require("./index.js");
const { WS } = require("jest-websocket-mock");

const port = process.env.PORT;

describe("fetchAndPublishStockPrices", () => {
  let server;

  beforeEach(() => {
    server = new WS(`ws://localhost:${port}`);
  });

  afterEach(() => {
    server.close();
    jest.clearAllMocks();
  });

  it("should fetch and publish stock prices", async () => {
    // Mock amqpChannel
    const mockAmqpConnection = {
      createChannel: jest.fn().mockResolvedValue({
        assertExchange: jest.fn(),
        publish: jest.fn(),
      }),
    };

    jest.mock("amqplib", () => {
      return {
        connect: jest.fn().mockResolvedValue(mockAmqpConnection),
      };
    });

    await fetchAndPublishStockPrices();

    // Assertions
    expect(mockAmqpConnection.createChannel).toHaveBeenCalled();
    expect(
      mockAmqpConnection.createChannel().assertExchange
    ).toHaveBeenCalled();
    expect(mockAmqpConnection.createChannel().publish).toHaveBeenCalled();
  });
});
