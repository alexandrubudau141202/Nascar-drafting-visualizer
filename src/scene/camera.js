// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Camera + OrbitControls
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Create a perspective camera with OrbitControls.
 *
 * @param {HTMLCanvasElement} domElement — renderer.domElement
 * @returns {{ camera: THREE.PerspectiveCamera, controls: OrbitControls }}
 */
export function createCamera(domElement) {
  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  // Initial position: behind and above the convoy, slightly to the side
  camera.position.set(10, 6, 18);
  camera.lookAt(0, 1, -5);

  // Expose camera globally so the resize handler in setupScene can reach it
  window.__nascar_camera = camera;

  // ── Orbit Controls ─────────────────────────────────────────────────────────
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping    = true;
  controls.dampingFactor    = 0.07;
  controls.screenSpacePanning = false;
  controls.minDistance      = 4;
  controls.maxDistance      = 80;
  controls.maxPolarAngle    = Math.PI * 0.48;   // prevent going below ground
  controls.target.set(0, 1, -5);
  controls.update();

  return { camera, controls };
}