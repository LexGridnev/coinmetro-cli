const axios = require('axios');
const env = require('./env');

module.exports = (auth, utils, constants) => {
  const isDemo = auth.isDemo();
  const baseURL = isDemo ? constants.API_DEMO_URL : constants.API_URL;

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
      if (
        error.response &&
        error.response.status === 404 &&
        error.config.url.includes('/ticker/') &&
        auth.isDemo()
      ) {
        // Loudly-marked fabricated data; never silently impersonate a price.
        console.warn('[demo] Ticker endpoint returned 404 — serving SIMULATED price.');
        return {
          simulated: true,
          message: 'Demo mode: SIMULATED ticker fallback (not a real price)',
          latest: 50000 + Math.random() * 1000
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
