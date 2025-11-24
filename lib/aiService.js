const { GoogleGenerativeAI } = require('@google/generative-ai');
const c = require('ansi-colors'); // For colored console output
const geminiAuth = require('./geminiAuth');

module.exports = function (api) { // api is not directly used here, but passed from cm.js
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || geminiAuth.loadApiKey();

  if (!GEMINI_API_KEY) {
    // Fallback to simulated responses if API key is missing
    return {
      askQuestion: async (prompt, debug = false) => {
        if (debug) {
          console.log(c.yellow('DEBUG: GEMINI_API_KEY not set, using simulated AI response.'));
          console.log(c.yellow(`DEBUG: Prompt: "${prompt}"`));
        }
        return `AI response to: "${prompt}" (simulated)`;
      },
      parseTradeCommand: async (input, debug = false) => {
        if (debug) {
          console.log(c.yellow('DEBUG: GEMINI_API_KEY not set, using simulated AI response for trade command.'));
          console.log(c.yellow(`DEBUG: Input: "${input}"`));
        }
        return {
          action: 'buy',
          quantity: '100',
          currency: 'eur',
          counterCurrency: 'btc',
          price: '10000'
        };
      }
    };
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro'}); // Using gemini-pro model

  return {
    askQuestion: async (prompt, debug = false) => {
      try {
        if (debug) {
          console.log(c.yellow('DEBUG: Using real Gemini AI service.'));
          console.log(c.yellow(`DEBUG: Prompt sent to Gemini: "${prompt}"`));
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (debug) {
          console.log(c.yellow('DEBUG: Raw Gemini API response:'), response);
          console.log(c.yellow('DEBUG: Parsed text response:'), text);
        }
        return text;
      } catch (error) {
        console.error(c.red('Error calling Gemini AI (askQuestion):'), error.message);
        if (debug) {
          console.error(c.red('DEBUG: Full Gemini AI error:'), error);
        }
        return `Error: Could not get a response from Gemini AI. (Simulated fallback: AI response to: "${prompt}")`;
      }
    },
    parseTradeCommand: async (input, debug = false) => {
      // This part requires more advanced prompt engineering for Gemini to parse trade commands
      // For now, we'll keep a simulated response or a very basic Gemini call
      try {
        if (debug) {
          console.log(c.yellow('DEBUG: Using real Gemini AI service for trade command parsing.'));
          console.log(c.yellow(`DEBUG: Input sent to Gemini for parsing: "${input}"`));
        }
        // Example: A more complex prompt for Gemini to parse trade commands
        const tradePrompt = `Parse the following natural language trade command and return a JSON object with 'action' (buy/sell), 'quantity', 'currency', 'counterCurrency', and 'price' (if specified). If price is not specified, omit it. Example: "buy 100 euro of bitcoin" -> { "action": "buy", "quantity": 100, "currency": "EUR", "counterCurrency": "BTC" }. Command: "${input}"`;
        const result = await model.generateContent(tradePrompt);
        const response = await result.response;
        const text = response.text();
        if (debug) {
          console.log(c.yellow('DEBUG: Raw Gemini API response for trade parsing:'), response);
          console.log(c.yellow('DEBUG: Parsed text response for trade parsing:'), text);
        }
        // Attempt to parse the JSON response from Gemini
        try {
          const parsed = JSON.parse(text);
          // Basic validation
          if (parsed.action && parsed.quantity && parsed.currency && parsed.counterCurrency) {
            return parsed;
          }
          throw new Error('Gemini response not in expected trade command JSON format.');
        } catch (jsonError) {
          console.error(c.red('Error parsing Gemini AI trade command response:'), jsonError.message);
          // Fallback to simulated if Gemini doesn't return valid JSON
          return {
            action: 'buy',
            quantity: '100',
            currency: 'eur',
            counterCurrency: 'btc',
            price: '10000'
          };
        }
      } catch (error) {
        console.error(c.red('Error calling Gemini AI (parseTradeCommand):'), error.message);
        if (debug) {
          console.error(c.red('DEBUG: Full Gemini AI error:'), error);
        }
        // Fallback to simulated response on API error
        return {
          action: 'buy',
          quantity: '100',
          currency: 'eur',
          counterCurrency: 'btc',
          price: '10000'
        };
      }
    }
  };
};