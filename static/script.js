const speedSlider = document.getElementById("speed-slider");
const speedDisplay = document.getElementById("speed-display");

function syncAutoPlayUI() {
  const indicator = document.getElementById("auto-play-indicator");
  const autoPlayBtn = document.getElementById("auto-play-btn");
  const autoPlayDiv = document.querySelector(
    '#auto-play-container [hx-trigger*="every"]',
  );

  const isActive = !!autoPlayDiv;

  if (indicator) indicator.classList.toggle("active", isActive);

  if (autoPlayBtn) {
    autoPlayBtn.textContent = isActive ? "Stop Auto-play" : "Start Auto-play";
    autoPlayBtn.classList.toggle("btn-danger", isActive);
    autoPlayBtn.classList.toggle("btn-success", !isActive);
  }
}

function syncAutoPlaySpeed() {
  const autoPlayDiv = document.querySelector(
    '#auto-play-container [hx-trigger*="every"]',
  );
  if (autoPlayDiv && speedSlider) {
    autoPlayDiv.setAttribute("hx-trigger", `every ${speedSlider.value}ms`);
    // Ensure HTMX re-reads the updated trigger
    htmx.process(autoPlayDiv);
  }
}

// Speed slider
if (speedSlider && speedDisplay) {
  speedSlider.addEventListener("input", function () {
    speedDisplay.textContent = `${this.value}ms`;
    syncAutoPlaySpeed();
  });
}

// Single afterSwap handler (avoid duplicate listeners)
document.body.addEventListener("htmx:afterSwap", function (event) {
  const target = event.detail.target;

  // Update generation counter when the grid updates
  if (target && target.id === "grid") {
    const gen = event.detail.xhr.getResponseHeader("X-Generation");
    if (gen) {
      const el = document.getElementById("generation-count");
      if (el) el.textContent = gen;
    }
  }

  // Auto-play container swapped (start/stop or OOB stop)
  if (target && target.id === "auto-play-container") {
    syncAutoPlayUI();
    syncAutoPlaySpeed();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
  if (event.target && event.target.tagName === "INPUT") return;

  switch (event.key) {
    case " ":
      event.preventDefault();
      htmx.ajax("GET", "/next", { target: "#grid", swap: "morphdom" });
      break;
    case "c":
    case "C":
      event.preventDefault();
      htmx.ajax("GET", "/clear", { target: "#grid", swap: "morphdom" });
      break;
    case "r":
    case "R":
      event.preventDefault();
      htmx.ajax("GET", "/random", { target: "#grid", swap: "morphdom" });
      break;
    case "p":
    case "P":
      event.preventDefault();
      htmx.ajax("GET", "/toggle-auto-play", {
        target: "#auto-play-container",
        swap: "outerHTML",
      });
      break;
  }
});

// Error handling
document.body.addEventListener("htmx:responseError", function (event) {
  console.error("HTMX Request failed:", event.detail);
  alert("Something went wrong. Please try again.");
});

// Init
document.addEventListener("DOMContentLoaded", function () {
  if (speedSlider && speedDisplay)
    speedDisplay.textContent = `${speedSlider.value}ms`;
  syncAutoPlayUI();

  console.log("Conway's Game of Life loaded successfully!");
  console.log("Keyboard shortcuts:");
  console.log("  Spacebar: Next generation");
  console.log("  C: Clear grid");
  console.log("  R: Random fill");
  console.log("  P: Toggle auto-play");
});
