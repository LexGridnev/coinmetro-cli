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
    expect(axios.get).toHaveBeenCalledWith('https://documenter.gw.postman.com/api/collections/3653795/SVfWN6KS?environment=3653795-7c329c2f-3e8e-c3b1-1903-98244dce10ac&segregateAuth=true&versionTag=latest');
    expect(fs.writeFileSync).toHaveBeenCalledWith('coinmetro_api.json', JSON.stringify({ foo: 'bar' }, null, 2));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Successfully saved API documentation to coinmetro_api.json'));
    log.mockRestore();
  });
});
