#!/usr/bin/env node

const c = require('ansi-colors');
const auth = require('../lib/auth');
const env = require('../lib/env');
const api = require('../lib/api')(env.val('demo') === 'true'); // Initialize API here
const getConstants = require('../lib/constants'); // Import the function
const constants = getConstants(api); // Initialize constants
const getUtils = require('../lib/utils'); // Import the function
const utils = getUtils(api); // Initialize utils

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

const aiService = require('../lib/aiService')(api, argv); // Initialize aiService here

if (argv._.length == 0) {
  console.log(c.red.bold('Missing command argument'));
  process.exit(1);
}
const command = argv._[0];
let subcommand = argv._[1];

if (command !== 'gemini' && (command !== 'market' || subcommand !== 'ticker') && command !== 'postman' && command !== 'gemini-key') {
  auth.check(command, subcommand)
    .then(() => {
      const api = require('../lib/api')(env.val('demo') === 'true');
      let context;
      try {
        const requiredModule = require(`../lib/${command}.js`);
        if (typeof requiredModule === 'function') {
          context = requiredModule(api, utils, constants);
        } else {
          context = requiredModule;
        }
      }
      catch (err) {
        console.log(err);
        throw `Invalid base command '${command}'`;
      }

      if (typeof subcommand === 'undefined') subcommand = 'default';
      if (!context[subcommand]) throw `Invalid '${command}' subcommand: '${subcommand || ''}'`;

      if (argv._[2] === '?') {
        utils.printHelp(context, subcommand);
        return;
      }

      let commandPromise;
      if (command === 'trade' && subcommand === 'nlp') { // Specific handling for trade nlp
        commandPromise = context[subcommand](api, ...argv._.slice(2), argv, aiService);
      } else {
        commandPromise = context[subcommand](api, ...argv._.slice(2), argv);
      }

      commandPromise
        .then(() => {
          //we're done!
        })
        .catch(err => {
          if (err.response) { // semantic server error
            console.error(c.red.bold('Error:'), c.red(`${err.response.data.message} (status: ${err.response.status})`));
          } else { // user input error (probably)
            console.error(c.red.bold('Error:'), err.message || err);
          }
        });
    })
    .catch((err) => {
      console.error(c.red.bold('Authentication Error:'), c.red(err.message));
      throw err;
    });
} else {
  const api = require('../lib/api')(env.val('demo') === 'true');
  let context;
  try {
    const requiredModule = require(`../lib/${command}.js`);
    if (typeof requiredModule === 'function') {
      context = requiredModule(api, utils, constants);
    } else {
      context = requiredModule;
    }
  }
  catch (err) {
    console.error(err.message);
    throw err;
  }

  if (typeof subcommand === 'undefined') subcommand = 'default';
  if (!context[subcommand]) throw `Invalid '${command}' subcommand: '${subcommand || ''}'`;

  if (argv._[2] === '?') {
    utils.printHelp(context, subcommand);
    return;
  }

  const aiService = require('../lib/aiService')(api, argv);

  let commandPromise;
  if (command === 'gemini' || (command === 'trade' && subcommand === 'nlp')) {
    commandPromise = context[subcommand](api, ...argv._.slice(2), argv, aiService, argv.debug);
  } else if (command === 'market' && subcommand === 'ticker') {
    commandPromise = context[subcommand](argv._[2], argv); // Pass specific pair arg
  } else if (command === 'gemini-key') {
    commandPromise = context[subcommand](api, ...argv._.slice(2), argv);
  }
  else {
    commandPromise = context[subcommand](api, ...argv._.slice(2), argv);
  }

  commandPromise
    .then(() => {
    //we're done!
    })
    .catch(err => {
      if (err.message && err.message.includes('GEMINI_API_KEY environment variable is not set')) {
        // This is a non-fatal warning, do not re-throw
        console.error(c.yellow.bold('Warning:'), c.yellow(err.message));
      } else if (err.response) { // semantic server error
        console.error(c.red.bold('Error:'), c.red(`${err.response.data.message} (status: ${err.response.status})`));
        throw err;
      } else { // user input error (probably)
        console.error(c.red.bold('Error:'), err.message);
        throw err;
      }
    });
}