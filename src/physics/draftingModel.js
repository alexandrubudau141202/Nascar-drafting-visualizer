// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Drafting Physics Model
// ─────────────────────────────────────────────────────────────────────────────

import {
    speedAdvantage,
    turbulenceIntensity,
    pressureCoefficient,
  } from "../utils/math.js";
  
  /**
   * Gap distance zone thresholds (meters)
   */
  const ZONES = [
    { maxDist: 3,   label: "DANGEROUS" },
    { maxDist: 7,   label: "OPTIMAL"   },
    { maxDist: 12,  label: "GOOD"      },
    { maxDist: 17,  label: "MARGINAL"  },
    { maxDist: Infinity, label: "CLEAR AIR" },
  ];
  
  /**
   * Compute the full drafting state for the follow car at a given gap.
   *
   * @param {number} distanceMeters
   * @returns {{
   *   speedGain:    string,   // km/h, 1 decimal
   *   turbulence:   string,   // %, integer
   *   pressureCp:   string,   // 3 decimals
   *   draftQuality: number,   // 0–100 composite score
   *   zone:         string,   // human-readable zone label
   * }}
   */
  export function computeDraftingState(distanceMeters) {
    const speedGain    = speedAdvantage(distanceMeters);
    const turbulence   = turbulenceIntensity(distanceMeters);
    const pressureCp   = pressureCoefficient(distanceMeters);
  
    // Composite quality score:
    //   60 % weight → speed gain (max ≈ 15 km/h)
    //   40 % weight → low turbulence (stability)
    const draftQuality = Math.round(
      Math.min(100, (speedGain / 15) * 60 + (1 - turbulence) * 40)
    );
  
    const zone = ZONES.find((z) => distanceMeters < z.maxDist)?.label ?? "CLEAR AIR";
  
    return {
      speedGain:    speedGain.toFixed(1),
      turbulence:   (turbulence * 100).toFixed(0),
      pressureCp:   pressureCp.toFixed(3),
      draftQuality,
      zone,
    };
  }