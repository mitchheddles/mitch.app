import { distanceToMouse, getNodesMousePosition, getRandom } from './helpers';

const MOUSE_DISTANCE = 300;
const FADE_OUT_DURATION = 1000;
const START_OPACITY = .8;

const pi = Math.PI;

const defaultOptions = {
  color: {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  },
  dx: {
    min: 0,
    max: 0,
  }, // variation from origin in x
  dy: {
    min: 0,
    max: 0,
  }, // variation from origin in y
  diameter: {
    min: 1,
    max: 2,
  },
  damping: {
    min: 2,
    max: 2,
  },
  spring: {
    min: 1,
    max: 1,
  },
  size: 1,
  mass: 1,
};

class Node {
  constructor(x, y, options) {
    const { color, dx, dy, damping, diameter, index, mass, size, spring } = {
      ...defaultOptions,
      ...options,
    };

    this.angleOffset = Math.random() * 2 * pi;
    this.damping = getRandom(damping);
    this.color = { ...color };
    this.diameter = getRandom(diameter);
    this.index = index;
    this.mass = mass;
    this.size = size;
    this.spring = getRandom(spring);
    this.x = x + getRandom(dx);
    this.y = y + getRandom(dy);

    // Save original position
    this.x0 = this.x;
    this.y0 = this.y;
  }

  update(t, mouse) {
    const { mass, x0, y0 } = this;
    const pull = getNodesMousePosition(mouse, {
      mass,
      x: x0,
      y: y0,
    });

    this.moveToPoint(t, { x2: pull.x, y2: pull.y });

    const distance = distanceToMouse(mouse, this);
    let opacity = Math.max(0, (1 - distance / MOUSE_DISTANCE));

    if (t < FADE_OUT_DURATION) {
      opacity += START_OPACITY - (t / FADE_OUT_DURATION);
    }

    this.color.a = opacity;
  }

  changeColor(t, { color, duration = 5000, startTime = 0 }) {
    if (!color) {
      return;
    }

    if (t > duration) {
      return;
    }

    const { r, g, b, a } = this.color;

    // TODO: Need to store the original color and start time

    // Determine distance to go
    const dr = color.r - defaultOptions.color.r;
    const dg = color.g - defaultOptions.color.g;
    const db = color.b - defaultOptions.color.b;
    const da = color.a - defaultOptions.color.a;

    // Assume colors change at the same rate
    const dt = (t - startTime) / duration;

    if (this.index === 20) {
      // console.log(a + da * dt);
    }

    this.color = {
      r: defaultOptions.color.r + dr * dt,
      g: defaultOptions.color.g + dg * dt,
      b: defaultOptions.color.b + db * dt,
      a: defaultOptions.color.a + da * dt,
    };
  }

  moveToPoint(t, { x2, y2, duration = 1000 }) {
    const { damping, spring, x, y } = this;

    // Determine distance to go
    const dx = x2 - x;
    const dy = y2 - y;

    // TODO: Determine change in time without using position
    // With this approach, the node will continually move towards the point but never reach it
    const dt = spring * Math.sqrt(dx * dx + dy * dy) / (duration * damping);

    if (this.index === 20) {
      // console.log(dt);
    }

    this.x = x + dx * dt;
    this.y = y + dy * dt;
  }

  orbit(t) {
    const { angleOffset, damping, diameter, x0, y0 } = this;

    const theta = (damping * t / 1000 * (2 * pi) + angleOffset) % (2 * pi);
    const x = x0 + Math.cos(theta) * (diameter / 2);
    const y = y0 + Math.sin(theta) * (diameter / 2);

    this.x = x;
    this.y = y;
  }
}

export default Node;
