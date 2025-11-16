const fs = require('fs');
const path = require('path');

module.exports.default = function (api) {
  return new Promise((resolve, reject) => {
    console.log('List of available commands and subcommands:');

    const libPath = path.resolve(__dirname, './');
    const commandFiles = fs.readdirSync(libPath).filter(file => file.endsWith('.js') && file !== 'ref.js' && file !== 'constants.js' && file !== 'utils.js' && file !== 'api.js' && file !== 'env.js');

    const commands = {};

    commandFiles.forEach(file => {
      const commandName = file.replace('.js', '');
      const module = require(`./${file}`);
      commands[commandName] = module;
    });

    const categories = {
      'auth': 'Authentication and mode',
      'market': 'Market data',
      'trade': 'Trade platform',
      'margin': 'Margin platform',
      'cmd': 'Command module',
      'gemini': 'Gemini',
      'postman': 'Postman',
      'version': 'Version'
    };

    Object.keys(categories).forEach(categoryKey => {
      if (commands[categoryKey]) {
        console.log(`\n${categories[categoryKey]}`);
        Object.keys(commands[categoryKey]).forEach(subcommandKey => {
          const func = commands[categoryKey][subcommandKey];
          if (typeof func === 'function' && func.help && func.help.descr) {
            console.log(`  cm ${categoryKey} ${subcommandKey} - ${func.help.descr}`);
          }
        });
      }
    });

    console.log('\nTo show detailed syntax for each command use the following format:');
    console.log('  cm <command> <subcommand> ?');
    console.log('  example: cm trade mbuy ?');

    console.log('\nCheck online docs for more info: https://github.com/LexGridnev/coinmetro-cli');

    resolve();
  });
};