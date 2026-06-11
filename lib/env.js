const fs = require('fs');
const path = require('path');
const os = require('os');

const ENV_DIR = path.join(os.homedir(), '.coinmetro-cli');
const ENV_PATH = path.join(ENV_DIR, 'env');

// Keys that are base64-encoded at rest. NOTE: base64 is encoding, not
// encryption — it only prevents shoulder-surfing. Real protection comes
// from the 0600 file mode below. Passwords are NEVER persisted.
const ENCODED_KEYS = ['CM_TOKEN', 'GEMINI_API_KEY'];

// Keys we refuse to write to disk under any circumstances.
const FORBIDDEN_KEYS = ['CM_PASSWORD'];

const encode = (text) => Buffer.from(String(text)).toString('base64');
const decode = (text) => Buffer.from(text, 'base64').toString('utf8');

const ensureDir = () => {
  if (!fs.existsSync(ENV_DIR)) {
    fs.mkdirSync(ENV_DIR, { recursive: true, mode: 0o700 });
  }
};

const readFile = () => {
  if (!fs.existsSync(ENV_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(ENV_PATH, 'utf8'));
  } catch {
    return {};
  }
};

const setEnv = (key, value) => {
  if (FORBIDDEN_KEYS.includes(key)) {
    // Passwords live only in memory for the duration of the process.
    return;
  }
  ensureDir();
  const env = readFile();
  env[key] = ENCODED_KEYS.includes(key) ? encode(value) : value;
  fs.writeFileSync(ENV_PATH, JSON.stringify(env, null, 2), { mode: 0o600 });
  // writeFileSync mode only applies on creation — enforce on existing files too:
  fs.chmodSync(ENV_PATH, 0o600);
};

const update = (obj) => {
  Object.keys(obj).forEach((key) => setEnv(key, obj[key]));
};

const getEnv = (key) => {
  const env = readFile();
  const raw = env[key] !== undefined ? env[key] : process.env[key];
  if (raw === undefined || raw === null) return raw;
  // Only decode values that came from our file (env-var values are plain).
  if (env[key] !== undefined && ENCODED_KEYS.includes(key)) {
    try {
      return decode(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

const clear = (key) => {
  const env = readFile();
  if (key in env) {
    delete env[key];
    fs.writeFileSync(ENV_PATH, JSON.stringify(env, null, 2), { mode: 0o600 });
  }
};

const val = (key) => getEnv(key);

module.exports = { setEnv, getEnv, update, val, clear, ENV_PATH };
