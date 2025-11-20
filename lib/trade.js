module.exports = function (api, utils, constants) {
  const c = require('ansi-colors');
  const env = require('./env'); // eslint-disable-line no-unused-vars
  // api is now passed as an argument
  // utils and constants are now passed as arguments

  const tradeModule = {};

  tradeModule.balance = function (api) {
    return new Promise((resolve, reject) => {
      const tasks = [];
      tasks.push(api.getBalances());
      tasks.push(api.getWallets());

      Promise.all(tasks)
        .then(results => {
          const balances = results[0];
          const wallets = results[1].list;

          console.log('      Platform     Available      Total');
          console.log('-'.repeat(70));
          wallets.forEach(w => {
            let cur = w.currency;
            // let b = Object.keys(balances).find(x => x.currency === cur); // Removed unused variable
            let total = w.balance.toFixed(2).padStart(10, ' ');
            let ava = w.balance - w.reserved;
            ava = ava.toFixed(2).padStart(10, ' ');
            let usd = balances[cur]['USD'] ? balances[cur]['USD'] : 0.0; // demo api has no USD field
            usd = usd.toFixed(2).padStart(10, ' ');
            let eur = balances[cur]['EUR'].toFixed(2).padStart(10, ' ');
            let btc = balances[cur]['BTC'].toFixed(6).padStart(10, ' ');
            console.log(`${total}${cur} ${ava}${cur} ${c.greenBright(usd + 'USD')} ${c.blueBright(eur + 'EUR')} ${c.yellowBright(btc +'BTC')}`);
          });
          let usd = balances.TOTAL.USD ? balances.TOTAL.USD : 0.0; // demo api has no USD field
          usd = usd.toFixed(2).padStart(10, ' ');
          let eur = balances.TOTAL.EUR.toFixed(2).padStart(10, ' ');
          let btc = balances.TOTAL.BTC.toFixed(6).padStart(10, ' ');
          console.log('-'.repeat(70));
          console.log(' '.repeat(28) + `${c.bold.greenBright(usd + 'USD')} ${c.bold.blueBright(eur + 'EUR')} ${c.bold.yellowBright(btc +'BTC')}`);
          console.log('** Platform = Total minus any open positions and locked funds (i.e for TraM)');
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  tradeModule.default = tradeModule.balance;

  tradeModule.open = utils.open(constants.platform.trade);

  tradeModule.history = utils.history(constants.platform.trade);

  tradeModule.cancel = utils.cancel(constants.platform.trade);

  tradeModule.mcancel = utils.mcancel(constants.platform.trade);

  tradeModule.buy = utils.trade(constants.platform.trade, constants.operation.buy);

  tradeModule.sell = utils.trade(constants.platform.trade, constants.operation.sell);

  tradeModule.mbuy = utils.mtrade(constants.platform.trade, constants.operation.buy);

  tradeModule.msell = utils.mtrade(constants.platform.trade, constants.operation.sell);

  tradeModule.nlp = async (api, input, argv, aiService) => {
    try {
      const parsedTrade = await aiService.parseTradeCommand(input, argv.debug);

      let command = `cm trade ${parsedTrade.action} ${parsedTrade.quantity} ${parsedTrade.currency}`;
      if (parsedTrade.price) {
        command += ` @${parsedTrade.price}`;
      }
      command += ` ${parsedTrade.counterCurrency}`;

      console.log(`Understood command: ${command}`);
    } catch (error) {
      console.error(c.red(`Error parsing trade command: ${error.message}`));
    }
  };

  return tradeModule;
};
