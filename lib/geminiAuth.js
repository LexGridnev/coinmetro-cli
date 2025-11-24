const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.coinmetro-cli');
const configFile = path.join(configDir, '.gemini.json');

function saveApiKey(apiKey) {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  fs.writeFileSync(configFile, JSON.stringify({ apiKey }));
}

function loadApiKey() {
  if (fs.existsSync(configFile)) {
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    return config.apiKey;
  }
  return null;
}

function deleteApiKey() {
  if (fs.existsSync(configFile)) {
    fs.unlinkSync(configFile);
  }
}

module.exports = {
  saveApiKey,
  loadApiKey,
  deleteApiKey,
};
