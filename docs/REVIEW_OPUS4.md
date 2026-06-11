# Code Review — coinmetro-cli v0.5.9
**Reviewer:** Claude Opus 4.6 (via Junie)  
**Date:** 2026-04-18  

---

## Overview

`coinmetro-cli` is a Node.js CLI for the CoinMetro exchange with Gemini AI integration for NLP trading and market analysis. The project is well-structured with clear separation of concerns (auth, api, trade, market, gemini, bot modules) and has a solid test suite. Below are findings organized by severity.

---

## Critical Bugs

### 1. `this.isDemo()` crash in `auth.js` (line 44)
```js
module.exports.login = async (email, password, otp) => {
  // ...
  if (this.isDemo()) {  // BUG: `this` is not module.exports in arrow function
```
Arrow functions do not bind their own `this`. In a CommonJS module at the top level, `this` refers to `module.exports` at the time of definition — but since `isDemo` is assigned separately, the call may fail depending on execution order. This should use `module.exports.isDemo()` explicitly, or the login function should be a regular `function` declaration.

### 2. Module export/import mismatch for `gemini`
In `lib/gemini.js`, the module exports a **factory function** (`module.exports = (api) => ...`), but in `bin/cm.js` line 14 it's imported as:
```js
const { gemini } = require('../lib/gemini');
```
This destructures a function, yielding `undefined`. The `gemini` command handler calls `gemini.analyze()` which would throw `TypeError: Cannot read properties of undefined`. The correct import should be:
```js
const gemini = require('../lib/gemini')(api);
```

### 3. MCP module mismatch
`lib/mcp.js` exports `{ mcp }` where `mcp` is a function taking `argv`. But `cm.js` calls `mcp.start()` — a method that doesn't exist on the function. The MCP command would crash at runtime.

---

## Security Issues

### 4. Base64 is not encryption (`lib/env.js`)
Credentials are "obfuscated" with Base64 encoding. This provides zero security — any attacker with file access can decode instantly. Recommendation: use Node.js `crypto` module with a machine-derived key, or integrate with the OS keychain.

### 5. Password stored alongside token (`lib/auth.js` lines 48, 64)
The raw password is persisted to disk after login. Once a token is obtained, the password should be discarded. Storing it creates unnecessary risk.

### 6. No token expiry handling
Tokens are stored indefinitely with no refresh or expiry logic. Stale tokens will cause silent auth failures.

---

## Architectural Issues

### 7. `bot.js` calls `require('./api')` without factory arguments
```js
const api = require('./api');  // Returns a factory function, not an api instance
```
This means `api.getTicker()` etc. would fail because `api` is a function, not the configured axios wrapper. The bot module is non-functional.

### 8. Hardcoded model version in `aiService.js`
```js
this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
```
The model name should be configurable via environment variable or constants, especially since the project has already been updated to use different Gemini models in the past (per git history).

### 9. Silent demo fallbacks mask real errors
In `api.js`, a 404 on ticker returns fake random data:
```js
return { message: 'Demo mode: Ticker data fallback', latest: 50000 + Math.random() * 1000 };
```
This runs for ALL 404s, not just demo mode, silently returning fabricated prices. This could lead to incorrect trading decisions.

### 10. Synchronous file I/O in `env.js`
All file operations use `readFileSync`/`writeFileSync`. While acceptable for a CLI, this blocks the event loop and would be problematic if the tool is used as a library or MCP server.

---

## Code Quality

### 11. `aiService.js` exports class directly, not via `{ AIService }`
The module does `module.exports = AIService` but `trade.js` imports it as `const { AIService } = require('./aiService')`. This works because destructuring a class constructor is valid JS, but it's inconsistent and confusing.

### 12. Unused `balances` command
`cm.js` defines no `balances` command handler, though the README documents `cm balances`.

### 13. `e2e.test.js.bak` in test directory
A backup test file is committed to the repo. Should be removed or restored.

### 14. No input validation on trading pairs
Pair names are passed directly to the API without validation against known pairs. Typos like `BTCUER` would only fail at the API level with a potentially unhelpful error.

---

## Positive Observations

- **Clean CLI structure** using yargs with well-defined commands and subcommands
- **Auth middleware** pattern in yargs is elegant — checks auth before command execution
- **NLP trade confirmation** flow with readline is user-friendly
- **Comprehensive test suite** covering api, trade, bot, gemini, security, and more
- **Good documentation** with README, visual cheatsheet, and changes log
- **Demo mode** allows safe experimentation without real funds

---

## Recommended Priority Fixes

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | Fix `this.isDemo()` crash in auth.js | 5 min |
| P0 | Fix gemini/mcp import mismatches in cm.js | 10 min |
| P0 | Fix bot.js api require | 5 min |
| P1 | Restrict 404 fallback to demo mode only | 10 min |
| P1 | Don't persist password after login | 5 min |
| P2 | Make Gemini model configurable | 15 min |
| P2 | Add trading pair validation | 30 min |
| P3 | Replace Base64 with real encryption | 1-2 hrs |
| P3 | Add token refresh/expiry logic | 1-2 hrs |
