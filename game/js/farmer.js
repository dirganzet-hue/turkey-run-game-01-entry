// Farmer — the chaser, now a clumsy zombie farmer. Green skin, torn
// overalls, a tattered straw hat that pops off when he stumbles, wide
// panicked eyes, a screaming mouth — and a pitchfork he holds BACKWARDS,
// tines dragging behind him, because he forgot which end is which. He
// never stops coming: every stumble lets him close the gap, every clean
// stretch lets the turkey pull away. When the gap hits zero he grabs the
// bird and the run ends. He wants brains now. He also shouts very silly
// things.

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
    // He slowly gains while the turkey runs normally; a dashing turkey
    // pulls away. He drags one leg, so he is a little slower than the
    // living farmer was.
    if (turkeyDashing) {
      this.gap = Math.min(330, this.gap + 26 * dt);
    } else if (!this.searching) {
      this.gap = Math.max(40, this.gap - 4 * dt);
    }
  }

  draw(ctx, turkeyX, groundY, t) {
    const x = turkeyX - this.gap;
    if (x < -90) return; // off the left edge: only his moans reach you
    const legSwing = this.searching ? 0 : Math.sin(this.runPhase) * 12;
    const bob = this.searching ? 0 : Math.abs(Math.sin(this.runPhase)) * -3;

    ctx.save();
    ctx.translate(x, groundY);

    // Tattered straw hat, tilted — it pops off when he stumbles.
    const hatPop = this.grumble > 0 ? 14 : 0;
    ctx.save();
    ctx.translate(0, -96 + bob - hatPop);
    ctx.rotate(-0.12 - (this.grumble > 0 ? 0.3 : 0));
    ctx.fillStyle = '#b89a4a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8873a';
    ctx.beginPath();
    ctx.ellipse(0, -6, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0c1410';
    ctx.beginPath();
    ctx.arc(10, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head: green skin, glowing red eyes, stitches, bared teeth.
    ctx.fillStyle = '#6a8f4e';
    ctx.beginPath();
    ctx.arc(0, -84 + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a7a42';
    ctx.beginPath();
    ctx.ellipse(0, -74 + bob, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wide panicked eyes, raised brows, a screaming mouth.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -87 + bob, 4, 0, Math.PI * 2);
    ctx.arc(5, -87 + bob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0c1410';
    ctx.beginPath();
    ctx.arc(-4, -87 + bob, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -87 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c3d22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -95 + bob);
    ctx.quadraticCurveTo(-5, -98 + bob, -1, -95 + bob);
    ctx.moveTo(1, -95 + bob);
    ctx.quadraticCurveTo(5, -98 + bob, 9, -95 + bob);
    ctx.stroke();
    // Stitch across the forehead.
    ctx.strokeStyle = '#2c3d22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -96 + bob);
    ctx.lineTo(-2, -91 + bob);
    ctx.moveTo(-2, -96 + bob);
    ctx.lineTo(-8, -91 + bob);
    ctx.stroke();
    // Open screaming mouth, with a tongue that has given up.
    ctx.fillStyle = '#1e2b18';
    ctx.beginPath();
    ctx.ellipse(2, -75 + bob, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8fa8';
    ctx.beginPath();
    ctx.ellipse(2, -73 + bob, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Beard stubble, grey-green.
    ctx.fillStyle = '#8a9a7a';
    ctx.beginPath();
    ctx.ellipse(0, -70 + bob, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sweat drops: he is always one step from a panic attack.
    ctx.fillStyle = 'rgba(140, 200, 255, 0.9)';
    const sweatBob = Math.sin(t * 4) * 2;
    ctx.beginPath();
    ctx.arc(-15, -96 + bob + sweatBob, 2.5, 0, Math.PI * 2);
    ctx.arc(15, -92 + bob - sweatBob, 2, 0, Math.PI * 2);
    ctx.fill();
    if (this.grumble > 0) {
      ctx.beginPath();
      ctx.arc(-8, -108 + bob, 2.5, 0, Math.PI * 2);
      ctx.arc(10, -112 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body: torn red plaid shirt, ripped denim overalls.
    ctx.fillStyle = '#8a2f2f';
    ctx.beginPath();
    ctx.ellipse(0, -52 + bob, 24, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a1f1f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -62 + bob);
    ctx.lineTo(20, -62 + bob);
    ctx.moveTo(-22, -48 + bob);
    ctx.lineTo(22, -48 + bob);
    ctx.stroke();
    ctx.fillStyle = '#0c1410';
    ctx.beginPath();
    ctx.moveTo(14, -60 + bob);
    ctx.lineTo(20, -52 + bob);
    ctx.lineTo(12, -50 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2c4a6b';
    ctx.fillRect(-16, -46 + bob, 32, 22);
    ctx.fillStyle = '#1e3648';
    ctx.fillRect(-16, -46 + bob, 6, 22);
    ctx.fillRect(10, -46 + bob, 6, 22);
    // A patch on the overalls that just says "?".
    ctx.fillStyle = '#3a5a7b';
    ctx.fillRect(-7, -44 + bob, 10, 10);
    ctx.fillStyle = '#d8e8c8';
    ctx.font = 'bold 9px Georgia, serif';
    ctx.fillText('?', -4, -35 + bob);

    // Legs: one pumping, one dragging stiff behind him — and when he
    // stumbles, the dragging leg kicks up in the air.
    const tripKick = this.grumble > 0 ? -12 : 0;
    ctx.strokeStyle = '#2c4a6b';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -26);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -26);
    ctx.lineTo(14, tripKick);
    ctx.stroke();
    ctx.fillStyle = '#3d3a2a';
    ctx.fillRect(-14 + legSwing - 4, -5, 14, 6);
    ctx.fillRect(10, -5 + tripKick, 14, 6);

    // Pitchfork held BACKWARDS, tines dragging behind him — he forgot
    // which end is which.
    const wave = this.searching ? Math.sin(t * 6) * 0.3 : Math.sin(this.runPhase) * 0.08;
    ctx.save();
    ctx.translate(24, -60 + bob);
    ctx.rotate(2.7 + wave);
    ctx.strokeStyle = '#6b4a24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(0, -34);
    ctx.stroke();
    ctx.strokeStyle = '#8a9a9a';
    ctx.lineWidth = 3;
    for (const dx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(dx, -34);
      ctx.lineTo(dx, -48);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();

    // Shout bubble when he is close, has just been dodged, or is lost.
    // The lines rotate, because he has a lot of feelings about this.
    if (this.gap < 150 || this.grumble > 0) {
      const CLOSE_LINES = ['BRAAAINS!', 'MY DINNER IS RUNNING!', "I'M TOO OLD FOR THIS!"];
      const GRUMBLE_LINES = ['HEY! COME BACK!', 'OW! MY TOE!', 'MY HAT!'];
      const text = this.searching ? "WHERE'D IT GO?! ... PROBABLY THE FRIDGE"
        : this.grumble > 0 ? GRUMBLE_LINES[Math.floor(t) % GRUMBLE_LINES.length]
        : CLOSE_LINES[Math.floor(t / 2) % CLOSE_LINES.length];
      ctx.save();
      ctx.font = 'bold 15px Georgia, serif';
      const w = ctx.measureText(text).width + 18;
      const bx = Math.max(8, x - w / 2);
      const by = groundY - 150;
      ctx.fillStyle = 'rgba(20, 30, 16, 0.95)';
      ctx.strokeStyle = '#8be06a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d8e8c8';
      ctx.fillText(text, bx + 9, by + 18);
      ctx.restore();
    }
  }
}
