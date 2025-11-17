const c = require('ansi-colors');

const ask = async (api, prompt, argv, aiService) => {
  if (argv && argv.debug) {
    console.log(c.yellow(`[DEBUG] Prompt: ${prompt}`));
  }
  try {
    const response = await aiService.askQuestion(prompt, argv.debug);
    console.log(response);
  } catch (error) {
    console.error(c.red(`Error asking Gemini: ${error.message}`));
  }
};

module.exports = {
  ask: ask,
  default: ask,
};
