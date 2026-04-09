const fs = require('fs');
const path = require('path');
const colors = require('ansi-colors');

// Simulated Postman Collection Data
const collection = {
  info: {
    name: "Coinmetro API",
    description: "Official Coinmetro Exchange API"
  },
  item: [
    {
      name: "Authentication",
      item: [
        { name: "Login", request: { method: "POST", url: "/login" } },
        { name: "Get Profile", request: { method: "GET", url: "/users/profile" } }
      ]
    },
    {
      name: "Market Data",
      item: [
        { name: "Get Prices", request: { method: "GET", url: "/exchange/prices" } },
        { name: "Get Orderbook", request: { method: "GET", url: "/exchange/book/:pair" } }
      ]
    },
    {
      name: "Trading",
      item: [
        { name: "Create Order", request: { method: "POST", url: "/exchange/orders" } },
        { name: "Get Open Orders", request: { method: "GET", url: "/exchange/orders/open" } }
      ]
    }
  ]
};

const postman = (argv) => {
  const action = argv.action;
  const query = argv.query;

  switch (action) {
    case 'view':
      console.log(colors.bold.blue("--- Coinmetro API Documentation ---"));
      collection.item.forEach(category => {
        console.log(colors.cyan(`\n[ ${category.name} ]`));
        category.item.forEach(req => console.log(`  - ${req.name}`));
      });
      break;

    case 'search':
      if (!query) return console.log(colors.red("Please provide a search query."));
      console.log(colors.yellow(`Searching for "${query}"...`));
      const results = [];
      collection.item.forEach(cat => {
        cat.item.forEach(req => {
          if (req.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({ category: cat.name, name: req.name });
          }
        });
      });
      if (results.length === 0) {
        console.log("No matches found.");
      } else {
        results.forEach(r => console.log(`${colors.green(r.name)} (in ${r.category})`));
      }
      break;

    case 'detail':
      if (!query) return console.log(colors.red("Please provide a request name."));
      let found = null;
      collection.item.forEach(cat => {
        cat.item.forEach(req => {
          if (req.name.toLowerCase() === query.toLowerCase()) found = req;
        });
      });
      if (found) {
        console.log(colors.bold.green(`Request: ${found.name}`));
        console.log(`Method: ${found.request.method}`);
        console.log(`URL: ${found.request.url}`);
      } else {
        console.log(colors.red("Request not found. Use 'cm postman search' to find the exact name."));
      }
      break;

    default:
      console.log("Usage: cm postman <view|search|detail> [options]");
  }
};

module.exports = { postman };
