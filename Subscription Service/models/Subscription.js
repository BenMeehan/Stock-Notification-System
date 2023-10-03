const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "subscriptions",
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_URL,
    dialect: "postgres",
    port: 5432,
    logging: true,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const Client = sequelize.define("WebSocketConnection", {
  clientId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  subscription: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
});

const Subscription = sequelize.define("Subscription", {
  userid: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  symbol: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  target: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  direction: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

sequelize.sync();

exports.Subscription = Subscription;
exports.Client = Client;
