

// const express = require("express");
// const Approval = require("../models/Approval");
// const FinalSheet = require("../models/FinalSheet");
// const VoucherNumber = require("../models/VoucherCounter");
// const router = express.Router();

// // Move transaction from Approval to Final Sheet
// router.post("/move-to-final/:id", async (req, res) => {
//   try {
//     const { approvedBy } = req.body; // Extract approvedBy from the request body

//     // Validate approvedBy
//     if (!approvedBy) {
//       return res.status(400).json({ message: "ApprovedBy field is required" });
//     }

//     const transaction = await Approval.findById(req.params.id);
//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     // Get current month & year
//     const now = new Date();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const year = String(now.getFullYear()).slice(-2);

//     // Determine voucher prefix based on type and mode
//     const typePrefix = transaction.type === "Credit" ? "C" : "D";
//     const modePrefix =
//       transaction.transactionCategory === "Cash"
//         ? "C"
//         : transaction.transactionCategory === "Bank"
//         ? "B"
//         : "M"; // Default to 'M' for Bill/Memo

//     const prefix = `${typePrefix}${modePrefix}.${month}.${year}`;

//     // Find the latest voucher number for this prefix
//     let lastVoucher = await VoucherNumber.findOne({ prefix });

//     let newVoucherNo;
//     if (!lastVoucher) {
//       newVoucherNo = `${prefix}/001`;
//       lastVoucher = new VoucherNumber({ prefix, lastNumber: 1 });
//     } else {
//       lastVoucher.lastNumber += 1;
//       newVoucherNo = `${prefix}/${String(lastVoucher.lastNumber).padStart(3, "0")}`;
//     }

//     console.log("✅ Assigned Voucher Number:", newVoucherNo); // LOG HERE

//     await lastVoucher.save();

//     // Remove _id to prevent duplicate key error
//     const { _id, ...transactionData } = transaction._doc;

//     // Create a new FinalSheet entry
//     const finalTransaction = new FinalSheet({
//       transactionId: transaction._id,
//       ...transactionData,
//       voucherNumber: newVoucherNo, // Assign voucher number here
//       approvedBy: approvedBy, // Store the user's input
//       approvedDate: new Date(), // Add the approval date
//     });

//     await finalTransaction.save();
//     await Approval.findByIdAndDelete(req.params.id);

//     res.status(200).json({ message: "Transaction moved to Final Sheet", voucherNumber: newVoucherNo });
//   } catch (error) {
//     console.error("❌ Error moving transaction:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// // Get all transactions from Final Sheet
// router.get("/", async (req, res) => {
//   try {
//     const finalSheets = await FinalSheet.find();
//     res.status(200).json({ transactions: finalSheets });
//   } catch (error) {
//     console.error("❌ Error fetching final sheets:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// module.exports = router;
const express = require("express");
const Approval = require("../models/Approval");
const FinalSheet = require("../models/FinalSheet");
const router = express.Router();

// Move transaction from Approval to Final Sheet
router.post("/move-to-final/:id", async (req, res) => {
  try {
    const { approvedBy } = req.body; // Extract approvedBy from the request body

    // Validate approvedBy
    if (!approvedBy) {
      return res.status(400).json({ message: "ApprovedBy field is required" });
    }

    const transaction = await Approval.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Remove _id to prevent duplicate key error
    const { _id, ...transactionData } = transaction._doc;

    // Create a new FinalSheet entry
    const finalTransaction = new FinalSheet({
      transactionId: transaction._id, // Reference to the original transaction
      ...transactionData, // Spread the rest of the transaction data
      approvedBy: approvedBy, // Store the user's input for approvedBy
    });

    await finalTransaction.save();
    await Approval.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Transaction moved to Final Sheet", finalTransaction });
  } catch (error) {
    console.error("❌ Error moving transaction:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all transactions from Final Sheet
router.get("/", async (req, res) => {
  try {
    const finalSheets = await FinalSheet.find();
    res.status(200).json({ transactions: finalSheets });
  } catch (error) {
    console.error("❌ Error fetching final sheets:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;