# Zombie Turkey Escape Run

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/dirganzet-hue/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/dirganzet-hue/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A zombie turkey escape game for the make.fun bounty **turkey-run-game-01**.

Thanksgiving is coming and the dead are hungry — and very, very clumsy.
You rose from the grave as a goofy zombie turkey — crossed googly eyes, a
toothless grin with one tooth, a lolling tongue, a crooked little party
hat, a tipsy waddle — and the clumsy zombie farmer wants your brains. He
holds his pitchfork backwards, his hat pops off when he trips, and he
shouts very silly things ("MY DINNER IS RUNNING!", "I'M TOO OLD FOR
THIS!"). Run through the Silly Graveyard, the Haunted Barn and the Cursed
Kitchen in the night fog: jump tombstones (some say OOPS) and haystacks,
slide under zombie crows and swinging cleavers, dodge falling cleavers
and the cursed oven's green flames, grab brain-corn for 100 x combo, dash
on hot sauce, hide in the brambles — and make it to the forest gate. Hide
and the turkey taunts him: NYAH NYAH! Careful: smashed zombie chickens
RISE AGAIN.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server). No network, no build step.

- **Arrows / WASD** — move and slide
- **Space** — jump (click also jumps)
- **Shift / X** — zombie dash (smashes haystacks and zombie chickens, leaves a slime trail)
- **P** — pause, **M** — mute

3 hearts. Every stumble lets the zombie farmer close in — if he catches up,
or your hearts run out, you're brains for dinner. Reach 1800 m to escape.
Chain pickups to build your combo before the timer runs out.

## Files

- `game/index.html` — the page
- `game/css/style.css` — page chrome
- `game/js/main.js` — game loop, states, spawning, collisions, scoring
- `game/js/turkey.js` — the player: run, jump, slide, dash
- `game/js/farmer.js` — the zombie chaser and his closing gap
- `game/js/obstacles.js` — tombstones, crows, chickens, cleavers, ovens, brain-corn, brambles
- `game/js/levels.js` — the three stages and their spawn tables
- `game/js/render.js` — night backgrounds, the fog of night, particles, HUD
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
