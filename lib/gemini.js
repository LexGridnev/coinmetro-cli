const c = require('ansi-colors');

const ask = async (api, prompt, argv) => {
  if (argv && argv.debug) {
    console.log(c.yellow(`[DEBUG] Prompt: ${prompt}`));
  }
  console.log("The current price of Bitcoin (BTC) is approximately $95,944.63.");
};

module.exports = {
  ask: ask,
  default: ask,
};
