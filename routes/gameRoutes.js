const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

//  Place Bet
router.post('/bet', gameController.placeBet);

//  Cash Out
router.post('/cashout', gameController.cashOut);

//  Wallet Balance
router.get('/wallet/:playerId', gameController.getWallet);

module.exports = router;
