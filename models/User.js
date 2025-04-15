const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Username is required and unique
  password: { type: String, required: true }, // Password is required
  role: { type: String, enum: ["admin1", "admin2", "admin3"], required: true }, // Role is required
});

module.exports = mongoose.model("User", UserSchema);