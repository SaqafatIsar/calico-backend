const express = require("express");
const mongoose = require("mongoose");
const PendingUser = require("../models/PendingUser"); // Ensure this model exists

const router = express.Router();

// Get All Pending Users
router.get("/", async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find({}, "username createdAt"); // Changed from email to username
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: "Error fetching pending users" });
  }
});

// Delete a Pending User
router.delete("/delete-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Deleting user with ID:", userId); // Debugging line

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const deletedUser = await PendingUser.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;