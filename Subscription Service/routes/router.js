const verifyToken = require("../middleware/jwt");
const express = require("express");
const { Subscription, Client } = require("../models/Subscription");
require("dotenv").config();

const webpush = require("web-push");

const router = express.Router();

// VAPID details
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:your@email.com", publicKey, privateKey);

// Subscribe to a specific stock price alert
// POST
//  symbol: string (Stock exchange code)
//  target: int (the target price)
//  direction: string (alert when higher or lower or equal to target)
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

// Add a new client for push notifications
// POST
//  subscription: JSON
//  clientId: string
router.post("/client", async (req, res) => {
  const { subscription, clientId } = req.body;
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

router.delete("/unsubscribe/:subscriptionId", verifyToken, async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const userId = req.userId;

    // Check if the subscription belongs to the current user
    const subscription = await Subscription.findOne({
      where: {
        id: subscriptionId,
        userid: userId,
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Delete the subscription
    await Subscription.destroy({
      where: {
        id: subscriptionId,
      },
    });
    return res.status(200).json({ message: "Subscription unsubscribed" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/subscriptions", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptions = await Subscription.findAll({
      where: {
        userid: userId,
      },
    });

    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
