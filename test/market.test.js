const mockApi = {
  getTicker: jest.fn(),
  getLatestPrices: jest.fn(),
  getFullBook: jest.fn(),
  getTrades: jest.fn(),
  getHistoricalPrices: jest.fn(),
};

const mockUtils = {
  formatDate: jest.fn(),
};

const mockConstants = {
  chart: {
    d: { label: 'Daily' },
    w: { label: 'Weekly' },
    m: { label: 'Monthly' },
    y: { label: 'Yearly' },
  },
};

jest.mock('ora', () => {
  const oraInstance = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => oraInstance);
});

const mockPush = jest.fn();
jest.mock('cli-table3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      push: mockPush,
      toString: jest.fn().mockReturnValue('mock table'),
    };
  });
});

const asciichart = require('asciichart'); // Import actual module to mock its function
jest.mock('asciichart', () => ({
  plot: jest.fn().mockReturnValue('mock ascii chart'),
}));


const marketModule = require('../lib/market')(mockApi, mockUtils, mockConstants);
const { ticker, list } = marketModule;
const Table = require('cli-table3');
const ora = require('ora');


describe('market', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ticker', () => {
    it('should print the ticker information', async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockApi.getTicker.mockResolvedValue({
        '24h': 95944.63,
        high: 98000,
        low: 95000,
        volume: 1000,
        last: 96000,
      });
      await ticker('btceur');
      expect(log.mock.calls[0][0]).toMatch(/24-hour summary for BTCEUR:/);
      expect(log.mock.calls[1][0]).toMatch(/ {2}Last Price: 96000\.000000/);
      expect(log.mock.calls[2][0]).toMatch(/ {2}High: 98000\.000000/);
      expect(log.mock.calls[3][0]).toMatch(/ {2}Low: 95000\.000000/);
      expect(log.mock.calls[4][0]).toMatch(/ {2}Volume: 1000\.00/);
      log.mockRestore();
    });
  });

  describe('list', () => {
    it('should display prices in a table with a spinner', async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockPrices = [
        { pair: 'BTCEUR', price: 50000, ask: 50001, bid: 49999 },
        { pair: 'ETHEUR', price: 3000, ask: 3001, bid: 2999 },
      ];
      mockApi.getLatestPrices.mockResolvedValue(mockPrices);

      await list();

      expect(ora).toHaveBeenCalledWith('Fetching latest prices...');
      expect(ora().start).toHaveBeenCalled();
      expect(ora().succeed).toHaveBeenCalledWith('Latest prices loaded.');
      expect(Table).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith([expect.stringContaining('BTCEUR'), expect.stringContaining('50000.000000'), '50001.000000', '49999.000000']);
      expect(mockPush).toHaveBeenCalledWith([expect.stringContaining('ETHEUR'), expect.stringContaining('3000.000000'), '3001.000000', '2999.000000']);
      expect(log).toHaveBeenCalledWith('mock table');

      log.mockRestore();
    });
  });

  describe('chart', () => {
    it('should display an ASCII chart with a spinner on success', async () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockHistoricalPrices = Array.from({ length: 5 }, (_, i) => ({ o: 100 + i })); // Mock some open prices
      mockApi.getHistoricalPrices.mockResolvedValue(mockHistoricalPrices);

      // Mock process.stdout.columns and rows for consistent chart dimensions
      Object.defineProperty(process.stdout, 'columns', { value: 80 });
      Object.defineProperty(process.stdout, 'rows', { value: 25 });

      await marketModule.chart('BTCEUR', 'w');

      // Check spinner
      expect(ora).toHaveBeenCalledWith('Fetching historical prices for BTCEUR...');
      expect(ora().start).toHaveBeenCalled();
      expect(ora().succeed).toHaveBeenCalledWith('Historical prices loaded.');

      // Check asciichart.plot
      expect(asciichart.plot).toHaveBeenCalled();
      expect(asciichart.plot).toHaveBeenCalledWith(
        expect.any(Array), // The sampled prices
        expect.objectContaining({ height: 22 }) // th-3 = 25-3 = 22
      );
      // Let's make sure it was called with the correct label and chart output
      expect(log).toHaveBeenCalledWith(expect.stringContaining('Weekly chart for BTCEUR'));
      expect(log).toHaveBeenCalledWith('mock ascii chart');

      log.mockRestore();
    });

    it('should call spinner.fail on API error', async () => {
      const error = new Error('API Error');
      mockApi.getHistoricalPrices.mockRejectedValue(error);

      await expect(marketModule.chart('BTCEUR', 'w')).rejects.toThrow(error);

      expect(ora).toHaveBeenCalledWith('Fetching historical prices for BTCEUR...');
      expect(ora().start).toHaveBeenCalled();
      expect(ora().fail).toHaveBeenCalledWith('Failed to fetch historical prices');
    });
  });
});
