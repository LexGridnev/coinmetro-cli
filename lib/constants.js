module.exports = function (api) {
  let dynamicPairs = []; // Moved inside the function
  const constants = {};

  constants.getPairs = async function() {
    if (dynamicPairs.length === 0) {
      try {
        const latestPrices = await api.getLatestPrices();
        dynamicPairs = latestPrices.map(price => price.pair);
      } catch (error) {
        console.error('Error fetching trading pairs:', error);
        // Fallback to a default list or handle error appropriately
        dynamicPairs = [
          'BTCEUR', 'ETHEUR', 'QNTEUR', 'ENJEUR', 'XCMEUR', 'XLMEUR', 'LTCEUR', 'XRPEUR', 'LINKEUR', 'BATEUR', 'BCHEUR', 'XCMBTC', 'ETHBTC', 'LTCBTC', 'OMGEUR', 'XRPBTC', 'BTCGBP', 'ETHGBP', 'XRPGBP', 'BTCAUD', 'BTCEUR', 'BTCSEK', 'ETHAUD', 'ETHSEK', 'KDAEUR', 'PRQEUR', 'QNTEUR', 'USDCEUR', 'XTZEUR', 'BCHUSD', 'BTCUSD', 'ETHUSD', 'LTCUSD', 'PRQBETH', 'XRPUSD', 'XCMUSD', 'XCMETH'
        ];
      }
    }
    return dynamicPairs;
  };

  constants.chart = {
    d: { timeframe: 300000, duration: 86400000, label: 'Daily' },
    w: { timeframe: 1800000, duration: 604800000, label: 'Weeky' },
    m: { timeframe: 14400000, duration: 2592000000, label: 'Monthly' },
    y: { timeframe: 86400000, duration: 31449600000, label: 'Yearly' }
  };

  constants.platform = {
    trade: 'trade',   // for market and limit orders
    margin: 'margin', // for margin and tram? orders
    tram: 'tram'      // for tram platform
  };

  constants.operation = {
    buy: 'buy',
    sell: 'sell'
  };

  constants.orderType = {
    limit: 'limit',
    margin: 'limit',
    tram: 'tram'
  };

  constants.timeInForce = {
    gtc: 'gtc', // good till canceled
    ioc: 'ioc', // immediate or cancel
    gtd: 'gtd', // good till date
    fok: 'fok'  // fill or kill
  };

  constants.tif = { // TODO: reverse lookup, may not be required in the future
    [1]: 'GTC',
    [2]: 'IOC',
    [3]: 'GTD',
    [4]: 'FOK'
  };

  constants.cancelMode = {
    byprice: 'byprice',
    bydate: 'bydate'
  };

  constants.history = {
    all: 'all',
    filled: 'filled'
  };

  constants.sort = {
    byprice: 'byprice',
    bydate: 'bydate'
  };

  return constants;
};
