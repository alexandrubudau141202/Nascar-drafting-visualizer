// ─────────────────────────────────────────────────────────────────────────────
// NASCAR Drafting Visualizer — Main Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "three";

// Scene
import { setupScene }            from "./scene/setupScene.js";
import { createCamera }          from "./scene/camera.js";
import { addLighting }           from "./scene/lighting.js";

// Models
import { loadCar }               from "./models/loadCar.js";
import { configureCarModel, updateCarPositions } from "./models/carController.js";

// Visuals
import { createAirflowParticles, updateAirflowParticles } from "./visuals/airflowParticles.js";
import { createAirflowModel,    updateAirflowModel    }   from "./physics/airflowModel.js";
import { createWakeCone,        updateWakeCone         }   from "./visuals/wakeCone.js";

// Physics
import { computeDragState     }  from "./physics/dragModel.js";
import { computeDraftingState }  from "./physics/draftingModel.js";

// UI
import { createDashboard, updateDashboard } from "./ui/dashboard.js";
import { createSliders }                    from "./ui/sliders.js";

// ─────────────────────────────────────────────────────────────────────────────

async function init() {
  // ── Scene, renderer ─────────────────────────────────────────────────────────
  const { scene, renderer } = setupScene();
  const { camera, controls } = createCamera(renderer.domElement);
  addLighting(scene);

  // ── Dashboard ────────────────────────────────────────────────────────────────
  createDashboard();

  // ── Shared mutable state ─────────────────────────────────────────────────────
  // (sliders write here; animate loop reads here)
  let visState = {
    distance:      10,
    showParticles: true,
    showWakeCone:  true,
    showAirflow:   true,
  };

  // ── Sliders / toggles ────────────────────────────────────────────────────────
  const sliderState = createSliders((updated) => {
    visState = { ...visState, ...updated };
  });
  visState = { ...visState, ...sliderState };

  // ── Cars ─────────────────────────────────────────────────────────────────────
  // Lead car — red, Follow car — blue (tint placeholder if GLBs are missing)
  const [leadCar, followCar] = await Promise.all([
    loadCar("/models/2022_nascar_ford_mustang_next_gen.glb", 0xcc1100),
    loadCar("/models/2025_nascar_camaro.glb",                0x0044cc),
  ]);

  configureCarModel(leadCar);
  configureCarModel(followCar);

  scene.add(leadCar);
  scene.add(followCar);

  // ── Visuals ───────────────────────────────────────────────────────────────────
  const particles   = createAirflowParticles();
  const arrowField  = createAirflowModel();
  const wakeCone    = createWakeCone();

  scene.add(particles);
  scene.add(arrowField);
  scene.add(wakeCone);

  // ── Clock for delta time ──────────────────────────────────────────────────────
  const clock = new THREE.Clock();

  // ── Animate ───────────────────────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);

    const delta    = clock.getDelta();
    const distance = visState.distance;

    // Car positions
    updateCarPositions(leadCar, followCar, distance);
    const leadPos = leadCar.position;

    // Visuals
    updateAirflowParticles(particles,  leadPos, followCar, distance, delta, visState.showParticles, visState.particleSpeed);
    updateAirflowModel    (arrowField, leadPos, distance,        visState.showAirflow);
    updateWakeCone        (wakeCone,   leadPos, distance);
    if (!visState.showWakeCone) wakeCone.visible = false;

    // Physics → Dashboard
    const draftState = computeDraftingState(distance);
    const dragState  = computeDragState(distance);
    updateDashboard(draftState, dragState, distance);

    // Orbit controls damping
    controls.update();

    renderer.render(scene, camera);
  }

  animate();
}

init().catch(console.error);