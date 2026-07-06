/* ============================================================
   FLOW DEPTH — background-3d.js (v2, estándar threejs-pro)
   Escena WebGL de marca para el hero:
   · El anillo del isotipo en 3D (partículas teal + 3 nodos)
     compuesto a la derecha, sin invadir el titular.
   · Constelación de nodos conectados (teal→azul→violeta) con
     deriva lenta y parallax sutil.
   Guardrails: carga de three.js DESPUÉS del primer paint
   (requestIdleCallback), reduced-motion/saveData → fallback CSS
   (.bg-static), DPR ≤1.75, antialias off (escena de puntos),
   móvil ≤40% de partículas, pausa fuera de vista/hidden.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;

  /* ---------- carga perezosa de three (módulo) tras el primer paint ---------- */
  function schedule(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2000 });
    else setTimeout(fn, 1500);
  }
  schedule(function () {
    import('./vendor/three.module.min.js')
      .then(function (m) { init(m); })
      .catch(function () { /* .bg-static queda como está */ });
  });

  function init(THREE) {
    if (!THREE || !THREE.WebGLRenderer) return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power'
      });
    } catch (e) { return; }

    var MOBILE = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.classList.remove('bg-static');   /* WebGL vivo → fuera fallback */

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 40);

    var TEAL = new THREE.Color(0x14B8A6), BLUE = new THREE.Color(0x3B82F6),
        VIOLET = new THREE.Color(0x8B5CF6), GLOW = new THREE.Color(0x9FFFEF);

    /* sprite circular (los Points por defecto son CUADRADOS) */
    var dot = (function () {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.85)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      var t = new THREE.CanvasTexture(c);
      return t;
    })();
    function pmat(opts) {
      return new THREE.PointsMaterial(Object.assign({
        map: dot, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
      }, opts));
    }

    /* ---------- 1. EL ANILLO DE MARCA ---------- */
    var ring = new THREE.Group();
    (function buildRing() {
      var R = 15, N = MOBILE ? 240 : 620;          /* móvil ≈ 39% */
      var pos = [], col = [];
      for (var i = 0; i < N; i++) {
        var a = (i / N) * Math.PI * 2, j = 0.55;
        pos.push(Math.cos(a) * R + (Math.random() - 0.5) * j,
                 Math.sin(a) * R + (Math.random() - 0.5) * j,
                 (Math.random() - 0.5) * j);
        var c = TEAL.clone().lerp(BLUE, Math.abs(Math.sin(a * 1.5)) * 0.35);
        col.push(c.r, c.g, c.b);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      ring.add(new THREE.Points(g, pmat({ size: 0.26, vertexColors: true, opacity: 0.9 })));

      var lp = [];
      for (var k = 0; k <= 128; k++) { var b = (k / 128) * Math.PI * 2; lp.push(Math.cos(b) * R, Math.sin(b) * R, 0); }
      var lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      ring.add(new THREE.Line(lg, new THREE.LineBasicMaterial({
        color: 0x14B8A6, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false
      })));

      /* nodos del isotipo: 90° / 210° / 330° — núcleo + halo, redondos */
      var np = [];
      [90, 210, 330].forEach(function (deg) {
        var t = deg * Math.PI / 180; np.push(Math.cos(t) * R, Math.sin(t) * R, 0);
      });
      var ng = new THREE.BufferGeometry();
      ng.setAttribute('position', new THREE.Float32BufferAttribute(np, 3));
      ring.add(new THREE.Points(ng, pmat({ color: GLOW, size: 1.15, opacity: 0.95 })));
      var hg = new THREE.BufferGeometry();
      hg.setAttribute('position', new THREE.Float32BufferAttribute(np.slice(), 3));
      ring.add(new THREE.Points(hg, pmat({ color: TEAL, size: 2.4, opacity: 0.25 })));
    })();
    ring.rotation.set(-1.02, 0.18, 0);
    if (MOBILE) { ring.position.set(0, 12.5, -12); ring.scale.setScalar(0.72); }
    else { ring.position.set(19.5, 1.5, -9); ring.scale.setScalar(1.08); }
    scene.add(ring);

    /* ---------- 2. CONSTELACIÓN ---------- */
    var field = new THREE.Group();
    (function buildField() {
      var N = MOBILE ? 42 : 105;                   /* móvil = 40% */
      var pts = [], col = [], nodes = [];
      for (var i = 0; i < N; i++) {
        var x = (Math.random() - 0.5) * 74,
            y = (Math.random() - 0.5) * 40,
            z = (Math.random() - 0.5) * 26 - 4;
        nodes.push([x, y, z]); pts.push(x, y, z);
        var k = (x + 37) / 74;
        var c = k < 0.5 ? TEAL.clone().lerp(BLUE, k * 2) : BLUE.clone().lerp(VIOLET, (k - 0.5) * 2);
        col.push(c.r, c.g, c.b);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      field.add(new THREE.Points(g, pmat({ size: 0.42, vertexColors: true, opacity: 0.7 })));

      var lp = [], lc = [], maxSeg = MOBILE ? 50 : 130, seg = 0;
      for (var a = 0; a < N && seg < maxSeg; a++) {
        for (var b = a + 1; b < N && seg < maxSeg; b++) {
          var dx = nodes[a][0] - nodes[b][0], dy = nodes[a][1] - nodes[b][1], dz = nodes[a][2] - nodes[b][2];
          if (dx * dx + dy * dy + dz * dz < 78) {
            lp.push(nodes[a][0], nodes[a][1], nodes[a][2], nodes[b][0], nodes[b][1], nodes[b][2]);
            var ca = new THREE.Color(col[a * 3], col[a * 3 + 1], col[a * 3 + 2]);
            var cb = new THREE.Color(col[b * 3], col[b * 3 + 1], col[b * 3 + 2]);
            lc.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
            seg++;
          }
        }
      }
      var lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      lg.setAttribute('color', new THREE.Float32BufferAttribute(lc, 3));
      field.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.13,
        blending: THREE.AdditiveBlending, depthWrite: false
      })));
    })();
    field.position.z = -10;
    scene.add(field);

    /* ---------- ciclo, parallax y pausas ---------- */
    var mx = 0, my = 0, running = false, raf = 0, t0 = performance.now();
    document.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var t = (now - t0) / 1000;
      ring.rotation.z = t * 0.05;
      field.rotation.y = Math.sin(t * 0.04) * 0.18;
      field.position.y = Math.sin(t * 0.12) * 0.6;
      camera.position.x += ((mx * 2.4) - camera.position.x) * 0.03;
      camera.position.y += ((-my * 1.6) - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    function want() { return !document.hidden && window.scrollY < window.innerHeight * 1.4; }
    function setRunning(on) {
      if (on && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }
    document.addEventListener('visibilitychange', function () { setRunning(want()); });
    window.addEventListener('scroll', function () { setRunning(want()); }, { passive: true });
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    setRunning(true);
    window.__optzBG = { ok: true, lazy: true };    /* hook de QA */
  }
})();
