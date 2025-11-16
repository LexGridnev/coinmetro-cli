const { generate } = require('../lib/postman');
const axios = require('axios');
const fs = require('fs');

jest.mock('axios');
jest.mock('fs');

describe('postman generate', () => {
  it('should create the coinmetro_api.json file', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockResolvedValue({ data: { foo: 'bar' } });
    await generate(null);
    expect(fs.writeFileSync).toHaveBeenCalledWith('coinmetro_api.json', JSON.stringify({ foo: 'bar' }, null, 2));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Successfully saved API documentation to coinmetro_api.json'));
    log.mockRestore();
  });
});
