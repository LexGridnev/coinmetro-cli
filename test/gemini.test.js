const geminiFactory = require('../lib/gemini');

describe('Gemini Module', () => {
  const mockApi = { getTicker: jest.fn() };
  let gemini;

  beforeEach(() => {
    gemini = geminiFactory(mockApi);
  });

  test('should handle missing pair in analyze command', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await gemini.analyze();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Please specify a trading pair'));
    consoleSpy.mockRestore();
  });

  test('should attempt analysis for valid pair', async () => {
    mockApi.getTicker.mockResolvedValue({ latest: 50000 });
    // This test might fail without a real API key but it checks the flow
    await expect(gemini.analyze('BTCEUR')).resolves.not.toThrow();
  });
});
