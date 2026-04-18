const axios = require('axios');

module.exports = (auth, utils, constants) => {
  const isDemo = auth.isDemo();
  const baseURL = isDemo ? constants.API_DEMO_URL : constants.API_URL;
  
  const api = axios.create({
    baseURL,
    timeout: 10000
  });

  api.interceptors.request.use(config => {
    if (auth.token) {
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    response => response.data,
    error => {
      if (error.response && error.response.status === 404 && error.config.url.includes('/ticker/') && auth.isDemo()) {
        return { message: 'Demo mode: Ticker data fallback', latest: 50000 + Math.random() * 1000 };
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
