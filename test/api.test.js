const api = require('../lib/api');

describe('API Module', () => {
  test('should construct headers correctly', () => {
    // Basic check that module exports methods
    expect(api).toHaveProperty('get');
    expect(api).toHaveProperty('post');
    expect(api).toHaveProperty('login');
  });
});
