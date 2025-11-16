const { ask } = require('../lib/gemini');

describe('gemini ask', () => {
  it('should print the AI response', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockAiService = {
      askQuestion: jest.fn().mockResolvedValue('AI response to: "test prompt" (simulated)'),
    };
    await ask(null, 'test prompt', {}, mockAiService);
    expect(mockAiService.askQuestion).toHaveBeenCalledWith('test prompt');
    expect(log).toHaveBeenCalledWith('AI response to: "test prompt" (simulated)');
    log.mockRestore();
  });
});
