import throttle from 'lodash.throttle';

class DocumentHelper {
  body = document.body;
  width = document.body.clientWidth;
  height = document.body.clientHeight;
  scrollHeight = document.body.scrollHeight;
  listeners = {};
  listenersMap = {};

  constructor() {
    this.handleResize = throttle(this.onResize, 20);

    window.addEventListener('resize', this.handleResize);
  }

  triggerResize = () => {
    this.onResize();
  };

  on = (event, callback) => {
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

  off = (id) => {
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

    const dimensions = this.getDimensions();

    Object.keys(eventListeners).forEach(id => {
      const { callback } = eventListeners[id];
      callback(dimensions);
    });
  };

  onResize = () => {
    this.width = this.body.clientWidth;
    this.height = this.body.clientHeight;
    this.scrollHeight = this.body.scrollHeight;

    this.trigger('resize');
  };

  getDimensions = () => ({
    width: this.width,
    height: this.height,
    scrollHeight: this.scrollHeight,
  });

  getAspectRatio = () => this.height / this.width;
}

export default new DocumentHelper();
