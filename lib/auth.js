const axios = require('axios');
const readline = require('readline');
const env = require('./env');

const a = axios.create({ timeout: 5000 });

const unauth = {
  auth: { '': true, demo: true, live: true },
  market: { list: true, ticker: true },
  gemini: { ask: true, analyze: true },
  postman: { view: true, search: true, detail: true }
};

const isDemo = () => env.val('CM_DEMO') === 'true';

const setDemo = (val) => {
  env.setEnv('CM_DEMO', val ? 'true' : 'false');
  env.clear('CM_TOKEN'); // a live token is invalid in demo and vice versa
};

/**
 * Prompt for a secret without echoing it to the terminal.
 * Avoids --password flags leaking into shell history / `ps` output.
 */
const promptHidden = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const onData = (char) => {
      char = char.toString();
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.removeListener('data', onData);
      } else {
        // overwrite the echoed char with a star
        readline.moveCursor(process.stdout, -1, 0);
        process.stdout.write('*');
      }
    };
    process.stdin.on('data', onData);
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });

const login = async (email, password, otp) => {
  const loginEmail = email || env.val('CM_EMAIL');
  let loginPassword = password; // never read a persisted password — env.js refuses to store it

  if (!loginEmail) {
    throw new Error('Email required. Use: cm auth --email <email>');
  }
  if (!loginPassword) {
    if (!process.stdin.isTTY) {
      throw new Error('Password required (no TTY for interactive prompt). Use --password only in trusted automation.');
    }
    loginPassword = await promptHidden(`Password for ${loginEmail}: `);
  }
  if (!loginPassword) throw new Error('Password required.');

  if (isDemo()) {
    const mockToken = 'demo_token_' + Buffer.from(loginEmail).toString('base64');
    env.update({ CM_TOKEN: mockToken, CM_EMAIL: loginEmail });
    return mockToken;
  }

  try {
    const res = await a.post('https://api.coinmetro.com/auth/login', {
      email: loginEmail,
      password: loginPassword,
      otp
    });
    const token = res.data.token;
    env.update({ CM_TOKEN: token, CM_EMAIL: loginEmail });
    return token;
  } catch (e) {
    throw new Error(e.response?.data?.message || e.message);
  }
};

const logout = () => {
  env.clear('CM_TOKEN');
};

const check = (command, subcommand) => {
  const isUnauth =
    typeof unauth[command] !== 'undefined' && unauth[command][subcommand] === true;
  if (isUnauth) return Promise.resolve();
  if (env.val('CM_TOKEN')) return Promise.resolve();
  return Promise.reject(
    new Error('No auth token found. Run: cm auth --email <email>')
  );
};

module.exports = { isDemo, setDemo, login, logout, check, promptHidden };
