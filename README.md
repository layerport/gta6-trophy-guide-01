# Leonida Legend — GTA VI Trophy Guide & Tracker

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/layerport/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/layerport/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** — entered in the [GTA 6 Trophy Guide bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, official and cited.** All 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with their official name, description and grade as PlayStation publishes them, cross-checked against Push Square, KeenGamer, Insider Gaming, Radio Times and PlanetGTA6 (Exophase + PSNProfiles). Each trophy has a guide written in our own words that names its source beside it — a link you can follow.
- **A roadmap to the platinum.** Six stages in play order — story, character quests, activities, collectibles, crime and cash, then 100% completion — built from the official descriptions, with the counts that matter (250 stunts, 42 shooting-range golds, 14 drone spots, 18 meditations, 100 WAiNK scans, 3 card sets, 8 bank vaults).
- **One trophy can be missed — flagged.** Positive Mental Attitude is the only potentially missable trophy: the balcony meditation with Lucia in Chapter 1. The guide says exactly when and how. Everything else can be earned in free roam after the story.
- **A real tracker.** Tick trophies off; progress is saved in localStorage, with export to a file and import back. Filters by kind (story, missable, collectibles, activities, online — there are no online trophies, so that filter is honestly empty), by grade and by status, plus full-text search.
- **Spoiler-safe mode.** Hides story trophies' names, descriptions and guides until you earn them.
- **Fully offline.** Static files under `app/` with no build step — open `app/index.html` in desktop Chrome with the network off. No network requests at runtime, no Rockstar artwork, an original look of its own.

## Try it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Layout

- `app/index.html` — the guide page
- `app/app.js` — tracker state, filters, spoiler mode, export/import, detail panel
- `app/roadmap.js` — the six-stage platinum roadmap
- `app/style.css` — the look
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, kind, roadmap stage, missable flag, guide and sources
- `screenshots/` — real renders of the guide
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see `LICENSE`.
