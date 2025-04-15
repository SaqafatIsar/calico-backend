const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema({
  date: { type: String, required: true },
  party: { type: String, required: true },
  representedBy: { type: String },
  type: { type: String, required: true },
  place: { type: String },
  project: { type: String },
  transactionCategory: { type: String, required: true },
  tradeDetails: { type: String },
  doneBy: { type: String, required: true },
  voucherNumber: { type: String, required: true }, // Add voucherNumber field
});

module.exports = mongoose.model("Approval", approvalSchema);