// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Car Loader
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

/**
 * Load a GLTF/GLB car model from `path`.
 * Falls back to a simple box placeholder if the file is missing,
 * so the rest of the app stays functional during development.
 *
 * @param {string} path — e.g. "/models/2022_nascar_ford_mustang_next_gen.glb"
 * @param {number} [color=0xcc2200]  — fallback box colour
 * @returns {Promise<THREE.Object3D>}
 */
export function loadCar(path, color = 0xcc2200) {
  return new Promise((resolve) => {
    loader.load(
      path,
      (gltf) => {
        console.log(`✓ Loaded: ${path}`);
        resolve(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn(`⚠ Could not load "${path}" — using placeholder.\n`, err);
        resolve(makePlaceholder(color));
      }
    );
  });
}

/** Simple box stand-in when the real GLB is missing */
function makePlaceholder(color) {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(1.9, 0.55, 4.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
  const body    = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.42;
  body.castShadow = true;
  group.add(body);

  // Roof
  const roofGeo = new THREE.BoxGeometry(1.6, 0.38, 2.2);
  const roof    = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.set(0, 0.88, -0.1);
  roof.castShadow = true;
  group.add(roof);

  // Wheels (4×)
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 18);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

  [[-0.95, 0, 1.4], [0.95, 0, 1.4], [-0.95, 0, -1.4], [0.95, 0, -1.4]].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y + 0.3, z);
    w.castShadow = true;
    group.add(w);
  });

  return group;
}