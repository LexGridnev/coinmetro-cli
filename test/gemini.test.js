const geminiModule = require('../lib/gemini')();
const geminiAuth = require('../lib/geminiAuth');
const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.coinmetro-cli');
const configFile = path.join(configDir, '.gemini.json');

describe('gemini login', () => {
  afterEach(() => {
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
    }
  });

  it('should save the API key', async () => {
    await geminiModule.login('test-api-key');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    expect(config.apiKey).toBe('test-api-key');
  });
});

describe('gemini logout', () => {
  it('should delete the API key', async () => {
    geminiAuth.saveApiKey('test-api-key');
    await geminiModule.logout();
    expect(fs.existsSync(configFile)).toBe(false);
  });
});

describe('gemini ask', () => {
  afterEach(() => {
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
    }
    delete process.env.GEMINI_API_KEY;
  });

  it('should fail if no API key is available', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    await geminiModule.ask('test question');
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('Error:'), expect.stringContaining('GEMINI_API_KEY is not set'));
    errorLog.mockRestore();
  });
});