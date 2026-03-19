// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Drag Physics Model
// ─────────────────────────────────────────────────────────────────────────────

import {
    dragForce,
    followCarCd,
    draftingReductionFactor,
    BASE_CD,
    CAR_FRONTAL_AREA,
    AIR_DENSITY,
  } from "../utils/math.js";
  
  const RACE_SPEED_MS = 88.5; // ≈ 200 mph → m/s
  
  /**
   * Compute the complete drag state for the following car at a given gap.
   *
   * @param {number} distanceMeters — bumper-to-bumper gap
   * @returns {{
   *   reductionFactor:      number,  // [0, 0.35]
   *   effectiveCd:          number,
   *   baselineDrag:         number,  // N — no draft
   *   actualDrag:           number,  // N — with draft
   *   dragSaving:           number,  // N saved
   *   dragReductionPercent: number,
   * }}
   */
  export function computeDragState(distanceMeters) {
    const reductionFactor      = draftingReductionFactor(distanceMeters);
    const effectiveCd          = followCarCd(distanceMeters);
    const baselineDrag         = dragForce(BASE_CD, RACE_SPEED_MS);
    const actualDrag           = dragForce(effectiveCd, RACE_SPEED_MS);
    const dragSaving           = baselineDrag - actualDrag;
    const dragReductionPercent = reductionFactor * 100;
  
    return {
      reductionFactor,
      effectiveCd,
      baselineDrag,
      actualDrag,
      dragSaving,
      dragReductionPercent,
    };
  }