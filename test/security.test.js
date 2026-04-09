const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CM_BIN = path.join(__dirname, '../bin/cm.js');
const ENV_PATH = path.join(os.homedir(), '.coinmetro-cli', 'env');

describe('Security Tests - Authentication and Authorization', () => {
  let originalEnv = null;

  beforeAll(() => {
    if (fs.existsSync(ENV_PATH)) {
      originalEnv = fs.readFileSync(ENV_PATH, 'utf8');
      fs.unlinkSync(ENV_PATH);
    }
  });

  afterAll(() => {
    if (originalEnv) {
      fs.writeFileSync(ENV_PATH, originalEnv);
    }
  });

  test('should block trade commands without authentication', (done) => {
    exec(`node ${CM_BIN} trade buy --pair BTCEUR --amount 0.01`, (error, stdout, stderr) => {
      try {
        const output = stdout + stderr;
        expect(output).toContain('No auth token found');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  test('should allow access to unauthenticated commands (gemini ask)', (done) => {
    exec(`node ${CM_BIN} gemini ask "hello"`, (error, stdout, stderr) => {
      try {
        // expect(output).not.toContain('No auth token found');
        expect(error).toBeNull();
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  test('should allow access to market list without authentication', (done) => {
    exec(`node ${CM_BIN} market list`, (error, stdout, stderr) => {
      try {
        const output = stdout + stderr;
        expect(output).not.toContain('No auth token found');
        // We don't care about the 404 here, just that it didn't fail due to auth
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  test('should allow access to postman view without authentication', (done) => {
    exec(`node ${CM_BIN} postman view`, (error, stdout, stderr) => {
      try {
        const output = stdout + stderr;
        expect(output).not.toContain('No auth token found');
        expect(error).toBeNull();
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  test('should block NLP trades without authentication', (done) => {
    exec(`node ${CM_BIN} trade nlp "buy 1 btc"`, (error, stdout, stderr) => {
      try {
        const output = stdout + stderr;
        expect(output).toContain('No auth token found');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
