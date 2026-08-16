// Home de Optimatiza — año del footer, flujos en vivo y acceso al chat.
(function () {
  var yy = document.getElementById('yy');
  if (yy) yy.textContent = new Date().getFullYear();

  // Flujos en vivo: cada ventana .fwin corre su propia secuencia en bucle,
  // independiente de las demás (el home muestra dos a la vez; el dossier, una).
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('.fwin'), function (win) {
    var nodes = Array.prototype.slice.call(win.querySelectorAll('.fnode'));
    if (!nodes.length) return;
    var lines = Array.prototype.slice.call(win.querySelectorAll('.fline'));
    var res = win.querySelector('.fres');
    var apr = win.querySelector('.fbtn.ok');

    function setSt(n, txt) { var s = n.querySelector('.fst'); if (s) s.textContent = txt; }

    if (reduce) { // sin animación: mostrar el flujo completado
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
  });

  // "Hablar con NOVA" abre el chat del sitio
  var tryNova = document.getElementById('tryNova');
  if (tryNova) tryNova.addEventListener('click', function (e) {
    e.preventDefault();
    var fab = document.getElementById('nvFab');
    if (fab) { fab.click(); } else { location.href = 'https://wa.me/50371928070'; }
  });
})();
