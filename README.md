const canvas = document.getElementById('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ac7ff);
scene.fog = new THREE.Fog(0x8ac7ff, 60, 220);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const colors = ['#d94b43', '#4b8ed9', '#55aa5a', '#e4b83b', '#9b63bd'];
const GRID = 5;
const world = {
  blocks: []
};

const keys = {};
const player = {
  position: new THREE.Vector3(0, 8, 20),
  velocity: new THREE.Vector3(0, 0, 0),
  yaw: 0,
  pitch: -0.45,
  radius: 1.4,
  onGround: false
};

let selectedColor = 0;

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(30, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 220),
  new THREE.MeshStandardMaterial({ color: 0x7dbf6a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(220, 44, 0x7a8ba3, 0x7a8ba3);
gridHelper.position.y = 0.02;
scene.add(gridHelper);

function snap(value) {
  return Math.round(value / GRID) * GRID;
}

function blockPositionMatches(block, x, y, z) {
  return (
    Math.abs(block.position.x - x) < 0.01 &&
    Math.abs(block.position.y - y) < 0.01 &&
    Math.abs(block.position.z - z) < 0.01
  );
}

function addBlock(x, y, z, hexColor) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(GRID, GRID, GRID),
    new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.8, metalness: 0.1 })
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.gridX = x;
  mesh.userData.gridY = y;
  mesh.userData.gridZ = z;
  scene.add(mesh);
  world.blocks.push(mesh);
}

function removeBlock(x, y, z) {
  for (let i = world.blocks.length - 1; i >= 0; i--) {
    const block = world.blocks[i];
    if (blockPositionMatches(block, x, y, z)) {
      scene.remove(block);
      world.blocks.splice(i, 1);
      return;
    }
  }
}

function resetWorld() {
  for (let i = world.blocks.length - 1; i >= 0; i--) {
    scene.remove(world.blocks[i]);
  }
  world.blocks = [];

  for (let x = -30; x <= 30; x += GRID) {
    for (let z = -30; z <= 30; z += GRID) {
      if ((Math.abs(x) + Math.abs(z)) % (GRID * 2) === 0) {
        addBlock(x, -GRID / 2, z, '#6d8a5b');
      }
    }
  }

  addBlock(-15, 0, 0, colors[1]);
  addBlock(-10, 0, 0, colors[1]);
  addBlock(0, 0, 0, colors[0]);
  addBlock(10, 0, 0, colors[2]);
  addBlock(0, GRID, 0, colors[3]);

  player.position.set(0, 8, 20);
  player.velocity.set(0, 0, 0);
  player.yaw = 0;
  player.pitch = -0.45;
  player.onGround = false;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateCamera() {
  const cameraDistance = 12;
  const lookTarget = new THREE.Vector3(
    player.position.x,
    player.position.y + 2,
    player.position.z
  );

  const cameraOffset = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch) * cameraDistance,
    Math.sin(player.pitch) * cameraDistance,
    Math.cos(player.yaw) * Math.cos(player.pitch) * cameraDistance
  );

  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(lookTarget);
}

function updatePlayer() {
  const forward = new THREE.Vector3(
    Math.sin(player.yaw),
    0,
    Math.cos(player.yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(player.yaw),
    0,
    -Math.sin(player.yaw)
  );

  const move = new THREE.Vector3();

  if (keys.w) move.add(forward);
  if (keys.s) move.sub(forward);
  if (keys.a) move.sub(right);
  if (keys.d) move.add(right);

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(0.25);
    player.position.x += move.x;
    player.position.z += move.z;
  }

  if (keys[' ']) {
    if (player.onGround) {
      player.velocity.y = 8;
      player.onGround = false;
    }
  }

  player.velocity.y -= 0.25;
  player.position.y += player.velocity.y * 0.1;

  if (player.position.y <= 8) {
    player.position.y = 8;
    player.velocity.y = 0;
    player.onGround = true;
  }

  player.position.x = clamp(player.position.x, -80, 80);
  player.position.z = clamp(player.position.z, -80, 80);
}

function buildFromView(placementMode) {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const target = camera.position.clone().add(direction.clone().multiplyScalar(18));
  const x = snap(target.x);
  const y = snap(target.y);
  const z = snap(target.z);

  if (placementMode === 'place') {
    addBlock(x, y, z, colors[selectedColor]);
  } else {
    removeBlock(x, y, z);
  }
}

function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateCamera();

  renderer.render(scene, camera);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (key === 'r') {
    resetWorld();
  }

  if (key >= '1' && key <= '5') {
    selectedColor = Number(key) - 1;
  }

  if (['w', 'a', 's', 'd', ' ', 'shift'].includes(key)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

canvas.addEventListener('mousedown', (event) => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
    return;
  }

  if (event.button === 0) {
    buildFromView('place');
  } else if (event.button === 2) {
    buildFromView('remove');
  }
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === canvas) {
    player.yaw -= event.movementX * 0.0025;
    player.pitch = clamp(player.pitch - event.movementY * 0.0018, -1.2, 1.1);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

resetWorld();
animate();

// Keep the app friendly to js2scratch conversion by using simple functions and arrays.
// The world is a list of block meshes, with place/remove logic handled through snaps and coordinates.

