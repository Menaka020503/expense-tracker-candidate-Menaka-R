# Expense Tracker

Income/expense tracker built for a timed dev sprint brief. Plain HTML, CSS and JS, no frameworks, no build step. Everything lives in LocalStorage, so once the page loads it works fully offline.

## Running it

Nothing to install. Open `index.html` directly in a browser, or serve the folder if you'd rather skip `file://` quirks:

```
npx serve .
```

Add a transaction and it's saved. Refresh the page and it's still there.

## What it does

Add, edit, and delete income/expense entries (amount, category, date, description), with running totals for income, expenses, and balance, plus a separate summary for the current month. Transactions filter by type and by category. There's a category-wise expense chart too, drawn with plain CSS bars instead of a charting library, to keep the dependency count at zero.

Dates can't be set in the future, both the date picker and the form validation enforce that. Every field validates inline with an actual error message rather than a generic "invalid input."

## Why it looks like this

The UI leans into a "ledger" idea, since that's basically what the app is: entries numbered like a real passbook, Dr/Cr tags next to amounts, figures set in IBM Plex Mono so the numbers line up like a printed column instead of jittering around. Teal for the accent, gold for balance, a muted oxblood for expenses, on a sage-tinted paper background rather than the usual cream-and-serif combo you see everywhere. Both light and dark palettes are built out fully, though it's set to always load in light for now.

## Structure

```
index.html           markup
css/style.css         all styling, both themes
js/categories.js       the fixed category lists
js/storage.js          localStorage load/save
js/validation.js       form validation rules
js/render.js            everything that touches the DOM
js/app.js               state + event wiring, entry point
```

## Notes

- No backend, no build tooling. Just open the file.
- Currency is formatted as INR (₹) throughout.
- The category chart only appears once there's at least one expense logged; until then it shows an empty state instead of a blank box.

## Repo

Add the GitHub URL here once it's pushed.
