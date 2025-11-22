const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const pidFilePath = path.join(__dirname, 'lib', '.bot.pid');
const logFilePath = path.join(__dirname, 'bot.log');

const args = process.argv.slice(2);

const child = spawn(process.execPath, [path.join(__dirname, 'bin', 'cm.js'), 'bot', 'ma-crossover', ...args], {
  detached: true,
  stdio: 'ignore',
});

fs.writeFileSync(pidFilePath, child.pid.toString());

child.unref();
