const mockApi = {
  getOpenOrders: jest.fn(),
  getOrderHistory: jest.fn(),
  cancelOrder: jest.fn(),
  sendOrder: jest.fn(),
  getPairs: jest.fn().mockResolvedValue(['BTCEUR', 'ETHEUR']),
  getLatestPrices: jest.fn().mockResolvedValue([{ pair: 'BTCEUR', lastPrice: 50000 }]),
};

const mockUtils = {
  open: jest.fn(() => jest.fn()),
  history: jest.fn(() => jest.fn()),
  cancel: jest.fn(() => jest.fn()),
  mcancel: jest.fn(() => jest.fn()),
  trade: jest.fn(() => jest.fn()),
  mtrade: jest.fn(() => jest.fn()),
  printOrders: jest.fn(),
};

const mockConstants = {
  platform: {
    trade: 'trade',
    margin: 'margin',
    tram: 'tram',
  },
  operation: {
    buy: 'buy',
    sell: 'sell',
  },
  timeInForce: {
    gtc: 'GTC',
    ioc: 'IOC',
    gtd: 'GTD',
    fok: 'FOK',
  },
  cancelMode: {
    byprice: 'byprice',
    bydate: 'bydate',
  },
};

const tradeModule = require('../lib/trade')(mockApi, mockUtils, mockConstants);
const { nlp } = tradeModule;
const utils = require('../lib/utils');

jest.mock('../lib/utils', () => {
  const actualUtils = jest.requireActual('../lib/utils');
  return {
    ...actualUtils,
    open: jest.fn(() => jest.fn()),
    history: jest.fn(() => jest.fn()),
    cancel: jest.fn(() => jest.fn()),
    mcancel: jest.fn(() => jest.fn()),
    trade: jest.fn(() => jest.fn()),
    mtrade: jest.fn(() => jest.fn()),
  };
});

describe('trade nlp', () => {
  it('should print the understood command from AI service', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockAiService = {
      parseTradeCommand: jest.fn().mockResolvedValue({
        action: 'buy',
        quantity: '100',
        currency: 'eur',
        counterCurrency: 'btc',
        price: '10000'
      }),
    };
    await nlp(null, 'buy 100 euro of bitcoin', {}, mockAiService);
    expect(mockAiService.parseTradeCommand).toHaveBeenCalledWith('buy 100 euro of bitcoin', undefined);
    expect(log).toHaveBeenCalledWith('Understood command: cm trade buy 100 eur @10000 btc');
    log.mockRestore();
  });
});
