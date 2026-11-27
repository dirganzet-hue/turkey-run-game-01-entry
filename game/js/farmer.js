// Farmer — the chaser. He never stops coming: every stumble lets him close
// the gap, every clean stretch lets the turkey pull away. When the gap hits
// zero he grabs the bird and the run ends.

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = 300; // pixels behind the turkey
    this.runPhase = 0;
    this.searching = false;
    this.searchTime = 0;
    this.grumble = 0;
  }

  // gap: pixels behind the turkey. 0 means caught.
  get caughtUp() {
    return this.gap <= 46;
  }

  stumble() {
    this.gap = Math.max(40, this.gap - 85);
    this.grumble = 1;
  }

  rewardCorn() {
    this.gap = Math.min(330, this.gap + 4);
  }

  dashAway() {
    this.gap = Math.min(330, this.gap + 55);
  }

  loseTrack() {
    this.searching = true;
    this.searchTime = 1.4;
    this.gap = Math.min(330, this.gap + 70);
  }

  update(dt, turkeyDashing) {
    this.runPhase += dt * 13;
    if (this.grumble > 0) this.grumble -= dt;
    if (this.searching) {
      this.searchTime -= dt;
      if (this.searchTime <= 0) this.searching = false;
    }
    // He slowly gains while the turkey runs normally, faster when the
    // turkey is hurt; a dashing turkey pulls away.
    if (turkeyDashing) {
      this.gap = Math.min(330, this.gap + 26 * dt);
    } else if (!this.searching) {
      this.gap = Math.max(40, this.gap - 4 * dt);
    }
  }

  draw(ctx, turkeyX, groundY, t) {
    const x = turkeyX - this.gap;
    if (x < -90) return; // off the left edge: only his shouts reach you
    const legSwing = this.searching ? 0 : Math.sin(this.runPhase) * 12;
    const bob = this.searching ? 0 : Math.abs(Math.sin(this.runPhase)) * -3;

    ctx.save();
    ctx.translate(x, groundY);

    // Straw hat.
    ctx.fillStyle = '#e8c15a';
    ctx.beginPath();
    ctx.ellipse(0, -96 + bob, 30, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(0, -102 + bob, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(-17, -100 + bob, 34, 4);

    // Head: red nose, big moustache, angry brows.
    ctx.fillStyle = '#f0c297';
    ctx.beginPath();
    ctx.arc(0, -84 + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(12, -82 + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a3a1e';
    ctx.beginPath();
    ctx.ellipse(2, -76 + bob, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a3a1e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -90 + bob);
    ctx.lineTo(-2, -87 + bob);
    ctx.moveTo(9, -90 + bob);
    ctx.lineTo(2, -87 + bob);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -87 + bob, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -87 + bob, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-4, -87 + bob, 1.2, 0, Math.PI * 2);
    ctx.arc(6, -87 + bob, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Body: red plaid shirt, denim overalls.
    ctx.fillStyle = '#b03a2e';
    ctx.beginPath();
    ctx.ellipse(0, -52 + bob, 24, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7b241c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -62 + bob);
    ctx.lineTo(20, -62 + bob);
    ctx.moveTo(-22, -48 + bob);
    ctx.lineTo(22, -48 + bob);
    ctx.stroke();
    ctx.fillStyle = '#3a6ea5';
    ctx.fillRect(-16, -46 + bob, 32, 22);
    ctx.fillStyle = '#2c5282';
    ctx.fillRect(-16, -46 + bob, 6, 22);
    ctx.fillRect(10, -46 + bob, 6, 22);

    // Legs, pumping.
    ctx.strokeStyle = '#2c5282';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -26);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -26);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();
    ctx.fillStyle = '#5a3a1e';
    ctx.fillRect(-14 + legSwing - 4, -5, 14, 6);
    ctx.fillRect(2 - legSwing, -5, 14, 6);

    // Pitchfork held high, waving.
    const wave = this.searching ? Math.sin(t * 6) * 0.3 : Math.sin(this.runPhase) * 0.08;
    ctx.save();
    ctx.translate(24, -60 + bob);
    ctx.rotate(0.5 + wave);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(0, -34);
    ctx.stroke();
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 3;
    for (const dx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(dx, -34);
      ctx.lineTo(dx, -48);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();

    // Shout bubble when he is close or has just been dodged.
    if (this.gap < 150 || this.grumble > 0) {
      const text = this.searching ? "WHERE'D IT GO?!" : this.grumble > 0 ? 'HEY! COME BACK!' : 'GOBBLE GOBBLE... GOTCHA!';
      ctx.save();
      ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
      const w = ctx.measureText(text).width + 18;
      const bx = Math.max(8, x - w / 2);
      const by = groundY - 150;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#7a4a21';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7a2e0e';
      ctx.fillText(text, bx + 9, by + 18);
      ctx.restore();
    }
  }
}
