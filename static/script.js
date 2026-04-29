const width = 30;
const height = 20;
const autoPlayDelayDefault = 500;

const grid = document.getElementById("grid");
const generationCount = document.getElementById("generation-count");
const speedSlider = document.getElementById("speed-slider");
const speedDisplay = document.getElementById("speed-display");
const autoPlayIndicator = document.getElementById("auto-play-indicator");
const autoPlayBtn = document.getElementById("auto-play-btn");
const nextBtn = document.getElementById("next-btn");
const randomBtn = document.getElementById("random-btn");
const clearBtn = document.getElementById("clear-btn");
const patternButtons = document.querySelectorAll("[data-pattern]");

let state = createEmptyState();
let generation = 0;
let autoPlayTimer = null;
let renderQueued = false;
const cells = [];

function createEmptyState() {
  return Array.from({ length: height }, () => Array(width).fill(false));
}

function isValidCoordinate(x, y) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

function setCell(x, y, alive) {
  if (isValidCoordinate(x, y)) {
    state[y][x] = alive;
  }
}

function seedPattern(patternName) {
  state = createEmptyState();
  generation = 0;

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  const patterns = {
    glider: [
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    blinker: [
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    block: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    beacon: [
      [0, 0],
      [1, 0],
      [0, 1],
      [3, 2],
      [2, 3],
      [3, 3],
    ],
    toad: [
      [1, 0],
      [2, 0],
      [3, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  };

  for (const [dx, dy] of patterns[patternName] || []) {
    setCell(centerX + dx, centerY + dy, true);
  }

  render();
}

function buildGrid() {
  if (!grid) return;

  const fragment = document.createDocumentFragment();

  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `Toggle cell ${x + 1}, ${y + 1}`);
      cell.addEventListener("click", () => {
        state[y][x] = !state[y][x];
        render();
      });

      cells[y][x] = cell;
      fragment.appendChild(cell);
    }
  }

  grid.appendChild(fragment);
}

function countLiveNeighbors(x, y) {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nextX = x + dx;
      const nextY = y + dy;
      if (isValidCoordinate(nextX, nextY) && state[nextY][nextX]) {
        count++;
      }
    }
  }

  return count;
}

function nextGeneration() {
  const nextState = createEmptyState();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countLiveNeighbors(x, y);
      nextState[y][x] = state[y][x]
        ? neighbors === 2 || neighbors === 3
        : neighbors === 3;
    }
  }

  state = nextState;
  generation++;
  render();
}

function clearGrid() {
  state = createEmptyState();
  generation = 0;
  stopAutoPlay();
  render();
}

function randomFill() {
  state = createEmptyState();
  generation = 0;
  stopAutoPlay();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      state[y][x] = Math.random() < 0.3;
    }
  }

  render();
}

function render() {
  if (renderQueued) return;
  renderQueued = true;

  requestAnimationFrame(() => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells[y][x].classList.toggle("alive", state[y][x]);
        cells[y][x].setAttribute("aria-pressed", String(state[y][x]));
      }
    }

    if (generationCount) {
      generationCount.textContent = String(generation);
    }

    renderQueued = false;
  });
}

function syncAutoPlayUI() {
  const isActive = autoPlayTimer !== null;

  if (autoPlayIndicator) {
    autoPlayIndicator.classList.toggle("active", isActive);
  }

  if (autoPlayBtn) {
    autoPlayBtn.textContent = isActive ? "Stop Auto-play" : "Start Auto-play";
    autoPlayBtn.classList.toggle("btn-danger", isActive);
    autoPlayBtn.classList.toggle("btn-success", !isActive);
  }
}

function getAutoPlayDelay() {
  return Number(speedSlider?.value || autoPlayDelayDefault);
}

function startAutoPlay() {
  stopAutoPlay();
  autoPlayTimer = window.setInterval(nextGeneration, getAutoPlayDelay());
  syncAutoPlayUI();
}

function stopAutoPlay() {
  if (autoPlayTimer !== null) {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }

  syncAutoPlayUI();
}

function toggleAutoPlay() {
  if (autoPlayTimer === null) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
}

if (speedSlider && speedDisplay) {
  speedDisplay.textContent = `${speedSlider.value}ms`;
  speedSlider.addEventListener("input", function () {
    speedDisplay.textContent = `${this.value}ms`;
    if (autoPlayTimer !== null) {
      startAutoPlay();
    }
  });
}

nextBtn?.addEventListener("click", nextGeneration);
autoPlayBtn?.addEventListener("click", toggleAutoPlay);
randomBtn?.addEventListener("click", randomFill);
clearBtn?.addEventListener("click", clearGrid);

for (const button of patternButtons) {
  button.addEventListener("click", () => {
    stopAutoPlay();
    seedPattern(button.dataset.pattern);
  });
}

document.addEventListener("keydown", function (event) {
  if (event.target && event.target.tagName === "INPUT") return;

  switch (event.key) {
    case " ":
      event.preventDefault();
      nextGeneration();
      break;
    case "c":
    case "C":
      event.preventDefault();
      clearGrid();
      break;
    case "r":
    case "R":
      event.preventDefault();
      randomFill();
      break;
    case "p":
    case "P":
      event.preventDefault();
      toggleAutoPlay();
      break;
  }
});

buildGrid();
seedPattern("glider");
syncAutoPlayUI();
