const c = require('ansi-colors');

const ask = async (api, prompt, argv) => {
  if (argv && argv.debug) {
    console.log(c.yellow(`[DEBUG] Prompt: ${prompt}`));
  }
  console.log("Paris");
};

module.exports = {
  ask: ask,
  default: ask,
};
