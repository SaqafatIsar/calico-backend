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
// routes/pendingUsers.js
const express = require('express');
const mongoose = require('mongoose');
const PendingUser = require('../models/PendingUser');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Create router instance
const pendingUsersRouter = express.Router();

// Health check endpoint
pendingUsersRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'Pending Users route healthy' });
});

// Get all pending users
pendingUsersRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await PendingUser.find({})
      .select('username email createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching pending users:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch pending users'
    });
  }
});

// Approve user
pendingUsersRouter.post('/:userId/approve', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const pendingUser = await PendingUser.findById(userId).session(session);
    if (!pendingUser) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Pending user not found' });
    }

    const newUser = new User({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      role: role || 'user',
      approvedBy: req.user._id
    });

    await newUser.save({ session });
    await PendingUser.findByIdAndDelete(userId).session(session);
    await session.commitTransaction();

    res.status(201).json({
      message: 'User approved successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Approval error:', error.message);
    res.status(500).json({ error: 'Failed to approve user' });
  } finally {
    session.endSession();
  }
});

// Reject user
pendingUsersRouter.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const deletedUser = await PendingUser.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Pending user not found' });
    }

    res.json({ 
      message: 'User rejected successfully',
      user: {
        id: deletedUser._id,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error.message);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// Export the router directly
module.exports = pendingUsersRouter;