// Render — backgrounds, particles, the night fog and the HUD. All art is
// drawn with code: a full moon over the graveyard, dead trees, jack-o-
// lanterns, haunted barn windows, a bubbling cauldron, slime bursts and
// bone piles. Nothing is loaded from a file.

export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, kind, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 220;
      let color = '#d9c9a8';
      if (kind === 'feather') color = '#e8b04b';
      if (kind === 'leaf') color = ['#e2701d', '#f2a541', '#c1440e'][i % 3];
      if (kind === 'slime') color = ['#8be06a', '#5a9a3a', '#b8e88a'][i % 3];
      if (kind === 'bone') color = '#e8e0c8';
      if (kind === 'brain') color = ['#ff8fc0', '#ff6ba8'][i % 2];
      if (kind === 'spark') color = ['#8be06a', '#d8ff5a', '#ffd700'][i % 3];
      this.list.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.6 + Math.random() * 0.5,
        age: 0,
        size: 3 + Math.random() * 5,
        color,
        spin: (Math.random() - 0.5) * 12,
      });
    }
  }

  update(dt) {
    for (const p of this.list) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.vx *= 1 - dt * 1.5;
    }
    this.list = this.list.filter((p) => p.age < p.life);
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin * p.age);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
  }
}

function drawMoon(ctx, x, y, t) {
  const pulse = 1 + Math.sin(t * 1.2) * 0.03;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = 'rgba(240, 244, 220, 0.12)';
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f0f4dc';
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d5dcc0';
  ctx.beginPath();
  ctx.arc(-14, -10, 9, 0, Math.PI * 2);
  ctx.arc(12, 8, 7, 0, Math.PI * 2);
  ctx.arc(16, -16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDeadTree(ctx, x, groundY, scale) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#1a2416';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -80);
  ctx.moveTo(0, -50);
  ctx.lineTo(-26, -84);
  ctx.moveTo(0, -62);
  ctx.lineTo(24, -96);
  ctx.moveTo(0, -80);
  ctx.lineTo(-8, -110);
  ctx.moveTo(0, -80);
  ctx.lineTo(12, -112);
  ctx.stroke();
  ctx.restore();
}

function drawPumpkin(ctx, x, groundY, t) {
  ctx.save();
  ctx.translate(x, groundY);
  const flicker = 0.7 + 0.3 * Math.sin(t * 6 + x);
  ctx.fillStyle = '#e2701d';
  ctx.beginPath();
  ctx.ellipse(0, -14, 22, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c1440e';
  ctx.beginPath();
  ctx.ellipse(-8, -14, 8, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(8, -14, 8, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a7a42';
  ctx.fillRect(-2, -32, 4, 8);
  // Glowing jack-o-lantern face.
  ctx.fillStyle = `rgba(255, 220, 90, ${flicker})`;
  ctx.beginPath();
  ctx.moveTo(-12, -18);
  ctx.lineTo(-6, -24);
  ctx.lineTo(-2, -18);
  ctx.closePath();
  ctx.moveTo(12, -18);
  ctx.lineTo(6, -24);
  ctx.lineTo(2, -18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-4, -6);
  ctx.lineTo(0, -10);
  ctx.lineTo(4, -6);
  ctx.lineTo(10, -10);
  ctx.lineTo(8, -4);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTombstoneBg(ctx, x, groundY, scale, tilt) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.rotate(tilt);
  ctx.fillStyle = '#5a5f52';
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-14, -18);
  ctx.arc(0, -18, 14, Math.PI, 0);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHauntedBarn(ctx, x, groundY, scale, t) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#241a1e';
  ctx.fillRect(-70, -90, 140, 90);
  ctx.beginPath();
  ctx.moveTo(-82, -90);
  ctx.lineTo(0, -140);
  ctx.lineTo(82, -90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a1216';
  ctx.fillRect(-22, -52, 44, 52);
  // One glowing window eye.
  const glow = 0.6 + 0.4 * Math.sin(t * 2 + x);
  ctx.fillStyle = `rgba(255, 200, 80, ${glow})`;
  ctx.beginPath();
  ctx.arc(0, -104, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 200, 80, ${glow * 0.7})`;
  ctx.fillRect(-14, -40, 10, 14);
  ctx.fillRect(6, -40, 10, 14);
  ctx.restore();
}

function drawCauldron(ctx, x, groundY, t) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(0, -26, 34, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3fae5a';
  ctx.beginPath();
  ctx.ellipse(0, -42, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const by = -48 - Math.abs(Math.sin(t * 3 + i * 2)) * 14;
    ctx.fillStyle = `rgba(139, 224, 106, ${0.9 - i * 0.25})`;
    ctx.beginPath();
    ctx.arc(-14 + i * 14, by, 5 - i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawForestGate(ctx, x, groundY, t) {
  ctx.save();
  ctx.translate(x, groundY);
  // Moonlit trees.
  ctx.fillStyle = '#1e3d1e';
  ctx.beginPath();
  ctx.arc(-70, -60, 46, 0, Math.PI * 2);
  ctx.arc(70, -60, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c5a2c';
  ctx.beginPath();
  ctx.arc(0, -110, 60, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(-78, -90, 14, 90);
  ctx.fillRect(64, -90, 14, 90);
  ctx.fillStyle = '#5a4632';
  ctx.beginPath();
  ctx.arc(0, -92, 66, Math.PI, 0);
  ctx.lineTo(66, -92);
  ctx.lineTo(-66, -92);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8e8c8';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', 0, -58);
  ctx.fillText('FOREST', 0, -38);
  ctx.textAlign = 'left';
  // Fireflies.
  for (let i = 0; i < 6; i++) {
    const fx = -60 + i * 24;
    const fy = -120 - Math.sin(t * 2 + i) * 18;
    ctx.fillStyle = `rgba(216, 255, 90, ${0.5 + 0.4 * Math.sin(t * 3 + i * 2)})`;
    ctx.beginPath();
    ctx.arc(fx, fy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBackground(ctx, stage, stageIndex, distance, t, width, height, groundY) {
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, groundY + 2);

  // Stars, twinkling.
  for (let i = 0; i < 60; i++) {
    const sx = (i * 173) % 1280;
    const sy = (i * 97) % 260;
    const tw = 0.35 + 0.4 * Math.abs(Math.sin(t * 1.5 + i));
    ctx.fillStyle = `rgba(240, 244, 220, ${tw})`;
    ctx.fillRect(sx, sy, 2, 2);
  }

  drawMoon(ctx, 1060, 110, t);

  // Drifting fog banks.
  ctx.fillStyle = 'rgba(180, 200, 180, 0.07)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 420 - distance * 0.25 + t * 12) % 1500 + 1500) % 1500 - 120;
    const cy = 300 + i * 70;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 180, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 120, cy + 14, 140, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parallax layer: graveyard, haunted barns, cursed kitchen.
  if (stageIndex === 0) {
    for (let i = 0; i < 6; i++) {
      const tx = ((i * 340 - distance * 0.5) % 1600 + 1600) % 1600 - 160;
      drawDeadTree(ctx, tx, groundY, 1 + (i % 3) * 0.25);
    }
    for (let i = 0; i < 8; i++) {
      const sx = ((i * 260 - distance * 0.7) % 1500 + 1500) % 1500 - 100;
      drawTombstoneBg(ctx, sx, groundY, 0.9 + (i % 3) * 0.3, (i % 2 ? -0.08 : 0.06));
    }
    for (let i = 0; i < 3; i++) {
      const px = ((i * 520 - distance * 0.6) % 1500 + 1500) % 1500 - 100;
      drawPumpkin(ctx, px, groundY, t);
    }
  } else if (stageIndex === 1) {
    for (let i = 0; i < 3; i++) {
      const bx = ((i * 620 - distance * 0.45) % 1600 + 1600) % 1600 - 160;
      drawHauntedBarn(ctx, bx, groundY, 0.9 + (i % 2) * 0.3, t);
    }
    for (let i = 0; i < 4; i++) {
      const tx = ((i * 420 - distance * 0.55) % 1600 + 1600) % 1600 - 160;
      drawDeadTree(ctx, tx, groundY, 0.8);
    }
  } else {
    // Cursed kitchen: dark tiles, hanging pots, a bubbling cauldron.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 16; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * 80, y * 80, 80, 80);
      }
    }
    for (let i = 0; i < 4; i++) {
      const px = ((i * 360 - distance * 0.5) % 1500 + 1500) % 1500 - 100;
      ctx.strokeStyle = '#3d2c1e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, 66);
      ctx.stroke();
      ctx.fillStyle = '#5a4a3a';
      ctx.beginPath();
      ctx.arc(px, 92, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2c22';
      ctx.beginPath();
      ctx.arc(px, 92, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 2; i++) {
      const cx = ((i * 700 - distance * 0.6) % 1500 + 1500) % 1500 - 100;
      drawCauldron(ctx, cx, groundY, t);
    }
  }

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = stage.groundDark;
  ctx.fillRect(0, groundY, width, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  const dashOffset = distance % 90;
  for (let x = -dashOffset; x < width; x += 90) {
    ctx.fillRect(x, groundY + 46, 44, 5);
  }

  // Drifting fireflies in the graveyard and barn, green embers in the kitchen.
  for (let i = 0; i < 10; i++) {
    const lx = ((i * 173 + t * 40 - distance * 0.9) % 1400 + 1400) % 1400 - 60;
    const ly = ((i * 97 + t * 55) % 560) + 20;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.fillStyle = stageIndex === 2 ? 'rgba(80, 255, 120, 0.7)' : `rgba(216, 255, 90, ${0.4 + 0.4 * Math.abs(Math.sin(t * 2 + i))})`;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // The forest gate waits at the very end of the run.
  if (distance > 1680) {
    const gateX = 1280 - (distance - 1680) * 2.2;
    if (gateX > -200 && gateX < 1500) drawForestGate(ctx, gateX, groundY, t);
  }
}

// The night fog: a darkness that closes in around the turkey, leaving a
// circle of moonlight vision around it. Drawn on a cached offscreen canvas
// so the hole punches only through the fog, never through the game.
let fogCanvas = null;
export function drawFog(ctx, turkeyX, turkeyY, width, height) {
  if (!fogCanvas) {
    fogCanvas = document.createElement('canvas');
    fogCanvas.width = width;
    fogCanvas.height = height;
  }
  const fctx = fogCanvas.getContext('2d');
  fctx.clearRect(0, 0, width, height);
  fctx.fillStyle = 'rgba(3, 7, 10, 0.45)';
  fctx.fillRect(0, 0, width, height);
  fctx.globalCompositeOperation = 'destination-out';
  const g = fctx.createRadialGradient(turkeyX, turkeyY - 40, 60, turkeyX, turkeyY - 40, 520);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  fctx.fillStyle = g;
  fctx.beginPath();
  fctx.arc(turkeyX, turkeyY - 40, 520, 0, Math.PI * 2);
  fctx.fill();
  fctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(fogCanvas, 0, 0);
}

// HUD: score, brains, combo chain with its timer bar, hearts, stage,
// distance, the zombie farmer's proximity bar and the dash meter. Big and
// plain so it reads even shrunk to a contact sheet.
export function drawHud(ctx, hud, width) {
  const pad = 18;
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Score panel.
  ctx.fillStyle = 'rgba(12, 20, 16, 0.78)';
  ctx.beginPath();
  ctx.roundRect(pad, pad, 250, 108, 12);
  ctx.fill();
  ctx.fillStyle = '#d8e8c8';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText('SCORE', pad + 14, pad + 24);
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(String(hud.score), pad + 14, pad + 58);
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillStyle = hud.combo > 1 ? '#ffd700' : '#d8e8c8';
  ctx.fillText(`CORN x${hud.corn}  BRAINS x${hud.brains}  ${hud.combo > 1 ? `CHAIN x${hud.combo}` : ''}`, pad + 14, pad + 86);

  // Combo chain timer bar.
  if (hud.combo > 1 && hud.comboTime > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(pad + 14, pad + 94, 222, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.roundRect(pad + 14, pad + 94, 222 * Math.max(0, hud.comboTime / 4), 6, 3);
    ctx.fill();
  }

  // Hearts.
  for (let i = 0; i < 3; i++) {
    const hx = pad + 22 + i * 40;
    const hy = pad + 122;
    ctx.fillStyle = i < hud.hearts ? '#8be06a' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, Math.PI * 2);
    ctx.arc(hx + 15, hy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 7, hy + 3);
    ctx.lineTo(hx + 22, hy + 3);
    ctx.lineTo(hx + 7.5, hy + 18);
    ctx.closePath();
    ctx.fill();
  }

  // Distance + stage, top right.
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(12, 20, 16, 0.78)';
  ctx.beginPath();
  ctx.roundRect(width - pad - 250, pad, 250, 76, 12);
  ctx.fill();
  ctx.fillStyle = '#d8e8c8';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(hud.stageName, width - pad - 14, pad + 24);
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(`${Math.floor(hud.distance)} m`, width - pad - 14, pad + 56);

  // Zombie farmer proximity bar, bottom left.
  const barW = 250;
  const barX = pad;
  const barY = 720 - 58;
  const closeness = 1 - Math.min(1, Math.max(0, (hud.farmerGap - 46) / 284));
  ctx.fillStyle = 'rgba(12, 20, 16, 0.78)';
  ctx.beginPath();
  ctx.roundRect(barX, barY - 22, barW, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#d8e8c8';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('ZOMBIE FARMER', barX + 10, barY - 6);
  ctx.fillStyle = closeness > 0.66 ? '#ff3b30' : closeness > 0.33 ? '#e2701d' : '#8be06a';
  ctx.beginPath();
  ctx.roundRect(barX + 132, barY - 16, (barW - 144) * closeness, 12, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(barX + 132, barY - 16, barW - 144, 12, 6);
  ctx.stroke();

  // Dash meter, bottom right.
  const dashX = width - pad - 250;
  ctx.fillStyle = 'rgba(12, 20, 16, 0.78)';
  ctx.beginPath();
  ctx.roundRect(dashX, barY - 22, 250, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#d8e8c8';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(hud.dashing ? 'ZOMBIE DASH!' : 'DASH [Shift]', dashX + 10, barY - 6);
  const dashFill = hud.dashing ? 1 : 1 - Math.min(1, hud.dashCooldown / 4.5);
  ctx.fillStyle = hud.dashing ? '#8be06a' : '#ffd700';
  ctx.beginPath();
  ctx.roundRect(dashX + 118, barY - 16, 120 * dashFill, 12, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.roundRect(dashX + 118, barY - 16, 120, 12, 6);
  ctx.stroke();

  ctx.restore();
}
