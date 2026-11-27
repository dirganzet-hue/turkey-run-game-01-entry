// Turkey — the player. A plump brown bird with a fanned tail, drawn entirely
// with canvas paths. Handles running, jumping, sliding, dashing and lateral
// movement, and reports the hitbox the world collides against.

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

    // Lateral shuffle: dodge falling knives, line up corn.
    const lateral = 340 * dt;
    if (input.held.left) this.x = Math.max(TURKEY_MIN_X, this.x - lateral);
    if (input.held.right) this.x = Math.min(TURKEY_MAX_X, this.x + lateral);
    if (!input.held.left && !input.held.right) {
      this.x += (TURKEY_HOME_X - this.x) * Math.min(1, dt * 1.5);
    }

    // Slide: hold Down on the ground to duck under swinging knives.
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
    const squashK = this.squash > 0 ? 1 - 0.12 * this.squash : 1;
    ctx.scale(1 / Math.sqrt(squashK), squashK);

    const legSwing = this.onGround && !this.sliding ? Math.sin(this.runPhase) * 10 : 0;
    const bodyBob = this.onGround && !this.sliding ? Math.abs(Math.sin(this.runPhase)) * -3 : 0;

    // Tail fan: five autumn feathers fanning behind.
    const featherColors = ['#c1440e', '#e2701d', '#f2a541', '#8b5a2b', '#d95f02'];
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
      ctx.fillStyle = '#f7e8c9';
      ctx.beginPath();
      ctx.ellipse(0, -40, 3.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Legs, mid-stride.
    ctx.strokeStyle = '#e2701d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -14);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();

    // Body: a plump brown oval.
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.ellipse(0, -34 + bodyBob, 30, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b5a2b';
    ctx.beginPath();
    ctx.ellipse(4, -30 + bodyBob, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.sliding) {
      // Low duck: head tucked forward, wings spread low.
      ctx.fillStyle = '#5a3a1e';
      ctx.beginPath();
      ctx.ellipse(18, -30 + bodyBob, 20, 9, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8b04b';
      ctx.beginPath();
      ctx.ellipse(34, -26 + bodyBob, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d95f02';
      ctx.beginPath();
      ctx.moveTo(42, -28 + bodyBob);
      ctx.lineTo(56, -24 + bodyBob);
      ctx.lineTo(42, -21 + bodyBob);
      ctx.closePath();
      ctx.fill();
    } else {
      // Wing, flapping on the way up.
      const flap = this.flapPhase > 0 ? -0.9 * this.flapPhase : Math.sin(this.runPhase) * 0.12;
      ctx.save();
      ctx.translate(-6, -38 + bodyBob);
      ctx.rotate(flap);
      ctx.fillStyle = '#5a3a1e';
      ctx.beginPath();
      ctx.ellipse(-8, -2, 16, 9, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Neck and head.
      ctx.fillStyle = '#6b4423';
      ctx.beginPath();
      ctx.ellipse(20, -58 + bodyBob, 9, 16, 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Head.
      ctx.fillStyle = '#e8b04b';
      ctx.beginPath();
      ctx.arc(26, -72 + bodyBob, 11, 0, Math.PI * 2);
      ctx.fill();
      // Beak.
      ctx.fillStyle = '#e2701d';
      ctx.beginPath();
      ctx.moveTo(34, -75 + bodyBob);
      ctx.lineTo(46, -70 + bodyBob);
      ctx.lineTo(34, -67 + bodyBob);
      ctx.closePath();
      ctx.fill();
      // Wattle.
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.ellipse(33, -62 + bodyBob, 4, 7, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Eye, wide with panic.
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(29, -76 + bodyBob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(30.5, -76 + bodyBob, 2, 0, Math.PI * 2);
      ctx.fill();
      // Snood.
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(28, -70 + bodyBob);
      ctx.quadraticCurveTo(30, -62 + bodyBob, 27, -58 + bodyBob);
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    // Dash speed lines.
    if (this.dashing) {
      ctx.strokeStyle = 'rgba(255, 120, 20, 0.7)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const yy = this.y - 20 - i * 16;
        const xx = this.x - 44 - (t * 900 + i * 53) % 60;
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(xx + 34, yy);
        ctx.stroke();
      }
    }
  }
}
