const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// set up middlewares and routes
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
