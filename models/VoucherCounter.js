const mongoose = require("mongoose");

const VoucherCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true, unique: true }, // e.g., "CC.03.25"
  lastNumber: { type: Number, default: 0 }, // Last used serial number
});

module.exports = mongoose.model("VoucherCounter", VoucherCounterSchema);