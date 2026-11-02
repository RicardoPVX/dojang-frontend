'use strict';
/* ── Estado de la pantalla y acciones ── */
const S = { v: 'hoy', mesI: Math.max(HOY_I, INICIO), filtro: 'todos', buscar: '', calI: HOY_I, calDia: new Date(HOY), famHijo: 0, mov: null };
const ACC = {};   // data-act → función; cada módulo registra las suyas
const main = document.getElementById('main');

/* ── Panel: al lado en computadora, hoja arrastrable en celular ── */
const ins = document.getElementById('ins'), velo = document.getElementById('velo');
const esHoja = () => innerWidth < 900;
let insId = null, insPos = null, insH = null, insAbierta = false, insPlan = null, insVolver = null;

function colocaIns(p) {
  insPos = p;
  if (esHoja()) {
    ins.style.transform = `translateY(${p}px)`;
    const H = ins.offsetHeight || 1;
    velo.style.opacity = Math.max(0, Math.min(1, 1 - p / H));
    velo.style.pointerEvents = p < H - 4 ? 'auto' : 'none';
  } else {
    ins.style.transform = `translateX(${p}px)`;
    // Si no cabe junto a la lista, flota encima y atenúa el fondo; si cabe, no estorba
    const encima = innerWidth < 1240 || document.body.classList.contains('familia'), W = ins.offsetWidth + 24;
    velo.style.opacity = encima ? Math.max(0, Math.min(1, 1 - p / W)) : 0;
    velo.style.pointerEvents = encima && p < W - 4 ? 'auto' : 'none';
  }
}
const paradas = () => { const H = ins.offsetHeight; return esHoja() ? (ins.classList.contains('auto') ? [0, H] : [0, Math.round(H * .42), H]) : [0, ins.offsetWidth + 24]; };
function mueveIns(a, v = 0, d = 1, fin) { insH && insH.alto(); insH = resorte({ de: insPos ?? a, a, v, r: esHoja() ? .32 : .34, d, eps: .5, fn: colocaIns, fin }); }
function presentarIns(a) {
  insAbierta = true; document.body.classList.add('con-ins'); ins.style.visibility = 'visible';
  if (insPos === null) colocaIns(paradas().slice(-1)[0]);
  mueveIns(a, 0, esHoja() ? .82 : 1);
}
function abreIns(id, plan, arriba) {
  ins.classList.remove('auto'); insVolver = null; insId = id; insPlan = plan || null; insAbierta = true;
  refrescaIns();
  const ps = paradas();
  presentarIns(esHoja() && !plan && !arriba ? ps[1] : 0);
}
function abreHoja(titulo, sub, cuerpo, op = {}) {
  insId = null; insPlan = null; insVolver = op.volver || null; ins.classList.toggle('auto', !op.completa);
  ins.innerHTML = `<div class="ins-agarre" data-agarre><i></i></div><div class="ins-cab" data-agarre><div style="min-width:0"><h2>${esc(titulo)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div><button class="cerrar" data-act="cerrar-ins" aria-label="Cerrar">${ico(insVolver ? 'atras' : 'x', 15)}</button></div><div class="ins-cuerpo">${cuerpo}</div>`;
  presentarIns(0);
  if (op.foco) { const n = ins.querySelector(op.foco); n && n.focus({ preventScroll: true }); }
}
function cerrarIns(ya) {
  if (!insAbierta && ya !== true) return;
  insAbierta = false; insId = null; insVolver = null; document.body.classList.remove('con-ins');
  if (ya === true) { insH && insH.alto(); ins.style.visibility = 'hidden'; insPos = null; velo.style.opacity = 0; velo.style.pointerEvents = 'none'; return; }
  mueveIns(paradas().slice(-1)[0], 0, 1, () => { if (!insAbierta) { ins.style.visibility = 'hidden'; insPos = null; } });
}
function atrasIns() { if (insVolver) { const v = insVolver; abreIns(v, null, true); } else cerrarIns(); }
velo.addEventListener('click', () => cerrarIns());
ACC['cerrar-ins'] = atrasIns;

// Arrastrar la hoja: 1:1, resistencia arriba, y al soltar proyecta a la parada más cercana
ins.addEventListener('pointerdown', (e) => {
  if (!esHoja() || !e.target.closest('[data-agarre]') || e.target.closest('button')) return;
  insH && insH.alto();
  const y0 = e.clientY, p0 = insPos, ras = rastro();
  ins.setPointerCapture(e.pointerId); ras.add(e.clientY);
  const mv = (ev) => { ras.add(ev.clientY); let p = p0 + ev.clientY - y0; if (p < 0) p = elastico(p, ins.offsetHeight); colocaIns(p); };
  const up = () => {
    ins.removeEventListener('pointermove', mv); ins.removeEventListener('pointerup', up); ins.removeEventListener('pointercancel', up);
    const v = ras.v(), dest = insPos + proyectar(v, .99), ps = paradas(), a = ps.reduce((m, x) => Math.abs(x - dest) < Math.abs(m - dest) ? x : m, ps[0]);
    if (a === ps[ps.length - 1]) {
      insAbierta = false; insId = null; insVolver = null; document.body.classList.remove('con-ins');
      mueveIns(a, v, 1, () => { if (!insAbierta) { ins.style.visibility = 'hidden'; insPos = null; } });
    } else mueveIns(a, v, .82);
  };
  ins.addEventListener('pointermove', mv); ins.addEventListener('pointerup', up); ins.addEventListener('pointercancel', up);
});

/* ── Formularios ── */
const campo = (etq, html) => `<label class="campo"><span>${esc(etq)}</span>${html}</label>`;
const val = (id) => { const n = document.getElementById(id); return n ? n.value.trim() : ''; };
const FORM_ERR = '<p class="form-err" hidden role="alert"></p>';
function errorForm(msg) { const n = ins.querySelector('.form-err'); if (n) { n.textContent = msg; n.hidden = false; n.scrollIntoView({ block: 'nearest' }); } else falla(msg); }
// Lo que no se puede deshacer con un toque espera al servidor antes de cerrar
async function enviarForm(btn, fn) {
  const n = ins.querySelector('.form-err'); if (n) n.hidden = true;
  const txt = btn.textContent; btn.disabled = true; btn.textContent = 'Guardando…';
  try { await escribir(fn); }
  catch (e) { errorForm(e.red ? 'No hay conexión. Intenta de nuevo.' : e.message); if (btn.isConnected) { btn.disabled = false; btn.textContent = txt; } }
}

/* Solo lo irreversible pide confirmación; lo demás se deshace */
let confirmaFn = null, confirmaTexto = null;
function hojaConfirma({ titulo, texto, boton, escribe, fn, volver }) {
  confirmaFn = fn; confirmaTexto = escribe || null;
  abreHoja(titulo, '', `<p class="nota-h">${esc(texto)}</p>${escribe ? campo(`Escribe “${escribe}” para confirmar`, '<input id="conf-t" autocomplete="off" data-conf>') : ''}${FORM_ERR}<button class="btn btn-peligro btn-g" data-act="confirmar" id="conf-b" ${escribe ? 'disabled' : ''}>${esc(boton)}</button>`, { volver });
}
ACC.confirmar = (t) => { if (confirmaFn) enviarForm(t, confirmaFn); };
ins.addEventListener('input', (e) => {
  if (e.target.matches('[data-conf]')) document.getElementById('conf-b').disabled = norm(e.target.value.trim()) !== norm(confirmaTexto);
});

/* La contraseña temporal se muestra una sola vez */
function hojaAcceso(usuario, pass, volver) {
  abreHoja('Acceso de la familia', 'Se muestra solo esta vez', `<div class="acceso"><small>ID</small><b>${esc(usuario)}</b></div><div class="acceso"><small>Contraseña temporal</small><b id="acc-p">${esc(pass)}</b></div><button class="btn btn-2 btn-g" data-act="copiar-acceso" data-u="${esc(usuario)}" data-p="${esc(pass)}">Copiar para enviar</button><p class="nota-h" style="margin-top:10px">Al entrar, la familia elegirá su propia contraseña.</p>`, { volver });
}
ACC['copiar-acceso'] = async (t) => {
  try { await navigator.clipboard.writeText(`Portal MMW MDK\nID: ${t.dataset.u}\nContraseña temporal: ${t.dataset.p}`); t.textContent = 'Copiado'; }
  catch (_) { t.textContent = 'No se pudo copiar: selecciónala a mano'; }
};
