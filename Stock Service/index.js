const amqp = require("amqplib");
const WebSocket = require("ws");
require("dotenv").config();

const rabbitMqUrl = process.env.RABBITMQ;

const wss = new WebSocket.Server({ port: process.env.PORT });

let rabbitMqConnection;
let rabbitMqChannel;

// Function to establish a connection to RabbitMQ
async function connectToRabbitMQ() {
  try {
    rabbitMqConnection = await amqp.connect(rabbitMqUrl);
    rabbitMqChannel = await rabbitMqConnection.createChannel();
    await rabbitMqChannel.assertExchange("stock-prices", "topic", {
      durable: false,
    });
    console.error("Connected to RabbitMQ");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
}

// Function to generate a random stock price - simulating an real world api for demo
function generateRandomStockPrice() {
  return (Math.random() * (200 - 100) + 100).toFixed(2);
}

// Function to send stock prices to connected clients
function sendStockPriceToClients(symbol, price) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ symbol, price }));
    }
  });
}

// Function to fetch and publish stock prices
async function fetchAndPublishStockPrices() {
  try {
    if (!rabbitMqConnection || !rabbitMqChannel) {
      await connectToRabbitMQ();
    }

    const symbols = ["AAPL", "GOOGL", "TSLA"];

    for (const symbol of symbols) {
      const latestPrice = generateRandomStockPrice();
      const payload = JSON.stringify({ symbol, price: latestPrice });

      rabbitMqChannel.publish(
        "stock-prices",
        `stock.${symbol}`,
        Buffer.from(payload)
      );

      console.log(`Published stock price for ${symbol}: ${latestPrice}`);

      // Send the stock price to connected WebSocket clients
      sendStockPriceToClients(symbol, latestPrice);
    }
    console.log("----------------------------------------\n");
  } catch (error) {
    console.error("Error fetching and publishing stock prices:", error);
  }
}

// WebSocket server event handler for new UI connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Connect to RabbitMQ when the script starts
connectToRabbitMQ().catch((error) => {
  console.error("Failed to connect to RabbitMQ:", error);
});

// Run the fetchAndPublishStockPrices function periodically (10 secs)
setInterval(fetchAndPublishStockPrices, 10 * 1000);
