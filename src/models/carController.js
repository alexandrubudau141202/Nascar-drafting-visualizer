import * as THREE from "three";

const TARGET_LENGTH = 5.4; // metres — approximate NASCAR Cup car length

const _box  = new THREE.Box3();
const _size = new THREE.Vector3();

/**
 * Auto-scale the car to TARGET_LENGTH and enable shadows.
 * Does NOT touch position — that's updateCarPositions's job.
 */
export function configureCarModel(car) {
  // Measure raw bounding box before any position changes
  _box.setFromObject(car);
  _box.getSize(_size);

  const longest = Math.max(_size.x, _size.y, _size.z);
  if (longest > 0) {
    car.scale.setScalar(TARGET_LENGTH / longest);
  }

  car.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Place cars every frame.
 * Measures the scaled bounding box to sit the car exactly on y = 0.
 */
export function updateCarPositions(leadCar, followCar, distance) {
  if (!leadCar || !followCar) return;

  placeCarOnGround(leadCar,   0);
  placeCarOnGround(followCar, -distance);
}

function placeCarOnGround(car, z) {
  // Temporarily zero position so box measurement is clean
  car.position.set(0, 0, z);

  _box.setFromObject(car);
  const groundOffset = -_box.min.y;  // how much to lift so min.y === 0

  car.position.set(0, groundOffset, z);
}