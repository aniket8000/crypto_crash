const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  roundNumber: Number,
  crashPoint: Number,
  seed: String,
  active: Boolean,
  startTime: Date
});

module.exports = mongoose.model("Round", RoundSchema);
