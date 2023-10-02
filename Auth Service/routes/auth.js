const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const JWT_SECRET = process.env.SECRET_KEY;

const router = express.Router();

// Route to register a new user
// POST
//  username: string
//  password: string
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Route to login for an existing user
// POST
//  username: string
//  password: string
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Login failed" });
    }

    // create and send an new jwt token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1000h",
    });

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: true,
    });

    res.json({ message: "Login successful", token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
