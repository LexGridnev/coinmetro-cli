const fs = require('fs');
const path = require('path');

module.exports = function (api, utils, constants) {
  const c = require('ansi-colors');
  const ora = require('ora');

  const botModule = {};
  const pidFilePath = path.join(__dirname, '.bot.pid');

  function parsePair(pair, currencies) {
    for (const currency of currencies) {
      if (pair.endsWith(currency)) {
        const base = pair.slice(0, -currency.length);
        if (currencies.includes(base)) {
          return [base, currency];
        }
      }
    }
    return null;
  }

  botModule['find-arbitrage'] = function () {
    return new Promise(async (resolve, reject) => {
      const spinner = ora('Analyzing pairs for arbitrage opportunities...').start();
      try {
        const prices = await api.getLatestPrices();
        const assets = await api.getAssets();
        const currencies = assets.map(a => a.symbol);
        const opportunities = [];

        for (let i = 0; i < currencies.length; i++) {
          for (let j = i + 1; j < currencies.length; j++) {
            for (let k = j + 1; k < currencies.length; k++) {
              const c1 = currencies[i];
              const c2 = currencies[j];
              const c3 = currencies[k];

              const paths = [
                [c1, c2, c3],
                [c1, c3, c2],
              ];

              for (const path of paths) {
                let rate = 1;
                let validPath = true;
                let pathStr = '';

                for (let l = 0; l < path.length; l++) {
                  const from = path[l];
                  const to = path[(l + 1) % path.length];
                  const pair = `${to}${from}`;
                  const reversePair = `${from}${to}`;

                  if (prices[pair]) {
                    rate *= 1 / prices[pair].ask;
                    pathStr += `${from} -> `;
                  } else if (prices[reversePair]) {
                    rate *= prices[reversePair].bid;
                    pathStr += `${from} -> `;
                  } else {
                    validPath = false;
                    break;
                  }
                }

                if (validPath) {
                  const profit = (rate - 1) * 100;
                  if (profit > 0.3) {
                    opportunities.push({
                      path: `${pathStr}${path[0]}`,
                      profit: `${profit.toFixed(2)}%`,
                    });
                  }
                }
              }
            }
          }
        }

        spinner.succeed('Arbitrage analysis complete.');
        if (opportunities.length > 0) {
          console.log(c.bold.green('Found potential arbitrage opportunities:'));
          opportunities.forEach(o => {
            console.log(`- Path: ${o.path}, Profit: ${o.profit}`);
          });
        } else {
          console.log(c.yellow('No arbitrage opportunities found.'));
        }

        resolve();
      } catch (error) {
        spinner.fail('Arbitrage analysis failed.');
        reject(error);
      }
    });
  };

  function calculateMA(candles, period) {
    const prices = candles.slice(-period).map(c => c.c);
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }

  botModule.currentPosition = undefined;

  async function runMACrossoverBot(pair, amount, short, long, timeframe, api) {
    try {
      const candles = await api.getHistoricalPrices(pair, { timeframe, duration: 86400000 }); // 1 day of data
      const shortMA = calculateMA(candles, short);
      const longMA = calculateMA(candles, long);

      console.log(`Short MA: ${shortMA}, Long MA: ${longMA}`);

      if (shortMA > longMA && botModule.currentPosition !== 'long') {
        console.log(c.green('Golden cross detected. Placing buy order.'));
        await api.sendOrder({
          orderPlatform: 'trade',
          orderType: 'market',
          buyingCurrency: pair.slice(0, 3),
          sellingCurrency: pair.slice(3),
          buyingQty: amount,
        });
        botModule.currentPosition = 'long';
      } else if (shortMA < longMA && botModule.currentPosition === 'long') {
        console.log(c.red('Death cross detected. Placing sell order.'));
        await api.sendOrder({
          orderPlatform: 'trade',
          orderType: 'market',
          sellingCurrency: pair.slice(0, 3),
          buyingCurrency: pair.slice(3),
          sellingQty: amount,
        });
        botModule.currentPosition = 'short';
      }
    } catch (error) {
      console.error(c.red('Bot error:'), error);
    }
  }

  botModule['ma-crossover'] = function (pair, amount, short, long, timeframe, runOnce = false) {
    return new Promise(async (resolve) => {
      if (runOnce) {
        await runMACrossoverBot(pair, amount, short, long, timeframe, api);
        resolve();
      } else {
        fs.writeFileSync(pidFilePath, process.pid.toString());
        console.log(`Starting MA Crossover bot for ${pair}...`);
        while (true) {
          await runMACrossoverBot(pair, amount, short, long, timeframe, api);
          await new Promise(resolve => setTimeout(resolve, 60000)); // Sleep for 1 minute
        }
      }
    });
  };

  botModule['stop-bot'] = function () {
    return new Promise((resolve) => {
      if (fs.existsSync(pidFilePath)) {
        const pid = fs.readFileSync(pidFilePath, 'utf8');
        try {
          process.kill(pid);
          fs.unlinkSync(pidFilePath);
          console.log('Bot stopped.');
        } catch (error) {
          if (error.code === 'ESRCH') {
            console.log('Bot is not running.');
            fs.unlinkSync(pidFilePath);
          } else {
            console.error(c.red('Error stopping bot:'), error);
          }
        }
      } else {
        console.log('Bot is not running.');
      }
      resolve();
    });
  };

  function calculateRSI(candles, period) {
    const prices = candles.map(c => c.c);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) {
        gains += diff;
      } else {
        losses -= diff;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) {
      return 100;
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  async function runRsiBot(pair, amount, rsiPeriod, rsiOverbought, rsiOversold, timeframe, api) {
    try {
      const candles = await api.getHistoricalPrices(pair, { timeframe, duration: 86400000 }); // 1 day of data
      const rsi = calculateRSI(candles, rsiPeriod);

      console.log(`RSI: ${rsi}`);

      if (rsi < rsiOversold && botModule.currentPosition !== 'long') {
        console.log(c.green(`RSI is ${rsi}, which is below ${rsiOversold}. Placing buy order.`));
        await api.sendOrder({
          orderPlatform: 'trade',
          orderType: 'market',
          buyingCurrency: pair.slice(0, 3),
          sellingCurrency: pair.slice(3),
          buyingQty: amount,
        });
        botModule.currentPosition = 'long';
      } else if (rsi > rsiOverbought && botModule.currentPosition === 'long') {
        console.log(c.red(`RSI is ${rsi}, which is above ${rsiOverbought}. Placing sell order.`));
        await api.sendOrder({
          orderPlatform: 'trade',
          orderType: 'market',
          sellingCurrency: pair.slice(0, 3),
          buyingCurrency: pair.slice(3),
          sellingQty: amount,
        });
        botModule.currentPosition = 'short';
      }
    } catch (error) {
      console.error(c.red('Bot error:'), error);
    }
  }

  botModule['rsi'] = function (pair, amount, rsiPeriod, rsiOverbought, rsiOversold, timeframe, runOnce = false) {
    return new Promise(async (resolve) => {
      if (runOnce) {
        await runRsiBot(pair, amount, rsiPeriod, rsiOverbought, rsiOversold, timeframe, api);
        resolve();
      } else {
        fs.writeFileSync(pidFilePath, process.pid.toString());
        console.log(`Starting RSI bot for ${pair}...`);
        while (true) {
          await runRsiBot(pair, amount, rsiPeriod, rsiOverbought, rsiOversold, timeframe, api);
          await new Promise(resolve => setTimeout(resolve, 60000)); // Sleep for 1 minute
        }
      }
    });
  };

  return botModule;
};
