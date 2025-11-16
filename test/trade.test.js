const { nlp } = require('../lib/trade');

describe('trade nlp', () => {
  it('should print the understood command', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    await nlp(null, 'buy 100 euro of bitcoin');
    expect(log).toHaveBeenCalledWith('Understood command: cm trade buy 100 eur @10000 btc');
    log.mockRestore();
  });
});
