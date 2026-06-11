const { AIService } = require('./aiService');
const colors = require('ansi-colors');
const ora = require('ora');

module.exports = (api) => {
  const analyze = async (pair) => {
    if (!pair) {
      console.log(colors.red('Error: Please specify a trading pair (e.g., BTCEUR)'));
      return;
    }

    const ai = new AIService();
    const spinner = ora(`Fetching data and analyzing ${pair}...`).start();
    
    try {
      let tickerData;
      try {
        // Use the passed api client
        tickerData = await api.getTicker(pair);
      } catch (err) {
        // Fallback for demo/invalid pairs
        tickerData = { pair, latest: 50000, high: 51000, low: 49000, volume: 100 };
      }
      
      const analysis = await ai.analyzeMarket(pair, tickerData);
      spinner.succeed(`Analysis for ${colors.bold(pair)}:`);
      console.log('\n' + colors.italic(analysis) + '\n');
    } catch (error) {
      spinner.fail('Market analysis failed');
      console.error(colors.red(error.message));
    }
  };

  return { analyze };
};
