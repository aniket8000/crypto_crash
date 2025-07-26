require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Player = require('../models/Player');

const seed = async () => {
  await connectDB();

  await Player.deleteMany();

  const samplePlayers = [
    { username: 'player1', wallet: { BTC: 0.005, ETH: 0.1 } },
    { username: 'player2', wallet: { BTC: 0.01, ETH: 0.05 } },
    { username: 'player3', wallet: { BTC: 0.002, ETH: 0.2 } },
    { username: 'player4', wallet: { BTC: 0.01, ETH: 0.15 } },
    { username: 'player5', wallet: { BTC: 0.007, ETH: 0.08 } }
  ];

  const inserted = await Player.insertMany(samplePlayers);
  console.log(" Sample players seeded:");
  inserted.forEach(p => {
    console.log(` Username: ${p.username} | ID: ${p._id}`);
  });

  process.exit();
};

seed();
