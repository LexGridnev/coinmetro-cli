const { AIService } = require('./aiService');
const colors = require('ansi-colors');
const readline = require('readline');

module.exports = (api, auth, utils, constants) => {
  const execute = async (action, pair, amount) => {
    // Validate even for direct (non-NLP) invocations.
    const a = String(action || '').toUpperCase();
    const p = String(pair || '').toUpperCase();
    const amt = Number(amount);
    if (a !== 'BUY' && a !== 'SELL') {
      console.error(colors.red(`Invalid action "${action}" — expected buy or sell.`));
      process.exitCode = 1;
      return;
    }
    if (!/^[A-Z0-9]{5,12}$/.test(p)) {
      console.error(colors.red(`Invalid pair "${pair}" — e.g. BTCEUR.`));
      process.exitCode = 1;
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      console.error(colors.red(`Invalid amount "${amount}".`));
      process.exitCode = 1;
      return;
    }

    console.log(colors.green(`Executing ${a} order for ${amt} ${p}...`));
    try {
      if (auth.isDemo()) {
        console.log(colors.yellow('Demo Mode: Order simulated successfully.'));
        return;
      }
      const res = await api.sendOrder({ action: a, pair: p, amount: amt, type: 'market' });
      console.log(colors.green('Order placed successfully!'));
      return res;
    } catch (e) {
      console.error(colors.red(`Order failed: ${e.message}`));
      process.exitCode = 1; // H2: scripts must see the failure
    }
  };

  const confirm = (question) =>
    new Promise((resolve) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });

  const nlp = async (query, forceYes = false) => {
    if (!query) {
      console.error(colors.red('Error: Please provide a trade description (e.g. "buy 100 eur of btc")'));
      process.exitCode = 1;
      return;
    }

    const ai = new AIService();
    console.log(colors.cyan('AI is parsing your request...'));

    let trade, source;
    try {
      // Validate the pair against the live exchange list when possible.
      let knownPairs = null;
      try {
        const pairs = await api.getPairs();
        if (Array.isArray(pairs)) knownPairs = pairs.map((x) => x.pair || x).filter(Boolean);
      } catch { /* offline / demo — validation falls back to format check */ }

      ({ trade, source } = await ai.parseTrade(query));
      if (knownPairs) ai.validateParsedTrade(trade, knownPairs);
    } catch (e) {
      console.error(colors.red(`Could not safely parse the request: ${e.message}`));
      console.error(colors.gray('Use the explicit form: cm trade buy --pair BTCEUR --amount 0.01'));
      process.exitCode = 1;
      return; // C4: NEVER fall back to a guess and trade on it
    }

    console.log(colors.green('\nAI understood the following:'));
    console.log(`Action: ${colors.bold(trade.action)}`);
    console.log(`Pair:   ${colors.bold(trade.pair)}`);
    console.log(`Amount: ${colors.bold(String(trade.amount))}`);
    console.log(`Type:   ${colors.bold(trade.type)}`);
    if (source === 'heuristic') {
      console.log(colors.yellow('Parsed by offline heuristic (no Gemini key).'));
    }

    // -y is only honored in demo mode with a genuine AI parse.
    // A live trade decided by an LLM must always pass a human eye. (C4/C5)
    const liveMode = !auth.isDemo();
    if (forceYes && (liveMode || source === 'heuristic')) {
      console.log(colors.yellow('--yes is ignored for live/heuristic NLP trades — confirmation required.'));
      forceYes = false;
    }

    if (forceYes) {
      return execute(trade.action, trade.pair, trade.amount);
    }

    const ok = await confirm(colors.yellow('\nExecute this trade? (y/N): '));
    if (ok) {
      await execute(trade.action, trade.pair, trade.amount);
    } else {
      console.log('Trade cancelled.');
    }
  };

  return { execute, nlp };
};
