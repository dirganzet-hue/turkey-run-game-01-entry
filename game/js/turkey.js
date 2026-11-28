// Turkey — the player, now a goofy zombie turkey. Green skin, crossed
// googly eyes, a toothless grin with one tooth, a lolling tongue, a
// crooked little party hat, a tattered tail fan and stitches across the
// face — and a tipsy waddle, because the dead still celebrate. Same
// physics as the living bird (it still runs, jumps, slides and dashes),
// drawn entirely with canvas paths. y is the FEET position; the ground
// is 600.

export const TURKEY_HOME_X = 230;
export const TURKEY_MIN_X = 120;
export const TURKEY_MAX_X = 430;

export class Turkey {
  constructor(groundY) {
    this.groundY = groundY;
    this.reset();
  }

  reset() {
    this.x = TURKEY_HOME_X;
    this.y = this.groundY;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.slideTime = 0;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.invuln = 0;
    this.runPhase = 0;
    this.flapPhase = 0;
    this.squash = 0;
  }

  get dashing() {
    return this.dashTime > 0;
  }

  get dashReady() {
    return this.dashCooldown <= 0;
  }

  // Hitbox in world pixels; sliding makes it low and wide, jumping keeps it tall.
  bounds() {
    if (this.sliding) return { x: this.x - 34, y: this.y - 34, w: 68, h: 34 };
    return { x: this.x - 26, y: this.y - 62, w: 52, h: 62 };
  }

  startDash() {
    if (!this.dashReady) return false;
    this.dashTime = 0.9;
    this.dashCooldown = 4.5;
    return true;
  }

  update(dt, input, speed) {
    this.runPhase += dt * (this.dashing ? 26 : 15);
    if (this.invuln > 0) this.invuln -= dt;
    if (this.dashTime > 0) this.dashTime -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.squash > 0) this.squash -= dt * 4;

    // Lateral shuffle: dodge falling cleavers, line up brain-corn.
    const lateral = 340 * dt;
    if (input.held.left) this.x = Math.max(TURKEY_MIN_X, this.x - lateral);
    if (input.held.right) this.x = Math.min(TURKEY_MAX_X, this.x + lateral);
    if (!input.held.left && !input.held.right) {
      this.x += (TURKEY_HOME_X - this.x) * Math.min(1, dt * 1.5);
    }

    // Slide: hold Down on the ground to duck under zombie crows and cleavers.
    const wantSlide = input.held.down && this.onGround;
    if (wantSlide && !this.sliding) {
      this.sliding = true;
      this.slideTime = 0;
    }
    if (this.sliding) {
      this.slideTime += dt;
      if (!input.held.down || this.slideTime > 1.1) this.sliding = false;
    }

    // Jump, with a little coyote time from the ground.
    if (input.consumeJump() && this.onGround && !this.sliding) {
      this.vy = -880;
      this.onGround = false;
      this.flapPhase = 1;
      return 'jump';
    }
    if (this.flapPhase > 0) this.flapPhase -= dt * 2.4;

    if (!this.onGround) {
      this.vy += 2500 * dt;
      this.y += this.vy * dt;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
        this.onGround = true;
        this.squash = 1;
        return 'land';
      }
    }
    return null;
  }

  draw(ctx, t) {
    const blink = this.invuln > 0 && Math.floor(t * 14) % 2 === 0;
    if (blink) ctx.globalAlpha = 0.35;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.dashing) ctx.translate(6, 0);
    // A tipsy waddle: the goofy zombie turkey sways side to side.
    const wobble = this.onGround && !this.sliding ? Math.sin(this.runPhase) * 0.06 : 0;
    ctx.rotate(wobble);
    const squashK = this.squash > 0 ? 1 - 0.12 * this.squash : 1;
    ctx.scale(1 / Math.sqrt(squashK), squashK);

    const legSwing = this.onGround && !this.sliding ? Math.sin(this.runPhase) * 10 : 0;
    const bodyBob = this.onGround && !this.sliding ? Math.abs(Math.sin(this.runPhase)) * -3 : 0;

    // Tattered tail fan: five ragged green feathers with bites taken out.
    const featherColors = ['#5a7a42', '#6b8f4e', '#4c6b38', '#7da05a', '#556f3c'];
    ctx.save();
    ctx.translate(-26, -46 + bodyBob);
    for (let i = 0; i < 5; i++) {
      const ang = (-0.9 + i * 0.45) - 0.2;
      ctx.save();
      ctx.rotate(ang);
      ctx.fillStyle = featherColors[i];
      ctx.beginPath();
      ctx.ellipse(0, -26, 9, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0c1410';
      ctx.beginPath();
      ctx.arc(4, -34, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Legs, mid-shamble.
    ctx.strokeStyle = '#3d5228';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -14);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();
    // Bone-white feet.
    ctx.fillStyle = '#e8e0c8';
    ctx.fillRect(-12 + legSwing, -4, 9, 4);
    ctx.fillRect(4 - legSwing, -4, 9, 4);

    // Body: a plump rotten-green oval.
    ctx.fillStyle = '#7da05a';
    ctx.beginPath();
    ctx.ellipse(0, -34 + bodyBob, 30, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8c98a';
    ctx.beginPath();
    ctx.ellipse(4, -30 + bodyBob, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.sliding) {
      // Low slide: head tucked forward, wings spread low.
      ctx.fillStyle = '#5a7a42';
      ctx.beginPath();
      ctx.ellipse(18, -30 + bodyBob, 20, 9, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b8c98a';
      ctx.beginPath();
      ctx.ellipse(34, -26 + bodyBob, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8e0c8';
      ctx.beginPath();
      ctx.moveTo(42, -28 + bodyBob);
      ctx.lineTo(56, -24 + bodyBob);
      ctx.lineTo(42, -21 + bodyBob);
      ctx.closePath();
      ctx.fill();
    } else {
      // Wing with stitches, flapping on the way up.
      const flap = this.flapPhase > 0 ? -0.9 * this.flapPhase : Math.sin(this.runPhase) * 0.12;
      ctx.save();
      ctx.translate(-6, -38 + bodyBob);
      ctx.rotate(flap);
      ctx.fillStyle = '#5a7a42';
      ctx.beginPath();
      ctx.ellipse(-8, -2, 16, 9, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2c3d22';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(-8, 0);
      ctx.moveTo(-6, -8);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.restore();

      // Neck and head.
      ctx.fillStyle = '#7da05a';
      ctx.beginPath();
      ctx.ellipse(20, -58 + bodyBob, 9, 16, 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Head.
      ctx.fillStyle = '#7da05a';
      ctx.beginPath();
      ctx.arc(26, -72 + bodyBob, 11, 0, Math.PI * 2);
      ctx.fill();
      // Bone patch on the skull.
      ctx.fillStyle = '#e8e0c8';
      ctx.beginPath();
      ctx.arc(22, -79 + bodyBob, 4, 0, Math.PI * 2);
      ctx.fill();
      // Beak, bone-white.
      ctx.fillStyle = '#e8e0c8';
      ctx.beginPath();
      ctx.moveTo(34, -75 + bodyBob);
      ctx.lineTo(46, -70 + bodyBob);
      ctx.lineTo(34, -67 + bodyBob);
      ctx.closePath();
      ctx.fill();
      // Dark wattle.
      ctx.fillStyle = '#8a2f2f';
      ctx.beginPath();
      ctx.ellipse(33, -62 + bodyBob, 4, 7, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Crossed googly eyes: one big, one small, pupils pointing inward.
      // While dashing they squeeze shut, happy: WHEEE!
      if (this.dashing) {
        ctx.strokeStyle = '#0c1410';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(22, -76 + bodyBob, 3.5, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(31, -75 + bodyBob, 3, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(22, -76 + bodyBob, 4.5, 0, Math.PI * 2);
        ctx.arc(31, -75 + bodyBob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0c1410';
        ctx.beginPath();
        ctx.arc(24, -75 + bodyBob, 2, 0, Math.PI * 2);
        ctx.arc(29.5, -74 + bodyBob, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Toothless grin: one tooth, a lolling tongue and a drool drop.
      ctx.strokeStyle = '#2c3d22';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(39, -66 + bodyBob, 4.5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(37, -67 + bodyBob, 3.5, 4);
      ctx.fillStyle = '#ff8fa8';
      ctx.beginPath();
      ctx.ellipse(43, -57 + bodyBob, 3.5, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8be06a';
      ctx.beginPath();
      ctx.arc(44, -49 + bodyBob, 2.2, 0, Math.PI * 2);
      ctx.fill();
      // A crooked little party hat, because the dead still celebrate.
      ctx.save();
      ctx.translate(24, -82 + bodyBob);
      ctx.rotate(-0.25);
      ctx.fillStyle = '#9a6bc0';
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, -16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, -17, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Stitch across the face.
      ctx.strokeStyle = '#2c3d22';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(16, -80 + bodyBob);
      ctx.lineTo(22, -74 + bodyBob);
      ctx.moveTo(22, -80 + bodyBob);
      ctx.lineTo(16, -74 + bodyBob);
      ctx.stroke();
    }

    // Dizzy stars circling the head after a hit.
    if (this.invuln > 0) {
      ctx.fillStyle = '#ffd700';
      for (let i = 0; i < 3; i++) {
        const a = t * 6 + i * 2.1;
        const sx = 24 + Math.cos(a) * 20;
        const sy = -88 + bodyBob + Math.sin(a) * 8;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(a);
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    // Dash speed lines, sickly green.
    if (this.dashing) {
      ctx.strokeStyle = 'rgba(139, 224, 106, 0.8)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const yy = this.y - 20 - i * 16;
        const xx = this.x - 44 - ((t * 900 + i * 53) % 60);
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(xx + 34, yy);
        ctx.stroke();
      }
    }
  }
}
