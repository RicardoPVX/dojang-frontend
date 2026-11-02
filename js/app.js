'use strict';
/* ── Pintar ── */
function pintar(conservar = true) {
  const k = conservar && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.key;
  document.body.classList.toggle('sin-sesion', !SESION);
  document.body.classList.toggle('familia', esFamilia());
  if (!SESION) return;
  if (esFamilia()) { pintarFamilia(); return; }
  if (!VISTAS[S.v] || !pantallasPermitidas().includes(S.v)) S.v = 'hoy';
  main.innerHTML = VISTAS[S.v]();
  pintarNav();
  document.getElementById('side-pie').innerHTML = `<b>${esc(SESION.nombre || SESION.username)}</b>${esAdmin() ? 'Administración' : 'Maestro'}`;
  if (S.v === 'cobros') montaTira();
  observar();
  if (k) { const n = main.querySelector(`[data-key="${k}"]`); n && n.focus({ preventScroll: true }); }
  document.title = TIT[S.v] + ' — Dojang';
}
const pantallasPermitidas = () => esAdmin() ? Object.keys(VISTAS) : ['hoy', 'calendario', 'familias', 'mas', 'clases'];
function repinta() { pintar(); refrescaIns(); }
let obs;
function observar() {
  obs && obs.disconnect();
  const t = main.querySelector('[data-t]'), b = document.getElementById('barra'); if (!t || !b) return;
  obs = new IntersectionObserver(([e]) => b.classList.toggle('con-borde', !e.isIntersecting), { rootMargin: '-52px 0px 0px 0px' });
  obs.observe(t);
}
function ver(v) { S.v = v; if (v === 'movimientos') S.mov = null; cerrarIns(true); pintar(false); scrollTo(0, 0); }

/* ── Entrar ── */
const LOGOS = '<div class="entrar-logos"><img src="assets/logo-moonmoowon.png" alt="Moon Moo Won"><img src="assets/logo-mdk.png" alt="Moo Duk Kwan"></div>';
function vEntrar(msg) {
  document.title = 'Entrar — Dojang';
  main.innerHTML = `<div class="entrar">${LOGOS}<h1>Dojang</h1><p>MMW MDK La Industrial</p>
  <form id="f-entrar" novalidate><label class="campo"><span>ID</span><input id="f-id" autocomplete="username" autocapitalize="characters" spellcheck="false"></label><label class="campo"><span>Contraseña</span><input id="f-pass" type="password" autocomplete="current-password"></label><p class="err" id="f-err" role="alert" ${msg ? '' : 'hidden'}>${esc(msg || '')}</p><button class="btn btn-1 btn-g" id="f-btn">Entrar</button></form>
  <p class="ayuda">Familias: sirve el ID de cualquiera de sus hijos.<br>¿Primera vez? Escribe CAMBIAR como contraseña y elige la tuya.</p></div>`;
  document.getElementById('f-id').focus();
}
function vCambiar(temp) {
  main.innerHTML = `<div class="entrar">${LOGOS}<h1>Elige tu contraseña</h1><p>Solo la usarás tú, con tu ID ${esc(temp.username)}.</p>
  <form id="f-cambiar" novalidate><label class="campo"><span>Contraseña nueva</span><input id="f-n1" type="password" autocomplete="new-password"></label><label class="campo"><span>Repítela</span><input id="f-n2" type="password" autocomplete="new-password"></label><p class="err" id="f-err" role="alert" hidden></p><button class="btn btn-1 btn-g" id="f-btn">Guardar y entrar</button></form></div>`;
  document.getElementById('f-n1').focus();
  temporal = temp;
}
let temporal = null;
function vCarga(msg) {
  main.innerHTML = `<div class="carga"><img src="assets/logo-moonmoowon.png" alt=""><span id="carga-t">${esc(msg)}</span></div>`;
}
function entrarCon(d) {
  SESION = { token: d.token, rol: d.rol, username: d.username, nombre: d.nombre };
  guardar('dojang-sesion', SESION);
  S.v = 'hoy'; S.famHijo = 0; S.mov = null; S.buscar = ''; S.filtro = 'todos';
  arrancar();
}
async function arrancar() {
  document.body.classList.add('sin-sesion'); document.body.classList.remove('familia');
  vCarga('Preparando tu información…');
  // El servidor gratuito se duerme: si tarda, se explica en vez de parecer roto
  const lento = setTimeout(() => { const n = document.getElementById('carga-t'); if (n) n.textContent = 'Despertando el servidor. Puede tardar hasta un minuto…'; }, 4000);
  try {
    await cargarDatos();
    clearTimeout(lento);
    ultimaCarga = Date.now();
    pintar(false);
    document.getElementById('reg-t').textContent = esAdmin() ? 'Registrar…' : 'Buscar…';
    document.getElementById('reg-ico').innerHTML = ico(esAdmin() ? 'mas' : 'lupa', 18);
    document.getElementById('cmd-ico').innerHTML = ico(esAdmin() ? 'mas' : 'lupa', 20);
  } catch (e) {
    clearTimeout(lento);
    if (!SESION) return;   // la sesión venció y ya se mostró la entrada
    main.innerHTML = `<div class="carga"><img src="assets/logo-moonmoowon.png" alt="" style="animation:none"><span>${esc(e.red ? 'No hay conexión con el servidor.' : e.message)}</span><button class="btn btn-1" data-act="reintentar">Reintentar</button></div>`;
  }
}
ACC.reintentar = arrancar;
function cerrarSesion(msg) {
  SESION = null; guardar('dojang-sesion', null); vaciarDatos(); cerrarIns(true); ocultarAviso(); cierraCmd();
  deshacerFn = null; reintentoFn = null;
  pintar(false); vEntrar(msg); scrollTo(0, 0);
}
function sesionVencida() { cerrarSesion('Tu sesión terminó. Vuelve a entrar.'); }
ACC.salir = () => cerrarSesion();
main.addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = document.getElementById('f-err'), btn = document.getElementById('f-btn'), txt = btn.textContent;
  const mal = (m) => { err.textContent = m; err.hidden = false; btn.disabled = false; btn.textContent = txt; };
  err.hidden = true;
  if (e.target.id === 'f-entrar') {
    const id = document.getElementById('f-id').value.trim(), password = document.getElementById('f-pass').value;
    if (!id || !password) return mal('Escribe tu ID y tu contraseña.');
    const username = id === '0001' ? 'admin' : id;   // el ID con el que entra la administración
    btn.disabled = true; btn.textContent = 'Entrando…';
    const lento = setTimeout(() => { if (btn.isConnected) btn.textContent = 'Despertando el servidor…'; }, 4000);
    try {
      const d = await api('/api/auth/login', { method: 'POST', body: { username, password } });
      if (d.debe_cambiar) vCambiar(d); else entrarCon(d);
    } catch (x) {
      mal(x.status === 401 ? 'ID o contraseña incorrectos.' : x.red ? 'No hay conexión con el servidor. Intenta de nuevo.' : x.message);
    } finally { clearTimeout(lento); }
  } else if (e.target.id === 'f-cambiar') {
    const a = document.getElementById('f-n1').value, b = document.getElementById('f-n2').value;
    if (a.length < 6) return mal('Usa al menos 6 caracteres.');
    if (a !== b) return mal('Las contraseñas no coinciden.');
    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      await api('/api/auth/cambiar-pass', { method: 'POST', token: temporal.token, body: { nuevaPassword: a } });
      const d = await api('/api/auth/login', { method: 'POST', body: { username: temporal.username, password: a } });
      temporal = null; entrarCon(d);
    } catch (x) { mal(x.red ? 'No hay conexión con el servidor. Intenta de nuevo.' : x.message); }
  }
});

/* ── Tema ── */
function aplicaTema(t) { document.documentElement.dataset.theme = t; document.querySelector('meta[name=theme-color]').content = t === 'dark' ? '#0c0f15' : '#f4f4f1'; }
ACC.tema = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; aplicaTema(t);
  try { localStorage.setItem('dojang-tema', t); } catch (_) {}
};
(() => { let t = null; try { t = localStorage.getItem('dojang-tema'); } catch (_) {} aplicaTema(t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); })();

/* ── Clics y teclado ── */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  if (performance.now() - trasDeslizar < 220) return;   // el dedo venía deslizando, no tocando
  const f = ACC[t.dataset.act]; if (f) f(t, e);
});
// Nada de animar lo que se repite cien veces al día
document.addEventListener('keydown', (e) => {
  if (!SESION) return;
  const enCampo = /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName), mod = e.ctrlKey || e.metaKey, escuela = !esFamilia();
  if (mod && e.key.toLowerCase() === 'k' && escuela) { e.preventDefault(); cmd.classList.contains('abierto') ? cierraCmd() : abreCmd(''); return; }
  if (mod && e.key.toLowerCase() === 'z' && !enCampo) { e.preventDefault(); hacerDeshacer(); return; }
  if (e.key === 'Escape') { if (cmd.classList.contains('abierto')) cierraCmd(); else if (insAbierta) atrasIns(); else if (enCampo) document.activeElement.blur(); return; }
  if (enCampo || cmd.classList.contains('abierto') || mod || !escuela) return;
  if (e.key === '/') { e.preventDefault(); abreCmd(''); return; }
  const ps = pantallas();
  if (/^[1-5]$/.test(e.key) && ps[+e.key - 1]) { ver(ps[+e.key - 1][0]); return; }
  if (S.v === 'cobros' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !document.activeElement.closest('[data-slider]')) {
    const ms = mesesTira(), k = ms.indexOf(S.mesI) + (e.key === 'ArrowRight' ? 1 : -1);
    if (ms[k] !== undefined) document.getElementById('tira')._ir(ms[k]);
    return;
  }
  const filas = [...main.querySelectorAll('.fila[tabindex]')];
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!filas.length) return;
    e.preventDefault();
    const k = filas.indexOf(document.activeElement), n = e.key === 'ArrowDown' ? Math.min(filas.length - 1, k + 1) : Math.max(0, k - 1);
    filas[k < 0 ? 0 : n].focus(); return;
  }
  const f = document.activeElement.closest && document.activeElement.closest('.fila[tabindex]');
  if (f) {
    if (e.key === 'Enter') { e.preventDefault(); f.click(); }
    else if (e.key === ' ') {
      const row = f.closest('.swipe-row');
      if (row) { e.preventDefault(); const sig = filas[filas.indexOf(f) + 1]; cobrarDesdeFila(row); sig && sig.focus({ preventScroll: true }); }
    }
  }
});

/* ── Mantener los datos al día entre dispositivos ── */
let ultimaCarga = 0;
document.addEventListener('visibilitychange', async () => {
  if (document.hidden || !SESION || enVuelo || Date.now() - ultimaCarga < 120000) return;
  if (insAbierta || cmd.classList.contains('abierto') || document.activeElement.tagName === 'INPUT') return;
  ultimaCarga = Date.now();
  try { await cargarDatos(); if (!insAbierta) pintar(); } catch (_) {}
});
addEventListener('resize', () => {
  if (!SESION) return;
  if (document.getElementById('tira')) montaTira();
  if (document.getElementById('pasa')) montaPases(D.alumnos.length);
  if (insAbierta) { insH && insH.alto(); colocaIns(0); }
});

document.getElementById('kbd').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
if (SESION) arrancar(); else { pintar(false); vEntrar(); }
