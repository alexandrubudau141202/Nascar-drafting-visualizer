// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Scene Setup
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";

/**
 * Create scene, renderer, ground plane, and grid.
 * Attaches a window resize handler.
 *
 * @returns {{ scene: THREE.Scene, renderer: THREE.WebGLRenderer }}
 */
export function setupScene() {
  // ── Scene ──────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080c10);
  scene.fog = new THREE.FogExp2(0x080c10, 0.018);

  // ── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  document.body.appendChild(renderer.domElement);

  // ── Ground / track surface ─────────────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(60, 200, 1, 1);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a22,
    roughness: 0.92,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  // Track markings — dashed centre line
  const lineGeo = new THREE.PlaneGeometry(0.15, 200);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
  const centreLine = new THREE.Mesh(lineGeo, lineMat);
  centreLine.rotation.x = -Math.PI / 2;
  centreLine.position.y = 0.001;
  scene.add(centreLine);

  // ── Subtle grid helper ─────────────────────────────────────────────────────
  const grid = new THREE.GridHelper(120, 40, 0x223344, 0x111822);
  grid.position.y = 0;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  // ── Resize handler ─────────────────────────────────────────────────────────
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Camera is updated in main.js via the stored camera reference
    if (window.__nascar_camera) {
      window.__nascar_camera.aspect = window.innerWidth / window.innerHeight;
      window.__nascar_camera.updateProjectionMatrix();
    }
  });

  return { scene, renderer };
}