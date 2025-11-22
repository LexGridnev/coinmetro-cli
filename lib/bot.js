module.exports = function (api, utils, constants) {
  const c = require('ansi-colors');
  const ora = require('ora');

  const botModule = {};

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

  return botModule;
};
