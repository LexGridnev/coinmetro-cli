const { ticker } = require('../lib/market');
const api = require('..//lib/api');

jest.mock('../lib/api', () => ({
  getTicker: jest.fn(),
}));

describe('market ticker', () => {
  it('should print the ticker information', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    api.getTicker.mockResolvedValue({
      '24h': 95944.63,
      'high': 98000,
      'low': 95000,
      'volume': 1000,
      'last': 96000,
    });
    await ticker(api, 'btceur');
    expect(log.mock.calls[0][0]).toMatch(/24-hour summary for BTCEUR:/);
    expect(log.mock.calls[1][0]).toMatch(/  Last Price: 96000\.000000/);
    expect(log.mock.calls[2][0]).toMatch(/  High: 98000\.000000/);
    expect(log.mock.calls[3][0]).toMatch(/  Low: 95000\.000000/);
    expect(log.mock.calls[4][0]).toMatch(/  Volume: 1000\.00/);
    log.mockRestore();
  });
});
