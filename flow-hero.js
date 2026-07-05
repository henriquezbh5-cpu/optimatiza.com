/* ============================================================
   FLOW CANVAS — flow-hero.js
   1) #flowHero: live workflow-editor hero (nodes + animated
      edges + chat panel), loops 3 scenarios, ES/EN.
   2) #proc: pinned end-to-end process scroll (GSAP ScrollTrigger).
   Vanilla JS, CSP 'self'. Owns nothing outside these two roots.
   ============================================================ */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lang() { try { return localStorage.getItem('preferred-lang') === 'en' ? 'en' : 'es'; } catch (e) { return 'es'; } }
  var L = lang() === 'en' ? 1 : 0;
  document.addEventListener('optz:lang', function (e) {
    L = (e.detail && e.detail.lang === 'en') ? 1 : 0;
  });

  /* ==========================================================
     1. HERO WORKFLOW WINDOW
     ========================================================== */
  var SCENES = [
    {
      slug: 'nova', node: 'ventas', time: '02:47',
      plate: ['A-01 NOVA · VENTAS', 'A-01 NOVA · SALES'],
      user: ['Hola, ¿tienen 40 licencias de Microsoft 365? Necesito precio para mañana.',
             'Hi, do you carry 40 Microsoft 365 licenses? I need pricing by tomorrow.'],
      bot: ['Listo — cotización COT-0412 enviada: 40 licencias M365 Business. Agendé una llamada mañana 9:00 a. m. con tu asesor.',
            'Done — quote COT-0412 sent: 40 M365 Business licenses. I booked a call tomorrow 9:00 AM with your rep.'],
      seal: ['RESUELTO · 38 s · SIN INTERVENCIÓN HUMANA', 'RESOLVED · 38 s · NO HUMAN NEEDED'],
      agent: ['Agente Ventas', 'Sales Agent']
    },
    {
      slug: 'ledger', node: 'cobros', time: '10:12',
      plate: ['A-06 LEDGER · COBRANZA', 'A-06 LEDGER · COLLECTIONS'],
      user: ['Buenas, ¿me reenvían la factura F-2201? Creo que no la he pagado.',
             'Hi, can you resend invoice F-2201? I don’t think I’ve paid it.'],
      bot: ['Aquí está la factura F-2201 ($1,240 — vence el viernes). Te generé el enlace de pago y programé un recordatorio para el jueves.',
            'Here’s invoice F-2201 ($1,240 — due Friday). I generated your payment link and scheduled a reminder for Thursday.'],
      seal: ['RESUELTO · 21 s · SIN INTERVENCIÓN HUMANA', 'RESOLVED · 21 s · NO HUMAN NEEDED'],
      agent: ['Agente Cobros', 'Collections Agent']
    },
    {
      slug: 'aura', node: 'soporte', time: '16:45',
      plate: ['A-03 AURA · SOPORTE', 'A-03 AURA · SUPPORT'],
      user: ['El sistema no me deja iniciar sesión desde ayer, ¿me ayudan?',
             'The system won’t let me sign in since yesterday, can you help?'],
      bot: ['Restablecí tu acceso y verifiqué el inicio de sesión. Ticket TK-3310 documentado; si vuelve a pasar, escríbeme aquí.',
            'I reset your access and verified sign-in works. Ticket TK-3310 is documented; if it happens again, message me here.'],
      seal: ['RESUELTO · 45 s · SIN INTERVENCIÓN HUMANA', 'RESOLVED · 45 s · NO HUMAN NEEDED'],
      agent: ['Agente Soporte', 'Support Agent']
    }
  ];
  var TRACE = {
    start: ['Inicio', 'Start'],
    intent: ['Detectar intención', 'Detect intent']
  };

  function initFlowHero() {
    var root = $('#flowHero');
    if (!root) return;
    var canvas = $('#fwCanvas'), edgesSvg = $('#fwEdges');
    var chat = $('#fwChat'), trace = $('#fwTrace');
    var plate = $('#fwPlate'), cta = $('#fwCta');
    if (!canvas || !edgesSvg || !chat) return;

    var nodes = {};
    $$('.fw-node', canvas).forEach(function (n) { nodes[n.getAttribute('data-node')] = n; });
    var EDGE_COLOR = { teal: '#14B8A6', blue: '#3B82F6', violet: '#8B5CF6' };
    var edges = [];   /* {from,to,base,flow,color} */
    var packet = null;

    /* ---------- edge geometry ---------- */
    function anchor(el, side) {
      var c = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
      return {
        x: (side === 'r' ? r.right : r.left) - c.left,
        y: r.top + r.height / 2 - c.top
      };
    }
    function bezier(a, b) {
      var dx = Math.max(36, (b.x - a.x) * 0.5);
      return 'M' + a.x + ' ' + a.y + ' C ' + (a.x + dx) + ' ' + a.y + ', ' + (b.x - dx) + ' ' + b.y + ', ' + b.x + ' ' + b.y;
    }
    function mkPath(cls, color) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('class', cls);
      if (color) p.setAttribute('stroke', color);
      edgesSvg.appendChild(p);
      return p;
    }
    function drawEdges() {
      edgesSvg.innerHTML = '';
      edges = [];
      var w = canvas.clientWidth, h = canvas.clientHeight;
      edgesSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      edgesSvg.setAttribute('width', w);
      edgesSvg.setAttribute('height', h);
      var pairs = [
        ['start', 'intent', '#94A3B8'],
        ['intent', 'ventas', EDGE_COLOR.teal],
        ['intent', 'cobros', EDGE_COLOR.blue],
        ['intent', 'soporte', EDGE_COLOR.violet]
      ];
      pairs.forEach(function (pr) {
        var a = anchor(nodes[pr[0]], 'r'), b = anchor(nodes[pr[1]], 'l');
        var d = bezier(a, b);
        var base = mkPath('fw-e-base', null); base.setAttribute('d', d);
        var flow = mkPath('fw-e-flow', pr[2]); flow.setAttribute('d', d);
        edges.push({ from: pr[0], to: pr[1], base: base, flow: flow });
      });
      packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      packet.setAttribute('class', 'fw-packet');
      packet.setAttribute('r', '4');
      packet.setAttribute('opacity', '0');
      edgesSvg.appendChild(packet);
    }
    function edge(from, to) {
      for (var i = 0; i < edges.length; i++) if (edges[i].from === from && edges[i].to === to) return edges[i];
      return null;
    }

    /* ---------- scheduler (cancellable) ---------- */
    var timers = [], rafs = [], running = false, visible = true, sceneIdx = 0;
    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearAll() {
      timers.forEach(clearTimeout); timers = [];
      rafs.forEach(cancelAnimationFrame); rafs = [];
    }

    /* ---------- packet travel along a path ---------- */
    function travel(path, dur, color, done) {
      var len = path.getTotalLength();
      packet.setAttribute('fill', color || '#14B8A6');
      packet.setAttribute('opacity', '1');
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var pt = path.getPointAtLength(len * k);
        packet.setAttribute('cx', pt.x); packet.setAttribute('cy', pt.y);
        if (k < 1) { rafs.push(requestAnimationFrame(step)); }
        else { packet.setAttribute('opacity', '0'); if (done) done(); }
      }
      rafs.push(requestAnimationFrame(step));
    }

    /* ---------- typewriter ---------- */
    function typeInto(el, text, cps, done) {
      var i = 0, n = text.length, per = Math.max(8, 1000 / cps);
      function tick() {
        i = Math.min(n, i + 1);
        el.textContent = text.slice(0, i);
        chat.scrollTop = chat.scrollHeight;
        if (i < n) later(tick, per); else if (done) later(done, 120);
      }
      tick();
    }

    /* ---------- chat helpers ---------- */
    function userMsg(sc) {
      var d = document.createElement('div');
      d.className = 'fwc-msg'; d.setAttribute('data-side', 'user');
      d.innerHTML = '<span class="fwc-t mono"></span><p></p>';
      d.querySelector('.fwc-t').textContent = sc.time;
      chat.appendChild(d);
      return d.querySelector('p');
    }
    function botTyping() {
      var d = document.createElement('div');
      d.className = 'fwc-msg fwc-typing'; d.setAttribute('data-side', 'bot');
      d.innerHTML = '<img class="fwc-ava" src="img/logo-badge-48.png" alt="" width="26" height="26"><p><span class="fwc-dots"><i></i><i></i><i></i></span></p>';
      chat.appendChild(d);
      chat.scrollTop = chat.scrollHeight;
      return d;
    }
    function sealMsg(text) {
      var d = document.createElement('div');
      d.className = 'fwc-seal mono';
      d.textContent = text;
      chat.appendChild(d);
      chat.scrollTop = chat.scrollHeight;
    }
    function traceRow(label, cls) {
      var s = document.createElement('span');
      s.className = 'fw-trace-row ' + (cls || '');
      s.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i> <span></span>';
      s.querySelector('span').textContent = label;
      trace.appendChild(s);
      return s;
    }

    /* ---------- node states ---------- */
    function setNode(name, state) {
      var n = nodes[name];
      if (!n) return;
      n.classList.remove('is-running', 'is-done');
      if (state) n.classList.add(state);
    }
    function resetRound() {
      Object.keys(nodes).forEach(function (k) { setNode(k, null); });
      edges.forEach(function (e) { e.flow.classList.remove('on'); });
      chat.innerHTML = '';
      trace.innerHTML = '';
    }

    /* ---------- one scenario ---------- */
    function playScene(sc, next) {
      resetRound();
      plate.textContent = sc.plate[L];
      if (cta) cta.setAttribute('data-agent-slug', sc.slug);

      /* 1. customer types */
      var p = userMsg(sc);
      typeInto(p, sc.user[L], 38, function () {
        /* 2. start fires */
        setNode('start', 'is-running');
        later(function () {
          setNode('start', 'is-done');
          traceRow(TRACE.start[L], 'is-ok');
          var e1 = edge('start', 'intent');
          e1.flow.classList.add('on');
          travel(e1.flow, 700, '#94A3B8', function () {
            /* 3. intent thinks */
            setNode('intent', 'is-running');
            later(function () {
              setNode('intent', 'is-done');
              traceRow(TRACE.intent[L] + ' · ' + sc.node + ' 0.9' + (5 + (sceneIdx % 4)), 'is-ok');
              var e2 = edge('intent', sc.node);
              var color = e2.flow.getAttribute('stroke');
              e2.flow.classList.add('on');
              travel(e2.flow, 850, color, function () {
                /* 4. agent works, bot replies */
                setNode(sc.node, 'is-running');
                var tp = botTyping();
                later(function () {
                  var pp = tp.querySelector('p');
                  pp.innerHTML = '';
                  tp.classList.remove('fwc-typing');
                  typeInto(pp, sc.bot[L], 55, function () {
                    setNode(sc.node, 'is-done');
                    traceRow(sc.agent[L], 'is-ok');
                    sealMsg(sc.seal[L]);
                    later(next, 3400);
                  });
                }, 1300);
              });
            }, 900);
          });
        }, 500);
      });
    }

    function loop() {
      if (!running || !visible) return;
      var sc = SCENES[sceneIdx % SCENES.length];
      sceneIdx++;
      playScene(sc, function () {
        if (running && visible) loop();
      });
    }

    /* ---------- static end state (reduced motion / initial paint) ---------- */
    function staticState() {
      drawEdges();
      edges.forEach(function (e) { if (e.from === 'start' || e.to === 'ventas') e.flow.classList.add('on-static'); });
      setNode('start', 'is-done'); setNode('intent', 'is-done'); setNode('ventas', 'is-done');
    }

    /* ---------- boot ---------- */
    drawEdges();
    var rsz;
    window.addEventListener('resize', function () {
      clearTimeout(rsz);
      rsz = setTimeout(function () {
        var wasRunning = running;
        clearAll(); resetRound();
        drawEdges();
        if (REDUCED) { staticState(); }
        else if (wasRunning && visible) loop();
      }, 200);
    });

    if (REDUCED) { staticState(); return; }

    /* pause offscreen + tab hidden */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var on = entries[0].isIntersecting;
        if (on && !visible) { visible = true; if (running) loop(); }
        else if (!on && visible) { visible = false; clearAll(); }
      }, { threshold: 0.15 }).observe(root);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearAll(); visible = false; }
      else { visible = true; if (running) loop(); }
    });
    document.addEventListener('optz:lang', function () {
      if (!running) return;
      clearAll(); resetRound();
      if (visible) loop();
    });

    running = true;
    later(loop, 900);
  }

  /* ==========================================================
     2. END-TO-END PROCESS SCROLL (#proc)
     ========================================================== */
  function initProc() {
    var proc = $('#proc');
    if (!proc) return;
    var fill = $('#procFill');
    var nodes = $$('.proc-node', proc);
    var cards = $$('.proc-card', proc);
    var N = cards.length;
    var isNarrow = window.matchMedia('(max-width: 899px)').matches;

    function activate(i) {
      nodes.forEach(function (n, k) { n.classList.toggle('is-on', k <= i); });
      cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      if (fill) fill.style.width = ((i + 1) / N * 100) + '%';
    }

    if (REDUCED || isNarrow || !window.gsap || !window.ScrollTrigger) {
      proc.classList.add('proc-static');
      nodes.forEach(function (n) { n.classList.add('is-on'); });
      cards.forEach(function (c) { c.classList.add('is-on'); });
      if (fill) fill.style.width = '100%';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    activate(0);
    ScrollTrigger.create({
      trigger: proc,
      start: 'top top+=96',
      end: '+=' + (N * 520),
      pin: true,
      scrub: 0.4,
      onUpdate: function (self) {
        var i = Math.min(N - 1, Math.floor(self.progress * N));
        activate(i);
        if (fill) fill.style.width = (self.progress * 100) + '%';
      }
    });
  }

  /* ---------- run ---------- */
  function boot() { initFlowHero(); initProc(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
