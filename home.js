// Home ligera de Optimatiza — cotizador de rangos publicados + año del footer.
(function () {
  var yy = document.getElementById('yy');
  if (yy) yy.textContent = new Date().getFullYear();

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
