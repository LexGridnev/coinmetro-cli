const axios = require('axios');
const env = require('./env');

module.exports = (auth, utils, constants) => {
  const isDemo = auth.isDemo();
  // constants.js never actually defined these URLs (baseURL was always
  // undefined and every request failed with ERR_INVALID_URL), so provide
  // real defaults while still allowing constants to override.
  const API_URL = constants.API_URL || 'https://api.coinmetro.com';
  const API_DEMO_URL = constants.API_DEMO_URL || 'https://demo-api.coinmetro.com';
  const baseURL = isDemo ? API_DEMO_URL : API_URL;

  const api = axios.create({
    baseURL,
    timeout: 10000
  });

  // C1 FIX: read the token from the single source of truth at request time.
  // (Previously this checked `auth.token`, a property nothing ever set,
  // so live authenticated calls went out anonymously.)
  api.interceptors.request.use((config) => {
    const token = env.val('CM_TOKEN');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const isTicker = error.config && error.config.url.includes('/ticker/');
      const is404 = error.response && error.response.status === 404;
      const isNetwork = !error.response; // demo env may be unreachable
      if (auth.isDemo() && isTicker && (is404 || isNetwork)) {
        // Loudly-marked fabricated data; never silently impersonate a price.
        console.warn('[demo] Ticker unavailable — serving SIMULATED price.');
        const base = 50000 + Math.random() * 1000;
        return {
          simulated: true,
          message: 'Demo mode: SIMULATED ticker fallback (not a real price)',
          latest: base,
          last: base,
          high: base * 1.02,
          low: base * 0.98,
          volume: 100
        };
      }
      return Promise.reject(error);
    }
  );

  return {
    getBalances: () => api.get('/wallets/balances'),
    getTicker: (pair) => api.get(`/exchange/ticker/${pair}`),
    getPairs: () => api.get('/exchange/pairs'),
    sendOrder: (order) => api.post('/exchange/orders', order)
  };
};
