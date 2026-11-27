// Shots — deterministic screenshot scenes. Each shot builds a real game
// state (real turkey, real farmer, real obstacles, real HUD) and freezes it,
// so the screenshot is a true render of the game's own code, not a mockup.

import {
  makeFence, makeHaystack, makeSwingKnife, makeFallingKnife, makeOven,
  makeCorn, makeHotSauce, makeBush,
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
  game.combo = 1;
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
    game.hearts = 3;
    game.turkey.reset();
    game.turkey.x = 640;
    game.farmer.reset();
    game.farmer.gap = 300;
    game.obstacles = [];
    return true;
  }

  if (name === 'farm') {
    basePlaying(game, 142, 1250, 12, 3);
    game.turkey.y = groundY - 96;
    game.turkey.vy = 0;
    game.turkey.onGround = false;
    game.turkey.flapPhase = 0.6;
    game.farmer.gap = 150;
    game.obstacles = [
      makeFence(640, groundY),
      makeCorn(640, groundY, false),
      makeCorn(668, groundY, false),
      makeHaystack(920, groundY),
      makeCorn(1060, groundY, true),
      makeBush(1160, groundY),
      makeHotSauce(1230, groundY),
    ];
    game.obstacles[1].y = groundY - 168;
    game.obstacles[2].y = groundY - 186;
    return true;
  }

  if (name === 'kitchen') {
    basePlaying(game, 1340, 4870, 31, 2);
    // Mid-jump over the oven: the leap that clears the roaring flames.
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
      makeCorn(820, groundY, false),
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
        color: ['#e2701d', '#f2a541', '#c1440e', '#7cb342', '#ffd700'][i % 5],
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
    game.hearts = 0;
    game.turkey.reset();
    game.turkey.x = 640;
    game.farmer.reset();
    game.farmer.gap = 46;
    game.obstacles = [makeFence(900, groundY)];
    return true;
  }

  return false;
}
