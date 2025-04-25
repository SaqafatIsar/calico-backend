// const express = require("express");
// const mongoose = require("mongoose");
// const PendingUser = require("../models/PendingUser");
// const User = require("../models/User"); // Make sure to import User model
// const router = express.Router();
// // Add this additional route
// router.get("", async (req, res) => {
//   try {
//     const pendingUsers = await PendingUser.find({});
//     res.json(pendingUsers);
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });
// // Get All Pending Users
// router.get("/", async (req, res) => {
//   try {
//     const pendingUsers = await PendingUser.find({}, "username email createdAt"); // Include both username and email
//     res.json(pendingUsers);
//   } catch (error) {
//     console.error("Error fetching pending users:", error);
//     res.status(500).json({ error: "Error fetching pending users" });
//   }
// });

// // Approve and Move User to Main Collection
// router.post("/approve-user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { role } = req.body;

//     // Validate input
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid user ID" });
//     }
//     if (!role) {
//       return res.status(400).json({ error: "Role is required" });
//     }

//     // Find and remove from pending
//     const pendingUser = await PendingUser.findByIdAndDelete(userId);
//     if (!pendingUser) {
//       return res.status(404).json({ error: "Pending user not found" });
//     }

//     // Create new user in main collection
//     const newUser = new User({
//       username: pendingUser.username,
//       email: pendingUser.email,
//       password: pendingUser.password,
//       role: role
//     });

//     await newUser.save();
    
//     res.json({ 
//       success: true,
//       message: "User approved successfully",
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         role: newUser.role
//       }
//     });

//   } catch (error) {
//     console.error("Error approving user:", error);
//     res.status(500).json({ error: "Error approving user" });
//   }
// });

// // Delete a Pending User
// router.delete("/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: "Invalid user ID" });
//     }

//     const deletedUser = await PendingUser.findByIdAndDelete(userId);
//     if (!deletedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
    
//     res.json({ 
//       success: true,
//       message: "User rejected successfully" 
//     });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).json({ error: "Error deleting user" });
//   }
// });

// module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Get All Pending Users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find({}, "username email createdAt")
      .sort({ createdAt: -1 }); // Newest first
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ 
      error: "Error fetching pending users",
      details: error.message 
    });
  }
});

// Approve and Move User to Main Collection
router.post("/:userId/approve", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const approvedBy = req.user._id; // From auth middleware

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Find pending user
    const pendingUser = await PendingUser.findById(userId);
    if (!pendingUser) {
      return res.status(404).json({ error: "Pending user not found" });
    }

    // Check if email already exists in main collection
    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      return res.status(409).json({ 
        error: "User with this email already exists" 
      });
    }

    // Create new user
    const newUser = new User({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      role: role,
      approvedBy: approvedBy,
      status: "active"
    });

    await newUser.save();
    
    // Remove from pending collection
    await PendingUser.findByIdAndDelete(userId);

    res.status(201).json({ 
      success: true,
      message: "User approved successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ 
      error: "Error approving user",
      details: error.message 
    });
  }
});

// Delete (Reject) a Pending User
router.delete("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const deletedUser = await PendingUser.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      success: true,
      message: "User rejected successfully",
      rejectedUser: {
        id: deletedUser._id,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ 
      error: "Error rejecting user",
      details: error.message 
    });
  }
});

module.exports = router;