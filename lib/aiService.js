const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getEnv } = require('./env');

class AIService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || getEnv('GEMINI_API_KEY');
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    const modelName = getEnv('GEMINI_MODEL') || 'gemini-1.5-flash';
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: modelName }) : null;
  }

  /**
   * Cleans AI response by removing markdown code blocks
   */
  _cleanResponse(text) {
    return text.replace(/```json\n?|```/g, '').trim();
  }

  async parseTrade(query) {
    if (!this.model) {
      console.log('Gemini API key not found. Using simulated NLP parsing.');
      return this._simulateTradeParsing(query);
    }

    const prompt = `
      You are a trading assistant. Parse the following natural language trading request into a JSON object.
      The JSON should have these fields: action (BUY/SELL), pair (e.g. BTCEUR), amount (number), type (MARKET/LIMIT), price (optional number).
      
      Request: "${query}"
      
      Return ONLY the JSON. No explanation.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = this._cleanResponse(text);
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', text);
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('AI Parsing Error:', error.message);
      return this._simulateTradeParsing(query);
    }
  }

  async analyzeMarket(pair, tickerData) {
    if (!this.model) {
      return "Gemini API key missing. Market analysis is in demo mode: Market looks stable but volatile. Trend seems bullish for the short term.";
    }

    const prompt = `
      Analyze the following market data for ${pair} and provide a brief sentiment analysis and technical insight.
      
      Data: ${JSON.stringify(tickerData)}
      
      Format the response in a concise, professional manner.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('AI Analysis Error:', error.message);
      return "Error performing market analysis. Please check your connection and API key.";
    }
  }

  _simulateTradeParsing(query) {
    const q = query.toLowerCase();
    const result = {
      action: q.includes('buy') ? 'BUY' : 'SELL',
      pair: 'BTCEUR', // Default fallback
      amount: 0.001,
      type: 'MARKET'
    };

    if (q.includes('eth')) result.pair = 'ETHEUR';
    if (q.includes('btc')) result.pair = 'BTCEUR';
    
    const match = q.match(/(\d+(\.\d+)?)/);
    if (match) result.amount = parseFloat(match[0]);

    return result;
  }
}

module.exports = AIService;
