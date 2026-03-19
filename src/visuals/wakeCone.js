// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Wake Turbulence Cone
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";
import { wakeConeAngle, turbulenceIntensity } from "../utils/math.js";

const CONE_BASE_LENGTH = 18; // max visual length in scene units

/**
 * Build the wake cone group.
 * Consists of:
 *  • A translucent solid frustum (orange glow)
 *  • A wireframe overlay for a technical/engineering look
 *  • A soft inner glow cone (tighter, brighter)
 *
 * @returns {THREE.Group}
 */
export function createWakeCone() {
  const group = new THREE.Group();
  group.name = "wakeConeGroup";

  // ── Outer frustum ──────────────────────────────────────────────────────────
  const outerGeo = new THREE.CylinderGeometry(0.05, 3.0, CONE_BASE_LENGTH, 48, 10, true);

  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xff4400,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  outer.name = "outerCone";
  group.add(outer);

  // ── Wireframe overlay ──────────────────────────────────────────────────────
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.18,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const wire = new THREE.Mesh(outerGeo.clone(), wireMat);
  wire.name = "wireCone";
  group.add(wire);

  // ── Inner glow (tighter cone — core of the wake) ──────────────────────────
  const innerGeo = new THREE.CylinderGeometry(0.02, 1.0, CONE_BASE_LENGTH * 0.6, 32, 6, true);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.10,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.name = "innerCone";
  group.add(inner);

  // All cylinders open tip-upward by default; rotate so tip faces the car
  // and cone extends toward -Z (behind lead car)
  group.rotation.x = Math.PI / 2;

  return group;
}

/**
 * Update wake cone position, scale, and opacity each frame.
 *
 * @param {THREE.Group} coneGroup
 * @param {THREE.Vector3} leadPos   — world position of the lead car
 * @param {number} distanceMeters   — current gap
 */
export function updateWakeCone(coneGroup, leadPos, distanceMeters) {
  const turbulence = turbulenceIntensity(distanceMeters);
  const angle      = wakeConeAngle(distanceMeters);

  // Effective length scales with the gap — at least 6 m, at most CONE_BASE_LENGTH
  const length    = Math.max(6, Math.min(distanceMeters * 1.6, CONE_BASE_LENGTH));
  const endRadius = length * Math.tan(angle);

  // Position: the tip sits just behind the lead car's rear bumper
  // Cone group is rotated 90° around X, so Y-axis in local space → -Z in world
  coneGroup.position.set(
    leadPos.x,
    leadPos.y + 0.5,
    leadPos.z - length / 2 - 0.8  // 0.8 offset for car body length
  );

  // Scale outer cone to match computed geometry
  const scaleR = endRadius / 3.0;  // normalise against base radius of 3
  const scaleL = length / CONE_BASE_LENGTH;

  const outer = coneGroup.getObjectByName("outerCone");
  const wire  = coneGroup.getObjectByName("wireCone");
  const inner = coneGroup.getObjectByName("innerCone");

  if (outer) {
    outer.scale.set(scaleR, scaleL, scaleR);
    outer.material.opacity = 0.03 + turbulence * 0.09;
  }
  if (wire) {
    wire.scale.set(scaleR, scaleL, scaleR);
    wire.material.opacity = 0.06 + turbulence * 0.20;
  }
  if (inner) {
    inner.scale.set(scaleR * 0.5, scaleL * 0.7, scaleR * 0.5);
    inner.material.opacity = 0.05 + turbulence * 0.15;
  }

  coneGroup.visible = turbulence > 0.01;
}