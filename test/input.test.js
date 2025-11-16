const { exec } = require('child_process');
const path = require('path');

const cmPath = path.resolve(__dirname, '../bin/cm.js');

describe('Input Validation Tests', () => {
  jest.setTimeout(30000); // Increase timeout for input validation tests

  it('should show an error for missing argument in market ticker', (done) => {
    exec(`node ${cmPath} market ticker`, (error, stdout, stderr) => {
      try {
        const output = stdout + stderr;
        expect(output).toContain('Missing pair argument');
        expect(error).not.toBeNull();
        expect(error.code).not.toBe(0);
      } finally {
        done();
      }
    });
  });

  it('should show an error for invalid argument format in market ticker (simulated API error)', (done) => {
    // This test relies on the API returning a 404 for an invalid pair,
    // which is handled by the API module.
    exec(`node ${cmPath} market ticker INVALIDPAIR`, (error, stdout, stderr) => {
      try {
        const output = stdout + stderr;
        expect(output).toContain('Error: Cannot GET /exchange/ticker/INVALIDPAIR (status: 404)');
        expect(error).not.toBeNull();
        expect(error.code).not.toBe(0);
      } finally {
        done();
      }
    });
  });
});
