const fs = require('fs');
const path = require('path');

module.exports.default = function () {
  return new Promise((resolve, reject) => {
    try {
      const readmePath = path.resolve(__dirname, '../README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      const commandReference = readmeContent.substring(readmeContent.indexOf('## <a name="command-reference"></a> Command reference'));
      console.log(commandReference);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};