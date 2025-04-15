// models/Party.js
const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  fathersName: { type: String },
  dob: { type: Date },
  pan: { type: String },
  aadharGst: { type: String },
  address: { type: String },
  group: { type: String },
  category: { type: String },
  reference: { type: String },
  mobileNumber1: { type: String },
  mobileNumber2: { type: String },
  representedBy: { type: String },
  accountNumber: { type: String },
  branch: { type: String },
  ifscCode: { type: String },
});

module.exports = mongoose.model("Party", partySchema);