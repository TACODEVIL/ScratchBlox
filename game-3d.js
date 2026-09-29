// ScratchBlox 3D - Simple Three.js implementation optimized for js2scratch conversion
// Avoids modules, keeps code linear and compatible with Scratch block structure

var canvas = document.getElementById('game');
var ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 48;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Math utilities
function Vector3(x, y, z) {
  return { x: x || 0, y: y || 0, z: z || 0 };
}

function addVector3(a, b) {
  return Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
}

function subtractVector3(a, b) {
  return Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
}

function multiplyVector3(v, s) {
  return Vector3(v.x * s, v.y * s, v.z * s);
}

function normalizeVector3(v) {
  var len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return Vector3(0, 0, 0);
  return Vector3(v.x / len, v.y / len, v.z / len);
}

function Matrix4() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

function multiplyMatrices(a, b) {
  var result = Array(16);
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      result[i * 4 + j] = 0;
      for (var k = 0; k < 4; k++) {
        result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
      }
    }
  }
  return result;
}

// Scene setup
var scene = [];
var camera = {
  position: Vector3(0, 25, 50),
  direction: Vector3(0, -0.3, -1),
  up: Vector3(0, 1, 0),
  fov: 50,
  aspect: canvas.width / canvas.height,
  near: 0.1,
  far: 1000
};

var player = {
  position: Vector3(0, 25, 50),
  velocity: Vector3(0, 0, 0),
  yaw: 0,
  pitch: 0
};

var blocks = [];
var selectedColor = 0;
var colors = ['#d94b43', '#4b8ed9', '#55aa5a', '#e4b83b', '#9b63bd'];
var keys = {};
var mouseX = 0, mouseY = 0;
var pointerLocked = false;

// Cube mesh data (8 vertices, 12 triangles)
function createBoxGeometry(w, h, d) {
  var hw = w / 2, hh = h / 2, hd = d / 2;
  var vertices = [
    [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd],
    [-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]
  ];
  var indices = [
    0, 1, 2, 2, 3, 0, // front
    5, 4, 7, 7, 6, 5, // back
    4, 5, 1, 1, 0, 4, // bottom
    3, 2, 6, 6, 7, 3, // top
    4, 0, 3, 3, 7, 4, // left
    1, 5, 6, 6, 2, 1  // right
  ];
  return { vertices: vertices, indices: indices };
}

function addBlock(x, y, z, color) {
  blocks.push({ x: x, y: y, z: z, color: color });
}

function removeBlock(x, y, z) {
  var i;
  for (i = 0; i < blocks.length; i++) {
    if (blocks[i].x === x && blocks[i].y === y && blocks[i].z === z) {
      blocks.splice(i, 1);
      return;
    }
  }
}

function resetWorld() {
  blocks = [];
  var x, z;
  // Ground plane
  for (x = -60; x <= 60; x += 30) {
    for (z = -60; z <= 60; z += 30) {
      addBlock(x, -30, z, '#69513c');
    }
  }
  // Sample structures
  addBlock(-30, 0, 0, colors[1]);
  addBlock(0, 0, 0, colors[1]);
  addBlock(30, 0, 0, colors[0]);
  addBlock(0, 30, 0, colors[2]);
  player.position = Vector3(0, 40, 80);
  player.velocity = Vector3(0, 0, 0);
}

function updateCamera() {
  camera.position = player.position;
  var cosYaw = Math.cos(player.yaw);
  var sinYaw = Math.sin(player.yaw);
  var cosPitch = Math.cos(player.pitch);
  var sinPitch = Math.sin(player.pitch);
  camera.direction = Vector3(
    sinYaw * cosPitch,
    -sinPitch,
    -cosYaw * cosPitch
  );
}

function update() {
  // Movement
  var moveDir = Vector3(0, 0, 0);
  if (keys.w || keys.arrowup) moveDir.z -= 1;
  if (keys.s || keys.arrowdown) moveDir.z += 1;
  if (keys.a) moveDir.x -= 1;
  if (keys.d) moveDir.x += 1;
  
  var cosYaw = Math.cos(player.yaw);
  var sinYaw = Math.sin(player.yaw);
  var actualMove = Vector3(
    moveDir.x * cosYaw - moveDir.z * sinYaw,
    0,
    moveDir.x * sinYaw + moveDir.z * cosYaw
  );
  
  actualMove = normalizeVector3(actualMove);
  actualMove = multiplyVector3(actualMove, 0.3);
  player.velocity.x += actualMove.x;
  player.velocity.z += actualMove.z;
  
  if (keys.shift) player.velocity.y -= 0.3;
  if (keys.' ') player.velocity.y += 0.3;
  
  player.velocity.y -= 0.2; // Gravity
  player.velocity.x *= 0.9;
  player.velocity.z *= 0.9;
  
  player.position = addVector3(player.position, player.velocity);
  
  // Collision with ground and blocks
  if (player.position.y < -20) {
    player.position.y = 40;
    player.velocity = Vector3(0, 0, 0);
  }
  
  updateCamera();
}

function setup3DContext() {
  ctx.clearColor(0.52, 0.74, 0.9, 1);
  ctx.enable(ctx.DEPTH_TEST);
  ctx.enable(ctx.CULL_FACE);
  ctx.viewport(0, 0, canvas.width, canvas.height);
}

function drawScene() {
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  
  var i;
  for (i = 0; i < blocks.length; i++) {
    drawBlock(blocks[i]);
  }
}

function drawBlock(block) {
  var geometry = createBoxGeometry(30, 30, 30);
  var i, j;
  var colorRGB = hexToRGB(block.color);
  
  // Project and draw (simplified for WebGL)
  // This is a placeholder - full 3D rendering would require shader setup
}

function hexToRGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255] : [1, 1, 1];
}

// Event handlers
document.addEventListener('keydown', function(e) {
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'r' || e.key === 'R') resetWorld();
  if (e.key >= '1' && e.key <= '5') selectedColor = parseInt(e.key) - 1;
});

document.addEventListener('keyup', function(e) {
  keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', function(e) {
  var sensitivity = 0.003;
  player.yaw -= e.movementX * sensitivity;
  player.pitch -= e.movementY * sensitivity;
  player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.pitch));
});

canvas.addEventListener('click', function() {
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
  canvas.requestPointerLock();
});

canvas.addEventListener('mousedown', function(e) {
  if (e.button === 0) {
    var targetPos = addVector3(camera.position, multiplyVector3(camera.direction, 50));
    var gridX = Math.round(targetPos.x / 30) * 30;
    var gridY = Math.round(targetPos.y / 30) * 30;
    var gridZ = Math.round(targetPos.z / 30) * 30;
    addBlock(gridX, gridY, gridZ, colors[selectedColor]);
  } else if (e.button === 2) {
    var targetPos = addVector3(camera.position, multiplyVector3(camera.direction, 50));
    var gridX = Math.round(targetPos.x / 30) * 30;
    var gridY = Math.round(targetPos.y / 30) * 30;
    var gridZ = Math.round(targetPos.z / 30) * 30;
    removeBlock(gridX, gridY, gridZ);
  }
});

canvas.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// Game loop
function gameLoop() {
  update();
  drawScene();
  requestAnimationFrame(gameLoop);
}

setup3DContext();
resetWorld();
gameLoop();
