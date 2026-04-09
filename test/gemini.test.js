const { gemini } = require('../lib/gemini');
const api = require('../lib/api');

jest.mock('../lib/api');

describe('Gemini Module', () => {
  test('should handle missing pair in analyze command', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await gemini({ action: 'analyze', _: ['gemini', 'analyze'] });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Please specify a trading pair'));
    consoleSpy.mockRestore();
  });

  test('should attempt analysis for valid pair', async () => {
    api.get.mockResolvedValue({ last: 50000 });
    // This test might fail without a real API key but it checks the flow
    await expect(gemini({ action: 'analyze', pair: 'BTCEUR' })).resolves.not.toThrow();
  });
});
