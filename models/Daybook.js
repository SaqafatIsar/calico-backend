const mongoose = require('mongoose');

const DaybookSchema = new mongoose.Schema({
    date: { type: String, required: true },
    party: { type: String, required: true },
    representedBy: { type: String },
    type: { type: String, required: true },
    place: { type: String },
    project: { type: String },
    transactionCategory: { type: String, required: true },
    tradeDetails: { type: String },
    doneBy: { type: String, required: true },
    saved: { type: Boolean, default: false },
    voucherNumber: { type: String, unique: true } // Add voucherNumber field
});

module.exports = mongoose.model('Daybook', DaybookSchema);