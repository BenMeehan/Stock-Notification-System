const amqp = require("amqplib");
const { Subscription, Client } = require("../models/Subscription");
const webpush = require("web-push");

const rabbitMqUrl = process.env.RABBITMQ;

let rabbitMqConnection;
let rabbitMqChannel;

// connect to the rabbit MQ broker
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

// Subscribe to messages async and push them to client
async function consumeRabbitMQ() {
  if (!rabbitMqConnection || !rabbitMqChannel) {
    await connectToRabbitMQ();
  }
  try {
    if (!rabbitMqConnection || !rabbitMqChannel) {
      await connectToRabbitMQ();
    }

    const symbols = ["AAPL", "GOOGL", "TSLA"];

    for (const symbol of symbols) {
      const queue = await rabbitMqChannel.assertQueue(`stock.${symbol}`);
      rabbitMqChannel.bindQueue(queue.queue, "stock-prices", `stock.${symbol}`);

      // Consume from queue
      rabbitMqChannel.consume(
        queue.queue,
        async (message) => {
          const payload = JSON.parse(message.content.toString());

          // Find all alert subscriptions for a stock
          const alerts = await Subscription.findAll({
            where: {
              symbol,
            },
          });
          // const alerts = [];
          for (const alert of alerts) {
            const clientId = alert.userid;

            let notificationMessage = {
              title: "Push Notification",
              body: "",
            };

            // Every subscription must be higher, lower or equal to current price
            let dir = alert.dataValues.direction;
            let target = alert.dataValues.target;
            if (dir == "lower" && payload.price < target) {
              notificationMessage.body = `${payload.symbol} fell below target price of $${target}`;
            } else if (dir == "higher" && payload.price > target) {
              notificationMessage.body = `${payload.symbol} went above target price of $${target}`;
            } else if (dir == "equal" && payload.price == target) {
              notificationMessage.body = `${payload.symbol} is equal to target price of $${target}`;
            } else {
              continue;
            }

            // get the client subscription info. (Redis will be more performant here but avoiding due to cost)
            const clientRecord = await Client.findOne({
              where: { clientId },
            });

            if (clientRecord) {
              const client = clientRecord.subscription;

              // push to the client
              webpush
                .sendNotification(client, JSON.stringify(notificationMessage))
                .then(() => console.log("Push notification sent successfully"))
                .catch((error) => {
                  console.error("Error sending push notification:", error);
                  throw error;
                });
            }
          }
        },
        { noAck: true }
      );
    }
  } catch (error) {
    console.error("Error subscribing to stock prices:", error);
  }
}

module.exports = consumeRabbitMQ;
