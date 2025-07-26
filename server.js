require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const gameRoutes = require('./routes/gameRoutes');
const { generateSeed, getCrashPoint } = require('./services/crashService');
const Round = require('./models/Round');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

connectDB();
app.use(cors());
app.use(express.json());
app.use('/api', gameRoutes);

// Serve client HTML
const path = require('path');
app.use('/', express.static(path.join(__dirname, 'client')));

// Store current round info
let currentRound = null;
let multiplier = 1.0;
let multiplierInterval = null;

//  Multiplier Logic with crash check
const startMultiplier = async (crashPoint, startTime) => {
  multiplier = 1.0;

  multiplierInterval = setInterval(async () => {
    const timeElapsed = (Date.now() - startTime.getTime()) / 1000;
    const growthFactor = 0.1;
    multiplier = 1 + timeElapsed * growthFactor;

    io.emit('multiplier', parseFloat(multiplier.toFixed(2)));

    if (multiplier >= crashPoint) {
      clearInterval(multiplierInterval);
      io.emit('crash', { crashPoint });

      if (currentRound && currentRound.active) {
        currentRound.active = false;
        try {
          await currentRound.save(); //  Await inside async function
        } catch (err) {
          console.error("Failed to save round:", err);
        }
      }
    }
  }, 100);
};

//  Start a new round
const startNewRound = async () => {
  const seed = generateSeed();
  const roundCount = await Round.countDocuments();
  const crashPoint = getCrashPoint(seed, roundCount + 1);

  const round = await Round.create({
    roundNumber: roundCount + 1,
    crashPoint,
    seed,
    active: true,
    startTime: new Date()
  });

  currentRound = round;
  io.emit('roundStart', {
    roundNumber: round.roundNumber,
    crashPointHash: seed,
    startTime: round.startTime
  });

  await startMultiplier(crashPoint, round.startTime);
};

//  Replace setInterval with recursive async loop
const startLoop = async () => {
  await startNewRound();
  setTimeout(startLoop, 10000); // wait 10s between rounds
};
startLoop(); // Start the game loop

//  Handle WebSocket cashout
io.on('connection', (socket) => {
  console.log(' Client connected');

  socket.on('cashout', async ({ playerId }) => {
    try {
      const axios = require('axios');
      const res = await axios.post(`http://localhost:${process.env.PORT}/api/cashout`, { playerId });
      socket.emit('cashoutResult', res.data);
    } catch (err) {
      socket.emit('cashoutResult', { error: 'Cashout failed' });
    }
  });

  socket.on('disconnect', () => {
    console.log(' Client disconnected');
  });
});

//  Start server
server.listen(process.env.PORT, () =>
  console.log(` Server running on http://localhost:${process.env.PORT}`)
);
