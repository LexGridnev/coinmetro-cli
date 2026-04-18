const colors = require('ansi-colors');

const bot = (api) => async (argv) => {
  const action = argv.action;

  switch (action) {
    case 'list':
      console.log(colors.cyan('Fetching your bots...'));
      try {
        const bots = await api.get('/exchange/bots');
        if (bots.length === 0) {
          console.log(colors.yellow('No bots found.'));
        } else {
          console.table(bots);
        }
      } catch (e) {
        console.log(colors.red('Failed to fetch bots. Are you logged in?'));
      }
      break;

    case 'start':
      console.log(colors.green(`Starting bot ${argv.id || '...'}`));
      break;

    case 'stop':
      console.log(colors.yellow(`Stopping bot ${argv.id || '...'}`));
      break;

    default:
      console.log('Usage: cm bot <list|start|stop> [options]');
  }
};

module.exports = { bot };
