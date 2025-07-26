const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  roundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  usdAmount: Number,
  cryptoAmount: Number,
  currency: { type: String, enum: ['BTC', 'ETH'] },
  multiplier: Number,
  status: { type: String, enum: ['active', 'cashed_out', 'lost'], default: 'active' }
});

module.exports = mongoose.model("Bet", BetSchema);
