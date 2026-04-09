const fs = require('fs');
const path = require('path');
const os = require('os');

const ENV_PATH = path.join(os.homedir(), '.coinmetro-cli', 'env');

const ensureDir = () => {
  const dir = path.dirname(ENV_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Basic obfuscation for credentials
 */
const obfuscate = (text) => Buffer.from(text).toString('base64');
const deobfuscate = (text) => Buffer.from(text, 'base64').toString('utf8');

const setEnv = (key, value) => {
  ensureDir();
  let env = {};
  if (fs.existsSync(ENV_PATH)) {
    try {
      env = JSON.parse(fs.readFileSync(ENV_PATH, 'utf8'));
    } catch (e) {
      env = {};
    }
  }
  
  // Obfuscate sensitive keys
  if (['CM_PASSWORD', 'CM_TOKEN', 'GEMINI_API_KEY'].includes(key)) {
    env[key] = obfuscate(value);
  } else {
    env[key] = value;
  }
  
  fs.writeFileSync(ENV_PATH, JSON.stringify(env, null, 2));
};

const getEnv = (key) => {
  if (!fs.existsSync(ENV_PATH)) return process.env[key];
  try {
    const env = JSON.parse(fs.readFileSync(ENV_PATH, 'utf8'));
    const val = env[key] || process.env[key];
    
    if (val && ['CM_PASSWORD', 'CM_TOKEN', 'GEMINI_API_KEY'].includes(key)) {
      return deobfuscate(val);
    }
    return val;
  } catch (e) {
    return process.env[key];
  }
};

module.exports = { setEnv, getEnv };
