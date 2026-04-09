const tradeFactory = require('../lib/trade');

describe('Trade Module', () => {
  let trade;
  const mockApi = { sendOrder: jest.fn() };
  const mockAuth = { isDemo: () => true };

  beforeEach(() => {
    trade = tradeFactory(mockApi, mockAuth, {}, {});
  });

  test('should execute buy order in demo mode', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await trade.execute('buy', 'BTCEUR', 1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Demo Mode: Order simulated successfully'));
    consoleSpy.mockRestore();
  });
});
