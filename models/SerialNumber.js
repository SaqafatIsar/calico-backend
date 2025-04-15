const mongoose = require("mongoose");

const serialNumberSchema = new mongoose.Schema({
  monthYear: { type: String, required: true, unique: true }, // Format: "MM.YY"
  lastSerialNumber: { type: Number, default: 0 }, // Last used serial number
});

module.exports = mongoose.model("SerialNumber", serialNumberSchema);