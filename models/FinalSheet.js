// const mongoose = require("mongoose");

// const FinalSheetSchema = new mongoose.Schema({
//   transactionId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Approval", 
//     required: true, 
//     unique: true 
//   },
//   date: { type: String, required: true },
//   type: { type: String, required: true },
//   party: { type: String, required: true },
//   representedBy: { type: String, default: "N/A" },
//   transactionCategory: { type: String, required: true },
//   place: { type: String, default: "N/A" },
//   project: { type: String, default: "N/A" },
//   tradeDetails: { type: String, default: "N/A" },
//   doneBy: { type: String, default: "N/A" },
//   approvedBy: { type: String, required: true }, // ✅ Add this field
//   // approvedDate: { type: Date, default: Date.now }, // ✅ Add this field
//   // status: { type: String, default: "Finalized" }
// }, { timestamps: true }); // ✅ Adds createdAt & updatedAt timestamps

// module.exports = mongoose.model("FinalSheet", FinalSheetSchema);
const mongoose = require("mongoose");

const FinalSheetSchema = new mongoose.Schema({
  transactionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Approval", 
    required: true, 
    unique: true 
  },
  date: { type: String, required: true },
  type: { type: String, required: true },
  party: { type: String, required: true },
  representedBy: { type: String, default: "N/A" },
  transactionCategory: { type: String, required: true },
  place: { type: String, default: "N/A" },
  project: { type: String, default: "N/A" },
  tradeDetails: { type: String, default: "N/A" },
  doneBy: { type: String, default: "N/A" },
  approvedBy: { type: String, required: true },
  approvedDate: { type: Date, default: Date.now },
  voucherNumber: { type: String, unique: true }, // Add this field
}, { timestamps: true });

module.exports = mongoose.model("FinalSheet", FinalSheetSchema);