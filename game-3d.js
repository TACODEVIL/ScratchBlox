const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const colors = ['#d94b43', '#4b8ed9', '#55aa5a', '#e4b83b', '#9b63bd'];
const BLOCK = 24;
const HALF = BLOCK / 2;
let selectedColor = 0;

const world = {
  width: 30,
  depth: 30,
  maxHeight: 5,
  blocks: []
};

const player = {
  x: 0,
  y: 1,
  z: 0,
  vx: 0,
  vz: 0,
  color: '#f8d494'
};

const camera = {
  x: 0,
  y: 0,
  z: 0
};

const keys = {};

function keyName(e) {
  return e.key.toLowerCase();
}

function resetWorld() {
  world.blocks = [];
  const groundColor = '#7aa466';

  for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
      world.blocks.push({ x, y: 0, z, color: groundColor });
    }
  }

  addBlock(0, 1, 0, colors[1]);
  addBlock(1, 1, 0, colors[2]);
  addBlock(0, 2, 0, colors[3]);
  addBlock(-2, 1, 0, colors[0]);
  addBlock(0, 1, -2, colors[4]);

  player.x = 0;
  player.y = 1;
  player.z = 4;
  camera.x = 0;
  camera.z = 0;
}

function addBlock(x, y, z, color) {
  world.blocks.push({ x, y, z, color: color || colors[selectedColor] });
}

function removeBlock(x, y, z) {
  for (let i = world.blocks.length - 1; i >= 0; i--) {
    const b = world.blocks[i];
    if (b.x === x && b.y === y && b.z === z) {
      world.blocks.splice(i, 1);
      return;
    }
  }
}

function project(x, y, z) {
  const px = (x - z) * HALF;
  const py = (x + z) * (HALF * 0.5) - y * BLOCK;
  return {
    x: canvas.width * 0.5 + px - camera.x * HALF,
    y: canvas.height * 0.6 + py - camera.z * (HALF * 0.6),
    depth: x + z + y * 0.5
  };
}

function sortBlocks() {
  world.blocks.sort((a, b) => {
    const pa = project(a.x, a.y, a.z).depth;
    const pb = project(b.x, b.y, b.z).depth;
    return pa - pb;
  });
}

function drawCube(block) {
  const points = [
    { x: block.x, y: block.y, z: block.z },
    { x: block.x + 1, y: block.y, z: block.z },
    { x: block.x + 1, y: block.y, z: block.z + 1 },
    { x: block.x, y: block.y, z: block.z + 1 },
    { x: block.x, y: block.y + 1, z: block.z },
    { x: block.x + 1, y: block.y + 1, z: block.z },
    { x: block.x + 1, y: block.y + 1, z: block.z + 1 },
    { x: block.x, y: block.y + 1, z: block.z + 1 }
  ];

  const p = points.map(pt => project(pt.x, pt.y, pt.z));
  const top = [p[4], p[5], p[6], p[7]];
  const left = [p[0], p[3], p[7], p[4]];
  const right = [p[1], p[2], p[6], p[5]];
  const front = [p[0], p[1], p[5], p[4]];

  drawFace(top, block.color, '#dfefff');
  drawFace(left, shadeColor(block.color, -18), '#cfe5ff');
  drawFace(right, shadeColor(block.color, -28), '#d0d8e3');
  drawFace(front, shadeColor(block.color, -10), '#eaf7ff');
}

function drawFace(points, fill, stroke) {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00FF) + percent;
  let b = (num & 0x0000FF) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function drawPlayer() {
  const p = project(player.x, player.y, player.z);
  ctx.fillStyle = player.color;
  ctx.fillRect(p.x - 6, p.y - 18, 12, 18);
  ctx.fillStyle = '#173b62';
  ctx.fillRect(p.x - 10, p.y - 8, 20, 8);
}

function updatePlayer() {
  const move = { x: 0, z: 0 };

  if (keys.w || keys.arrowup) move.z -= 1;
  if (keys.s || keys.arrowdown) move.z += 1;
  if (keys.a || keys.arrowleft) move.x -= 1;
  if (keys.d || keys.arrowright) move.x += 1;

  if (move.x !== 0 || move.z !== 0) {
    const length = Math.hypot(move.x, move.z) || 1;
    player.x += (move.x / length) * 0.25;
    player.z += (move.z / length) * 0.25;
  }

  if (keys[' ']) player.y += 0.2;
  if (keys.shift) player.y -= 0.2;
  if (player.y < 1) player.y = 1;

  camera.x = player.x;
  camera.z = player.z;
}

function drawGround() {
  const gridColor = '#98c77d';
  for (let x = -12; x <= 12; x++) {
    for (let z = -12; z <= 12; z++) {
      const p1 = project(x, 0, z);
      const p2 = project(x + 1, 0, z);
      const p3 = project(x + 1, 0, z + 1);
      const p4 = project(x, 0, z + 1);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = gridColor;
      ctx.fill();
    }
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#9ad1ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGround();
  sortBlocks();
  for (let i = 0; i < world.blocks.length; i++) drawCube(world.blocks[i]);
  drawPlayer();
}

function handleInput() {
  if (keys.b) {
    const bx = Math.round(player.x);
    const by = Math.max(1, Math.round(player.y));
    const bz = Math.round(player.z);
    addBlock(bx, by, bz, colors[selectedColor]);
    keys.b = false;
  }

  if (keys.v) {
    const bx = Math.round(player.x);
    const by = Math.max(1, Math.round(player.y));
    const bz = Math.round(player.z);
    removeBlock(bx, by, bz);
    keys.v = false;
  }

  if (keys.r) {
    resetWorld();
    keys.r = false;
  }

  if (keys['1']) selectedColor = 0;
  if (keys['2']) selectedColor = 1;
  if (keys['3']) selectedColor = 2;
  if (keys['4']) selectedColor = 3;
  if (keys['5']) selectedColor = 4;
}

function frame() {
  updatePlayer();
  handleInput();
  drawWorld();
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (e) => {
  const k = keyName(e);
  keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  keys[keyName(e)] = false;
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
resetWorld();
frame();
