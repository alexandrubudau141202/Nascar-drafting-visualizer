// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Airflow Arrow Field Model
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";
import { wakeConeAngle, draftingReductionFactor } from "../utils/math.js";

const ROW_COUNT    = 5;
const COL_COUNT    = 8;
const ARROW_COUNT  = ROW_COUNT * COL_COUNT;

/**
 * Create a grid of ArrowHelpers that show the airflow vector field.
 *
 * @returns {THREE.Group}
 */
export function createAirflowModel() {
  const group = new THREE.Group();
  group.name = "airflowModel";

  const arrows = [];

  for (let i = 0; i < ARROW_COUNT; i++) {
    const dir    = new THREE.Vector3(0, 0, -1);
    const origin = new THREE.Vector3();
    const arrow  = new THREE.ArrowHelper(dir, origin, 1, 0x00aaff, 0.25, 0.12);
    arrow.userData.idx = i;
    arrows.push(arrow);
    group.add(arrow);
  }

  group.userData.arrows = arrows;
  return group;
}

/**
 * Reposition and recolour the arrow grid every frame.
 *
 * @param {THREE.Group}   group
 * @param {THREE.Vector3} leadPos
 * @param {number}        distanceMeters
 * @param {boolean}       visible
 */
export function updateAirflowModel(group, leadPos, distanceMeters, visible = true) {
  group.visible = visible;
  if (!visible) return;

  const arrows     = group.userData.arrows;
  const intensity  = draftingReductionFactor(distanceMeters);
  const coneAngle  = wakeConeAngle(distanceMeters);
  const maxReach   = Math.max(distanceMeters + 2, 10);

  if (intensity < 0.01) { group.visible = false; return; }

  arrows.forEach((arrow, idx) => {
    const col = idx % COL_COUNT;
    const row = Math.floor(idx / COL_COUNT);

    // Normalised grid coords [0, 1]
    const u = col / (COL_COUNT - 1);  // depth axis
    const v = (row / (ROW_COUNT - 1)) - 0.5;  // lateral axis

    const depth   = 1.5 + u * maxReach;
    const halfSpan = depth * Math.tan(coneAngle) * 1.8;
    const lateralX = v * halfSpan;
    const vertY    = 0.5 - u * 0.15;  // slight downward tendency

    arrow.position.set(
      leadPos.x + lateralX,
      leadPos.y + vertY,
      leadPos.z - depth
    );

    // Flow direction: outward spread + backward
    const dir = new THREE.Vector3(lateralX * 0.08, -0.05, -1).normalize();
    arrow.setDirection(dir);

    // Length fades with depth
    const localIntensity = intensity * Math.max(0, 1 - u * 0.75);
    const length = Math.max(0.25, localIntensity * 1.8);
    arrow.setLength(length, length * 0.3, length * 0.12);

    // Colour: bright cyan near car → dim blue-grey far away
    const hue  = 0.57 - u * 0.08;
    const sat  = 0.85;
    const lit  = 0.25 + localIntensity * 0.45;
    arrow.line.material.color.setHSL(hue, sat, lit);
    arrow.cone.material.color.setHSL(hue, sat, lit);
  });
}