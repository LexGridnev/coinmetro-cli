# coinmetro-cli

[![CI](https://github.com/LexGridnev/coinmetro-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/LexGridnev/coinmetro-cli/actions/workflows/ci.yml)
![version](https://img.shields.io/badge/version-0.6.0_%22Fable%22-blue)
![node](https://img.shields.io/badge/node-%3E%3D20.19-brightgreen)

A small, readable, hackable command-line client for the [CoinMetro](https://coinmetro.com) exchange — with AI-assisted natural-language trading powered by Google Gemini.

```
$ cm trade nlp -q "buy 0.05 btc"

AI understood the following:
Action: BUY
Pair:   BTCEUR
Amount: 0.05
Type:   MARKET

Execute this trade? (y/N):
```

## Install

```bash
git clone https://github.com/LexGridnev/coinmetro-cli.git
cd coinmetro-cli
npm install
npm link        # makes the `cm` command available globally
```

Requires **Node.js ≥ 20.19**.

## Quick start

```bash
# Start safe: sandbox mode with simulated orders
cm auth demo
cm auth --email you@example.com        # password asked via hidden prompt

cm market list                          # all trading pairs
cm market ticker --pair BTCEUR          # 24h summary
cm balances                             # wallet balances

cm trade buy --pair BTCEUR --amount 0.01
cm trade nlp -q "sell half an eth"      # AI-parsed, always confirmed

# When you're ready for real money:
cm auth live
cm auth --email you@example.com
```

## Commands

| Command | What it does |
|---|---|
| `cm auth [demo\|live]` | Switch sandbox/live mode (clears the session token) |
| `cm auth --email <email>` | Log in; password via hidden prompt (avoid `--password` — it leaks into shell history) |
| `cm market list` | List all trading pairs |
| `cm market ticker --pair <PAIR>` | 24-hour price summary |
| `cm balances` | Wallet balances |
| `cm trade buy\|sell --pair <PAIR> --amount <N>` | Place a market order |
| `cm trade nlp -q "<text>"` | Parse a natural-language request into a trade (Gemini) |
| `cm gemini analyze --pair <PAIR>` | AI market sentiment & technical analysis |
| `cm postman view\|search\|detail` | Browse bundled API documentation |
| `cm --version` | Version (currently `0.6.0 "Fable"`) |

> 🚧 **Work in progress:** `cm bot` and `cm mcp start` are stubs and don't do anything real yet. An actual [MCP](https://modelcontextprotocol.io) server exposing balances/ticker/orders to AI clients is the headline feature planned for v0.7.0.

## AI trading — safety model

Natural-language trading is convenient and dangerous, so v0.6.0 enforces hard rules:

- Every AI-parsed trade is **strictly validated**: action ∈ {BUY, SELL}, pair checked against the live exchange list, amount must be positive and below a sanity cap.
- An ambiguous or failed parse **refuses** — it never guesses.
- `-y` / `--yes` (skip confirmation) is **ignored for live trades**. A trade decided by an LLM always passes a human eye.
- The user query is treated as data, never as instructions (prompt-injection hardening).

Set `GEMINI_API_KEY` to enable AI features. Without it, a deliberately conservative offline parser handles only unambiguous requests like `buy 0.1 btc`, and never executes in live mode.

## Configuration & security

State lives in `~/.coinmetro-cli/env` (file mode `0600`, directory `0700`):

| Key | Meaning |
|---|---|
| `CM_EMAIL` | Login email |
| `CM_TOKEN` | Session token (base64-encoded at rest) |
| `CM_DEMO` | `true`/`false` — sandbox vs live |
| `GEMINI_API_KEY` | Enables AI features |

Your **password is never written to disk**. The token is recoverable by design (it's encoding, not encryption) — the real protection is the `0600` file mode and the token's limited lifetime.

## Development

```bash
npm test          # jest — 42 tests incl. a security suite
npm run lint
```

Architecture: dependency-injected module factories (`lib/api.js`, `lib/trade.js`, …) wired together in `bin/cm.js`. No framework, few dependencies, everything readable in one sitting. See [`docs/LEGENDARY_REVIEW.md`](docs/LEGENDARY_REVIEW.md) for the full v0.6.0 audit and [`CHANGES.md`](CHANGES.md) for history.

## Roadmap

- **v0.7.0** — real MCP server (`@modelcontextprotocol/sdk`, stdio): `get_balances`, `get_ticker`, `send_order` (confirm-gated) for Claude & other MCP clients
- **v0.8.0** — `cm watch <PAIR>` live ASCII chart, `--json` output for scripting, npm publish (`npx coinmetro-cli`)

## Disclaimer

This is an unofficial client, not affiliated with CoinMetro. Trading cryptocurrency involves substantial risk of loss. This tool executes real orders in live mode — review every trade. Nothing here is financial advice. Use at your own risk.

## License

MIT
