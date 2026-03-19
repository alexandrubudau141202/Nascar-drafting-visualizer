// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Telemetry Dashboard (values only)
// HTML structure lives in index.html — this file just updates values each frame
// ─────────────────────────────────────────────────────────────────────────────

const ZONE_COLORS = {
    "DANGEROUS":  "#ff2244",
    "OPTIMAL":    "#00ff88",
    "GOOD":       "#44ddff",
    "MARGINAL":   "#ffaa00",
    "CLEAR AIR":  "#556677",
  };
  
  // createDashboard is now a no-op — HTML is static in index.html
  export function createDashboard() {}
  
  export function updateDashboard(draftState, dragState, distanceMeters) {
    const { zone, speedGain, turbulence, pressureCp, draftQuality } = draftState;
    const { dragReductionPercent } = dragState;
  
    // Zone
    const zoneEl = document.getElementById("dash-zone");
    if (zoneEl) {
      zoneEl.textContent  = zone;
      const c = ZONE_COLORS[zone] ?? "#ffffff";
      zoneEl.style.color      = c;
      zoneEl.style.textShadow = `0 0 20px ${c}`;
    }
  
    setValue("dash-drag",  dragReductionPercent.toFixed(1));
    setValue("dash-speed", speedGain);
    setValue("dash-turb",  turbulence);
    setValue("dash-cp",    pressureCp);
    setValue("dash-gap",   distanceMeters.toFixed(1));
    setValue("dash-quality-score", draftQuality);
  
    // Quality bar fill + colour
    const bar = document.getElementById("dash-quality-bar");
    if (bar) {
      bar.style.width = draftQuality + "%";
      const hue = Math.round(draftQuality * 1.2); // 0=red → 120=green
      bar.style.background = `hsl(${hue}, 90%, 52%)`;
      bar.style.boxShadow  = `0 0 10px hsl(${hue}, 90%, 52%)`;
    }
  }
  
  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }