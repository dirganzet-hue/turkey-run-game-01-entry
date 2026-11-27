// main — The Great Gobble Escape. Game loop, state machine, spawning,
// collisions, scoring and the title / caught / escaped screens.
// Wires together turkey, farmer, obstacles, levels, render, audio and input.

import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import {
  makeFence, makeHaystack, makeSwingKnife, makeFallingKnife, makeOven,
  makeCorn, makeHotSauce, makeBush,
  hitsTurkey, updateObstacle, drawObstacle,
} from './obstacles.js';
import { STAGES, stageIndexFor, stageFor, pickSpawnKind, ESCAPE_DISTANCE } from './levels.js';
import { Particles, drawBackground, drawHud } from './render.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Rng } from './rng.js';
import { applyShot } from './shots.js';

const WIDTH = 1280;
const HEIGHT = 720;
const GROUND_Y = 600;
const PX_PER_METRE = 50;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  state: 'title',
  paused: false,
  frozen: false,
  time: 0,
  distance: 0,
  score: 0,
  corn: 0,
  combo: 1,
  comboTimer: 0,
  hearts: 3,
  best: 0,
  turkey: new Turkey(GROUND_Y),
  farmer: new Farmer(),
  obstacles: [],
  particles: new Particles(),
  sounds: new SoundBank(),
  input: new Input(canvas),
  rng: new Rng((Date.now() % 2147483647) || 1337),
  groundY: GROUND_Y,
  spawnIn: 500,
  stageBanner: null,
  bannerTime: 0,
  flashText: null,
  flashTime: 0,
  shakeTime: 0,
  stageIndex: 0,
  shotMode: null,
};

function currentStage() {
  return STAGES[game.stageIndex];
}

function showBanner(text, sub) {
  game.stageBanner = { text, sub };
  game.bannerTime = 2.4;
}

function flash(text) {
  game.flashText = text;
  game.flashTime = 1.1;
}

function startRun() {
  game.state = 'playing';
  game.distance = 0;
  game.score = 0;
  game.corn = 0;
  game.combo = 1;
  game.comboTimer = 0;
  game.hearts = 3;
  game.turkey.reset();
  game.farmer.reset();
  game.obstacles = [];
  game.particles.list = [];
  game.spawnIn = 600;
  game.stageIndex = 0;
  game.stageBanner = null;
  game.shakeTime = 0;
  game.rng = new Rng((Date.now() % 2147483647) || 1337);
  // Drain any queued presses (e.g. an R tapped mid-run) so a fresh run
  // never instantly restarts itself from a stale queue.
  game.input.consumeJump();
  game.input.consumeDash();
  game.input.consumeRestart();
  game.input.consumeAny();
  showBanner('STAGE 1 — FARMYARD', 'Run, Gobbler, run!');
  game.sounds.ensure();
  game.sounds.gobble();
}

function endRun(caught) {
  game.state = caught ? 'caught' : 'escaped';
  game.best = Math.max(game.best, Math.floor(game.score));
  if (caught) {
    game.sounds.caughtSting();
    game.particles.burst(game.turkey.x, game.turkey.y - 30, 'feather', 26);
  } else {
    game.sounds.escapedJingle();
    for (let i = 0; i < 5; i++) {
      game.particles.burst(200 + i * 220, 140 + (i % 2) * 120, 'leaf', 14);
    }
  }
}

function hurtTurkey() {
  if (game.turkey.invuln > 0) return;
  game.hearts -= 1;
  game.combo = 1;
  game.turkey.invuln = 1.5;
  game.turkey.squash = 1;
  game.farmer.stumble();
  game.shakeTime = 0.35;
  game.sounds.hurt();
  game.particles.burst(game.turkey.x, game.turkey.y - 30, 'feather', 16);
  flash('OUCH!');
  if (game.hearts <= 0) endRun(true);
}

function collectCorn(ob) {
  ob.taken = true;
  game.corn += 1;
  game.comboTimer = 3;
  game.score += (ob.golden ? 50 : 10) * game.combo;
  if (game.combo < 5) game.combo += 1;
  game.farmer.rewardCorn();
  game.sounds.pickup(ob.golden);
  game.particles.burst(ob.x + 15, ob.y + 20, 'leaf', ob.golden ? 10 : 5);
}

function spawnPattern() {
  const stage = currentStage();
  const kind = pickSpawnKind(game.rng, stage);
  const x = WIDTH + 60;
  switch (kind) {
    case 'fence': {
      game.obstacles.push(makeFence(x, GROUND_Y));
      if (game.rng.chance(0.6)) {
        for (const c of [{ x: x + 4, y: GROUND_Y - 168 }, { x: x + 30, y: GROUND_Y - 186 }]) {
          game.obstacles.push(makeCorn(c.x, c.y, false));
        }
      }
      break;
    }
    case 'haystack': {
      game.obstacles.push(makeHaystack(x, GROUND_Y));
      if (game.rng.chance(0.5)) game.obstacles.push(makeCorn(x + 90, GROUND_Y, false));
      break;
    }
    case 'swingKnife':
      game.obstacles.push(makeSwingKnife(x, GROUND_Y, game.rng.range(0, 3)));
      break;
    case 'fallingKnife':
      game.obstacles.push(makeFallingKnife(
        Math.min(1100, Math.max(500, game.turkey.x + game.rng.range(-40, 220))), GROUND_Y));
      break;
    case 'oven':
      game.obstacles.push(makeOven(x, GROUND_Y));
      break;
    case 'corn': {
      const n = 3;
      for (let i = 0; i < n; i++) {
        game.obstacles.push(makeCorn(x + i * 44, GROUND_Y, false));
      }
      break;
    }
    case 'goldenCorn':
      game.obstacles.push(makeCorn(x, GROUND_Y, true));
      break;
    case 'hotSauce':
      game.obstacles.push(makeHotSauce(x, GROUND_Y));
      break;
    case 'bush':
      game.obstacles.push(makeBush(x, GROUND_Y));
      break;
    default:
      break;
  }
  game.spawnIn = game.rng.range(stage.spawnGap[0], stage.spawnGap[1]);
}

function updatePlaying(dt) {
  const stage = currentStage();
  const speed = stage.speed * (game.turkey.dashing ? 1.6 : 1);

  // Dash.
  if (game.input.consumeDash() && game.turkey.startDash()) {
    game.sounds.dash();
    game.farmer.dashAway();
    flash('HOT SAUCE DASH!');
  }

  const jumpEvent = game.turkey.update(dt, game.input, speed);
  if (jumpEvent === 'jump') {
    game.sounds.jump();
    game.particles.burst(game.turkey.x, GROUND_Y, 'dust', 4);
  } else if (jumpEvent === 'land') {
    game.sounds.thud();
  }

  game.distance += (speed * dt) / PX_PER_METRE;
  game.score += speed * dt * 0.06;
  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 1;
  }

  // Stage changes.
  const idx = stageIndexFor(game.distance);
  if (idx !== game.stageIndex) {
    game.stageIndex = idx;
    const next = STAGES[idx];
    showBanner(`STAGE ${idx + 1} — ${next.name}`, next.subtitle);
    game.sounds.fanfare();
  }

  // Escape!
  if (game.distance >= ESCAPE_DISTANCE) {
    endRun(false);
    return;
  }

  // Spawning.
  game.spawnIn -= speed * dt;
  if (game.spawnIn <= 0) spawnPattern();

  // Farmer pressure.
  game.farmer.update(dt, game.turkey.dashing);
  if (game.farmer.caughtUp) {
    endRun(true);
    return;
  }

  // Move obstacles, resolve collisions.
  const turkeyBox = game.turkey.bounds();
  for (const ob of game.obstacles) {
    updateObstacle(ob, dt, speed, game.time);
    if (ob.kind === 'corn' || ob.kind === 'goldenCorn' || ob.kind === 'hotSauce') {
      if (!ob.taken) {
        // Pickups use a generous box of their own.
        const box = { x: ob.x, y: ob.y - 6, w: ob.w, h: ob.h + 12 };
        if (turkeyBox.x < box.x + box.w && turkeyBox.x + turkeyBox.w > box.x
          && turkeyBox.y < box.y + box.h && turkeyBox.y + turkeyBox.h > box.y) {
          if (ob.kind === 'hotSauce') {
            ob.taken = true;
            game.turkey.dashCooldown = 0;
            game.turkey.startDash();
            game.sounds.dash();
            flash('HOT SAUCE!');
          } else {
            collectCorn(ob);
          }
        }
      }
      continue;
    }
    if (ob.kind === 'bush') {
      if (!ob.used && game.turkey.sliding
        && turkeyBox.x < ob.x + ob.w && turkeyBox.x + turkeyBox.w > ob.x
        && turkeyBox.y < ob.y + ob.h && turkeyBox.y + turkeyBox.h > ob.y) {
        ob.used = true;
        game.farmer.loseTrack();
        game.sounds.gobble();
        flash('HIDDEN IN THE BUSH!');
        game.particles.burst(ob.x + ob.w / 2, ob.y + 10, 'leaf', 12);
      }
      continue;
    }
    if (hitsTurkey(ob, turkeyBox, game.time)) {
      if (ob.kind === 'haystack' && game.turkey.dashing) {
        ob.passed = true;
        game.score += 25;
        game.sounds.thud();
        game.particles.burst(ob.x + ob.w / 2, ob.y + 20, 'leaf', 18);
        flash('SMASHED THROUGH!');
        continue;
      }
      hurtTurkey();
      if (game.state !== 'playing') return;
      // Knock the obstacle past so one hit cannot double-trigger.
      ob.x -= 60;
    }
  }

  // Prune spent obstacles.
  game.obstacles = game.obstacles.filter((ob) => {
    if (ob.taken) return false;
    if (ob.kind === 'fallingKnife' && ob.state === 'stuck' && ob.timer <= 0) return false;
    if (ob.kind === 'haystack' && ob.passed) return false;
    return ob.x > -220;
  });

  game.particles.update(dt);
  if (game.bannerTime > 0) game.bannerTime -= dt;
  if (game.flashTime > 0) game.flashTime -= dt;
  if (game.shakeTime > 0) game.shakeTime -= dt;
}

function update(dt) {
  if (!game.frozen) game.time += dt;
  if (game.input.consumeMute()) {
    game.sounds.ensure();
    game.sounds.setMuted(!game.sounds.muted);
  }
  if (game.state === 'playing') {
    if (game.input.consumePause()) game.paused = !game.paused;
    if (!game.paused && !game.frozen) updatePlaying(dt);
  } else if (game.state === 'title') {
    if (game.input.consumeAny()) {
      game.sounds.ensure();
      game.sounds.click();
      startRun();
    }
  } else if (game.input.consumeRestart() || game.input.consumeJump()) {
    game.sounds.ensure();
    game.sounds.click();
    startRun();
  }
  if (game.state !== 'playing') game.particles.update(dt);
}

function drawTitleScreen() {
  drawBackground(ctx, STAGES[0], 0, 0, game.time, WIDTH, HEIGHT, GROUND_Y);
  game.turkey.draw(ctx, game.time);
  game.farmer.draw(ctx, game.turkey.x, GROUND_Y, game.time);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(43, 26, 18, 0.55)';
  ctx.beginPath();
  ctx.roundRect(140, 60, 1000, 250, 20);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.fillText('THANKSGIVING IS COMING...', 640, 112);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 74px "Trebuchet MS", sans-serif';
  ctx.fillText('THE GREAT', 640, 190);
  ctx.fillStyle = '#ff7814';
  ctx.font = 'bold 84px "Trebuchet MS", sans-serif';
  ctx.fillText('GOBBLE ESCAPE', 640, 272);
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText('The farmer wants you for dinner. Run through the farmyard,', 640, 380);
  ctx.fillText('the barn and the kitchen — and make it to the forest gate!', 640, 410);
  ctx.font = '20px "Trebuchet MS", sans-serif';
  ctx.fillText('Jump fences & haystacks  •  Slide under swinging knives  •  Grab corn for points', 640, 452);
  ctx.fillText('Hot-sauce dash smashes hay  •  Hide in bushes to lose the farmer', 640, 482);
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
    ctx.fillText('PRESS SPACE OR CLICK TO RUN', 640, 560);
  }
  ctx.fillStyle = 'rgba(247, 232, 201, 0.8)';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('Arrows / WASD move & slide  •  Space jump  •  Shift dash  •  P pause  •  M mute', 640, 610);
  if (game.best > 0) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.fillText(`BEST SCORE: ${game.best}`, 640, 648);
  }
  ctx.restore();
}

function drawEndScreen(escaped) {
  ctx.save();
  ctx.fillStyle = escaped ? 'rgba(20, 60, 20, 0.55)' : 'rgba(60, 10, 5, 0.6)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#a8e063' : '#ff6b5e';
  ctx.font = 'bold 88px "Trebuchet MS", sans-serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', 640, 250);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillText(
    escaped
      ? 'You outran the farmer and reached the Freedom Forest!'
      : `The farmer grabbed you at ${Math.floor(game.distance)} m — dinner is served...`,
    640, 310,
  );
  ctx.font = '24px "Trebuchet MS", sans-serif';
  ctx.fillText(`SCORE  ${Math.floor(game.score)}    •    CORN  ${game.corn}    •    DISTANCE  ${Math.floor(game.distance)} m`, 640, 360);
  if (game.best > 0) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText(`BEST SCORE: ${game.best}`, 640, 400);
  }
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
    ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', 640, 480);
  }
  ctx.restore();
}

function draw() {
  ctx.save();
  if (game.shakeTime > 0) {
    ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
  }
  if (game.state === 'title') {
    ctx.restore();
    drawTitleScreen();
    return;
  }
  const stage = stageFor(game.distance);
  drawBackground(ctx, stage, game.stageIndex, game.distance, game.time, WIDTH, HEIGHT, GROUND_Y);

  // Bushes sit behind the turkey so hiding reads visually.
  for (const ob of game.obstacles) {
    if (ob.kind === 'bush') drawObstacle(ctx, ob, game.time);
  }
  for (const ob of game.obstacles) {
    if (ob.kind === 'corn' || ob.kind === 'goldenCorn' || ob.kind === 'hotSauce') drawObstacle(ctx, ob, game.time);
  }
  for (const ob of game.obstacles) {
    if (ob.kind !== 'bush' && ob.kind !== 'corn' && ob.kind !== 'goldenCorn' && ob.kind !== 'hotSauce') {
      drawObstacle(ctx, ob, game.time);
    }
  }

  game.farmer.draw(ctx, game.turkey.x, GROUND_Y, game.time);
  game.turkey.draw(ctx, game.time);
  game.particles.draw(ctx);

  // Stage banner.
  if (game.bannerTime > 0 && game.stageBanner) {
    const alpha = Math.min(1, game.bannerTime);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(43, 26, 18, 0.75)';
    ctx.beginPath();
    ctx.roundRect(340, 150, 600, 96, 14);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
    ctx.fillText(game.stageBanner.text, 640, 196);
    ctx.fillStyle = '#f7e8c9';
    ctx.font = '20px "Trebuchet MS", sans-serif';
    ctx.fillText(game.stageBanner.sub, 640, 226);
    ctx.restore();
  }

  // Flash text (OUCH!, SMASHED THROUGH!, ...).
  if (game.flashTime > 0 && game.flashText) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, game.flashTime * 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
    ctx.strokeStyle = 'rgba(43,26,18,0.8)';
    ctx.lineWidth = 6;
    ctx.strokeText(game.flashText, 640, 330);
    ctx.fillText(game.flashText, 640, 330);
    ctx.restore();
  }

  if (game.state === 'playing') {
    drawHud(ctx, {
      score: Math.floor(game.score),
      corn: game.corn,
      combo: game.combo,
      hearts: game.hearts,
      stageName: currentStage().name,
      distance: game.distance,
      farmerGap: game.farmer.gap,
      dashing: game.turkey.dashing,
      dashCooldown: game.turkey.dashCooldown,
    }, WIDTH);
    if (game.paused) {
      ctx.save();
      ctx.fillStyle = 'rgba(20, 20, 20, 0.55)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f7e8c9';
      ctx.font = 'bold 64px "Trebuchet MS", sans-serif';
      ctx.fillText('PAUSED', 640, 340);
      ctx.font = '24px "Trebuchet MS", sans-serif';
      ctx.fillText('Press P to keep running', 640, 390);
      ctx.restore();
    }
  }

  ctx.restore();

  if (game.state === 'caught') drawEndScreen(false);
  if (game.state === 'escaped') drawEndScreen(true);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

// Boot: screenshot mode (?shot=title|farm|kitchen|escaped|caught) freezes a
// real game state for the maker's screenshots; otherwise the title screen.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  game.shotMode = shot;
  applyShot(game, shot);
}
window.__gobble = game;
requestAnimationFrame(frame);
