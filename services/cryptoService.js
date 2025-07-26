const axios = require('axios');

let cache = {};
let lastFetch = 0;

const fetchPrices = async () => {
  const now = Date.now();
  if (now - lastFetch < 10000 && cache.btc && cache.eth) {
    return cache; // return cached prices
  }

  const res = await axios.get(
    `${process.env.COINGECKO_API}?ids=bitcoin,ethereum&vs_currencies=usd`
  );

  const btc = res.data.bitcoin.usd;
  const eth = res.data.ethereum.usd;

  cache = { btc, eth };
  lastFetch = now;
  return cache;
};

module.exports = { fetchPrices };
