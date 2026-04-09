# coinmetro-cli

Command line interface for [Coinmetro](https://coinmetro.com) exchange. Supercharged with Gemini AI for market analysis and natural language trading.

## Prerequisites

- Node.js (v14 or higher)
- Coinmetro Account (for real trading)
- Gemini API Key (optional, for AI features)

## Installation

```bash
git clone https://github.com/LexGridnev/coinmetro-cli.git
cd coinmetro-cli
npm install
npm link
```

## Setup

First, initialize your environment:

```bash
cm auth
```

Follow the prompts to enter your email, password, and optionally your Gemini API key. Credentials are obfuscated for basic security.

## Usage

### Market Analysis (AI Powered)

Get market sentiment and technical analysis from Gemini:

```bash
cm gemini analyze BTCEUR
```

### Trading

#### Natural Language Trading (AI Powered)

```bash
cm trade nlp "buy 100 usd of btc"
```
The AI will parse your intent and ask for confirmation before executing.

#### Standard Orders

```bash
cm trade buy BTC EUR 0.01 20000
cm trade sell BTC EUR 0.01 25000
```

### Account

```bash
cm balances
```

### Documentation & Developer Tools

#### Postman API Docs
Explore the Coinmetro API documentation directly from the CLI:

```bash
cm postman search "orders"
cm postman view "Get Open Orders"
```

#### MCP Server
Start the Model Context Protocol server to allow other AI agents (like Claude or ChatGPT) to use this CLI as a tool:

```bash
cm mcp start
```

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT
