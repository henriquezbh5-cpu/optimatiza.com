// ========== SECURITY: HTML ESCAPE HELPER ==========
function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ========== MOBILE NAV TOGGLE ==========
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
    const icon = navToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.className = 'ph ph-x';
        document.body.style.overflow = 'hidden';
    } else {
        icon.className = 'ph ph-list';
        document.body.style.overflow = '';
    }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelector('i').className = 'ph ph-list';
        document.body.style.overflow = '';
    });
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return; // let other handlers (e.g. the agent stage) act
        var target;
        try { target = document.querySelector(href); } catch (_) { return; }
        if (!target) return; // e.g. #<agent-slug> has no element — agentes.js opens the dialog
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// NOTE: universal card-reveal IntersectionObserver removed — motion.js owns scroll reveals.

// ========== ACTIVE NAV LINK HIGHLIGHT ==========
const sections = document.querySelectorAll('section[id]:not(.ag-group)');
// Sections without their own nav link highlight the chapter they belong to.
const NAV_SECTION_MAP = {
    flota: '#flota',
    tarifario: '#tarifario',
    proyectos: '#proyectos',
    cotizador: '#cotizador',
    contacto: '#contacto'
};

// ========== LEGACY HASH ALIASES (storefront spec §4.2) ==========
// #metodo/#servicios/#sobre-mi content moved to /agentes/. Old shared links
// still land here; forward them. A target containing '/' means cross-page:
// navigate via location.href instead of scrolling.
const HASH_ALIASES = {
    metodo: 'agentes/#metodo',
    proceso: 'agentes/#metodo',
    'sobre-mi': 'agentes/#metodo',
    servicios: 'agentes/#taller',
    anatomia: 'agentes/#taller'
};
(function () {
    var h = (location.hash || '').slice(1);
    var target = HASH_ALIASES[h];
    if (!target) return;
    if (target.indexOf('/') !== -1) { location.href = target; return; }
    var el = document.querySelector(target);
    if (el) el.scrollIntoView();
})();
// Same-document hash edits (e.g. address-bar #servicios on the loaded home)
// forward too; agentes.js's own hashchange router ignores these alias hashes.
window.addEventListener('hashchange', function () {
    var h = (location.hash || '').slice(1);
    var target = HASH_ALIASES[h];
    if (target && target.indexOf('/') !== -1) location.href = target;
});

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    let currentId = null;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            currentId = section.getAttribute('id');
        }
    });

    const target = currentId ? NAV_SECTION_MAP[currentId] : null;
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', !!target && link.getAttribute('href') === target);
    });
});

// ========== LANGUAGE TOGGLE ==========
const translations = (function () {
  // Combined ES/EN table — es and en share one key set, so parity is
  // guaranteed by construction (spec §9.2). [ES, EN] per key.
  var I18N = {
    /* ---- Bitcoin advisory annex (btc-*) ---- */
    "ch-btc": ["A1 — ANEXO · ASESORÍA BITCOIN", "A1 — ANNEX · BITCOIN ADVISORY"],
    "btc-title": ["Asesoría Bitcoin, de operador a operador.", "Bitcoin advisory, operator to operator."],
    "btc-sub": ["Opero Bitcoin desde 2017 — y sigo operando activamente. Gestiono portafolio propio y cuentas de clientes bajo mandato privado, con indicadores automatizados que estudian el comportamiento histórico del mercado para proyectar escenarios. Elige cuánto quieres delegar: aprender, acompañarte o que opere por ti.", "I have traded Bitcoin since 2017 — and I still trade actively. I run my own portfolio and manage client accounts under private mandate, backed by automated indicators that study the market's historical behavior to project scenarios. Choose how much to delegate: learn, get guided, or have me trade for you."],
    "btc-chips": ["<i class=\"ph ph-currency-btc\" aria-hidden=\"true\"></i> OPERANDO DESDE 2017 · INDICADORES AUTOMATIZADOS PROPIOS · SESIONES EN VIVO SOBRE EL PANEL", "<i class=\"ph ph-currency-btc\" aria-hidden=\"true\"></i> TRADING SINCE 2017 · MY OWN AUTOMATED INDICATORS · LIVE SESSIONS ON THE PANEL"],
    "btc-academy-text": ["<strong>Antes de operar, aprende gratis.</strong> Soy el creador de <strong>Bitcoin Academy</strong>, una plataforma gratuita de educación financiera sobre Bitcoin. Es gratis a propósito: nadie debería entrar al mercado sin dominar primero lo básico. Cuando estés listo para operar en vivo, estos planes son el siguiente paso.", "<strong>Before you trade, learn for free.</strong> I am the creator of <strong>Bitcoin Academy</strong>, a free financial-education platform about Bitcoin. It is free on purpose: nobody should enter the market without mastering the basics first. When you are ready to trade live, these plans are the next step."],
    "btc-academy-cta": ["bitcoinacademy.tech →", "bitcoinacademy.tech →"],
    "btc-p1-kicker": ["APRENDE A OPERAR TÚ", "LEARN TO TRADE YOURSELF"],
    "btc-p2-kicker": ["TÚ OPERAS — YO TE GUÍO", "YOU TRADE — I GUIDE YOU"],
    "btc-p2-ribbon": ["MÁS ELEGIDO", "MOST POPULAR"],
    "btc-p2-annual": ["O $900/AÑO = $75/MES — AHORRAS 25%", "OR $900/YEAR = $75/MO — SAVE 25%"],
    "btc-p2-f4": ["Tú mantienes el control: compras y vendes con tu propio criterio", "You stay in control: you buy and sell on your own judgment"],
    "btc-p3-kicker": ["YO OPERO POR TI", "I TRADE FOR YOU"],
    "btc-p3-name": ["GESTIÓN DE PORTAFOLIO", "PORTFOLIO MANAGEMENT"],
    "btc-p3-badge": ["SOLO POR APLICACIÓN", "BY APPLICATION ONLY"],
    "btc-p3-per": [" DE LA GANANCIA", " OF THE PROFIT"],
    "btc-p3-annual": ["SIN CUOTA FIJA — SOLO GANO SI TÚ GANAS", "NO FIXED FEE — I ONLY EARN IF YOU EARN"],
    "btc-p3-f1": ["Estrategia de ciclo acordada por escrito antes de operar", "Cycle strategy agreed in writing before any trade"],
    "btc-p3-f2": ["Opero la cuenta bajo mandato; tú ves todo en tiempo real", "I trade the account under mandate; you see everything in real time"],
    "btc-p3-f3": ["Reporte mensual de fondos, movimientos y rendimiento", "Monthly report of funds, trades and performance"],
    "btc-p3-f4": ["Tú te quedas el 75% de la ganancia total; la gestión, el 25%", "You keep 75% of the total profit; management takes 25%"],
    "btc-p3-f5": ["Capital mínimo $10,000 — cupos limitados, entrevista previa y acuerdo mutuo", "Minimum capital $10,000 — limited seats, prior interview and mutual agreement"],
    "btc-p3-window": ["<span class=\"btc-window-dot\" aria-hidden=\"true\"></span> ENTRO SOLO EN ZONA DE SUELO DEL CICLO — NUNCA EN MÁXIMOS HISTÓRICOS", "<span class=\"btc-window-dot\" aria-hidden=\"true\"></span> I ONLY ENTER AT CYCLE FLOOR ZONES — NEVER AT ALL-TIME HIGHS"],
    "btc-p3-rule": ["REGLA DE LA CASA: SI EL CICLO ESTÁ EN ZONA DE RIESGO, ESTA OPCIÓN SE DESACTIVA. NO RECIBO CAPITAL CUANDO EL MERCADO NO OFRECE UNA ENTRADA RAZONABLE — TU DINERO ESPERA MEJOR MOMENTO, NO LO CONTRARIO.", "HOUSE RULE: IF THE CYCLE IS IN A RISK ZONE, THIS OPTION IS DEACTIVATED. I DO NOT TAKE CAPITAL WHEN THE MARKET DOES NOT OFFER A REASONABLE ENTRY — YOUR MONEY WAITS FOR A BETTER MOMENT, NOT THE OTHER WAY AROUND."],
    "btc-p3-example": ["EJEMPLO: INVIERTES $10,000 Y EL CICLO RINDE +100% → GANANCIA $10,000. TÚ RECIBES $7,500 (TOTAL $17,500); LA GESTIÓN, $2,500.", "EXAMPLE: YOU INVEST $10,000 AND THE CYCLE RETURNS +100% → $10,000 PROFIT. YOU RECEIVE $7,500 (TOTAL $17,500); MANAGEMENT, $2,500."],
    "btc-p3-cta": ["Aplicar a gestión →", "Apply for management →"],
    "btc-p1-name": ["INMERSIÓN COMPLETA", "FULL IMMERSION"],
    "btc-p1-badge": ["SESIÓN ÚNICA · 3 HORAS", "ONE SESSION · 3 HOURS"],
    "btc-p1-f1": ["Fundamentos e historia de Bitcoin, explicados sin humo", "Bitcoin fundamentals and history, explained without hype"],
    "btc-p1-f2": ["Indicadores y patrones de ciclo — y cómo leerlos tú mismo", "Cycle indicators and patterns — and how to read them yourself"],
    "btc-p1-f3": ["Mi experiencia real operando desde 2017: aciertos y errores", "My real trading experience since 2017: wins and mistakes"],
    "btc-p1-f4": ["Estudio del mercado en vivo sobre el panel automatizado", "Live market study on the automated panel"],
    "btc-p1-f5": ["Plan de ciclo: zonas de suelo para comprar y posible techo histórico para vender", "Cycle plan: floor zones to buy and possible historical top to sell"],
    "btc-p1-cta": ["Reservar inmersión →", "Book the immersion →"],
    "btc-p2-name": ["ACOMPAÑAMIENTO MENSUAL", "MONTHLY GUIDANCE"],
    "btc-p2-badge": ["1 HORA / MES", "1 HOUR / MONTH"],
    "btc-p2-per": ["/mes", "/mo"],
    "btc-p2-f1": ["Dónde estamos en el ciclo, con datos — no con ruido de redes", "Where we are in the cycle, with data — not social-media noise"],
    "btc-p2-f2": ["Lectura del mes sobre el panel: qué dicen los indicadores", "The month's read on the panel: what the indicators say"],
    "btc-p2-f3": ["Ajuste de tu plan: acumular, esperar o tomar ganancia", "Adjusting your plan: accumulate, wait or take profit"],
    "btc-p2-cta": ["Empezar acompañamiento →", "Start monthly guidance →"],
    "btc-note": ["SIN CUSTODIA: TUS FONDOS PERMANECEN EN TUS PROPIAS CUENTAS Y BILLETERAS — SE OPERA BAJO MANDATO PRIVADO, NUNCA MOVEMOS TU CAPITAL A CUENTAS NUESTRAS. SERVICIOS ENTRE PARTICULARES BAJO ACUERDO PRIVADO — NO ES ASESORÍA FINANCIERA REGULADA NI PROMESA DE RENDIMIENTOS. RESULTADOS PASADOS NO GARANTIZAN RESULTADOS FUTUROS. BITCOIN ES VOLÁTIL: OPERA SOLO CAPITAL QUE PUEDAS ARRIESGAR. LA GESTIÓN DE PORTAFOLIO REQUIERE ESTRATEGIA ACORDADA POR ESCRITO Y ACEPTACIÓN MUTUA.", "NON-CUSTODIAL: YOUR FUNDS REMAIN IN YOUR OWN ACCOUNTS AND WALLETS — WE OPERATE UNDER PRIVATE MANDATE AND NEVER MOVE YOUR CAPITAL INTO OUR ACCOUNTS. PRIVATE SERVICES UNDER PRIVATE AGREEMENT — NOT REGULATED FINANCIAL ADVICE NOR A PROMISE OF RETURNS. PAST RESULTS DO NOT GUARANTEE FUTURE RESULTS. BITCOIN IS VOLATILE: ONLY TRADE CAPITAL YOU CAN AFFORD TO RISK. PORTFOLIO MANAGEMENT REQUIRES A WRITTEN, MUTUALLY ACCEPTED STRATEGY."],
    "ch-faq": ["04B — PREGUNTAS FRECUENTES", "04B — FREQUENTLY ASKED"],
    "faq-title": ["Lo que todos preguntan.", "What everyone asks."],
    "faq-q1": ["¿Cuánto cuesta un agente de IA?", "How much does an AI agent cost?"],
    "faq-a1": ["Publicamos precios de placa: unidad simple $600–1,200, unidad estándar $1,200–3,000 y célula multi-agente $3,000–8,000 USD. Todo incluye diseño, construcción, pruebas, entrega documentada y 30 días de soporte. El número exacto sale de un diagnóstico gratuito de 30 minutos.", "We publish plate prices: simple unit $600–1,200, standard unit $1,200–3,000 and multi-agent cell $3,000–8,000 USD. Everything includes design, build, testing, documented delivery and 30 days of support. The exact number comes from a free 30-minute diagnostic."],
    "faq-q2": ["¿Cuánto tarda la implementación?", "How long does implementation take?"],
    "faq-a2": ["Semanas, no meses: una unidad simple toma ~1–2 semanas, una estándar ~2–4 y una célula multi-agente ~4–8 semanas, con pagos por hitos 40/30/30.", "Weeks, not months: a simple unit takes ~1–2 weeks, a standard one ~2–4 and a multi-agent cell ~4–8 weeks, with 40/30/30 milestone payments."],
    "faq-q3": ["¿Dónde viven los datos de mi empresa?", "Where does my company's data live?"],
    "faq-a3": ["En tu propia casa: la arquitectura por defecto corre dentro de tu tenant de Microsoft 365 (SharePoint/Dataverse), con tus permisos y auditoría. La IA se consume vía endpoints empresariales y tus datos no se usan para entrenar modelos públicos.", "In your own house: the default architecture runs inside your Microsoft 365 tenant (SharePoint/Dataverse), with your permissions and audit logs. AI runs through enterprise endpoints and your data is not used to train public models."],
    "faq-q4": ["¿Cómo empiezo?", "How do I start?"],
    "faq-a4": ["Con un diagnóstico gratuito de 30 minutos con el ingeniero fundador: describes tu proceso, sales con un plan y una banda de precio honesta — lo trabajemos juntos o no. Se agenda en optimatiza.com o por WhatsApp +503 7192 8070.", "With a free 30-minute diagnostic with the founding engineer: you describe your process, you leave with a plan and an honest price band — whether we work together or not. Book it at optimatiza.com or WhatsApp +503 7192 8070."],
    "footer-faq": ["FAQ", "FAQ"],
    "footer-bitcoin": ["Bitcoin", "Bitcoin"],
    "footer-blog": ["Blog", "Blog"],
    "share-kicker": ["¿TE GUSTÓ LO QUE VISTE? COMPÁRTELO EN TU MURO", "LIKED WHAT YOU SAW? SHARE IT ON YOUR FEED"],
    "share-note": ["LA TARJETA QUE APARECE AL COMPARTIR LLEVA NUESTRO ROBOT — MARCA INCLUIDA.", "THE CARD THAT SHOWS UP WHEN YOU SHARE CARRIES OUR ROBOT — BRAND INCLUDED."],
    "share-aria": ["Compartir Optimatiza", "Share Optimatiza"],
    "share-copy-aria": ["Copiar enlace", "Copy link"],
    "follow-li-aria": ["Seguir a Optimatiza en LinkedIn", "Follow Optimatiza on LinkedIn"],
    "follow-strip": ["SÍGUENOS EN LINKEDIN — OPTIMATIZA →", "FOLLOW OPTIMATIZA ON LINKEDIN →"],
    /* ---- Flow Canvas hero (fw-*) + end-to-end process (proc-*) ---- */
    "fw-aria": ["Simulación de flujo de agentes en vivo", "Live agent workflow simulation"],
    "fw-name": ["FLUJO: ATENCIÓN AL CLIENTE — 24/7", "WORKFLOW: CUSTOMER OPERATIONS — 24/7"],
    "fw-live": ["EN VIVO", "LIVE"],
    "fw-n-start": ["Inicio", "Start"],
    "fw-n-start-sub": ["WhatsApp · Correo · Web", "WhatsApp · Email · Web"],
    "fw-n-intent": ["Detectar intención", "Detect intent"],
    "fw-chip-ia": ["IA · clasificación", "AI · classification"],
    "fw-n-ventas": ["Agente Ventas", "Sales Agent"],
    "fw-chip-ventas": ["WhatsApp + CRM", "WhatsApp + CRM"],
    "fw-n-cobros": ["Agente Cobros", "Collections Agent"],
    "fw-chip-cobros": ["ERP + Recordatorios", "ERP + Reminders"],
    "fw-n-soporte": ["Agente Soporte", "Support Agent"],
    "fw-chip-soporte": ["Correo + Tickets", "Email + Tickets"],
    "fw-chat-title": ["CLIENTE ↔ AGENTE", "CUSTOMER ↔ AGENT"],
    "fw-pre-user": ["Hola, ¿tienen 40 licencias de Microsoft 365? Necesito precio para mañana.", "Hi, do you carry 40 Microsoft 365 licenses? I need pricing by tomorrow."],
    "fw-pre-bot": ["Listo — cotización COT-0412 enviada: 40 licencias M365 Business. Agendé una llamada mañana 9:00 a. m. con tu asesor.", "Done — quote COT-0412 sent: 40 M365 Business licenses. I booked a call tomorrow 9:00 AM with your rep."],
    "fw-pre-seal": ["RESUELTO · 38 s · SIN INTERVENCIÓN HUMANA", "RESOLVED · 38 s · NO HUMAN NEEDED"],
    "fw-tr-start": ["Inicio", "Start"],
    "fw-tr-intent": ["Detectar intención", "Detect intent"],
    "fw-tr-agent": ["Agente Ventas", "Sales Agent"],
    "fw-input": ["El agente responde solo — 24/7", "The agent replies on its own — 24/7"],
    "fw-note": ["SIMULACIÓN · PATRÓN REAL DE OPERACIÓN · <span class=\"tb-signature\">H. Henríquez</span> · REV 2026.07", "SIMULATION · REAL OPERATING PATTERN · <span class=\"tb-signature\">H. Henríquez</span> · REV 2026.07"],
    "fw-cta": ["Quiero un flujo así en mi negocio →", "I want a workflow like this →"],
    "ch-proc": ["00 — EL PROCESO · DE INICIO A FIN", "00 — THE PROCESS · END TO END"],
    "proc-title": ["Un proceso completo, corriendo solo.", "One full process, running on its own."],
    "proc-sub": ["Desliza: esto es lo que pasa desde que un cliente escribe hasta que el reporte llega a tu tablero — sin que nadie toque nada.", "Scroll: this is what happens from the moment a customer writes until the report lands on your dashboard — with nobody touching a thing."],
    "proc-n1": ["LLEGA", "ARRIVES"],
    "proc-n2": ["ENTIENDE", "UNDERSTANDS"],
    "proc-n3": ["EJECUTA", "EXECUTES"],
    "proc-n4": ["APRUEBA", "APPROVES"],
    "proc-n5": ["REPORTA", "REPORTS"],
    "proc-c1-meta": ["T+0 S · WHATSAPP · 2:47 A. M.", "T+0 S · WHATSAPP · 2:47 AM"],
    "proc-c1-title": ["Un cliente escribe de madrugada.", "A customer writes in the middle of the night."],
    "proc-c1-body": ["Pedido, factura o consulta — entra por WhatsApp, correo o formulario web. No hay nadie en la oficina. No hace falta.", "An order, an invoice, a question — it comes in through WhatsApp, email or a web form. Nobody is at the office. Nobody needs to be."],
    "proc-c2-meta": ["T+4 S · IA · CLASIFICACIÓN", "T+4 S · AI · CLASSIFICATION"],
    "proc-c2-title": ["La IA lee, entiende y decide.", "The AI reads, understands and decides."],
    "proc-c2-body": ["El agente extrae los datos, detecta la intención y elige la ruta: cotizar, cobrar o resolver. Sin plantillas rígidas.", "The agent extracts the data, detects the intent and picks the route: quote, collect or resolve. No rigid templates."],
    "proc-c3-meta": ["T+40 S · CRM · ERP · CALENDARIO", "T+40 S · CRM · ERP · CALENDAR"],
    "proc-c3-title": ["Tus sistemas se mueven solos.", "Your systems move on their own."],
    "proc-c3-body": ["Se crea el registro, se genera el documento, se agenda la cita. Cero digitación manual, cero copiar y pegar.", "The record is created, the document is generated, the meeting is booked. Zero manual data entry, zero copy-paste."],
    "proc-c4-meta": ["T+2 MIN · HUMANO EN EL CIRCUITO", "T+2 MIN · HUMAN IN THE LOOP"],
    "proc-c4-title": ["Tú decides solo lo crítico.", "You only decide what is critical."],
    "proc-c4-body": ["Cuando el monto o el caso lo amerita, alguien de tu equipo aprueba con un clic. Control sin cuello de botella.", "When the amount or the case calls for it, someone on your team approves with one click. Control without a bottleneck."],
    "proc-c5-meta": ["T+3 MIN · TABLERO EN VIVO", "T+3 MIN · LIVE DASHBOARD"],
    "proc-c5-title": ["Todo queda documentado.", "Everything is documented."],
    "proc-c5-body": ["El cliente recibe su respuesta, el tablero se actualiza y a la mañana siguiente el trabajo ya está hecho.", "The customer gets their answer, the dashboard updates, and by morning the work is already done."],
    "proc-hint": ["CORRE SOLO — HAZ CLIC EN UN PASO PARA SALTAR", "RUNS ON ITS OWN — CLICK ANY STEP TO JUMP"],
    "proc-cta": ["¿Cuánto de tu operación puede correr así? Cotízalo en 60 segundos →", "How much of your operation could run like this? Estimate it in 60 seconds →"],
    "about-certs-label": ["Certificaciones", "Certifications"],
    "about-certs-value": ["Power Apps · Power Automate · Power BI", "Power Apps · Power Automate · Power BI"],
    "about-education-label": ["Educación", "Education"],
    "about-education-value": ["MSc Ciencia de Datos (UNEATLÁNTICO, 2026) + MSc Inteligencia de Negocios (UNINI, 2023) + Posgrado Blockchain + Ing. en Sistemas Computacionales (UTEC)", "MSc Data Science (UNEATLÁNTICO, 2026) + MSc Business Intelligence (UNINI, 2023) + PgD Blockchain + Computer Systems Eng. (UTEC)"],
    "about-plate": ["PLACA 07 — ING. RESPONSABLE", "PLATE 07 — ENGINEER OF RECORD"],
    "arch-role-results": ["Resultados filtrados por rol", "Role-filtered results"],
    "arch-star-model": ["Modelo dimensional", "Dimensional model"],
    "arch-three-sources": ["3 fuentes de datos", "3 data sources"],
    "autoflow-1-desc": ["Un evento lo activa", "An event fires it"],
    "autoflow-1-title": ["Disparador", "Trigger"],
    "autoflow-2-desc": ["Hace el trabajo", "It does the work"],
    "autoflow-2-title": ["Proceso", "Process"],
    "autoflow-3-desc": ["Reglas y manejo de errores", "Rules &amp; error handling"],
    "autoflow-3-title": ["Validación", "Validate"],
    "autoflow-4-desc": ["Los sistemas se conectan", "Systems talk to each other"],
    "autoflow-4-title": ["Integración", "Integrate"],
    "autoflow-5-desc": ["Avisa a quien corresponde", "The right people know"],
    "autoflow-5-title": ["Notifica", "Notify"],
    "autoflow-6-desc": ["Todo visible, en vivo", "You see it all, live"],
    "autoflow-6-title": ["Tablero", "Dashboard"],
    "autoflow-caption": ["Corre programado o bajo demanda, y escala a una persona solo cuando de verdad hace falta.", "Runs on schedule or on demand &mdash; and escalates to a human only when it truly needs one."],
    "autoflow-titleblock": ["DWG OPTZ-M01 · LÍNEA DE PRODUCCIÓN · ESCALA: SEMANAS, NO MESES", "DWG OPTZ-M01 · PRODUCTION LINE · SCALE: WEEKS, NOT MONTHS"],
    "cartouche-approved": ["APROBADO", "APPROVED"],
    "cartouche-drawn": ["PROYECTÓ: OPTIMATIZA · REV 2026.07", "PREPARED BY: OPTIMATIZA · REV 2026.07"],
    "case-cta": ["¿Tienes un proceso así? → Cotízalo", "Have a process like this? → Estimate it"],
    "ch-01": ["01 — LA VITRINA · SEIS UNIDADES DESTACADAS", "01 — THE SHOWCASE · SIX FEATURED UNITS"],
    "ch-02": ["02 — TARIFARIO · SOLO REFERENCIA", "02 — RATE CARD · REFERENCE ONLY"],
    "ch-04": ["03 — EVIDENCIA · UN CASO EN PRODUCCIÓN", "03 — EVIDENCE · ONE CASE IN PRODUCTION"],
    "ch-06": ["04 — COTIZADOR", "04 — ESTIMATE"],
    "ch-08": ["05 — CONTACTO · DIAGNÓSTICO GRATIS", "05 — CONTACT · FREE DIAGNOSTIC"],
    "chip-founder": ["ENTREGADO POR NUESTRO FUNDADOR", "DELIVERED BY OUR FOUNDER"],
    "colophon-motto": ["DIBUJADO A MANO · CORRIDO POR MÁQUINAS", "DRAWN BY HAND · RUN BY MACHINES"],
    "contact-linkedin": ["LinkedIn del fundador", "Founder's LinkedIn"],
    "contact-mailnote": ["CORREO DEL DOMINIO EN PREPARACIÓN — MIENTRAS TANTO, FORMULARIO Y WHATSAPP RESPONDEN &lt;24H.", "DOMAIN MAILBOX IN PREPARATION — MEANWHILE, FORM AND WHATSAPP REPLY &lt;24H."],
    "contact-portrait-cap": ["TE ATIENDE EL INGENIERO FUNDADOR — SIN CAPA COMERCIAL", "THE FOUNDING ENGINEER TAKES YOUR CALL — NO SALES LAYER"],
    "contact-reply": ["RESPUESTA &lt; 24H", "REPLY &lt; 24H"],
    "cta-subtitle": ["Diagnóstico de 30 minutos, gratis. Sales con un plano, no con una promesa.", "A free 30-minute diagnosis. You leave with a blueprint, not a promise."],
    "cta-title": ["Dinos qué proceso te come horas.", "Tell us which process is eating your hours."],
    "cta-whatsapp": ["Escríbenos por WhatsApp", "Chat on WhatsApp"],
    "diff-1-desc": ["Fabricamos el sistema completo que alimenta el dashboard: interfaz + datos + automatización + aprobaciones + reporte.", "We build the complete system that feeds the dashboard: interface + data + automation + approvals + reporting."],
    "diff-1-title": ["Un vendedor de dashboards", "A dashboard vendor"],
    "diff-2-desc": ["Especialistas certificados en agentes de IA y automatización, sobre la plataforma que tu empresa ya paga.", "Certified specialists in AI agents and automation, on the platform your company already pays for."],
    "diff-2-title": ["Un generalista que intenta de todo", "A generalist who tries everything"],
    "diff-3-desc": ["Documentamos, capacitamos a tu equipo y damos 30 días de soporte. El sistema sigue corriendo sin nosotros.", "We document, train your team and give 30 days of support. The system keeps running without us."],
    "diff-3-title": ["Entregar y desaparecer", "Deliver-and-disappear"],
    "diff-4-desc": ["Ingeniería de producción: manejo de errores, logging, seguridad por roles y ALM en cada entrega.", "Production engineering: error handling, logging, role-based security and ALM in every delivery."],
    "diff-4-title": ["Un constructor de demos", "A demo builder"],
    "diff-title": ["Lo que no somos — y lo que somos", "What we are not — and what we are"],
    "evidencia-all": ["Ver los 6 casos completos →", "See all 6 full cases →"],
    "floor-all": ["Ver las 20 unidades del catálogo →", "See all 20 units in the catalog →"],
    "floor-bridge": ["Estos patrones nacen de sistemas que ya operamos en producción →", "These patterns come from systems we already run in production →"],
    "floor-sub": ["Una por cada dolor de negocio. Presiona play y mira a tu próximo coworker digital hacer el trabajo — antes de pagar un centavo.", "One for each business pain. Press play and watch your next digital coworker do the job — before you pay a cent."],
    "floor-title": ["Seis unidades listas para tu turno.", "Six units ready for your shift."],
    "flow-process-caption": ["Sistemas que siguen trabajando solos después de la entrega.", "Systems that keep working on their own after handover."],
    "footer-casos": ["Casos", "Cases"],
    "footer-catalogo": ["Catálogo", "Catalog"],
    "footer-certs": ["MICROSOFT CERTIFIED ×3 — POWER APPS · POWER AUTOMATE · POWER BI · MSC DATA SCIENCE · MSC BUSINESS INTELLIGENCE · POSGRADO BLOCKCHAIN · EST. 2026", "MICROSOFT CERTIFIED ×3 — POWER APPS · POWER AUTOMATE · POWER BI · MSC DATA SCIENCE · MSC BUSINESS INTELLIGENCE · PGD BLOCKCHAIN · EST. 2026"],
    "footer-contact": ["Contacto", "Contact"],
    "footer-copy": ["&copy; 2026 Optimatiza. Todos los derechos reservados.", "&copy; 2026 Optimatiza. All rights reserved."],
    "footer-cotizador": ["Cotizar", "Estimate"],
    "footer-descriptor": ["AGENTES DE IA & AUTOMATIZACIÓN · INGENIERÍA DE OPERACIONES", "AI AGENTS & AUTOMATION · OPERATIONS ENGINEERING"],
    "footer-flota": ["Agentes", "Agents"],
    "footer-metodo": ["Método", "Method"],
    "footer-precios": ["Precios", "Pricing"],
    "footer-privacy": ["Privacidad", "Privacy"],
    "footer-projects": ["Evidencia", "Evidence"],
    "footer-taller": ["Taller", "Workshop"],
    "footer-terms": ["Términos", "Terms"],
    "founder-more": ["Quiénes fabrican →", "Who builds this →"],
    "founder-plate": ["PROYECTÓ: H. HENRÍQUEZ · ING. EN SISTEMAS · MSC DATA SCIENCE · MSC INTELIGENCIA DE NEGOCIOS · POSGRADO BLOCKCHAIN · 3× MICROSOFT CERTIFIED", "ENGINEERED BY: H. HENRÍQUEZ · SYSTEMS ENGINEER · MSC DATA SCIENCE · MSC BUSINESS INTELLIGENCE · PGD BLOCKCHAIN · 3× MICROSOFT CERTIFIED"],
    "form-fallback": ["No se pudo enviar el formulario en este momento.", "The form couldn't be sent right now."],
    "form-label-company": ["Empresa (opcional)", "Company (optional)"],
    "form-label-email": ["Correo electrónico", "Email"],
    "form-label-message": ["Breve descripción de tu proceso o problema", "Brief description of your process or problem"],
    "form-label-name": ["Nombre", "Name"],
    "form-label-service": ["¿Qué necesitas?", "What do you need?"],
    "form-opt-agente": ["Agente a medida", "Custom agent"],
    "form-opt-app": ["Aplicación a medida (web/móvil)", "Custom application (web/mobile)"],
    "form-opt-automation": ["Automatización de procesos", "Process automation"],
    "form-opt-catalogo": ["Agente del catálogo (di cuál en el mensaje)", "Catalog agent (name the unit in your message)"],
    "form-opt-celula": ["Célula de agentes", "Agent cell"],
    "form-opt-dashboard": ["Dashboard / BI", "Dashboard / BI"],
    "form-opt-default": ["Selecciona una opción…", "Select an option…"],
    "form-opt-integracion": ["Integración de sistemas", "Systems integration"],
    "form-opt-other": ["Otro", "Other"],
    "form-privacy": ["Tus datos se procesan mediante Formspree únicamente para responderte. No se venden ni se usan para marketing.", "Your details are processed via Formspree solely to reply to you. They are not sold or used for marketing."],
    "form-submit": ["<i class=\"ph ph-paper-plane-tilt\"></i> Solicitar diagnóstico gratis", "<i class=\"ph ph-paper-plane-tilt\"></i> Request the free diagnostic"],
    "form-success": ["Enviado. Respondemos en menos de 24 horas.", "Sent. We reply within 24 hours."],
    "hero-chips": ["RESPUESTA EN SEGUNDOS, 24/7 · 15+ SISTEMAS EN PRODUCCIÓN · PRECIOS PUBLICADOS · SAN SALVADOR → LATAM", "ANSWERS IN SECONDS, 24/7 · 15+ SYSTEMS IN PRODUCTION · PUBLISHED PRICING · SAN SALVADOR → LATAM"],
    "hero-kicker": ["Míralo trabajar. Luego contrátalo.", "Watch it work. Then hire it."],
    "hero-vertical": ["¿Distribuidora, ferretería o importadora? Empieza aquí →", "Distributor, hardware store or importer? Start here →"],
    "hero-try": ["O escribile a un agente ahora — Nova te responde en segundos", "Or message an agent right now — Nova replies in seconds"],
    "hero-cta-primary": ["Cotiza tu agente en 60 segundos →", "Price your agent in 60 seconds →"],
    "hero-cta-secondary": ["Míralo trabajar primero ↓", "Watch it work first ↓"],
    "hero-doc-left": ["DOC. OPTZ/2026 — CONSOLA DE TURNO · INGENIERÍA DE OPERACIONES", "DOC. OPTZ/2026 — SHIFT CONSOLE · OPERATIONS ENGINEERING"],
    "hero-doc-right": ["ESTADO · OPERACIONAL", "STATUS · OPERATIONAL"],
    "hero-subtitle": ["Fabricamos e instalamos agentes de IA en tu operación: responden en segundos, de día, de noche y en fin de semana. Desde $600, funcionando en semanas.", "We build and install AI agents inside your operation: they answer in seconds — day, night and weekends. From $600, live in weeks."],
    "hero-title": ["<span class=\"line-mask\"><span class=\"line\">Empleados digitales que atienden,</span></span><span class=\"line-mask\"><span class=\"line\">cobran y <em>responden por&nbsp;ti</em>.</span></span>", "<span class=\"line-mask\"><span class=\"line\">Digital employees that answer,</span></span><span class=\"line-mask\"><span class=\"line\">collect and <em>respond for&nbsp;you</em>.</span></span>"],
    "footer-security": ["Seguridad", "Security"],
    "footer-videocasos": ["Casos en video", "Video cases"],
    "footer-guia": ["Guía gratis", "Free guide"],
    "footer-distri": ["Para distribuidoras", "For distributors"],
    "guide-k": ["Recurso gratuito", "Free resource"],
    "guide-title": ["10 procesos que tu pyme puede automatizar hoy", "10 processes your business can automate today"],
    "guide-sub": ["La guía en cristiano: el dolor de cada proceso, cómo se ve automatizado paso a paso y para quién aplica. Cada caso existe como demo en video — nada de humo.", "The plain-language guide: each process's pain, what it looks like automated step by step, and who it applies to. Every case exists as a video demo — no smoke."],
    "guide-cta": ["Enviarme la guía →", "Send me the guide →"],
    "guide-note": ["Sin spam: solo la guía y, si quieres, novedades útiles. <a href=\"privacy/\">Privacidad</a>.", "No spam: just the guide and, if you want, useful updates. <a href=\"privacy/\">Privacy</a>."],
    "guide-done": ["¡Listo! <a href=\"recursos/guia-10-procesos-optimatiza.pdf\" target=\"_blank\" rel=\"noopener\">Descarga tu guía aquí (PDF) →</a>", "Done! <a href=\"recursos/guia-10-procesos-optimatiza.pdf\" target=\"_blank\" rel=\"noopener\">Download your guide here (PDF) →</a>"],
    "trust-strip": ["🔒 Tus datos viven en tus cuentas · No entrenamos modelos con tu información · Lo delicado siempre lo decide una persona — <a href=\"seguridad/\">cómo cuidamos tus datos →</a>", "🔒 Your data lives in your accounts · We never train models on your information · Sensitive calls always go to a human — <a href=\"seguridad/\">how we protect your data →</a>"],
    "otrust-title": ["Resultados que puedes ver funcionando", "Results you can watch working"],
    "trust-sub": ["Nada de promesas en el aire: cada número sale de sistemas y demos nuestros que corren de verdad. Pídenos verlo en vivo con tus propios datos.", "No empty promises: every number comes from our own systems and demos that actually run. Ask us to show you live with your own data."],
    "trust-m1-num": ["~4 s", "~4 s"],
    "trust-m1-lbl": ["por factura capturada con IA — contra ~3 minutos digitándola a mano", "per invoice captured with AI — versus ~3 minutes typing it by hand"],
    "trust-m2-num": ["24/7", "24/7"],
    "trust-m2-lbl": ["respuesta en segundos, también a las 2 de la mañana y en fin de semana", "answers in seconds — including 2 a.m. and weekends"],
    "trust-m3-num": ["100%", "100%"],
    "trust-m3-lbl": ["de tu cartera con seguimiento de cobro diario — sin que a nadie le toque la tarea incómoda", "of your receivables followed up daily — without anyone getting stuck with the awkward task"],
    "trust-cases": ["Ver los casos en video →", "Watch the video cases →"],
    "trust-frole": ["Fundador e ingeniero responsable", "Founder and engineer in charge"],
    "trust-fbio": ["Ingeniero en Sistemas, MSc en Ciencia de Datos y MSc en Business Intelligence, con 10+ años construyendo sistemas para operaciones reales. Cuando escribes, te responde quien construye — no un call center.", "Systems Engineer, MSc in Data Science and MSc in Business Intelligence, with 10+ years building systems for real operations. When you write, the person who builds answers — not a call center."],
    "trust-flink": ["Ver trayectoria en LinkedIn", "See track record on LinkedIn"],
    "label-inprod": ["EN PRODUCCIÓN", "IN PRODUCTION"],
    "label-problem": ["Situación", "Situation"],
    "label-results": ["Resultado", "Result"],
    "label-solution": ["Solución", "Solution"],
    "method-fig-cap": ["FIG. HND-06 — ENTREGA: EL SISTEMA, DOCUMENTADO, CORRIENDO SOLO.", "FIG. HND-06 — HANDOVER: THE SYSTEM, DOCUMENTED, RUNNING ON ITS OWN."],
    "method-kicker": ["DIAGNOSTICAR → DISEÑAR → OPERAR", "DIAGNOSE → DESIGN → OPERATE"],
    "nav-agentes": ["Catálogo", "Catalog"],
    "nav-cotizador": ["Cotizador", "Estimate"],
    "nav-cta": ["Contacto", "Contact"],
    "nav-estimate": ["Cotizar", "Get a quote"],
    "nav-planes": ["Planes", "Plans"],
    "pl-ch": ["05 — OPERACIÓN MENSUAL", "05 — MONTHLY OPERATION"],
    "pl-title": ["Que sigan trabajando, <em>mes a mes</em>.", "Keep them working, <em>month after month</em>."],
    "pl-sub": ["Construir la unidad es el día uno. Mantenerla afinada, monitoreada y mejorando es lo que separa un experimento de una operación. El build se cotiza arriba; aquí eliges cómo la operamos contigo — o por ti.", "Building the unit is day one. Keeping it tuned, monitored and improving is what separates an experiment from an operation. The build is quoted above; here you choose how we run it with you — or for you."],
    "pl-cred": ["<i class=\"ph ph-seal-check\" aria-hidden=\"true\"></i> 10+ AÑOS DE INGENIERÍA · 15+ SISTEMAS EN PRODUCCIÓN · ING. DE SISTEMAS + 2 MAESTRÍAS + POSGRADO BLOCKCHAIN · 3× MICROSOFT CERTIFIED · CREADOR DE BITCOIN ACADEMY", "<i class=\"ph ph-seal-check\" aria-hidden=\"true\"></i> 10+ YEARS OF ENGINEERING · 15+ SYSTEMS IN PRODUCTION · SYSTEMS ENG. + 2 MASTER'S + BLOCKCHAIN POSTGRAD · 3× MICROSOFT CERTIFIED · CREATOR OF BITCOIN ACADEMY"],
    "pl-cycle-m": ["Mensual", "Monthly"],
    "pl-cycle-y": ["Anual · 2 meses gratis", "Yearly · 2 months free"],
    "pl-trial": ["<i class=\"ph ph-gift\" aria-hidden=\"true\"></i> Empieza con un diagnóstico gratis de 30 min · sin tarjeta · sin compromiso", "<i class=\"ph ph-gift\" aria-hidden=\"true\"></i> Start with a free 30-min diagnostic · no card · no commitment"],
    "pl-pop": ["Más elegido", "Most popular"],
    "pl-note": ["Todos los planes son mes a mes: cancelas cuando quieras. El build de cada unidad se cotiza aparte (arriba). ¿Solo Bitcoin? Mira el anexo de asesoría. Precios en USD.", "All plans are month-to-month: cancel anytime. Each unit's build is quoted separately (above). Bitcoin only? See the advisory annex. Prices in USD."],
    "pl-1-name": ["Esencial", "Essential"],
    "pl-1-for": ["Para 1 unidad en producción que quieres mantener estable.", "For 1 unit in production that you want to keep stable."],
    "pl-1-cta": ["Empezar con diagnóstico →", "Start with a diagnostic →"],
    "pl-1-f1": ["1 unidad monitoreada — uptime y alertas de error", "1 monitored unit — uptime and error alerts"],
    "pl-1-f2": ["Parches y ajustes menores incluidos", "Patches and minor tweaks included"],
    "pl-1-f3": ["Reporte mensual de operación", "Monthly operations report"],
    "pl-1-f4": ["Soporte por correo · respuesta en 48 h", "Email support · 48h response"],
    "pl-2-name": ["Operación", "Operations"],
    "pl-2-for": ["Para negocios que ya dependen de sus agentes y quieren que mejoren.", "For businesses that already rely on their agents and want them to improve."],
    "pl-2-cta": ["Empezar con diagnóstico →", "Start with a diagnostic →"],
    "pl-2-f1": ["Todo lo de Esencial, y además:", "Everything in Essential, plus:"],
    "pl-2-f2": ["Hasta 3 unidades / flujos operados", "Up to 3 units / flows operated"],
    "pl-2-f3": ["1 mejora o regla nueva cada mes", "1 improvement or new rule every month"],
    "pl-2-f4": ["Soporte prioritario por WhatsApp · mismo día", "Priority WhatsApp support · same day"],
    "pl-2-f5": ["Tablero de operación en Power BI", "Operations dashboard in Power BI"],
    "pl-3-name": ["Escala", "Scale"],
    "pl-3-for": ["Para células multi-agente y procesos críticos del negocio.", "For multi-agent cells and business-critical processes."],
    "pl-3-cta": ["Hablar con el ingeniero →", "Talk to the engineer →"],
    "pl-3-f1": ["Todo lo de Operación, y además:", "Everything in Operations, plus:"],
    "pl-3-f2": ["Unidades ilimitadas · célula orquestada", "Unlimited units · orchestrated cell"],
    "pl-3-f3": ["Optimización continua + roadmap mensual", "Continuous optimization + monthly roadmap"],
    "pl-3-f4": ["Ingeniero asignado + SLA de respuesta", "Assigned engineer + response SLA"],
    "pl-3-f5": ["Canales e integraciones nuevas incluidos", "New channels and integrations included"],
    "pl-4-name": ["A medida", "Custom"],
    "pl-4-for": ["Para operaciones grandes o con gobierno y requisitos propios.", "For large operations or with their own governance and requirements."],
    "pl-4-cta": ["Hablar con el ingeniero →", "Talk to the engineer →"],
    "pl-4-f1": ["Todo lo de Escala, y además:", "Everything in Scale, plus:"],
    "pl-4-f2": ["Asesoría Bitcoin dedicada (ver anexo)", "Dedicated Bitcoin advisory (see annex)"],
    "pl-4-f3": ["Volumen, SLA y facturación a tu medida", "Volume, SLA and billing tailored to you"],
    "pl-4-f4": ["Revisión de seguridad y gestión de accesos", "Security review and access management"],

    "nav-flota": ["Agentes", "Agents"],
    "nav-logo-aria": ["Optimatiza — inicio", "Optimatiza — home"],
    "nav-menu-aria": ["Abrir menú", "Open menu"],
    "nav-precios": ["Precios", "Pricing"],
    "nav-proyectos": ["Evidencia", "Evidence"],
    "pill-estimate": ["Cotizar", "Estimate"],
    "process-subtitle": ["Cinco pasos claros para llevar tu operación de manual a automática.", "Five clear steps to take your operation from manual to automatic."],
    "skip": ["Saltar al contenido", "Skip to content"],
    "process-title": ["De diagnóstico a unidad en servicio, en semanas.", "From diagnostic to unit in service, in weeks."],
    "proj1-arch-title": ["Esquema del sistema", "System schematic"],
    "proj1-industry": ["Servicios IT Gestionados — Regional LATAM", "Managed IT Services — LATAM Regional"],
    "proj1-problem": ["Técnicos de campo perdían tiempo significativo buscando documentación técnica. Navegaban carpetas de SharePoint sin sistema de búsqueda inteligente, enviaban mensajes a colegas pidiendo archivos, o resolvían sin consultar la documentación oficial.", "Field technicians wasted significant time searching for technical documentation. They navigated SharePoint folders without an intelligent search system, sent messages to colleagues asking for files, or resolved issues without consulting official documentation."],
    "proj1-result-1": ["Búsqueda de documentación pasó de minutos a segundos", "Documentation search went from minutes to seconds"],
    "proj1-result-2": ["Eliminó dependencia de \"preguntarle al que sabe\"", "Eliminated dependency on \"asking the expert\""],
    "proj1-result-3": ["Escalaciones por falta de información reducidas visiblemente", "Escalations due to lack of information visibly reduced"],
    "proj1-result-4": ["Seguridad por rol: cada técnico ve solo lo que le corresponde", "Role-based security: each technician sees only what they should"],
    "proj1-solution": ["App en Power Apps donde el técnico escribe su consulta en lenguaje natural. AI Builder extrae keywords, se construye una query KQL contra SharePoint Search API, se filtran resultados por área/rol del técnico, y se devuelven documentos relevantes en segundos.", "A Power Apps app where the technician types their query in natural language. AI Builder extracts keywords, builds a KQL query against SharePoint Search API, filters results by the technician's area/role, and returns relevant documents in seconds."],
    "proj1-tagline": ["De buscar manuales por horas a encontrar respuestas en segundos", "From searching manuals for hours to finding answers in seconds"],
    "proj1-title": ["Asistente Técnico con Inteligencia Artificial", "AI-Powered Technical Assistant"],
    "proj12-industry": ["Compras — LATAM", "Procurement — LATAM"],
    "proj12-problem": ["Las órdenes de compra se armaban a mano desde correos y hojas de cálculo: datos redigitados, aprobaciones faltantes y ningún registro claro de quién autorizó qué ni cuándo.", "Purchase orders were assembled by hand from emails and spreadsheets: re-typed data, missing approvals, and no clear record of who authorized what or when."],
    "proj12-result-1": ["Las órdenes avanzan solas de la solicitud a la aprobación, con un registro completo que resiste cualquier auditoría.", "Orders move on their own from request to approval, with a full record that stands up to any audit."],
    "proj12-solution": ["Un flujo automatizado de órdenes de compra: captura estandarizada de solicitudes, ruteo de aprobaciones por monto y categoría, generación automática de documentos y una traza de auditoría completa en cada orden.", "An automated purchase-order workflow: standardized request capture, approval routing by amount and category, automatic document generation and a complete audit trail on every order."],
    "proj12-tagline": ["De la solicitud a la orden de compra aprobada sin redigitar", "From request to approved purchase order without retyping"],
    "proj12-title": ["Ciclo de Compras Automatizado", "Automated Purchasing Cycle"],
    "proj2-arch-title": ["Flujo de datos", "Data flow"],
    "proj2-industry": ["Service Desk Regional", "Regional Service Desk"],
    "proj2-problem": ["Tres fuentes de datos distintas (una herramienta de monitoreo, un sistema de tickets y una base de datos SQL Server) sin vista unificada. Para ver el panorama completo, había que entrar a tres portales diferentes. La gerencia tomaba decisiones con información parcial.", "Three different data sources (a monitoring tool, a ticketing system and a SQL Server database) with no unified view. To see the complete picture, you had to log into three different portals. Management was making decisions with partial information."],
    "proj2-result-1": ["Vista consolidada de toda la operación de soporte", "Consolidated view of the entire support operation"],
    "proj2-result-2": ["Eliminó preparación manual de reportes ejecutivos", "Eliminated manual executive report preparation"],
    "proj2-result-3": ["Identificó patrones de carga por país y técnico", "Identified workload patterns by country and technician"],
    "proj2-result-4": ["Visibilidad en tiempo real para toma de decisiones", "Real-time visibility for decision making"],
    "proj2-solution": ["Dashboard ejecutivo en Power BI conectando las tres fuentes. Queries M con paginación dinámica (List.Generate) para APIs, gateway on-premises para SQL Server, modelo dimensional unificado y refresh automático.", "Executive dashboard in Power BI connecting all three sources. M queries with dynamic pagination (List.Generate) for APIs, on-premises gateway for SQL Server, unified dimensional model and automatic refresh."],
    "proj2-tagline": ["Unificando datos de 3 service desks en un solo dashboard", "Unifying data from 3 service desks into a single dashboard"],
    "proj2-title": ["Dashboard Ejecutivo Multi-Fuente", "Multi-Source Executive Dashboard"],
    "proj6-arch-title": ["Flujo de automatización", "Automation flow"],
    "proj6-industry": ["Operaciones Internas — LATAM", "Internal Operations — LATAM"],
    "proj6-problem": ["Procesos manuales repetitivos con archivos Excel: importaciones masivas de casos para múltiples países LATAM, formatos de fecha inconsistentes, archivos bloqueados por OneDrive sync.", "Repetitive manual processes with Excel files: massive case-management imports across multiple LATAM countries, inconsistent date formats, files locked by OneDrive sync."],
    "proj6-result-1": ["Horas semanales de trabajo manual eliminadas", "Weekly hours of manual work eliminated"],
    "proj6-result-2": ["Errores de formato y datos eliminados por completo", "Format and data errors completely eliminated"],
    "proj6-result-3": ["Procesos independientes de personas específicas", "Processes independent of specific individuals"],
    "proj6-result-4": ["Personal redirigido a actividades de mayor valor", "Staff redirected to higher-value activities"],
    "proj6-solution": ["Suite de bots en Power Automate Desktop con manejo de OneDrive sync, validación automática de formatos por país, procesamiento batch de 500 registros, orquestación desde cloud flows.", "Bot suite in Power Automate Desktop with OneDrive sync handling, automatic format validation by country, batch processing of 500 records, orchestration from cloud flows."],
    "proj6-tagline": ["Bots que procesan lo que nadie quiere procesar", "Bots that process what nobody wants to process"],
    "proj6-title": ["Automatización RPA para Sistemas Legacy", "RPA Automation for Legacy Systems"],
    "proj7-industry": ["Servicios IT Gestionados — Regional LATAM", "Managed IT Services — LATAM Regional"],
    "proj7-problem": ["Los documentos controlados se llevaban en un listado maestro mantenido a mano. Las versiones se desfasaban, las fechas de revisión pasaban inadvertidas y preparar una auditoría implicaba días persiguiendo archivos y cruzando hojas de cálculo.", "Controlled documents were tracked in a master list maintained by hand. Versions drifted, review dates slipped by unnoticed, and preparing for an audit meant days of chasing files and cross-checking spreadsheets."],
    "proj7-result-1": ["El listado maestro se mantiene solo — las auditorías se preparan desde un registro vivo y confiable, no como una misión de rescate.", "The master list maintains itself — audits are prepared from a live, trustworthy register instead of a rescue mission."],
    "proj7-solution": ["Un sistema automatizado de control documental sobre SharePoint: listado maestro gobernado con control de versiones, flujos de aprobación para documentos nuevos y actualizados, recordatorios automáticos de fechas de revisión y una vista en vivo del estado de toda la biblioteca.", "An automated document-control system on SharePoint: a governed master list with version control, approval flows for new and updated documents, automatic review-date reminders and a live status view of the entire library."],
    "proj7-tagline": ["Un listado maestro gobernado en lugar de una hoja mantenida a mano", "One governed master list instead of a hand-maintained spreadsheet"],
    "proj7-title": ["Control Documental Automatizado", "Automated Document Control"],
    "proj8-industry": ["Operaciones Corporativas — Multipaís", "Corporate Operations — Multi-country"],
    "proj8-problem": ["Las solicitudes y aprobaciones de viaje corrían por correo. Sin formulario estándar, sin visibilidad de dónde estaba detenida una solicitud, y cada país manejaba el proceso de forma ligeramente distinta.", "Travel requests and approvals ran over email. No standard form, no visibility of where a request was stuck, and every country handled the process slightly differently."],
    "proj8-result-1": ["Cada solicitud es trazable desde el envío hasta la aprobación, y ya nadie persigue firmas por correo.", "Every request is traceable from submission to approval, and nobody chases signatures by email anymore."],
    "proj8-solution": ["Un portal digital que reemplazó las aprobaciones por correo con un formulario estandarizado, flujo de aprobación multinivel automático, notificaciones en tiempo real y seguimiento de estado — estandarizado para todos los países de operación.", "A digital portal that replaced email-based approvals with a standardized form, automatic multi-level approval flow, real-time notifications and status tracking — standardized across all countries of operation."],
    "proj8-tagline": ["Solicitudes de viaje con aprobación digital multinivel", "Travel requests with multi-level digital approval"],
    "proj8-title": ["Portal de Solicitudes y Aprobaciones", "Request & Approval Portal"],
    "projects-bridge": ["Tu proceso puede ser el Caso 07.", "Your process can be Case 07."],
    "projects-subtitle": ["Casos reales, resultados cualitativos verificables — sin porcentajes inventados.", "Real cases, verifiable qualitative results — no invented percentages."],
    "projects-title": ["Sistemas que ya operamos en producción.", "Systems we already run in production."],
    "quienes-coverage-label": ["Cobertura", "Coverage"],
    "quienes-coverage-value": ["LATAM y EE. UU. — 100% remoto", "LATAM and the US — 100% remote"],
    "quienes-founder-label": ["Fundador y director", "Founder & director"],
    "quienes-hours-label": ["Horario", "Hours"],
    "quienes-hours-value": ["Solape completo con horario de EE. UU. (CST)", "Full overlap with US business hours (CST)"],
    "quienes-legend": ["HABLAS DIRECTO CON EL INGENIERO FUNDADOR — SIN CAPA COMERCIAL", "YOU TALK TO THE FOUNDING ENGINEER — NO SALES LAYER"],
    "quienes-plate": ["Optimatiza fue fundada en 2026 en San Salvador por Humberto Henríquez: ingeniero en sistemas, tres certificaciones Microsoft Power Platform, dos maestrías (Ciencia de Datos y Business Intelligence) y más de diez años construyendo automatización para empresas de LATAM. Los sistemas de la sección Evidencia — RPA, portales, tableros, asistentes con IA — los diseñó y entregó él, y hoy son los patrones que esta fábrica instala. Aquí no hay capa comercial: cada plano lo firma el ingeniero responsable, la misma persona que atiende tu diagnóstico.", "Optimatiza was founded in 2026 in San Salvador by Humberto Henríquez: a systems engineer with three Microsoft Power Platform certifications, two master's degrees (Data Science and Business Intelligence) and ten-plus years building automation for companies across LATAM. The systems in the Evidence section — RPA, portals, dashboards, AI assistants — were designed and delivered by him, and they are the patterns this factory installs today. There is no sales layer here: every drawing is signed by the engineer of record — the same person who takes your diagnostic call."],
    "quienes-product-badge": ["bitcoinacademy.tech →", "bitcoinacademy.tech →"],
    "quienes-product-label": ["Producto publicado", "Shipped product"],
    "quienes-product-value": ["Bitcoin Academy — PWA educativa en 7 idiomas, publicada y en producción.", "Bitcoin Academy — educational PWA in 7 languages, shipped and in production."],
    "quienes-profile-link": ["Perfil completo del fundador →", "Full founder profile →"],
    "quienes-title": ["Fundada y dirigida por un ingeniero, no por un pitch deck.", "Founded and run by an engineer, not a pitch deck."],
    "quote-ai-btn": ["<i class=\"ph ph-sparkle\"></i> Analizar y estimar", "<i class=\"ph ph-sparkle\"></i> Analyze and estimate"],
    "quote-ai-desc": ["Cuéntanos qué proceso te come horas, en tus propias palabras. Analizamos tu descripción y generamos un estimado según las funcionalidades y la complejidad detectadas.", "Tell us which process is eating your hours, in your own words. We analyze your description and generate an estimate based on the features and complexity detected."],
    "quote-ai-placeholder": ["Ejemplo: Cada factura de proveedor llega por correo, alguien la digita en el ERP y pide aprobación por WhatsApp. Quiero que eso corra solo y me avise solo cuando algo no cuadre…", "Example: Every supplier invoice arrives by email, someone keys it into the ERP and chases approval on WhatsApp. I want that to run on its own and only ping me when something doesn't add up…"],
    "quote-ai-privacy": ["<i class=\"ph ph-info\"></i> Tu descripción se procesa con Google Gemini para generar el estimado; no incluyas datos confidenciales.", "<i class=\"ph ph-info\"></i> Your description is processed by Google Gemini to generate the estimate. Don't include confidential data."],
    "quote-ai-result-title": ["Análisis IA", "AI Analysis"],
    "quote-ai-title": ["Describe tu operación", "Describe your operation"],
    "quote-cap-note": ["TOPE DEL TARIFARIO — EL NÚMERO REAL SALE DEL DIAGNÓSTICO GRATUITO DE 30 MINUTOS.", "RATE-CARD CEILING — THE REAL NUMBER COMES OUT OF THE FREE 30-MINUTE DIAGNOSTIC."],
    "quote-form-company": ["Empresa (opcional)", "Company (optional)"],
    "quote-form-email": ["Correo electrónico", "Email"],
    "quote-form-name": ["Tu nombre", "Your name"],
    "quote-form-notes": ["Notas adicionales o contexto...", "Additional notes or context..."],
    "quote-form-phone": ["Teléfono / WhatsApp (opcional)", "Phone / WhatsApp (optional)"],
    "quote-form-submit": ["<i class=\"ph ph-paper-plane-tilt\"></i> Enviar requisitos y solicitar propuesta", "<i class=\"ph ph-paper-plane-tilt\"></i> Send requirements & request proposal"],
    "quote-hire-btn": ["<i class=\"ph ph-handshake\"></i> Envía los requisitos de tu unidad", "<i class=\"ph ph-handshake\"></i> Send your unit requirements"],
    "quote-hire-note": ["Enviamos tus requisitos. Respondemos con una propuesta detallada en menos de 24 horas.", "We send your requirements. We reply with a detailed proposal within 24 hours."],
    "quote-line-complexity": ["Multiplicador de tamaño", "Size multiplier"],
    "quote-line-features": ["Funcionalidades", "Features"],
    "quote-line-type": ["Tipo de unidad", "Unit type"],
    "quote-modal-desc": ["Revisa el detalle y comparte tus datos de contacto. Todos tus requisitos seleccionados se incluyen automáticamente.", "Review the details and share your contact info. All your selected requirements are included automatically."],
    "quote-modal-success": ["¡Enviado! Respondemos con una propuesta detallada en menos de 24 horas.", "Sent! We reply with a detailed proposal within 24 hours."],
    "quote-modal-title": ["Envía los requisitos de tu unidad", "Send your unit requirements"],
    "quote-mode-ai": ["<i class=\"ph ph-brain\"></i> Describe con IA", "<i class=\"ph ph-brain\"></i> Describe with AI"],
    "quote-mode-builder": ["<i class=\"ph ph-list-checks\"></i> Arma tu unidad", "<i class=\"ph ph-list-checks\"></i> Build your unit"],
    "quote-size-large": ["Célula compuesta", "Composite cell"],
    "quote-size-large-desc": ["Banda L — célula orquestada", "L band — orchestrated cell"],
    "quote-size-medium": ["Unidad estándar", "Standard unit"],
    "quote-size-medium-desc": ["Banda M — multi-paso con IA", "M band — multi-step with AI"],
    "quote-size-small": ["Unidad simple", "Simple unit"],
    "quote-size-small-desc": ["Banda S — un flujo, reglas fijas", "S band — one flow, fixed rules"],
    "quote-step1-title": ["¿Qué necesitas?", "What do you need?"],
    "quote-step2-title": ["Selecciona funcionalidades", "Select features"],
    "quote-step3-title": ["Tamaño de la unidad", "Unit size"],
    "quote-subtitle": ["Elige, marca y mira el precio en vivo. O descríbelo y deja que la IA lo cotice.", "Pick, tick and watch the price live. Or describe it and let the AI quote it."],
    "quote-summary-badge": ["Estimado no vinculante", "Non-binding estimate"],
    "quote-summary-empty": ["Elige un tipo de unidad para ver tu estimación", "Pick a unit type to see your estimate"],
    "quote-summary-title": ["Estimación", "Estimate"],
    "quote-timeline-label": ["Tiempo estimado:", "Estimated timeline:"],
    "quote-title": ["Cotiza tu unidad en 60 segundos.", "Price your unit in 60 seconds."],
    "quote-total-label": ["Rango estimado", "Estimated range"],
    "quote-wa-btn": ["Enviar esta cotización por WhatsApp →", "Send this quote via WhatsApp →"],
    "quote-wa-or": ["o dejá tus datos y te respondemos en menos de 24 h:", "or leave your details and we reply within 24 h:"],
    "quote-type-agente": ["Agente a medida", "Custom agent"],
    "quote-type-agente-desc": ["Un flujo que no está en catálogo, con razonamiento IA.", "A workflow not in the catalog, with AI reasoning."],
    "quote-type-agente-price": ["Desde $1,200", "From $1,200"],
    "quote-type-automatizacion": ["Automatización de procesos", "Process automation"],
    "quote-type-automatizacion-desc": ["Power Automate / n8n: flujos, aprobaciones, RPA — sin capa IA.", "Power Automate / n8n: flows, approvals, RPA — no AI layer."],
    "quote-type-automatizacion-price": ["Desde $1,500", "From $1,500"],
    "quote-type-bi": ["Tablero de control", "Control dashboard"],
    "quote-type-bi-desc": ["Power BI sobre tu operación (y sobre tus agentes).", "Power BI over your operation (and your agents)."],
    "quote-type-bi-price": ["Desde $1,800", "From $1,800"],
    "quote-type-catalogo": ["Agente del catálogo", "Catalog agent"],
    "quote-type-catalogo-desc": ["Elige una unidad de la flota; la aterrizamos a tus sistemas.", "Pick a fleet unit; we land it on your systems."],
    "quote-type-catalogo-price": ["Desde $600", "From $600"],
    "quote-type-celula": ["Célula de agentes", "Agent cell"],
    "quote-type-celula-desc": ["Varias unidades orquestadas con memoria compartida.", "Several units orchestrated with shared memory."],
    "quote-type-celula-price": ["Desde $3,000", "From $3,000"],
    "quote-type-integracion": ["Integración de sistemas", "Systems integration"],
    "quote-type-integracion-desc": ["Que tus sistemas se hablen: APIs, sincronización, webhooks.", "Make your systems talk: APIs, sync, webhooks."],
    "quote-type-integracion-price": ["Desde $1,200", "From $1,200"],
    "quote-unit-line": ["Unidad", "Unit"],
    "services-subtitle": ["Tres líneas de taller con la misma entrega documentada de toda unidad.", "Three shop lines, with the same documented delivery as every unit."],
    "services-title": ["¿Tu proceso no está en el catálogo? Lo dibujamos a medida.", "Process not in the catalog? We draft it to measure."],
    "slab-1-after": ["SEGUNDOS", "SECONDS"],
    "slab-1-before": ["HORAS", "HOURS"],
    "slab-2-after": ["1 DASHBOARD", "1 DASHBOARD"],
    "slab-2-before": ["3 PORTALES", "3 PORTALS"],
    "slab-3-after": ["CERO INTERVENCIÓN", "ZERO TOUCH"],
    "slab-3-before": ["PROCESO MANUAL", "MANUAL PROCESS"],
    "step-1-duration": ["1–2 días", "1–2 days"],
    "step-1-short": ["Mapeamos lo que duele antes de proponer nada.", "We map what hurts before proposing anything."],
    "step-1-title": ["Diagnóstico", "Diagnostic"],
    "step-2-duration": ["2–3 días", "2–3 days"],
    "step-2-short": ["Arquitectura, flujos de datos y criterios de éxito.", "Architecture, data flows and success criteria."],
    "step-2-title": ["Plano de la unidad", "Unit drawing"],
    "step-3-duration": ["2–8 semanas", "2–8 weeks"],
    "step-3-short": ["Entregas funcionando cada 1–2 semanas.", "Working deliveries every 1–2 weeks."],
    "step-3-title": ["Construcción iterativa", "Iterative build"],
    "step-4-duration": ["3–5 días", "3–5 days"],
    "step-4-short": ["Validada con usuarios reales, en contexto real.", "Validated with real users, in real context."],
    "step-4-title": ["Pruebas y entrega", "Testing & handover"],
    "step-5-duration": ["30 días incluidos", "30 days included"],
    "step-5-short": ["Producción, documentación y capacitación. Tuyo.", "Production, docs and training. Yours."],
    "step-5-title": ["Operación y soporte", "Operation & support"],
    "svc-dashboards-bi-b1": ["Tableros de KPIs y ejecutivos", "KPI and executive dashboards"],
    "svc-dashboards-bi-b2": ["Modelo de datos estrella", "Star schema data model"],
    "svc-dashboards-bi-b3": ["Actualización programada y alertas", "Scheduled refresh and alerts"],
    "svc-dashboards-bi-b4": ["Vistas con drill-down y autoservicio", "Drill-down and self-service views"],
    "svc-dashboards-bi-b5": ["Pipelines ETL y modelado de datos incluidos", "ETL pipelines and data modeling included"],
    "svc-dashboards-bi-badge": ["Más solicitado", "Most requested"],
    "svc-dashboards-bi-desc": ["Tableros en Power BI que convierten datos dispersos en KPIs, tendencias y alertas claras para decisiones diarias. Construidos sobre un modelo estrella correcto, con actualización programada y alertas cuando los números cruzan tus umbrales.", "Power BI dashboards that turn scattered data into clear KPIs, trends and alerts for daily decisions. Built on a proper star schema with scheduled refresh and alerts when numbers cross your thresholds."],
    "svc-dashboards-bi-floor": ["Desde $1,800 · 2–8 semanas", "From $1,800 · 2–8 weeks"],
    "svc-dashboards-bi-result": ["Una única fuente de verdad que la dirección revisa cada mañana.", "One source of truth that leadership checks every morning."],
    "svc-dashboards-bi-title": ["Tableros Interactivos y BI", "Interactive Dashboards &amp; BI"],
    "svc-integrations-apis-b1": ["Conectores ERP, CRM y SaaS", "ERP, CRM and SaaS connectors"],
    "svc-integrations-apis-b2": ["Sincronización por webhooks y eventos", "Webhook and event syncing"],
    "svc-integrations-apis-b3": ["Mapeo y validación de campos", "Field mapping and validation"],
    "svc-integrations-apis-b4": ["Transferencias idempotentes y con reintentos", "Idempotent, retry-safe transfers"],
    "svc-integrations-apis-badge": ["Alta demanda", "High demand"],
    "svc-integrations-apis-desc": ["Conecto tu ERP, CRM, herramientas SaaS y bases de datos para que los datos fluyan automáticamente en lugar de copiarse a mano. Construyo la capa de integración con n8n, webhooks y conectores a medida, con mapeo y validación en cada paso.", "Connect your ERP, CRM, SaaS tools and databases so data flows automatically instead of being copied by hand. I build the integration layer with n8n, webhooks and custom connectors, with mapping and validation at every step."],
    "svc-integrations-apis-floor": ["Desde $1,200 · 2–6 semanas", "From $1,200 · 2–6 weeks"],
    "svc-integrations-apis-result": ["Tus sistemas se comunican entre sí, eliminando la doble captura y los datos desactualizados.", "Your systems talk to each other, ending double entry and stale data."],
    "svc-integrations-apis-title": ["Integraciones y APIs", "System Integrations &amp; APIs"],
    "svc-process-automation-b1": ["Flujos de aprobación y notificación", "Approval and notification flows"],
    "svc-process-automation-b2": ["Disparadores programados y por evento", "Scheduled and event-based triggers"],
    "svc-process-automation-b3": ["Manejo de errores con reintentos", "Error handling with retries"],
    "svc-process-automation-b4": ["Registros de ejecución y alertas", "Run logs and alerts"],
    "svc-process-automation-badge": ["Más solicitado", "Most requested"],
    "svc-process-automation-desc": ["Reemplazo flujos manuales y repetitivos por automatizaciones que se ejecutan solas entre tus herramientas y bandejas de correo. Construidas con Power Automate y n8n, con aprobaciones, manejo de errores y registros claros para que nada se quede sin atender.", "Replace manual, repetitive workflows with automations that run on their own across your tools and inboxes. Built with Power Automate and n8n, with approvals, error handling and clear logs so nothing falls through the cracks."],
    "svc-process-automation-floor": ["Desde $1,500 · 2–6 semanas", "From $1,500 · 2–6 weeks"],
    "svc-process-automation-result": ["Horas de trabajo manual eliminadas cada semana, con menos errores.", "Hours of manual work eliminated every week, with fewer errors."],
    "svc-process-automation-title": ["Automatización de Procesos", "Process Automation"],
    "svc-stack-line": ["FABRICAMOS SOBRE MICROSOFT POWER PLATFORM · N8N · CLAUDE/GEMINI · NEXT.JS · SQL — TÚ ELIGES EL TERRENO.", "WE BUILD ON MICROSOFT POWER PLATFORM · N8N · CLAUDE/GEMINI · NEXT.JS · SQL — YOU PICK THE GROUND."],
    "tar-cta": ["Cotiza tu caso exacto en 60 segundos →", "Price your exact case in 60 seconds →"],
    "tar-inc": ["Toda unidad incluye: diseño, construcción, pruebas, entrega documentada y 30 días de soporte post-lanzamiento.", "Every unit includes: design, build, testing, documented handover and 30 days of post-launch support."],
    "tar-kicker": ["PRECIO DE PLACA. SIN REUNIONES PARA SABERLO.", "NAMEPLATE PRICING. NO MEETING REQUIRED TO KNOW IT."],
    "tar-method": ["DIAGNÓSTICO GRATIS 30 MIN → CONSTRUIMOS EN SEMANAS → 30 DÍAS DE SOPORTE · <a href=\"agentes/#metodo\">Ver el método completo →</a>", "FREE 30-MIN DIAGNOSIS → BUILT IN WEEKS → 30 DAYS OF SUPPORT · <a href=\"agentes/#metodo\">See the full method →</a>"],
    "tar-l": ["<strong>Célula compuesta — $3,000–8,000.</strong> Varios agentes orquestados con memoria compartida y tableros. ~4–8 semanas.", "<strong>Composite cell — $3,000–8,000.</strong> Several agents orchestrated with shared memory and dashboards. ~4–8 weeks."],
    "tar-m": ["<strong>Unidad estándar — $1,200–3,000.</strong> Multi-paso, razonamiento IA, 2–3 integraciones, ciclo de aprobación. ~2–4 semanas.", "<strong>Standard unit — $1,200–3,000.</strong> Multi-step, AI reasoning, 2–3 integrations, approval loop. ~2–4 weeks."],
    "tar-o": ["<strong>Operación continua — desde $149/mes.</strong> Monitoreo, ajustes y mejora mensual de tus unidades. Mira los <a href=\"#planes\">planes de operación →</a>", "<strong>Continuous operation — from $149/mo.</strong> Monthly monitoring, tuning and improvement of your units. See the <a href=\"#planes\">operation plans →</a>"],
    "tar-ref": ["PRECIOS DE REFERENCIA — EL NÚMERO REAL SALE DE UN DIAGNÓSTICO DE 30 MINUTOS.", "REFERENCE PRICES — THE REAL NUMBER COMES OUT OF A 30-MINUTE DIAGNOSTIC."],
    "tar-s": ["<strong>Unidad simple — $600–1,200.</strong> Un flujo, una integración, reglas fijas. ~1–2 semanas.", "<strong>Simple unit — $600–1,200.</strong> One flow, one integration, fixed rules. ~1–2 weeks."],
    "tar-title": ["Cada unidad tiene precio de placa.", "Every unit has a nameplate price."],
    "tb-doc": ["DWG OPTZ-2026 — INGENIERÍA DE OPERACIONES", "DWG OPTZ-2026 — OPERATIONS ENGINEERING"],
    "tb-meta": ["SAN SALVADOR · GMT-6 · LÁMINA 00 — PORTADA · REV 2026.07", "SAN SALVADOR · GMT-6 · SHEET 00 — COVER · REV 2026.07"],
    "tb-prepared": ["PROYECTÓ: OPTIMATIZA · ING. RESPONSABLE: H. HENRÍQUEZ", "PREPARED BY: OPTIMATIZA · ENGINEER OF RECORD: H. HENRÍQUEZ"],
    "tb-signed": ["APROBADO:", "APPROVED:"],
    "tierline-1": ["DIAGNÓSTICO DE 30 MIN — GRATIS", "30-MIN DIAGNOSTIC — FREE"],
    "tierline-2": ["UNIDAD DESDE $600 — PAGOS POR HITOS 40/30/30", "UNITS FROM $600 — 40/30/30 MILESTONE PAYMENTS"],
    "tierline-3": ["OPERACIÓN CONTINUA — OPCIONAL", "CONTINUOUS OPERATION — OPTIONAL"],
    "tile-custom-cta": ["Cotizar a medida →", "Get a custom quote →"],
    "tile-custom-desc": ["Lo dibujamos a medida — mismo método, misma entrega documentada.", "We draft it custom — same method, same documented handover."],
    "tile-custom-taller": ["Ver el taller →", "See the workshop →"],
    "tile-custom-title": ["¿Tu proceso no está aquí?", "Your process isn't here?"],
    "trust-1": ["Alcance y precio fijos", "Fixed scope & price"],
    "trust-2": ["Pagos por hitos", "Milestone-based payments"],
    "trust-3": ["El código y las cuentas son tuyos", "You own the code & accounts"],
    "trust-4": ["Documentación y capacitación incluidas", "Docs & training included"],
    "trust-5": ["Respuesta &lt;24h", "Reply within 24h"],
    "trust-title": ["Cómo trabajamos contigo", "How we work with you"],
  };
  var _t = { es: {}, en: {} };
  for (var _k in I18N) { if (Object.prototype.hasOwnProperty.call(I18N, _k)) { _t.es[_k] = I18N[_k][0]; _t.en[_k] = I18N[_k][1]; } }
  return _t;
})();

// Apply translations for a given language
function applyLanguage(lang) {
    document.dispatchEvent(new CustomEvent('lang:willchange'));
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    // Handle aria-label translations (nav logo, menu toggle). Keys not in the
    // page-level dict (e.g. ag-aria-*) are skipped — agentes.js owns those.
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.dataset.i18nAria;
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('aria-label', translations[lang][key]);
        }
    });
    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const on = btn.dataset.lang === lang;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
    });
    // Save preference
    localStorage.setItem('preferred-lang', lang);
    document.dispatchEvent(new CustomEvent('lang:changed'));
    // Notify the embedded agent floor (agentes.js) so it re-renders in sync (spec §7.2)
    document.dispatchEvent(new CustomEvent('optz:lang', { detail: { lang: lang } }));
}

// Language toggle click handler
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        applyLanguage(target.dataset.lang);
    });
});

// On page load: restore saved language preference or default to Spanish
(function() {
    var savedLang = localStorage.getItem('preferred-lang') || 'es';
    applyLanguage(savedLang);
})();

// NOTE: counter animation removed — motion.js owns the .odo data-target counters.

// ========== PROPOSAL FORM HANDLER ==========
// Helper: send form via Formspree or fallback to mailto
function sendForm(form, successCallback) {
    var formData = new FormData(form);
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Sending...';
    submitBtn.disabled = true;

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).then(function(response) {
        if (response.ok) {
            successCallback();
        } else {
            sendFailed(submitBtn, originalText);
        }
    }).catch(function() {
        sendFailed(submitBtn, originalText);
    });
}

// On delivery failure, re-enable the form so the visitor can retry,
// and surface an inline per-language fallback with a prefilled WhatsApp link.
function sendFailed(submitBtn, originalText) {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    var fallback = document.getElementById('formFallback');
    if (!fallback) return;

    var lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    var msg = (translations[lang] && translations[lang]['form-fallback']) ||
        (lang === 'es' ? 'No se pudo enviar el formulario en este momento.' : "The form couldn't be sent right now.");
    var waText = lang === 'es'
        ? 'Hola Optimatiza — el formulario del sitio falló, quiero cotizar una unidad.'
        : 'Hi Optimatiza — the site form failed, I want to quote a unit.';
    var waUrl = 'https://wa.me/50371928070?text=' + encodeURIComponent(waText);
    var linkLabel = lang === 'es' ? 'Envíalo por WhatsApp →' : 'Send it by WhatsApp instead →';

    fallback.innerHTML = escapeHtml(msg) + ' <a href="' + waUrl + '" target="_blank" rel="noopener">' + linkLabel + '</a>';
    fallback.removeAttribute('hidden');
}

const proposalForm = document.getElementById('proposalForm');
if (proposalForm) {
    proposalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        sendForm(form, function() {
            form.style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        });
    });
}

// ========== PROJECT QUOTATION SIMULATOR ==========
(function() {
    var pickedUnit = null; // set from sessionStorage 'optz-unit' (spec §6.5)
    // Market pricing: single USD market (spec §6.2)
    const marketBasePrices = {
        en: { catalogo: 600, agente: 1200, celula: 3000, automatizacion: 1500, integracion: 1200, bi: 1800 },
        es: { catalogo: 600, agente: 1200, celula: 3000, automatizacion: 1500, integracion: 1200, bi: 1800 }
    };
    const marketFeatureMultiplier = { en: 1, es: 1 };

    function getMarketBasePrice(type) {
        var lang = getLang();
        return marketBasePrices[lang] ? marketBasePrices[lang][type] : marketBasePrices.es[type];
    }

    function getFeaturePrice(basePrice) {
        var lang = getLang();
        var mult = marketFeatureMultiplier[lang] || 1;
        return Math.round(basePrice * mult);
    }

    // Feature catalogs per unit type (spec §6.3). Prices in USD (single market).
    const agentesFeatures = [
        { id: 'integracion-extra', name: 'Additional integration (ERP, CRM, SQL, SaaS)', nameEs: 'Integración adicional (ERP, CRM, SQL, SaaS)', price: 300 },
        { id: 'canal-whatsapp', name: 'WhatsApp Business channel', nameEs: 'Canal WhatsApp Business', price: 350 },
        { id: 'canal-teams', name: 'Microsoft Teams channel', nameEs: 'Canal Microsoft Teams', price: 250 },
        { id: 'canal-correo', name: 'Email channel (Outlook/Gmail)', nameEs: 'Canal correo (Outlook/Gmail)', price: 200 },
        { id: 'aprobacion', name: 'Human approval loop', nameEs: 'Ciclo de aprobación humana', price: 300 },
        { id: 'rag', name: 'RAG memory over your documents', nameEs: 'Memoria RAG sobre tus documentos', price: 600 },
        { id: 'tablero-unidad', name: 'Unit dashboard (Power BI)', nameEs: 'Tablero de la unidad (Power BI)', price: 450 },
        { id: 'ambiente-m365', name: 'Environment: Microsoft 365 / open stack (informational)', nameEs: 'Ambiente: Microsoft 365 / stack abierto (informativo)', price: 0 },
    ];
    const featureCatalog = {
        catalogo: agentesFeatures,
        agente: agentesFeatures,
        celula: agentesFeatures,
        automatizacion: [
            { id: 'flow-cloud', name: 'Cloud flows (Power Automate)', nameEs: 'Flujos cloud (Power Automate)', price: 450 },
            { id: 'flow-desktop', name: 'Desktop flows / RPA bots', nameEs: 'Flujos de escritorio / bots RPA', price: 700 },
            { id: 'approvals', name: 'Multi-level approval workflows', nameEs: 'Flujos de aprobación multinivel', price: 400 },
            { id: 'email-auto', name: 'Email automation + templates', nameEs: 'Automatización de correo + plantillas', price: 300 },
            { id: 'data-sync', name: 'System-to-system data sync', nameEs: 'Sincronización de datos entre sistemas', price: 550 },
            { id: 'doc-gen', name: 'Document generation (PDF/Word/Excel)', nameEs: 'Generación de docs (PDF/Word/Excel)', price: 450 },
            { id: 'sharepoint', name: 'SharePoint integration + libraries', nameEs: 'Integración SharePoint + bibliotecas', price: 400 },
            { id: 'custom-connector', name: 'Custom API connectors', nameEs: 'Conectores API personalizados', price: 550 },
            { id: 'error-handling', name: 'Error handling + retry + logging', nameEs: 'Manejo de errores + reintentos + logging', price: 350 },
            { id: 'power-app', name: 'Power App user interface', nameEs: 'Interfaz Power App', price: 550 },
            { id: 'dataverse', name: 'Dataverse data model', nameEs: 'Modelo de datos Dataverse', price: 500 },
            { id: 'teams-integration', name: 'Microsoft Teams integration', nameEs: 'Integración con Microsoft Teams', price: 350 },
            { id: 'scheduled-tasks', name: 'Scheduled / recurring tasks', nameEs: 'Tareas programadas / recurrentes', price: 300 },
            { id: 'ai-builder', name: 'AI Builder processing', nameEs: 'Procesamiento con AI Builder', price: 500 },
        ],
        integracion: [
            { id: 'custom-connector', name: 'Custom API connectors', nameEs: 'Conectores API personalizados', price: 550 },
            { id: 'data-sync', name: 'System-to-system data sync', nameEs: 'Sincronización de datos entre sistemas', price: 550 },
            { id: 'webhooks', name: 'Webhooks & real-time events', nameEs: 'Webhooks y eventos en tiempo real', price: 400 },
            { id: 'mapping', name: 'Field mapping & validation', nameEs: 'Mapeo y validación de campos', price: 350 },
            { id: 'idempotencia', name: 'Idempotent, retry-safe transfers', nameEs: 'Transferencias idempotentes con reintentos', price: 350 },
            { id: 'monitoreo', name: 'Link monitoring & alerts', nameEs: 'Monitoreo y alertas del enlace', price: 300 },
        ],
        bi: [
            { id: 'data-model', name: 'Star schema data model', nameEs: 'Modelo de datos estrella', price: 450 },
            { id: 'dax', name: 'Advanced DAX measures + KPIs', nameEs: 'Medidas DAX avanzadas + KPIs', price: 550 },
            { id: 'power-query', name: 'ETL with Power Query (M)', nameEs: 'ETL con Power Query (M)', price: 450 },
            { id: 'multi-source', name: 'Multiple data sources + gateway', nameEs: 'Múltiples fuentes + gateway', price: 500 },
            { id: 'rls', name: 'Row-level security (RLS)', nameEs: 'Seguridad a nivel de fila (RLS)', price: 400 },
            { id: 'scheduled-refresh', name: 'Scheduled refresh + incremental', nameEs: 'Refresh programado + incremental', price: 300 },
            { id: 'api-connection', name: 'API / REST data with pagination', nameEs: 'Datos API / REST con paginación', price: 550 },
            { id: 'kpi-alerts', name: 'KPI alerts + data-driven subscriptions', nameEs: 'Alertas KPI + suscripciones por datos', price: 350 },
            { id: 'embed', name: 'Embedded reports (web/portal)', nameEs: 'Reportes embebidos (web/portal)', price: 450 },
            { id: 'training', name: 'User training + documentation', nameEs: 'Capacitación + documentación', price: 350 },
            { id: 'mobile-report', name: 'Mobile-optimized reports', nameEs: 'Reportes optimizados para móvil', price: 300 },
            { id: 'paginated', name: 'Paginated reports (SSRS)', nameEs: 'Reportes paginados (SSRS)', price: 400 },
        ]
    };

    // Type labels
    const typeLabels = {
        catalogo: { en: 'Catalog agent', es: 'Agente del catálogo' },
        agente: { en: 'Custom agent', es: 'Agente a medida' },
        celula: { en: 'Agent cell', es: 'Célula de agentes' },
        automatizacion: { en: 'Process automation', es: 'Automatización de procesos' },
        integracion: { en: 'Systems integration', es: 'Integración de sistemas' },
        bi: { en: 'Control dashboard', es: 'Tablero de control' }
    };

    // Timeline estimates per type + complexity (spec §6.4)
    const timelines = {
        catalogo:       { small: '1-2 weeks', medium: '2-4 weeks', large: '4-8 weeks' },
        agente:         { small: '2-3 weeks', medium: '3-5 weeks', large: '5-8 weeks' },
        celula:         { small: '4-6 weeks', medium: '6-8 weeks', large: '8-12 weeks' },
        automatizacion: { small: '2-4 weeks', medium: '6-10 weeks', large: '10-16 weeks' },
        integracion:    { small: '2-4 weeks', medium: '4-8 weeks', large: '8-12 weeks' },
        bi:             { small: '2-4 weeks', medium: '4-8 weeks', large: '8-12 weeks' }
    };

    const timelinesEs = {
        catalogo:       { small: '1-2 semanas', medium: '2-4 semanas', large: '4-8 semanas' },
        agente:         { small: '2-3 semanas', medium: '3-5 semanas', large: '5-8 semanas' },
        celula:         { small: '4-6 semanas', medium: '6-8 semanas', large: '8-12 semanas' },
        automatizacion: { small: '2-4 semanas', medium: '6-10 semanas', large: '10-16 semanas' },
        integracion:    { small: '2-4 semanas', medium: '4-8 semanas', large: '8-12 semanas' },
        bi:             { small: '2-4 semanas', medium: '4-8 semanas', large: '8-12 semanas' }
    };

    // State
    let state = {
        mode: 'builder',
        projectType: null,
        basePrice: 0,
        selectedFeatures: [],
        featuresTotal: 0,
        complexity: null,
        multiplier: 1,
        aiEstimate: null
    };

    // DOM refs
    const modeButtons = document.querySelectorAll('.quote-mode-btn');
    const builderPanel = document.getElementById('quoteBuilder');
    const aiPanel = document.getElementById('quoteAI');
    const featuresStep = document.getElementById('quoteFeaturesStep');
    const featuresGrid = document.getElementById('quoteFeaturesGrid');
    const complexityStep = document.getElementById('quoteComplexityStep');
    const summaryEmpty = document.getElementById('quoteSummaryEmpty');
    const summaryDetails = document.getElementById('quoteSummaryDetails');
    const summaryActions = document.getElementById('quoteSummaryActions');
    const typeRadios = document.querySelectorAll('input[name="projectType"]');
    const complexityRadios = document.querySelectorAll('input[name="complexity"]');

    // Get current language
    function getLang() {
        const activeBtn = document.querySelector('.lang-btn.active');
        return activeBtn ? activeBtn.dataset.lang : 'es';
    }

    // Mode toggle
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = btn.dataset.mode;

            if (state.mode === 'builder') {
                builderPanel.classList.add('active');
                aiPanel.classList.remove('active');
            } else {
                aiPanel.classList.add('active');
                builderPanel.classList.remove('active');
            }
            updateSummary();
        });
    });

    // Project type selection
    typeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            state.projectType = radio.value;
            state.basePrice = getMarketBasePrice(radio.value);
            state.selectedFeatures = [];
            state.featuresTotal = 0;
            state.complexity = null;
            state.multiplier = 1;

            // Reset complexity selection
            complexityRadios.forEach(r => r.checked = false);

            renderFeatures();
            featuresStep.style.display = 'block';
            complexityStep.style.display = 'block';

            // Smooth scroll to features
            setTimeout(() => {
                featuresStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            updateSummary();
        });
    });

    // Render features based on project type
    function renderFeatures() {
        const features = featureCatalog[state.projectType] || [];
        const lang = getLang();
        featuresGrid.innerHTML = '';

        features.forEach(f => {
            const adjustedPrice = getFeaturePrice(f.price);
            const div = document.createElement('label');
            div.className = 'quote-feature-item';
            div.innerHTML =
                '<input type="checkbox" value="' + f.id + '" data-price="' + adjustedPrice + '">' +
                '<span class="quote-feature-check"><i class="ph ph-check"></i></span>' +
                '<span class="quote-feature-label">' + (lang === 'es' ? f.nameEs : f.name) + '</span>' +
                '<span class="quote-feature-price">+$' + adjustedPrice.toLocaleString() + '</span>';

            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', () => {
                div.classList.toggle('selected', checkbox.checked);
                updateFeatureSelection();
            });

            featuresGrid.appendChild(div);
        });
    }

    function updateFeatureSelection() {
        state.selectedFeatures = [];
        state.featuresTotal = 0;
        featuresGrid.querySelectorAll('input:checked').forEach(cb => {
            state.selectedFeatures.push(cb.value);
            state.featuresTotal += parseInt(cb.dataset.price);
        });
        updateSummary();
    }

    // Complexity selection
    complexityRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            state.complexity = radio.value;
            state.multiplier = parseFloat(radio.dataset.mult);
            updateSummary();
        });
    });

    // Update summary panel
    function updateSummary() {
        const lang = getLang();

        if (state.mode === 'builder') {
            if (!state.projectType) {
                summaryEmpty.style.display = 'block';
                summaryDetails.style.display = 'none';
                summaryActions.style.display = 'none';
                return;
            }

            summaryEmpty.style.display = 'none';
            summaryDetails.style.display = 'block';

            // Type line (recalculate base price for current market)
            state.basePrice = getMarketBasePrice(state.projectType);
            const tl = typeLabels[state.projectType];
            document.getElementById('quoteTypeValue').textContent =
                (lang === 'es' ? tl.es : tl.en) + ' — $' + state.basePrice.toLocaleString();

            // Features line
            document.getElementById('quoteFeaturesValue').textContent =
                state.selectedFeatures.length + (lang === 'es' ? ' seleccionadas' : ' selected') + ' — +$' + state.featuresTotal;

            // Complexity line
            if (state.complexity) {
                var sizeLabels = { small: lang === 'es' ? 'Pequeño' : 'Small', medium: lang === 'es' ? 'Mediano' : 'Medium', large: lang === 'es' ? 'Grande' : 'Large' };
                document.getElementById('quoteComplexityValue').textContent = sizeLabels[state.complexity] + ' (x' + state.multiplier + ')';
            } else {
                document.getElementById('quoteComplexityValue').textContent = lang === 'es' ? 'Sin seleccionar' : 'Not selected';
            }

            // Calculate total range
            var rawTotal = (state.basePrice + state.featuresTotal) * state.multiplier;
            var min = Math.max(600, Math.round(rawTotal * 0.85));
            var max = Math.round(rawTotal * 1.15);
            // Rate-card ceiling (spec §6.4): the site never quotes past $8,000
            var capped = false;
            if (max > 8000) { max = 8000; capped = true; }
            // §6.4 invariant "the site never contradicts itself": once max is
            // clamped, a high base+features can push min past it — never show an
            // inverted range like "$9,308 – $8,000+".
            if (min > max) min = max;

            document.getElementById('quoteTotalMin').textContent = '$' + min.toLocaleString();
            document.getElementById('quoteTotalMax').textContent = '$' + max.toLocaleString() + (capped ? '+' : '');
            var capNote = document.getElementById('quoteCapNote');
            if (capNote) capNote.hidden = !capped;

            // Timeline
            if (state.complexity && state.projectType) {
                var tl2 = lang === 'es' ? timelinesEs : timelines;
                document.getElementById('quoteTimeline').textContent = tl2[state.projectType][state.complexity];
            } else {
                document.getElementById('quoteTimeline').textContent = '-';
            }

            summaryActions.style.display = state.complexity ? 'block' : 'none';

        } else if (state.mode === 'ai' && state.aiEstimate) {
            summaryEmpty.style.display = 'none';
            summaryDetails.style.display = 'block';

            document.getElementById('quoteTypeValue').textContent = state.aiEstimate.typeLabel;
            document.getElementById('quoteFeaturesValue').textContent =
                state.aiEstimate.features.length + (lang === 'es' ? ' detectadas' : ' detected') + ' — +$' + state.aiEstimate.featuresTotal;
            document.getElementById('quoteComplexityValue').textContent = state.aiEstimate.complexityLabel;

            document.getElementById('quoteTotalMin').textContent = '$' + state.aiEstimate.min.toLocaleString();
            document.getElementById('quoteTotalMax').textContent = '$' + state.aiEstimate.max.toLocaleString() + (state.aiEstimate.capped ? '+' : '');
            var capNoteAi = document.getElementById('quoteCapNote');
            if (capNoteAi) capNoteAi.hidden = !state.aiEstimate.capped;
            document.getElementById('quoteTimeline').textContent = state.aiEstimate.timeline;

            summaryActions.style.display = 'block';
        } else {
            summaryEmpty.style.display = 'block';
            summaryDetails.style.display = 'none';
            summaryActions.style.display = 'none';
        }
    }

    // ===== AI ANALYSIS ENGINE =====
    var aiKeywords = {
        // Project type detection
        types: {
            catalogo: ['nova', 'cobra', 'atlas', 'chrono', 'fenix', 'ledger', 'aura', 'radar', 'insight', 'pulse', 'viral', 'echo', 'talent', 'onboard', 'clause', 'expira', 'stock', 'gasto', 'encuesta', 'vigia', 'del catalogo', 'de la flota', 'unidad a-'],
            agente: ['whatsapp', 'atiende', 'atender', 'clasifica', 'clasificar', 'responde', 'responder', 'chatbot', 'asistente', 'agente', 'agent', 'ia', 'razona', 'consulta', 'pregunta'],
            celula: ['varios agentes', 'multiples agentes', 'multiples unidades', 'orquestar', 'orquesta', 'orchestrate', 'celula', 'célula', 'equipo de agentes', 'agentes que', 'memoria compartida'],
            automatizacion: ['factura', 'invoice', 'aprobacion', 'aprobación', 'approval', 'correo', 'email', 'automatizar', 'automate', 'rpa', 'flujo', 'flow', 'power automate', 'n8n', 'proceso manual', 'digita', 'digitar'],
            integracion: ['erp', 'crm', 'sincronizar', 'sincronización', 'sincroniza', 'sync', 'api', 'integrar', 'integracion', 'integración', 'webhook', 'conectar sistemas', 'que se hablen', 'conector'],
            bi: ['tablero', 'dashboard', 'kpi', 'reporte', 'report', 'power bi', 'metricas', 'métricas', 'metrics', 'analitica', 'analítica', 'analytics', 'visualizacion', 'visualización']
        },
        // Feature detection
        features: [
            { id: 'auth',          keywords: ['login', 'registro', 'register', 'auth', 'autenticación', 'authentication', 'sign up', 'cuenta', 'account', 'usuario', 'user'], name: 'Authentication system', nameEs: 'Sistema de autenticación', price: 500 },
            { id: 'payments',      keywords: ['pago', 'payment', 'pay', 'stripe', 'paypal', 'tarjeta', 'card', 'checkout', 'cobrar', 'charge', 'factura', 'invoice'], name: 'Payment integration', nameEs: 'Integración de pagos', price: 700 },
            { id: 'admin',         keywords: ['admin', 'panel', 'backoffice', 'back office', 'administrador', 'gestión', 'management', 'manage'], name: 'Admin panel', nameEs: 'Panel de administracion', price: 600 },
            { id: 'messaging',     keywords: ['chat', 'mensaje', 'message', 'messaging', 'inbox', 'comunicacion', 'communication'], name: 'Messaging / Chat', nameEs: 'Mensajeria / Chat', price: 600 },
            { id: 'notifications', keywords: ['notificación', 'notification', 'alert', 'alerta', 'push', 'email notification', 'reminder'], name: 'Notifications', nameEs: 'Notificaciones', price: 400 },
            { id: 'maps',          keywords: ['mapa', 'map', 'gps', 'ubicacion', 'location', 'geolocalizacion', 'geolocation', 'tracking', 'rastreo', 'seguimiento', 'delivery'], name: 'Maps / Geolocation', nameEs: 'Mapas / Geolocalizacion', price: 500 },
            { id: 'search',        keywords: ['buscar', 'search', 'filtro', 'filter', 'búsqueda'], name: 'Advanced search & filters', nameEs: 'Búsqueda avanzada y filtros', price: 350 },
            { id: 'files',         keywords: ['subir', 'upload', 'archivo', 'file', 'imagen', 'image', 'photo', 'foto', 'documento', 'document', 'galeria', 'gallery'], name: 'File/image upload', nameEs: 'Subida de archivos/imagenes', price: 350 },
            { id: 'realtime',      keywords: ['real-time', 'real time', 'tiempo real', 'en vivo', 'live', 'websocket', 'socket'], name: 'Real-time features', nameEs: 'Funciones en tiempo real', price: 600 },
            { id: 'ai',            keywords: ['ia', 'ai', 'inteligencia artificial', 'artificial intelligence', 'chatbot', 'bot', 'claude', 'gpt', 'openai', 'machine learning'], name: 'AI integration', nameEs: 'Integración de IA', price: 800 },
            { id: 'inventory',     keywords: ['inventario', 'inventory', 'stock', 'almacen', 'warehouse', 'producto', 'product', 'catálogo', 'catalog'], name: 'Inventory / Product catalog', nameEs: 'Inventario / Catálogo de productos', price: 450 },
            { id: 'reports',       keywords: ['reporte', 'report', 'estadistica', 'statistic', 'gráfico', 'chart', 'analytics', 'exportar', 'export'], name: 'Reports & analytics', nameEs: 'Reportes y analytics', price: 400 },
            { id: 'booking',       keywords: ['calendario', 'calendar', 'agenda', 'schedule', 'cita', 'appointment', 'reserva', 'booking', 'reservation'], name: 'Booking / Calendar', nameEs: 'Reservas / Calendario', price: 500 },
            { id: 'cart',          keywords: ['carrito', 'cart', 'shopping', 'compra', 'purchase', 'orden', 'order', 'pedido'], name: 'Shopping cart / Orders', nameEs: 'Carrito / Pedidos', price: 500 },
            { id: 'seo',           keywords: ['seo', 'google', 'posicionamiento', 'ranking', 'organic'], name: 'SEO optimization', nameEs: 'Optimización SEO', price: 300 },
            { id: 'responsive',    keywords: ['responsive', 'móvil', 'mobile', 'tablet', 'adaptable'], name: 'Responsive design', nameEs: 'Diseño responsive', price: 200 },
            { id: 'multilang',     keywords: ['multi idioma', 'multilingual', 'multi-language', 'ingles', 'english', 'traduccion', 'translation', 'i18n'], name: 'Multi-language', nameEs: 'Multi-idioma', price: 350 },
            { id: 'social',        keywords: ['social', 'facebook', 'instagram', 'twitter', 'whatsapp', 'compartir', 'share', 'red social', 'social media'], name: 'Social media integration', nameEs: 'Integración redes sociales', price: 300 },
            { id: 'rbac',          keywords: ['seguridad', 'security', 'rol', 'role', 'permiso', 'permission', 'rbac', 'access control'], name: 'Role-based security', nameEs: 'Seguridad por roles', price: 400 },
            { id: 'offline',       keywords: ['offline', 'sin conexión', 'pwa', 'progressive'], name: 'Offline / PWA support', nameEs: 'Soporte offline / PWA', price: 500 },
        ]
    };

    // AI endpoint — Cloudflare Worker que usa Gemini 2.0 Flash.
    // Si esta vacio o el endpoint falla, se usa keyword matching local como fallback.
    var QUOTE_AI_ENDPOINT = 'https://quote-ai.henriquezbh5.workers.dev';

    // Client-side safety map: the deployed worker may still return legacy type
    // ids until it is redeployed (spec §6.7). Maps them onto the 6 current SKUs.
    var LEGACY_TYPE_MAP = { website: 'automatizacion', webapp: 'agente', mobile: 'agente',
        fullstack: 'celula', automation: 'automatizacion', bi: 'bi', bitcoin: 'agente' };

    // ===== Analysis pipeline =====
    // Output shape: { type, features: [featObj], complexity, source: 'ai'|'local', reasoning }

    function analyzeLocally(rawText, lang) {
        var text = rawText.toLowerCase();

        var typeScores = {};
        Object.keys(aiKeywords.types).forEach(function(type) {
            typeScores[type] = 0;
            aiKeywords.types[type].forEach(function(kw) {
                if (text.includes(kw)) typeScores[type] += 1;
            });
        });

        var detectedType = 'agente';
        var maxScore = 0;
        Object.keys(typeScores).forEach(function(type) {
            if (typeScores[type] > maxScore) { maxScore = typeScores[type]; detectedType = type; }
        });

        var detectedFeatures = aiKeywords.features.filter(function(feat) {
            return feat.keywords.some(function(kw) { return text.includes(kw); });
        });

        var complexity = 'small';
        if (text.length > 500 || detectedFeatures.length > 8) complexity = 'large';
        else if (text.length > 200 || detectedFeatures.length > 4) complexity = 'medium';

        return { type: detectedType, features: detectedFeatures, complexity: complexity, source: 'local', reasoning: '' };
    }

    async function analyzeWithAI(rawText, lang) {
        if (!QUOTE_AI_ENDPOINT) throw new Error('AI endpoint not configured');

        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 12000);

        try {
            var res = await fetch(QUOTE_AI_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: rawText, lang: lang }),
                signal: controller.signal
            });
            if (!res.ok) throw new Error('AI endpoint returned ' + res.status);
            var data = await res.json();
            if (!data || !data.type) throw new Error('AI endpoint returned invalid data');

            var idMap = {};
            aiKeywords.features.forEach(function(f) { idMap[f.id] = f; });
            var features = (data.features || []).map(function(id) { return idMap[id]; }).filter(Boolean);

            var mappedType = LEGACY_TYPE_MAP[data.type] || data.type;
            // Degrade any unknown/unmapped worker type to the custom-agent SKU so
            // getMarketBasePrice/computeEstimate never hit an undefined typeLabels entry.
            if (!typeLabels[mappedType]) mappedType = 'agente';
            return { type: mappedType, features: features, complexity: data.complexity || 'medium', source: 'ai', reasoning: data.reasoning || '' };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function computeEstimate(analysis, rawText, lang) {
        var multMap = { small: 1, medium: 1.8, large: 3 };
        var mult = multMap[analysis.complexity] || 1.8;

        var base = getMarketBasePrice(analysis.type);
        var fMult = marketFeatureMultiplier[lang] || 1;
        var featuresTotal = analysis.features.reduce(function(sum, f) { return sum + Math.round(f.price * fMult); }, 0);
        var rawTotal = (base + featuresTotal) * mult;
        var min = Math.max(600, Math.round(rawTotal * 0.85));
        var max = Math.round(rawTotal * 1.15);
        var capped = false;
        if (max > 8000) { max = 8000; capped = true; }
        if (min > max) min = max;

        var sizeLabels = { small: { en: 'Small', es: 'Pequeño' }, medium: { en: 'Medium', es: 'Mediano' }, large: { en: 'Large', es: 'Grande' } };
        var tl2 = lang === 'es' ? timelinesEs : timelines;

        return {
            type: analysis.type,
            typeLabel: (lang === 'es' ? typeLabels[analysis.type].es : typeLabels[analysis.type].en) + ' — $' + base.toLocaleString(),
            features: analysis.features,
            featuresTotal: featuresTotal,
            complexity: analysis.complexity,
            complexityLabel: sizeLabels[analysis.complexity][lang] + ' (x' + mult + ')',
            min: min,
            max: max,
            capped: capped,
            timeline: tl2[analysis.type][analysis.complexity],
            description: rawText,
            source: analysis.source,
            reasoning: analysis.reasoning,
            _base: base,
            _fMult: fMult,
            _mult: mult
        };
    }

    function renderAiResult(estimate, lang) {
        var resultDiv = document.getElementById('quoteAiResult');
        var detectedDiv = document.getElementById('quoteAiDetected');
        resultDiv.style.display = 'block';

        var sizeLabels = { small: { en: 'Small', es: 'Pequeño' }, medium: { en: 'Medium', es: 'Mediano' }, large: { en: 'Large', es: 'Grande' } };

        var html = '';

        if (estimate.source === 'ai' && estimate.reasoning) {
            html += '<div class="quote-ai-detected-item"><i class="ph ph-brain"></i><span class="ai-feature-name" style="font-style:italic;opacity:.85;">' +
                escapeHtml(estimate.reasoning) + '</span></div>';
        }

        html += '<div class="quote-ai-detected-item"><i class="ph ph-app-window"></i><span class="ai-feature-name"><strong>' +
            (lang === 'es' ? 'Tipo detectado: ' : 'Detected type: ') +
            (lang === 'es' ? typeLabels[estimate.type].es : typeLabels[estimate.type].en) +
            '</strong></span><span class="ai-feature-cost">$' + estimate._base.toLocaleString() + ' base</span></div>';

        estimate.features.forEach(function(f) {
            var adjPrice = Math.round(f.price * estimate._fMult);
            html += '<div class="quote-ai-detected-item"><i class="ph ph-check-circle"></i><span class="ai-feature-name">' +
                (lang === 'es' ? f.nameEs : f.name) +
                '</span><span class="ai-feature-cost">+$' + adjPrice.toLocaleString() + '</span></div>';
        });

        html += '<div class="quote-ai-detected-item"><i class="ph ph-gauge"></i><span class="ai-feature-name"><strong>' +
            (lang === 'es' ? 'Complejidad estimada: ' : 'Estimated complexity: ') +
            sizeLabels[estimate.complexity][lang] +
            '</strong></span><span class="ai-feature-cost">x' + estimate._mult + '</span></div>';

        detectedDiv.innerHTML = html;
    }

    document.getElementById('quoteAiAnalyze').addEventListener('click', async function() {
        var btn = this;
        var textarea = document.getElementById('quoteAiInput');
        var rawText = textarea.value.trim();

        if (!rawText || rawText.length < 20) {
            textarea.style.borderColor = '#EF4444';
            setTimeout(function() { textarea.style.borderColor = ''; }, 2000);
            return;
        }

        var lang = getLang();
        var originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-circle-notch"></i> ' + (lang === 'es' ? 'Analizando con IA...' : 'Analyzing with AI...');

        try {
            var analysis;
            try {
                analysis = await analyzeWithAI(rawText, lang);
            } catch (err) {
                console.warn('[quote] AI endpoint unavailable, using local keyword matcher:', err.message);
                analysis = analyzeLocally(rawText, lang);
            }

            state.aiEstimate = computeEstimate(analysis, rawText, lang);
            renderAiResult(state.aiEstimate, lang);
            updateSummary();

            setTimeout(function() {
                document.getElementById('quoteAiResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    });

    // ===== HIRE MODAL =====
    document.getElementById('quoteHireBtn').addEventListener('click', function() {
        var lang = getLang();
        var modal = document.getElementById('quoteModal');
        var summaryDiv = document.getElementById('quoteModalSummary');

        // Build summary text
        var lines = [];
        if (state.mode === 'builder' && state.projectType) {
            var tl = typeLabels[state.projectType];
            lines.push((lang === 'es' ? 'Tipo: ' : 'Type: ') + (lang === 'es' ? tl.es : tl.en));
            if (state.selectedFeatures.length > 0) {
                var features = featureCatalog[state.projectType] || [];
                var selectedNames = state.selectedFeatures.map(function(id) {
                    var f = features.find(function(feat) { return feat.id === id; });
                    return f ? (lang === 'es' ? f.nameEs : f.name) : id;
                });
                lines.push((lang === 'es' ? 'Funcionalidades: ' : 'Features: ') + selectedNames.join(', '));
            }
            if (state.complexity) {
                var sizeLabels2 = { small: lang === 'es' ? 'Pequeño' : 'Small', medium: lang === 'es' ? 'Mediano' : 'Medium', large: lang === 'es' ? 'Grande' : 'Large' };
                lines.push((lang === 'es' ? 'Tamano: ' : 'Size: ') + sizeLabels2[state.complexity]);
            }
            lines.push((lang === 'es' ? 'Rango estimado: ' : 'Estimated range: ') +
                document.getElementById('quoteTotalMin').textContent + ' - ' + document.getElementById('quoteTotalMax').textContent);
            lines.push((lang === 'es' ? 'Tiempo estimado: ' : 'Estimated timeline: ') + document.getElementById('quoteTimeline').textContent);
        } else if (state.mode === 'ai' && state.aiEstimate) {
            lines.push((lang === 'es' ? 'Descripción del proyecto: ' : 'Project description: ') + state.aiEstimate.description);
            lines.push((lang === 'es' ? 'Tipo detectado: ' : 'Detected type: ') + (lang === 'es' ? typeLabels[state.aiEstimate.type].es : typeLabels[state.aiEstimate.type].en));
            var featureNames = state.aiEstimate.features.map(function(f) { return lang === 'es' ? f.nameEs : f.name; });
            lines.push((lang === 'es' ? 'Funcionalidades detectadas: ' : 'Detected features: ') + featureNames.join(', '));
            lines.push((lang === 'es' ? 'Rango estimado: $' : 'Estimated range: $') + state.aiEstimate.min.toLocaleString() + ' - $' + state.aiEstimate.max.toLocaleString());
            lines.push((lang === 'es' ? 'Tiempo estimado: ' : 'Estimated timeline: ') + state.aiEstimate.timeline);
        }

        if (pickedUnit) { lines.unshift('UNIDAD: ' + pickedUnit.label); }
        var subjEl = document.getElementById('quoteHireSubject');
        if (subjEl) {
            if (pickedUnit) {
                subjEl.value = 'Optimatiza — cotización unidad ' + pickedUnit.code + ' ' + pickedUnit.name;
            } else {
                var _st = (state.mode === 'ai' && state.aiEstimate) ? state.aiEstimate.type : state.projectType;
                var _stl = (_st && typeLabels[_st]) ? (lang === 'es' ? typeLabels[_st].es : typeLabels[_st].en) : '';
                var _smin = document.getElementById('quoteTotalMin').textContent;
                var _smax = document.getElementById('quoteTotalMax').textContent;
                subjEl.value = 'Optimatiza — cotización ' + _stl + ' ' + _smin + '–' + _smax;
            }
        }
        summaryDiv.innerHTML = lines.map(function(l) { return '<p>' + escapeHtml(l) + '</p>'; }).join('');
        document.getElementById('hireRequirements').value = lines.join('\n');

        /* P0: canal de pico de intención — WhatsApp con la cotización precargada */
        var waBtn = document.getElementById('quoteWhatsApp');
        if (waBtn) {
            var waIntro = lang === 'es'
                ? 'Hola, vengo del cotizador de optimatiza.com. Mi cotización:\n'
                : 'Hi, I used the optimatiza.com quote builder. My quote:\n';
            waBtn.href = 'https://wa.me/50371928070?text=' + encodeURIComponent(waIntro + lines.join('\n'));
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.getElementById('quoteModalClose').focus();
    });

    // Close modal
    document.getElementById('quoteModalClose').addEventListener('click', closeModal);
    document.getElementById('quoteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    // Escape closes the modal. Registered once at document level (gated on the
    // modal being visible) because the hidden/overlay div never receives key events.
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' &&
            document.getElementById('quoteModal').style.display !== 'none') {
            closeModal();
        }
    });

    function closeModal() {
        document.getElementById('quoteModal').style.display = 'none';
        document.body.style.overflow = '';
        var trigger = document.getElementById('quoteHireBtn');
        if (trigger) trigger.focus();
    }

    // Submit hire form
    document.getElementById('quoteHireForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        sendForm(form, function() {
            // Day-1 instrumentation (storefront spec graft #4)
            try {
                document.dispatchEvent(new CustomEvent('optz:evt', { detail: { name: 'estimator_submit', slug: '' } }));
            } catch (err) { /* best-effort */ }
            form.style.display = 'none';
            document.getElementById('quoteModalSuccess').style.display = 'block';
            setTimeout(function() {
                closeModal();
                form.style.display = '';
                form.reset();
                document.getElementById('quoteModalSuccess').style.display = 'none';
            }, 3000);
        });
    });

    // Unit prefill from a catalog card's "COTIZAR ESTA UNIDAD" (spec §6.5)
    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    function initUnitPrefill() {
        var slug = null;
        try { slug = sessionStorage.getItem('optz-unit'); } catch (e) { /* storage unavailable */ }
        if (!slug) return;
        try { sessionStorage.removeItem('optz-unit'); } catch (e) { /* ignore */ }
        var list = (window.AGENTS && window.AGENTS.length) ? window.AGENTS : [];
        var idx = -1;
        for (var i = 0; i < list.length; i++) { if (list[i].slug === slug) { idx = i; break; } }
        var name = idx >= 0 ? (list[idx].nombre || slug) : (slug.charAt(0).toUpperCase() + slug.slice(1));
        var code = 'A-' + pad2((idx >= 0 ? idx : 0) + 1);
        pickedUnit = { code: code, name: name, label: code + ' · ' + String(name).toUpperCase() };
        var radio = document.querySelector('input[name="projectType"][value="catalogo"]');
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
        var valEl = document.getElementById('quoteUnitValue');
        var lineEl = document.getElementById('quoteLineUnit');
        if (valEl) valEl.textContent = pickedUnit.label;
        if (lineEl) lineEl.style.display = '';
    }
    initUnitPrefill();

    // COTIZAR ESTA UNIDAD from a floor card, on the home embed. motion.js installs
    // a capture-phase document click handler that swallows the anchor's own
    // listener (stopImmediatePropagation) and prevents the hash change, so the
    // card's sessionStorage write never lands and initUnitPrefill (which ran once
    // at load) never re-runs. We capture the intent here — this IIFE executes
    // during script.js, before motion.js, so this capture listener fires first —
    // set the picked unit and re-run the prefill. We do NOT preventDefault, so
    // motion.js/Lenis (or native nav) still scrolls to #cotizador. (spec §6.5)
    document.addEventListener('click', function (e) {
        var q = e.target && e.target.closest ? e.target.closest('a.ag-cta-quote') : null;
        if (!q) return;
        // Hero console CTA carries the unit directly (storefront spec §2.3);
        // vitrina cards keep deriving it from their card link. One consume path.
        var slug = q.getAttribute('data-agent-slug') || '';
        if (!slug) {
            var card = q.closest('.ag-card');
            var link = card && card.querySelector('.ag-card-link');
            slug = link ? (link.getAttribute('href') || '').replace(/^#/, '') : '';
        }
        if (!slug) return;
        try { sessionStorage.setItem('optz-unit', slug); } catch (err) { /* storage unavailable */ }
        initUnitPrefill();
        // Day-1 instrumentation (graft #4): on home, script.js owns the quote
        // click, so it emits the prefill event (agentes.js only emits standalone).
        try {
            document.dispatchEvent(new CustomEvent('optz:evt', { detail: { name: 'prefill', slug: slug } }));
        } catch (err) { /* CustomEvent unavailable — metrics are best-effort */ }
    }, true);

    // Re-render features and recalculate prices when language/market changes.
    // applyLanguage() dispatches 'lang:changed' after the key loop, so the
    // active-language button state is already final here (no setTimeout race).
    document.addEventListener('lang:changed', function() {
        var lang = getLang();
        if (state.mode === 'ai' && state.aiEstimate) {
            // Re-render the AI estimate in the new language so type/complexity/
            // timeline labels and the detected-features panel stay consistent
            // (they were frozen at analyze-time). Also keeps prices market-consistent.
            var prev = state.aiEstimate;
            var analysis = {
                type: prev.type,
                features: prev.features,          // already full feature objects
                complexity: prev.complexity,
                source: prev.source,
                reasoning: prev.reasoning
            };
            state.aiEstimate = computeEstimate(analysis, prev.description, lang);
            renderAiResult(state.aiEstimate, lang);
        } else if (state.projectType) {
            state.basePrice = getMarketBasePrice(state.projectType);
            var keep = state.selectedFeatures.slice();   // snapshot before rebuild
            renderFeatures();                            // relabels ES/EN, rebuilds grid unchecked
            keep.forEach(function(id) {
                var cb = featuresGrid.querySelector('input[value="' + id + '"]');
                if (cb) {
                    cb.checked = true;
                    var item = cb.closest('.quote-feature-item');
                    if (item) item.classList.add('selected');
                }
            });
            updateFeatureSelection();  // recomputes featuresTotal + selectedFeatures from checked boxes
        }
        updateSummary();
    });
})();

// ========== ANIMATED FLOW DIAGRAMS + POLISH ==========
(function () {
    'use strict';
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // --- Animated flow diagrams: reveal (draw path + light up nodes) on view ---
    var flows = document.querySelectorAll('[data-flow]');
    if (flows.length) {
        if (reduce) {
            flows.forEach(function (f) {
                f.classList.add('flow-visible');
                var svg = f.querySelector('svg');
                if (svg && typeof svg.pauseAnimations === 'function') {
                    try { svg.pauseAnimations(); } catch (e) { /* ignore */ }
                }
            });
        } else if ('IntersectionObserver' in window) {
            var fObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('flow-visible');
                        fObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
            flows.forEach(function (f) { fObs.observe(f); });
        } else {
            flows.forEach(function (f) { f.classList.add('flow-visible'); });
        }
    }

    // --- Scroll progress bar ---
    if (!reduce) {
        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        (document.body || document.documentElement).appendChild(bar);
        var ticking = false;
        function updateBar() {
            ticking = false;
            var doc = document.documentElement;
            var scrollable = (doc.scrollHeight - doc.clientHeight) || 1;
            var p = Math.min(Math.max(window.pageYOffset / scrollable, 0), 1);
            bar.style.transform = 'scaleX(' + p + ')';
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(updateBar); }
        }, { passive: true });
        updateBar();
    }

    // NOTE: 3D tilt / cursor-spotlight removed — banned by the Operating Ledger motion system.
})();

// ========== LIVE GMT-6 CLOCK ==========
(function () {
    var clocks = document.querySelectorAll('.clock[data-clock]');
    if (!clocks.length) return;

    var formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/El_Salvador',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    function render() {
        var now = formatter.format(new Date());
        clocks.forEach(function (c) { c.textContent = now; });
    }

    render(); // paint immediately
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!reduce) setInterval(render, 1000); // frozen at load time under reduced motion
})();

// ========== STICKY PILL ==========
(function () {
    var pill = document.getElementById('stickyPill');
    if (!pill) return;

    var DISMISS_KEY = 'hh_pill_dismissed';
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { /* storage unavailable */ }
    if (dismissed) return; // never show again this session

    // The quote modal's open/close functions live inside the estimator IIFE,
    // so track its visibility via a MutationObserver on the overlay instead.
    var modalOpen = false;
    var modal = document.getElementById('quoteModal');
    if (modal && 'MutationObserver' in window) {
        var mo = new MutationObserver(function () {
            modalOpen = window.getComputedStyle(modal).display !== 'none';
            update();
        });
        mo.observe(modal, { attributes: true, attributeFilter: ['style', 'hidden'] });
    }

    function update() {
        if (dismissed) return;
        var doc = document.documentElement;
        var scrollable = (doc.scrollHeight - doc.clientHeight) || 1;
        var pastThreshold = (window.pageYOffset / scrollable) > 0.6;
        if (pastThreshold && !modalOpen) {
            pill.removeAttribute('hidden');
            pill.classList.add('visible');
        } else {
            pill.classList.remove('visible');
        }
    }

    var dismissBtn = document.getElementById('pillDismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', function () {
            dismissed = true;
            pill.classList.remove('visible');
            pill.setAttribute('hidden', '');
            try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* storage unavailable */ }
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// ========== AI TEXTAREA — IDLE AUTO-TYPING PLACEHOLDER ==========
(function () {
    var textarea = document.getElementById('quoteAiInput');
    if (!textarea) return;

    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduce) return; // static placeholder (dict text set by applyLanguage)

    var stopped = false; // permanent stop once the visitor engages
    var timer = null;

    function currentText() {
        var lang = document.documentElement.lang === 'es' ? 'es' : 'en';
        return (translations[lang] && translations[lang]['quote-ai-placeholder']) || '';
    }

    function clearTimer() {
        if (timer) { clearTimeout(timer); timer = null; }
    }

    function stopPermanently() {
        if (stopped) return;
        stopped = true;
        clearTimer();
        textarea.placeholder = currentText(); // leave the full sample visible
    }

    function startLoop() {
        if (stopped) return;
        clearTimer();
        var text = currentText();
        if (!text) return;
        var i = 0;

        function typeNext() {
            if (stopped) return;
            if (i <= text.length) {
                textarea.placeholder = text.slice(0, i);
                i += 1;
                timer = setTimeout(typeNext, 40);
            } else {
                // pause at the end, then clear and loop
                timer = setTimeout(function () {
                    if (stopped) return;
                    textarea.placeholder = '';
                    i = 0;
                    timer = setTimeout(typeNext, 400);
                }, 2500);
            }
        }
        typeNext();
    }

    textarea.addEventListener('focus', stopPermanently);
    textarea.addEventListener('input', stopPermanently);

    document.addEventListener('lang:changed', function () {
        if (!stopped) startLoop(); // restart with the new language's text
    });

    startLoop();
})();


// ========== AGENT INTEREST PREFILL (from /agentes/ "Solicitar demo") ==========
(function () {
    try {
        var slug = sessionStorage.getItem('ag_interest');
        if (!slug) return;
        var msg = document.getElementById('pfMessage') || document.querySelector('#proposalForm textarea[name="message"]');
        var sel = document.getElementById('serviceSelect');
        var lang = localStorage.getItem('preferred-lang') === 'en' ? 'en' : 'es';
        var name = slug.charAt(0).toUpperCase() + slug.slice(1);
        if (msg && !msg.value) {
            msg.value = lang === 'es'
                ? 'Me interesa el agente ' + name + ' que vi en la flota de agentes. Quiero una demo aplicada a mi proceso.'
                : 'I am interested in the ' + name + ' agent I saw in the agent fleet. I would like a demo applied to my process.';
        }
        if (sel) {
            for (var i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === 'automatizacion') { sel.selectedIndex = i; break; }
            }
        }
        sessionStorage.removeItem('ag_interest');
    } catch (e) { /* ignore */ }
})();

// ========== DAY-1 INSTRUMENTATION (storefront spec graft #4) ==========
// CSP-safe: agentes.js and this file dispatch 'optz:evt' CustomEvents
// (hero_cycle, sim_open, prefill, estimator_submit); this listener counts
// them into the localStorage 'optz-metrics' ledger. No network calls.
(function () {
    var KEY = 'optz-metrics';

    function bump(name) {
        if (!name) return;
        try {
            var ledger = JSON.parse(localStorage.getItem(KEY) || '{}');
            if (typeof ledger !== 'object' || ledger === null) ledger = {};
            ledger[name] = (ledger[name] || 0) + 1;
            localStorage.setItem(KEY, JSON.stringify(ledger));
        } catch (e) { /* storage unavailable / corrupt — metrics are best-effort */ }
    }

    document.addEventListener('optz:evt', function (e) {
        var d = e && e.detail;
        if (d && d.name) bump(String(d.name));
    });

    // wa_click: any WhatsApp exit (contact rows, sticky pill, footer, stage CTA).
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
        if (a) bump('wa_click');
    }, true);
})();

/* ============================================================
   COMPARTE OPTIMATIZA — Instagram via Web Share nativo + copiar
   ============================================================ */
(function () {
    var URL_SITE = 'https://optimatiza.com/';
    var TXT = 'Mira esto: agentes de IA que hacen el trabajo \u2014 simulaciones en vivo y precios publicados.';
    function toast(msg) {
        var t = document.querySelector('.share-toast');
        if (!t) { t = document.createElement('div'); t.className = 'share-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('on');
        setTimeout(function () { t.classList.remove('on'); }, 2200);
    }
    function copyLink(doneMsg) {
        var ok = function () { toast(doneMsg); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(URL_SITE).then(ok, ok);
        } else { ok(); }
    }
    function esLang() { try { return localStorage.getItem('preferred-lang') !== 'en'; } catch (e) { return true; } }
    document.querySelectorAll('.js-share-ig').forEach(function (ig) {
        ig.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share({ title: 'Optimatiza', text: TXT, url: URL_SITE }).catch(function () {});
            } else {
                copyLink(esLang() ? 'Enlace copiado \u2014 p\u00e9galo en tu historia o post de Instagram'
                                  : 'Link copied \u2014 paste it into your Instagram story or post');
            }
        });
    });
    document.querySelectorAll('.js-share-copy').forEach(function (cp) {
        cp.addEventListener('click', function () {
            copyLink(esLang() ? 'Enlace copiado' : 'Link copied');
        });
    });
})();


// ========== MONTHLY OPERATION PLANS — toggle mensual/anual (idioma-aware) ==========
(function () {
  var grid = document.getElementById('planes');
  if (!grid) return;
  var cycle = 'monthly';
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function renderPlans() {
    var es = (document.documentElement.lang || 'es') !== 'en';
    var yearly = cycle === 'yearly';
    grid.querySelectorAll('.plan-price').forEach(function (el) {
      var pm = el.getAttribute('data-pm');
      if (!pm) { el.innerHTML = '<span class="plan-amount">' + (es ? 'A medida' : 'Custom') + '</span>'; return; }
      var py = el.getAttribute('data-py'), yt = el.getAttribute('data-yt');
      var amount = yearly ? py : pm;
      var per = es ? '/mes' : '/mo';
      var billed = yearly
        ? ('$' + fmt(yt) + (es ? '/año · facturado anual' : '/yr · billed annually'))
        : (es ? 'Facturado mes a mes' : 'Billed monthly');
      el.innerHTML = '<span class="plan-amount">$' + amount + '</span><span class="plan-per">' + per +
        '</span><span class="plan-billed mono">' + billed + '</span>';
    });
  }
  grid.querySelectorAll('.plan-cycle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      cycle = btn.dataset.cycle;
      grid.querySelectorAll('.plan-cycle-btn').forEach(function (b) {
        var on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderPlans();
    });
  });
  document.addEventListener('optz:lang', renderPlans);
  renderPlans();
})();

/* ============================================================
   Lead magnet: guía 10 procesos — envía email a Formspree por
   fetch y revela el enlace de descarga sin salir de la página.
   ============================================================ */
(function () {
  var form = document.getElementById('guiaForm');
  if (!form) return;
  var done = document.getElementById('guiaDone');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).catch(function () { /* aunque falle el registro, entregamos la guía */ })
      .finally(function () {
        if (done) done.hidden = false;
        if (btn) btn.hidden = true;
        var mail = form.querySelector('input[type="email"]');
        if (mail) mail.disabled = true;
      });
  });
})();


/* Hero: 'escribile a un agente ahora' abre el chat Nova (demo real) */
(function () {
  var btn = document.getElementById('heroTryAgent');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var fab = document.getElementById('nvFab');
    if (fab) { fab.click(); }
    else { location.href = 'https://wa.me/50371928070?text=' + encodeURIComponent('Hola, quiero ver un agente funcionando.'); }
  });
})();
