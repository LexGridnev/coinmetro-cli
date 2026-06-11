const { AIService } = require('../lib/aiService');

describe('AIService', () => {
  let ai;

  beforeEach(() => {
    ai = new AIService(null);
    ai.model = null; // force offline/heuristic path regardless of environment
  });

  test('parses a simple buy via heuristic when no model is available', async () => {
    const { trade, source } = await ai.parseTrade('buy 10 btc');
    expect(source).toBe('heuristic');
    expect(trade.action).toBe('BUY');
    expect(trade.pair).toBe('BTCEUR');
    expect(trade.amount).toBe(10);
  });

  test('cleans markdown from AI responses', () => {
    const raw = '```json\n{"action": "BUY"}\n```';
    expect(ai._cleanResponse(raw)).toBe('{"action": "BUY"}');
  });

  test('heuristic parses sell correctly', () => {
    const result = ai._heuristicTradeParsing('sell 5 eth');
    expect(result.action).toBe('SELL');
    expect(result.pair).toBe('ETHEUR');
    expect(result.amount).toBe(5);
  });

  test('heuristic refuses ambiguous queries instead of guessing', () => {
    expect(() => ai._heuristicTradeParsing('transfer 5 eth')).toThrow(/BUY vs SELL/);
    expect(() => ai._heuristicTradeParsing('buy some dogecoin')).toThrow(/asset|amount/);
  });

  describe('validateParsedTrade', () => {
    test('accepts a valid trade and normalizes casing', () => {
      const t = ai.validateParsedTrade({ action: 'buy', pair: 'btceur', amount: '0.5', type: 'market' });
      expect(t).toEqual({ action: 'BUY', pair: 'BTCEUR', amount: 0.5, type: 'MARKET', price: undefined });
    });

    test('rejects invalid action', () => {
      expect(() => ai.validateParsedTrade({ action: 'YOLO', pair: 'BTCEUR', amount: 1 })).toThrow(/Invalid action/);
    });

    test('rejects non-positive or absurd amounts', () => {
      expect(() => ai.validateParsedTrade({ action: 'BUY', pair: 'BTCEUR', amount: 0 })).toThrow(/Invalid amount/);
      expect(() => ai.validateParsedTrade({ action: 'BUY', pair: 'BTCEUR', amount: 1e9 })).toThrow(/Invalid amount/);
    });

    test('rejects pairs not on the exchange when a list is provided', () => {
      expect(() =>
        ai.validateParsedTrade({ action: 'BUY', pair: 'SCAMEUR', amount: 1 }, ['BTCEUR', 'ETHEUR'])
      ).toThrow(/not listed/);
    });

    test('requires a price for LIMIT orders', () => {
      expect(() =>
        ai.validateParsedTrade({ action: 'BUY', pair: 'BTCEUR', amount: 1, type: 'LIMIT' })
      ).toThrow(/price/);
    });
  });
});
