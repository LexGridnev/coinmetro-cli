const axios = require('axios');
const env = require('./env');

const a = axios.create({
  timeout: 5000
});

const unauth = {
  'auth': {
    '': true,
    'demo': true,
    'live': true
  },
  'market': {
    'list': true,
    'ticker': true
  },
  'gemini': {
    'ask': true,
    'analyze': true
  },
  'postman': {
    'view': true,
    'search': true,
    'detail': true
  }
};

module.exports.isDemo = () => env.val('CM_DEMO') === 'true';

module.exports.setDemo = (val) => {
  env.setEnv('CM_DEMO', val ? 'true' : 'false');
};

module.exports.login = async (email, password, otp) => {
  const loginEmail = email || env.val('CM_EMAIL');
  const loginPassword = password || env.val('CM_PASSWORD');
  
  if (!loginEmail || !loginPassword) {
    throw new Error('Email and password required. Use auth --email <email> --password <password>');
  }

  // Mock login for demo
  if (module.exports.isDemo()) {
    const mockToken = 'demo_token_' + Buffer.from(loginEmail).toString('base64');
    env.update({
      'CM_TOKEN': mockToken,
      'CM_EMAIL': loginEmail
    });
    return mockToken;
  }

  try {
    const res = await a.post('https://api.coinmetro.com/auth/login', {
      email: loginEmail,
      password: loginPassword,
      otp
    });
    const token = res.data.token;
    env.update({
      'CM_TOKEN': token,
      'CM_EMAIL': loginEmail
    });
    return token;
  } catch (e) {
    throw new Error(e.response?.data?.message || e.message);
  }
};

module.exports.check = function (command, subcommand) {
  // console.log(`Checking auth for ${command}:${subcommand}`);
  this.help = {
    sig: '',
    descr: ''
  };

  return new Promise((resolve, reject) => {
    const isUnauth = typeof unauth[command] !== 'undefined' && unauth[command][subcommand] === true;
    
    if (isUnauth) {
      resolve();
    } else if (env.val('CM_TOKEN')) {
      a.defaults.headers['Authorization'] = `Bearer ${env.val('CM_TOKEN')}`;
      resolve();
    } else {
      reject(new Error('No auth token found'));
    }
  });
};
