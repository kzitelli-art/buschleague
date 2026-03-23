# Bush League

Fantasy football league history dashboard — 2018 through present.

## Files

```
index.html          ← entry point, don't touch
netlify.toml        ← Netlify build config, don't touch
src/
  main.jsx          ← app entry, don't touch
  BushLeague.jsx    ← all the UI and logic
  data.js           ← seasons, standings, trades, franchises  ← EDIT THIS
  drafts.js         ← all draft picks 2018–2025              ← EDIT THIS
```

## Updating data each season

### New season standings & playoffs
Open `src/data.js` and add a new object to the top of the `SEASONS` array:

```js
{
  year: 2025,
  champion:  "Tino",       // franchise id
  runnerUp:  "Fritz",
  third:     "Boomer",
  playoffs: [
    { franchise: "Tino",  seed: 1, finish: 1 },
    { franchise: "Fritz", seed: 3, finish: 2 },
    // ... all 6 playoff teams
  ],
  standings: [
    { franchise: "Tino", rec: "11-3-0", pf: 1650.00, pa: 1400.00 },
    // ... all 12 teams in final finish order
  ],
},
```

### New trades
Add to the `TRADES` array in `src/data.js`:
```js
{
  id: "2025-T01", year: 2025, week: 5,
  sideA: { franchise: "Sherlock", gave: ["Player A"], received: ["Player B"] },
  sideB: { franchise: "Boomer",   gave: ["Player B"], received: ["Player A"] },
  winner: "Boomer",   // or "push"
  shame: false,
  verdict: "Your verdict here.",
},
```

### New draft
Add picks to `src/drafts.js` following the existing format.

## Franchise IDs
| ID         | Owner                         |
|------------|-------------------------------|
| Tino       | Kameron Zitelli               |
| Salsa Dick | Wylie Lopez                   |
| Fritz      | Fritz L'Esperance             |
| Boomer     | Timothy Jacobus               |
| Devany     | Conor Devany                  |
| Magoo      | Ryan McGovern                 |
| DDC        | Tom Mysliwiec / Kyle Koehler  |
| Trust      | Joe Cristantiello / M. Tietjen|
| Biceps Inc | Joe Grimaldi / Tyler Johnson  |
| Sherlock   | Brian Sherlock                |
| Vidz       | Sean Vidolin                  |
| Sorrentino | Kyle Sorrentino               |

## Local development
```
npm install
npm run dev
```

## Deploy
Push any file change to GitHub → Netlify auto-deploys in ~60 seconds.
