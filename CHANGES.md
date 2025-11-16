# Changes

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
