const tradeFactory = require('../lib/trade');

describe('Trade Module', () => {
  let trade;
  const mockApi = { sendOrder: jest.fn(), getPairs: jest.fn().mockResolvedValue([]) };
  const mockAuth = { isDemo: () => true };

  beforeEach(() => {
    trade = tradeFactory(mockApi, mockAuth, {}, {});
  });

  afterEach(() => {
    process.exitCode = 0; // reset failure signalling between tests
  });

  test('executes buy order in demo mode', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await trade.execute('buy', 'BTCEUR', 1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Demo Mode: Order simulated successfully'));
    consoleSpy.mockRestore();
  });

  test('rejects invalid action with non-zero exit code', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    await trade.execute('hodl', 'BTCEUR', 1);
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid action'));
    expect(process.exitCode).toBe(1);
    errSpy.mockRestore();
  });

  test('rejects invalid amount with non-zero exit code', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    await trade.execute('buy', 'BTCEUR', -5);
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid amount'));
    expect(process.exitCode).toBe(1);
    errSpy.mockRestore();
  });

  test('nlp refuses empty query', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    await trade.nlp('');
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('provide a trade description'));
    expect(process.exitCode).toBe(1);
    errSpy.mockRestore();
  });
});
