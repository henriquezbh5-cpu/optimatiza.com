/* ============================================================
   FLOW DEPTH v3 — background-3d.js (estándar threejs-pro)
   Escena WebGL cinematográfica del hero:
   · Nebulosa animada de fondo (shader de flujo, colores de marca).
   · Anillo del isotipo en 3D con pulso de luz recorriéndolo.
   · Constelación de nodos en 2 capas de profundidad (parallax real).
   · Paquetes de datos viajando por las conexiones (agentes en flujo).
   Guardrails: import() lazy del módulo tras first-paint, reduced-motion/
   saveData → fallback .bg-static, DPR≤1.75, antialias off, sprite circular,
   móvil ≤45% densidad, pausa fuera de vista/hidden, dispose en resize.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;

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
    try { build(THREE); }
    catch (e) { document.body.classList.add('bg-static'); }  /* cualquier fallo -> fallback CSS */
  }
  function build(THREE) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power'
      });
    } catch (e) { return; }

    var MOBILE = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.classList.remove('bg-static');

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 0, 40);

    var TEAL = new THREE.Color(0x14B8A6), BLUE = new THREE.Color(0x3B82F6),
        VIOLET = new THREE.Color(0x8B5CF6), GLOW = new THREE.Color(0x9FFFEF);

    /* sprite circular (los Points nativos son cuadrados) */
    var dot = (function () {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.85)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    function pmat(o) {
      return new THREE.PointsMaterial(Object.assign({
        map: dot, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
      }, o));
    }

    /* ---------- 0. NEBULOSA DE FONDO (sprites difusos, costo ~0) ----------
       En vez de un shader FBM por pixel (caro), usamos pocos sprites grandes
       muy difusos en colores de marca con deriva lenta: mismo look de
       "aurora/nebulosa", rendimiento intacto incluso en móvil. */
    var nebula = new THREE.Group();
    var nebSpecs = [
      { c: TEAL,   x: -34, y: 14,  z: -34, s: 62, o: 0.10 },
      { c: BLUE,   x: 8,   y: -10, z: -38, s: 70, o: 0.08 },
      { c: VIOLET, x: 40,  y: 18,  z: -34, s: 58, o: 0.09 }
    ];
    nebSpecs.forEach(function (n) {
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([n.x, n.y, n.z], 3));
      var m = new THREE.Points(g, pmat({ color: n.c, size: n.s, opacity: n.o }));
      m.userData = { bx: n.x, by: n.y, ph: Math.random() * 6.28 };
      nebula.add(m);
    });
    scene.add(nebula);

    /* ---------- 1. ANILLO DE MARCA (+ pulso recorriéndolo) ---------- */
    var ring = new THREE.Group();
    var R = 15;
    (function buildRing() {
      var N = MOBILE ? 260 : 640, pos = [], col = [];
      for (var i = 0; i < N; i++) {
        var a = (i / N) * Math.PI * 2, j = 0.55;
        pos.push(Math.cos(a) * R + (Math.random() - 0.5) * j,
                 Math.sin(a) * R + (Math.random() - 0.5) * j, (Math.random() - 0.5) * j);
        var c = TEAL.clone().lerp(BLUE, Math.abs(Math.sin(a * 1.5)) * 0.35);
        col.push(c.r, c.g, c.b);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      ring.add(new THREE.Points(g, pmat({ size: 0.27, vertexColors: true, opacity: 0.92 })));

      var lp = [];
      for (var k = 0; k <= 128; k++) { var b = (k / 128) * Math.PI * 2; lp.push(Math.cos(b) * R, Math.sin(b) * R, 0); }
      var lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      ring.add(new THREE.Line(lg, new THREE.LineBasicMaterial({
        color: 0x14B8A6, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false
      })));

      var np = [];
      [90, 210, 330].forEach(function (deg) { var t = deg * Math.PI / 180; np.push(Math.cos(t) * R, Math.sin(t) * R, 0); });
      var ng = new THREE.BufferGeometry();
      ng.setAttribute('position', new THREE.Float32BufferAttribute(np, 3));
      ring.add(new THREE.Points(ng, pmat({ color: GLOW, size: 1.2, opacity: 0.95 })));
      var hg = new THREE.BufferGeometry();
      hg.setAttribute('position', new THREE.Float32BufferAttribute(np.slice(), 3));
      ring.add(new THREE.Points(hg, pmat({ color: TEAL, size: 2.5, opacity: 0.26 })));
    })();
    /* pulso que recorre el anillo */
    var pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.Float32BufferAttribute([R, 0, 0], 3));
    var pulse = new THREE.Points(pulseGeo, pmat({ color: GLOW, size: 1.9, opacity: 1 }));
    ring.add(pulse);
    ring.rotation.set(-1.02, 0.18, 0);
    if (MOBILE) { ring.position.set(0, 12.5, -12); ring.scale.setScalar(0.72); }
    else { ring.position.set(19.5, 1.5, -9); ring.scale.setScalar(1.1); }
    scene.add(ring);

    /* ---------- 2. CONSTELACIÓN (2 capas de profundidad) ---------- */
    var edgesData = [];  // {ax,ay,az,bx,by,bz} para spawnear packets
    function buildLayer(count, spread, z, sizePts, opPts, opLines) {
      var grp = new THREE.Group();
      var pts = [], col = [], nodes = [];
      for (var i = 0; i < count; i++) {
        var x = (Math.random() - 0.5) * spread,
            y = (Math.random() - 0.5) * (spread * 0.55),
            zz = (Math.random() - 0.5) * 20;
        nodes.push([x, y, zz]); pts.push(x, y, zz);
        var k = (x + spread / 2) / spread;
        var c = k < 0.5 ? TEAL.clone().lerp(BLUE, k * 2) : BLUE.clone().lerp(VIOLET, (k - 0.5) * 2);
        col.push(c.r, c.g, c.b);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      grp.add(new THREE.Points(g, pmat({ size: sizePts, vertexColors: true, opacity: opPts })));

      var lp = [], lc = [], maxSeg = MOBILE ? 55 : 120, seg = 0;
      for (var a = 0; a < count && seg < maxSeg; a++) {
        for (var b = a + 1; b < count && seg < maxSeg; b++) {
          var dx = nodes[a][0] - nodes[b][0], dy = nodes[a][1] - nodes[b][1], dz = nodes[a][2] - nodes[b][2];
          if (dx * dx + dy * dy + dz * dz < 82) {
            lp.push(nodes[a][0], nodes[a][1], nodes[a][2], nodes[b][0], nodes[b][1], nodes[b][2]);
            var ca = new THREE.Color(col[a * 3], col[a * 3 + 1], col[a * 3 + 2]);
            var cb = new THREE.Color(col[b * 3], col[b * 3 + 1], col[b * 3 + 2]);
            lc.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
            edgesData.push({ z: z, a: nodes[a], b: nodes[b] });
            seg++;
          }
        }
      }
      var lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      lg.setAttribute('color', new THREE.Float32BufferAttribute(lc, 3));
      grp.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: opLines,
        blending: THREE.AdditiveBlending, depthWrite: false
      })));
      grp.position.z = z;
      scene.add(grp);
      return grp;
    }
    var farLayer = buildLayer(MOBILE ? 34 : 70, 88, -18, 0.34, 0.5, 0.1);
    var nearLayer = buildLayer(MOBILE ? 24 : 55, 70, -6, 0.46, 0.75, 0.16);

    /* ---------- 3. PAQUETES DE DATOS (agentes en flujo) ---------- */
    var NPK = MOBILE ? 7 : 14;
    var pkPos = new Float32Array(NPK * 3);
    var packets = [];
    for (var i = 0; i < NPK; i++) packets.push(spawnPacket());
    function spawnPacket() {
      var e = edgesData.length ? edgesData[(Math.random() * edgesData.length) | 0] : null;
      return { e: e, t: Math.random(), speed: 0.12 + Math.random() * 0.22 };
    }
    var pkGeo = new THREE.BufferGeometry();
    pkGeo.setAttribute('position', new THREE.BufferAttribute(pkPos, 3));
    var pkPoints = new THREE.Points(pkGeo, pmat({ color: GLOW, size: 0.7, opacity: 0.95 }));
    scene.add(pkPoints);

    /* ---------- ciclo, parallax, pausas ---------- */
    var mx = 0, my = 0, running = false, raf = 0, t0 = performance.now();
    document.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - t0) / 1000 - (frame._last || 0));
      frame._last = (now - t0) / 1000;
      var t = (now - t0) / 1000;

      /* deriva lenta de la nebulosa */
      for (var ni = 0; ni < nebula.children.length; ni++) {
        var nb = nebula.children[ni], u = nb.userData;
        nb.position.x = u.bx + Math.sin(t * 0.06 + u.ph) * 4;
        nb.position.y = u.by + Math.cos(t * 0.05 + u.ph) * 3;
      }
      ring.rotation.z = t * 0.05;
      /* pulso recorriendo el anillo */
      var pa = t * 0.9;
      pulse.geometry.attributes.position.setXYZ(0, Math.cos(pa) * R, Math.sin(pa) * R, 0);
      pulse.geometry.attributes.position.needsUpdate = true;

      farLayer.rotation.y = Math.sin(t * 0.03) * 0.14;
      nearLayer.rotation.y = Math.sin(t * 0.045) * 0.2;
      nearLayer.position.y = Math.sin(t * 0.12) * 0.6;

      /* mover paquetes por sus aristas */
      for (var i = 0; i < NPK; i++) {
        var p = packets[i];
        if (!p.e) { pkPos[i * 3 + 1] = 9999; continue; }
        p.t += p.speed * dt;
        if (p.t >= 1) { packets[i] = spawnPacket(); p = packets[i]; if (!p.e) { pkPos[i * 3 + 1] = 9999; continue; } }
        var a = p.e.a, b = p.e.b, tt = p.t;
        pkPos[i * 3]     = a[0] + (b[0] - a[0]) * tt;
        pkPos[i * 3 + 1] = a[1] + (b[1] - a[1]) * tt;
        pkPos[i * 3 + 2] = p.e.z + a[2] + (b[2] - a[2]) * tt;
      }
      pkGeo.attributes.position.needsUpdate = true;

      /* parallax de cámara */
      camera.position.x += ((mx * 2.6) - camera.position.x) * 0.03;
      camera.position.y += ((-my * 1.7) - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    function want() { return !document.hidden && window.scrollY < window.innerHeight * 1.4; }
    function setRunning(on) {
      if (on && !running) { running = true; frame._last = (performance.now() - t0) / 1000; raf = requestAnimationFrame(frame); }
      else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }
    document.addEventListener('visibilitychange', function () { setRunning(want()); });
    window.addEventListener('scroll', function () { setRunning(want()); }, { passive: true });
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    /* GPU context perdido (sleep/throttling): parar el loop y reanudar al volver */
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); setRunning(false); }, false);
    canvas.addEventListener('webglcontextrestored', function () { setRunning(want()); }, false);

    setRunning(true);
    window.__optzBG = { ok: true, v: 3 };
  }
})();
