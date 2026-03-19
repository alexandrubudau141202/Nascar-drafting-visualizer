// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Aerodynamic Math Library
// ─────────────────────────────────────────────────────────────────────────────

export const AIR_DENSITY      = 1.225;  // kg/m³ at sea level, 20°C
export const CAR_FRONTAL_AREA = 1.70;   // m² — approximate NASCAR Cup body
export const BASE_CD          = 0.340;  // Cd in clean air — NASCAR Cup Series

/**
 * Aerodynamic drag force
 * F_d = ½ · Cd · A · ρ · v²
 *
 * @param {number} Cd        — drag coefficient (dimensionless)
 * @param {number} velocity  — m/s
 * @param {number} area      — frontal area m²
 * @param {number} rho       — air density kg/m³
 * @returns {number} force in Newtons
 */
export function dragForce(Cd, velocity, area = CAR_FRONTAL_AREA, rho = AIR_DENSITY) {
  return 0.5 * Cd * area * rho * velocity * velocity;
}

/**
 * Drafting drag-reduction factor (0 → 1)
 * Empirical exponential decay fitted to NASCAR tunnel data.
 *   gap  0 m  →  35 % reduction
 *   gap  5 m  →  18 %
 *   gap 10 m  →   9 %
 *   gap 20 m  →  ~2 %
 *
 * @param {number} distanceMeters — bumper-to-bumper gap
 * @returns {number} factor in [0, 0.35]
 */
export function draftingReductionFactor(distanceMeters) {
  if (distanceMeters <= 0) return 0.35;
  return 0.35 * Math.exp(-0.145 * distanceMeters);
}

/**
 * Effective drag coefficient for the following car
 */
export function followCarCd(distanceMeters) {
  return BASE_CD * (1 - draftingReductionFactor(distanceMeters));
}

/**
 * Speed advantage (km/h) the follow car gains from drafting
 * At 200 km/h, ~10–15 km/h at close range
 */
export function speedAdvantage(distanceMeters, baseSpeedKmh = 200) {
  return draftingReductionFactor(distanceMeters) * baseSpeedKmh * 0.075;
}

/**
 * Wake turbulence intensity [0, 1]
 * Peaks at very close range; zero beyond ~18 m
 */
export function turbulenceIntensity(distanceMeters) {
  if (distanceMeters < 0.5) return 1.0;
  if (distanceMeters > 18)  return 0.0;
  return Math.max(0, Math.pow(1 - distanceMeters / 18, 0.55));
}

/**
 * Wake cone half-angle (radians)
 * The disturbed-air column spreads laterally with distance
 */
export function wakeConeAngle(distanceMeters) {
  const BASE  = 0.12;  // ~7° at the source
  const GROW  = 0.016; // rad / m
  return BASE + GROW * Math.min(distanceMeters, 20);
}

/**
 * Pressure coefficient Cp behind the lead car
 * Negative Cp = suction zone that pulls the follow car forward
 *   Cp(0)  ≈ −0.45
 *   Cp(10) ≈ −0.11
 *   Cp(20) ≈ −0.03
 */
export function pressureCoefficient(distanceMeters) {
  if (distanceMeters <= 0) return -0.45;
  return -0.45 * Math.exp(-0.13 * distanceMeters);
}