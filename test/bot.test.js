const { AIService } = require('../lib/aiService');

describe('AI Trading Bot Logic', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIService(null);
    aiService.model = null; // force offline path for deterministic tests
  });

  test('should handle market trend analysis', async () => {
    const trend = await aiService.analyzeMarket('BTCEUR', { latest: 50000 });
    expect(trend).toBeDefined();
    expect(typeof trend).toBe('string');
  });

  test('should parse trade commands via heuristic fallback', async () => {
    const { trade, source } = await aiService.parseTrade('Buy 0.1 btc right now');
    expect(source).toBe('heuristic');
    expect(trade.action).toBe('BUY');
    expect(trade.pair).toBe('BTCEUR');
    expect(trade.amount).toBe(0.1);
  });
});
