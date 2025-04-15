const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User"); // Approved users collection
const PendingUser = require("../models/PendingUser"); // Pending users collection

dotenv.config(); // Load environment variables

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "fallbackSecret"; // Use env variable for security

// 🚀 Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body; // Only username and password are required

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Normalize username (trim & lowercase)
    const normalizedUsername = username.trim().toLowerCase();

    // Check if user already exists in Users collection
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Check if user is already in the PendingUsers collection
    const pendingUser = await PendingUser.findOne({ username: normalizedUsername });
    if (pendingUser) {
      return res.status(409).json({ message: "Signup request already pending approval" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in PendingUsers collection
    const newPendingUser = new PendingUser({
      username: normalizedUsername, // Only username and password are saved
      password: hashedPassword,
    });

    await newPendingUser.save();
    console.log(`User ${normalizedUsername} moved to PendingUsers collection`);

    res.status(201).json({
      message: "Signup successful. Waiting for admin approval.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🚀 Login Route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // Only username and password are required

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Normalize username (trim & lowercase)
    const normalizedUsername = username.trim().toLowerCase();

    // Check if the user exists in the 'users' collection
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access. Please contact the admin." });
    }

    console.log("User Found in DB:", user); // Debugging

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch); // Debugging

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, // Only username and role are included
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("Generated JWT Token:", token); // Debugging

    res.status(200).json({
      message: "Login successful",
      token,
      user: { username: user.username, role: user.role }, // Only username and role are returned
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;