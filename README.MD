# NASCAR Drafting Visualizer

A real-time 3D aerodynamics simulator that visualises the physics of NASCAR drafting — the effect where a following car reduces drag by sitting inside the lead car's wake. Built with Three.js and Vite.

![NASCAR Drafting Visualizer](public/textures/preview.png)

---

## What It Does

Place two NASCAR Cup Series cars at a variable bumper gap and watch the aerodynamics come alive:

- **Airflow particles** spawn at the lead car's rear, stream toward the follow car, then split — riding over the roof, wrapping around the flanks, and rejoining as turbulent wake behind
- **Wake cone** visualises the disturbed air column trailing the lead car, scaling in size and intensity with distance
- **Arrow field** shows the 3D airflow vector grid between the cars
- **Live telemetry dashboard** reports drag reduction %, speed gain, turbulence intensity, pressure coefficient Cp, and a composite draft quality score — all derived from real aerodynamic formulas

---

## Getting Started

### Prerequisites

- Node.js 18+
- Two NASCAR GLB models placed in `public/models/`:
  - `2022_nascar_ford_mustang_next_gen.glb`
  - `2025_nascar_camaro.glb`

> **No models?** No problem. The app falls back to accurate box placeholders automatically so you can run it without any assets.

### Install & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
npm run preview
```

---

## Controls

| Control | Action |
|---|---|
| **Drag** | Orbit camera |
| **Scroll** | Zoom in / out |
| **Bumper Gap slider** | Set distance between cars (1–20 m) |
| **Particle Speed slider** | Speed up or slow down the particle simulation (0.1×–4×) |
| **PARTICLES toggle** | Show / hide airflow particles |
| **WAKE CONE toggle** | Show / hide the turbulence cone |
| **AIRFLOW toggle** | Show / hide the arrow vector field |

---

## Project Structure

```
├── index.html                  # UI layout — dashboard, controls, NASCAR logo
├── style.css                   # Full UI styles (broadcast HUD × retro NASCAR)
├── public/
│   ├── models/                 # GLB car models (not included)
│   └── textures/               # Optional textures
└── src/
    ├── main.js                 # Entry point — wires all systems together
    ├── utils/
    │   └── math.js             # Aerodynamic formulas (drag, Cp, turbulence…)
    ├── physics/
    │   ├── dragModel.js        # Drag force & reduction computation
    │   └── draftingModel.js    # Speed gain, zones, draft quality score
    ├── scene/
    │   ├── setupScene.js       # Renderer, ground plane, grid, fog, resize
    │   ├── camera.js           # PerspectiveCamera + OrbitControls
    │   └── lighting.js         # 5-light rig (sun, fill, rim, ambient, hemi)
    ├── models/
    │   ├── loadCar.js          # GLTFLoader with box placeholder fallback
    │   └── carController.js    # Auto-scale to real-world size, ground placement
    ├── visuals/
    │   ├── airflowParticles.js # 2400-particle system with 5-state deflection
    │   ├── airflowModel.js     # 5×8 ArrowHelper vector field
    │   └── wakeCone.js         # 3-layer turbulence cone (solid + wire + glow)
    └── ui/
        ├── dashboard.js        # Live telemetry HUD value updates
        └── sliders.js          # Slider + toggle bindings
```

---

## Physics

All aerodynamic values are derived from empirical NASCAR Cup Series data.

### Drag reduction factor

```
reduction(d) = 0.35 × e^(−0.145d)
```

At a 0 m gap the follow car sees a **35% drag reduction**. At 10 m that drops to ~9%, and beyond 18 m the effect is negligible.

### Speed advantage

```
speedGain(d) = reduction(d) × V_base × 0.075
```

At 200 km/h race speed, a 0 m gap yields ~10–15 km/h of free speed for the following car.

### Pressure coefficient

```
Cp(d) = −0.45 × e^(−0.13d)
```

Negative Cp behind the lead car creates a suction zone that pulls the follow car forward — the core mechanism of drafting.

### Particle deflection zones

When a particle reaches the follow car's front face it is routed into one of five states based on its impact position:

| Zone | Condition | Behaviour |
|---|---|---|
| **ROOF** | Center + high | Redirected up and over the roofline, pulled back down by gravity |
| **SIDE** | Left or right of center | Wraps laterally around the flank, rejoins wake at tail |
| **WAKE** | Behind the tail | Chaotic turbulent tumble, orange-red colour |
| **STAGNATE** | Center + low | True stagnation point — white smoke puff, dies quickly |
| **FLY** | In transit | Free flight, cyan-blue, gentle cone spread |

---

## Tech Stack

| Library | Version | Use |
|---|---|---|
| [Three.js](https://threejs.org) | latest | 3D scene, geometry, particles |
| [Vite](https://vitejs.dev) | latest | Dev server, HMR, production build |

No physics engine, no React, no dependencies beyond that. All aerodynamic simulation is custom JavaScript math.

---

## Roadmap Ideas

- [ ] Animated cars moving at race speed along a banked oval track
- [ ] Third car — three-car drafting pack
- [ ] Side-by-side comparison mode (two gap distances at once)
- [ ] Export telemetry as CSV
- [ ] Mobile touch controls

---

## License

MIT