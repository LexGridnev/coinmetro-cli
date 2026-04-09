const { postman } = require('../lib/postman');

describe('Postman Integration', () => {
  test('should provide help for postman command', async () => {
    // Mock console.log to capture output
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await postman('view');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('should search documentation', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await postman('search', 'wallets');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
