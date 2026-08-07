/* Optimatiza — interacciones de las páginas corporativas.
   Sin dependencias, sin recursos externos: la CSP solo admite 'self'.
   Cada bloque comprueba que su marcado exista antes de actuar, así que la
   página funciona igual si el script no llega a cargar. */
(function () {
  'use strict';

  /* Se marca el documento de inmediato: hasta que esta clase existe, el CSS no
     oculta nada. Asi una seccion nunca queda invisible si el script no llega. */
  document.documentElement.classList.add('js');

  var sinMovimiento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Aparición al entrar en pantalla ----------
     La clase .reveal empieza atenuada y sube al hacerse visible. */
  function revelar() {
    var piezas = document.querySelectorAll('.reveal');
    if (!piezas.length) return;
    if (sinMovimiento || !('IntersectionObserver' in window)) {
      piezas.forEach(function (p) { p.classList.add('is-in'); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 5% 0px', threshold: 0 });
    piezas.forEach(function (p) { obs.observe(p); });
    // Red de seguridad: pase lo que pase con el observador, a los 3 s todo es visible.
    // Un bloque de contenido nunca puede quedarse oculto por una animación.
    setTimeout(function () {
      piezas.forEach(function (p) { p.classList.add('is-in'); });
    }, 3000);
  }

  /* ---------- 2. Cifras que cuentan al aparecer ----------
     <b class="count" data-to="94" data-suffix="%">94%</b> */
  function contadores() {
    var nums = document.querySelectorAll('.count[data-to]');
    if (!nums.length) return;
    function pintar(el, v) {
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      el.textContent = (el.getAttribute('data-prefix') || '') +
        v.toFixed(dec) + (el.getAttribute('data-suffix') || '');
    }
    function correr(el) {
      var fin = parseFloat(el.getAttribute('data-to'));
      if (isNaN(fin)) return;
      if (sinMovimiento) { pintar(el, fin); return; }
      var ini = null, dur = 1100;
      function paso(t) {
        if (ini === null) ini = t;
        var p = Math.min((t - ini) / dur, 1);
        pintar(el, fin * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(correr); return; }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { correr(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { obs.observe(n); });
  }

  /* ---------- 3. Pestañas accesibles ----------
     <div class="tabs"><div role="tablist">
       <button role="tab" aria-controls="p1">…</button></div>
       <div id="p1" role="tabpanel">…</div></div> */
  function pestanas() {
    document.querySelectorAll('.tabs').forEach(function (caja) {
      var botones = [].slice.call(caja.querySelectorAll('[role="tab"]'));
      if (!botones.length) return;
      var paneles = botones.map(function (b) {
        return caja.querySelector('#' + b.getAttribute('aria-controls'));
      });
      function activar(i, mover) {
        botones.forEach(function (b, j) {
          var on = i === j;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
          if (paneles[j]) paneles[j].hidden = !on;
        });
        if (mover) botones[i].focus();
      }
      botones.forEach(function (b, i) {
        b.addEventListener('click', function () { activar(i, false); });
        b.addEventListener('keydown', function (ev) {
          var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          ev.preventDefault();
          activar((i + d + botones.length) % botones.length, true);
        });
      });
      activar(0, false);
    });
  }

  /* ---------- 4. Copiar un prompt al portapapeles ---------- */
  function copiar() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var origen = document.getElementById(btn.getAttribute('data-copy'));
        if (!origen) return;
        var texto = origen.innerText;
        var listo = function () {
          var antes = btn.textContent;
          btn.textContent = 'Copiado';
          btn.classList.add('is-ok');
          setTimeout(function () { btn.textContent = antes; btn.classList.remove('is-ok'); }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(texto).then(listo, function () {});
        } else {
          var ta = document.createElement('textarea');
          ta.value = texto; ta.setAttribute('readonly', '');
          ta.style.position = 'absolute'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); listo(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------- 5. Simulador de umbral ----------
     <div class="tripsim" data-umbral="18" data-unidad="%"> con un input[type=range]
     y un [data-estado] donde se pinta el veredicto. */
  function simulador() {
    document.querySelectorAll('.tripsim').forEach(function (caja) {
      var mando = caja.querySelector('input[type="range"]');
      var valor = caja.querySelector('[data-valor]');
      var estado = caja.querySelector('[data-estado]');
      if (!mando || !estado) return;
      var umbral = parseFloat(caja.getAttribute('data-umbral'));
      var unidad = caja.getAttribute('data-unidad') || '';
      var accion = caja.getAttribute('data-accion') || '';
      var duenio = caja.getAttribute('data-responsable') || '';
      // Se construyen nodos en vez de asignar innerHTML: nada de lo que entra aqui
      // puede interpretarse como marcado, pase lo que pase con los data-*.
      function escribir(titulo, resto) {
        while (estado.firstChild) estado.removeChild(estado.firstChild);
        var b = document.createElement('b');
        b.textContent = titulo;
        estado.appendChild(b);
        estado.appendChild(document.createTextNode(' ' + resto));
      }
      function pintar() {
        var v = parseFloat(mando.value);
        if (valor) valor.textContent = v + unidad;
        var dispara = v >= umbral;
        var cerca = !dispara && v >= umbral * 0.85;
        caja.setAttribute('data-nivel', dispara ? 'stop' : cerca ? 'watch' : 'go');
        if (dispara) {
          escribir('Se dispara la alerta.', accion + (duenio ? ' Responsable: ' + duenio + '.' : ''));
        } else if (cerca) {
          escribir('Vigilar.', 'El indicador se acerca al umbral de ' + umbral + unidad +
            '; se revisa en la cadencia normal.');
        } else {
          escribir('Dentro de rango.', 'No se hace nada: el umbral está en ' + umbral + unidad + '.');
        }
      }
      mando.addEventListener('input', pintar);
      pintar();
    });
  }

  function iniciar() {
    revelar(); contadores(); pestanas(); copiar(); simulador();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else { iniciar(); }
})();
