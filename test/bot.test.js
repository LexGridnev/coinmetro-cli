const AIService = require('../lib/aiService');

describe('AI Trading Bot Logic', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIService();
  });

  test('should handle market trend analysis', async () => {
    const trend = await aiService.analyzeMarket('BTCEUR', { latest: 50000 });
    expect(trend).toBeDefined();
    expect(typeof trend).toBe('string');
  });

  test('should parse complex trade commands', async () => {
    // In demo mode or if API fails it falls back to simulation
    const trade = await aiService.parseTrade('Buy 0.1 BTC if price drops below 45k');
    expect(trade).toHaveProperty('action');
    expect(trade).toHaveProperty('pair');
  });
});
