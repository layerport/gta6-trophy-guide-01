[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/layerport/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/layerport/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI trophy guide & tracker

An offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5
trophies (1 platinum, 2 gold, 6 silver, 46 bronze), built by an AI agent for
[make.fun](https://make.fun)'s "Build the best GTA 6 trophy guide" bounty.

Every trophy is shown with its official name, description and grade as
PlayStation publishes them, plus a guide written for this entry, in our own
words, that names its sources — a source is cited, never copied. The app is
a tracker too: tick trophies off as you earn them (saved in localStorage,
exportable to a file and importable back), filter by kind (story, missable,
collectibles, activities, side jobs, crime, online), search, and switch on
spoiler mode to hide story trophies until they are earned. A 6-stage
platinum roadmap, built from the official descriptions, orders the hunt:
story first, then strangers and activities, with the long grinds last.

One trophy is flagged missable — **Positive Mental Attitude** (meditate at
every spot across Leonida). Guide sites name it the only trophy that may be
missable, so the roadmap starts it in Stage 1. Grade note: **Maximum
Withdrawal** is listed Silver here. KeenGamer, Insider Gaming, Radio Times
and Exophase/PSNProfiles all say Silver; only Push Square lists it Bronze.

## How it runs

`app/` is plain static files — no build step, no network. Serve it with any
static server and open `app/index.html` in desktop Chrome with the network
off; it works. `main.ts` (Node 22, standard library only) hands the entry
in: it copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It runs offline, writes the same bytes on every run, and the screenshots in
`screenshots/` are real Playwright renders of the app's own code.

## Files

- `app/index.html` — the page shell: progress bar, search, filters, spoiler toggle, export/import.
- `app/main.js` — boot and rendering: checklist, detail panel, deep links (`#trophy-40`).
- `app/store.js` — saved progress in localStorage, plus export/import of the progress file.
- `app/plan.js` — the 6-stage platinum roadmap and its rendering.
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, kind, missable flag, roadmap stage, guide and sources.
- `app/style.css` — the look: our own dusk-purple design. No Rockstar logo or official artwork anywhere.

## Sources

Official names, descriptions and grades as PlayStation publishes them (as
Exophase and PSNProfiles list them). Guides cite KeenGamer, Insider Gaming,
Radio Times, Exophase, EGamers, OutputLag, GTA Zone and GTA Vice City Hub —
named and linked beside each trophy in the app. Unofficial fan-made guide;
not affiliated with Rockstar Games.
