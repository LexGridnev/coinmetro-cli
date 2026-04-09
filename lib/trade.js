const { AIService } = require('./aiService');
const colors = require('ansi-colors');
const readline = require('readline');

module.exports = (api, auth, utils, constants) => {
  const execute = async (action, pair, amount) => {
    console.log(colors.green(`Executing ${action} order for ${amount} ${pair}...`));
    try {
      // In demo mode or if it's a simulated order
      if (auth.isDemo()) {
        console.log(colors.yellow('Demo Mode: Order simulated successfully.'));
        return;
      }
      const res = await api.sendOrder({ action, pair, amount, type: 'market' });
      console.log(colors.green('Order placed successfully!'));
      return res;
    } catch (e) {
      console.error(colors.red(`Order failed: ${e.message}`));
    }
  };

  const nlp = async (query, forceYes = false) => {
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

      if (forceYes) {
        return await execute(parsed.action, parsed.pair, parsed.amount);
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        rl.question(colors.yellow('\nExecute this trade? (y/N): '), async (answer) => {
          rl.close();
          if (answer.toLowerCase() === 'y') {
            await execute(parsed.action, parsed.pair, parsed.amount);
          } else {
            console.log('Trade cancelled.');
          }
          resolve();
        });
      });

    } catch (e) {
      console.error(colors.red('AI parsing failed. Please try a standard trade command.'));
    }
  };

  return { execute, nlp };
};
