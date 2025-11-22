const c = require('ansi-colors');

const intro = `
      ${c.yellow('$$$$$$$$$$')}
    ${c.yellow('$$$$$$$$$$$$$$')}
  ${c.yellow('$$$$$$$$$$$$$$$$$$')}
${c.yellow('$$$$$$$$$$$$$$$$$$$$$$')}
${c.yellow('$$$$$$$$$$$$$$$$$$$$$$')}
${c.yellow('$$$$$$$$$$  $$$$$$$$$$')}
${c.yellow('$$$$$$$$$$  $$$$$$$$$$')}
${c.yellow('$$$$$$$$$$  $$$$$$$$$$')}
${c.yellow('$$$$$$$$$$$$$$$$$$$$$$')}
  ${c.yellow('$$$$$$$$$$$$$$$$$$')}
    ${c.yellow('$$$$$$$$$$$$$$')}
      ${c.yellow('$$$$$$$$$$')}
`;

module.exports.default = function () {
  return new Promise((resolve) => {
    console.log(intro);
    console.log(c.bold.cyan('Welcome to Coinmetro CLI!'));
    console.log(c.cyan('Powered by Gemini AI'));
    console.log('');
    console.log(c.bold('Usage: cm <command> <subcommand> [options]'));
    console.log(c.bold('To see all available commands, run: cm ref'));
    resolve();
  });
};
