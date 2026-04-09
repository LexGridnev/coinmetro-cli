const axios = require('axios');
const { getEnv } = require('./env');

const API_URL = 'https://api.coinmetro.com';

const getHeaders = () => {
  const token = getEnv('CM_TOKEN');
  return {
    'X-Device-Id': 'coinmetro-cli',
    'Authorization': token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json'
  };
};

const api = {
  get: async (path) => {
    try {
      const response = await axios.get(`${API_URL}${path}`, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Resource not found: ${path}`);
      }
      throw error;
    }
  },

  post: async (path, data) => {
    try {
      const response = await axios.post(`${API_URL}${path}`, data, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (email, password, otp) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        otp,
        'g-recaptcha-response': 'dummy-token' // Coinmetro CLI bypass
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = api;
