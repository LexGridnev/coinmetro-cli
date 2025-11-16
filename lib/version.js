const pjson = require('../../package.json');

module.exports.default = function () {
  return new Promise((resolve, reject) => {
    console.log(`Coinmetro-CLI v${pjson.version}`);
    resolve();
  });
};