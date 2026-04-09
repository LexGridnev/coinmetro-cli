#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { intro } = require('../lib/intro');
const { auth } = require('../lib/auth');
const { trade } = require('../lib/trade');
const { bot } = require('../lib/bot');
const { market } = require('../lib/market');
const { postman } = require('../lib/postman');
const { mcp } = require('../lib/mcp');
const { gemini } = require('../lib/gemini');

const argv = yargs(hideBin(process.argv))
  .command('auth', 'Authenticate with Coinmetro', (yargs) => {
    return yargs.option('email', {
      alias: 'e',
      type: 'string',
      description: 'Coinmetro email'
    }).option('password', {
      alias: 'p',
      type: 'string',
      description: 'Coinmetro password'
    }).option('token', {
      alias: 't',
      type: 'string',
      description: '2FA token'
    }).option('gemini', {
      alias: 'g',
      type: 'string',
      description: 'Gemini AI API Key'
    });
  }, (argv) => {
    auth(argv);
  })
  .command('balances', 'Get account balances', {}, (argv) => {
    market.balances(argv);
  })
  .command('trade <action>', 'Execute a trade', (yargs) => {
    return yargs.positional('action', {
      describe: 'buy, sell, or nlp',
      type: 'string'
    })
    .command('nlp <query>', 'Trade using natural language', (yargs) => {
      return yargs.positional('query', {
        describe: 'Trade description (e.g. \"buy 100 eur of btc\")',
        type: 'string'
      });
    });
  }, (argv) => {
    trade(argv);
  })
  .command('bot <action>', 'Manage trading bots', (yargs) => {
    return yargs.positional('action', {
      describe: 'list, start, stop',
      type: 'string'
    });
  }, (argv) => {
    bot(argv);
  })
  .command('market <action>', 'Market data', (yargs) => {
    return yargs.positional('action', {
      describe: 'ticker, book',
      type: 'string'
    });
  }, (argv) => {
    market.info(argv);
  })
  .command('gemini <action>', 'Gemini AI features', (yargs) => {
    return yargs.positional('action', {
      describe: 'analyze',
      type: 'string'
    }).option('pair', {
      alias: 'p',
      type: 'string',
      description: 'Trading pair to analyze'
    });
  }, (argv) => {
    gemini(argv);
  })
  .command('postman <action>', 'Coinmetro Postman API documentation', (yargs) => {
    return yargs.positional('action', {
      describe: 'view, search, detail',
      type: 'string'
    }).option('query', {
      alias: 'q',
      type: 'string',
      description: 'Search query or request name'
    });
  }, (argv) => {
    postman(argv);
  })
  .command('mcp <action>', 'Model Context Protocol (MCP) Integration', (yargs) => {
    return yargs.positional('action', {
      describe: 'start',
      type: 'string'
    });
  }, (argv) => {
    mcp(argv);
  })
  .option('debug', {
    alias: 'd',
    type: 'boolean',
    description: 'Run in debug mode'
  })
  .help()
  .argv;

if (process.argv.length <= 2) {
  intro();
}
