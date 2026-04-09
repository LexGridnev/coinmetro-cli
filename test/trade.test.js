const { trade } = require('../lib/trade');

describe('Trade Module', () => {
  test('should show usage when no action provided', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await trade({ _: ['trade'] });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: cm trade'));
    consoleSpy.mockRestore();
  });
});
