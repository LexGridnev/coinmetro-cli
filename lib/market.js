const Table = require('cli-table3');
module.exports = function (api, utils, constants) {
  const ora = require('ora');
  const c = require('ansi-colors');
  const ac = require('asciichart');

  if (process.env.NODE_ENV === 'test') {
    c.enabled = false;
  }

  const marketModule = {};

  marketModule.list = function () {
    const spinner = ora('Fetching latest prices...').start();
    return new Promise((resolve, reject) => {
      api.getLatestPrices()
        .then(latestPrices => {
          spinner.succeed('Latest prices loaded.');
          const table = new Table({
            head: [c.bold('Pair'), c.bold('Price'), c.bold('Ask'), c.bold('Bid')],
            colWidths: [15, 15, 15, 15]
          });
          latestPrices.sort((a, b) => a.pair < b.pair ? -1 : 1);
          latestPrices.forEach(p => {
            table.push([
              c.bold(p.pair),
              c.yellow(p.price.toFixed(6)),
              p.ask ? p.ask.toFixed(6) : 'N/A',
              p.bid ? p.bid.toFixed(6) : 'N/A'
            ]);
          });
          console.log(table.toString());
          resolve();
        })
        .catch(err => {
          spinner.fail('Failed to fetch prices');
          reject(err);
        });
    });
  };
  marketModule.list.help = {
    descr: 'List available markets (trading pairs)',
    format: 'cm market list',
    examples: [
      'cm market list'
    ]
  };

  marketModule.book = function (pair, rows=10) {
    if (typeof pair === 'undefined') throw new Error('Missing pair argument');
    pair = pair.toUpperCase();
    rows = parseInt(rows);
    return new Promise((resolve, reject) => {
      api.getFullBook(pair)
        .then(latestPrices => {
          const transform = (raw, reverse) => {
            const temp = Object.keys(raw);
            temp.sort((a, b) => {
              a = parseFloat(a);
              b = parseFloat(b);
              if (a === b) return 0;
              return a < b ? 1 : -1;
            });

            const rcount = temp.length > rows ? rows : temp.length;
            const start = reverse ? temp.length - rcount : 0;
            const end = reverse ? temp.length : rcount;
            const prices = [];

            for (let i=start; i<end; i++) {
              let price = parseFloat(temp[i]);
              let volume = raw[temp[i]];
              prices.push({ price, volume });
            }
            const max = prices.reduce((val, it) => val > it.price * it.volume ? val : it.price * it.volume, 0);
            const sum = prices.reduce((val, it) => val + it.price * it.volume, 0);
            return [max, sum, prices];
          };

          const [amax, asum, asks] = transform(latestPrices.book.ask, true);
          const [bmax, bsum, bids] = transform(latestPrices.book.bid, false);

          const max = Math.max(amax, bmax);

          const print = (color, max) => {
            return (item) => {
              let n = Math.round(item.price * item.volume / max * 50);
              let price = color(c.bold(item.price.toFixed(4).padStart(11)));
              let v1 = item.volume.toFixed(3).padStart(12);
              let v2 = (item.volume * item.price).toFixed(3).padStart(12);
              let size = color('▮'.repeat(n));
              console.log(`${price} ${v1} ${v2} ${size}`);
            };
          };

          console.log(`${c.bold.yellowBright(pair)} Book (depth: ${rows})`);
          asks.forEach(print(c.red, max));
          bids.forEach(print(c.greenBright, max));
          console.log('');
          console.log(`${c.bold.red('Sell')} sum: ${asum.toFixed(2).padStart(10, ' ')}`);
          console.log(`${c.bold.greenBright('Buy')}  sum: ${bsum.toFixed(2).padStart(10, ' ')}`);

          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  marketModule.book.help = {
    descr: 'List market book',
    format: `cm market book ${c.bold.red('<pair>')} [${c.bold.cyan('<rows>')}]`,
    examples: [
      `cm market book ${c.bold.red('xcmeur')} ${c.bold.cyan('15')}`
    ]
  };

  marketModule.trades = function (pair, date, time='0:00') {
    if (typeof pair === 'undefined') throw new Error('Missing pair argument');
    pair = pair.toUpperCase();
    date = typeof date !== 'undefined' ? Date.parse(`${date} ${time}`) : Date.now() - 86400000;

    return new Promise((resolve, reject) => {
      api.getTrades(pair, date)
        .then(trades => {
          trades.tickHistory.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);

          console.log(`Trades for ${c.bold.yellow(pair)} since ${utils.formatDate(date)}`);
          trades.tickHistory.forEach(t => {
            let q = t.qty.toFixed(3).padStart(12, ' ');
            let p = t.price.toFixed(4).padEnd(10, ' ');
            let d = utils.formatDate(t.timestamp);
            console.log(`${q} ${c.bold.yellowBright('@' + p)} ${c.dim(d)}`);
          });
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  marketModule.trades.help = {
    descr: 'List market trades since specified date, default is from last 24 hours',
    format: `cm market trades ${c.bold.red('<pair>')} [${c.bold.cyan('<date>')} ${c.bold.yellowBright('<time h:mm:ss>')}]`,
    examples: [
      `cm market trades ${c.bold.red('<pair>')} ${c.bold.cyan('2020-05-20')} ${c.bold.yellowBright('7:00:00')}`
    ]
  };

  marketModule.chart = function (pair, chartconf) {
    if (typeof pair === 'undefined') throw new Error('Missing pair argument');
    pair = pair.toUpperCase();
    const spinner = ora(`Fetching historical prices for ${pair}...`).start();
    return new Promise((resolve, reject) => {
      if (typeof chartconf === 'undefined') { chartconf = 'w'; }
      api.getHistoricalPrices(pair, constants.chart[chartconf])
        .then(historicalPrices => {
          spinner.succeed('Historical prices loaded.');
          const tw = process.stdout.columns - 13;
          const th = process.stdout.rows;
          const ratio = historicalPrices.length / tw;
          const padding = '          ';
          const prices = [];

          for (let i=0;i<tw;i++) {
            let j = Math.round(i * ratio);
            if(historicalPrices[j]) prices.push(historicalPrices[j].o);
          }

          console.log(`${constants.chart[chartconf].label} chart for ${c.bold.yellow(pair)}`);
          console.log(c.bold(ac.plot(prices, {
            height: th - 3,
            format (x) { return (padding + x.toFixed(4)).slice(-padding.length); }
          })));
          resolve();
        })
        .catch(err => {
          spinner.fail('Failed to fetch historical prices');
          reject(err);
        });
    });
  };
  marketModule.chart.help = {
    descr: 'Displays a chart. If no timeframe is specified it will show a weekly chart',
    format: `cm market chart ${c.bold.red('<pair>')} [${c.bold.cyan('<timeframe d|w|m|y>')}]`,
    examples: [
      `cm market chart ${c.bold.red('xapieur')} ${c.bold.cyan('y')}`
    ]
  };

  marketModule.ticker = function (pairArg, argv) {
    let pair = pairArg;
    if (typeof pair === 'undefined') throw new Error('Missing pair argument');
    pair = pair.toUpperCase();
    return new Promise((resolve, reject) => {
      api.getTicker(pair)
        .then(ticker => {
          console.log(`24-hour summary for ${c.bold.yellow(pair)}:`);
          console.log(`  Last Price: ${c.yellow(ticker.last.toFixed(6))}`);
          console.log(`  High: ${c.green(ticker.high.toFixed(6))}`);
          console.log(`  Low: ${c.red(ticker.low.toFixed(6))}`);
          console.log(`  Volume: ${ticker.volume.toFixed(2)}`);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  marketModule.ticker.help = {
    descr: 'Displays a 24-hour summary for a given pair.',
    format: `cm market ticker ${c.bold.red('<pair>')}`,
    examples: [
      `cm market ticker ${c.bold.red('btceur')}`
    ]
  };

  return marketModule;
};
