const express = require("express");
const cors = require("cors");
const subRouter = require("./routes/router");
const consumeRabbitMQ = require("./utils/rabbitmq");
const bodyParser = require("body-parser");
const port = 3002;
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use("/sub", subRouter);

consumeRabbitMQ();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
