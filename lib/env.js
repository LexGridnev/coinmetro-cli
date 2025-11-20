const fs = require('fs');
const path = require('path');
const home = require('os').homedir();
const envFile = 'env';

function readObj (filename) {
  const dirpath = path.join(home, '.coinmetro-cli');
  const filepath = path.join(dirpath, filename);

  if (!fs.existsSync(dirpath)) { fs.mkdirSync(dirpath); }
  if (!fs.existsSync(filepath)) { fs.writeFileSync(filepath, ''); }

  const rows = fs.readFileSync(filepath).toString().split('\n');
  const obj = { };
  rows.forEach(row => {
    let [prop, value] =  row.split('=');
    if (prop) {
      obj[prop] = value;
    }
  });
  return obj;
}

function writeObj (filename, obj) {
  const filepath = path.join(home, '.coinmetro-cli', filename);
  const rows = [];
  Object.keys(obj).map(key => {
    rows.push(`${key}=${obj[key]}`);
  });
  fs.writeFileSync(filepath, rows.join('\n'));
}

module.exports = {
  val: function (prop) {
    const config = readObj(envFile);
    return Object.prototype.hasOwnProperty.call(config, prop) ? config[prop] : '';
  },
  update: function (configObj) {
    const config = readObj(envFile);
    Object.keys(configObj).forEach(key => {
      config[key] = configObj[key];
    });
    writeObj(envFile, config);
  },
  readObj: readObj,
  writeObj: writeObj
};
