export function getRandom({ min = 0, max = 1 }) {
  return Math.random() * (max - min) + min;
}

export function getColor({ r, g, b, a }) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function distanceToMouse(mouse, node) {
  const dx = node.x - mouse.x;
  const dy = node.y - mouse.y;
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

// Returns the nodes position based on mouse position
export function getNodesMousePosition(mouse, node) {
  const dx = node.x - mouse.x;
  const dy = node.y - mouse.y;
  const distance = distanceToMouse(mouse, node);

  const pull = mouse.mass / (Math.max(distance, mouse.mass) * node.mass);
  const x = node.x - pull * dx;
  const y = node.y - pull * dy;

  return {
    x,
    y,
  };
}
