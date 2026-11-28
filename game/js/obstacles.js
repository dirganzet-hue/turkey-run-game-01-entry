// Obstacles & pickups — everything the zombie turkey must jump, slide
// under, dodge or collect. Graveyard edition: tombstones to leap, zombie
// crows to slide under, zombie chickens that RISE AGAIN after you smash
// them, brain-corn worth a fortune, and the cursed oven's green flames.
// Each obstacle carries its own hitbox and draw routine; the main loop
// only moves them left and asks for collisions.

export function makeFence(x, groundY) {
  return { kind: 'fence', x, y: groundY - 58, w: 34, h: 58, passed: false };
}

export function makeTombstone(x, groundY) {
  return { kind: 'tombstone', x, y: groundY - 44, w: 40, h: 44, ep: Math.floor(Math.random() * 4), passed: false };
}

export function makeHaystack(x, groundY) {
  return { kind: 'haystack', x, y: groundY - 52, w: 74, h: 52, passed: false };
}

export function makeZombieCrow(x, groundY) {
  return { kind: 'zombieCrow', x, y: groundY, w: 36, h: 28, bobPhase: Math.random() * 6, squawked: false, passed: false };
}

export function makeZombieChicken(x, groundY) {
  return {
    kind: 'zombieChicken', x, y: groundY - 30, w: 32, h: 30,
    approach: 60, risesLeft: 1, dead: 0, risen: false,
    walkPhase: Math.random() * 6, passed: false,
  };
}

export function makeSwingKnife(x, groundY, phase) {
  return { kind: 'swingKnife', x, y: groundY, w: 26, h: 150, phase: phase || 0, passed: false };
}

export function makeFallingKnife(x, groundY) {
  return { kind: 'fallingKnife', x, y: -40, w: 30, h: 64, vy: 0, state: 'warn', timer: 0.7, groundY, passed: false };
}

export function makeOven(x, groundY) {
  return { kind: 'oven', x, y: groundY - 96, w: 110, h: 96, flame: 0, flameTimer: 1.2, passed: false };
}

export function makeCorn(x, groundY, golden) {
  return { kind: golden ? 'goldenCorn' : 'corn', x, y: groundY - 92, w: 30, h: 46, bob: Math.random() * 6, golden: !!golden, taken: false };
}

export function makeBrainCorn(x, groundY) {
  return { kind: 'brainCorn', x, y: groundY - 92, w: 30, h: 46, bob: Math.random() * 6, taken: false };
}

export function makeHotSauce(x, groundY) {
  return { kind: 'hotSauce', x, y: groundY - 88, w: 30, h: 48, taken: false };
}

export function makeBush(x, groundY) {
  return { kind: 'bush', x, y: groundY - 46, w: 96, h: 46, used: false };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// The solid hitbox of an obstacle for the turkey (null when harmless now).
export function obstacleHitbox(ob, t) {
  switch (ob.kind) {
    case 'fence':
      return { x: ob.x + 4, y: ob.y + 8, w: ob.w - 8, h: ob.h - 8 };
    case 'tombstone':
      return { x: ob.x + 3, y: ob.y + 6, w: ob.w - 6, h: ob.h - 6 };
    case 'haystack':
      return { x: ob.x + 6, y: ob.y + 14, w: ob.w - 12, h: ob.h - 14 };
    case 'zombieCrow': {
      // Flies at head height: run into it standing and it hurts — slide
      // under it, or jump clean over it.
      const bobY = Math.sin(ob.bobPhase) * 6;
      return { x: ob.x - 4, y: ob.y - 100 + bobY, w: 44, h: 44 };
    }
    case 'zombieChicken':
      if (ob.dead > 0) return null; // a pile of bones cannot hurt you (yet)
      return { x: ob.x + 2, y: ob.y + 4, w: ob.w - 4, h: ob.h - 4 };
    case 'swingKnife': {
      const ang = Math.sin(t * 1.9 + ob.phase) * 0.85;
      const bx = ob.x + Math.sin(ang) * 118;
      const by = ob.y - 150 + Math.cos(ang) * 118;
      return { x: bx - 8, y: by - 6, w: 22, h: 40 };
    }
    case 'fallingKnife':
      if (ob.state !== 'fall') return null;
      return { x: ob.x + 4, y: ob.y, w: ob.w - 8, h: ob.h };
    case 'oven': {
      const box = { x: ob.x + 4, y: ob.y + 10, w: ob.w - 8, h: ob.h - 10 };
      if (ob.flame > 0) {
        return { x: ob.x + 8, y: ob.y - 52, w: ob.w - 16, h: ob.h + 52, oven: box };
      }
      return box;
    }
    default:
      return null;
  }
}

export function hitsTurkey(ob, turkeyBox, t) {
  const box = obstacleHitbox(ob, t);
  if (!box) return false;
  if (box.oven) return overlap(turkeyBox, box) || overlap(turkeyBox, box.oven);
  return overlap(turkeyBox, box);
}

export function updateObstacle(ob, dt, speed, t) {
  ob.x -= speed * dt;
  if (ob.kind === 'zombieCrow') {
    ob.bobPhase += dt * 3;
  }
  if (ob.kind === 'zombieChicken') {
    if (ob.dead > 0) return; // bones lie still
    ob.x -= ob.approach * dt; // it runs AT you
    ob.walkPhase += dt * 10;
  }
  if (ob.kind === 'fallingKnife') {
    if (ob.state === 'warn') {
      ob.timer -= dt;
      if (ob.timer <= 0) {
        ob.state = 'fall';
        ob.vy = 60;
      }
    } else if (ob.state === 'fall') {
      ob.vy += 2600 * dt;
      ob.y += ob.vy * dt;
      if (ob.y >= ob.groundY - ob.h) {
        ob.y = ob.groundY - ob.h;
        ob.state = 'stuck';
        ob.timer = 1.6;
      }
    } else {
      ob.timer -= dt;
    }
  }
  if (ob.kind === 'oven') {
    ob.flameTimer -= dt;
    if (ob.flameTimer <= 0) {
      ob.flame = ob.flame > 0 ? 0 : 1;
      ob.flameTimer = ob.flame > 0 ? 0.9 : 1.5;
    }
  }
}

export function drawObstacle(ctx, ob, t) {
  switch (ob.kind) {
    case 'fence': return drawFence(ctx, ob);
    case 'tombstone': return drawTombstone(ctx, ob);
    case 'haystack': return drawHaystack(ctx, ob);
    case 'zombieCrow': return drawZombieCrow(ctx, ob);
    case 'zombieChicken': return drawZombieChicken(ctx, ob);
    case 'swingKnife': return drawSwingKnife(ctx, ob, t);
    case 'fallingKnife': return drawFallingKnife(ctx, ob, t);
    case 'oven': return drawOven(ctx, ob, t);
    case 'corn':
    case 'goldenCorn': return drawCorn(ctx, ob, t);
    case 'brainCorn': return drawBrainCorn(ctx, ob, t);
    case 'hotSauce': return drawHotSauce(ctx, ob, t);
    case 'bush': return drawBush(ctx, ob);
    default: return;
  }
}

function drawFence(ctx, ob) {
  // Broken fence: one post leaning, one rail snapped.
  ctx.save();
  ctx.translate(ob.x, ob.y);
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(0, 0, 7, ob.h);
  ctx.save();
  ctx.translate(27, 0);
  ctx.rotate(0.12);
  ctx.fillRect(0, 0, 7, ob.h);
  ctx.restore();
  ctx.fillStyle = '#6b543a';
  ctx.fillRect(-2, 10, ob.w + 4, 9);
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(-2, 32, 22, 9);
  ctx.fillStyle = '#3d2c1e';
  ctx.fillRect(0, 0, 7, 5);
  ctx.fillRect(27, 0, 7, 5);
  ctx.restore();
}

function drawTombstone(ctx, ob) {
  ctx.save();
  ctx.translate(ob.x, ob.y);
  ctx.fillStyle = '#7a7f72';
  ctx.beginPath();
  ctx.moveTo(0, ob.h);
  ctx.lineTo(0, 16);
  ctx.arc(ob.w / 2, 16, ob.w / 2, Math.PI, 0);
  ctx.lineTo(ob.w, ob.h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8f9484';
  ctx.beginPath();
  ctx.moveTo(4, ob.h);
  ctx.lineTo(4, 18);
  ctx.arc(ob.w / 2, 18, ob.w / 2 - 4, Math.PI, 0);
  ctx.lineTo(ob.w - 4, ob.h);
  ctx.closePath();
  ctx.fill();
  // Moss creeping up the stone.
  ctx.fillStyle = '#5a7a42';
  ctx.beginPath();
  ctx.ellipse(8, ob.h - 4, 9, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(ob.w - 10, ob.h - 8, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // A funny epitaph, picked once when the stone spawns.
  const epitaphs = ['RIP', 'OOPS', 'LOL', 'EEK'];
  ctx.fillStyle = '#3d4038';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(epitaphs[ob.ep || 0], ob.w / 2, 26);
  // A crack down the stone.
  ctx.strokeStyle = '#3d4038';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ob.w / 2 + 8, 12);
  ctx.lineTo(ob.w / 2 + 4, 22);
  ctx.lineTo(ob.w / 2 + 10, 30);
  ctx.stroke();
  ctx.restore();
}

function drawHaystack(ctx, ob) {
  // Cursed hay: dark, mossy, with a little skull tucked in.
  ctx.fillStyle = '#7a6a2a';
  ctx.beginPath();
  ctx.moveTo(ob.x, ob.y + ob.h);
  ctx.quadraticCurveTo(ob.x + ob.w / 2, ob.y - 26, ob.x + ob.w, ob.y + ob.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a4a1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const px = ob.x + 10 + i * 13;
    ctx.beginPath();
    ctx.moveTo(px, ob.y + ob.h - 4);
    ctx.quadraticCurveTo(px + 4, ob.y + 16, px + 8, ob.y + 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#5a7a42';
  ctx.beginPath();
  ctx.ellipse(ob.x + ob.w / 2, ob.y + 8, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e0c8';
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + 16, 5, 0, Math.PI * 2);
  ctx.fill();
  // X eyes: this little skull is very dead, and very confused about it.
  ctx.strokeStyle = '#0c1410';
  ctx.lineWidth = 1.2;
  for (const ex of [ob.x + ob.w / 2 - 2, ob.x + ob.w / 2 + 2]) {
    ctx.beginPath();
    ctx.moveTo(ex - 1.2, ob.y + 13.8);
    ctx.lineTo(ex + 1.2, ob.y + 16.2);
    ctx.moveTo(ex + 1.2, ob.y + 13.8);
    ctx.lineTo(ex - 1.2, ob.y + 16.2);
    ctx.stroke();
  }
}

function drawZombieCrow(ctx, ob) {
  const bobY = Math.sin(ob.bobPhase) * 6;
  const flap = Math.sin(ob.bobPhase * 2.4) * 0.7;
  ctx.save();
  ctx.translate(ob.x + 18, ob.y - 78 + bobY);
  // Wings, tattered.
  ctx.fillStyle = '#1a1a1a';
  ctx.save();
  ctx.rotate(-0.5 - flap * 0.5);
  ctx.beginPath();
  ctx.ellipse(-12, -6, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.rotate(0.4 + flap * 0.5);
  ctx.beginPath();
  ctx.ellipse(-10, 8, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Body.
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head and beak, open in a squawk.
  ctx.beginPath();
  ctx.arc(14, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c8b060';
  ctx.beginPath();
  ctx.moveTo(20, -9);
  ctx.lineTo(30, -5);
  ctx.lineTo(20, -4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a6a20';
  ctx.beginPath();
  ctx.moveTo(20, -2);
  ctx.lineTo(27, 0);
  ctx.lineTo(20, 1);
  ctx.closePath();
  ctx.fill();
  // Googly eyes: one big, one small, both terrified.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(13, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(18, -9, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0c1410';
  ctx.beginPath();
  ctx.arc(14, -8, 1.6, 0, Math.PI * 2);
  ctx.arc(18.5, -9, 1.1, 0, Math.PI * 2);
  ctx.fill();
  // A sweat drop: even the crow is nervous.
  ctx.fillStyle = 'rgba(140, 200, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(8, -14, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawZombieChicken(ctx, ob) {
  if (ob.dead > 0) {
    // A pile of bones, waiting to rise again.
    ctx.save();
    ctx.strokeStyle = '#e8e0c8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ob.x + 4, ob.y + ob.h - 2);
    ctx.lineTo(ob.x + 18, ob.y + ob.h - 10);
    ctx.moveTo(ob.x + 12, ob.y + ob.h - 2);
    ctx.lineTo(ob.x + 26, ob.y + ob.h - 8);
    ctx.stroke();
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath();
    ctx.arc(ob.x + 22, ob.y + ob.h - 12, 5, 0, Math.PI * 2);
    ctx.fill();
    // X eyes on the skull: dead, but still confused.
    ctx.strokeStyle = '#0c1410';
    ctx.lineWidth = 1.2;
    for (const ex of [ob.x + 20, ob.x + 24]) {
      ctx.beginPath();
      ctx.moveTo(ex - 1.4, ob.y + ob.h - 14.4);
      ctx.lineTo(ex + 1.4, ob.y + ob.h - 11.6);
      ctx.moveTo(ex + 1.4, ob.y + ob.h - 14.4);
      ctx.lineTo(ex - 1.4, ob.y + ob.h - 11.6);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  const step = Math.sin(ob.walkPhase) * 4;
  ctx.save();
  ctx.translate(ob.x + 16, ob.y + ob.h);
  // Legs, one dragging.
  ctx.strokeStyle = '#3d5228';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-4 + step, 0);
  ctx.moveTo(6, -8);
  ctx.lineTo(10, 0);
  ctx.stroke();
  // Body, rotten green with feather tufts.
  ctx.fillStyle = ob.risen ? '#8aa06a' : '#6a8f4e';
  ctx.beginPath();
  ctx.ellipse(0, -16, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4c6b38';
  ctx.beginPath();
  ctx.ellipse(-8, -22, 7, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Dragging wing.
  ctx.fillStyle = '#556f3c';
  ctx.beginPath();
  ctx.ellipse(-10, -10, 9, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Head and comb.
  ctx.fillStyle = '#6a8f4e';
  ctx.beginPath();
  ctx.arc(12, -28, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a2f2f';
  ctx.beginPath();
  ctx.arc(10, -34, 3, 0, Math.PI * 2);
  ctx.arc(14, -35, 3, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.fillStyle = '#e8b04b';
  ctx.beginPath();
  ctx.moveTo(18, -30);
  ctx.lineTo(26, -27);
  ctx.lineTo(18, -25);
  ctx.closePath();
  ctx.fill();
  // Crossed googly eyes (brighter once it has risen).
  ctx.save();
  ctx.shadowColor = ob.risen ? '#ffd700' : '#ff3b30';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(10, -31, 3, 0, Math.PI * 2);
  ctx.arc(16, -31, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#0c1410';
  ctx.beginPath();
  ctx.arc(11.5, -30, 1.4, 0, Math.PI * 2);
  ctx.arc(14.5, -30, 1.1, 0, Math.PI * 2);
  ctx.fill();
  // Sweat drop: this chicken is very confused about being dead.
  ctx.fillStyle = 'rgba(140, 200, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(6, -36, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCleaverBlade(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#3d2c1e';
  ctx.fillRect(-4, -46, 8, 22);
  ctx.fillStyle = '#8a9a9a';
  ctx.beginPath();
  ctx.moveTo(-9, -26);
  ctx.lineTo(9, -26);
  ctx.lineTo(4, 26);
  ctx.quadraticCurveTo(0, 34, -6, 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4a24';
  ctx.beginPath();
  ctx.arc(0, -18, 3, 0, Math.PI * 2);
  ctx.arc(0, -6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a6a6a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.restore();
}

function drawSwingKnife(ctx, ob, t) {
  const ang = Math.sin(t * 1.9 + ob.phase) * 0.85;
  const pivotX = ob.x + 13;
  const pivotY = ob.y - 150;
  ctx.strokeStyle = '#2c3d22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(pivotX + Math.sin(ang) * 118, pivotY + Math.cos(ang) * 118);
  ctx.stroke();
  ctx.fillStyle = '#2c3d22';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
  ctx.fill();
  drawCleaverBlade(ctx, pivotX + Math.sin(ang) * 118, pivotY + Math.cos(ang) * 118, ang);
}

function drawFallingKnife(ctx, ob, t) {
  if (ob.state === 'warn') {
    const pulse = 0.35 + 0.3 * Math.sin(t * 16);
    ctx.fillStyle = `rgba(255, 80, 60, ${pulse})`;
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2, ob.groundY - 4, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 80, 60, 0.85)';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('!', ob.x + ob.w / 2 - 4, ob.groundY - 70);
    return;
  }
  drawCleaverBlade(ctx, ob.x + ob.w / 2, ob.y + 34, 0);
  if (ob.state === 'stuck') {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2, ob.groundY - 3, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOven(ctx, ob, t) {
  // The cursed oven: black iron, a skull vent, green flames inside.
  ctx.fillStyle = '#2a2a2e';
  ctx.beginPath();
  ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 8);
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#101010';
  ctx.beginPath();
  ctx.roundRect(ob.x + 10, ob.y + 14, ob.w - 20, 44, 6);
  ctx.fill();
  const glow = 0.6 + 0.4 * Math.sin(t * 9 + ob.x);
  ctx.fillStyle = `rgba(80, 255, 120, ${0.55 + 0.35 * glow})`;
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + 36, 13, 0, Math.PI * 2);
  ctx.fill();
  // Skull vent on the door, with googly eyes: one big, one small.
  ctx.fillStyle = '#e8e0c8';
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + 30, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e0c8';
  ctx.fillRect(ob.x + ob.w / 2 - 5, ob.y + 34, 10, 4);
  ctx.fillStyle = '#101010';
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2 - 2.5, ob.y + 29, 2.1, 0, Math.PI * 2);
  ctx.arc(ob.x + ob.w / 2 + 2.5, ob.y + 29, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1a12';
  ctx.fillRect(ob.x + 10, ob.y + 66, ob.w - 20, 6);
  // Green flame jets on top when the oven is roaring.
  if (ob.flame > 0) {
    for (let i = 0; i < 3; i++) {
      const fx = ob.x + 22 + i * 33;
      const fh = 34 + Math.sin(t * 14 + i * 2.1) * 10;
      ctx.fillStyle = i % 2 ? '#8be06a' : '#3fae5a';
      ctx.beginPath();
      ctx.moveTo(fx - 12, ob.y);
      ctx.quadraticCurveTo(fx - 6, ob.y - fh, fx, ob.y - fh - 8);
      ctx.quadraticCurveTo(fx + 6, ob.y - fh, fx + 12, ob.y);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawCorn(ctx, ob, t) {
  const bobY = Math.sin(t * 4 + ob.bob) * 4;
  const y = ob.y + bobY;
  ctx.save();
  ctx.translate(ob.x + ob.w / 2, y + ob.h / 2);
  ctx.rotate(Math.sin(t * 2 + ob.bob) * 0.12);
  ctx.fillStyle = ob.golden ? '#ffd700' : '#f2c14e';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ob.golden ? '#e6b800' : '#d9a441';
  for (let r = -2; r <= 2; r++) {
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.arc(c * 6, r * 7, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#7cb342';
  ctx.beginPath();
  ctx.ellipse(-8, 12, 5, 10, 0.5, 0, Math.PI * 2);
  ctx.ellipse(8, 12, 5, 10, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (ob.golden) {
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ob.x + ob.w / 2, y + ob.h / 2, 26 + Math.sin(t * 5) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBrainCorn(ctx, ob, t) {
  // Corn with a brain on top: the zombie's favourite snack. 100 x combo.
  const bobY = Math.sin(t * 4 + ob.bob) * 4;
  const y = ob.y + bobY;
  ctx.save();
  ctx.shadowColor = '#ff7ab8';
  ctx.shadowBlur = 14 + Math.sin(t * 5) * 5;
  ctx.translate(ob.x + ob.w / 2, y + ob.h / 2);
  ctx.rotate(Math.sin(t * 2 + ob.bob) * 0.12);
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.ellipse(0, 6, 11, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9a441';
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.arc(c * 6, 6 + r * 7, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The brain.
  ctx.fillStyle = '#ff8fc0';
  ctx.beginPath();
  ctx.arc(-4, -12, 8, 0, Math.PI * 2);
  ctx.arc(5, -13, 8, 0, Math.PI * 2);
  ctx.arc(0, -6, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d95f8a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.quadraticCurveTo(-2, -18, 2, -14);
  ctx.moveTo(-6, -8);
  ctx.quadraticCurveTo(0, -12, 6, -8);
  ctx.stroke();
  // A goofy face on the brain: it smiles at you. Then you eat it.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5, -14, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -14, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0c1410';
  ctx.beginPath();
  ctx.arc(-4, -14, 1.2, 0, Math.PI * 2);
  ctx.arc(6, -14, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d95f8a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -6, 3.5, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.restore();
}

function drawHotSauce(ctx, ob, t) {
  const bobY = Math.sin(t * 4) * 4;
  const y = ob.y + bobY;
  ctx.fillStyle = 'rgba(255, 80, 20, 0.25)';
  ctx.beginPath();
  ctx.arc(ob.x + 15, y + 24, 24 + Math.sin(t * 5) * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.roundRect(ob.x + 5, y + 12, 20, 30, 4);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(ob.x + 7, y + 20, 16, 14);
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('HOT', ob.x + 8, y + 31);
  ctx.fillStyle = '#7a2e0e';
  ctx.beginPath();
  ctx.roundRect(ob.x + 10, y + 2, 10, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#e2701d';
  ctx.beginPath();
  ctx.moveTo(ob.x + 15, y - 6);
  ctx.lineTo(ob.x + 21, y + 4);
  ctx.lineTo(ob.x + 9, y + 4);
  ctx.closePath();
  ctx.fill();
  // Two tiny eyes on the flame: the hot sauce is alive, and it is proud.
  ctx.fillStyle = '#7a2e0e';
  ctx.beginPath();
  ctx.arc(ob.x + 13, y - 1, 1.1, 0, Math.PI * 2);
  ctx.arc(ob.x + 17, y - 1, 1.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(ctx, ob) {
  // Brambles: dark, thorny, with purple berries. Slide in and the
  // zombie farmer loses your scent.
  ctx.fillStyle = '#2c3d22';
  ctx.beginPath();
  ctx.arc(ob.x + 22, ob.y + 30, 22, 0, Math.PI * 2);
  ctx.arc(ob.x + 52, ob.y + 22, 26, 0, Math.PI * 2);
  ctx.arc(ob.x + 78, ob.y + 32, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d5228';
  ctx.beginPath();
  ctx.arc(ob.x + 36, ob.y + 26, 14, 0, Math.PI * 2);
  ctx.arc(ob.x + 62, ob.y + 30, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9a6bc0';
  for (const [bx, by] of [[30, 22], [58, 16], [76, 28]]) {
    ctx.beginPath();
    ctx.arc(ob.x + bx, ob.y + by, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Two googly eyes peek out of the brambles. The bush is watching you.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ob.x + 40, ob.y + 14, 4, 0, Math.PI * 2);
  ctx.arc(ob.x + 58, ob.y + 14, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0c1410';
  ctx.beginPath();
  ctx.arc(ob.x + 38.5, ob.y + 14, 1.8, 0, Math.PI * 2);
  ctx.arc(ob.x + 56.5, ob.y + 14, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e2b18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ob.x + 20, ob.y + 10);
  ctx.lineTo(ob.x + 30, ob.y + 22);
  ctx.moveTo(ob.x + 60, ob.y + 8);
  ctx.lineTo(ob.x + 70, ob.y + 20);
  ctx.stroke();
}
