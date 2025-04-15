const express = require("express");
const router = express.Router();
const Party = require("../models/Party"); // Ensure you have a Party model

// Fetch all parties
router.get("/", async (req, res) => {
  try {
    const parties = await Party.find();
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parties" });
  }
});

// Search for parties by name
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    const parties = await Party.find({ name: { $regex: query, $options: "i" } });
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ error: "Failed to search parties" });
  }
});

// Add a new party
router.post("/", async (req, res) => {
  try {
    const {
      name,
      fathersName,
      dob,
      pan,
      aadharGst,
      address,
      group,
      category,
      reference,
      mobileNumber1,
      mobileNumber2,
      representedBy,
      accountNumber,
      branch,
      ifscCode,
    } = req.body;

    // Create a new party instance
    const newParty = new Party({
      name,
      fathersName,
      dob,
      pan,
      aadharGst,
      address,
      group,
      category,
      reference,
      mobileNumber1,
      mobileNumber2,
      representedBy,
      accountNumber,
      branch,
      ifscCode,
    });

    // Save the new party to the database
    await newParty.save();

    // Return the newly created party object in the response
    res.status(201).json({
      message: "Party saved successfully",
      newParty: newParty, // Ensure the newParty object is included
    });
  } catch (error) {
    console.error("Error saving party:", error); // Log the error for debugging
    res.status(500).json({ error: "Failed to add party" });
  }
});

module.exports = router;