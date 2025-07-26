const crypto = require('crypto');

const generateSeed = () => crypto.randomBytes(16).toString('hex');

const getCrashPoint = (seed, roundNumber) => {
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const num = parseInt(hash.substring(0, 8), 16);
  const crashMultiplier = Math.max(1.01, (num % 12000) / 100); // e.g., up to 120x
  return parseFloat(crashMultiplier.toFixed(2));
};

module.exports = { generateSeed, getCrashPoint };
