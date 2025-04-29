
// const express = require('express');
// const mongoose = require('mongoose');
// const PendingUser = require('../models/PendingUser');
// const User = require('../models/User');
// const authMiddleware = require('../middleware/authMiddleware');

// // Create router instance
// const pendingUsersRouter = express.Router();

// // Health check endpoint
// pendingUsersRouter.get('/health', (req, res) => {
//   res.status(200).json({ status: 'Pending Users route healthy' });
// });

// // Get all pending users
// pendingUsersRouter.get('/', authMiddleware, async (req, res) => {
//   try {
//     const users = await PendingUser.find({})
//       .select('username email createdAt')
//       .sort({ createdAt: -1 });
//     res.json(users);
//   } catch (error) {
//     console.error('Error fetching pending users:', error.message);
//     res.status(500).json({ 
//       error: 'Failed to fetch pending users'
//     });
//   }
// });

// // Approve user
// pendingUsersRouter.post('/:userId/approve', authMiddleware, async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     const { userId } = req.params;
//     const { role } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       await session.abortTransaction();
//       return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     const pendingUser = await PendingUser.findById(userId).session(session);
//     if (!pendingUser) {
//       await session.abortTransaction();
//       return res.status(404).json({ error: 'Pending user not found' });
//     }

//     const newUser = new User({
//       username: pendingUser.username,
//       email: pendingUser.email,
//       password: pendingUser.password,
//       role: role || 'user',
//       approvedBy: req.user._id
//     });

//     await newUser.save({ session });
//     await PendingUser.findByIdAndDelete(userId).session(session);
//     await session.commitTransaction();

//     res.status(201).json({
//       message: 'User approved successfully',
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         role: newUser.role
//       }
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Approval error:', error.message);
//     res.status(500).json({ error: 'Failed to approve user' });
//   } finally {
//     session.endSession();
//   }
// });

// // Reject user
// pendingUsersRouter.delete('/:userId', authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     const deletedUser = await PendingUser.findByIdAndDelete(userId);
//     if (!deletedUser) {
//       return res.status(404).json({ error: 'Pending user not found' });
//     }

//     res.json({ 
//       message: 'User rejected successfully',
//       user: {
//         id: deletedUser._id,
//         email: deletedUser.email
//       }
//     });
//   } catch (error) {
//     console.error('Error rejecting user:', error.message);
//     res.status(500).json({ error: 'Failed to reject user' });
//   }
// });

// // Export the router directly
// module.exports = pendingUsersRouter;

const express = require('express');
const mongoose = require('mongoose');
const PendingUser = require('../models/PendingUser');
const User = require('../models/User');
// const authMiddleware = require('../middleware/authMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

console.log('Initializing PendingUsers router...');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Pending Users route healthy' });
});

// Get all pending users
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await PendingUser.find({})
      .select('username email createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pending users',
      details: error.message 
    });
  }
});

// Approve user
router.post('/:userId/approve', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const pendingUser = await PendingUser.findById(userId);
    if (!pendingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newUser = new User({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      role: role || 'user',
      approvedBy: req.user._id
    });

    await newUser.save();
    await PendingUser.findByIdAndDelete(userId);

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
    console.error('Approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve user',
      details: error.message 
    });
  }
});

// Reject user
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const deletedUser = await PendingUser.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User rejected successfully',
      user: {
        id: deletedUser._id,
        email: deletedUser.email
      }
    });

  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ 
      error: 'Failed to reject user',
      details: error.message 
    });
  }
});

// Clean export
module.exports = router;
