import { uint256, StarknetChainId } from "https://esm.sh/starknet@6.9.0";

const mintButton = document.getElementById("mint");
const modal = document.getElementById("wallet-modal");
const closeButton = document.getElementById("wallet-close");
const walletButtons = document.querySelectorAll(".wallet-btn");
const viewer = document.getElementById("viewer");
const card = document.getElementById("card");
const statusEl = document.getElementById("status");

const CONTRACT_ADDRESS =
  "0x01bbf1cc158c2843d0300e643fa6e562af2e4d4aea43224528a5850a06358828";
const MAINNET_CHAIN_ID = StarknetChainId?.SN_MAIN || "0x534e5f4d41494e";

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

viewer.addEventListener("pointerdown", (event) => {
  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  viewer.setPointerCapture(event.pointerId);
});

viewer.addEventListener("pointermove", (event) => {
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

viewer.addEventListener("pointerup", stopDrag);
viewer.addEventListener("pointerleave", stopDrag);
viewer.addEventListener("pointercancel", stopDrag);

render();

const setStatus = (message, state = "") => {
  statusEl.textContent = message;
  if (state) {
    statusEl.dataset.state = state;
  } else {
    delete statusEl.dataset.state;
  }
};

const formatHash = (hash) =>
  hash ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : "";

const walletMatches = (provider, wallet) => {
  if (!provider?.id) return true;
  const id = provider.id.toLowerCase();
  if (wallet === "argent") return id.includes("argent");
  if (wallet === "braavos") return id.includes("braavos");
  return true;
};

const getWalletProvider = (wallet) => {
  if (wallet === "argent" && window.starknet_argentX) {
    return window.starknet_argentX;
  }
  if (wallet === "braavos" && window.starknet_braavos) {
    return window.starknet_braavos;
  }
  return window.starknet || null;
};

mintButton.addEventListener("click", () => {
  modal.showModal();
});

closeButton.addEventListener("click", () => {
  modal.close();
});

walletButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const wallet = button.dataset.wallet;
    const provider = getWalletProvider(wallet);
    if (!provider) {
      setStatus(
        "Wallet not found. Open this page in Argent or Braavos, or install the extension.",
        "error"
      );
      return;
    }
    if (!walletMatches(provider, wallet)) {
      setStatus("Selected wallet is not available in this browser.", "error");
      return;
    }

    try {
      setStatus("Connecting wallet...", "busy");
      await provider.enable();

      const chainId = await provider.getChainId();
      if (chainId !== MAINNET_CHAIN_ID) {
        setStatus("Please switch to Starknet Mainnet.", "error");
        return;
      }

      const account = provider.account;
      const to = provider.selectedAddress || account?.address;
      if (!account || !to) {
        setStatus("Wallet account not detected.", "error");
        return;
      }

      setStatus("Minting...", "busy");
      const amount = uint256.bnToUint256(1n);
      const tx = await account.execute({
        contractAddress: CONTRACT_ADDRESS,
        entrypoint: "mint",
        calldata: [to, amount.low, amount.high],
      });

      modal.close();
      statusEl.innerHTML = `Mint submitted. <a href="https://voyager.online/tx/${tx.transaction_hash}" target="_blank" rel="noreferrer">${formatHash(
        tx.transaction_hash
      )}</a>`;
      statusEl.dataset.state = "success";
    } catch (err) {
      console.error(err);
      setStatus("Mint failed. Please try again.", "error");
    }
  });
});
