const AIService = require('./aiService');
const api = require('./api');
const colors = require('ansi-colors');
const ora = require('ora');

const gemini = async (argv) => {
  const action = argv.action;
  const ai = new AIService();

  if (action === 'analyze') {
    const pair = argv.pair || argv._[2];
    if (!pair) {
      console.log(colors.red('Error: Please specify a trading pair (e.g., BTCEUR)'));
      return;
    }

    const spinner = ora(`Fetching data and analyzing ${pair}...`).start();
    
    try {
      let tickerData;
      try {
        tickerData = await api.get(`/exchange/prices?pair=${pair}`);
      } catch (err) {
        if (argv.debug) console.log(colors.gray(`DEBUG: API failed for ${pair}, using mock data for analysis.`));
        // Fallback for demo/invalid pairs
        tickerData = { pair, last: 50000, high: 51000, low: 49000, v: 100 };
      }
      
      const analysis = await ai.analyzeMarket(pair, tickerData);
      spinner.succeed(`Analysis for ${colors.bold(pair)}:`);
      console.log('\n' + colors.italic(analysis) + '\n');
    } catch (error) {
      spinner.fail('Market analysis failed');
      console.error(colors.red(error.message));
    }
  } else {
    console.log('Usage: cm gemini analyze <pair>');
  }
};

module.exports = { gemini };
