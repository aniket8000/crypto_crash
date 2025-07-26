#  Crypto Crash Game Backend

A real-time multiplayer backend for a "Crash" betting game with live crypto conversion, provably fair crash logic, and WebSocket updates.

-  Built with Node.js, Express, MongoDB, CoinGecko API, and Socket.IO

##  Features

-  Game rounds every 10 seconds
-  Place bets in USD (converted to BTC/ETH)
-  Multiplier increases exponentially until a random crash
-  Players can cash out anytime before crash
-  Real-time game updates using WebSockets
-  Provably fair algorithm using SHA-256
-  Simulated player wallets + transaction logs

---

##  Setup Instructions

###  Prerequisites
- Node.js
- MongoDB running locally or Atlas (cloud)
- Internet (to call CoinGecko public API)

###  `.env` Configuration

Create a `.env` file:

env
 - PORT=3000
 - MONGO_URI=mongodb://localhost:27017/crypto_crash
 - COINGECKO_API=https://api.coingecko.com/api/v3/simple/price 
 - (CoinGecko requires no API key, but cache is    implemented to avoid rate limits.)

### Install Dependencies
 - npm install

### Seed Players
 - node utils/seed.js
 - This will create 5 players with random BTC/ETH balances.

### Start Server
 - node server.js
 
 - Server: http://localhost:3000
 - Web Client: http://localhost:3000

### Provably Fair Crash Algorithm
 -  Inside crashService.js
 - hash = SHA256(seed + roundNumber)
 - crashPoint = Math.max(1.01, (hash % 12000) / 100)

 - SHA-256 ensures transparency

 - seed is server-generated per round

 - roundNumber increases each round

 - Output capped ~120x for fairness

 - Players can verify crash logic using seed + round number

### USD-to-Crypto Conversion Logic
 - Realtime BTC/ETH fetched from CoinGecko
 - Cached for 10s to avoid rate limits

### Game Logic
 - New game starts every 10 seconds

 - Multiplier increases: 1 + (timeElapsed * 0.1)

 - Game ends (crashes) at precomputed crashPoint

 - Round data, crash seed, and start time stored
 
### Crypto Integration
 - CoinGecko public API (no key required)

 - Conversion is calculated and stored with accuracy

 - Player wallets in BTC/ETH

 - Atomic operations for balance updates

### WebSocket Integration
 - Real-time events: multiplier, cashout, crash

 - Cashout supported via both WebSocket and REST

 - Game engine handles concurrency safely

### API Testing with cURL
 - Use the following commands in your terminal to test API endpoints without Postman.

 - 1.Place a Bet (/api/bet)
 - curl -X POST http://localhost:3000/api/bet \
 - -H "Content-Type: application/json" \
 - -d '{
 -  "playerId": "PUT_PLAYER_ID_HERE",
 -   "usdAmount": 10,
 -   "currency": "BTC"
 - }'
 - Replace "PUT_PLAYER_ID_HERE" with a real player ID printed from the seed script.

 - 2.Cash Out (/api/cashout)
 - curl -X POST http://localhost:3000/api/cashout \
 - -H "Content-Type: application/json" \
 - -d '{
 -  "playerId": "PUT_PLAYER_ID_HERE"
 - }'
 - Player must have placed a bet and round should still be active.

 - 3.Get Wallet (/api/wallet/:playerId)
 - curl http://localhost:3000/api/wallet/PUT_PLAYER_ID_HERE

### Player ID
- To find player IDs, run:
- node utils/seed.js



