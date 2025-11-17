const open = require('open');
const c = require('ansi-colors');

module.exports.get = async () => {
  const url = 'https://aistudio.google.com/app/apikey';
  console.log(c.green(`Opening ${url} in your default web browser to help you get a Gemini API key.`));
  console.log(c.yellow('Please follow the instructions on the page to generate your API key.'));
  console.log(c.yellow('Once you have your key, set it as an environment variable:'));
  console.log(c.cyan('  export GEMINI_API_KEY="YOUR_API_KEY_HERE"'));
  await open(url);
};

module.exports.help = {
  descr: 'Opens the Google AI Studio page to generate a Gemini API key.',
  format: 'cm gemini-key get',
  examples: [
    'cm gemini-key get'
  ]
};