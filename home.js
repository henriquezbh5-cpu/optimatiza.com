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
})();
