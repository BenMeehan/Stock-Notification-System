const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const subRouter = require("./routes/router");
const consumeRabbitMQ = require("./utils/rabbitmq");

const port = process.env.PORT || 3002;
const app = express();

// use middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use("/sub", subRouter);

consumeRabbitMQ();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
