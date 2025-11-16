const { ask } = require('../lib/gemini');

describe('gemini ask', () => {
  it('should print the prompt', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    await ask(null, 'test prompt', {});
    expect(log).toHaveBeenCalledWith('The current price of Bitcoin (BTC) is approximately $95,944.63.');
    log.mockRestore();
  });
});
