const amqp = require("amqplib");
const { Subscription, Client } = require("../models/Subscription");
const webpush = require("web-push");

const rabbitMqUrl =
  "amqps://bonmawmv:MuGYzHoeKsiKvWvjk2X8duwZdUck1laP@lionfish.rmq.cloudamqp.com/bonmawmv";

let rabbitMqConnection;
let rabbitMqChannel;

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

      rabbitMqChannel.consume(
        queue.queue,
        async (message) => {
          const payload = JSON.parse(message.content.toString());
          const alerts = await Subscription.findAll({
            where: {
              symbol,
            },
          });
          for (const alert of alerts) {
            const clientId = alert.userid;

            let notificationMessage = {
              title: "Push Notification",
              body: "",
            };

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

            const clientRecord = await Client.findOne({
              where: { clientId },
            });

            if (!clientRecord) {
              throw new Error("Client not found");
            }

            const client = clientRecord.subscription;

            webpush
              .sendNotification(client, JSON.stringify(notificationMessage))
              .then(() => console.log("Push notification sent successfully"))
              .catch((error) => {
                console.error("Error sending push notification:", error);
                throw error;
              });
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
