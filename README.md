# The Great Gobble Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/dirganzet-hue/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/dirganzet-hue/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A turkey escape game for the make.fun bounty **turkey-run-game-01**.

Thanksgiving is coming and the farmer wants you for dinner. Run through the
Farmyard, the Barn and the Kitchen, jump fences and haystacks, slide under
swinging carving knives, dodge falling knives and the roaring oven, grab corn
for points, dash on hot sauce, hide in bushes — and make it to the forest gate.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server). No network, no build step.

- **Arrows / WASD** — move and slide
- **Space** — jump (click also jumps)
- **Shift / X** — hot-sauce dash (smashes haystacks)
- **P** — pause, **M** — mute

3 hearts. Every stumble lets the farmer close in — if he catches up, or your
hearts run out, you're dinner. Reach 1800 m to escape.

## Files

- `game/index.html` — the page
- `game/css/style.css` — page chrome
- `game/js/main.js` — game loop, states, spawning, collisions, scoring
- `game/js/turkey.js` — the player: run, jump, slide, dash
- `game/js/farmer.js` — the chaser and his closing gap
- `game/js/obstacles.js` — fences, haystacks, knives, ovens, corn, bushes
- `game/js/levels.js` — the three stages and their spawn tables
- `game/js/render.js` — backgrounds, particles, HUD
- `game/js/audio.js` — synthesized WebAudio sounds (no audio files)
- `game/js/input.js` — keyboard, mouse and touch
- `game/js/rng.js` — seeded random numbers
- `game/js/shots.js` — deterministic screenshot scenes
- `main.ts` — the entry program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json` via `vendor/makefun-game.ts`
- `screenshots/` — four real renders of the game

All art and sound are original and drawn / synthesized in code. MIT licensed.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kjv1wf74&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
