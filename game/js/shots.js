// Shots — deterministic screenshot scenes. Each shot builds a real game
// state (real zombie turkey, real zombie farmer, real obstacles, real HUD,
// real night fog) and freezes it, so the screenshot is a true render of
// the game's own code, not a mockup.

import {
  makeFence, makeTombstone, makeHaystack, makeZombieCrow, makeZombieChicken,
  makeSwingKnife, makeFallingKnife, makeOven,
  makeCorn, makeBrainCorn, makeHotSauce, makeBush,
} from './obstacles.js';
import { stageIndexFor } from './levels.js';

function basePlaying(game, stageDistance, score, corn, hearts) {
  game.state = 'playing';
  game.paused = false;
  game.frozen = true;
  game.time = 2.3;
  game.distance = stageDistance;
  game.stageIndex = stageIndexFor(stageDistance);
  game.score = score;
  game.corn = corn;
  game.brains = 0;
  game.combo = 1;
  game.comboTimer = 0;
  game.hearts = hearts;
  game.turkey.reset();
  game.farmer.reset();
  game.obstacles = [];
  game.particles.list = [];
  game.stageBanner = null;
  game.flashText = null;
}

export function applyShot(game, name) {
  const groundY = game.groundY;
  if (name === 'title') {
    game.state = 'title';
    game.frozen = true;
    game.time = 1.2;
    game.distance = 0;
    game.score = 0;
    game.corn = 0;
    game.brains = 0;
    game.hearts = 3;
    game.turkey.reset();
    game.turkey.x = 640;
    game.farmer.reset();
    game.farmer.gap = 300;
    game.obstacles = [];
    return true;
  }

  if (name === 'farm') {
    // Graveyard gameplay: the zombie turkey leaps toward a tombstone,
    // brain-corn glows ahead, a zombie crow dives in and a zombie
    // chicken charges — all inside the moonlit vision circle.
    basePlaying(game, 142, 1250, 12, 3);
    game.combo = 3;
    game.comboTimer = 2.5;
    game.brains = 2;
    game.turkey.x = 380;
    game.turkey.y = groundY - 96;
    game.turkey.vy = 0;
    game.turkey.onGround = false;
    game.turkey.flapPhase = 0.6;
    game.farmer.gap = 150;
    game.obstacles = [
      makeTombstone(560, groundY),
      makeCorn(560, groundY, false),
      makeCorn(588, groundY, false),
      makeBrainCorn(680, groundY),
      makeZombieCrow(780, groundY),
      makeHaystack(840, groundY),
      makeZombieChicken(920, groundY),
      makeCorn(1000, groundY, true),
      makeBush(1100, groundY),
      makeHotSauce(1170, groundY),
    ];
    game.obstacles[1].y = groundY - 168;
    game.obstacles[2].y = groundY - 186;
    return true;
  }

  if (name === 'kitchen') {
    // Cursed kitchen: mid-jump over the oven while its green flames roar,
    // a cleaver swings, another lies stuck in the floor, a zombie chicken
    // charges and brain-corn glows.
    basePlaying(game, 1340, 4870, 31, 2);
    game.combo = 4;
    game.comboTimer = 3.2;
    game.brains = 5;
    game.turkey.x = 620;
    game.turkey.y = groundY - 118;
    game.turkey.vy = 0;
    game.turkey.onGround = false;
    game.turkey.flapPhase = 0.6;
    game.farmer.gap = 120;
    const oven = makeOven(700, groundY);
    oven.flame = 1;
    oven.flameTimer = 0.8;
    const knife = makeFallingKnife(1150, groundY);
    knife.state = 'stuck';
    knife.y = groundY - knife.h;
    game.obstacles = [
      oven,
      makeSwingKnife(980, groundY, 0.4),
      knife,
      makeZombieChicken(1080, groundY),
      makeBrainCorn(820, groundY),
      makeCorn(1240, groundY, false),
    ];
    return true;
  }

  if (name === 'escaped') {
    game.state = 'escaped';
    game.frozen = true;
    game.time = 2.0;
    game.distance = 1800;
    game.score = 6420;
    game.corn = 48;
    game.brains = 9;
    game.combo = 3;
    game.hearts = 2;
    game.turkey.reset();
    game.turkey.x = 640;
    game.farmer.reset();
    game.farmer.gap = 320;
    game.obstacles = [];
    game.particles.list = [];
    for (let i = 0; i < 40; i++) {
      game.particles.list.push({
        x: 200 + Math.random() * 880,
        y: 60 + Math.random() * 300,
        vx: 0, vy: 20, life: 10, age: 0,
        size: 5 + Math.random() * 5,
        color: ['#8be06a', '#d8ff5a', '#ffd700', '#ff8fc0'][i % 4],
        spin: 2,
      });
    }
    return true;
  }

  if (name === 'caught') {
    game.state = 'caught';
    game.frozen = true;
    game.time = 2.0;
    game.distance = 860;
    game.score = 2310;
    game.corn = 19;
    game.brains = 3;
    game.hearts = 0;
    game.turkey.reset();
    game.turkey.x = 640;
    game.farmer.reset();
    game.farmer.gap = 46;
    game.obstacles = [makeTombstone(900, groundY)];
    return true;
  }

  return false;
}
