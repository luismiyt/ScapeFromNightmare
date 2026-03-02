AFRAME.registerComponent("wasd-collision", {
  schema: {
    speed: { type: "number", default: 0.1 },
    rayLength: { type: "number", default: 0.7 }
  },

  init: function () {
    // Guardamos teclas presionadas
    this.keys = {};
    window.addEventListener("keydown", e => { this.keys[e.key.toLowerCase()] = true; });
    window.addEventListener("keyup", e => { this.keys[e.key.toLowerCase()] = false; });
  },

  tick: function () {
    const el = this.el; // jugador
    const pos = el.object3D.position.clone();

    // Encontrar la cámara dentro del jugador
    const cam = el.querySelector('[camera]');
    if (!cam) return;

    // Revisar si hay movimiento
    let moved = false;
    const moveVec = new THREE.Vector3();
    if (this.keys["w"]) { moved = true; }
    if (this.keys["s"]) { moved = true; }
    if (this.keys["a"]) { moved = true; }
    if (this.keys["d"]) { moved = true; }
    if (!moved) return;

    // --- Calcular dirección adelante según la cámara (plano XZ) ---
    const forward = new THREE.Vector3(0, 0, -1); // vector local adelante
    forward.applyQuaternion(cam.object3D.quaternion); // rotación de la cámara
    forward.y = 0; // ignorar altura
    forward.normalize();

    // --- Vector derecha (para A/D) ---
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    right.crossVectors(forward, up).normalize();

    // --- Construir vector final de movimiento ---
    if (this.keys["w"]) moveVec.add(forward);
    if (this.keys["s"]) moveVec.sub(forward);
    if (this.keys["a"]) moveVec.sub(right);
    if (this.keys["d"]) moveVec.add(right);

    moveVec.normalize();

    // --- Raycast para colisiones ---
    const rayOrigin = new THREE.Vector3(pos.x, pos.y, pos.z);
    const rayDir = moveVec.clone();
    const raycaster = new THREE.Raycaster(rayOrigin, rayDir, 0, this.data.rayLength);

    const scene = el.sceneEl.object3D;
    const walls = [];
    scene.traverse(obj => { if (obj.userData.isWall) walls.push(obj); });

    const intersects = raycaster.intersectObjects(walls, true);

    // --- Mover jugador si no hay colisión ---
    if (intersects.length === 0) {
      el.object3D.position.x += moveVec.x * this.data.speed;
      el.object3D.position.z += moveVec.z * this.data.speed;
    }
  }
});

// Componente para marcar paredes
AFRAME.registerComponent("wall", {
  init: function () {
    this.el.object3D.userData.isWall = true;
  }
});
