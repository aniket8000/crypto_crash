const Player = require('../models/Player');
const Bet = require('../models/Bet');
const Round = require('../models/Round');
const Transaction = require('../models/Transaction');
const { fetchPrices } = require('../services/cryptoService');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

//  Place Bet
exports.placeBet = async (req, res) => {
  try {
    const { playerId, usdAmount, currency } = req.body;
    if (!['BTC', 'ETH'].includes(currency)) return res.status(400).json({ error: 'Invalid currency' });
    if (usdAmount <= 0) return res.status(400).json({ error: 'Invalid USD amount' });

    const prices = await fetchPrices();
    const cryptoPrice = currency === 'BTC' ? prices.btc : prices.eth;
    const cryptoAmount = usdAmount / cryptoPrice;

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (player.wallet[currency] < cryptoAmount) {
      return res.status(400).json({ error: 'Insufficient balance in wallet' });
    }

    const activeRound = await Round.findOne({ active: true }).sort({ startTime: -1 });
    if (!activeRound) return res.status(400).json({ error: 'No active game round' });

    // Deduct crypto
    player.wallet[currency] -= cryptoAmount;
    await player.save();

    // Save bet
    const bet = await Bet.create({
      playerId,
      roundId: activeRound._id,
      usdAmount,
      cryptoAmount,
      currency
    });

    // Log transaction
    await Transaction.create({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      type: 'bet',
      transactionHash: uuidv4(),
      priceAtTime: cryptoPrice
    });

    res.status(200).json({ message: 'Bet placed', bet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error placing bet' });
  }
};

//  Cash Out
exports.cashOut = async (req, res) => {
  try {
    const { playerId } = req.body;

    const activeRound = await Round.findOne({ active: true }).sort({ startTime: -1 });
    if (!activeRound) return res.status(400).json({ error: 'No active game round' });

    const bet = await Bet.findOne({ playerId, roundId: activeRound._id, status: 'active' });
    if (!bet) return res.status(400).json({ error: 'No active bet found' });

    const currentTime = Date.now();
    const timeElapsed = (currentTime - activeRound.startTime.getTime()) / 1000;
    const growthFactor = 0.1;
    const currentMultiplier = parseFloat((1 + timeElapsed * growthFactor).toFixed(2));

    if (currentMultiplier >= activeRound.crashPoint) {
      bet.status = 'lost';
      await bet.save();
      return res.status(400).json({ error: 'Too late! Game already crashed.' });
    }

    bet.status = 'cashed_out';
    bet.multiplier = currentMultiplier;
    await bet.save();

    const payoutCrypto = bet.cryptoAmount * currentMultiplier;
    const prices = await fetchPrices();
    const cryptoPrice = bet.currency === 'BTC' ? prices.btc : prices.eth;
    const payoutUSD = parseFloat((payoutCrypto * cryptoPrice).toFixed(2));

    const player = await Player.findById(playerId);
    player.wallet[bet.currency] += payoutCrypto;
    await player.save();

    await Transaction.create({
      playerId,
      usdAmount: payoutUSD,
      cryptoAmount: payoutCrypto,
      currency: bet.currency,
      type: 'cashout',
      transactionHash: uuidv4(),
      priceAtTime: cryptoPrice
    });

    res.status(200).json({
      message: 'Cashout successful',
      multiplier: currentMultiplier,
      payoutCrypto,
      payoutUSD
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error during cashout' });
  }
};

//  Wallet Balance
exports.getWallet = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const prices = await fetchPrices();
    const wallet = player.wallet;

    const balance = {
      BTC: {
        crypto: wallet.BTC,
        usd: parseFloat((wallet.BTC * prices.btc).toFixed(2))
      },
      ETH: {
        crypto: wallet.ETH,
        usd: parseFloat((wallet.ETH * prices.eth).toFixed(2))
      }
    };

    res.status(200).json({ username: player.username, balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};
