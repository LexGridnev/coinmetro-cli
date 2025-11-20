### Visual Improvements Cheatsheet

A quick guide to the recent visual enhancements made to the `coinmetro-cli`.

#### 1. Table View for Market Data

The `cm market list` command now displays market prices in a clean, readable table.

**Command:**
```bash
cm market list
```

**Output Example:**
*   Includes columns for `Pair`, `Price`, `Ask`, and `Bid`.
*   Provides a much clearer overview compared to the previous plain text list.

```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ Pair          │ Price         │ Ask           │ Bid           │
├───────────────┼───────────────┼───────────────┼───────────────┤
│ BTCEUR        │ 75987.41      │ 75998.96      │ 75975.86      │
│ ETHEUR        │ 2476.39       │ 2477.11       │ 2475.82       │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

#### 2. Enhanced Color-Coded Messages

Status messages are now color-coded for immediate visual feedback:
*   **Errors:** Displayed in **red**, prefixed with a bold "**Error:**".
*   **Warnings:** Displayed in **yellow**, prefixed with a bold "**Warning:**" (e.g., Gemini API key missing).
*   **Success:** Indicated by a green **✔** checkmark from loading spinners.

#### 3. Loading Spinners

Asynchronous operations like API calls now display a loading spinner to provide feedback that the application is working.

**Affected Commands:**
*   `cm market list`
*   `cm market chart`

**Example:**
```
⠼ Fetching latest prices...
✔ Latest prices loaded.
```

#### 4. ASCII Charts for Historical Data

The `cm market chart` command renders historical price data as a terminal-based ASCII chart.

**Command:**
```bash
cm market chart <pair> [d|w|m|y]
```
*   This command now also includes a loading spinner while data is being fetched.
*   Example Pair: `BTCEUR`
*   Example Timeframes: `d` (Daily), `w` (Weekly), `m` (Monthly), `y` (Yearly)

**Output Example:**
```
✔ Historical prices loaded.
Weeky chart for BTCEUR
85492.6898 ┼─╮
85083.1508 ┤ ╰╮
84673.6118 ┤  │
84264.0728 ┤  │
83854.5338 ┤  │
83444.9948 ┤  ╰╮
83035.4558 ┤   │╭╮
82625.9169 ┤   │││╭─╮╭╮
82216.3779 ┤   ╰╯││ ╰╯│ ╭─╮   ╭╮
81806.8389 ┤     ╰╯   ╰─╯ │ ╭─╯│
81397.2999 ┤              ╰╮│  ╰╮
80987.7609 ┤               ││   │
80578.2219 ┤               ╰╯   │    ╭╮
80168.6830 ┤                    │    ││
79759.1440 ┤                    │    ││     ╭─╮
79349.6050 ┤                    │╭╮  │╰╮   ╭╯ ╰
78940.0660 ┤                    ╰╯│  │ │   │
78530.5270 ┤                      │╭─╯ ╰──╮│
78120.9880 ┤                      ││      ││
77711.4490 ┤                      ╰╯      ││
77301.9101 ┤                              ╰╯
```
