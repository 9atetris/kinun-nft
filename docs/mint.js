const mintButton = document.getElementById('mint');
const modal = document.getElementById('wallet-modal');
const closeButton = document.getElementById('wallet-close');
const walletButtons = document.querySelectorAll('.wallet-btn');
const viewer = document.getElementById('viewer');
const card = document.getElementById('card');

let rotX = -6;
let rotY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
const yawLimit = 24;

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

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
  rotX = clamp(rotX - dy * 0.25, -28, 28);
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

render();

mintButton.addEventListener('click', () => {
  modal.showModal();
});

closeButton.addEventListener('click', () => {
  modal.close();
});

function getWalletProvider(wallet) {
  if (wallet === 'argent' && window.starknet_argentX) return window.starknet_argentX;
  if (wallet === 'braavos' && window.starknet_braavos) return window.starknet_braavos;
  return window.starknet || null;
}

walletButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const wallet = button.dataset.wallet;
    const provider = getWalletProvider(wallet);
    if (!provider) {
      alert('Wallet not found. Please install Argent or Braavos extension.');
      return;
    }
    try {
      await provider.enable();
      modal.close();
      alert('Wallet connected. Mint flow will be wired next.');
    } catch (err) {
      console.error(err);
      alert('Wallet connection failed.');
    }
  });
});
