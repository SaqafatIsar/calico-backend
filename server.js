// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // ✅ Middleware
// app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// // ✅ MongoDB Connection
// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/calicoDB";

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected to', mongoose.connection.name))
//   .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// // ✅ Route Imports (Grouped for Readability)
// const authRoutes = require("./routes/auth");
// const approvalRoutes = require("./routes/approval");
// const daybookRoutes = require("./routes/daybook");
// const finalSheetRoutes = require("./routes/finalsheet");
// const pendingUsersRoutes = require("./routes/pendingUsers");
// const adminRoutes = require("./routes/adminRoutes");
// const partyRoutes = require("./routes/party");  // Corrected path



// // ✅ API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/approvals", approvalRoutes);
// app.use("/api/daybooks", daybookRoutes);
// app.use("/api/finalsheets", finalSheetRoutes);
// app.use("/api/pendingusers", pendingUsersRoutes);
// app.use("/api/admin", adminRoutes); // ✅ Now includes pending users handling
// app.use("/api/parties", partyRoutes); 
// // ✅ Base Route
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Welcome to the Daybook API" });
// });

// // ✅ 404 Handler
// app.use((req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// // ✅ Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("🔥 Server Error:", err);
//   res.status(500).json({ error: "Internal Server Error" });
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express app
const app = express();

// ============================================
// 🛡️  Environment Configuration
// ============================================
// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Debugging: Log available environment variables
console.log('\n=== ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists?:', !!process.env.MONGODB_URI);
console.log('MONGO_URI exists?:', !!process.env.MONGO_URI);
console.log('==============================\n');

// ============================================
// 🚦 Middleware Configuration
// ============================================
app.use(express.json());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || "http://localhost:3000", 
  credentials: true 
}));

// ============================================
// 🗃️  MongoDB Connection (Optimized)
// ============================================
cconst DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/calicoDB";

if (!DB_URI) {
  console.error('❌ No MongoDB URI configured');
  process.exit(1);
}

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(DB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// Connection events
mongoose.connection.on('connecting', () => console.log('🔄 Connecting to MongoDB...'));
mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));
// ============================================
// 🛣️  Route Imports
// ============================================
const authRoutes = require("./routes/auth");
const approvalRoutes = require("./routes/approval");
const daybookRoutes = require("./routes/daybook");
const finalSheetRoutes = require("./routes/finalsheet");
const pendingUsersRoutes = require("./routes/pendingUsers");
const adminRoutes = require("./routes/adminRoutes");
const partyRoutes = require("./routes/party");

// ============================================
// 🌐 API Routes
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/daybooks", daybookRoutes);
app.use("/api/finalsheets", finalSheetRoutes);
app.use("/api/pendingusers", pendingUsersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/parties", partyRoutes);

// ============================================
// 🏠 Base Route with Health Check
// ============================================
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.status(200).json({ 
    message: "Welcome to the Daybook API",
    database: statusMap[dbStatus] || 'Unknown',
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ❌ 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// ============================================
// 🔥 Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 🚀 Server Startup
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🛰️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛢️  MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
});

// ============================================
// 🔌 Graceful Shutdown
// ============================================
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      console.log('👋 Server terminated');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down...');
  server.close(() => {
    mongoose.connection.close(false);
    process.exit(0);
  });
});