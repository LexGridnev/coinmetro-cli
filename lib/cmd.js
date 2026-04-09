const { trade } = require('./trade');
const { auth } = require('./auth');
const { bot } = require('./bot');
const { market } = require('./market');

const cmd = {
  trade,
  auth,
  bot,
  market
};

module.exports = cmd;
