const api = require('../lib/api');
const axios = require('axios');

jest.mock('axios');

describe('api.getTicker', () => {
  it('should fetch ticker data for a given pair', async () => {
    const mockTickerData = {
      '24h': 95944.63,
      'high': 98000,
      'low': 95000,
      'volume': 1000,
      'last': 96000,
    };
    axios.get.mockResolvedValue({ data: mockTickerData });

    const coinmetroApi = api(false); // non-demo mode
    const tickerData = await coinmetroApi.getTicker('BTCEUR');

    expect(axios.get).toHaveBeenCalledWith('https://exchange.coinmetro.com/ticker/BTCEUR');
    expect(tickerData).toEqual(mockTickerData);
  });
});
