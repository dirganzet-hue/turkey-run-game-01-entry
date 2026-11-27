// Input — keyboard (arrows / WASD, Space jump, Shift dash) plus mouse and
// touch taps on the canvas. Edge-triggered actions are queued and consumed
// once per frame so a single press never fires twice.

const JUMP_KEYS = new Set([' ', 'ArrowUp', 'w', 'W']);
const DASH_KEYS = new Set(['Shift', 'x', 'X']);

export class Input {
  constructor(canvas) {
    this.held = { left: false, right: false, down: false };
    this.jumpQueue = 0;
    this.dashQueue = 0;
    this.restartQueue = 0;
    this.pauseQueue = 0;
    this.muteQueue = 0;
    this.anyQueue = 0;
    this.canvas = canvas;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.noteKey(e.key, true);
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => this.noteKey(e.key, false));
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.jumpQueue++;
      this.anyQueue++;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  noteKey(key, down) {
    if (JUMP_KEYS.has(key) && down) {
      this.jumpQueue++;
      this.anyQueue++;
    }
    if (DASH_KEYS.has(key) && down) {
      this.dashQueue++;
      this.anyQueue++;
    }
    if ((key === 'r' || key === 'R' || key === 'Enter') && down) {
      this.restartQueue++;
      this.anyQueue++;
    }
    if ((key === 'p' || key === 'P') && down) this.pauseQueue++;
    if ((key === 'm' || key === 'M') && down) this.muteQueue++;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') this.held.left = down;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') this.held.right = down;
    if (key === 'ArrowDown' || key === 's' || key === 'S') this.held.down = down;
    if (down && !JUMP_KEYS.has(key)) this.anyQueue++;
  }

  consumeJump() {
    const n = this.jumpQueue;
    this.jumpQueue = 0;
    return n > 0;
  }

  consumeDash() {
    const n = this.dashQueue;
    this.dashQueue = 0;
    return n > 0;
  }

  consumeRestart() {
    const n = this.restartQueue;
    this.restartQueue = 0;
    return n > 0;
  }

  consumePause() {
    const n = this.pauseQueue;
    this.pauseQueue = 0;
    return n > 0;
  }

  consumeMute() {
    const n = this.muteQueue;
    this.muteQueue = 0;
    return n > 0;
  }

  consumeAny() {
    const n = this.anyQueue;
    this.anyQueue = 0;
    return n > 0;
  }
}
