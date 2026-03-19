// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Lighting Setup
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";

/**
 * Add a full lighting rig to the scene:
 *  • Sun light (key) with shadows
 *  • Fill light (opposite side, soft)
 *  • Rim light (behind cars, cool blue — separates cars from dark background)
 *  • Ambient (soft global fill)
 *
 * @param {THREE.Scene} scene
 */
export function addLighting(scene) {
  // ── Key / sun light ────────────────────────────────────────────────────────
  const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);
  sun.position.set(15, 20, 10);
  sun.castShadow              = true;
  sun.shadow.mapSize.width    = 2048;
  sun.shadow.mapSize.height   = 2048;
  sun.shadow.camera.near      = 0.5;
  sun.shadow.camera.far       = 80;
  sun.shadow.camera.left      = -20;
  sun.shadow.camera.right     = 20;
  sun.shadow.camera.top       = 20;
  sun.shadow.camera.bottom    = -20;
  sun.shadow.bias             = -0.0003;
  scene.add(sun);

  // ── Fill light ────────────────────────────────────────────────────────────
  const fill = new THREE.DirectionalLight(0xc8d8ff, 0.6);
  fill.position.set(-12, 8, -5);
  scene.add(fill);

  // ── Rim / back light — cool blue, makes cars pop against dark BG ──────────
  const rim = new THREE.DirectionalLight(0x4488ff, 0.9);
  rim.position.set(0, 6, -25);
  scene.add(rim);

  // ── Ambient ───────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x101820, 2.0);
  scene.add(ambient);

  // ── Subtle ground bounce (hemisphere) ─────────────────────────────────────
  const hemi = new THREE.HemisphereLight(0x223344, 0x111118, 0.8);
  scene.add(hemi);
}