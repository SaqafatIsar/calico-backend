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
// 🛡️ Environment Configuration
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
// CORS Configuration
app.use(cors({
  origin: [
    "https://calico-frontend.vercel.app",  // Production
    "http://localhost:3000"                // Development
  ],
  credentials: true
}));

// Body Parsing Middleware (CRITICAL FIX)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware (for debugging)
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// ============================================
// 🗃️ MongoDB Connection (Optimized)
// ============================================
const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/calicoDB";
if (!DB_URI) {
  console.error('❌ No MongoDB URI configured');
  process.exit(1);
}

console.log('🔗 Connecting to MongoDB at:', DB_URI.replace(/:[^@]+@/, ':*****@'));

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
mongoose.connection.on('connected', () => console.log('✅ MongoDB connection established'));
mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));

// ============================================
// 🩺 Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };
  
  res.status(200).json({
    status: 'UP',
    database: statusMap[dbStatus] || 'UNKNOWN',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ============================================
// 🛣️ Route Imports
// ============================================
const authRoutes = require("./routes/auth");
const approvalRoutes = require("./routes/approval");
const daybookRoutes = require("./routes/daybook");
const finalSheetRoutes = require("./routes/finalsheet");
// // const pendingUsersRoutes = require("./routes/pendingUsers");
// const pendingUsersRouter = require('./routes/pendingUsers');
const adminRoutes = require("./routes/adminRoutes");
const partyRoutes = require("./routes/party");
const pendingUsersRouter = require('./routes/newPendingUsers');
app.use('/api/pending-users', pendingUsersRouter);

// ============================================
// 🌐 API Routes
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/daybooks", daybookRoutes);
app.use("/api/finalsheets", finalSheetRoutes);
// app.use("/api/pending-users", pendingUsersRoutes);
app.use('/api/pending-users', pendingUsersRouter);

app.use("/api/admin", adminRoutes);
app.use("/api/parties", partyRoutes);

// ============================================
// 🏠 Base Route
// ============================================
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Welcome to the Daybook API",
    status: "running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    documentation: "https://your-docs-url.com"
  });
});

// ============================================
// ❌ 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "/api/auth",
      "/api/approvals",
      "/api/daybooks",
      "/api/admin"
    ],
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 🔥 Enhanced Error Handler
// ============================================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    request: {
      method: req.method,
      path: req.path,
      body: req.body
    }
  });

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : err.message,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    }),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 🚀 Server Startup
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  =================================
  🚀 Server running on port ${PORT}
  🛰️  Environment: ${process.env.NODE_ENV || 'development'}
  🛢️  MongoDB Status: ${mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'}
  =================================
  `);
});

// ============================================
// 🔌 Graceful Shutdown
// ============================================
const shutdown = (signal) => {
  console.log(`\n[${new Date().toISOString()}] ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      console.log('👋 Server terminated');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
