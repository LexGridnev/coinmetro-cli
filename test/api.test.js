const apiFactory = require('../lib/api');

describe('API Module', () => {
  const mockAuth = { isDemo: () => true };
  const mockUtils = {};
  const mockConstants = { API_DEMO_URL: 'http://demo' };

  test('should provide API methods', () => {
    const api = apiFactory(mockAuth, mockUtils, mockConstants);
    expect(api).toHaveProperty('getBalances');
    expect(api).toHaveProperty('getTicker');
  });
});
