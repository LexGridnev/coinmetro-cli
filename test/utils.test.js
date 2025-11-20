const { vol } = require('memfs');
const path = require('path');
const os = require('os');
const c = require('ansi-colors');
const utilsFactory = require('../lib/utils');

jest.mock('fs', () => {
  const { vol } = require('memfs');
  return vol;
});

describe('lib/utils', () => {
  const mockCoinmetroCliDir = path.join(os.homedir(), '.coinmetro-cli');
  let mockApi;
  let utils;

  beforeEach(() => {
    const fs = require('fs');
    fs.mkdirSync(mockCoinmetroCliDir, { recursive: true });
    mockApi = {
      getOpenOrders: jest.fn(),
      getOrderHistory: jest.fn(),
      cancelOrder: jest.fn(),
      sendOrder: jest.fn().mockResolvedValue({
        orderID: 'newOrder123',
        buyingCurrency: 'BTC',
        sellingCurrency: 'EUR',
        buyingQty: 0.1,
        sellingQty: 5000,
        boughtQty: 0,
        soldQty: 0,
        creationTime: Date.now(),
        timeInForce: 'GTC',
      }),
      getPairs: jest.fn().mockResolvedValue(['BTCEUR', 'ETHEUR']),
      getLatestPrices: jest.fn().mockResolvedValue([{ pair: 'BTCEUR', lastPrice: 50000 }]),
    };
    utils = utilsFactory(mockApi);
  });

  afterEach(() => {
    vol.reset();
  });
  
  // --- Test readObj and writeObj ---
  test('readObj and writeObj should handle file operations correctly', () => {
    const filename = 'test.obj';
    const testObj = { key: 'value', num: '123' };

    // Test writeObj
    utils.writeObj(filename, testObj);

    // Test readObj
    const readData = utils.readObj(filename);
    expect(readData).toEqual(testObj);
  });

  // --- Test formatDate ---
  test('formatDate should format milliseconds into a readable date string', () => {
    const date = new Date('2023-10-27T10:00:00Z');
    const ms = date.getTime();
    
    // Test full format
    const formattedFull = utils.formatDate(ms, true);
    expect(formattedFull).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);

    // Test short format
    const formattedShort = utils.formatDate(ms, false);
    expect(formattedShort).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  // --- Test printOrders ---
  test('printOrders should log formatted order details', async () => {
    const mockOrders = [
      {
        orderID: 'order1',
        buyingCurrency: 'BTC',
        sellingCurrency: 'EUR',
        buyingQty: 0.01,
        sellingQty: 500,
        boughtQty: 0,
        soldQty: 0,
        creationTime: Date.now(),
        timeInForce: 'GTC',
      },
    ];

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    await utils.printOrders(mockOrders);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('B'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('BTC'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('EUR'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('50000.00000'));
    
    consoleLogSpy.mockRestore();
  });

  // --- Test open (platform specific) ---
  test('open should list open orders for trade platform', async () => {
    mockApi.getOpenOrders.mockResolvedValue([
      { orderID: 'open1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.01, sellingQty: 500, creationTime: Date.now(), margin: false },
    ]);
    const openFunc = utils.open('trade');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await openFunc(mockApi, 'BTCEUR');
    
    await openFunc(mockApi, 'BTCEUR');

    consoleLogSpy.mockRestore();
  });

  // --- Test history (platform specific) ---
  test('history should list closed orders', async () => {
    mockApi.getOrderHistory.mockResolvedValue([
      { orderID: 'hist1', completionTime: Date.now(), boughtQty: 1, buyingCurrency: 'BTC', sellingCurrency: 'EUR', soldQty: 50000, margin: false },
    ]);
    const historyFunc = utils.history('trade');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await historyFunc(mockApi, new Date().toISOString().split('T')[0]);
    
    expect(mockApi.getOrderHistory).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('hist1'));

    consoleLogSpy.mockRestore();
  });

  // --- Test cancel (platform specific) ---
  test('cancel should cancel a specific order', async () => {
    mockApi.cancelOrder.mockResolvedValue({});
    const cancelFunc = utils.cancel('trade');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await cancelFunc(mockApi, 'orderToCancel');
    
    await cancelFunc(mockApi, 'orderToCancel');

    consoleLogSpy.mockRestore();
  });

  // --- Test mcancel (platform specific) ---
  test('mcancel should cancel multiple orders by price', async () => {
    mockApi.getOpenOrders.mockResolvedValue([
      { orderID: 'cancel1', price: 50000, buyingCurrency: 'BTC', sellingCurrency: 'EUR' },
      { orderID: 'cancel2', price: 51000, buyingCurrency: 'BTC', sellingCurrency: 'EUR' },
    ]);
    const mcancelFunc = utils.mcancel('trade');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await mcancelFunc(mockApi, 'BTCEUR', 'byprice', '@49000-52000');
    
    expect(mockApi.cancelOrder).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith('Canceled 2 orders');

    consoleLogSpy.mockRestore();
  });

  // --- Test trade (buy/sell) ---
  test('trade buy should send a buy order', async () => {
    const tradeFunc = utils.trade('trade', 'buy');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await tradeFunc(mockApi, '0.1', 'BTC', '@50000', 'EUR');
    
    expect(mockApi.sendOrder).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Success!'));

    consoleLogSpy.mockRestore();
  });

  // --- Test mtrade (buy/sell) ---
  test('mtrade buy should send multiple buy orders', async () => {
    const mtradeFunc = utils.mtrade('trade', 'buy');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await mtradeFunc(mockApi, '0.2', 'BTC', '@49000-51000', 'EUR', '2');
    
    expect(mockApi.sendOrder).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Success! The following orders were created:'));

    consoleLogSpy.mockRestore();
  });
});