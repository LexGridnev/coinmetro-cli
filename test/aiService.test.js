const AIService = require('../lib/aiService');

describe('AIService', () => {
  let ai;

  beforeEach(() => {
    ai = new AIService('fake-api-key');
  });

  test('should fallback to simulation when API fails', async () => {
    const result = await ai.parseTrade('buy 10 btc');
    expect(result).toHaveProperty('action', 'BUY');
    expect(result).toHaveProperty('pair', 'BTCEUR');
  });

  test('should clean markdown from AI responses', () => {
    const raw = '```json\n{"action": "BUY"}\n```';
    const cleaned = ai._cleanResponse(raw);
    expect(cleaned).toBe('{"action": "BUY"}');
  });

  test('should simulate trade parsing correctly', () => {
    const result = ai._simulateTradeParsing('sell 5 eth');
    expect(result.action).toBe('SELL');
    expect(result.pair).toBe('ETHEUR');
    expect(result.amount).toBe(5);
  });
});
