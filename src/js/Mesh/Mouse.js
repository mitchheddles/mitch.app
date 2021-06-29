import throttle from 'lodash.throttle';

import DocumentHelper from './DocumentHelper';
import { easeOutCubic } from './easing';

const defaultOptions = {
  holdingAngle: 40,
  xLimit: 90,
  yLimit: 90,
};

class Mouse {
  x = 0;
  y = 0;
  position = { x0: 0, y0: 0, x1: 0, y1: 0, t0: Date.now() };
  mass = 100;
  velocity = 1;
  listeners = {};
  listenersMap = {};
  attached = true;

  constructor(parent, options) {
    if (!parent) {
      return;
    }

    const { height, width } = DocumentHelper.getDimensions();
    this.x = width / 2;
    this.y = height / 2;
    this.setPosition(this.x, this.y);

    this.parent = parent;
    this.options = { ...defaultOptions, options };
    this.originalMass = this.mass;
    this.originalVelocity = this.velocity;

    this.throttledDeviceMove = throttle(this.handleDeviceMove, 100);
    this.throttledMove = throttle(this.handleMove, 100);

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.throttledDeviceMove);
    }

    window.addEventListener('mousemove', this.throttledMove);
    window.addEventListener('mousedown', this.handleClick);

    this.move();
  }

  remove() {
    this.attached = false;

    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('mousedown', this.handleClick);
    window.removeEventListener('deviceorientation', this.handleDeviceMove);
  }

  getPosition = () => {
    const { height, width } = DocumentHelper.getDimensions();
    return {
      x: this.x,
      y: this.y,
      percentX: this.x / width,
      percentY: this.y / height,
    };
  };

  setPosition = (x1, y1) => {
    // Internal only
    this.position = { x0: this.x, y0: this.y, x1, y1, t0: Date.now() };
  };

  getAngle = () => {
    const { height, width } = DocumentHelper.getDimensions();
    const dx = this.x - width / 2;
    const dy = this.y - height / 2;

    // Return radians
    const theta = Math.atan2(dy, dx);

    return theta >= 0 ? theta : theta + 2 * Math.PI;
  };

  getState = () => ({
    ...this.getPosition(),
    angle: this.getAngle(),
  });

  restore = () => {
    this.mass = this.originalMass;
    this.velocity = this.originalVelocity;
  };

  move = () => {
    const { x1, y1, x0, y0, t0 } = this.position;

    const dt = Date.now() - t0;
    const duration = 800;

    const easedTd = easeOutCubic(dt / duration);

    const dx = x1 - x0;
    const dy = y1 - y0;

    if (!this.isRoughlyEqual(x1, this.x)) {
      this.x = x0 + dx * easedTd * this.velocity;
    }

    if (!this.isRoughlyEqual(y1, this.y)) {
      this.y = y0 + dy * easedTd * this.velocity;
    }

    if (this.attached) {
      requestAnimationFrame(this.move);
    }
  };

  pulse = () => {
    const dt = Date.now() - this.startTime;
    const pulseDuration = 1000;
    const pulseMultiplier = 200;

    if (dt > pulseDuration) {
      this.restore();
      return;
    }

    this.mass = this.originalMass + pulseMultiplier * Math.sin(1 - dt / pulseDuration);
    this.velocity = 0.3;

    if (this.attached) {
      requestAnimationFrame(this.pulse);
    }
  };

  isRoughlyEqual(num, num2) {
    return Math.abs(num - num2) < 2;
  }

  handleDeviceMove = e => {
    // beta - x, gamma - y, alpha - z (rotation axis)
    const { beta, gamma } = e;
    const { height, width } = this.parent;

    let x = gamma;
    let y = beta;

    x += this.options.holdingAngle;
    // y += 90;

    x = width * (x / this.options.xLimit);
    y = height * (y / this.options.yLimit);

    this.setPosition(x, y);
  };

  handleMove = e => {
    this.setPosition(e.pageX, e.pageY);
  };

  handleClick = e => {
    this.setPosition(e.pageX, e.pageY);

    this.startTime = Date.now();
    this.pulse();
  };
}

export default Mouse;
