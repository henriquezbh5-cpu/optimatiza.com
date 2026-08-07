/* Extraido del HTML: la CSP de este sitio no admite scripts en linea
   (script-src 'self'), asi que vivir aqui es lo que lo hace funcionar. */
(function () {
  'use strict';
  var AUTO = 0.70;      // supuesto declarado: 70% del tiempo se automatiza
  var WEEKS = 4.33;     // semanas por mes
  var WA_BASE = 'https://wa.me/50371928070?text=';

  function $(id) { return document.getElementById(id); }
  var inH = $('in-h'), inP = $('in-p'), inC = $('in-c'), inE = $('in-e'), inCE = $('in-ce');
  var oMes = $('o-mes'), oMesCx = $('o-mes-cx'), oAnio = $('o-anio'),
      oBanda = $('o-banda'), oInvCx = $('o-inv-cx'),
      oAhorro = $('o-ahorro'), resBody = $('res-body'), resEmpty = $('res-empty'),
      waResult = $('wa-result'), waFinal = $('wa-final');

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  // El alcance sugerido depende solo de las horas del equipo; la inversión
  // se cotiza tras la evaluación de alcance, no se estima aquí.
  function band(totalHoursWeek) {
    if (totalHoursWeek < 10) {
      return { label: 'Unidad simple', time: '1–2 semanas' };
    }
    if (totalHoursWeek <= 25) {
      return { label: 'Unidad estándar', time: '2–4 semanas' };
    }
    return { label: 'Célula multi-agente (a evaluar)', time: '4–8 semanas' };
  }

  function calc() {
    var h = parseFloat(inH.value) || 0;
    var p = Math.max(1, Math.floor(parseFloat(inP.value) || 1));
    var c = parseFloat(inC.value) || 0;
    var e = Math.max(0, parseFloat(inE.value) || 0);
    var ce = Math.max(0, parseFloat(inCE.value) || 0);

    if (h <= 0 || c <= 0) {
      resBody.style.display = 'none';
      resEmpty.style.display = 'block';
      return;
    }
    resBody.style.display = 'block';
    resEmpty.style.display = 'none';

    var totalHoursWeek = h * p;
    var timeCostMonth = totalHoursWeek * c * WEEKS;
    var errCostMonth = e * ce;
    var costMonth = timeCostMonth + errCostMonth;
    var costYear = costMonth * 12;
    var savingMonth = timeCostMonth * AUTO; // conservador: no cuenta errores
    var b = band(totalHoursWeek);

    oMes.textContent = money(costMonth) + ' /mes';
    oMesCx.textContent = totalHoursWeek.toLocaleString('en-US') + ' h/semana del equipo a ' + money(c) + '/h' +
      (errCostMonth > 0 ? ' + ' + money(errCostMonth) + ' en errores' : '');
    oAnio.textContent = money(costYear) + ' /año';
    oBanda.textContent = b.label;
    oInvCx.textContent = b.time + ' · pagos por hitos';
    oAhorro.textContent = money(savingMonth) + ' /mes';

    var msg = 'Hola, usé la calculadora de ROI de Optimatiza. Mi proceso manual cuesta ~' + money(costMonth) +
      '/mes (~' + money(costYear) + '/año): ' + h + ' h/sem x ' + p + ' persona(s) a ' + money(c) + '/h' +
      (errCostMonth > 0 ? ' + ' + money(errCostMonth) + '/mes en errores' : '') +
      '. Alcance sugerido: ' + b.label + ' (' + b.time + '). Quiero agendar el diagnóstico ejecutivo sin costo.';
    var href = WA_BASE + encodeURIComponent(msg);
    waResult.href = href;
    waFinal.href = href;
  }

  [inH, inP, inC, inE, inCE].forEach(function (el) {
    el.addEventListener('input', calc);
  });
  calc();
})();
