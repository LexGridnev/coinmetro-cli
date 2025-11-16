const { exec } = require('child_process');
const c = require('ansi-colors');

const mockCliPath = path.resolve(__dirname, '../bin/cm.js');
const mockTempDir = path.resolve(__dirname, '../.temp_e2e');
const mockEnvFilePath = path.join(mockTempDir, 'env');
const mockCmdFilePath = path.join(mockTempDir, 'cmd');
const mockPostmanFilePath = path.join(mockTempDir, 'coinmetro_api.json');

// Mock the env module to use a temporary directory for E2E tests
jest.mock('../lib/env', () => {
  const fs = require('fs'); // Moved fs import here
  const path = require('path'); // Moved path import here
  const actualEnv = jest.requireActual('../lib/env');
  return {
    ...actualEnv,
    val: jest.fn((prop) => {
      const config = actualEnv.readObj(mockEnvFilePath);
      return Object.prototype.hasOwnProperty.call(config, prop) ? config[prop] : '';
    }),
    update: jest.fn((configObj) => {
      const config = actualEnv.readObj(mockEnvFilePath);
      Object.keys(configObj).forEach(key => {
        config[key] = configObj[key];
      });
      actualEnv.writeObj(mockEnvFilePath, config);
    }),
    readObj: jest.fn(() => {
      if (!fs.existsSync(mockTempDir)) {
        fs.mkdirSync(mockTempDir, { recursive: true });
      }
      const filepath = mockEnvFilePath;
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, '');
      }
      const rows = fs.readFileSync(filepath).toString().split('\n');
      const obj = {};
      rows.forEach(row => {
        let [prop, value] = row.split('=');
        if (prop) {
          obj[prop] = value;
        }
      });
      return obj;
    }),
    writeObj: jest.fn((filename, obj) => {
      if (!fs.existsSync(mockTempDir)) {
        fs.mkdirSync(mockTempDir, { recursive: true });
      }
      const filepath = mockEnvFilePath; // Always write to mockEnvFilePath for simplicity in mock
      const rows = [];
      Object.keys(obj).map(key => {
        rows.push(`${key}=${obj[key]}`);
      });
      fs.writeFileSync(filepath, rows.join('\n'));
    })
  };
});

// Mock the utils module to use a temporary directory for E2E tests
jest.mock('../lib/utils', () => {
  const fs = require('fs'); // Moved fs import here
  const path = require('path'); // Moved path import here
  const actualUtils = jest.requireActual('../lib/utils');
  return {
    ...actualUtils,
    readObj: jest.fn((filename) => {
      if (!fs.existsSync(mockTempDir)) {
        fs.mkdirSync(mockTempDir, { recursive: true });
      }
      const filepath = path.join(mockTempDir, filename);
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, '');
      }
      const rows = fs.readFileSync(filepath).toString().split('\n');
      const obj = {};
      rows.forEach(row => {
        let [prop, value] = row.split('=');
        if (prop) {
          obj[prop] = value;
        }
      });
      return obj;
    }),
    writeObj: jest.fn((filename, obj) => {
      if (!fs.existsSync(mockTempDir)) {
        fs.mkdirSync(mockTempDir, { recursive: true });
      }
      const filepath = path.join(mockTempDir, filename);
      const rows = [];
      Object.keys(obj).map(key => {
        rows.push(`${key}=${obj[key]}`);
      });
      fs.writeFileSync(filepath, rows.join('\n'));
    })
  };
});

// Mock the api module to prevent real network calls during E2E tests
jest.mock('../lib/api', () => ({
  getLatestPrices: jest.fn(() => Promise.resolve([
    { pair: 'BTCEUR', lastPrice: 50000 },
    { pair: 'ETHEUR', lastPrice: 3000 },
    { pair: 'XCMEUR', lastPrice: 0.75 }
  ])),
  getBalances: jest.fn(() => Promise.resolve({
    TOTAL: { USD: 1000, EUR: 850, BTC: 0.02 },
    BTC: { USD: 50000, EUR: 42500 },
    EUR: { USD: 1.18 }
  })),
  getWallets: jest.fn(() => Promise.resolve({
    list: [
      { currency: 'BTC', balance: 0.02, reserved: 0.005 },
      { currency: 'EUR', balance: 850, reserved: 50 }
    ]
  })),
  getMarkets: jest.fn(() => Promise.resolve([
    { symbol: 'BTCEUR', base: 'BTC', quote: 'EUR', isActive: true },
    { symbol: 'ETHEUR', base: 'ETH', quote: 'EUR', isActive: true },
  ])),
  getHistoricalPrices: jest.fn(() => Promise.resolve([
    { time: Date.now() - 3600000, open: 49000, high: 50500, low: 48500, close: 50000, volume: 100 },
    { time: Date.now(), open: 50000, high: 51000, low: 49500, close: 50500, volume: 120 }
  ])),
  getTrades: jest.fn(() => Promise.resolve([
    { price: 50000, quantity: 0.1, side: 'buy', timestamp: Date.now() },
    { price: 50050, quantity: 0.05, side: 'sell', timestamp: Date.now() - 60000 }
  ])),
  getFullBook: jest.fn(() => Promise.resolve({
    bids: [{ price: 49990, quantity: 0.5 }, { price: 49980, quantity: 1.0 }],
    asks: [{ price: 50010, quantity: 0.7 }, { price: 50020, quantity: 0.8 }]
  })),
  login: jest.fn((username, password, otp) => {
    if (username === 'test@example.com' && password === 'password123') {
      return Promise.resolve({ token: 'mock_token_123', userId: 'mock_user_id' });
    }
    return Promise.reject(new Error('Invalid credentials'));
  }),
  cancelOrder: jest.fn((orderID) => {
    if (orderID === 'mock_order_id_to_cancel') {
      return Promise.resolve({ status: 'canceled' });
    }
    return Promise.reject(new Error('Order not found'));
  }),
  getOpenOrders: jest.fn(() => Promise.resolve([
    { orderID: 'mock_open_order_1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.01, sellingQty: 500, creationTime: Date.now() },
    { orderID: 'mock_open_order_2', buyingCurrency: 'ETH', sellingCurrency: 'EUR', buyingQty: 0.1, sellingQty: 300, creationTime: Date.now() }
  ])),
  getOrderHistory: jest.fn(() => Promise.resolve([
    { orderID: 'mock_history_order_1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', boughtQty: 0.02, soldQty: 1000, completionTime: Date.now() - 86400000 },
    { orderID: 'mock_history_order_2', buyingCurrency: 'XCM', sellingCurrency: 'EUR', boughtQty: 100, soldQty: 75, completionTime: Date.now() - 172800000 }
  ])),

  sendOrder: jest.fn(() => Promise.resolve({
    orderID: 'mock_order_id',
    buyingCurrency: 'BTC',
    sellingCurrency: 'EUR',
    buyingQty: 0.01,
    sellingQty: 500,
    completionTime: Date.now(),
    creationTime: Date.now(),
    timeInForce: 'GTC'
  })),
  setMarginCollateral: jest.fn(() => Promise.resolve()),
  getMargin: jest.fn(() => Promise.resolve({
    available: { EUR: 1000, BTC: 0.01 },
    collateral: { EUR: 500 },
    reserved: { BTC: 0.001 },
    exposure: { EUR: 200 }
  })),
  getMarginOpenOrders: jest.fn(() => Promise.resolve([
    { orderID: 'mock_margin_open_order_1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.01, sellingQty: 500, creationTime: Date.now(), margin: true },
  ])),
  getMarginOrderHistory: jest.fn(() => Promise.resolve([
    { orderID: 'mock_margin_history_order_1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', boughtQty: 0.02, soldQty: 1000, completionTime: Date.now() - 86400000, margin: true },
  ])),
  sendMarginOrder: jest.fn(() => Promise.resolve({
    orderID: 'mock_margin_order_id',
    buyingCurrency: 'BTC',
    sellingCurrency: 'EUR',
    buyingQty: 0.01,
    sellingQty: 500,
    completionTime: Date.now(),
    creationTime: Date.now(),
    timeInForce: 'GTC',
    margin: true
  })),
  cancelMarginOrder: jest.fn((orderID) => {
    if (orderID === 'mock_margin_order_id_to_cancel') {
      return Promise.resolve({ status: 'canceled' });
    }
    return Promise.reject(new Error('Margin order not found'));
  }),
}));

// Mock the aiService module
jest.mock('../lib/aiService', () => ({
  ask: jest.fn((prompt) => Promise.resolve(`AI response for: ${prompt}`)),
  parseTradeCommand: jest.fn((command) => {
    if (command.includes('buy')) {
      return Promise.resolve({ action: 'buy', quantity: 100, currency: 'EUR', counterCurrency: 'BTC' });
    }
    if (command.includes('sell')) {
      return Promise.resolve({ action: 'sell', quantity: 0.5, currency: 'BTC', counterCurrency: 'EUR', price: 40000 });
    }
    return Promise.reject(new Error('Could not parse trade command'));
  })
}));

describe('E2E Tests for coinmetro-cli', () => {
  jest.setTimeout(30000); // Increase timeout for E2E tests

  beforeEach(() => {
    // Clear and recreate temporary directory for each test
      fs.rmSync(mockTempDir, { recursive: true, force: true });
    fs.mkdirSync(mockTempDir, { recursive: true });

    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up temporary directory after all tests
    if (fs.existsSync(mockTempDir)) {
      fs.rmSync(mockTempDir, { recursive: true, force: true });
    }
  });

  const runCli = (args = []) => {
    return new Promise((resolve) => {
      exec(`node ${mockCliPath} ${args.join(' ')}`, { cwd: mockTempDir }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });
  };

  // --- General Commands ---
  test('should display help message for unknown command', async () => {
    const { stdout } = await runCli(['unknown-command']);
    expect(stdout).toContain('Unknown command');
  });

  test('cm ref should display dynamically generated command list', async () => {
    const { stdout, error } = await runCli(['ref']);
    expect(error).toBeNull();
    expect(stdout).toContain('List of available commands and subcommands:');
    expect(stdout).toContain('Authentication and mode');
    expect(stdout).toContain('  cm auth demo - activate demo mode');
    expect(stdout).toContain('Market data');
    expect(stdout).toContain('  cm market ticker - display ticker information for a specific market');
    expect(stdout).toContain('Gemini');
    expect(stdout).toContain('  cm gemini ask - Ask a question to the Gemini AI.');
    expect(stdout).toContain('Postman');
    expect(stdout).toContain('  cm postman generate - Generate a Postman collection from the Coinmetro API documentation.');
    expect(stdout).toContain('Check online docs for more info: https://github.com/LexGridnev/coinmetro-cli');
  });

  // --- Gemini Commands ---
  test('gemini ask should return a simulated AI response', async () => {
    const { stdout, error } = await runCli(['gemini', 'ask', '"What is the weather?"']);
    expect(error).toBeNull();
    expect(stdout).toContain('AI response for: What is the weather?');
    expect(require('../lib/aiService').ask).toHaveBeenCalledWith('What is the weather?');
  });

  // --- Trade Commands ---
  test('trade open should list open orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'open']);
    expect(error).toBeNull();
    expect(stdout).toContain('mock_open_order_1');
    expect(stdout).toContain('mock_open_order_2');
    expect(require('../lib/api').getOpenOrders).toHaveBeenCalled();
  });

  test('trade history should list filled orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'history']);
    expect(error).toBeNull();
    expect(stdout).toContain('mock_history_order_1');
    expect(stdout).toContain('mock_history_order_2');
    expect(require('../lib/api').getOrderHistory).toHaveBeenCalled();
  });

  test('trade sell should send a sell order', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'sell', '0.01', 'BTC', '@50000', 'EUR']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success!');
    expect(stdout).toContain('mock_order_id');
    expect(require('../lib/api').sendOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'trade',
      orderType: 'limit',
      fillStyle: 'sell',
      buyingCurrency: 'EUR',
      sellingCurrency: 'BTC',
      buyingQty: 500,
      sellingQty: 0.01,
      timeInForce: 'GTC'
    }));
  });

  test('trade mcsell should send multiple sell orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'msell', '0.01', 'BTC', '@49000-51000', 'EUR', '2']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success! The following orders were created:');
    expect(require('../lib/api').sendOrder).toHaveBeenCalledTimes(2);
    expect(require('../lib/api').sendOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'trade',
      orderType: 'limit',
      fillStyle: 'sell',
      buyingCurrency: 'EUR',
      sellingCurrency: 'BTC',
      timeInForce: 'GTC'
    }));
  });

  test('trade cancel should cancel a single order', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'cancel', 'mock_order_id_to_cancel']);
    expect(error).toBeNull();
    expect(stdout).toContain('Successfully canceled order mock_order_id_to_cancel');
    expect(require('../lib/api').cancelOrder).toHaveBeenCalledWith('mock_order_id_to_cancel');
  });

  test('trade mcancel should cancel multiple orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    // Mock getOpenOrders to return orders that match criteria for mcancel
    require('../lib/api').getOpenOrders.mockResolvedValueOnce([
      { orderID: 'order_1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.01, sellingQty: 500, creationTime: Date.now(), price: 50000 },
      { orderID: 'order_2', buyingCurrency: 'ETH', sellingCurrency: 'EUR', buyingQty: 0.1, sellingQty: 300, creationTime: Date.now(), price: 3000 },
      { orderID: 'order_3', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.005, sellingQty: 250, creationTime: Date.now(), price: 50000 }
    ]);
    const { stdout, error } = await runCli(['trade', 'mcancel', 'BTCEUR', 'byprice', '@40000-60000']);
    expect(error).toBeNull();
    expect(stdout).toContain('Canceled 2 orders'); // Expect 2 orders to be canceled
    expect(require('../lib/api').cancelOrder).toHaveBeenCalledTimes(2);
    expect(require('../lib/api').cancelOrder).toHaveBeenCalledWith('order_1');
    expect(require('../lib/api').cancelOrder).toHaveBeenCalledWith('order_3');
  });

  // --- Market Commands ---
  test('market list should return mocked market data', async () => {
    const { stdout, error } = await runCli(['market', 'list']);
    expect(error).toBeNull();
    expect(stdout).toContain('BTCEUR');
    expect(stdout).toContain('ETHEUR');
    expect(require('../lib/api').getMarkets).toHaveBeenCalled();
  });

  test('market chart should return mocked chart data', async () => {
    const { stdout, error } = await runCli(['market', 'chart', 'BTCEUR', 'd']);
    expect(error).toBeNull();
    expect(stdout).toContain('BTCEUR');
    expect(stdout).toContain('50000'); // Close price from mock
    expect(require('../lib/api').getHistoricalPrices).toHaveBeenCalledWith('BTCEUR', expect.objectContaining({ timeframe: 300000, duration: 86400000 }));
  });

  test('market trades should return mocked trade data', async () => {
    const { stdout, error } = await runCli(['market', 'trades', 'BTCEUR']);
    expect(error).toBeNull();
    expect(stdout).toContain('BTCEUR');
    expect(stdout).toContain('50000'); // Price from mock
    expect(require('../lib/api').getTrades).toHaveBeenCalledWith('BTCEUR', expect.any(Number));
  });

  test('market book should return mocked order book data', async () => {
    const { stdout, error } = await runCli(['market', 'book', 'BTCEUR']);
    expect(error).toBeNull();
    expect(stdout).toContain('BTCEUR');
    expect(stdout).toContain('Bids');
    expect(stdout).toContain('Asks');
    expect(stdout).toContain('49990'); // Bid price from mock
    expect(stdout).toContain('50010'); // Ask price from mock
    expect(require('../lib/api').getFullBook).toHaveBeenCalledWith('BTCEUR');
  });

  // --- Postman Commands ---
  test('postman generate should create coinmetro_api.json', async () => {
    const { error } = await runCli(['postman', 'generate']);
    expect(error).toBeNull();
    expect(fs.existsSync(mockPostmanFilePath)).toBe(true);
    const fileContent = fs.readFileSync(mockPostmanFilePath, 'utf8');
    expect(fileContent).toContain('"info": {'); // Basic check for JSON content
  });

  // --- Auth Commands ---
  test('auth login should successfully log in and store token', async () => {
    const { stdout, error } = await runCli(['auth', 'login', 'test@example.com', 'password123']);
    expect(error).toBeNull();
    expect(stdout).toContain('Login successful, token updated (live mode is activated)');
    expect(require('../lib/api').login).toHaveBeenCalledWith('test@example.com', 'password123', null);
    const envContent = require('../lib/env').readObj(mockEnvFilePath);
    expect(envContent.token).toBe('mock_token_123');
  });

  test('auth login should fail with invalid credentials', async () => {
    const { stderr, error } = await runCli(['auth', 'login', 'wrong@example.com', 'wrongpass']);
    expect(error).not.toBeNull();
    expect(error.code).toBe(1); // Expect non-zero exit code for error
    expect(stderr).toContain('Invalid credentials');
    expect(require('../lib/api').login).toHaveBeenCalledWith('wrong@example.com', 'wrongpass', null);
  });

  test('auth demo should set demo mode', async () => {
    const { stdout, error } = await runCli(['auth', 'demo']);
    expect(error).toBeNull();
    expect(stdout).toContain('You are now in demo mode! Please login again to update token.');
    const envContent = require('../lib/env').readObj(mockEnvFilePath);
    expect(envContent.demo).toBe('true');
  });

  test('auth live should set live mode', async () => {
    const { stdout, error } = await runCli(['auth', 'live']);
    expect(error).toBeNull();
    expect(stdout).toContain('You are now in live mode! Please login again to update token.');
    const envContent = require('../lib/env').readObj(mockEnvFilePath);
    expect(envContent.demo).toBe('false');
  });

  // --- Cmd Commands ---
  test('cmd store should store a command', async () => {
    const { stdout, error } = await runCli(['cmd', 'store', '"cm market ticker BTCEUR"', 'myTicker']);
    expect(error).toBeNull();
    expect(stdout).toContain('Command stored successfully');
    const cmdContent = require('../lib/utils').readObj(mockCmdFilePath);
    expect(cmdContent.myTicker).toBe('cm market ticker BTCEUR');
  });

  test('cmd list should list stored commands', async () => {
    // First store a command
    await runCli(['cmd', 'store', '"cm market ticker BTCEUR"', 'myTicker']);
    const { stdout, error } = await runCli(['cmd', 'list']);
    expect(error).toBeNull();
    expect(stdout).toContain('myTicker: cm market ticker BTCEUR');
  });

  test('cmd run should execute a stored command', async () => {
    // First store a command
    await runCli(['cmd', 'store', '"cm market ticker BTCEUR"', 'myTicker']);
    const { stdout, error } = await runCli(['cmd', 'run', 'myTicker']);
    expect(error).toBeNull();
    expect(stdout).toContain('BTCEUR'); // Output from the executed ticker command
    expect(stdout).toContain('Last Price: 50000');
  });

  test('cmd del should delete a stored command', async () => {
    // First store a command
    await runCli(['cmd', 'store', '"cm market ticker BTCEUR"', 'myTicker']);
    const { stdout, error } = await runCli(['cmd', 'del', 'myTicker']);
    expect(error).toBeNull();
    expect(stdout).toContain('Deleted command myTicker');
    const cmdContent = require('../lib/utils').readObj(mockCmdFilePath);
    expect(cmdContent.myTicker).toBeUndefined();
  });

  // --- Trade Balance (requires auth) ---
  test('trade balance should fail without auth token', async () => {
    const { stderr, error } = await runCli(['trade', 'balance']);
    expect(error).not.toBeNull();
    expect(error.code).toBe(1);
    expect(stderr).toContain('No auth token found');
  });

  test('trade balance should show balances with auth token', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'balance']);
    expect(error).toBeNull();
    expect(stdout).toContain('Platform     Available      Total');
    expect(stdout).toContain('BTC');
    expect(stdout).toContain('EUR');
    expect(require('../lib/api').getBalances).toHaveBeenCalled();
    expect(require('../lib/api').getWallets).toHaveBeenCalled();
  });

  // --- Margin Commands ---
  test('margin open should list open margin orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'open']);
    expect(error).toBeNull();
    expect(stdout).toContain('mock_margin_open_order_1');
    expect(require('../lib/api').getMarginOpenOrders).toHaveBeenCalled();
  });

  test('margin history should list filled margin orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'history']);
    expect(error).toBeNull();
    expect(stdout).toContain('mock_margin_history_order_1');
    expect(require('../lib/api').getMarginOrderHistory).toHaveBeenCalled();
  });

  test('margin buy should send a margin buy order', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'buy', '0.01', 'BTC', '@50000', 'EUR']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success!');
    expect(stdout).toContain('mock_margin_order_id');
    expect(require('../lib/api').sendMarginOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'margin',
      orderType: 'limit',
      fillStyle: 'buy',
      buyingCurrency: 'BTC',
      sellingCurrency: 'EUR',
      buyingQty: 0.01,
      sellingQty: 500,
      timeInForce: 'GTC',
      margin: true
    }));
  });

  test('margin sell should send a margin sell order', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'sell', '0.01', 'BTC', '@50000', 'EUR']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success!');
    expect(stdout).toContain('mock_margin_order_id');
    expect(require('../lib/api').sendMarginOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'margin',
      orderType: 'limit',
      fillStyle: 'sell',
      buyingCurrency: 'EUR',
      sellingCurrency: 'BTC',
      buyingQty: 500,
      sellingQty: 0.01,
      timeInForce: 'GTC',
      margin: true
    }));
  });

  test('margin mbuy should send multiple margin buy orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'mbuy', '0.01', 'BTC', '@49000-51000', 'EUR', '2']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success! The following orders were created:');
    expect(require('../lib/api').sendMarginOrder).toHaveBeenCalledTimes(2);
    expect(require('../lib/api').sendMarginOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'margin',
      orderType: 'limit',
      fillStyle: 'buy',
      buyingCurrency: 'BTC',
      sellingCurrency: 'EUR',
      timeInForce: 'GTC',
      margin: true
    }));
  });

  test('margin msell should send multiple margin sell orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'msell', '0.01', 'BTC', '@49000-51000', 'EUR', '2']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success! The following orders were created:');
    expect(require('../lib/api').sendMarginOrder).toHaveBeenCalledTimes(2);
    expect(require('../lib/api').sendMarginOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'margin',
      orderType: 'limit',
      fillStyle: 'sell',
      buyingCurrency: 'EUR',
      sellingCurrency: 'BTC',
      timeInForce: 'GTC',
      margin: true
    }));
  });

  test('margin cancel should cancel a single margin order', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['margin', 'cancel', 'mock_margin_order_id_to_cancel']);
    expect(error).toBeNull();
    expect(stdout).toContain('Successfully canceled order mock_margin_order_id_to_cancel');
    expect(require('../lib/api').cancelMarginOrder).toHaveBeenCalledWith('mock_margin_order_id_to_cancel');
  });

  test('margin mcancel should cancel multiple margin orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    // Mock getMarginOpenOrders to return orders that match criteria for mcancel
    require('../lib/api').getMarginOpenOrders.mockResolvedValueOnce([
      { orderID: 'margin_order_1', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.01, sellingQty: 500, creationTime: Date.now(), price: 50000, margin: true },
      { orderID: 'margin_order_2', buyingCurrency: 'ETH', sellingCurrency: 'EUR', buyingQty: 0.1, sellingCurrency: 300, creationTime: Date.now(), price: 3000, margin: true },
      { orderID: 'margin_order_3', buyingCurrency: 'BTC', sellingCurrency: 'EUR', buyingQty: 0.005, sellingQty: 250, creationTime: Date.now(), price: 50000, margin: true }
    ]);
    const { stdout, error } = await runCli(['margin', 'mcancel', 'BTCEUR', 'byprice', '@40000-60000']);
    expect(error).toBeNull();
    expect(stdout).toContain('Canceled 2 orders'); // Expect 2 orders to be canceled
    expect(require('../lib/api').cancelMarginOrder).toHaveBeenCalledTimes(2);
    expect(require('../lib/api').cancelMarginOrder).toHaveBeenCalledWith('margin_order_1');
    expect(require('../lib/api').cancelMarginOrder).toHaveBeenCalledWith('margin_order_3');
  });

  // --- Trade Send Order (requires auth) ---
  test('trade buy should send an order', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'buy', '0.01', 'BTC', '@50000', 'EUR']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success!');
    expect(stdout).toContain('mock_order_id');
    expect(require('../lib/api').sendOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'trade',
      orderType: 'limit',
      fillStyle: 'buy',
      buyingCurrency: 'BTC',
      sellingCurrency: 'EUR',
      buyingQty: 0.01,
      sellingQty: 500,
      timeInForce: 'GTC'
    }));
  });

  // --- Mtrade Send Order (requires auth) ---
  test('mtrade buy should send multiple orders', async () => {
    // Login first
    await runCli(['auth', 'login', 'test@example.com', 'password123']);
    const { stdout, error } = await runCli(['trade', 'mbuy', '0.01', 'BTC', '@49000-51000', 'EUR', '2']);
    expect(error).toBeNull();
    expect(stdout).toContain('Success! The following orders were created:');
    expect(require('../lib/api').sendOrder).toHaveBeenCalledTimes(2);
    expect(require('../lib/api').sendOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderPlatform: 'trade',
      orderType: 'limit',
      fillStyle: 'buy',
      buyingCurrency: 'BTC',
      sellingCurrency: 'EUR',
      timeInForce: 'GTC'
    }));
  });
});
