'use strict';
/* ── Reglas de la escuela ── */
const CUOTA = 500;
const INICIO = 2027 * 12 + 10;   // Las mensualidades corren desde noviembre de 2027
const MESES_EXAMEN = 2;
const API_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3001'
  : 'https://dojang-backend-niwf.onrender.com';

// Solo en pruebas locales se puede simular otra fecha: ?hoy=2028-02-16
const HOY = (() => {
  const q = API_URL.includes('localhost') && new URLSearchParams(location.search).get('hoy');
  const d = q ? fechaDe(q) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();
const HOY_I = HOY.getFullYear() * 12 + HOY.getMonth();

const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MES3 = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIA = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIA3 = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const KC = { examen:'#c58a12', torneo:'#2b6cb0', fogueo:'#c53030', otro:'#6b46c1', cobro:'#1b7340' };
const TIPO = { examen:'Examen', torneo:'Torneo', fogueo:'Fogueo', otro:'Otro' };

// Los 13 grados en su orden real; el id es el de la tabla cintas
const BELTS = [
  {id:1,n:'Blanco',g:'',c:'#f2f2ee',t:'#3a3f4a'},{id:2,n:'Amarillo',g:'10 Kup',c:'#f4d548',t:'#4c3c00'},{id:3,n:'Naranja',g:'9 Kup',c:'#ee8a2a',t:'#3f1f00'},
  {id:9,n:'Naranja Avanzado',g:'8 Kup',c:'#ee8a2a',t:'#3f1f00',f:'#2f9e54'},{id:4,n:'Verde',g:'7 Kup',c:'#2f9e54',t:'#fff'},{id:10,n:'Verde Avanzado',g:'6 Kup',c:'#2f9e54',t:'#fff',f:'#2563c4'},
  {id:5,n:'Azul',g:'5 Kup',c:'#2563c4',t:'#fff'},{id:11,n:'Azul Avanzado',g:'4 Kup',c:'#2563c4',t:'#fff',f:'#7a4a26'},{id:6,n:'Marrón',g:'3 Kup',c:'#7a4a26',t:'#fff'},
  {id:12,n:'Marrón Avanzado',g:'2 Kup',c:'#7a4a26',t:'#fff',f:'#c8281e'},{id:7,n:'Rojo',g:'1 Kup',c:'#c8281e',t:'#fff'},{id:13,n:'Rojo Avanzado',g:'Ieby Poom / Ieby Dan',c:'#c8281e',t:'#fff',f:'#111'},{id:8,n:'Negro',g:'',c:'#16181d',t:'#fff'}];
const beltI = (id) => Math.max(0, BELTS.findIndex(b => b.id === +id));
const gradoTxt = (b) => b.n + (b.g ? ' · ' + b.g : '');

/* ── Utilidades ── */
const $$ = (n) => '$' + (+n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 });
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
function fechaDe(v) { const [y, m, d] = String(v).split('T')[0].split('-').map(Number); return new Date(y, m - 1, d); }
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const fCorta = (d) => d.getDate() + ' ' + MES3[d.getMonth()];
const fLarga = (d) => d.getDate() + ' ' + MES3[d.getMonth()] + ' ' + d.getFullYear();
const mismoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const nom1 = (s) => s.n.split(' ')[0];
const textoAtraso = (d) => d === 0 ? 'vence hoy' : d === 1 ? 'venció ayer' : 'hace ' + d + ' días';
const leer = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (_) { return null; } };
const guardar = (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

const ICON = {
  hoy:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',cobros:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',familias:'<circle cx="9" cy="8.5" r="3.3"/><path d="M3.2 19.5a5.8 5.8 0 0111.6 0M16 5.6a3.2 3.2 0 010 5.9M17.5 14.3a5.6 5.6 0 013.3 5.2"/>',
  mas:'<path d="M12 5v14M5 12h14"/>',puntos:'<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',lupa:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',persona:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.2 7.2 0 0114.4 0"/>',
  evento:'<path d="M5 20V5l7 3 7-3v15"/>',msg:'<path d="M4.5 6.5h15v10h-9l-4 3.5v-3.5h-2z"/>',atras:'<path d="M14.5 5.5L8 12l6.5 6.5"/>',sig:'<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
  caja:'<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/>',lista:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'
};
const ico = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const av = (s) => { const b = BELTS[s.cinta]; return `<span class="av" style="background:${b.c};color:${b.t}">${esc(s.n[0])}</span>`; };

/* ── Física: resortes interrumpibles (amortiguación + respuesta) ── */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
function resorte(o) {
  if (reduce.matches) { o.fn(o.a); o.fin && o.fin(); return { alto() {}, get x() { return o.a; }, get v() { return 0; } }; }
  let x = o.de, v = o.v || 0, ult = performance.now(), raf, parado = false;
  const k = (2 * Math.PI / o.r) ** 2, c = 4 * Math.PI * (o.d ?? 1) / o.r, eps = o.eps || .25;
  const acabar = () => { if (parado) return; parado = true; cancelAnimationFrame(raf); clearTimeout(g); x = o.a; v = 0; o.fn(x); o.fin && o.fin(); };
  const g = setTimeout(acabar, 1600); // si el navegador pausa la pestaña, no se queda a medias
  function paso(t) {
    if (parado) return;
    const dt = Math.min((t - ult) / 1000, 1 / 30); ult = t;
    for (let i = 0; i < 4; i++) { const h = dt / 4, a = -k * (x - o.a) - c * v; v += a * h; x += v * h; }
    if (Math.abs(x - o.a) < eps && Math.abs(v) < eps * 12) return acabar();
    o.fn(x); raf = requestAnimationFrame(paso);
  }
  raf = requestAnimationFrame(paso);
  return { alto() { parado = true; cancelAnimationFrame(raf); clearTimeout(g); }, get x() { return x; }, get v() { return v; } };
}
const proyectar = (v, d = .998) => v / 1000 * d / (1 - d);
const elastico = (s, dim, k = .55) => s * dim * k / (dim + k * Math.abs(s));
function rastro() {
  const h = [];
  return {
    add(x) { const t = performance.now(); h.push([x, t]); while (h.length > 1 && t - h[0][1] > 100) h.shift(); },
    v() { if (h.length < 2) return 0; const a = h[0], b = h[h.length - 1], dt = (b[1] - a[1]) / 1000; return dt > 0 ? (b[0] - a[0]) / dt : 0; }
  };
}
const vibra = (ms = 10) => { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms); };

/* ── Sesión y API ── */
let SESION = leer('dojang-sesion');
const esAdmin = () => SESION && SESION.rol === 'admin';
const esFamilia = () => SESION && SESION.rol === 'responsable';

async function api(ruta, op = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = op.token || (SESION && SESION.token);
  if (token) headers.Authorization = 'Bearer ' + token;
  let res;
  try {
    res = await fetch(API_URL + ruta, { method: op.method || 'GET', headers, body: op.body ? JSON.stringify(op.body) : undefined });
  } catch (_) {
    const e = new Error('No hay conexión con el servidor'); e.red = true; throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.error || 'Error ' + res.status); e.status = res.status; e.data = data;
    if (res.status === 401 && SESION && ruta !== '/api/auth/login') sesionVencida();
    throw e;
  }
  return data;
}

/* ── Datos ── */
const D = { alumnos: [], pagos: [], eventos: [], examenes: [], dudas: [], clases: [], equipo: [], maestros: [] };
const mapAlumno = (a) => ({
  id: a.num_control, n: a.nombre, resp: a.num_control_responsable, tutor: a.responsable_nombre || '', tel: a.responsable_tel || '',
  par: a.parentesco || '', cinta: beltI(a.id_cinta_actual), dia: a.dia_pago === 15 ? 15 : 1, login: a.usuario_login || a.num_control,
  nac: a.fecha_nacimiento ? String(a.fecha_nacimiento).split('T')[0] : '', ingreso: a.fecha_ingreso ? fechaDe(a.fecha_ingreso) : new Date(HOY),
  edad: a.fecha_nacimiento ? Math.floor((HOY - fechaDe(a.fecha_nacimiento)) / (365.25 * 864e5)) : null,
  email: a.email || '', dir: a.direccion || '', sangre: a.tipo_sangre || '', emer: a.contacto_emergencia || '', telEmer: a.tel_emergencia || '', med: a.notas_medicas || '',
  claseId: a.id_clase ? String(a.id_clase) : '', claseN: a.clase_nombre || '', claseDias: a.clase_dias || '', claseIni: (a.clase_hora_inicio || '').slice(0, 5), claseFin: (a.clase_hora_fin || '').slice(0, 5)
});
const mapPago = (p) => ({
  id: p.id_pago, resp: p.num_control_responsable, alumno: p.num_control_alumno || null, concepto: p.tipo_pago || 'Pago',
  total: parseFloat(p.monto_total) || 0, abonado: parseFloat(p.monto_abonado) || 0, fecha: p.fecha_pago ? fechaDe(p.fecha_pago) : new Date(HOY),
  estado: p.estado_pago || 'Pendiente', mes: parseInt(p.mes_correspondiente) || null, anio: p.anio_correspondiente || null, tutor: p.responsable_nombre || '', notas: p.notas || ''
});
const mapEvento = (e) => ({ id: e.id_evento, t: e.titulo || '', k: KC[e.tipo] ? e.tipo : 'otro', d: e.fecha ? fechaDe(e.fecha) : new Date(HOY), l: e.lugar || '', desc: e.descripcion || '' });
const mapExamen = (x) => ({ id: x.id_examen, al: x.num_control_alumno || null, d: x.fecha ? fechaDe(x.fecha) : new Date(HOY), r: x.resultado || 'Pendiente', cinta: x.id_cinta_aspirada ? beltI(x.id_cinta_aspirada) : null, obs: x.observaciones || '', nombre: x.nombre_examen || '', sede: x.sede || '' });
const mapDuda = (d) => ({ id: d.id_duda, de: d.remitente || 'Familia', resp: d.num_control || null, t: d.mensaje || '', al: d.num_control_alumno || null, f: d.fecha ? new Date(d.fecha) : new Date(), leida: !!d.leido });
const mapClase = (c) => ({ id: String(c.id_clase), n: c.nombre || 'Clase', dias: c.dia_semana || '', ini: (c.hora_inicio || '').slice(0, 5), fin: (c.hora_fin || '').slice(0, 5), maestro: c.id_instructor ? String(c.id_instructor) : '', maestroN: c.instructor_nombre || '' });
const mapEquipo = (e) => ({ id: e.id_articulo, n: e.descripcion || '', talla: e.talla_modelo || '', precio: parseFloat(e.precio_unitario) || 0, stock: parseInt(e.stock) || 0, min: parseInt(e.stock_minimo) ?? 2 });
const mapMaestro = (i) => ({ id: String(i.id_instructor), n: i.nombre || '', cargo: i.cargo || '', grado: i.grado_cinta || '', email: i.email || '', tel: i.telefono || '', usuario: i.username || '' });

async function cargarDatos() {
  const rol = SESION.rol, pide = { alumnos: '/api/alumnos', eventos: '/api/eventos', examenes: '/api/examenes' };
  if (rol !== 'instructor') { pide.pagos = '/api/pagos'; pide.dudas = '/api/dudas'; }
  if (rol !== 'responsable') pide.clases = '/api/clases';
  if (rol === 'admin') { pide.equipo = '/api/equipo'; pide.maestros = '/api/instructores'; }
  const claves = Object.keys(pide), res = await Promise.all(claves.map(k => api(pide[k])));
  const mapa = { alumnos: mapAlumno, pagos: mapPago, eventos: mapEvento, examenes: mapExamen, dudas: mapDuda, clases: mapClase, equipo: mapEquipo, maestros: mapMaestro };
  claves.forEach((k, i) => { D[k] = res[i].map(mapa[k]); });
  reindexa();
}
function vaciarDatos() { Object.keys(D).forEach(k => { D[k] = []; }); reindexa(); }

const al = (id) => D.alumnos.find(s => s.id === id);
const hijos = (resp) => D.alumnos.filter(s => s.resp === resp);
const esMens = (p) => p.concepto === 'Mensualidad';
const planes = () => D.pagos.filter(p => !esMens(p));
const planesDe = (s) => planes().filter(p => p.alumno === s.id || (!p.alumno && p.resp === s.resp));

/* Una mensualidad cuenta para el mes que se pagó, no para la fecha en que se registró */
let indice = new Map();
const mesDePago = (p) => p.mes ? p.anio * 12 + p.mes - 1 : p.fecha.getFullYear() * 12 + p.fecha.getMonth();
function reindexa() {
  indice = new Map();
  D.pagos.filter(esMens).forEach(p => {
    const i = mesDePago(p);
    if (p.alumno) indice.set(p.alumno + ':' + i, p);
    else hijos(p.resp).forEach(s => indice.set(s.id + ':' + i, p));   // los antiguos sin alumno se identifican por su tutor
  });
}
const inicioDe = (s) => Math.max(INICIO, s.ingreso.getFullYear() * 12 + s.ingreso.getMonth());
function estado(s, i) {
  const p = indice.get(s.id + ':' + i);
  if (p) return { t: 'pagado', p, f: p.fecha };
  if (i < inicioDe(s)) return { t: 'na' };
  const due = new Date(Math.floor(i / 12), i % 12, s.dia);
  if (due > HOY) return { t: 'futuro', due };
  return { t: 'debe', due, dias: Math.round((HOY - due) / 864e5) };
}
function pendientes() {
  const r = [];
  D.alumnos.forEach(s => { for (let i = inicioDe(s); i <= HOY_I; i++) { const e = estado(s, i); if (e.t === 'debe') r.push({ s, i, dias: e.dias }); } });
  return r.sort((a, b) => b.dias - a.dias);
}
const pendientesDe = (s) => pendientes().filter(p => p.s.id === s.id);
const examenesDe = (s) => D.examenes.filter(x => x.al === s.id).sort((a, b) => b.d - a.d);
function proxExamen(s) {
  const x = examenesDe(s)[0], d = new Date(x ? x.d : s.ingreso);
  d.setMonth(d.getMonth() + MESES_EXAMEN);
  return d;
}
const listosExamen = () => D.alumnos.filter(s => s.cinta < BELTS.length - 1 && proxExamen(s) <= HOY);
const inicioMeses = () => Math.max(HOY_I - 4, INICIO);

const NUM_DIA = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
const diasDe = (txt) => String(txt || '').split(',').map(x => NUM_DIA[norm(x).trim()]).filter(x => x !== undefined);
const diasTxt = (txt) => { const d = diasDe(txt); return d.length ? d.map(x => DIA3[x]).join(', ') : ''; };
function proxClase(s) {
  const dias = diasDe(s.claseDias); if (!dias.length) return null;
  const ahora = new Date(), [h, m] = (s.claseFin || '23:59').split(':').map(Number);
  const yaPaso = mismoDia(ahora, HOY) && (ahora.getHours() * 60 + ahora.getMinutes() > h * 60 + m);
  for (let k = yaPaso ? 1 : 0; k < 9; k++) {
    const d = new Date(HOY); d.setDate(d.getDate() + k);
    if (dias.includes(d.getDay())) return { d, cuando: k === 0 ? 'hoy' : k === 1 ? 'mañana' : 'el ' + DIA[d.getDay()] };
  }
  return null;
}

/* ── Escrituras: la pantalla no espera al servidor, y si falla lo dice y permite reintentar ── */
let enVuelo = 0, tGuardando;
const indGuardando = document.getElementById('guardando');
async function escribir(fn) {
  enVuelo++;
  clearTimeout(tGuardando);
  tGuardando = setTimeout(() => indGuardando.classList.add('ver'), 1200);
  try { return await fn(); }
  finally {
    enVuelo--;
    if (!enVuelo) { clearTimeout(tGuardando); indGuardando.classList.remove('ver'); }
  }
}
addEventListener('beforeunload', (e) => { if (enVuelo) { e.preventDefault(); e.returnValue = ''; } });

/* ── Aviso con deshacer ── */
let deshacerFn = null, reintentoFn = null, avisoT, avisoH;
const avisoEl = document.getElementById('aviso'), avisoTx = document.getElementById('aviso-t'), avisoBt = document.getElementById('aviso-b');
function mostrarAviso(t, boton, dura) {
  avisoTx.textContent = t;
  avisoBt.hidden = !boton; if (boton) avisoBt.textContent = boton;
  avisoEl.style.padding = boton ? '8px 8px 8px 16px' : '11px 16px';
  avisoEl.classList.add('ver');
  clearTimeout(avisoT); avisoH && avisoH.alto();
  avisoH = resorte({ de: parseFloat(avisoEl.dataset.p || 0), a: 1, r: .32, d: .9, eps: .002, fn: p => { avisoEl.dataset.p = p; avisoEl.style.opacity = Math.min(1, p); avisoEl.style.transform = `translateX(-50%) translateY(${(1 - p) * 14}px) scale(${.96 + .04 * p})`; } });
  avisoT = setTimeout(ocultarAviso, dura);
}
function aviso(t, undo) { avisoEl.classList.remove('error'); deshacerFn = undo || null; reintentoFn = null; mostrarAviso(t, undo ? 'Deshacer' : '', 6500); }
function falla(t, reintentar) { avisoEl.classList.add('error'); deshacerFn = null; reintentoFn = reintentar || null; mostrarAviso(t, reintentar ? 'Reintentar' : '', 12000); }
function ocultarAviso() {
  clearTimeout(avisoT); avisoH && avisoH.alto(); avisoEl.classList.remove('ver');
  avisoH = resorte({ de: parseFloat(avisoEl.dataset.p || 0), a: 0, r: .22, eps: .002, fn: p => { avisoEl.dataset.p = p; avisoEl.style.opacity = Math.max(0, p); avisoEl.style.transform = `translateX(-50%) translateY(${(1 - p) * 10}px)`; } });
}
avisoBt.onclick = () => { if (reintentoFn) { const f = reintentoFn; reintentoFn = null; ocultarAviso(); f(); } else hacerDeshacer(); };
function hacerDeshacer() { if (!deshacerFn) return; const f = deshacerFn; deshacerFn = null; f(); repinta(); ocultarAviso(); }

/* ── Dinero ── */
function quitarLocal(p) { D.pagos = D.pagos.filter(x => x !== p); reindexa(); }
function cobrar(s, i) {
  const y = Math.floor(i / 12), m = i % 12, fecha = new Date(HOY);
  const p = { id: null, resp: s.resp, alumno: s.id, concepto: 'Mensualidad', total: CUOTA, abonado: CUOTA, fecha, estado: 'Liquidado', mes: m + 1, anio: y, tutor: s.tutor, notas: '' };
  D.pagos.push(p); reindexa(); vibra();
  const guardado = escribir(() => api('/api/pagos', { method: 'POST', body: {
    monto_total: CUOTA, monto_abonado: CUOTA, tipo_pago: 'Mensualidad', metodo_pago: 'Contado', estado_pago: 'Liquidado', fecha_pago: iso(fecha),
    num_control_responsable: s.resp, num_control_alumno: s.id, mes_correspondiente: m + 1, anio: y
  } })).then(r => { p.id = r.id_pago; }).catch(e => {
    if (e.status === 409 && e.data && e.data.pago) { const o = mapPago({ ...e.data.pago, mes_correspondiente: m + 1, anio_correspondiente: y }); Object.assign(p, o); return; }
    quitarLocal(p); repinta();
    falla(`No se guardó el cobro de ${nom1(s)}`, () => { cobrar(s, i); repinta(); });
  });
  aviso(`Cobrado ${$$(CUOTA)} · ${nom1(s)}, ${MES[m]}`, () => {
    quitarLocal(p);
    guardado.then(() => { if (p.id) escribir(() => api('/api/pagos/' + p.id, { method: 'DELETE' })).catch(() => { D.pagos.push(p); reindexa(); repinta(); falla('No se pudo deshacer el cobro'); }); });
  });
}
function quitarPago(p, texto) {
  quitarLocal(p);
  escribir(() => api('/api/pagos/' + p.id, { method: 'DELETE' })).then(() => aviso(texto)).catch(e => { D.pagos.push(p); reindexa(); repinta(); falla('No se pudo quitar: ' + e.message); });
}
function ajustarPlan(p, delta) { p.abonado = +(p.abonado + delta).toFixed(2); p.estado = p.abonado >= p.total ? 'Liquidado' : 'Pendiente'; }
function abonar(p, monto) {
  const s = al(p.alumno), nombre = s ? nom1(s) : p.tutor;
  ajustarPlan(p, monto); vibra();
  const guardado = escribir(() => api(`/api/pagos/${p.id}/abonar`, { method: 'PUT', body: { abono: monto } })).then(() => true).catch(() => {
    ajustarPlan(p, -monto); repinta();
    falla(`No se guardó el abono de ${nombre}`, () => { abonar(p, monto); repinta(); });
    return false;
  });
  aviso(`Abono ${$$(monto)} · ${p.concepto}, ${nombre}`, () => {
    ajustarPlan(p, -monto);
    guardado.then(ok => { if (ok) escribir(() => api(`/api/pagos/${p.id}/revertir-abono`, { method: 'PUT', body: { abono: monto } })).catch(() => { ajustarPlan(p, monto); repinta(); falla('No se pudo deshacer el abono'); }); });
  });
}
function crearPlan(s, concepto, total) {
  const p = { id: null, resp: s.resp, alumno: s.id, concepto, total, abonado: 0, fecha: new Date(HOY), estado: 'Pendiente', mes: null, anio: null, tutor: s.tutor, notas: '' };
  D.pagos.push(p);
  const guardado = escribir(() => api('/api/pagos', { method: 'POST', body: {
    monto_total: total, monto_abonado: 0, tipo_pago: concepto, metodo_pago: 'A plazos', estado_pago: 'Pendiente', fecha_pago: iso(HOY), num_control_responsable: s.resp, num_control_alumno: s.id
  } })).then(r => { p.id = r.id_pago; repinta(); }).catch(() => {
    quitarLocal(p); repinta();
    falla(`No se guardó el pago de ${nom1(s)}`, () => { crearPlan(s, concepto, total); repinta(); });
  });
  aviso(`Pago creado · ${concepto}, ${nom1(s)}`, () => {
    quitarLocal(p);
    guardado.then(() => { if (p.id) escribir(() => api('/api/pagos/' + p.id, { method: 'DELETE' })).catch(() => falla('No se pudo deshacer')); });
  });
}

/* ── Eventos ── */
const cuerpoEvento = (e) => ({ titulo: e.t, tipo: e.k, fecha: iso(e.d), lugar: e.l, descripcion: e.desc });
function crearEvento(datos) {
  const e = { id: null, ...datos };
  D.eventos.push(e);
  const guardado = escribir(() => api('/api/eventos', { method: 'POST', body: cuerpoEvento(e) })).then(r => { e.id = r.id_evento; }).catch(() => {
    D.eventos = D.eventos.filter(x => x !== e); repinta();
    falla('No se guardó el evento', () => { crearEvento(datos); repinta(); });
  });
  aviso(`Evento creado · ${fCorta(e.d)}`, () => {
    D.eventos = D.eventos.filter(x => x !== e);
    guardado.then(() => { if (e.id) escribir(() => api('/api/eventos/' + e.id, { method: 'DELETE' })).catch(() => falla('No se pudo deshacer')); });
  });
}
