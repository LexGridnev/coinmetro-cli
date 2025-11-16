const { nlp } = require('../lib/trade');

describe('trade nlp', () => {
  it('should print the understood command from AI service', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockAiService = {
      parseTradeCommand: jest.fn().mockResolvedValue({
        action: 'buy',
        quantity: '100',
        currency: 'eur',
        counterCurrency: 'btc',
        price: '10000'
      }),
    };
    await nlp(null, 'buy 100 euro of bitcoin', mockAiService);
    expect(mockAiService.parseTradeCommand).toHaveBeenCalledWith('buy 100 euro of bitcoin');
    expect(log).toHaveBeenCalledWith('Understood command: cm trade buy 100 eur @10000 btc');
    log.mockRestore();
  });
});
