const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Create user
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid username/password" });
    }

    // Check if user is already logged in on another device
    if (user.token) {
      return res
        .status(403)
        .json({ error: "You cannot login on another device." });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid username/password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Save token to DB to "lock" the session
    user.token = token;
    await user.save();

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
router.post("/logout", auth, async (req, res) => {
  try {
    // Clear the token in the DB to allow future logins
    req.user.token = null;
    await req.user.save();
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error during logout" });
  }
});

module.exports = router;
