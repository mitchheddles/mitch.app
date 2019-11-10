import throttle from 'lodash.throttle';

import DocumentHelper from './DocumentHelper';

const defaultOptions = {
  holdingAngle: 40,
  xLimit: 90,
  yLimit: 90,
};

class Mouse {
  x = 0;
  y = 0;
  mass = 50;
  listeners = {};
  listenersMap = {};

  constructor(parent, options) {
    if (!parent) {
      return;
    }

    const { height, width } = DocumentHelper.getDimensions();
    this.x = width / 2;
    this.y = height / 2;

    this.parent = parent;
    this.options = { ...defaultOptions, options };
    this.originalMass = this.mass;

    this.throttledDeviceMove = throttle(this.handleDeviceMove, 20);
    this.throttledMove = throttle(this.handleMove, 20);

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.throttledDeviceMove, false);
    }

    window.addEventListener('mousemove', this.throttledMove);
    window.addEventListener('mousedown', this.handleClick);
  }

  remove() {
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('mousedown', this.handleClick);
    window.removeEventListener('deviceorientation', this.handleDeviceMove);

    // Remove all subscriptions
    Object.keys(this.listenersMap).forEach(id => {
      this.unsubscribe(id);
    });
  }

  subscribe = (event, callback) => {
    if (typeof this.listeners[event] === 'undefined') {
      this.listeners[event] = {};
    }

    if (typeof callback !== 'function') {
      console.error('The event was not a function');
      return null;
    }

    const id = `${event}.${Date.now()}`;

    this.listenersMap[id] = { event };
    this.listeners[event][id] = ({ callback });

    return id;
  };

  unsubscribe = (id) => {
    const { event } = this.listenersMap[id];
    if (event) {
      delete this.listeners[event][id];
      delete this.listenersMap[id];
    }
  }

  trigger = event => {
    const eventListeners = this.listeners[event];

    if (typeof eventListeners === 'undefined') {
      return;
    }

    const state = this.getState();

    Object.keys(eventListeners).forEach(id => {
      const { callback } = eventListeners[id];
      callback(state);
    });
  };

  getPosition = () => {
    const { height, width } = DocumentHelper.getDimensions();
    return {
      x: this.x,
      y: this.y,
      percentX: this.x / width,
      percentY: this.y / height,
    }
  }

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

  setPosition = (x, y) => {
    this.x = x;
    this.y = y;
  }

  restore = () => {
    this.mass = this.originalMass;
    this.pulsing = false;
  }

  pulse = () => {
    const dt = Date.now() - this.startTime;
    const pulseDuration = 1000;
    const pulseMultiplier = 300;

    if (dt > pulseDuration) {
      this.restore();
      return;
    }

    this.mass = this.originalMass + pulseMultiplier * Math.sin(1 - dt / pulseDuration);

    requestAnimationFrame(this.pulse);
  }

  handleDeviceMove = (e) => {
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
    this.trigger('move');
  }

  handleMove = (e) => {
    if (this.pulsing) {
      return;
    }

    this.x = e.pageX;
    this.y = e.pageY;

    this.setPosition(e.pageX, e.pageY);
    this.trigger('move');
  }

  handleClick = (e) => {
    this.setPosition(e.pageX, e.pageY);

    this.startTime = Date.now();
    this.pulsing = true;
    this.pulse();
    this.trigger('click');
  }
}

export default Mouse;
