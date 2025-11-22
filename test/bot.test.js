const mockApi = {
  getLatestPrices: jest.fn(),
  getAssets: jest.fn(),
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
