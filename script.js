const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const cache = new Map();

function buildAudioUrl(symbolId) {
  return new URL(`audio/${symbolId}.mp3`, import.meta.url).href;
}

async function fetchBuffer(symbolId) {
  if (cache.has(symbolId)) {
    return cache.get(symbolId);
  }

  const response = await fetch(buildAudioUrl(symbolId));
  if (!response.ok) {
    throw new Error(`No fue posible cargar el audio para ${symbolId}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  cache.set(symbolId, buffer);
  return buffer;
}

async function playSymbol(symbolId) {
  try {
    const buffer = await fetchBuffer(symbolId);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error(error);
  }
}

function handleClick(event) {
  const symbol = event.currentTarget;
  const soundId = symbol.dataset.sound;
  if (!soundId) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  playSymbol(soundId);
}

function addPointerFeedback(element) {
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(event);
    }
  });
}

document.querySelectorAll(".ipa-symbol").forEach((symbol) => {
  symbol.setAttribute("role", "button");
  symbol.setAttribute("tabindex", "0");
  symbol.setAttribute("aria-pressed", "false");
  symbol.addEventListener("click", handleClick);
  addPointerFeedback(symbol);
});
