// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Airflow Particle System
// Aerodynamic deflection: particles split at the follow car's nose and flow
// over the roof, around the flanks, and rejoin as turbulent wake behind.
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";
import { draftingReductionFactor, wakeConeAngle } from "../utils/math.js";

const PARTICLE_COUNT = 2400;
const MAX_LIFETIME   = 5.5;

// Car half-extents (metres, matched to auto-scaled 5.4 m model)
const CHL  = 2.7;   // half-length
const CHW  = 1.0;   // half-width
const CH   = 1.45;  // full height
const ROOF = 1.1;   // height above ground where "roof zone" starts

// Deflection states
const STATE_FLY        = 0;  // free flight from lead car
const STATE_ROOF       = 1;  // flowing over roof
const STATE_SIDE       = 2;  // wrapping around flank
const STATE_STAGNATE   = 3;  // stagnation point — bleeds white and dies
const STATE_WAKE       = 4;  // rejoined turbulent wake behind follow car

export function createAirflowParticles() {
  const positions   = new Float32Array(PARTICLE_COUNT * 3);
  const colors      = new Float32Array(PARTICLE_COUNT * 3);
  const velocities  = [];
  const ages        = [];
  const states      = new Uint8Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    ages.push(MAX_LIFETIME + Math.random() * MAX_LIFETIME);
    velocities.push(new THREE.Vector3());
    states[i] = STATE_FLY;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.name = "airflowParticles";
  points.frustumCulled = false;
  points.userData = { positions, colors, velocities, ages, states };
  return points;
}

// ─── Spawn ────────────────────────────────────────────────────────────────────

function respawn(i, positions, colors, velocities, ages, states, leadPos, coneAngle, intensity) {
  positions[i * 3]     = leadPos.x + (Math.random() - 0.5) * 1.4;
  positions[i * 3 + 1] = leadPos.y + Math.random() * 0.75;
  positions[i * 3 + 2] = leadPos.z - 2.5 - Math.random() * 0.3;

  const spread = Math.tan(coneAngle) * 0.8;
  velocities[i].set(
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * 0.15,
    -(5.5 + Math.random() * 3.0) * Math.max(0.4, intensity)
  );

  colors[i * 3]     = 0.3;
  colors[i * 3 + 1] = 0.85;
  colors[i * 3 + 2] = 1.0;

  ages[i]   = 0;
  states[i] = STATE_FLY;
}

// ─── Deflection trigger ───────────────────────────────────────────────────────
// Called once when a flying particle first touches the follow car's front face.

function deflect(i, positions, velocities, states, fx, fy, fSpeed) {
  const px = positions[i * 3];
  const py = positions[i * 3 + 1];

  // Normalised offsets from car centreline/mid-height
  const normX = (px - fx) / CHW;          // -1 (left flank) → +1 (right flank)
  const normY = (py - (fy + CH * 0.5)) / (CH * 0.5); // -1 (floor) → +1 (roof)

  const isCenter = Math.abs(normX) < 0.35;
  const isTop    = normY > 0.3;

  if (isCenter && isTop) {
    // ── Roof zone — redirect up and over ─────────────────────────────────
    states[i] = STATE_ROOF;
    velocities[i].set(
      velocities[i].x * 0.3,
      fSpeed * 0.55 + Math.random() * 0.4,   // strong upward component
      -fSpeed * 0.65
    );
  } else if (!isCenter) {
    // ── Side zone — wrap around flank ────────────────────────────────────
    states[i] = STATE_SIDE;
    const sideDir = Math.sign(normX);
    velocities[i].set(
      sideDir * (fSpeed * 0.5 + Math.random() * 0.3),
      velocities[i].y * 0.2,
      -fSpeed * 0.6
    );
  } else {
    // ── Stagnation point (center, low) — dies as a white puff ────────────
    states[i] = STATE_STAGNATE;
    velocities[i].set(
      (Math.random() - 0.5) * 0.8,
      Math.random() * 0.6,
      (Math.random() - 0.5) * 0.4
    );
  }
}

// ─── Main update ─────────────────────────────────────────────────────────────

export function updateAirflowParticles(
  particles, leadPos, followCar,
  distanceMeters, delta, visible = true, speedMultiplier = 1.0
) {
  particles.visible = visible;
  if (!visible) return;

  const { positions, colors, velocities, ages, states } = particles.userData;
  const intensity   = draftingReductionFactor(distanceMeters);
  const coneAngle   = wakeConeAngle(distanceMeters);
  const sd          = delta * speedMultiplier;   // scaled delta
  const fSpeed      = 4.5 * Math.max(0.4, intensity);

  // Follow car world bounds
  const fx  = followCar ? followCar.position.x : 0;
  const fy  = followCar ? followCar.position.y : 0;
  const fz  = followCar ? followCar.position.z : -Infinity;
  const fFront = fz + CHL;   // nose (most-positive Z)
  const fRear  = fz - CHL;   // tail

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const px = positions[i * 3];
    const py = positions[i * 3 + 1];
    const pz = positions[i * 3 + 2];

    // ── 1. Free flight → check nose collision ────────────────────────────
    if (states[i] === STATE_FLY) {
      ages[i] += sd;
      if (ages[i] >= MAX_LIFETIME) {
        respawn(i, positions, colors, velocities, ages, states, leadPos, coneAngle, intensity);
        continue;
      }

      const t = ages[i] / MAX_LIFETIME;

      // Integrate
      positions[i * 3]     += velocities[i].x * sd + (Math.random() - 0.5) * 0.012 * intensity;
      positions[i * 3 + 1] += velocities[i].y * sd - 0.25 * sd * t;
      positions[i * 3 + 2] += velocities[i].z * sd;
      velocities[i].z      *= 1 - 0.10 * sd;

      // Colour: cyan → blue
      colors[i * 3]     = Math.max(0, 0.3  - t * 0.25);
      colors[i * 3 + 1] = Math.max(0, 0.85 - t * 0.70);
      colors[i * 3 + 2] = Math.max(0, 1.0  - t * 0.30);

      // Nose hit: thin slab at front face, within car width/height
      const atFront  = pz >= fFront - 0.30 && pz <= fFront + 0.05;
      const inWidth  = Math.abs(px - fx) < CHW + 0.15;
      const inHeight = py >= fy && py <= fy + CH;
      if (atFront && inWidth && inHeight) {
        deflect(i, positions, velocities, states, fx, fy, fSpeed);
      }
      continue;
    }

    // ── 2. Roof flow ─────────────────────────────────────────────────────
    if (states[i] === STATE_ROOF) {
      ages[i] += sd * 1.1;
      if (ages[i] >= MAX_LIFETIME) {
        respawn(i, positions, colors, velocities, ages, states, leadPos, coneAngle, intensity);
        continue;
      }

      positions[i * 3]     += velocities[i].x * sd;
      positions[i * 3 + 1] += velocities[i].y * sd;
      positions[i * 3 + 2] += velocities[i].z * sd;

      // Gravity pulls it back down as it passes the roof peak
      velocities[i].y -= 1.8 * sd;
      velocities[i].z *= 1 - 0.08 * sd;

      // Once past the tail, transition to wake turbulence
      if (pz < fRear - 0.3) {
        states[i] = STATE_WAKE;
      }

      // Colour: cyan-white over roof → orange-hot as it rejoins turbulence
      const t = ages[i] / MAX_LIFETIME;
      colors[i * 3]     = Math.min(1, 0.4 + t * 0.8);
      colors[i * 3 + 1] = Math.max(0, 0.9 - t * 0.55);
      colors[i * 3 + 2] = Math.max(0, 1.0 - t * 0.7);
      continue;
    }

    // ── 3. Side wrap ─────────────────────────────────────────────────────
    if (states[i] === STATE_SIDE) {
      ages[i] += sd * 1.1;
      if (ages[i] >= MAX_LIFETIME) {
        respawn(i, positions, colors, velocities, ages, states, leadPos, coneAngle, intensity);
        continue;
      }

      positions[i * 3]     += velocities[i].x * sd;
      positions[i * 3 + 1] += velocities[i].y * sd - 0.15 * sd;
      positions[i * 3 + 2] += velocities[i].z * sd;

      // Lateral spread decays; rearward momentum persists
      velocities[i].x *= 1 - 0.15 * sd;
      velocities[i].z *= 1 - 0.08 * sd;

      if (pz < fRear - 0.3) states[i] = STATE_WAKE;

      const t = ages[i] / MAX_LIFETIME;
      colors[i * 3]     = Math.min(1, 0.3 + t * 0.9);
      colors[i * 3 + 1] = Math.max(0, 0.8 - t * 0.6);
      colors[i * 3 + 2] = Math.max(0, 0.9 - t * 0.6);
      continue;
    }

    // ── 4. Wake turbulence (re-joined behind car) ─────────────────────────
    if (states[i] === STATE_WAKE) {
      ages[i] += sd * 0.9;
      if (ages[i] >= MAX_LIFETIME) {
        respawn(i, positions, colors, velocities, ages, states, leadPos, coneAngle, intensity);
        continue;
      }

      // Chaotic tumble behind car
      positions[i * 3]     += velocities[i].x * sd + (Math.random() - 0.5) * 0.06;
      positions[i * 3 + 1] += velocities[i].y * sd + (Math.random() - 0.5) * 0.04;
      positions[i * 3 + 2] += velocities[i].z * sd;
      velocities[i].multiplyScalar(1 - 0.18 * sd);

      const t = ages[i] / MAX_LIFETIME;
      // Hot orange / red fading to dark
      colors[i * 3]     = Math.max(0, 1.0 - t * 0.6);
      colors[i * 3 + 1] = Math.max(0, 0.4 - t * 0.4);
      colors[i * 3 + 2] = Math.max(0, 0.1 - t * 0.1);
      continue;
    }

    // ── 5. Stagnation — white smoke puff, dies quickly ────────────────────
    if (states[i] === STATE_STAGNATE) {
      ages[i] += sd * 3.5;
      if (ages[i] >= MAX_LIFETIME) {
        respawn(i, positions, colors, velocities, ages, states, leadPos, coneAngle, intensity);
        continue;
      }

      positions[i * 3]     += velocities[i].x * sd;
      positions[i * 3 + 1] += velocities[i].y * sd;
      positions[i * 3 + 2] += velocities[i].z * sd;
      velocities[i].multiplyScalar(1 - 0.25 * sd);

      const t = Math.min(1, ages[i] / MAX_LIFETIME);
      colors[i * 3]     = 0.3 + t * 0.7;
      colors[i * 3 + 1] = 0.85 + t * 0.15;
      colors[i * 3 + 2] = 1.0;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.color.needsUpdate    = true;
  particles.material.opacity = 0.3 + intensity * 0.55;
}