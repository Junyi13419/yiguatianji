/* ===== 一卦天机 · 矩阵数字雨背景 ===== */
(function () {
  'use strict';

  var canvas = document.getElementById('matrixRain');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // 片假名 + 拉丁 + 数字，全角字宽统一，雨幕更整齐
  var CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/\\*+=#';
  var FONT_SIZE = 15;
  var COLS = 0;
  var drops = [];
  var running = true;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    COLS = Math.floor(window.innerWidth / FONT_SIZE);
    drops = [];
    for (var i = 0; i < COLS; i++) {
      drops.push({
        y: Math.floor(Math.random() * (window.innerHeight / FONT_SIZE) * 2) - window.innerHeight / FONT_SIZE,
        speed: 0.35 + Math.random() * 0.7,
        hue: Math.random() < 0.18 ? 'magenta' : 'cyan'
      });
    }
  }

  function draw() {
    // 拖尾：半透明底色覆盖
    ctx.fillStyle = 'rgba(7, 10, 20, 0.09)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = FONT_SIZE + "px 'Consolas', 'MS Gothic', monospace";
    ctx.textAlign = 'center';

    for (var i = 0; i < COLS; i++) {
      var d = drops[i];
      if (!d) continue;
      var ch = CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      var x = i * FONT_SIZE + FONT_SIZE / 2;
      var y = d.y * FONT_SIZE;

      // 头部高亮：柔化白芯霓虹（低不透明度辉光，不刺眼）
      ctx.fillStyle = 'rgba(235, 250, 255, 0.85)';
      ctx.shadowColor = d.hue === 'magenta' ? 'rgba(255, 61, 139, 0.5)' : 'rgba(34, 224, 255, 0.45)';
      ctx.shadowBlur = 8;
      ctx.fillText(ch, x, y);
      // 尾部：半透明霓虹
      ctx.shadowBlur = 4;
      ctx.fillStyle = d.hue === 'magenta' ? 'rgba(255, 61, 139, 0.35)' : 'rgba(34, 224, 255, 0.3)';
      var tailCh = CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      ctx.fillText(tailCh, x, y - FONT_SIZE);

      ctx.shadowBlur = 0;

      d.y += d.speed;
      if (y > window.innerHeight && Math.random() > 0.975) {
        d.y = -Math.random() * 30;
        d.speed = 0.35 + Math.random() * 0.7;
      }
    }
  }

  function loop() {
    if (running) draw();
    requestAnimationFrame(loop);
  }

  function start() { running = true; }
  function stop() { running = false; }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  resize();
  loop();
})();
