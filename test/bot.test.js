const mockApi = {
  getLatestPrices: jest.fn(),
  getAssets: jest.fn(),
  getHistoricalPrices: jest.fn(),
  sendOrder: jest.fn(),
};

const botModule = require('../lib/bot')(mockApi);

describe('bot find-arbitrage', () => {
  it('should report no arbitrage opportunities if none are found', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockApi.getLatestPrices.mockResolvedValue({
      BTCEUR: { ask: 50000, bid: 49999 },
      ETHEUR: { ask: 3000, bid: 2999 },
      ETHBTC: { ask: 0.06, bid: 0.0599 },
    });
    mockApi.getAssets.mockResolvedValue([
      { symbol: 'BTC' },
      { symbol: 'EUR' },
      { symbol: 'ETH' },
    ]);

    await botModule['find-arbitrage']();

    expect(log).toHaveBeenCalledWith(expect.stringContaining('No arbitrage opportunities found.'));
    log.mockRestore();
  });

  it('should report an arbitrage opportunity if one is found', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockApi.getLatestPrices.mockResolvedValue({
      BTCEUR: { ask: 50000, bid: 49999 },
      ETHEUR: { ask: 3000, bid: 2999 },
      ETHBTC: { ask: 0.05, bid: 0.0499 }, // Artificial arbitrage opportunity
    });
    mockApi.getAssets.mockResolvedValue([
      { symbol: 'BTC' },
      { symbol: 'EUR' },
      { symbol: 'ETH' },
    ]);

    await botModule['find-arbitrage']();

    expect(log).toHaveBeenCalledWith(expect.stringContaining('Found potential arbitrage opportunities:'));
    log.mockRestore();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('API Error');
    mockApi.getLatestPrices.mockRejectedValue(error);
    const reject = jest.fn();

    await botModule['find-arbitrage']().catch(reject);

    expect(reject).toHaveBeenCalledWith(error);
  });
});

describe('bot ma-crossover', () => {
  afterEach(() => {
    jest.clearAllMocks();
    botModule.currentPosition = undefined;
  });

  it('should place a buy order on a golden cross', async () => {
    mockApi.getHistoricalPrices.mockResolvedValue([
      { c: 10 }, { c: 11 }, { c: 12 }, { c: 13 }, { c: 14 }, { c: 15 }, { c: 16 }, { c: 17 }, { c: 18 }, { c: 19 },
      { c: 20 }, { c: 21 }, { c: 22 }, { c: 23 }, { c: 24 }, { c: 25 }, { c: 26 }, { c: 27 }, { c: 28 }, { c: 29 },
    ]);
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await botModule['ma-crossover']('BTCEUR', 0.01, 5, 10, 3600000, true);

    expect(log).toHaveBeenCalledWith(expect.stringContaining('Golden cross detected.'));
    expect(mockApi.sendOrder).toHaveBeenCalledWith({
      orderPlatform: 'trade',
      orderType: 'market',
      buyingCurrency: 'BTC',
      sellingCurrency: 'EUR',
      buyingQty: 0.01,
    });
    log.mockRestore();
  });

  it('should place a sell order on a death cross', async () => {
    botModule.currentPosition = 'long';
    mockApi.getHistoricalPrices.mockResolvedValue([
      { c: 30 }, { c: 29 }, { c: 28 }, { c: 27 }, { c: 26 }, { c: 25 }, { c: 24 }, { c: 23 }, { c: 22 }, { c: 21 },
      { c: 20 }, { c: 19 }, { c: 18 }, { c: 17 }, { c: 16 }, { c: 15 }, { c: 14 }, { c: 13 }, { c: 12 }, { c: 11 },
    ]);
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await botModule['ma-crossover']('BTCEUR', 0.01, 5, 10, 3600000, true);

    expect(log).toHaveBeenCalledWith(expect.stringContaining('Death cross detected.'));
    expect(mockApi.sendOrder).toHaveBeenCalledWith({
      orderPlatform: 'trade',
      orderType: 'market',
      sellingCurrency: 'BTC',
      buyingCurrency: 'EUR',
      sellingQty: 0.01,
    });
    log.mockRestore();
  });

  it('should not place an order if there is no cross', async () => {
    mockApi.getHistoricalPrices.mockResolvedValue([
      { c: 15 }, { c: 16 }, { c: 17 }, { c: 18 }, { c: 19 }, { c: 18 }, { c: 17 }, { c: 16 }, { c: 15 }, { c: 14 },
    ]);
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await botModule['ma-crossover']('BTCEUR', 0.01, 5, 10, 3600000, true);

    expect(mockApi.sendOrder).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('API Error');
    mockApi.getHistoricalPrices.mockRejectedValue(error);
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});

    await botModule['ma-crossover']('BTCEUR', 0.01, 5, 10, 3600000, true);

    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('Bot error:'), error);
    errorLog.mockRestore();
  });
});
