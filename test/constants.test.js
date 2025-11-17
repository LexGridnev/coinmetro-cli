const constantsFactory = require('../lib/constants');

describe('lib/constants', () => {
  let mockApi;
  let constants;

  beforeEach(() => {
    mockApi = {
      getLatestPrices: jest.fn(),
    };
    constants = constantsFactory(mockApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getPairs should fetch and return dynamic pairs from API', async () => {
    const mockPrices = [
      { pair: 'BTCEUR', lastPrice: 100 },
      { pair: 'ETHEUR', lastPrice: 200 },
    ];
    mockApi.getLatestPrices.mockResolvedValue(mockPrices);

    const pairs = await constants.getPairs();

    expect(mockApi.getLatestPrices).toHaveBeenCalledTimes(1);
    expect(pairs).toEqual(['BTCEUR', 'ETHEUR']);
  });

  test('getPairs should cache fetched pairs and not call API again', async () => {
    const mockPrices = [
      { pair: 'BTCEUR', lastPrice: 100 },
    ];
    mockApi.getLatestPrices.mockResolvedValue(mockPrices);

    await constants.getPairs(); // First call
    const pairs = await constants.getPairs(); // Second call

    expect(mockApi.getLatestPrices).toHaveBeenCalledTimes(1); // API called only once
    expect(pairs).toEqual(['BTCEUR']);
  });

  test('getPairs should use fallback pairs if API call fails', async () => {
    mockApi.getLatestPrices.mockRejectedValue(new Error('API error'));

    // Temporarily mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const pairs = await constants.getPairs();

    expect(mockApi.getLatestPrices).toHaveBeenCalledTimes(1);
    expect(pairs.length).toBeGreaterThan(0); // Should contain fallback pairs
    expect(pairs).toContain('BTCEUR'); // Check for a known fallback pair
    expect(console.error).toHaveBeenCalled(); // Ensure error was logged

    console.error = originalConsoleError; // Restore console.error
  });

  test('should export other constants correctly', () => {
    expect(constants.chart).toBeDefined();
    expect(constants.chart.d.label).toBe('Daily');
    expect(constants.platform.trade).toBe('trade');
    expect(constants.operation.buy).toBe('buy');
    expect(constants.orderType.limit).toBe('limit');
    expect(constants.timeInForce.gtc).toBe('gtc');
    expect(constants.tif[1]).toBe('GTC');
    expect(constants.cancelMode.byprice).toBe('byprice');
    expect(constants.history.all).toBe('all');
    expect(constants.sort.byprice).toBe('byprice');
  });
});