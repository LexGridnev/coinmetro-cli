# Changes

## v0.6.0 "Fable" — 2026-06-11

Security & correctness release. Full review in `docs/LEGENDARY_REVIEW.md`.

### Fixed
- **Live API calls never sent the Authorization header** (`auth.token` was never set) — token now read from env at request time.
- **API base URLs were undefined** (`constants.API_URL`/`API_DEMO_URL` never existed) — every real HTTP call failed with `ERR_INVALID_URL`. Real CoinMetro defaults added, overridable via constants.
- `lib/version.js` required a path above the repo root and crashed.
- `market ticker` had no handler branch and silently did nothing.
- `gemini.js` and tests migrated to the named `{ AIService }` export.

### Security
- Env file now written with `0600` permissions (dir `0700`).
- `CM_PASSWORD` is never persisted; hidden interactive password prompt added.
- NLP trades: strict schema validation of AI output, pair checked against the exchange list, amount sanity cap, no silent heuristic fallback into execution, `-y` refused for live/heuristic NLP trades, prompt-injection hardening.

### Added
- `balances` command (documented but previously unregistered).
- GitHub Actions CI (Node 20/22, lint + tests).
- `engines: node >=20.19` in package.json.
- Demo ticker fallback clearly marked as simulated, with full last/high/low/volume fields.

---

This document describes the recent changes made to the `coinmetro-cli` application.

## New Features

### Gemini Integration

A new `gemini` command has been added to the CLI. This command allows you to interact with the Gemini AI.

**Usage:**

```
cm gemini ask "<your question>"
```

**Example:**

```
cm gemini ask "What is the current price of Bitcoin on Coinmetro?"
```

### Natural Language Trading

A new `nlp` subcommand has been added to the `trade` command. This allows you to execute trades using natural language.

**Usage:**

```
cm trade nlp "<your trade command>"
```

**Examples:**

```
cm trade nlp "buy 100 euro of bitcoin"
cm trade nlp "sell 0.5 btc @ 10000"
```

The CLI will parse your command and show you the corresponding `coinmetro-cli` command. You can then copy and paste this command to execute it.
