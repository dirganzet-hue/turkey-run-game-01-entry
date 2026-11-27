// Render — backgrounds, particles and the HUD. All art is drawn with code:
// autumn skies, parallax trees and barns, kitchen tiles, drifting leaves,
// feather bursts and dust. Nothing is loaded from a file.

export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, kind, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 220;
      this.list.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.6 + Math.random() * 0.5,
        age: 0,
        size: 3 + Math.random() * 5,
        color: kind === 'feather' ? '#e8b04b' : kind === 'leaf' ? ['#e2701d', '#f2a541', '#c1440e'][i % 3] : '#d9c9a8',
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

function drawSun(ctx, x, y, t) {
  const pulse = 1 + Math.sin(t * 1.2) * 0.03;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 243, 196, 0.6)';
  ctx.lineWidth = 8;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 0.1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 56, Math.sin(a) * 56);
    ctx.lineTo(Math.cos(a) * 72, Math.sin(a) * 72);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTree(ctx, x, groundY, scale, color) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-6, -70, 12, 70);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -96, 34, 0, Math.PI * 2);
  ctx.arc(-24, -76, 24, 0, Math.PI * 2);
  ctx.arc(24, -76, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c1440e';
  ctx.beginPath();
  ctx.arc(-14, -104, 8, 0, Math.PI * 2);
  ctx.arc(16, -88, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBarnSilhouette(ctx, x, groundY, scale) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#7a3b22';
  ctx.fillRect(-70, -90, 140, 90);
  ctx.beginPath();
  ctx.moveTo(-82, -90);
  ctx.lineTo(0, -140);
  ctx.lineTo(82, -90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a2c18';
  ctx.fillRect(-22, -52, 44, 52);
  ctx.strokeStyle = '#f7e8c9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22, -52);
  ctx.lineTo(22, 0);
  ctx.moveTo(22, -52);
  ctx.lineTo(-22, 0);
  ctx.stroke();
  ctx.restore();
}

function drawForestGate(ctx, x, groundY, t) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.fillStyle = '#5d8f38';
  ctx.beginPath();
  ctx.arc(-70, -60, 46, 0, Math.PI * 2);
  ctx.arc(70, -60, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4e7a2e';
  ctx.beginPath();
  ctx.arc(0, -110, 60, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(-78, -90, 14, 90);
  ctx.fillRect(64, -90, 14, 90);
  ctx.fillStyle = '#a06a35';
  ctx.beginPath();
  ctx.arc(0, -92, 66, Math.PI, 0);
  ctx.lineTo(66, -92);
  ctx.lineTo(-66, -92);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', 0, -58);
  ctx.fillText('FOREST', 0, -38);
  ctx.textAlign = 'left';
  ctx.restore();
}

export function drawBackground(ctx, stage, stageIndex, distance, t, width, height, groundY) {
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, groundY + 2);

  if (stageIndex === 0) drawSun(ctx, 1060, 110, t);

  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 248, 230, 0.75)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 520 - distance * 0.35) % 1500 + 1500) % 1500 - 120;
    const cy = 70 + i * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 40, cy + 6, 44, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parallax layer: trees in the farmyard, barn silhouettes in the barn,
  // hanging pots and tiles in the kitchen.
  if (stageIndex === 0) {
    for (let i = 0; i < 6; i++) {
      const tx = ((i * 340 - distance * 0.5) % 1600 + 1600) % 1600 - 160;
      drawTree(ctx, tx, groundY, 1 + (i % 3) * 0.25, ['#c1440e', '#e2701d', '#a05a2c'][i % 3]);
    }
  } else if (stageIndex === 1) {
    for (let i = 0; i < 3; i++) {
      const bx = ((i * 620 - distance * 0.45) % 1600 + 1600) % 1600 - 160;
      drawBarnSilhouette(ctx, bx, groundY, 0.9 + (i % 2) * 0.3);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 8; i++) {
      const hx = ((i * 210 - distance * 0.8) % 1400 + 1400) % 1400 - 60;
      ctx.beginPath();
      ctx.ellipse(hx, groundY - 8, 34, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Kitchen: checkered wall tiles and hanging copper pots.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 16; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * 80, y * 80, 80, 80);
      }
    }
    for (let i = 0; i < 4; i++) {
      const px = ((i * 360 - distance * 0.5) % 1500 + 1500) % 1500 - 100;
      ctx.strokeStyle = '#5a3a1e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, 66);
      ctx.stroke();
      ctx.fillStyle = '#b87333';
      ctx.beginPath();
      ctx.arc(px, 92, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a24';
      ctx.beginPath();
      ctx.arc(px, 92, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = stage.groundDark;
  ctx.fillRect(0, groundY, width, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  const dashOffset = distance % 90;
  for (let x = -dashOffset; x < width; x += 90) {
    ctx.fillRect(x, groundY + 46, 44, 5);
  }

  // Falling leaves in the farmyard, embers in the kitchen.
  if (stageIndex !== 1) {
    for (let i = 0; i < 10; i++) {
      const lx = ((i * 173 + t * 40 - distance * 0.9) % 1400 + 1400) % 1400 - 60;
      const ly = ((i * 97 + t * 55) % 560) + 20;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(t * 2 + i);
      ctx.fillStyle = stageIndex === 0 ? ['#e2701d', '#f2a541', '#c1440e'][i % 3] : 'rgba(255, 120, 20, 0.8)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // The forest gate waits at the very end of the run.
  if (distance > 1680) {
    const gateX = 1280 - (distance - 1680) * 2.2;
    if (gateX > -200 && gateX < 1500) drawForestGate(ctx, gateX, groundY, t);
  }
}

// HUD: score, distance, hearts, stage, dash meter and the farmer's
// proximity bar. Big and plain so it reads even shrunk to a contact sheet.
export function drawHud(ctx, hud, width) {
  const pad = 18;
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Score panel.
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(pad, pad, 250, 108, 12);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText('SCORE', pad + 14, pad + 24);
  ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
  ctx.fillText(String(hud.score), pad + 14, pad + 58);
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillStyle = hud.combo > 1 ? '#ffd700' : '#f7e8c9';
  ctx.fillText(`CORN x${hud.corn}  ${hud.combo > 1 ? `COMBO x${hud.combo}` : ''}`, pad + 14, pad + 86);

  // Hearts.
  for (let i = 0; i < 3; i++) {
    const hx = pad + 22 + i * 40;
    const hy = pad + 122;
    ctx.fillStyle = i < hud.hearts ? '#c0392b' : 'rgba(255,255,255,0.25)';
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
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(width - pad - 250, pad, 250, 76, 12);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText(hud.stageName, width - pad - 14, pad + 24);
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.fillText(`${Math.floor(hud.distance)} m`, width - pad - 14, pad + 56);

  // Farmer proximity bar, bottom left: the closer the red, the closer he is.
  const barW = 250;
  const barX = pad;
  const barY = 720 - 58;
  const closeness = 1 - Math.min(1, Math.max(0, (hud.farmerGap - 46) / 284));
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(barX, barY - 22, barW, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('FARMER', barX + 10, barY - 6);
  ctx.fillStyle = closeness > 0.66 ? '#c0392b' : closeness > 0.33 ? '#e2701d' : '#7cb342';
  ctx.beginPath();
  ctx.roundRect(barX + 82, barY - 16, (barW - 94) * closeness, 12, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(barX + 82, barY - 16, barW - 94, 12, 6);
  ctx.stroke();

  // Dash meter, bottom right.
  const dashX = width - pad - 250;
  ctx.fillStyle = 'rgba(43, 26, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(dashX, barY - 22, 250, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillText(hud.dashing ? 'HOT SAUCE DASH!' : 'DASH [Shift]', dashX + 10, barY - 6);
  const dashFill = hud.dashing ? 1 : 1 - Math.min(1, hud.dashCooldown / 4.5);
  ctx.fillStyle = hud.dashing ? '#ff7814' : '#ffd700';
  ctx.beginPath();
  ctx.roundRect(dashX + 118, barY - 16, 120 * dashFill, 12, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.roundRect(dashX + 118, barY - 16, 120, 12, 6);
  ctx.stroke();

  ctx.restore();
}
