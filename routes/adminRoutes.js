const express = require("express");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");

const router = express.Router();

// 🚀 API to Fetch Pending Users
router.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find({}, "username"); // Fetch only usernames
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🚀 API to Approve a User
router.post("/approve-user", async (req, res) => {
  try {
    const { username, role } = req.body;

    console.log("Request body:", req.body); // Debugging

    if (!username || !role) {
      return res.status(400).json({ message: "Username and role are required" });
    }

    // Find and remove user from PendingUsers
    const pendingUser = await PendingUser.findOneAndDelete({ username });
    console.log("Pending user found:", pendingUser); // Debugging

    if (!pendingUser) {
      return res.status(404).json({ message: "User not found in pending requests" });
    }

    // Move user to Users collection
    const newUser = new User({
      username: pendingUser.username,
      password: pendingUser.password,
      role,
    });

    console.log("New user to be saved:", newUser); // Debugging

    await newUser.save();

    res.status(200).json({ message: "User approved and moved to users collection" });
  } catch (error) {
    console.error("Approval error:", error); // Debugging
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;