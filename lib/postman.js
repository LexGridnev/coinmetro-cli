const c = require('ansi-colors');
const axios = require('axios');
const fs = require('fs');

const generate = async (api, ...args) => {
  console.log(c.green('Fetching Postman documentation...'));
  try {
    const response = await axios.get('https://documenter.gw.postman.com/api/collections/3653795/SVfWN6KS?environment=3653795-7c329c2f-3e8e-c3b1-1903-98244dce10ac&segregateAuth=true&versionTag=latest');
    fs.writeFileSync('coinmetro_api.json', JSON.stringify(response.data, null, 2));
    console.log(c.green('Successfully saved API documentation to coinmetro_api.json'));
  } catch (error) {
    console.error(c.red(`Error fetching documentation: ${error.message}`));
  }
};

module.exports = {
  generate: generate,
  default: generate,
};
