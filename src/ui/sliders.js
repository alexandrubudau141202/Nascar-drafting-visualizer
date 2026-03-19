// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Slider & Toggle Controls
// ─────────────────────────────────────────────────────────────────────────────

export function createSliders(onUpdate) {

    // Plain object — no getters, no setters, no proxies
    const state = {
      distance:      10,
      particleSpeed: 1.0,
      showParticles: true,
      showWakeCone:  true,
      showAirflow:   true,
    };
  
    // ── Distance slider ──────────────────────────────────────────────────────
    const slider = document.getElementById("distanceSlider");
    const label  = document.getElementById("distanceValue");
  
    if (slider) {
      slider.value = state.distance;
      if (label) label.textContent = state.distance.toFixed(1) + " m";
  
      slider.addEventListener("input", () => {
        state.distance = parseFloat(slider.value);
        if (label) label.textContent = state.distance.toFixed(1) + " m";
        onUpdate(state);
      });
    }
  
    // ── Particle speed slider ────────────────────────────────────────────────
    const speedSlider = document.getElementById("particleSpeedSlider");
    const speedLabel  = document.getElementById("particleSpeedValue");
  
    if (speedSlider) {
      speedSlider.value = state.particleSpeed;
      if (speedLabel) speedLabel.textContent = state.particleSpeed.toFixed(1) + "×";
  
      speedSlider.addEventListener("input", () => {
        state.particleSpeed = parseFloat(speedSlider.value);
        if (speedLabel) speedLabel.textContent = state.particleSpeed.toFixed(1) + "×";
        onUpdate(state);
      });
    }
  
    // ── Toggle buttons ───────────────────────────────────────────────────────
    bindToggle("toggleParticles", "showParticles", state, onUpdate);
    bindToggle("toggleWakeCone",  "showWakeCone",  state, onUpdate);
    bindToggle("toggleAirflow",   "showAirflow",   state, onUpdate);
  
    return state;
  }
  
  function bindToggle(id, key, state, onUpdate) {
    const btn = document.getElementById(id);
    if (!btn) return;
  
    setToggleStyle(btn, state[key]);
  
    btn.addEventListener("click", () => {
      state[key] = !state[key];
      setToggleStyle(btn, state[key]);
      onUpdate(state);
    });
  }
  
  function setToggleStyle(btn, active) {
    if (active) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }