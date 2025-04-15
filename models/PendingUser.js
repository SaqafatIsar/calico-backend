const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Username is required and unique
  password: { type: String, required: true }, // Password is required
});

module.exports = mongoose.model("PendingUser", PendingUserSchema);