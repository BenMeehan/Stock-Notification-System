const verifyToken = require("../middleware/jwt");
const express = require("express");
const { Subscription, Client } = require("../models/Subscription");

const webpush = require("web-push");

const router = express.Router();

const publicKey =
  "BIxUdWmmMbmf8EVdQGFO4ZCg31Gm0EUb_LLlf_CEeE16kh6VFQPk9tIJEGNUiLazUb5NjYOQNhnKtM-cpgv7_G0";
const privateKey = "JAh3VcfI0IzlOErQmbt-6VVZCMZk1oGE5Tb8bkmEmsY";

webpush.setVapidDetails("mailto:your@email.com", publicKey, privateKey);

router.post("/subscriptions", verifyToken, async (req, res) => {
  try {
    const { symbol, targetPrice, priceDirection } = req.body;
    const userId = req.userId;

    const subscription = await Subscription.create({
      userid: userId,
      symbol: symbol,
      target: targetPrice,
      direction: priceDirection,
    });

    return res.status(201).json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/subscribe", async (req, res) => {
  const { subscription, clientId } = req.body;
  console.log(clientId);
  try {
    await Client.upsert({
      clientId,
      subscription,
    });

    res.status(201).json({ message: "Subscription added successfully" });
  } catch (error) {
    console.error("Error storing subscription:", error);
    res.status(500).json({ error: "Error storing subscription" });
  }
});

module.exports = router;
