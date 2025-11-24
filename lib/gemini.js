const c = require('ansi-colors');
const ora = require('ora');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const geminiAuth = require('./geminiAuth');

module.exports = function (api, utils, constants) {
  const geminiModule = {};

  geminiModule.ask = async (question, debug = false) => {
    const spinner = ora('Thinking...').start();
    try {
      const apiKey = process.env.GEMINI_API_KEY || geminiAuth.loadApiKey();
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set. Please run `cm gemini login` or set the environment variable.');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are an expert in the CoinMetro API. Your responses must be accurate, concise, and easy to understand.
        Answer the following question about the Coinmetro API:
        Question: "${question}"
      `;

      if (debug) {
        console.log('---PROMPT---');
        console.log(prompt);
        console.log('--------------');
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      spinner.succeed('Gemini has spoken:');
      console.log(response.text());
    } catch (error) {
      spinner.fail('Gemini is sleeping...');
      console.error(c.red('Error:'), error.message);
    }
  };

  geminiModule.login = async (apiKey) => {
    if (!apiKey) {
      console.error(c.red('Error:'), 'Please provide an API key.');
      return;
    }
    geminiAuth.saveApiKey(apiKey);
    console.log(c.green('Gemini API key saved successfully.'));
  };

  geminiModule.logout = async () => {
    geminiAuth.deleteApiKey();
    console.log(c.green('Gemini API key removed successfully.'));
  };

  return geminiModule;
};
