// Obstacles & pickups — everything the turkey must jump, slide under, dodge
// or collect. Each obstacle carries its own hitbox and draw routine; the
// main loop only moves them left and asks for collisions.

export function makeFence(x, groundY) {
  return { kind: 'fence', x, y: groundY - 58, w: 34, h: 58, passed: false };
}

export function makeHaystack(x, groundY) {
  return { kind: 'haystack', x, y: groundY - 52, w: 74, h: 52, passed: false };
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
    case 'haystack':
      return { x: ob.x + 6, y: ob.y + 14, w: ob.w - 12, h: ob.h - 14 };
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
    case 'haystack': return drawHaystack(ctx, ob);
    case 'swingKnife': return drawSwingKnife(ctx, ob, t);
    case 'fallingKnife': return drawFallingKnife(ctx, ob, t);
    case 'oven': return drawOven(ctx, ob, t);
    case 'corn':
    case 'goldenCorn': return drawCorn(ctx, ob, t);
    case 'hotSauce': return drawHotSauce(ctx, ob, t);
    case 'bush': return drawBush(ctx, ob);
    default: return;
  }
}

function drawFence(ctx, ob) {
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(ob.x, ob.y, 7, ob.h);
  ctx.fillRect(ob.x + ob.w - 7, ob.y, 7, ob.h);
  ctx.fillStyle = '#a06a35';
  ctx.fillRect(ob.x - 2, ob.y + 10, ob.w + 4, 9);
  ctx.fillRect(ob.x - 2, ob.y + 32, ob.w + 4, 9);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(ob.x, ob.y, 7, 5);
  ctx.fillRect(ob.x + ob.w - 7, ob.y, 7, 5);
}

function drawHaystack(ctx, ob) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(ob.x, ob.y + ob.h);
  ctx.quadraticCurveTo(ob.x + ob.w / 2, ob.y - 26, ob.x + ob.w, ob.y + ob.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b07f2a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const px = ob.x + 10 + i * 13;
    ctx.beginPath();
    ctx.moveTo(px, ob.y + ob.h - 4);
    ctx.quadraticCurveTo(px + 4, ob.y + 16, px + 8, ob.y + 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(ob.x + ob.w / 2 - 3, ob.y - 6, 6, 12);
}

function drawKnifeBlade(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(-4, -46, 8, 22);
  ctx.fillStyle = '#d7dde3';
  ctx.beginPath();
  ctx.moveTo(-9, -26);
  ctx.lineTo(9, -26);
  ctx.lineTo(4, 26);
  ctx.quadraticCurveTo(0, 34, -6, 26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa5ad';
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
  ctx.strokeStyle = '#5a3a1e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(pivotX + Math.sin(ang) * 118, pivotY + Math.cos(ang) * 118);
  ctx.stroke();
  ctx.fillStyle = '#5a3a1e';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
  ctx.fill();
  drawKnifeBlade(ctx, pivotX + Math.sin(ang) * 118, pivotY + Math.cos(ang) * 118, ang);
}

function drawFallingKnife(ctx, ob, t) {
  if (ob.state === 'warn') {
    const pulse = 0.35 + 0.3 * Math.sin(t * 16);
    ctx.fillStyle = `rgba(192, 57, 43, ${pulse})`;
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2, ob.groundY - 4, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(192, 57, 43, 0.85)';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText('!', ob.x + ob.w / 2 - 4, ob.groundY - 70);
    return;
  }
  drawKnifeBlade(ctx, ob.x + ob.w / 2, ob.y + 34, 0);
  if (ob.state === 'stuck') {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2, ob.groundY - 3, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOven(ctx, ob, t) {
  // Big cream oven with a round window: fire glows inside.
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath();
  ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 8);
  ctx.fill();
  ctx.strokeStyle = '#9a8f7a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.roundRect(ob.x + 10, ob.y + 14, ob.w - 20, 44, 6);
  ctx.fill();
  const glow = 0.6 + 0.4 * Math.sin(t * 9 + ob.x);
  ctx.fillStyle = `rgba(255, ${120 + Math.floor(60 * glow)}, 20, ${0.75 + 0.25 * glow})`;
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + 36, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1a12';
  ctx.fillRect(ob.x + 10, ob.y + 66, ob.w - 20, 6);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.arc(ob.x + 22, ob.y + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.arc(ob.x + 36, ob.y + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  // Flame jets on top when the oven is roaring.
  if (ob.flame > 0) {
    for (let i = 0; i < 3; i++) {
      const fx = ob.x + 22 + i * 33;
      const fh = 34 + Math.sin(t * 14 + i * 2.1) * 10;
      ctx.fillStyle = i % 2 ? '#f2a541' : '#e2701d';
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
  ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
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
}

function drawBush(ctx, ob) {
  ctx.fillStyle = '#4e7a2e';
  ctx.beginPath();
  ctx.arc(ob.x + 22, ob.y + 30, 22, 0, Math.PI * 2);
  ctx.arc(ob.x + 52, ob.y + 22, 26, 0, Math.PI * 2);
  ctx.arc(ob.x + 78, ob.y + 32, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d8f38';
  ctx.beginPath();
  ctx.arc(ob.x + 36, ob.y + 26, 14, 0, Math.PI * 2);
  ctx.arc(ob.x + 62, ob.y + 30, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  for (const [bx, by] of [[30, 22], [58, 16], [76, 28]]) {
    ctx.beginPath();
    ctx.arc(ob.x + bx, ob.y + by, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
