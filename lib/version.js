const pjson = require('../package.json'); // C2 fix: was '../../package.json'

module.exports.default = function () {
  return new Promise((resolve) => {
    console.log(`Coinmetro-CLI v${pjson.version} "Fable"`);
    resolve();
  });
};
