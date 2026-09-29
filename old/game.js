/* ScratchBlox uses simple loops, arrays, and keyboard events for easy js2scratch conversion. */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var blockSize = 30;
var groundY = 450;
var colors = ['#d94b43', '#4b8ed9', '#55aa5a', '#e4b83b', '#9b63bd'];
var selectedColor = 0;
var blocks = [];
var keys = {};
var player = { x: 435, y: 390, width: 24, height: 42, vx: 0, vy: 0, onGround: false };

function addBlock(x, y, color) {
  blocks.push({ x: x, y: y, color: color });
}
function resetWorld() {
  blocks = [];
  var x;
  for (x = 0; x < canvas.width; x += blockSize) addBlock(x, groundY, '#69513c');
  addBlock(300, 420, colors[1]); addBlock(330, 420, colors[1]);
  addBlock(330, 390, colors[2]); addBlock(360, 390, colors[2]);
  addBlock(600, 420, colors[0]); addBlock(630, 420, colors[0]);
  player.x = 435; player.y = 390; player.vx = 0; player.vy = 0;
}
function drawBlock(block) {
  ctx.fillStyle = block.color; ctx.fillRect(block.x, block.y, blockSize, blockSize);
  ctx.strokeStyle = '#263746'; ctx.strokeRect(block.x + 1, block.y + 1, blockSize - 2, blockSize - 2);
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(block.x + 3, block.y + 3, blockSize - 6, 5);
}
function collide(nextX, nextY) {
  var i, b;
  for (i = 0; i < blocks.length; i++) {
    b = blocks[i];
    if (nextX < b.x + blockSize && nextX + player.width > b.x && nextY < b.y + blockSize && nextY + player.height > b.y) return b;
  }
  return null;
}
function update() {
  player.vx = 0;
  if (keys.left || keys.a) player.vx = -3;
  if (keys.right || keys.d) player.vx = 3;
  if ((keys.up || keys.w || keys.space) && player.onGround) { player.vy = -10; player.onGround = false; }
  player.vy += 0.45;
  var hit = collide(player.x + player.vx, player.y);
  if (!hit) player.x += player.vx;
  hit = collide(player.x, player.y + player.vy);
  player.onGround = false;
  if (!hit) player.y += player.vy;
  else if (player.vy > 0) { player.y = hit.y - player.height; player.vy = 0; player.onGround = true; }
  else { player.y = hit.y + blockSize; player.vy = 0; }
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
  if (player.y > canvas.height) resetWorld();
}
function draw() {
  ctx.fillStyle = '#86bde2'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#b6d9ee'; ctx.beginPath(); ctx.arc(740, 85, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7ab36c'; ctx.fillRect(0, groundY + blockSize, canvas.width, canvas.height - groundY - blockSize);
  var i; for (i = 0; i < blocks.length; i++) drawBlock(blocks[i]);
  ctx.fillStyle = '#f1c27d'; ctx.fillRect(player.x + 3, player.y, 18, 18);
  ctx.fillStyle = '#2866a0'; ctx.fillRect(player.x, player.y + 18, player.width, 24);
  ctx.strokeStyle = '#263746'; ctx.strokeRect(player.x, player.y, player.width, player.height);
}
function loop() { update(); draw(); requestAnimationFrame(loop); }
function eventPosition(event) { var r = canvas.getBoundingClientRect(); return { x: Math.floor((event.clientX - r.left) * canvas.width / r.width / blockSize) * blockSize, y: Math.floor((event.clientY - r.top) * canvas.height / r.height / blockSize) * blockSize }; }
canvas.addEventListener('click', function(event) { var p = eventPosition(event); if (!collide(p.x + 2, p.y + 2)) addBlock(p.x, p.y, colors[selectedColor]); });
canvas.addEventListener('contextmenu', function(event) { event.preventDefault(); var p = eventPosition(event); var i; for (i = blocks.length - 1; i >= 0; i--) if (blocks[i].x === p.x && blocks[i].y === p.y) { blocks.splice(i, 1); break; } });
document.addEventListener('keydown', function(event) { var k = event.key.toLowerCase(); keys[k] = true; if (k === 'r') resetWorld(); if (k >= '1' && k <= '5') { selectedColor = Number(k) - 1; selectPalette(); } });
document.addEventListener('keyup', function(event) { keys[event.key.toLowerCase()] = false; });
function selectPalette() { var buttons = document.getElementsByClassName('color'); var i; for (i = 0; i < buttons.length; i++) buttons[i].className = i === selectedColor ? 'color selected' : 'color'; }
function makePalette() { var i, button; for (i = 0; i < colors.length; i++) { button = document.createElement('button'); button.className = 'color'; button.style.background = colors[i]; button.onclick = (function(n) { return function() { selectedColor = n; selectPalette(); }; })(i); document.getElementById('palette').appendChild(button); } selectPalette(); }
document.getElementById('reset').onclick = resetWorld;
makePalette(); resetWorld(); loop();
