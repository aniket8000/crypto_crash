const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  usdAmount: Number,
  cryptoAmount: Number,
  currency: { type: String, enum: ['BTC', 'ETH'] },
  type: { type: String, enum: ['bet', 'cashout'] },
  transactionHash: String,
  priceAtTime: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
