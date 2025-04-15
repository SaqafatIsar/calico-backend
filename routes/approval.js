const express = require("express");
const router = express.Router(); // ✅ Define router

const Approval = require("../models/Approval");
const FinalSheet = require("../models/FinalSheet");
const { verifyToken, allowOnlyAdmin2AndAdmin3 } = require("../middleware/authMiddleware");

// ✅ Fetch all transactions for approval (Only Admin 2 & Admin 3)
router.get("/", verifyToken, allowOnlyAdmin2AndAdmin3, async (req, res) => {
  try {
    const transactions = await Approval.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
});

// ✅ Approve a transaction (Admin 3 moves it to FinalSheet)
router.post("/:id/approve", verifyToken, allowOnlyAdmin2AndAdmin3, async (req, res) => {
  try {
    const { approvedBy } = req.body; // Extract approvedBy from the request body

    // Validate approvedBy
    if (!approvedBy) {
      return res.status(400).json({ message: "ApprovedBy field is required" });
    }

    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ message: "Transaction not found in approvals" });
    }

    console.log("🔍 Approval found:", approval);

    // ✅ Check if already exists in FinalSheet
    const existingEntry = await FinalSheet.findOne({ transactionId: approval._id });
    if (existingEntry) {
      return res.status(400).json({ message: "Transaction already finalized" });
    }

    // ✅ Move to FinalSheet
    const finalSheetTransaction = new FinalSheet({
      transactionId: approval._id,
      date: approval.date,
      type: approval.type,
      party: approval.party,
      representedBy: approval.representedBy || "N/A",
      transactionCategory: approval.transactionCategory,
      place: approval.place || "N/A",
      project: approval.project || "N/A",
      tradeDetails: approval.tradeDetails || "N/A",
      doneBy: approval.doneBy || "N/A",
      approvedBy: approvedBy, // Include the user's input
      approvedDate: new Date(), // Add the approval date
      status: "Finalized",
      voucherNumber: approval.voucherNumber, // Include the voucher number
    });

    console.log("✅ FinalSheet transaction:", finalSheetTransaction);

    await finalSheetTransaction.save(); // ✅ Save to FinalSheet
    await Approval.findByIdAndDelete(req.params.id); // ✅ Remove from approvals

    res.status(200).json({ message: "Transaction approved successfully", finalSheetTransaction });
  } catch (error) {
    console.error("❌ Error approving transaction:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// ✅ Reject a transaction (Admin 3)
router.delete("/:id/reject", verifyToken, allowOnlyAdmin2AndAdmin3, async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await Approval.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Transaction rejected successfully" });
  } catch (error) {
    console.error("❌ Error rejecting transaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Modify a transaction (Only Admin 2 & Admin 3)
router.put("/:id/modify", verifyToken, allowOnlyAdmin2AndAdmin3, async (req, res) => {
  try {
    const { party, type, place, project, tradeDetails } = req.body;

    const updatedTransaction = await Approval.findByIdAndUpdate(
      req.params.id,
      { party, type, place, project, tradeDetails },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction modified successfully", updatedTransaction });
  } catch (error) {
    console.error("❌ Error modifying transaction:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;