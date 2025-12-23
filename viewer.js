const viewer = document.getElementById('viewer');
const card = document.getElementById('card');
const reset = document.getElementById('reset');

let rotX = -8;
let rotY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const yawLimit = 28;

function render() {
  card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

viewer.addEventListener('pointerdown', (event) => {
  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  viewer.setPointerCapture(event.pointerId);
});

viewer.addEventListener('pointermove', (event) => {
  if (!isDragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  rotY = clamp(rotY + dx * 0.35, -yawLimit, yawLimit);
  rotX = clamp(rotX - dy * 0.3, -35, 35);
  lastX = event.clientX;
  lastY = event.clientY;
  render();
});

const stopDrag = () => {
  isDragging = false;
};

viewer.addEventListener('pointerup', stopDrag);
viewer.addEventListener('pointerleave', stopDrag);
viewer.addEventListener('pointercancel', stopDrag);

reset.addEventListener('click', () => {
  rotX = -8;
  rotY = 0;
  render();
});

render();
