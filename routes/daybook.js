const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Daybook = require("../models/Daybook");
const Approval = require("../models/Approval");
const SerialNumber = require("../models/SerialNumber"); // Import SerialNumber model

// Utility function to fetch the current serial number (without incrementing)
const fetchSerialNumber = async () => {
  try {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // MM
    const year = String(currentDate.getFullYear()).slice(-2); // YY
    const monthYear = `${month}.${year}`;

    console.log("Fetching serial number for:", monthYear); // Log monthYear

    // Fetch or initialize serial number
    let serialNumberDoc = await SerialNumber.findOne({ monthYear });
    if (!serialNumberDoc) {
      console.log("No serial number found for monthYear. Initializing..."); // Log initialization
      serialNumberDoc = new SerialNumber({ monthYear, lastSerialNumber: 0 });
    }

    return { serialNumberDoc, monthYear }; // Return both serialNumberDoc and monthYear
  } catch (error) {
    console.error("Error in fetchSerialNumber:", error); // Log error
    throw error;
  }
};

// Utility function to generate voucher number (without incrementing)
const generateVoucherNumber = async (type, mode, serialNumberDoc, monthYear) => {
  try {
    // Map mode to the correct character
    let modeChar;
    switch (mode.toLowerCase()) {
      case "cash":
        modeChar = "C";
        break;
      case "bank":
        modeChar = "B";
        break;
      case "bill/memo":
        modeChar = "M";
        break;
      default:
        throw new Error("Invalid mode of transaction");
    }

    // Generate voucher number
    const serialNumber = String(serialNumberDoc.lastSerialNumber + 1).padStart(3, "0");
    const voucherNumber = `${type.charAt(0)}.${modeChar}.${monthYear}/${serialNumber}`;

    console.log("Generated voucher number:", voucherNumber); // Log voucher number
    return voucherNumber;
  } catch (error) {
    console.error("Error in generateVoucherNumber:", error); // Log error
    throw error;
  }
};

// Fetch all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Daybook.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new transaction
router.post("/", async (req, res) => {
  try {
    const { type, transactionCategory } = req.body;

    // Fetch the current serial number and monthYear (without incrementing)
    const { serialNumberDoc, monthYear } = await fetchSerialNumber();

    // Generate voucher number (without incrementing)
    const voucherNumber = await generateVoucherNumber(type, transactionCategory, serialNumberDoc, monthYear);

    // Add voucher number to the transaction data
    const newTransaction = new Daybook({ ...req.body, voucherNumber });
    await newTransaction.save();

    // Increment serial number after the transaction is saved
    serialNumberDoc.lastSerialNumber += 1;
    await serialNumberDoc.save();
    console.log("Incremented serial number:", serialNumberDoc.lastSerialNumber); // Log incremented serial number

    res.status(201).json({ message: "Transaction added successfully", transaction: newTransaction });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ error: "Failed to save transaction", details: error.message });
  }
});

// Fetch and generate voucher number
router.get("/serial-number", async (req, res) => {
  try {
    const { type, mode } = req.query;

    if (!type || !mode) {
      return res.status(400).json({ error: "Type and mode are required" });
    }

    // Fetch the current serial number and monthYear (without incrementing)
    const { serialNumberDoc, monthYear } = await fetchSerialNumber();

    // Generate voucher number (without incrementing)
    const voucherNumber = await generateVoucherNumber(type, mode, serialNumberDoc, monthYear);

    res.status(200).json({ voucherNumber });
  } catch (error) {
    console.error("Error generating voucher number:", error);
    res.status(500).json({ error: "Failed to generate voucher number", details: error.message });
  }
});

// Move transaction to Approvals
router.post("/move-to-approvals", async (req, res) => {
  try {
    console.log("Received request to move transaction:", req.body);

    const transaction = await Daybook.findById(req.body.transactionId);
    if (!transaction) {
      console.error("Transaction not found:", req.body.transactionId);
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Create a new approval document using the correct model
    const newApproval = new Approval(transaction.toObject());
    await newApproval.save();
    console.log("Transaction moved to Approvals:", newApproval);

    // Delete from Daybook
    await Daybook.findByIdAndDelete(req.body.transactionId);
    console.log("Transaction deleted from Daybook:", req.body.transactionId);

    res.status(200).json({ message: "Transaction moved to Approvals successfully" });
  } catch (error) {
    console.error("Error moving transaction:", error);
    res.status(500).json({ error: "Error moving transaction", details: error.message });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    const deletedTransaction = await Daybook.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

module.exports = router;