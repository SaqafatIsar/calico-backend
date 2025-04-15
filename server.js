const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/calicoDB";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Connection error:', err));

// ✅ Route Imports (Grouped for Readability)
const authRoutes = require("./routes/auth");
const approvalRoutes = require("./routes/approval");
const daybookRoutes = require("./routes/daybook");
const finalSheetRoutes = require("./routes/finalsheet");
const pendingUsersRoutes = require("./routes/pendingUsers");
const adminRoutes = require("./routes/adminRoutes");
const partyRoutes = require("./routes/party");  // Corrected path



// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/daybooks", daybookRoutes);
app.use("/api/finalsheets", finalSheetRoutes);
app.use("/api/pendingusers", pendingUsersRoutes);
app.use("/api/admin", adminRoutes); // ✅ Now includes pending users handling
app.use("/api/parties", partyRoutes); 
// ✅ Base Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Daybook API" });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
