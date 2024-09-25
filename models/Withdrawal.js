const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // Amount in kobo
  status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
module.exports = Withdrawal;
