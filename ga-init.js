// GA4 init + eventos de conversion (CSP-safe: archivo externo, sin inline).
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-X9Q41BJNY8');

(function () {
  // Conversion primaria: clic a WhatsApp (cualquier CTA wa.me), con pagina y texto del boton
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"]') : null;
    if (a) {
      gtag('event', 'wa_click', {
        page_path: location.pathname,
        link_text: (a.textContent || '').trim().slice(0, 60)
      });
    }
  });

  // Formulario de contacto (Formspree)
  var f = document.getElementById('cform');
  if (f) {
    var started = false;
    f.addEventListener('input', function () {
      if (!started) { started = true; gtag('event', 'form_start', { form: 'contacto' }); }
    });
    f.addEventListener('submit', function () {
      gtag('event', 'form_submit', { form: 'contacto' });
    });
  }

  // Uso de calculadoras (paginas /calculadora* y /recursos/calculadora*)
  if (location.pathname.indexOf('calculadora') !== -1) {
    var sent = false;
    document.addEventListener('click', function (e) {
      if (!sent && e.target && e.target.closest && e.target.closest('button')) {
        sent = true;
        gtag('event', 'calc_use', { page_path: location.pathname });
      }
    });
  }

  // Vista de la muestra del informe IC
  if (location.pathname.indexOf('informe-muestra') !== -1) {
    gtag('event', 'informe_muestra_view', { page_path: location.pathname });
  }
})();
