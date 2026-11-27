// Levels — three stages of the escape, each harder than the last:
// the Farmyard, the Barn, and the Kitchen. Each stage names its palette,
// its speed, and which dangers it spawns.

export const STAGE_LENGTH = 600; // metres per stage
export const STAGE_COUNT = 3;
export const ESCAPE_DISTANCE = STAGE_LENGTH * STAGE_COUNT;

export const STAGES = [
  {
    name: 'FARMYARD',
    subtitle: 'Run, Gobbler, run!',
    skyTop: '#f7b733',
    skyBottom: '#f2a541',
    ground: '#b07f2a',
    groundDark: '#8a6420',
    speed: 380,
    spawnGap: [420, 700],
    weights: { fence: 5, haystack: 4, corn: 6, goldenCorn: 1, hotSauce: 1, bush: 3, swingKnife: 0, fallingKnife: 0, oven: 0 },
  },
  {
    name: 'THE BARN',
    subtitle: 'Knives swing in the dark...',
    skyTop: '#8a5a3b',
    skyBottom: '#c98a4b',
    ground: '#6b4423',
    groundDark: '#54341a',
    speed: 460,
    spawnGap: [380, 620],
    weights: { fence: 4, haystack: 3, corn: 5, goldenCorn: 1, hotSauce: 1, bush: 2, swingKnife: 4, fallingKnife: 0, oven: 0 },
  },
  {
    name: 'THE KITCHEN',
    subtitle: 'The oven is lit. Do NOT get cooked!',
    skyTop: '#5a3a3a',
    skyBottom: '#a06a3b',
    ground: '#7a6a5a',
    groundDark: '#5d5044',
    speed: 540,
    spawnGap: [340, 560],
    weights: { fence: 2, haystack: 2, corn: 4, goldenCorn: 1, hotSauce: 2, bush: 0, swingKnife: 3, fallingKnife: 4, oven: 4 },
  },
];

export function stageIndexFor(distance) {
  return Math.min(STAGE_COUNT - 1, Math.floor(distance / STAGE_LENGTH));
}

export function stageFor(distance) {
  return STAGES[stageIndexFor(distance)];
}

// Pick the next thing to spawn for a stage, weighted by the stage table.
export function pickSpawnKind(rng, stage) {
  const entries = Object.entries(stage.weights).filter(([, w]) => w > 0);
  const total = entries.reduce((n, [, w]) => n + w, 0);
  let roll = rng.next() * total;
  for (const [kind, w] of entries) {
    roll -= w;
    if (roll <= 0) return kind;
  }
  return entries[0][0];
}

// A little corn arc over an obstacle, so a well-timed jump pays off.
export function cornArcOver(rng, x, groundY) {
  const arc = [];
  const n = rng.int(2, 3);
  for (let i = 0; i < n; i++) {
    arc.push({ x: x + 10 + i * 26, y: groundY - 150 - Math.abs(i - 1) * 18, golden: false });
  }
  return arc;
}
