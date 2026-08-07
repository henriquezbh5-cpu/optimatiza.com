/* Extraido del HTML: la CSP de este sitio no admite scripts en linea
   (script-src 'self'), asi que vivir aqui es lo que lo hace funcionar. */
const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
  const $ = id => document.getElementById(id);
  const ventas = $('ventas'), ventasN = $('ventasN'), mora = $('mora'), dias = $('dias');

  function calc(){
    const V = +ventas.value, p = +mora.value/100, d = +dias.value;
    const frozen = V * p * (d/30);        // capital promedio atrapado en mora
    $('vVentas').textContent = fmt(V);
    $('vMora').textContent = mora.value + '%';
    $('vDias').textContent = dias.value + ' días';
    $('frozen').textContent = fmt(frozen);
    $('anual').textContent = fmt(V*12*p) + ' vencen/año';
    $('miniVentas').textContent = fmt(V);
    // WhatsApp precargado con el número que calculó el dueño (lead tibio y específico)
    const msg = `Hola, calculé mi cartera vencida en la web: ~${fmt(frozen)} congelados (${mora.value}% de mora, ${dias.value} días de atraso). Quiero ver el Cobrador Digital con mis datos.`;
    $('waCta').href = 'https://wa.me/50371928070?text=' + encodeURIComponent(msg);
  }
  // sincronizar slider <-> input numérico
  ventas.addEventListener('input', () => { ventasN.value = ventas.value; calc(); });
  ventasN.addEventListener('input', () => {
    let v = Math.max(0, +ventasN.value||0);
    ventas.value = Math.min(+ventas.max, Math.max(+ventas.min, v));
    calc();
  });
  mora.addEventListener('input', calc);
  dias.addEventListener('input', calc);
  calc();
