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
// 🗃️  MongoDB Connection (Improved)
// ============================================
const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/calicoDB";

// Validate connection string
if (!DB_URI) {
  console.error('❌ FATAL: No MongoDB URI found in environment variables');
  console.error('Please set either MONGODB_URI or MONGO_URI');
  process.exit(1);
}

// Connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Fail fast
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
mongoose.connect(DB_URI, mongooseOptions)
  .then(() => {
    console.log(`✅ MongoDB Connected to ${mongoose.connection.name}`);
    console.log(`🛢️  Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

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
// 🏠 Base Route
// ============================================
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Welcome to the Daybook API",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// ============================================
// ❌ 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ============================================
// 🔥 Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message 
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});