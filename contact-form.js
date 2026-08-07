/**
 * contact-form.js — defensas del formulario de contacto de Optimatiza.
 *
 * El cliente NO es la línea de defensa real (un script puede saltárselo todo): el filtro
 * serio vive en el Worker `contact-relay`. Lo que hace este archivo es (a) cortar los bots
 * simples que sí ejecutan la página, (b) evitar dobles envíos accidentales de personas
 * reales y (c) dar mensajes de error claros en vez de un fallo mudo.
 *
 * Se activa sobre cualquier <form data-secure-form> y lee su configuración de data-*:
 *   data-relay     URL del Worker (si falta, envía al fallback y avisa por consola)
 *   data-fallback  endpoint de respaldo mientras el relay no esté desplegado
 *   data-turnstile site key de Cloudflare Turnstile (si está vacía, no se renderiza el reto)
 */
(function () {
  'use strict';

  var MIN_FILL_MS = 3000;        // time-trap local (el real lo valida el servidor)
  var COOLDOWN_MS = 60000;       // un envío por minuto desde este navegador
  var LS_KEY = 'optz-last-submit';

  var BAD_DOMAINS = [
    'test.com', 'test.net', 'test.org', 'testing.com', 'prueba.com',
    'example.com', 'example.net', 'example.org', 'domain.com', 'email.com',
    'mailinator.com', 'guerrillamail.com', 'sharklasers.com', '10minutemail.com',
    'tempmail.com', 'temp-mail.org', 'yopmail.com', 'throwawaymail.com',
    'trashmail.com', 'dispostable.com', 'getnada.com', 'maildrop.cc',
    'fakeinbox.com', 'mailnesia.com', 'spam4.me', 'grr.la', 'mailcatch.com'
  ];
  var BAD_TLDS = ['.test', '.invalid', '.local', '.localhost', '.example'];
  var EMAIL_RE = /^[^\s@,;:<>()[\]\\]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
  var PHONE_RE = /^[+()\d][\d\s().+-]{5,24}$/;
  var SEQ_NAME = /^(test|prueba|demo|user|usuario|asdf|qwerty|lorem)[\s._-]*\d*$/i;
  var SEQ_LOCAL = /^(test|prueba|demo|user|usuario|fake|dummy|noreply|admin)[\s._-]*\d+$/i;

  var ERRORS = {
    origen_no_permitido: 'No fue posible verificar el origen de la solicitud. Recargue la página e inténtelo de nuevo.',
    demasiado_rapido: 'El envío se registró demasiado rápido. Espere unos segundos e inténtelo de nuevo.',
    nonce_invalido: 'La sesión del formulario expiró. Recargue la página e inténtelo de nuevo.',
    nonce_expirado: 'La sesión del formulario expiró. Recargue la página e inténtelo de nuevo.',
    nonce_reutilizado: 'Esta solicitud ya fue enviada.',
    captcha_faltante: 'Complete la verificación de seguridad antes de enviar.',
    captcha_invalido: 'La verificación de seguridad no se completó. Inténtelo de nuevo.',
    limite_hora: 'Recibimos varias solicitudes suyas en la última hora. Escríbanos por WhatsApp si es urgente.',
    limite_dia: 'Alcanzó el límite de solicitudes por hoy. Escríbanos por WhatsApp si es urgente.',
    proveedor_no_disponible: 'No pudimos entregar su solicitud en este momento. Escríbanos por WhatsApp.',
    relay_sin_configurar: 'El formulario está en mantenimiento. Escríbanos por WhatsApp mientras tanto.'
  };

  /* No todos los formularios del sitio nombran igual sus campos: /contacto/ usa
     nombre/correo/mensaje y /agentes/ usa name/_replyto/message. El Worker ya acepta
     ambos juegos; el cliente debe hacer lo mismo o la validacion falla siempre y el
     formulario nunca llega a enviarse. */
  var ALIAS = {
    nombre: ['nombre', 'name'],
    correo: ['correo', '_replyto', 'email'],
    mensaje: ['mensaje', 'message'],
    empresa: ['empresa', 'company'],
    telefono: ['telefono', 'phone'],
    consentimiento: ['consentimiento', 'consent']
  };
  function q(form, name) {
    var nombres = ALIAS[name] || [name];
    for (var i = 0; i < nombres.length; i++) {
      var el = form.querySelector('[name="' + nombres[i] + '"]');
      if (el) return el;
    }
    return null;
  }
  function val(form, name) { var el = q(form, name); return el ? String(el.value || '').trim() : ''; }

  function setNote(note, text, kind) {
    if (!note) return;
    note.textContent = text;
    note.classList.remove('ok', 'err');
    if (kind) note.classList.add(kind);
  }

  function focusField(form, name) {
    var el = q(form, name);
    if (el && typeof el.focus === 'function') { el.focus(); }
  }

  /** Validación equivalente a la del servidor, para dar feedback inmediato. */
  function validate(form) {
    var nombre = val(form, 'nombre');
    var empresa = val(form, 'empresa');
    var correo = val(form, 'correo').toLowerCase();
    var telefono = val(form, 'telefono');
    var mensaje = val(form, 'mensaje');
    var consent = q(form, 'consentimiento');

    if (nombre.length < 3 || !/[a-záéíóúñü]{2,}/i.test(nombre) || SEQ_NAME.test(nombre)) {
      return { campo: 'nombre', motivo: 'Indique su nombre completo.' };
    }
    // Solo se exige si el formulario realmente tiene el campo: /agentes/ no lo pide.
    if (q(form, 'empresa') && empresa.length < 2) {
      return { campo: 'empresa', motivo: 'Indique el nombre de su empresa.' };
    }
    if (!EMAIL_RE.test(correo)) {
      return { campo: 'correo', motivo: 'Escriba un correo electrónico válido.' };
    }
    var parts = correo.split('@');
    var domain = parts[1] || '';
    var isBadTld = BAD_TLDS.some(function (t) { return domain.slice(-t.length) === t; });
    if (BAD_DOMAINS.indexOf(domain) !== -1 || isBadTld || SEQ_LOCAL.test(parts[0])) {
      return { campo: 'correo', motivo: 'Use un correo corporativo real para poder responderle.' };
    }
    if (telefono && !PHONE_RE.test(telefono)) {
      return { campo: 'telefono', motivo: 'El teléfono no tiene un formato válido.' };
    }
    if (mensaje.length < 30) {
      return { campo: 'mensaje', motivo: 'Describa su caso con al menos 30 caracteres para poder prepararnos.' };
    }
    if (consent && !consent.checked) {
      return { campo: 'consentimiento', motivo: 'Debe autorizar el uso de sus datos para poder responderle.' };
    }
    return null;
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      // Los campos con guion bajo son internos y no se envian, salvo la trampa
      // _gotcha: el Worker la comprueba, asi que tiene que viajar.
      if (!el.name || el.type === 'submit') return;
      if (el.name.charAt(0) === '_' && el.name !== '_gotcha') return;
      if (el.type === 'checkbox') { data[el.name] = el.checked; return; }
      data[el.name] = String(el.value || '').trim();
    });
    return data;
  }

  function init(form) {
    var relay = form.getAttribute('data-relay') || '';
    var fallback = form.getAttribute('data-fallback') || form.getAttribute('action') || '';
    var siteKey = form.getAttribute('data-turnstile') || '';
    var btn = form.querySelector('button[type="submit"], input[type="submit"]');
    var note = form.querySelector('.cf-note');
    var noteText = note ? note.textContent : '';
    var loadedAt = Date.now();
    var nonce = '';
    var sending = false;

    // El navegador ya no envía el formulario por su cuenta: todo pasa por aquí.
    form.removeAttribute('action');

    // Honeypot: invisible para una persona, irresistible para un bot que rellena todo.
    var trap = document.createElement('div');
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden';
    trap.innerHTML =
      '<label>No complete este campo<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label>' +
      '<label>Sitio web<input type="text" name="website" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(trap);

    // Nonce del servidor: arranca el time-trap con un reloj que el cliente no controla.
    if (relay) {
      fetch(relay.replace(/\/$/, '') + '/nonce', { credentials: 'omit' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.nonce) nonce = d.nonce; })
        .catch(function () { /* sin nonce el servidor rechaza; se avisa al enviar */ });
    }

    // Turnstile: se carga solo si hay site key, para no pedir red sin necesidad.
    if (siteKey) {
      var holder = document.createElement('div');
      holder.className = 'cf-turnstile';
      holder.setAttribute('data-sitekey', siteKey);
      holder.setAttribute('data-theme', 'light');
      holder.style.margin = '4px 0 14px';
      if (btn && btn.parentNode) btn.parentNode.insertBefore(holder, btn);
      else form.appendChild(holder);
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (sending) return;

      // Time-trap local.
      if (Date.now() - loadedAt < MIN_FILL_MS) {
        setNote(note, 'Espere un momento antes de enviar la solicitud.', 'err');
        return;
      }
      // Enfriamiento entre envíos desde este navegador.
      try {
        var last = Number(localStorage.getItem(LS_KEY) || 0);
        if (last && Date.now() - last < COOLDOWN_MS) {
          var wait = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
          setNote(note, 'Ya enviamos su solicitud. Espere ' + wait + ' s antes de enviar otra.', 'err');
          return;
        }
      } catch (e) { /* modo privado: seguimos, el servidor también limita */ }

      var invalid = validate(form);
      if (invalid) {
        setNote(note, invalid.motivo, 'err');
        focusField(form, invalid.campo);
        return;
      }

      var data = collect(form);
      data.nonce = nonce;
      if (window.turnstile && siteKey) {
        try { data.turnstileToken = window.turnstile.getResponse(); } catch (e) { data.turnstileToken = ''; }
        if (!data.turnstileToken) {
          setNote(note, ERRORS.captcha_faltante, 'err');
          return;
        }
      }

      sending = true;
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Enviando…'; }
      setNote(note, 'Enviando su solicitud…', null);

      var url = relay || fallback;
      var isRelay = !!relay;
      var body = isRelay ? JSON.stringify(data) : JSON.stringify(data);

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body,
        credentials: 'omit'
      })
        .then(function (r) {
          return r.json().catch(function () { return { ok: r.ok }; })
            .then(function (d) { return { status: r.status, data: d }; });
        })
        .then(function (res) {
          var d = res.data || {};
          var success = res.status >= 200 && res.status < 300 && (d.ok !== false);
          if (success) {
            try { localStorage.setItem(LS_KEY, String(Date.now())); } catch (e) {}
            form.reset();
            if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
            if (btn) { btn.textContent = 'Solicitud enviada'; }
            setNote(note, 'Recibimos su solicitud. Le confirmamos la recepción dentro de un día hábil.', 'ok');
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'form_submit', { form: 'contacto' });
            }
            return;
          }
          var code = d.error || 'error';
          var msg = ERRORS[code] || (d.motivo || 'No pudimos enviar su solicitud. Escríbanos por WhatsApp.');
          setNote(note, msg, 'err');
          if (d.campo) focusField(form, d.campo);
          // El token de Turnstile es de un solo uso y el servidor ya lo canjeó: si no
          // se reinicia, el segundo intento muere con 'timeout-or-duplicate' y el
          // formulario queda inservible hasta recargar la página.
          if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Enviar solicitud'; }
          sending = false;
          // El nonce se consume aunque falle: pedimos otro para el siguiente intento.
          if (relay) {
            fetch(relay.replace(/\/$/, '') + '/nonce', { credentials: 'omit' })
              .then(function (r) { return r.json(); })
              .then(function (n) { if (n && n.nonce) nonce = n.nonce; })
              .catch(function () {});
          }
        })
        .catch(function () {
          setNote(note, 'No hubo conexión con el servidor. Escríbanos por WhatsApp: +503 7192 8070.', 'err');
          // No se sabe si el servidor llegó a canjear el token: se reinicia por si acaso.
          if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Enviar solicitud'; }
          sending = false;
        });
    });

    // Al escribir de nuevo, el aviso vuelve a su texto informativo.
    form.addEventListener('input', function () {
      if (note && note.classList.contains('err')) setNote(note, noteText, null);
    });
  }

  var forms = document.querySelectorAll('form[data-secure-form]');
  Array.prototype.forEach.call(forms, init);
})();
