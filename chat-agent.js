/* ============================================================
   NOVA — chat agent del sitio (chat-agent.js)
   El propio producto, en vivo: un agente comercial que atiende
   al visitante. Backend: Cloudflare Worker chat-ai (Gemini).
   Vanilla JS, CSP 'self' + connect-src del worker. Solo home.
   ============================================================ */
(function () {
  'use strict';

  var ENDPOINT = 'https://chat-ai.henriquezbh5.workers.dev';
  var WA = 'https://wa.me/50371928070?text=' + encodeURIComponent('Hola, vengo de optimatiza.com y quiero automatizar un proceso.');

  function lang() { try { return localStorage.getItem('preferred-lang') === 'en' ? 1 : 0; } catch (e) { return 0; } }
  var T = {
    open:   ['Habla con Nova', 'Chat with Nova'],
    title:  ['NOVA · AGENTE EN LÍNEA', 'NOVA · AGENT ONLINE'],
    note:   ['Este chat es un agente real de Optimatiza — como los que instalamos.', 'This chat IS a real Optimatiza agent — like the ones we build.'],
    hello:  ['¡Hola! Soy Nova, el agente de Optimatiza. Cuéntame: ¿qué proceso te está comiendo horas en tu negocio?', 'Hi! I’m Nova, Optimatiza’s agent. Tell me: which process is eating your team’s hours?'],
    ph:     ['Escribe tu pregunta…', 'Type your question…'],
    send:   ['Enviar', 'Send'],
    chips:  [['¿Cuánto cuesta un agente?', '¿Qué agentes tienen?', 'Quiero un diagnóstico gratis'],
             ['How much does an agent cost?', 'What agents do you offer?', 'I want a free diagnostic']],
    err:    ['No pude conectar en este momento. Escríbenos directo por WhatsApp y te respondemos en minutos →', 'I couldn’t connect right now. Message us on WhatsApp and we’ll reply in minutes →'],
    wa:     ['Abrir WhatsApp', 'Open WhatsApp'],
    close:  ['Cerrar chat', 'Close chat']
  };
  var t = function (k) { return T[k][lang()] || T[k][0]; };

  /* ---------- DOM ---------- */
  var root = document.createElement('div');
  root.id = 'nova';
  root.innerHTML =
    '<button class="nv-fab" id="nvFab" aria-label="' + t('open') + '" aria-expanded="false">' +
      '<img src="img/logo-badge-96.png" alt="" width="46" height="46"><span class="nv-dot" aria-hidden="true"></span>' +
    '</button>' +
    '<div class="nv-panel" id="nvPanel" role="dialog" aria-label="Nova" hidden>' +
      '<header class="nv-head mono">' +
        '<span class="nv-title" id="nvTitle"></span>' +
        '<button class="nv-x" id="nvX" aria-label="' + t('close') + '">✕</button>' +
      '</header>' +
      '<p class="nv-note mono" id="nvNote"></p>' +
      '<div class="nv-log" id="nvLog" role="log" aria-live="polite"></div>' +
      '<div class="nv-chips" id="nvChips"></div>' +
      '<form class="nv-input" id="nvForm">' +
        '<input id="nvText" autocomplete="off" maxlength="600">' +
        '<button type="submit" class="nv-send mono" id="nvSend"></button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(root);

  var fab = document.getElementById('nvFab'), panel = document.getElementById('nvPanel');
  var log = document.getElementById('nvLog'), chipsEl = document.getElementById('nvChips');
  var form = document.getElementById('nvForm'), input = document.getElementById('nvText');
  var history = [], busy = false, greeted = false;

  function applyLang() {
    document.getElementById('nvTitle').textContent = t('title');
    document.getElementById('nvNote').textContent = t('note');
    document.getElementById('nvSend').textContent = t('send');
    input.placeholder = t('ph');
    fab.setAttribute('aria-label', t('open'));
    renderChips();
  }
  document.addEventListener('optz:lang', applyLang);

  function renderChips() {
    if (history.length > 1) { chipsEl.innerHTML = ''; return; }
    chipsEl.innerHTML = '';
    t('chips').forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'nv-chip mono'; b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { input.value = c; form.dispatchEvent(new Event('submit')); });
      chipsEl.appendChild(b);
    });
  }

  function msg(side, text, html) {
    var d = document.createElement('div');
    d.className = 'nv-msg nv-' + side;
    if (side === 'bot') d.innerHTML = '<img class="nv-ava" src="img/logo-badge-48.png" alt="" width="24" height="24"><p></p>';
    else d.innerHTML = '<p></p>';
    var p = d.querySelector('p');
    if (html) p.innerHTML = text; else p.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    return p;
  }
  function typing(on) {
    var el = document.getElementById('nvTyping');
    if (on && !el) {
      var d = document.createElement('div');
      d.className = 'nv-msg nv-bot'; d.id = 'nvTyping';
      d.innerHTML = '<img class="nv-ava" src="img/logo-badge-48.png" alt="" width="24" height="24"><p><span class="nv-dots"><i></i><i></i><i></i></span></p>';
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    } else if (!on && el) el.remove();
  }

  function toggle(open) {
    var show = open !== undefined ? open : panel.hidden;
    panel.hidden = !show;
    fab.setAttribute('aria-expanded', String(show));
    if (show) {
      if (!greeted) { greeted = true; msg('bot', t('hello')); history.push({ role: 'model', content: t('hello') }); }
      input.focus();
    }
  }
  fab.addEventListener('click', function () { toggle(); });
  document.getElementById('nvX').addEventListener('click', function () { toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) toggle(false); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    msg('user', text);
    history.push({ role: 'user', content: text });
    renderChips();
    busy = true; typing(true);
    function attempt(retriesLeft) {
      var ctl = new AbortController();
      var timer = setTimeout(function () { ctl.abort(); }, 25000);
      return fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-14) }),
        signal: ctl.signal
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { if (!d.reply) throw new Error('empty'); return d; })
        .catch(function (e) {
          if (retriesLeft > 0) { /* Gemini free tier: 503 transitorio — reintenta en silencio */
            return new Promise(function (res) { setTimeout(res, 2500); })
              .then(function () { return attempt(retriesLeft - 1); });
          }
          throw e;
        })
        .finally(function () { clearTimeout(timer); });
    }
    attempt(2)
      .then(function (d) {
        typing(false);
        msg('bot', d.reply);
        history.push({ role: 'model', content: d.reply });
      })
      .catch(function () {
        typing(false);
        msg('bot', t('err') + ' <a href="' + WA + '" target="_blank" rel="noopener">' + t('wa') + '</a>', true);
      })
      .finally(function () { busy = false; });
  });

  applyLang();
})();
