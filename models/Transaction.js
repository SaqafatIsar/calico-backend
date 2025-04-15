const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: String,
  party: String,
  representedBy: String,
  type: String,
  bankCredit: Number,
  bankDebit: Number,
  cashCredit: Number,
  cashDebit: Number,
  billCredit: Number,
  billDebit: Number,
  place: String,
  project: String,
  tradeDetails: String,
  doneBy: String,
  voucherNo: String,
  status: { type: String, default: 'Pending' },
});

const Daybook = require('../models/Daybook'); 

module.exports = Transaction;
