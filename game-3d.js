// ScratchBlox 3D with Three.js - Real 3D block world
// Designed to be convertible to Scratch using js2scratch

var scene, camera, renderer;
var blocks = [];
var player = { x: 0, y: 10, z: 30, vy: 0 };
var keys = {};
var selectedColor = 0;
var colors = ['#d94b43', '#4b8ed9', '#55aa5a', '#e4b83b', '#9b63bd'];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 200, 500);

  // Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(player.x, player.y, player.z);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Lighting
  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(50, 100, 50);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.left = -100;
  light.shadow.camera.right = 100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Event listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  canvas = document.getElementById('game') || renderer.domElement;
  canvas.addEventListener('click', onMouseClick);
  canvas.addEventListener('contextmenu', onRightClick);
  window.addEventListener('resize', onWindowResize);

  // Initialize world
  resetWorld();
  animate();
}

function resetWorld() {
  // Clear existing blocks
  for (var i = scene.children.length - 1; i >= 0; i--) {
    var child = scene.children[i];
    if (child.isBlock) {
      scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
  }
  blocks = [];

  // Create ground plane
  for (var x = -20; x <= 20; x += 5) {
    for (var z = -20; z <= 20; z += 5) {
      addBlockToScene(x, -5, z, '#69513c');
    }
  }

  // Add sample structures
  addBlockToScene(-10, 0, 0, colors[1]);
  addBlockToScene(0, 0, 0, colors[1]);
  addBlockToScene(10, 0, 0, colors[0]);
  addBlockToScene(0, 5, 0, colors[2]);
  addBlockToScene(5, 0, -5, colors[3]);

  player.x = 0;
  player.y = 10;
  player.z = 30;
  player.vy = 0;
}

function addBlockToScene(x, y, z, color) {
  var geometry = new THREE.BoxGeometry(5, 5, 5);
  var material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.isBlock = true;
  scene.add(cube);
  blocks.push({ mesh: cube, x: x, y: y, z: z, color: color });
}

function removeBlockFromScene(x, y, z) {
  for (var i = blocks.length - 1; i >= 0; i--) {
    var block = blocks[i];
    var dx = Math.abs(block.x - x);
    var dy = Math.abs(block.y - y);
    var dz = Math.abs(block.z - z);
    if (dx < 3 && dy < 3 && dz < 3) {
      scene.remove(block.mesh);
      block.mesh.geometry.dispose();
      block.mesh.material.dispose();
      blocks.splice(i, 1);
      return;
    }
  }
}

function onKeyDown(event) {
  keys[event.key.toLowerCase()] = true;
  var key = event.key.toLowerCase();
  if (key === 'r') resetWorld();
  if (key >= '1' && key <= '5') selectedColor = parseInt(key) - 1;
}

function onKeyUp(event) {
  keys[event.key.toLowerCase()] = false;
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    var point = intersects[0].point;
    var normal = intersects[0].face.normal.clone();
    normal.multiplyScalar(2.5);
    var newPos = point.clone().add(normal);
    var gridX = Math.round(newPos.x / 5) * 5;
    var gridY = Math.round(newPos.y / 5) * 5;
    var gridZ = Math.round(newPos.z / 5) * 5;
    addBlockToScene(gridX, gridY, gridZ, colors[selectedColor]);
  }
}

function onRightClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    var point = intersects[0].point;
    removeBlockFromScene(point.x, point.y, point.z);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updatePlayer() {
  var moveX = 0, moveZ = 0;
  var speed = 0.3;
  if (keys.w) moveZ -= speed;
  if (keys.s) moveZ += speed;
  if (keys.a) moveX -= speed;
  if (keys.d) moveX += speed;
  player.x += moveX;
  player.z += moveZ;
  if (keys[' ']) player.vy = 0.5;
  if (keys.shift) player.vy = -0.3;
  player.vy -= 0.15; // gravity
  player.y += player.vy;
  if (player.y < 0) {
    player.y = 10;
    player.vy = 0;
  }
}

function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  camera.position.set(player.x, player.y, player.z);
  renderer.render(scene, camera);
}

init();
