const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

sequelize.sync();

const User = sequelize.define("User", {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Hash the password before saving to the database
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
