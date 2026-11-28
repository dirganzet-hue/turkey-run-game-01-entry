// Levels — three stages of the zombie escape, each harder (and sillier)
// than the last: the Silly Graveyard, the Haunted Barn, and the Cursed
// Kitchen. Each stage names its night palette, its speed, and which
// dangers it spawns.

export const STAGE_LENGTH = 600; // metres per stage
export const STAGE_COUNT = 3;
export const ESCAPE_DISTANCE = STAGE_LENGTH * STAGE_COUNT;

export const STAGES = [
  {
    name: 'SILLY GRAVEYARD',
    subtitle: 'The dead run at night... mostly into walls',
    skyTop: '#0a1626',
    skyBottom: '#1d3a2a',
    ground: '#2c3d22',
    groundDark: '#1e2b18',
    speed: 380,
    spawnGap: [420, 700],
    weights: { tombstone: 5, fence: 3, zombieCrow: 3, zombieChicken: 3, haystack: 2, corn: 5, goldenCorn: 1, brainCorn: 1, hotSauce: 1, bush: 3, swingKnife: 0, fallingKnife: 0, oven: 0 },
  },
  {
    name: 'HAUNTED BARN',
    subtitle: 'Something swings in the dark... probably a mop',
    skyTop: '#120a1e',
    skyBottom: '#3a2430',
    ground: '#3a2a1e',
    groundDark: '#2a1e16',
    speed: 460,
    spawnGap: [380, 620],
    weights: { tombstone: 3, fence: 3, haystack: 2, corn: 4, goldenCorn: 1, brainCorn: 1, hotSauce: 1, bush: 2, swingKnife: 4, zombieCrow: 3, zombieChicken: 2, fallingKnife: 1, oven: 0 },
  },
  {
    name: 'CURSED KITCHEN',
    subtitle: 'The cauldron bubbles. The chef is confused.',
    skyTop: '#160a12',
    skyBottom: '#3d1e2a',
    ground: '#2e2a26',
    groundDark: '#211d1a',
    speed: 540,
    spawnGap: [340, 560],
    weights: { tombstone: 1, fence: 2, haystack: 2, corn: 3, goldenCorn: 1, brainCorn: 2, hotSauce: 2, bush: 0, swingKnife: 3, fallingKnife: 4, oven: 4, zombieCrow: 2, zombieChicken: 1 },
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
