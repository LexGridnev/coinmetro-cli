const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const pidFilePath = path.join(__dirname, 'lib', '.bot.pid');

const botName = process.argv[2];
const args = process.argv.slice(3);

console.log(`Starting bot ${botName} with args: ${args.join(' ')}`);

const child = spawn(process.execPath, [path.join(__dirname, 'bin', 'cm.js'), 'bot', botName, ...args], {
  detached: true,
  stdio: 'ignore',
});

fs.writeFileSync(pidFilePath, child.pid.toString());

console.log(`Bot started with PID: ${child.pid}`);

setTimeout(() => {
  child.unref();
}, 1000);
