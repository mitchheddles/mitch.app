import Mouse from './Mouse';
import Node from './Node';

import { getColor } from './helpers';
import DocumentHelper from './DocumentHelper';

const pi = Math.PI;
const UPDATE_DEBOUNCE = 1000;

const defaultOptions = {
  xSpacing: 60,
  ySpacing: 60,
  duration: 60,
};

class Mesh {
  constructor(canvas, options) {
    if (!canvas || canvas.tagName !== 'CANVAS') {
      console.log('Canvas no found');
    }

    this.nodes = [];
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    this.setCanvasDimensions();

    // Add listeners
    this.mouse = new Mouse(this.canvas);
    this.resizeListener = DocumentHelper.on('resize', this.handleResize);

    // Get nodes
    this.generateNodes();
  }

  destroy() {
    this.mouse.remove();
    clearTimeout(this.scheduleUpdate);
    this.scheduleUpdate = null;

    if (this.resizeListener) {
      DocumentHelper.off(this.resizeListener);
    }
  }

  start = () => {
    if (!this.startTime) {
      this.startTime = Date.now();
    }

    const dt = Date.now() - this.startTime;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.start);
  };

  reset = () => {
    this.nodes = [];
    this.generateNodes();
  }

  handleResize = () => {
    const { width: oldWidth, height: oldHeight } = this.dimensions;

    this.setCanvasDimensions();

    const { width, height } = this.dimensions;

    if (width > oldWidth || height > oldHeight) {
      // Canvas is larger than before
      clearTimeout(this.scheduleUpdate);
      this.scheduleUpdate = setTimeout(this.reset, UPDATE_DEBOUNCE);
    }

  }

  setCanvasDimensions() {
    const height = this.canvas.clientHeight;
    const width = this.canvas.clientWidth;

    this.canvas.height = height;
    this.canvas.width = width;

    // Save to avoid reflow
    this.dimensions = {
      height,
      width,
    };
  }

  clearCanvas() {
    const { width, height } = this.dimensions;
    this.ctx.clearRect(0, 0, width, height);
  }

  generateNodes() {
    const { xSpacing, ySpacing } = this.options;
    const { width, height } = this.dimensions;

    let i = 0;
    const columns = width / xSpacing + 1;
    const rows = height / ySpacing + 1;

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const y = row * ySpacing;
        const x = col * xSpacing;
        i++;

        this.nodes.push(new Node(x, y, { index: i }));
      }
    }
  }

  update(t) {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].update(t, this.mouse);
    }
  }

  render() {
    const { nodes } = this;

    this.clearCanvas();

    for (let i = 0; i < this.nodes.length; i++) {
      const { color, size, x, y } = nodes[i];

      // Render node
      this.ctx.fillStyle = getColor(color);
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, pi * 2, true);
      this.ctx.fill();
      this.ctx.closePath();
    }
  }
}

export default Mesh;
