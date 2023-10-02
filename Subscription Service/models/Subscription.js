const Sequelize = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

sequelize.sync();

const Subscription = sequelize.define(
  "Subscription",
  {
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
  },
  {
    uniqueKeys: {
      unique_userid_symbol_target_direction: {
        fields: ["userid", "symbol", "target", "direction"],
      },
    },
  }
);

const Client = sequelize.define("WebSocketConnection", {
  clientId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subscription: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
});

exports.Subscription = Subscription;
exports.Client = Client;
