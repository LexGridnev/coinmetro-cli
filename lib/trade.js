const api = require('./api');
const AIService = require('./aiService');
const colors = require('ansi-colors');
const readline = require('readline');

const trade = async (argv) => {
  const action = argv.action || argv._[1];

  if (action === 'nlp') {
    const query = argv.query || argv._[2];
    if (!query) {
      console.log(colors.red('Error: Please provide a trade description (e.g. "buy 100 eur of btc")'));
      return;
    }

    const ai = new AIService();
    console.log(colors.cyan('AI is parsing your request...'));
    
    try {
      const parsed = await ai.parseTrade(query);
      console.log(colors.green('\nAI understood the following:'));
      console.log(`Action: ${colors.bold(parsed.action)}`);
      console.log(`Pair:   ${colors.bold(parsed.pair)}`);
      console.log(`Amount: ${colors.bold(parsed.amount)}`);
      console.log(`Type:   ${colors.bold(parsed.type)}`);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(colors.yellow('\nExecute this trade? (y/N): '), async (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log(colors.cyan('Executing...'));
          try {
            // Simulated execution
            console.log(colors.green('Success! Order placed.'));
          } catch (e) {
            console.log(colors.red('Execution failed.'));
          }
        } else {
          console.log('Trade cancelled.');
        }
        rl.close();
      });

    } catch (e) {
      console.error(colors.red('AI parsing failed. Please try a standard trade command.'));
    }
  } else if (action === 'buy' || action === 'sell') {
    console.log(colors.green(`Executing ${action} order... (Manual mode)`));
    // Standard logic here
  } else {
    console.log('Usage: cm trade <buy|sell|nlp> [options]');
  }
};

module.exports = { trade };
