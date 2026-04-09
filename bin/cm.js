#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { intro } = require('../lib/intro');
const auth = require('../lib/auth');
const utils = require('../lib/utils');
const constants = require('../lib/constants');
const api = require('../lib/api')(auth, utils, constants);
const trade = require('../lib/trade')(api, auth, utils, constants);
const market = require('../lib/market')(api, utils, constants);
const { postman } = require('../lib/postman');
const { mcp } = require('../lib/mcp');
const { gemini } = require('../lib/gemini');

const argv = yargs(hideBin(process.argv))
  .middleware(async (argv) => {
    const command = argv._[0];
    let subcommand = argv._[1] || '';
    
    // Normalize subcommand for various yargs formats
    if (command === 'trade' && (argv._.includes('nlp') || argv.query || argv.action === 'nlp')) {
      subcommand = 'nlp';
    } else if (argv.action && ['auth', 'market', 'gemini', 'postman'].includes(command)) {
      subcommand = argv.action;
    } else if (!subcommand && argv.action) {
      subcommand = argv.action;
    }
    
    if (command) {
      try {
        await auth.check(command, subcommand);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    }
  })
  .command('auth', 'Authenticate with Coinmetro', (yargs) => {
    yargs
      .option('email', { type: 'string', describe: 'Email address' })
      .option('password', { type: 'string', describe: 'Password' })
      .option('otp', { type: 'string', describe: 'OTP code' })
      .command('demo', 'Switch to demo/sandbox mode', () => {
        auth.setDemo(true);
        console.log('Switched to Demo mode. Please login again to refresh token.');
      })
      .command('live', 'Switch to live mode', () => {
        auth.setDemo(false);
        console.log('Switched to Live mode. Please login again to refresh token.');
      });
  }, async (argv) => {
    if (argv._[1] === 'demo' || argv._[1] === 'live') return;
    try {
      await auth.login(argv.email, argv.password, argv.otp);
      console.log('Successfully authenticated!');
    } catch (e) {
      console.error('Authentication failed:', e.message);
    }
  })
  .command('trade <action>', 'Execute a trade', (yargs) => {
    yargs
      .positional('action', { choices: ['buy', 'sell', 'nlp'], describe: 'Action to perform' })
      .option('pair', { alias: 'p', type: 'string', describe: 'Trading pair (e.g. BTCEUR)' })
      .option('amount', { alias: 'a', type: 'number', describe: 'Amount' })
      .option('query', { alias: 'q', type: 'string', describe: 'NLP query for trade' })
      .option('yes', { alias: 'y', type: 'boolean', describe: 'Skip confirmation' });
  }, async (argv) => {
    if (argv.action === 'nlp' || argv.query) {
      await trade.nlp(argv.query || argv._.slice(2).join(' '), argv.yes);
    } else {
      await trade.execute(argv.action, argv.pair, argv.amount);
    }
  })
  .command('market <action>', 'Market data', (yargs) => {
    yargs.positional('action', { choices: ['list', 'ticker'], describe: 'Action' });
  }, async (argv) => {
    if (argv.action === 'list') {
      const pairs = await market.getPairs();
      console.table(pairs);
    }
  })
  .command('postman <action>', 'Postman documentation', (yargs) => {
    yargs
      .positional('action', { choices: ['view', 'search', 'detail'], describe: 'Action' })
      .option('query', { alias: 'q', type: 'string' });
  }, async (argv) => {
    await postman(argv.action, argv.query);
  })
  .command('mcp <action>', 'MCP Server management', (yargs) => {
    yargs.positional('action', { choices: ['start'], describe: 'Action' });
  }, async (argv) => {
    if (argv.action === 'start') {
      await mcp.start();
    }
  })
  .command('gemini <action>', 'Gemini AI features', (yargs) => {
    yargs
      .positional('action', { choices: ['ask', 'analyze'], describe: 'Action' })
      .option('pair', { alias: 'p', type: 'string' });
  }, async (argv) => {
    if (argv.action === 'analyze') {
      await gemini.analyze(argv.pair || 'BTCEUR');
    } else {
      console.log('Gemini: I am ready to help with your trading strategy.');
    }
  })
  .option('debug', { type: 'boolean', default: false })
  .help()
  .argv;

if (process.argv.length === 2) {
  intro();
  yargs(hideBin(process.argv)).showHelp();
}
