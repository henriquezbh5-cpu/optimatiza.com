// Simulador de inversion de /precios/ — extraido del home al reposicionar el sitio.
(function () {
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
