/* Extraido del HTML: la CSP de este sitio no admite scripts en linea
   (script-src 'self'), asi que vivir aqui es lo que lo hace funcionar. */
var q = new URLSearchParams(location.search);
  var code = q.get("code") || "";
  var el = document.getElementById("code");
  if (code) {
    el.textContent = code;
    // El codigo ya esta en memoria: se retira de la URL para que no quede
    // en el historial, en la omnibox ni en una captura de pantalla.
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    document.getElementById("msg").textContent = "Autorización correcta. Copie el código:";
  } else {
    document.getElementById("msg").textContent = "No se encontró ningún código en la URL (" + (q.get("error_description") || q.get("error") || "sin parámetros") + ").";
  }
  document.getElementById("copy").addEventListener("click", function () {
    navigator.clipboard.writeText(code).then(function () {
      document.getElementById("copy").textContent = "Copiado";
    });
  });
