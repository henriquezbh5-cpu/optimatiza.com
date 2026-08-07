/* Extraido del HTML: la CSP de este sitio no admite scripts en linea
   (script-src 'self'), asi que vivir aqui es lo que lo hace funcionar. */
var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var $id = function (id) { return document.getElementById(id); };
  var citas = $id('citas'), citasN = $id('citasN'),
      tasa = $id('tasa'),
      valor = $id('valor'), valorN = $id('valorN');

  function calc() {
    // Fuente de verdad: los inputs numéricos (permiten valores fuera del rango del slider)
    var C = Math.max(0, +citasN.value || 0),
        p = +tasa.value / 100,
        V = Math.max(0, +valorN.value || 0);
    var perdidas = C * p;
    var mes = perdidas * V;
    var anio = mes * 12;
    $id('vCitas').textContent = C.toLocaleString('en-US');
    $id('vTasa').textContent = tasa.value + '%';
    $id('vValor').textContent = fmt(V);
    $id('big').textContent = fmt(mes);
    $id('mCitas').textContent = '≈ ' + Math.round(perdidas).toLocaleString('en-US') + ' citas';
    $id('mAnio').textContent = fmt(anio);
    // CTA de WhatsApp precargado con el resultado que calculó la persona
    var msg = 'Hola, calculé mis pérdidas por inasistencia en la web: ~' +
      Math.round(perdidas).toLocaleString('en-US') + ' citas perdidas al mes (' +
      fmt(mes) + '/mes, ' + fmt(anio) + '/año, con ' + tasa.value +
      '% de inasistencia). Quiero agendar el diagnóstico ejecutivo sin costo para mi clínica.';
    $id('waCta').href = 'https://wa.me/50371928070?text=' + encodeURIComponent(msg);
  }

  function clampToRange(range, v) {
    return Math.min(+range.max, Math.max(+range.min, v));
  }

  // slider <-> input numérico (citas)
  citas.addEventListener('input', function () { citasN.value = citas.value; calc(); });
  citasN.addEventListener('input', function () {
    var v = Math.max(0, +citasN.value || 0);
    citas.value = clampToRange(citas, v);
    calc();
  });
  // slider <-> input numérico (valor de cita)
  valor.addEventListener('input', function () { valorN.value = valor.value; calc(); });
  valorN.addEventListener('input', function () {
    var v = Math.max(0, +valorN.value || 0);
    valor.value = clampToRange(valor, v);
    calc();
  });
  tasa.addEventListener('input', calc);
  calc();
