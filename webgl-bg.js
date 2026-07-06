/* ============================================================
   WEBGL AMBIENT BACKGROUND — webgl-bg.js
   Subtle Three.js particle field behind the hero, in the
   Flowise accent palette (teal → blue → violet). Progressive
   enhancement over the static --paper-0 canvas; the page never
   depends on it.

   Guardrails: lazy import after idle, reduced-motion bail,
   WebGL + saveData gate, DPR cap 1.75, pauses when the hero
   is offscreen or the tab is hidden. CSP 'self' safe (vendored
   three.module.min.js r185). Owns only #bgfx.
   ============================================================ */
'use strict';

const CONFIG = {
  threePath: './vendor/three.module.min.js',
  canvasId: 'bgfx',
  colors: [0x14b8a6, 0x3b82f6, 0x8b5cf6],   /* --live-bright, --acc-blue, --acc-violet */
  countDesktop: 900,
  countMobile: 320,
  size: 0.35,          /* WORLD units (sizeAttenuation) — NOT px */
  spread: 46,
  depth: 30,
  drift: 0.018,
  parallax: 0.22,
  opacity: 0.55,
  dprCap: 1.75,
};

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const canvas = document.getElementById(CONFIG.canvasId);

if (canvas && !reduced && !saveData) {
  const start = () => init().catch(() => { /* static canvas is the fallback */ });
  'requestIdleCallback' in window
    ? requestIdleCallback(start, { timeout: 2000 })
    : setTimeout(start, 1500);
}

async function init() {
  // Capability gate before paying the ~360KB import
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

  const THREE = await import(CONFIG.threePath);

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: false, powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.dprCap));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
  camera.position.z = CONFIG.depth * 1.2;

  const mobile = matchMedia('(max-width: 768px)').matches;
  const count = mobile ? CONFIG.countMobile : CONFIG.countDesktop;

  // One Points cloud per accent color — layers decorrelated by rotation
  const clouds = CONFIG.colors.map((hex, i) => {
    const n = Math.floor(count / CONFIG.colors.length);
    const pos = new Float32Array(n * 3);
    for (let j = 0; j < n; j++) {
      pos[j * 3] = (Math.random() - 0.5) * CONFIG.spread * 2;
      pos[j * 3 + 1] = (Math.random() - 0.5) * CONFIG.spread;
      pos[j * 3 + 2] = -CONFIG.depth + Math.random() * CONFIG.depth * 1.4; /* keep >= ~0.8*depth from camera */
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: hex, size: CONFIG.size, sizeAttenuation: true,
      transparent: true, opacity: CONFIG.opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    pts.rotation.z = i * 0.7;
    scene.add(pts);
    return pts;
  });

  scene.fog = new THREE.Fog(0x0a0f1a, CONFIG.depth, CONFIG.depth * 2.2); /* --paper-0 */

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  // Gentle mouse parallax (desktop only)
  let tx = 0, ty = 0, cx = 0, cy = 0;
  function onMove(e) {
    tx = (e.clientX / innerWidth - 0.5) * CONFIG.parallax * 10;
    ty = -(e.clientY / innerHeight - 0.5) * CONFIG.parallax * 6;
  }
  if (!mobile && CONFIG.parallax > 0) addEventListener('pointermove', onMove, { passive: true });

  // Render loop gated by hero visibility + tab visibility
  let raf = 0, running = false, visible = true, seen = true;
  const clock = new THREE.Clock();

  function loop() {
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
    camera.position.x = cx; camera.position.y = cy;
    camera.lookAt(0, 0, 0);
    clouds.forEach((c, i) => {
      c.rotation.y = t * CONFIG.drift * (i % 2 ? 1 : -0.7);
      c.rotation.x = Math.sin(t * 0.05 + i) * 0.04;
    });
    renderer.render(scene, camera);
  }
  function setRunning(on) {
    if (on && !running) { running = true; clock.start(); loop(); }
    else if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }
  const gate = () => setRunning(visible && seen);

  new IntersectionObserver((entries) => { seen = entries[0].isIntersecting; gate(); },
    { threshold: 0 }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; gate(); });

  gate();
  canvas.dataset.ready = '1';   /* e2e / debugging marker: WebGL layer live */
}
