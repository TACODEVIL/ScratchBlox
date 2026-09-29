<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ScratchBlox 3D</title>
  <style>
    :root {
      --ui-bg: rgba(58, 109, 155, 0.9);
      --ui-border: #244b73;
      --text: white;
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #8ac7ff;
      font-family: Arial, Helvetica, sans-serif;
    }

    #game {
      display: block;
      width: 100vw;
      height: 100vh;
      background: #8ac7ff;
    }

    #topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 52px;
      padding: 12px 20px;
      background: var(--ui-bg);
      border-bottom: 3px solid var(--ui-border);
      color: var(--text);
      z-index: 10;
      pointer-events: none;
    }

    #topbar b {
      font-size: 24px;
      margin-right: 18px;
    }

    #topbar span {
      color: #dfeefb;
      font-size: 14px;
    }

    #hud {
      position: fixed;
      left: 20px;
      bottom: 18px;
      background: rgba(255, 255, 255, 0.8);
      border: 2px solid var(--ui-border);
      padding: 12px 14px;
      box-shadow: 4px 4px rgba(39, 65, 96, 0.25);
      z-index: 10;
      font-size: 13px;
      line-height: 1.5;
      color: #1d2f45;
    }
  </style>
</head>
<body>
  <div id="topbar">
    <b>ScratchBlox 3D</b>
    <span>Three.js real 3D sandbox</span>
  </div>

  <canvas id="game"></canvas>

  <div id="hud">
    <strong>ScratchBlox 3D</strong><br>
    WASD move • Space jump • Click place • Right-click delete • 1-5 color • R reset
  </div>

  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="game-3d.js"></script>
</body>
</html>
