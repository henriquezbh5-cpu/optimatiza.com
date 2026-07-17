// Home ligera de Optimatiza — cotizador de rangos publicados + tabs + año del footer.
(function () {
  var yy = document.getElementById('yy');
  if (yy) yy.textContent = new Date().getFullYear();

  // flujo en vivo del hero: corre de inicio a fin y vuelve a empezar
  (function () {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.fnode'));
    if (!nodes.length) return;
    var lines = Array.prototype.slice.call(document.querySelectorAll('.fline'));
    var res = document.getElementById('fres');
    var apr = document.getElementById('faprOk');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setSt(n, txt) { var s = n.querySelector('.fst'); if (s) s.textContent = txt; }

    if (reduce) { // sin animacion: mostrar el flujo completado
      nodes.forEach(function (n) { n.classList.add('done'); setSt(n, n.dataset.done || '✓ completado'); });
      if (apr) apr.classList.add('hit');
      if (res) res.classList.add('on');
      return;
    }

    var DUR = [1500, 2100, 1900, 2500, 1700, 1900]; // ms por nodo
    function reset() {
      nodes.forEach(function (n) { n.classList.remove('run', 'done'); setSt(n, 'en espera'); });
      lines.forEach(function (l) { l.classList.remove('go'); });
      if (res) res.classList.remove('on');
      if (apr) apr.classList.remove('hit');
    }
    function step(i) {
      if (i >= nodes.length) {
        if (res) res.classList.add('on');
        setTimeout(function () { reset(); setTimeout(function () { step(0); }, 800); }, 4500);
        return;
      }
      var n = nodes[i], t = DUR[i] || 1700;
      n.classList.add('run');
      setSt(n, n.dataset.run || 'procesando…');
      if (n.dataset.approve && apr) setTimeout(function () { apr.classList.add('hit'); }, t - 900);
      setTimeout(function () {
        n.classList.remove('run'); n.classList.add('done');
        setSt(n, n.dataset.done || '✓ completado');
        if (lines[i]) lines[i].classList.add('go');
        setTimeout(function () { step(i + 1); }, 560);
      }, t);
    }
    setTimeout(function () { step(0); }, 900);
  })();

  // "Hablar con Nova" abre el chat del sitio
  var tryNova = document.getElementById('tryNova');
  if (tryNova) tryNova.addEventListener('click', function (e) {
    e.preventDefault();
    var fab = document.getElementById('nvFab');
    if (fab) { fab.click(); } else { location.href = 'https://wa.me/50371928070'; }
  });

  // formulario de contacto: envia por fetch y confirma en la misma pagina
  var cform = document.getElementById('cform');
  if (cform) cform.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = document.getElementById('cfBtn'), note = document.getElementById('cfNote');
    btn.disabled = true; btn.textContent = 'Enviando…';
    fetch(cform.action, {
      method: 'POST',
      body: new FormData(cform),
      headers: { 'Accept': 'application/json' }
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      cform.reset();
      btn.textContent = '✓ Enviado';
      note.textContent = '¡Recibido! Te respondemos en horas por el medio que dejaste.';
      note.classList.add('ok');
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Enviar — te respondemos en horas';
      note.textContent = 'No se pudo enviar. Escríbenos directo por WhatsApp: +503 7192 8070.';
    });
  });

  // tabs "Por que elegir Optimatiza"
  var tabs = document.querySelectorAll('#wtabs .wtab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); });
      document.querySelectorAll('.wpanel').forEach(function (p) { p.classList.remove('on'); });
      tab.classList.add('on');
      var panel = document.getElementById(tab.dataset.w);
      if (panel) panel.classList.add('on');
    });
  });

  var boxes = document.querySelectorAll('#pick input');
  var rng = document.getElementById('rng');
  var wa = document.getElementById('cotWa');
  if (!boxes.length || !rng || !wa) return;

  function fmt(n) { return '$' + n.toLocaleString('en-US'); }

  function upd() {
    var lo = 0, hi = 0, names = [];
    boxes.forEach(function (b) {
      b.closest('label').classList.toggle('on', b.checked);
      if (b.checked) { lo += +b.dataset.lo; hi += +b.dataset.hi; names.push(b.dataset.n); }
    });
    if (!names.length) {
      rng.textContent = 'Selecciona un agente';
      wa.href = 'https://wa.me/50371928070?text=' +
        encodeURIComponent('Hola, quiero cotizar un agente para mi negocio.');
      return;
    }
    rng.textContent = fmt(lo) + ' – ' + fmt(hi);
    var msg = 'Hola, arme mi equipo en el cotizador: ' + names.join(' + ') +
      ' (rango publicado ' + fmt(lo) + '–' + fmt(hi) +
      '). Quiero el diagnostico gratis para la cotizacion exacta.';
    wa.href = 'https://wa.me/50371928070?text=' + encodeURIComponent(msg);
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); });

  // ---- simulador con texto libre (worker quote-ai; fallback local) ----
  var aiGo = document.getElementById('aiGo');
  if (aiGo) {
    var BANDS = {
      small: { lo: 600, hi: 1200, t: '1–2 semanas' },
      medium: { lo: 1200, hi: 3000, t: '2–4 semanas' },
      large: { lo: 3000, hi: 8000, t: '4–8 semanas' }
    };
    var TYPES = {
      automatizacion: 'Flujo automático · Power Automate / n8n',
      agente: 'Agente de IA', celula: 'Célula multi-agente', bi: 'Reportes / BI automático',
      website: 'Desarrollo web', webapp: 'Agente de IA', mobile: 'Desarrollo a la medida',
      fullstack: 'Célula multi-agente', automation: 'Flujo automático · Power Automate / n8n',
      bitcoin: 'Automatización Bitcoin'
    };
    aiGo.addEventListener('click', function () {
      var desc = (document.getElementById('aiDesc').value || '').trim();
      if (desc.length < 15) {
        document.getElementById('aiDesc').focus();
        return;
      }
      aiGo.disabled = true; aiGo.textContent = 'Analizando…';
      var ctl = new AbortController();
      var timer = setTimeout(function () { ctl.abort(); }, 12000);
      fetch('https://quote-ai.henriquezbh5.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, lang: 'es' }),
        signal: ctl.signal
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { showAi(d.type, d.complexity, d.reasoning || ''); })
        .catch(function () { // fallback local honesto por tamano de la descripcion
          var c = desc.length > 420 ? 'large' : (desc.length > 160 ? 'medium' : 'small');
          showAi('automatizacion', c, 'Estimación local aproximada por el alcance descrito (el analizador no respondió).');
        })
        .finally(function () {
          clearTimeout(timer);
          aiGo.disabled = false; aiGo.textContent = 'Simular precio estimado';
        });
      function showAi(type, cx, why) {
        var band = BANDS[cx] || BANDS.medium;
        var label = TYPES[type] || 'Automatización';
        document.getElementById('aiTipo').textContent = label + ' · ' + band.t;
        document.getElementById('aiRng').textContent = fmt(band.lo) + ' – ' + fmt(band.hi);
        document.getElementById('aiWhy').textContent = why;
        document.getElementById('aiRes').hidden = false;
        var msg = 'Hola, simulé mi caso en el cotizador: "' + desc.slice(0, 220) + '"' +
          ' (estimado ' + label + ', ' + fmt(band.lo) + '–' + fmt(band.hi) + '). Quiero el diagnóstico gratis.';
        wa.href = 'https://wa.me/50371928070?text=' + encodeURIComponent(msg);
      }
    });
  }
})();
