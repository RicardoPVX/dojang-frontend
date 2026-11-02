'use strict';
/* ── Navegación de la escuela ── */
const pantallas = () => esAdmin()
  ? [['hoy','Hoy','hoy'],['cobros','Cobros','cobros'],['calendario','Calendario','cal'],['familias','Familias','familias'],['mas','Más','puntos']]
  : [['hoy','Hoy','hoy'],['calendario','Calendario','cal'],['familias','Familias','familias'],['mas','Más','puntos']];
const TIT = { hoy:'Hoy', cobros:'Cobros', calendario:'Calendario', familias:'Familias', mas:'Más', clases:'Clases', inventario:'Inventario', maestros:'Maestros', movimientos:'Movimientos' };

function pintarNav() {
  const n = esAdmin() ? pendientes().length : 0, ps = pantallas();
  const activa = ['clases','inventario','maestros','movimientos'].includes(S.v) ? 'mas' : S.v;
  document.getElementById('nav').innerHTML = ps.map(([id, t, ic]) => `<a data-act="ver" data-v="${id}" ${activa === id ? 'aria-current="page"' : ''}>${ico(ic, 19)}${t}${id === 'hoy' && n ? `<span class="badge num">${n}</span>` : ''}</a>`).join('');
  const idx = ps.findIndex(p => p[0] === activa), tabs = document.getElementById('tabs');
  tabs.style.setProperty('--n', ps.length);
  tabs.innerHTML = (idx < 0 ? '' : `<i style="transform:translateX(${idx * 100}%)"></i>`) + ps.map(([id, t, ic]) => `<a data-act="ver" data-v="${id}" ${activa === id ? 'aria-current="page"' : ''}>${ico(ic, 21)}${t}${id === 'hoy' && n ? `<span class="bol num">${n}</span>` : ''}</a>`).join('');
}
const barra = (t, volver) => `<div class="barra" id="barra">${volver ? `<button class="ico-btn" data-act="ver" data-v="mas" aria-label="Volver a Más" style="margin-left:-8px">${ico('atras', 21)}</button>` : ''}<span class="barra-t">${t}</span><div class="barra-acc"><button class="ico-btn" data-act="cmd" aria-label="${esAdmin() ? 'Registrar' : 'Buscar'}">${ico(esAdmin() ? 'mas' : 'lupa', 23)}</button></div></div>`;

/* ── Hoy ── */
function filaCobro(p, conMes = true) {
  const { s, i, dias } = p;
  return `<div class="swipe-row" data-cobro="${esc(s.id)}|${i}" role="listitem"><div class="swipe-bg">${ico('check', 20)}Cobrado</div><div class="swipe-card"><div class="fila" tabindex="0" data-key="c-${esc(s.id)}-${i}" data-act="abrir" data-id="${esc(s.id)}">${av(s)}<div class="fila-c"><b>${esc(s.n)}</b><small class="mal">${conMes ? cap(MES[i % 12]) + ' · ' : ''}${textoAtraso(dias)}</small></div><span class="fila-m num">${$$(CUOTA)}</span><button class="btn btn-2" data-act="cobrar">Cobrar</button></div></div></div>`;
}
const filaEvento = (e) => `<button class="fila" data-act="evento" data-e="${esc(e.id)}"><div class="dia-c"><small>${MES3[e.d.getMonth()]}</small><b class="num">${e.d.getDate()}</b></div><div class="fila-c"><b>${esc(e.t)}</b><small>${cap(DIA[e.d.getDay()])}${e.l ? ' · ' + esc(e.l) : ''}</small></div><span class="tipo-punto" style="background:${KC[e.k]}"></span></button>`;

function totalesMes() {
  const est = D.alumnos.filter(s => estado(s, HOY_I).t !== 'na');
  return { tot: est.length * CUOTA, cob: est.filter(s => estado(s, HOY_I).t === 'pagado').length * CUOTA };
}
function vHoy() {
  const sem = D.eventos.filter(e => { const d = (e.d - HOY) / 864e5; return d >= 0 && d <= 21; }).sort((a, b) => a.d - b.d), ls = listosExamen();
  let dinero = '';
  if (esAdmin()) {
    const pen = pendientes(), dudas = D.dudas.filter(d => !d.leida), conSaldo = planes().filter(p => p.abonado < p.total);
    const { tot, cob } = totalesMes();
    dinero = `${HOY_I < INICIO
      ? `<div class="card pulso"><h2>Las mensualidades empiezan en noviembre de 2027</h2><p>${D.alumnos.length} alumnos activos. Mientras tanto, aquí verás los pagos a plazos.</p></div>`
      : `<div class="card pulso"><div class="pulso-mes">Cobrado en ${MES[HOY.getMonth()]}</div><div class="pulso-cifra"><b class="num" data-cifra="cob">${$$(cob)}</b><span class="num">de ${$$(tot)}</span></div><div class="barra-p"><i data-barra style="transform:scaleX(${tot ? cob / tot : 0})"></i></div><div class="pulso-pie"><span>Por cobrar en total <b class="num" data-cifra="pen">${$$(pen.length * CUOTA)}</b></span><span class="num" data-cifra-t>${pen.length} mensualidad${pen.length === 1 ? '' : 'es'}</span></div></div>
      <div class="sec"><div class="sec-t"><h2>Por cobrar</h2><span>Desliza o pulsa Cobrar</span></div><div class="card lista" role="list" id="lista-cobros">${pen.length ? pen.map(p => filaCobro(p)).join('') : '<div class="vacio">Nadie debe nada. Buen día.</div>'}</div></div>`}
    ${dudas.length ? `<div class="sec"><div class="sec-t"><h2>Dudas de familias</h2></div><div class="card lista">${dudas.map(d => { const s = al(d.al) || hijos(d.resp)[0]; return `<div class="fila ${s ? '' : 'quieta'}" tabindex="0" data-key="d-${d.id}" ${s ? `data-act="abrir" data-id="${esc(s.id)}"` : ''}><span class="cmd-ico">${ico('msg', 18)}</span><div class="fila-c"><b>${esc(d.de)}</b><small style="white-space:normal">${esc(d.t)}</small></div><button class="btn btn-3" data-act="duda" data-d="${d.id}">Leída</button></div>`; }).join('')}</div></div>` : ''}
    ${conSaldo.length ? `<div class="sec"><div class="sec-t"><h2>Saldos a plazos</h2><span class="num">${$$(conSaldo.reduce((m, p) => m + p.total - p.abonado, 0))}</span></div><div class="card lista">${filasPlanes(conSaldo.slice(0, 5))}</div></div>` : ''}`;
  }
  return barra('Hoy') + `<div class="pag"><h1 class="titulo" data-t>Hoy</h1><p class="subt">${cap(DIA[HOY.getDay()])} ${HOY.getDate()} de ${MES[HOY.getMonth()]}</p>${dinero}
  <div class="sec" ${esAdmin() ? '' : 'style="margin-top:0"'}><div class="sec-t"><h2>Próximas 3 semanas</h2><a data-act="ver" data-v="calendario">Ver calendario</a></div><div class="card lista">${sem.length ? sem.map(filaEvento).join('') : '<div class="vacio">Sin eventos cerca.</div>'}</div></div>
  <div class="sec"><div class="sec-t"><h2>Listos para examen</h2><span>${ls.length} de ${D.alumnos.length}</span></div><div class="card lista">${ls.length ? ls.map(s => `<div class="fila" tabindex="0" data-key="x-${esc(s.id)}" data-act="abrir" data-id="${esc(s.id)}">${av(s)}<div class="fila-c"><b>${esc(s.n)}</b><small>${BELTS[s.cinta].n} → ${BELTS[s.cinta + 1].n}</small></div></div>`).join('') : '<div class="vacio">Nadie por ahora.</div>'}</div></div></div>`;
}

/* ── Cobros: un solo lugar para el mes en curso, los anteriores y lo que se paga a plazos ── */
const mesesTira = () => { const r = []; for (let i = INICIO; i <= Math.max(HOY_I, INICIO) + 3; i++) r.push(i); return r; };
function vCobros() {
  return barra('Cobros') + `<div class="pag"><h1 class="titulo" data-t>Cobros</h1><p class="subt">Arrastra los meses o usa las flechas ← →</p>
  <div class="tira" id="tira" role="tablist" aria-label="Mes"><div class="tira-t" id="tira-t">${mesesTira().map(i => `<button role="tab" data-mes="${i}" aria-current="${i === S.mesI}">${cap(MES3[i % 12])}<small class="num">${Math.floor(i / 12)}</small></button>`).join('')}</div></div>
  <div id="cobros-c"></div>
  <div class="sec"><div class="sec-t"><h2>A plazos</h2><span>Equipo, exámenes, torneos</span></div><div class="card lista" id="planes">${filasPlanes([...planes()].sort((a, b) => (a.abonado >= a.total) - (b.abonado >= b.total)))}</div></div></div>`;
}
function filasPlanes(ps) {
  if (!ps.length) return '<div class="vacio">Sin pagos a plazos. Crea uno desde Registrar: dobok diego 800.</div>';
  return ps.map(p => {
    const s = al(p.alumno) || hijos(p.resp)[0], res = p.total - p.abonado;
    return `<div class="fila ${s ? '' : 'quieta'}" tabindex="0" data-key="p-${p.id}" ${s ? `data-act="abrir" data-id="${esc(s.id)}" data-plan="${p.id}"` : ''}>${s ? av(s) : '<span class="av" style="background:var(--fill)">—</span>'}<div class="fila-c"><b>${esc(s ? s.n : 'Baja · ' + p.tutor)}</b><small class="num">${esc(p.concepto)} · ${$$(p.abonado)} de ${$$(p.total)}</small><div class="barra-p" style="margin:6px 0 2px;height:5px"><i style="transform:scaleX(${p.total ? p.abonado / p.total : 0})"></i></div></div>${res > 0 ? `<span class="fila-m num">${$$(res)}</span>` : '<span class="etq e-ok">Liquidado</span>'}</div>`;
  }).join('');
}
function cuerpoCobros() {
  const i = S.mesI, est = D.alumnos.map(s => ({ s, e: estado(s, i) })).filter(x => x.e.t !== 'na');
  const pag = est.filter(x => x.e.t === 'pagado'), deb = est.filter(x => x.e.t === 'debe'), fu = est.filter(x => x.e.t === 'futuro');
  // Lo cobrado a alumnos dados de baja sigue contando en el mes
  const bajas = D.pagos.filter(p => esMens(p) && mesDePago(p) === i && p.alumno && !al(p.alumno));
  const orden = [...deb.sort((a, b) => b.e.dias - a.e.dias), ...fu, ...pag];
  const vis = orden.filter(x => S.filtro === 'todos' || (S.filtro === 'por' ? x.e.t !== 'pagado' : x.e.t === 'pagado'));
  const ops = [['todos','Todos'],['por','Por cobrar'],['pag','Pagados']], idx = ops.findIndex(o => o[0] === S.filtro);
  return `<div class="card tres"><div><small>Cobrado</small><b class="num" style="color:var(--ok)">${$$((pag.length + bajas.length) * CUOTA)}</b></div><div><small>${deb.length ? 'Falta' : 'Esperado'}</small><b class="num" ${deb.length ? 'style="color:var(--bad)"' : ''}>${$$((deb.length + fu.length) * CUOTA)}</b></div><div><small>Alumnos</small><b class="num">${pag.length}/${est.length}</b></div></div>
  <div class="sec" style="margin-top:18px"><div class="sec-t" style="align-items:center"><h2>${cap(MES[i % 12])}</h2><div class="segm" role="group" aria-label="Filtro"><i style="width:calc((100% - 4px)/3);transform:translateX(${idx * 100}%)"></i>${ops.map(o => `<button data-act="filtro" data-f="${o[0]}" aria-pressed="${S.filtro === o[0]}">${o[1]}</button>`).join('')}</div></div>
  <div class="card lista" role="list">${vis.map(({ s, e }) => {
    if (e.t === 'debe') return filaCobro({ s, i, dias: e.dias }, false);
    const sub = e.t === 'pagado' ? `<small class="bien">Pagó el ${fCorta(e.f)}</small>` : `<small>Vence el ${fCorta(e.due)}</small>`;
    return `<div class="fila" tabindex="0" data-key="c-${esc(s.id)}-${i}" data-act="abrir" data-id="${esc(s.id)}">${av(s)}<div class="fila-c"><b>${esc(s.n)}</b>${sub}</div><span class="fila-m num">${$$(CUOTA)}</span>${e.t === 'pagado' ? `<span class="etq e-ok">${ico('check', 13)}Pagado</span>` : `<button class="btn btn-3" data-act="adelantar" data-c="${esc(s.id)}|${i}">Adelantar</button>`}</div>`;
  }).join('') || (bajas.length ? '' : '<div class="vacio">Nada en este filtro.</div>')}${S.filtro !== 'por' ? bajas.map(p => `<div class="fila quieta"><span class="av" style="background:var(--fill)">—</span><div class="fila-c"><b>Baja · ${esc(p.tutor)}</b><small class="bien">Pagó el ${fCorta(p.fecha)}</small></div><span class="fila-m num">${$$(CUOTA)}</span></div>`).join('') : ''}</div></div>`;
}
function montaTira() {
  const tira = document.getElementById('tira'); if (!tira) return;
  const t = document.getElementById('tira-t'), ms = mesesTira(), w = 96, cen = () => tira.clientWidth / 2 - w / 2, xDe = (i) => cen() - ms.indexOf(i) * w;
  if (!ms.includes(S.mesI)) S.mesI = Math.max(HOY_I, INICIO);
  let x = xDe(S.mesI), h = null, ini = null, mov = false, ras;
  const pon = (v) => { x = v; t.style.transform = `translateX(${v}px)`; };
  pon(x);
  const ir = (i, v = 0) => {
    if (i !== S.mesI) { S.mesI = i; t.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', +b.dataset.mes === i)); document.getElementById('cobros-c').innerHTML = cuerpoCobros(); }
    h && h.alto(); h = resorte({ de: x, a: xDe(i), v, r: .38, d: 1, fn: pon });
  };
  tira._ir = ir;
  tira.onpointerdown = (e) => { h && h.alto(); ini = { px: e.clientX, x }; mov = false; ras = rastro(); ras.add(e.clientX); };
  tira.onpointermove = (e) => {
    if (!ini) return;
    const dx = e.clientX - ini.px;
    if (!mov) { if (Math.abs(dx) < 6) return; mov = true; tira.setPointerCapture(e.pointerId); }
    ras.add(e.clientX);
    const min = xDe(ms[ms.length - 1]), max = xDe(ms[0]); let n = ini.x + dx;
    if (n > max) n = max + elastico(n - max, tira.clientWidth);
    if (n < min) n = min + elastico(n - min, tira.clientWidth);
    pon(n);
  };
  const suelta = (e) => {
    if (!ini) return;
    const eraMov = mov; ini = null;
    if (!eraMov) { const b = e.target.closest && e.target.closest('[data-mes]'); if (b) ir(+b.dataset.mes); return; }
    const v = ras.v(), dest = x + proyectar(v, .99), k = Math.max(0, Math.min(ms.length - 1, Math.round((cen() - dest) / w)));
    ir(ms[k], v);
  };
  tira.onpointerup = suelta; tira.onpointercancel = suelta;
  document.getElementById('cobros-c').innerHTML = cuerpoCobros();
}

/* ── Calendario: eventos y días de cobro en un mismo lugar ── */
function vCalendario() {
  const y = Math.floor(S.calI / 12), m = S.calI % 12, off = (new Date(y, m, 1).getDay() + 6) % 7, cel = [];
  for (let k = 0; k < 42; k++) { const d = new Date(y, m, 1 - off + k); if (k >= 35 && d.getMonth() !== m) break; cel.push(d); }
  const evs = (d) => D.eventos.filter(e => mismoDia(e.d, d));
  const cobrosDia = (d) => esAdmin() ? D.alumnos.filter(s => s.dia === d.getDate() && estado(s, d.getFullYear() * 12 + d.getMonth()).t !== 'na') : [];
  const sel = S.calDia, es = evs(sel), cd = cobrosDia(sel);
  return barra('Calendario') + `<div class="pag"><h1 class="titulo" data-t>Calendario</h1><p class="subt">${esAdmin() ? 'Eventos y días de cobro en un mismo lugar' : 'Eventos de la escuela'}</p><div class="cal"><div class="card"><div class="cal-h"><b>${cap(MES[m])} ${y}</b><div style="display:flex"><button class="ico-btn" data-act="cal-m" data-d="-1" aria-label="Mes anterior">${ico('atras', 20)}</button><button class="ico-btn" data-act="cal-m" data-d="1" aria-label="Mes siguiente">${ico('sig', 20)}</button></div></div><div class="cal-g">${['L','M','M','J','V','S','D'].map(l => `<span>${l}</span>`).join('')}${cel.map(d => { const f = d.getMonth() !== m, ev = evs(d), co = !f && cobrosDia(d).length; return `<button data-act="cal-d" data-f="${d.getTime()}" class="${f ? 'fuera ' : ''}${mismoDia(d, HOY) ? 'hoy ' : ''}${mismoDia(d, sel) ? 'sel' : ''}" aria-label="${d.getDate()} de ${MES[d.getMonth()]}${ev.length ? ', ' + ev.length + ' evento' : ''}"><em class="num">${d.getDate()}</em><span class="puntos">${ev.map(e => `<i style="background:${KC[e.k]}"></i>`).join('')}${co ? `<i style="background:${KC.cobro}"></i>` : ''}</span></button>`; }).join('')}</div></div>
  <div class="card agenda"><h3>${cap(DIA[sel.getDay()])} ${sel.getDate()} de ${MES[sel.getMonth()]}</h3>${es.map(e => `<button class="agenda-i" data-act="evento" data-e="${esc(e.id)}"><span class="tipo-punto" style="background:${KC[e.k]}"></span><span><b>${esc(e.t)}</b><small>${TIPO[e.k]}${e.l ? ' · ' + esc(e.l) : ''}</small></span></button>`).join('')}${cd.length ? `<div class="agenda-i"><span class="tipo-punto" style="background:${KC.cobro}"></span><div><b>Día de cobro</b><small class="num">${cd.length} alumnos · ${$$(cd.length * CUOTA)}</small></div></div>` : ''}${!es.length && !cd.length ? '<p style="color:var(--t2);font-size:.9375rem;padding:6px 0">Nada este día.</p>' : ''}${esAdmin() ? `<button class="btn btn-2" style="margin-top:10px;width:100%" data-act="evento-nuevo" data-f="${iso(sel)}">Agregar evento</button>` : ''}</div></div></div>`;
}

/* ── Familias ── */
function vFamilias() {
  return barra('Familias') + `<div class="pag"><h1 class="titulo" data-t>Familias</h1><p class="subt">${new Set(D.alumnos.map(s => s.resp)).size} tutores · ${D.alumnos.length} alumnos</p><div style="display:flex;gap:8px"><label class="buscar" style="flex:1">${ico('lupa', 18)}<input id="buscar" placeholder="Buscar alumno o tutor" value="${esc(S.buscar)}" aria-label="Buscar alumno o tutor"></label><button class="btn btn-1" style="height:40px" data-act="alumno-nuevo">${ico('mas', 16)}Alumno</button></div><div id="fam-c">${cuerpoFamilias()}</div></div>`;
}
function cuerpoFamilias() {
  const q = norm(S.buscar.trim()), mapa = new Map();
  D.alumnos.forEach(s => { if (!mapa.has(s.resp)) mapa.set(s.resp, { resp: s.resp, tutor: s.tutor, h: [] }); mapa.get(s.resp).h.push(s); });
  const gr = [...mapa.values()].filter(g => !q || norm(g.tutor).includes(q) || g.h.some(s => norm(s.n).includes(q) || norm(s.id).includes(q))).sort((a, b) => a.tutor.localeCompare(b.tutor, 'es'));
  if (!gr.length) return `<div class="card vacio">${D.alumnos.length ? `No hay nadie con “${esc(S.buscar)}”.` : 'Todavía no hay alumnos.'}</div>`;
  const pen = esAdmin() ? pendientes() : [];
  return gr.map(g => {
    const deb = pen.filter(p => p.s.resp === g.resp).length;
    return `<div class="sec" style="margin-top:18px"><div class="sec-t"><h2 style="font-size:1rem">${esc(g.tutor)}</h2>${esAdmin() ? `<span style="color:${deb ? 'var(--bad)' : 'var(--ok)'}">${deb ? 'Debe ' + $$(deb * CUOTA) : 'Al corriente'}</span>` : ''}</div><div class="card lista">${g.h.map(s => { const b = BELTS[s.cinta]; return `<div class="fila" tabindex="0" data-key="f-${esc(s.id)}" data-act="abrir" data-id="${esc(s.id)}">${av(s)}<div class="fila-c"><b>${esc(s.n)}</b><small>${s.edad !== null ? s.edad + ' años · ' : ''}${gradoTxt(b)}</small></div></div>`; }).join('')}</div></div>`;
  }).join('');
}

/* ── Más: lo que se usa menos vive un nivel adentro ── */
function vMas() {
  const fila = (v, ic, t, sub) => `<button class="fila" data-act="ver" data-v="${v}"><span class="cmd-ico">${ico(ic, 18)}</span><div class="fila-c"><b>${t}</b><small>${sub}</small></div>${ico('sig', 16)}</button>`;
  const bajo = D.equipo.filter(e => e.stock <= e.min).length;
  return barra('Más') + `<div class="pag"><h1 class="titulo" data-t>Más</h1><p class="subt">${esc(SESION.nombre || SESION.username)}</p><div class="card lista">
  ${fila('clases', 'hoy', 'Clases', D.clases.length + ' horarios')}
  ${esAdmin() ? fila('inventario', 'caja', 'Inventario', bajo ? bajo + ' por surtir' : D.equipo.length + ' artículos') + fila('maestros', 'persona', 'Maestros', D.maestros.length + ' registrados') + fila('movimientos', 'lista', 'Movimientos', 'Cada cobro, abono y corrección') : ''}
  <button class="fila" data-act="cuenta"><span class="cmd-ico">${ico('persona', 18)}</span><div class="fila-c"><b>Mi cuenta</b><small>Nombre y contraseña</small></div>${ico('sig', 16)}</button></div>
  <div class="sec"><div class="card lista"><button class="fila" data-act="tema"><div class="fila-c"><b>Claro / oscuro</b></div></button><button class="fila" data-act="salir"><div class="fila-c"><b style="color:var(--bad)">Cerrar sesión</b></div></button></div></div></div>`;
}
const DIAS_CLASE = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function vClases() {
  return barra('Clases', true) + `<div class="pag"><h1 class="titulo" data-t>Clases</h1><p class="subt">${D.clases.length} horarios</p>${esAdmin() ? '<button class="btn btn-1" data-act="clase-nueva" style="margin-bottom:16px">Nueva clase</button>' : ''}${D.clases.map(c => {
    const ins_ = D.alumnos.filter(s => s.claseId === c.id);
    return `<div class="sec" style="margin-top:18px"><div class="sec-t"><h2 style="font-size:1rem">${esc(c.n)}</h2>${esAdmin() ? `<button data-act="clase-editar" data-c="${c.id}">Editar</button>` : ''}</div><div class="card lista"><div class="fila quieta"><span class="cmd-ico">${ico('hoy', 18)}</span><div class="fila-c"><b>${esc(diasTxt(c.dias) || c.dias)} · ${c.ini}–${c.fin}</b><small>${esc(c.maestroN || 'Sin maestro')} · ${ins_.length} alumnos</small></div></div>${ins_.map(s => `<div class="fila" tabindex="0" data-key="k-${esc(s.id)}" data-act="abrir" data-id="${esc(s.id)}">${av(s)}<div class="fila-c"><b>${esc(s.n)}</b><small>${BELTS[s.cinta].n}</small></div></div>`).join('')}</div></div>`;
  }).join('') || '<div class="card vacio">Sin clases.</div>'}</div>`;
}
function vInventario() {
  const orden = [...D.equipo].sort((a, b) => (a.stock > a.min) - (b.stock > b.min) || a.n.localeCompare(b.n, 'es'));
  return barra('Inventario', true) + `<div class="pag"><h1 class="titulo" data-t>Inventario</h1><p class="subt">${D.equipo.length} artículos</p><button class="btn btn-1" data-act="articulo-nuevo" style="margin-bottom:16px">Nuevo artículo</button><div class="card lista">${orden.map(e => `<div class="fila" tabindex="0" data-key="e-${e.id}" data-act="articulo-editar" data-e="${e.id}"><div class="fila-c"><b>${esc(e.n)}${e.talla ? ' · ' + esc(e.talla) : ''}</b><small class="num ${e.stock <= e.min ? 'mal' : ''}" data-st="${e.id}">${$$(e.precio)}${e.stock === 0 ? ' · Agotado' : e.stock <= e.min ? ' · Por surtir' : ''}</small></div><div class="stepper"><button data-act="stock" data-e="${e.id}" data-d="-1" aria-label="Quitar uno">−</button><span data-sn="${e.id}">${e.stock}</span><button data-act="stock" data-e="${e.id}" data-d="1" aria-label="Agregar uno">+</button></div></div>`).join('') || '<div class="vacio">Sin artículos.</div>'}</div></div>`;
}
function vMaestros() {
  return barra('Maestros', true) + `<div class="pag"><h1 class="titulo" data-t>Maestros</h1><p class="subt">${D.maestros.length} registrados</p><button class="btn btn-1" data-act="maestro-nuevo" style="margin-bottom:16px">Nuevo maestro</button><div class="card lista">${D.maestros.map(m => `<button class="fila" data-act="maestro-editar" data-m="${m.id}"><span class="cmd-ico">${ico('persona', 18)}</span><div class="fila-c"><b>${esc(m.n)}</b><small>${esc(m.cargo || 'Maestro')}${m.grado ? ' · ' + esc(m.grado) : ''}</small></div>${ico('sig', 16)}</button>`).join('')}</div></div>`;
}
const TIPO_MOV = { cobro:'Cobro', abono:'Abono', abono_revertido:'Abono revertido', edicion:'Corrección', eliminacion:'Eliminado' };
function vMovimientos() {
  if (S.mov === null) {
    S.mov = 'cargando';
    api('/api/pagos/movimientos').then(r => { S.mov = r; }).catch(() => { S.mov = 'error'; }).finally(() => { if (S.v === 'movimientos') pintar(false); });
  }
  const c = S.mov === 'cargando' ? '<div class="vacio">Cargando…</div>' : S.mov === 'error' ? '<div class="vacio">No se pudieron cargar.</div>' : !S.mov.length ? '<div class="vacio">Todavía no hay movimientos.</div>' :
    S.mov.map(m => { const f = new Date(m.fecha); return `<div class="fila quieta"><div class="fila-c"><b>${TIPO_MOV[m.tipo] || esc(m.tipo)} · ${esc(m.concepto || '')}</b><small>${esc(m.alumno_nombre || m.num_control_alumno || 'Sin alumno')} · ${fLarga(f)}, ${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')} · ${esc(m.usuario || '')}</small></div><span class="fila-m num">${m.monto !== null ? $$(m.monto) : ''}</span></div>`; }).join('');
  return barra('Movimientos', true) + `<div class="pag"><h1 class="titulo" data-t>Movimientos</h1><p class="subt">Los últimos 100. Deshacer quita el pago, no este registro.</p><div class="card lista">${c}</div></div>`;
}
const VISTAS = { hoy: vHoy, cobros: vCobros, calendario: vCalendario, familias: vFamilias, mas: vMas, clases: vClases, inventario: vInventario, maestros: vMaestros, movimientos: vMovimientos };

/* ── Ficha ── */
function refrescaIns() {
  if (!insAbierta || !insId) return;
  const s = al(insId); if (!s) { cerrarIns(true); return; }
  const b = BELTS[s.cinta], adm = esAdmin(), hrm = hijos(s.resp).filter(x => x.id !== s.id), px = proxExamen(s), sig = BELTS[s.cinta + 1], xs = examenesDe(s);
  const top = ins.querySelector('.ins-cuerpo')?.scrollTop || 0, tel = s.tel.replace(/\D/g, '');
  let dinero = '';
  if (adm) {
    const pen = pendientesDe(s), pl = planesDe(s), mm = []; for (let i = inicioMeses(), n = 0; n < 6; i++, n++) mm.push(i);
    dinero = `${pen.length ? `<button class="btn btn-1" style="width:100%;min-height:44px" data-act="cobrar-ins" data-c="${esc(s.id)}|${pen[0].i}">Cobrar ${MES[pen[0].i % 12]} · ${$$(CUOTA)}</button>` : ''}
    <div class="bloque" style="margin-top:${pen.length ? 14 : 4}px"><h3>Mensualidades · día ${s.dia} de cada mes</h3><div class="meses6">${mm.map(i => { const e = estado(s, i); return `<button data-act="mes" data-c="${esc(s.id)}|${i}" aria-label="${MES[i % 12]} ${Math.floor(i / 12)}"><i class="${e.t === 'pagado' ? 'p' : e.t === 'debe' ? 'd' : ''}"></i>${MES3[i % 12]}</button>`; }).join('')}</div></div>
    <div class="bloque"><h3>A plazos<button data-act="plan-nuevo" data-id="${esc(s.id)}">Nuevo pago</button></h3>${pl.map(p => { const r = p.total - p.abonado, pct = p.total ? p.abonado / p.total * 100 : 0; return `<div class="plan" data-plan-ed="${p.id}"><div class="plan-t"><button data-act="plan-editar" data-p="${p.id}">${esc(p.concepto)}</button><span class="num" data-resta>${r > 0 ? 'Resta ' + $$(r) : 'Liquidado'}</span></div><div class="plan-s num">${$$(p.abonado)} de ${$$(p.total)}</div>${r > 0 ? `<div class="deslizar" data-slider role="slider" tabindex="0" aria-label="Monto del abono" aria-valuemin="0" aria-valuemax="${r}" aria-valuenow="0"><div class="pista"><span class="ya" style="width:${pct}%"></span><span class="nuevo" style="left:${pct}%;width:0"></span></div><span class="perilla" style="left:${pct}%"></span></div><div class="plan-f"><label class="monto"><span style="color:var(--t3)">$</span><input inputmode="numeric" data-monto aria-label="Abono" placeholder="0"></label><button class="btn btn-3" data-act="resto" data-r="${r}">Todo</button><button class="btn btn-1" data-act="abonar" data-p="${p.id}" disabled style="margin-left:auto">Abonar</button></div>` : ''}</div>`; }).join('') || '<p class="nota-h">Sin pagos a plazos.</p>'}</div>`;
  }
  ins.innerHTML = `<div class="ins-agarre" data-agarre><i></i></div><div class="ins-cab" data-agarre>${av(s)}<div style="min-width:0"><h2>${esc(s.n)}</h2><p>${s.edad !== null ? s.edad + ' años · ' : ''}${gradoTxt(b)}</p></div><button class="cerrar" data-act="cerrar-ins" aria-label="Cerrar">${ico('x', 15)}</button></div>
  <div class="ins-cuerpo">${dinero}
   <div class="bloque" ${adm ? '' : 'style="margin-top:4px"'}><h3>Grado${adm ? `<button data-act="examen-nuevo" data-id="${esc(s.id)}">Registrar examen</button>` : ''}</h3><div class="grados" aria-hidden="true">${BELTS.map((x, i) => `<i class="${i > s.cinta ? 'nada' : i === s.cinta ? 'ya' : ''}" style="background:${x.f ? `linear-gradient(90deg,${x.c} 60%,${x.f} 60%)` : x.c}"></i>`).join('')}</div>
    <div class="dato"><span>Actual</span><b>${gradoTxt(b)}</b></div>${sig ? `<div class="dato"><span>Siguiente</span><b>${sig.n}</b></div><div class="dato"><span>Próximo examen</span>${px <= HOY ? '<span class="etq e-av">Ya puede presentar</span>' : `<b>${fCorta(px)}</b>`}</div>` : ''}
    ${xs.map(x => { const inner = `<span>${x.cinta !== null ? BELTS[x.cinta].n : esc(x.nombre || 'Examen')}<small>${fLarga(x.d)}</small></span><span class="etq ${x.r === 'Aprobado' ? 'e-ok' : x.r === 'Reprobado' ? 'e-mal' : 'e-neu'}">${esc(x.r)}</span>`; return adm ? `<button class="hist" data-act="examen-editar" data-x="${x.id}">${inner}</button>` : `<div class="hist">${inner}</div>`; }).join('')}</div>
   <div class="bloque"><h3>Familia<button data-act="alumno-editar" data-id="${esc(s.id)}">Editar</button></h3><div class="dato"><span>Tutor</span><b>${esc(s.tutor)}</b></div>${s.par ? `<div class="dato"><span>Parentesco</span><b>${esc(s.par)}</b></div>` : ''}${s.tel ? `<div class="dato"><span>Teléfono</span><b><a href="tel:${tel}">${esc(s.tel)}</a> · <a href="https://wa.me/${tel.length === 10 ? '52' + tel : tel}" target="_blank" rel="noopener">WhatsApp</a></b></div>` : ''}${hrm.length ? `<div class="dato"><span>Hermanos</span><b>${hrm.map(h => `<a data-act="abrir" data-id="${esc(h.id)}" style="cursor:pointer">${esc(nom1(h))}</a>`).join(', ')}</b></div>` : ''}<div class="dato"><span>ID de acceso</span><b>${esc(s.login)}</b></div></div>
   <div class="bloque"><h3>Datos</h3>${s.claseN ? `<div class="dato"><span>Clase</span><b>${esc(s.claseN)} · ${esc(diasTxt(s.claseDias))}</b></div>` : '<div class="dato"><span>Clase</span><b>Sin asignar</b></div>'}${s.nac ? `<div class="dato"><span>Nacimiento</span><b>${fLarga(fechaDe(s.nac))}</b></div>` : ''}<div class="dato"><span>Ingreso</span><b>${fLarga(s.ingreso)}</b></div>${s.sangre ? `<div class="dato"><span>Tipo de sangre</span><b>${esc(s.sangre)}</b></div>` : ''}${s.dir ? `<div class="dato"><span>Dirección</span><b>${esc(s.dir)}</b></div>` : ''}${s.emer || s.telEmer ? `<div class="dato"><span>Emergencias</span><b>${esc([s.emer, s.telEmer].filter(Boolean).join(' · '))}</b></div>` : ''}${s.med ? `<div class="dato"><span>Notas médicas</span><b>${esc(s.med)}</b></div>` : ''}</div>
   ${adm ? `<div class="bloque"><button class="btn btn-3 btn-g" style="margin-top:0" data-act="reset-acceso" data-id="${esc(s.id)}">Nueva contraseña temporal</button><button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="baja" data-id="${esc(s.id)}">Dar de baja</button></div>` : ''}
  </div>`;
  ins.querySelector('.ins-cuerpo').scrollTop = top;
  if (insPlan) { const n = ins.querySelector(`[data-plan-ed="${insPlan}"]`); n && n.scrollIntoView({ block: 'nearest' }); insPlan = null; }
}

/* Abono: la perilla sigue el dedo y lo que resta cambia en vivo */
const planPor = (id) => D.pagos.find(x => String(x.id) === String(id));
function pintaAbono(box, m) {
  const p = planPor(box.dataset.planEd), r = p.total - p.abonado; m = Math.max(0, Math.min(r, m)); box._m = m;
  const sl = box.querySelector('[data-slider]');
  box.querySelector('.nuevo').style.width = (m / p.total * 100) + '%';
  box.querySelector('.perilla').style.left = ((p.abonado + m) / p.total * 100) + '%';
  sl.setAttribute('aria-valuenow', m);
  box.querySelector('[data-resta]').textContent = 'Resta ' + $$(r - m);
  const b = box.querySelector('[data-act=abonar]'); b.disabled = m <= 0 || !p.id; b.textContent = m > 0 ? 'Abonar ' + $$(m) : 'Abonar';
}
ins.addEventListener('pointerdown', (e) => {
  const sl = e.target.closest('[data-slider]'); if (!sl) return;
  e.preventDefault(); sl.focus({ preventScroll: true });
  const box = sl.closest('.plan'), p = planPor(box.dataset.planEd), inp = box.querySelector('[data-monto]');
  const calc = (ev) => { const R = sl.getBoundingClientRect(), paso = 50, v = (ev.clientX - R.left) / R.width * p.total - p.abonado, r = p.total - p.abonado; let m = Math.max(0, Math.min(r, v)); m = m >= r - paso / 2 ? r : Math.round(m / paso) * paso; pintaAbono(box, m); inp.value = box._m || ''; };
  sl.classList.add('arrastrando'); sl.setPointerCapture(e.pointerId); calc(e);
  const mv = (ev) => calc(ev), up = () => { sl.classList.remove('arrastrando'); sl.removeEventListener('pointermove', mv); sl.removeEventListener('pointerup', up); sl.removeEventListener('pointercancel', up); };
  sl.addEventListener('pointermove', mv); sl.addEventListener('pointerup', up); sl.addEventListener('pointercancel', up);
});
ins.addEventListener('input', (e) => {
  if (!e.target.matches('[data-monto]')) return;
  const box = e.target.closest('.plan'), p = planPor(box.dataset.planEd), n = +e.target.value.replace(/[^\d.]/g, '') || 0, r = p.total - p.abonado;
  pintaAbono(box, n); e.target.value = n > r ? r : (e.target.value.replace(/[^\d.]/g, ''));
});
ins.addEventListener('keydown', (e) => {
  const sl = e.target.closest && e.target.closest('[data-slider]');
  if (sl && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); e.stopPropagation(); const box = sl.closest('.plan'), n = (box._m || 0) + (e.key === 'ArrowRight' ? 50 : -50); pintaAbono(box, n); box.querySelector('[data-monto]').value = box._m || ''; }
});

/* ── Cobrar ── */
function animaCifras() {
  const { tot, cob } = totalesMes(), pen = pendientes().length;
  const a = main.querySelector('[data-cifra=cob]'), b = main.querySelector('[data-cifra=pen]'), c = main.querySelector('[data-cifra-t]'), bar = main.querySelector('[data-barra]');
  if (a) { a.textContent = $$(cob); b.textContent = $$(pen * CUOTA); c.textContent = pen + ' mensualidad' + (pen === 1 ? '' : 'es'); const m = /scaleX\(([\d.]+)\)/.exec(bar.style.transform), de = m ? +m[1] : 0; resorte({ de, a: tot ? cob / tot : 0, r: .45, eps: .001, fn: v => { bar.style.transform = `scaleX(${v})`; } }); }
  pintarNav();
}
function retirarFila(row) {
  const h = row.offsetHeight; row.style.pointerEvents = 'none';
  resorte({ de: h, a: 0, r: .3, fn: v => { row.style.height = Math.max(0, v) + 'px'; row.style.opacity = Math.max(0, v / h); }, fin: () => { if (row.isConnected) pintar(); } });
}
function cobrarDesdeFila(row, x = 0, v = 0) {
  const [id, iS] = row.dataset.cobro.split('|'), i = +iS, s = al(id), card = row.querySelector('.swipe-card'), bg = row.querySelector('.swipe-bg'), w = row.offsetWidth;
  cobrar(s, i); animaCifras(); refrescaIns();
  bg.style.opacity = 1;
  resorte({ de: x, a: w, v, r: .3, eps: 1, fn: p => { card.style.transform = `translateX(${p}px)`; }, fin: () => { if (S.v === 'hoy') retirarFila(row); else pintar(); } });
}
// Deslizar para cobrar: sigue el dedo, hereda la velocidad, resiste al lado contrario
let trasDeslizar = -1e4;
document.addEventListener('pointerdown', (e) => {
  const row = e.target.closest('.swipe-row'); if (!row || e.target.closest('button') || e.button > 0) return;
  const card = row.querySelector('.swipe-card'), bg = row.querySelector('.swipe-bg'), x0 = e.clientX, y0 = e.clientY, w = row.offsetWidth, ras = rastro();
  let dec = null, x = 0, lista = false;
  const mover = (ev) => {
    const dx = ev.clientX - x0, dy = ev.clientY - y0;
    if (dec === null) { if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; dec = Math.abs(dx) > Math.abs(dy); if (dec) { try { row.setPointerCapture(e.pointerId); } catch (_) {} } else return limpiar(); }
    ras.add(ev.clientX);
    const c = dx - Math.sign(dx) * 10; x = c > 0 ? c : elastico(c, w);
    card.style.transform = `translateX(${x}px)`; bg.style.opacity = Math.min(1, Math.abs(c) / 60) * (c > 0 ? 1 : 0);
    const arm = c > w * .42; if (arm !== lista) { lista = arm; row.classList.toggle('lista-para', arm); if (arm) vibra(8); }
  };
  const limpiar = () => { removeEventListener('pointermove', mover); removeEventListener('pointerup', soltar); removeEventListener('pointercancel', soltar); };
  const soltar = () => {
    limpiar(); if (!dec) return;
    trasDeslizar = performance.now(); row.classList.remove('lista-para');
    const v = ras.v();
    if (x > 0 && (x + proyectar(v, .99) > w * .42) && v > -200) cobrarDesdeFila(row, x, v);
    else resorte({ de: x, a: 0, v, r: .34, d: .82, eps: .5, fn: p => { card.style.transform = `translateX(${p}px)`; bg.style.opacity = Math.max(0, Math.min(1, p / 60)); } });
  };
  addEventListener('pointermove', mover); addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);
});
ACC.cobrar = (t, e) => { e.stopPropagation(); cobrarDesdeFila(t.closest('.swipe-row')); };
const parC = (t) => { const [id, i] = t.dataset.c.split('|'); return [al(id), +i]; };
ACC.adelantar = (t) => { const [s, i] = parC(t); cobrar(s, i); repinta(); };
ACC['cobrar-ins'] = ACC.adelantar;
ACC.abonar = (t) => { const box = t.closest('.plan'); if (box._m > 0) { abonar(planPor(t.dataset.p), box._m); repinta(); } };
ACC.resto = (t) => { const box = t.closest('.plan'); pintaAbono(box, +t.dataset.r); box.querySelector('[data-monto]').value = t.dataset.r; };
ACC.filtro = (t) => { S.filtro = t.dataset.f; document.getElementById('cobros-c').innerHTML = cuerpoCobros(); };
ACC.abrir = (t) => abreIns(t.dataset.id, t.dataset.plan);
ACC.ver = (t) => ver(t.dataset.v);
ACC['cal-m'] = (t) => { S.calI += +t.dataset.d; S.calDia = new Date(Math.floor(S.calI / 12), S.calI % 12, 1); pintar(false); };
ACC['cal-d'] = (t) => { const d = new Date(+t.dataset.f); S.calDia = d; S.calI = d.getFullYear() * 12 + d.getMonth(); pintar(false); };
ACC.duda = (t, e) => {
  e.stopPropagation();
  const d = D.dudas.find(x => String(x.id) === t.dataset.d); d.leida = true; repinta();
  const g = escribir(() => api(`/api/dudas/${d.id}/leido`, { method: 'PUT', body: { leido: true } })).catch(() => { d.leida = false; repinta(); falla('No se pudo marcar como leída'); });
  aviso('La familia verá que ya la leíste', () => { d.leida = false; g.then(() => escribir(() => api(`/api/dudas/${d.id}/leido`, { method: 'PUT', body: { leido: false } })).catch(() => falla('No se pudo deshacer'))); });
};
main.addEventListener('input', (e) => { if (e.target.id === 'buscar') { S.buscar = e.target.value; document.getElementById('fam-c').innerHTML = cuerpoFamilias(); } });

/* ── Hojas de cobros ── */
ACC.mes = (t) => {
  const [s, i] = parC(t), e = estado(s, i), tit = cap(MES[i % 12]) + ' ' + Math.floor(i / 12), v = s.id;
  if (e.t === 'pagado') abreHoja(tit, nom1(s), `<div class="dato"><span>Estado</span><span class="etq e-ok">Pagado</span></div><div class="dato"><span>Fecha</span><b>${fLarga(e.f)}</b></div><div class="dato"><span>Monto</span><b class="num">${$$(e.p.total)}</b></div><button class="btn btn-peligro btn-g" data-act="quitar-mes" data-p="${e.p.id}" data-id="${esc(v)}">Quitar este pago</button>`, { volver: v });
  else if (e.t === 'na') abreHoja(tit, nom1(s), `<p class="nota-h">No corresponde: ${i < INICIO ? 'las mensualidades empiezan en noviembre de 2027' : 'aún no ingresaba a la escuela'}.</p>`, { volver: v });
  else abreHoja(tit, nom1(s), `<div class="dato"><span>Estado</span>${e.t === 'debe' ? `<span class="etq e-mal">Pendiente</span>` : '<span class="etq e-neu">Por vencer</span>'}</div><div class="dato"><span>Vence</span><b>${fLarga(e.due)}</b></div><button class="btn btn-1 btn-g" data-act="cobrar-mes" data-c="${esc(s.id)}|${i}">Cobrar ${$$(CUOTA)}</button>`, { volver: v });
};
ACC['cobrar-mes'] = (t) => { const [s, i] = parC(t); cobrar(s, i); pintar(); abreIns(s.id, null, true); };
ACC['quitar-mes'] = (t) => {
  const p = planPor(t.dataset.p), v = t.dataset.id;
  hojaConfirma({ titulo: '¿Quitar este pago?', texto: 'La mensualidad volverá a aparecer como pendiente. Queda registrado en Movimientos.', boton: 'Quitar pago', volver: v, fn: async () => { quitarPago(p, 'Pago quitado'); pintar(); abreIns(v, null, true); } });
};
ACC['plan-nuevo'] = (t) => {
  const v = t.dataset.id;
  abreHoja('Nuevo pago a plazos', nom1(al(v)), `${campo('Concepto', '<input id="pl-c" maxlength="50" placeholder="Dobok, protectores, examen…" autocomplete="off">')}${campo('Monto total', '<input id="pl-t" inputmode="decimal" autocomplete="off">')}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="plan-crear" data-id="${esc(v)}">Crear</button>`, { volver: v, foco: '#pl-c' });
};
ACC['plan-crear'] = (t) => {
  const c = val('pl-c'), m = parseFloat(val('pl-t')), s = al(t.dataset.id);
  if (!c) return errorForm('Escribe el concepto.');
  if (norm(c) === 'mensualidad') return errorForm('Las mensualidades se cobran desde Cobros.');
  if (!(m > 0)) return errorForm('Escribe un monto válido.');
  crearPlan(s, cap(c), m); pintar(); abreIns(s.id, null, true);
};
ACC['plan-editar'] = (t) => {
  const p = planPor(t.dataset.p), v = insId;
  abreHoja(p.concepto, `Abonado ${$$(p.abonado)}`, `${campo('Concepto', `<input id="pl-c" maxlength="50" value="${esc(p.concepto)}" autocomplete="off">`)}${campo('Monto total', `<input id="pl-t" inputmode="decimal" value="${p.total}" autocomplete="off">`)}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="plan-guardar" data-p="${p.id}" data-id="${esc(v)}">Guardar</button><button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="plan-borrar" data-p="${p.id}" data-id="${esc(v)}">Eliminar pago</button>`, { volver: v });
};
ACC['plan-guardar'] = (t) => {
  const p = planPor(t.dataset.p), c = val('pl-c'), m = parseFloat(val('pl-t')), v = t.dataset.id;
  if (!c || !(m > 0)) return errorForm('Revisa el concepto y el monto.');
  if (norm(c) === 'mensualidad') return errorForm('Las mensualidades se cobran desde Cobros.');
  if (m < p.abonado) return errorForm(`Ya se abonaron ${$$(p.abonado)}: el total no puede ser menor.`);
  enviarForm(t, async () => {
    const estadoN = p.abonado >= m ? 'Liquidado' : 'Pendiente';
    await api('/api/pagos/' + p.id, { method: 'PUT', body: { tipo_pago: cap(c), monto_total: m, estado_pago: estadoN } });
    p.concepto = cap(c); p.total = m; p.estado = estadoN; pintar(); abreIns(v, null, true);
  });
};
ACC['plan-borrar'] = (t) => {
  const p = planPor(t.dataset.p), v = t.dataset.id;
  hojaConfirma({ titulo: `¿Eliminar ${p.concepto}?`, texto: `Se borra el pago y sus abonos de ${$$(p.abonado)}. Queda registrado en Movimientos.`, boton: 'Eliminar', volver: v, fn: async () => { quitarPago(p, 'Pago eliminado'); pintar(); abreIns(v, null, true); } });
};

/* ── Alumnos ── */
const PARENTESCOS = ['Madre','Padre','Tutora','Tutor','Abuela','Abuelo','Hermana','Hermano','Tía','Tío','Otro'];
const SANGRES = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];
const opcion = (v, t, sel) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(t)}</option>`;
function hojaAlumno(s) {
  const tutores = [...new Map(D.alumnos.map(x => [x.resp, x.tutor])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const pars = s && s.par && !PARENTESCOS.includes(s.par) ? [s.par, ...PARENTESCOS] : PARENTESCOS;
  const cuerpo = `${campo('Nombre completo', `<input id="a-n" maxlength="100" autocomplete="off" value="${esc(s ? s.n : '')}">`)}
  <div class="dos">${campo('Nacimiento', `<input id="a-nac" type="date" value="${esc(s ? s.nac : '')}">`)}${campo('Grado', `<select id="a-c">${BELTS.map((b, i) => opcion(String(b.id), b.n, String(BELTS[s ? s.cinta : 0].id))).join('')}</select>`)}</div>
  <div class="dos">${campo('Clase', `<select id="a-k">${opcion('', 'Sin asignar', s ? s.claseId : '')}${D.clases.map(c => opcion(c.id, c.n, s ? s.claseId : '')).join('')}</select>`)}${esAdmin() ? campo('Día de pago', `<select id="a-dp">${opcion('1', 'Día 1', String(s ? s.dia : 1))}${opcion('15', 'Día 15', String(s ? s.dia : 1))}</select>`) : ''}</div>
  ${s ? campo('Fecha de ingreso', `<input id="a-ing" type="date" value="${iso(s.ingreso)}">`) : ''}
  <div class="bloque"><h3>Tutor</h3>${campo('Cuenta de la familia', `<select id="a-t" data-tutor-sel>${s ? '' : opcion('__nuevo', 'Tutor nuevo', '__nuevo')}${s ? opcion(s.resp, s.tutor, s.resp) : ''}${tutores.filter(([r]) => !s || r !== s.resp).map(([r, n]) => opcion(r, n, '')).join('')}${s ? opcion('__nuevo', 'Tutor nuevo', '') : ''}</select>`)}
   <div id="a-td">${campo('Nombre del tutor', `<input id="a-tn" maxlength="100" autocomplete="off" value="${esc(s ? s.tutor : '')}">`)}${campo('Teléfono', `<input id="a-tt" maxlength="20" inputmode="tel" autocomplete="off" value="${esc(s ? s.tel : '')}">`)}</div>
   ${campo('Parentesco', `<select id="a-p">${opcion('', 'Sin indicar', s ? s.par : '')}${pars.map(p => opcion(p, p, s ? s.par : '')).join('')}</select>`)}</div>
  <div class="bloque"><h3>Datos (opcional)</h3>${campo('Correo', `<input id="a-e" maxlength="100" type="email" autocomplete="off" value="${esc(s ? s.email : '')}">`)}${campo('Dirección', `<input id="a-d" autocomplete="off" value="${esc(s ? s.dir : '')}">`)}${campo('Tipo de sangre', `<select id="a-s">${opcion('', 'Sin indicar', s ? s.sangre : '')}${SANGRES.map(x => opcion(x, x, s ? s.sangre : '')).join('')}</select>`)}<div class="dos">${campo('Emergencias', `<input id="a-em" maxlength="100" autocomplete="off" value="${esc(s ? s.emer : '')}">`)}${campo('Tel. emergencias', `<input id="a-et" maxlength="20" inputmode="tel" autocomplete="off" value="${esc(s ? s.telEmer : '')}">`)}</div>${campo('Notas médicas', `<textarea id="a-m">${esc(s ? s.med : '')}</textarea>`)}</div>
  ${FORM_ERR}<button class="btn btn-1 btn-g" data-act="${s ? 'alumno-guardar' : 'alumno-crear'}" ${s ? `data-id="${esc(s.id)}"` : ''}>${s ? 'Guardar' : 'Registrar alumno'}</button>`;
  abreHoja(s ? 'Editar a ' + nom1(s) : 'Nuevo alumno', '', cuerpo, { volver: s ? s.id : null, foco: s ? null : '#a-n', completa: true });
}
ins.addEventListener('change', (e) => {
  if (!e.target.matches('[data-tutor-sel]')) return;
  const v = e.target.value, s = ins.querySelector('[data-act=alumno-guardar]') ? al(ins.querySelector('[data-act=alumno-guardar]').dataset.id) : null, misma = s && s.resp === v;
  document.getElementById('a-td').hidden = !(v === '__nuevo' || misma);
  if (v === '__nuevo') { document.getElementById('a-tn').value = ''; document.getElementById('a-tt').value = ''; }
  else if (misma) { document.getElementById('a-tn').value = s.tutor; document.getElementById('a-tt').value = s.tel; }
});
ACC['alumno-nuevo'] = () => hojaAlumno(null);
ACC['alumno-editar'] = (t) => hojaAlumno(al(t.dataset.id));
const camposAlumno = () => ({
  nombre: val('a-n'), fecha_nacimiento: val('a-nac'), id_cinta_actual: +val('a-c'), parentesco: val('a-p') || null,
  email: val('a-e'), direccion: val('a-d'), tipo_sangre: val('a-s'), contacto_emergencia: val('a-em'), tel_emergencia: val('a-et'), notas_medicas: val('a-m')
});
const validaAlumno = (d, tutor) => !d.nombre ? 'Escribe el nombre.' : !d.fecha_nacimiento ? 'Indica la fecha de nacimiento.' : tutor === '__nuevo' && !val('a-tn') ? 'Escribe el nombre del tutor.' : '';
// El ID lo confirma el servidor: el generado aquí puede estar ocupado por un alumno ya borrado
function idSugerido(nombre) {
  const ini = norm(nombre).replace(/[^a-z\s]/g, '').trim().split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase() || 'XX';
  return `AT-${HOY.getFullYear()}${ini}001`;
}
ACC['alumno-crear'] = (t) => {
  const d = camposAlumno(), tutor = val('a-t'), err = validaAlumno(d, tutor); if (err) return errorForm(err);
  enviarForm(t, async () => {
    const r = await api('/api/alumnos/registro-completo', { method: 'POST', body: {
      ...d, num_control: idSugerido(d.nombre), dia_pago: +val('a-dp') || 1,
      ...(tutor === '__nuevo' ? { responsable_nombre: val('a-tn'), responsable_telefono: val('a-tt'), responsable_direccion: d.direccion } : { num_control_responsable: tutor })
    } });
    const id = r.alumno.num_control, clase = val('a-k');
    let avisoClase = false;
    if (clase) { try { await api('/api/clases/alumno/' + encodeURIComponent(id), { method: 'PUT', body: { id_clase: clase } }); } catch (_) { avisoClase = true; } }
    await cargarDatos(); pintar();
    if (r.password_temporal) hojaAcceso(id, r.password_temporal, id); else { abreIns(id, null, true); aviso('Alumno registrado en la misma cuenta'); }
    if (avisoClase) falla('El alumno se registró, pero no se pudo asignar su clase');
  });
};
ACC['alumno-guardar'] = (t) => {
  const s = al(t.dataset.id), d = camposAlumno(), tutor = val('a-t'), err = validaAlumno(d, tutor); if (err) return errorForm(err);
  enviarForm(t, async () => {
    const misma = tutor === s.resp;
    await api('/api/alumnos/' + encodeURIComponent(s.id), { method: 'PUT', body: {
      ...d, fecha_ingreso: val('a-ing') || null, dia_pago: esAdmin() ? +val('a-dp') : s.dia,
      responsable_nombre: misma ? val('a-tn') : '', responsable_telefono: misma ? val('a-tt') : s.tel
    } });
    let acceso = null;
    if (!misma) {
      const r = await api(`/api/alumnos/${encodeURIComponent(s.id)}/tutor`, { method: 'PUT', body: tutor === '__nuevo' ? { nuevo_tutor: { nombre: val('a-tn'), telefono: val('a-tt') }, parentesco: d.parentesco } : { num_control_responsable: tutor, parentesco: d.parentesco } });
      if (r.password_temporal) acceso = r;
    }
    if (val('a-k') !== s.claseId) await api('/api/clases/alumno/' + encodeURIComponent(s.id), { method: 'PUT', body: { id_clase: val('a-k') || null } });
    await cargarDatos(); pintar();
    if (acceso) hojaAcceso(acceso.username, acceso.password_temporal, s.id); else { abreIns(s.id, null, true); aviso('Datos guardados'); }
  });
};
ACC['reset-acceso'] = (t) => {
  const s = al(t.dataset.id);
  hojaConfirma({ titulo: '¿Nueva contraseña temporal?', texto: `La contraseña actual de ${s.tutor} dejará de servir.`, boton: 'Generar', volver: s.id, fn: async () => {
    const r = await api(`/api/alumnos/${encodeURIComponent(s.id)}/reset-acceso`, { method: 'POST' });
    hojaAcceso(r.username, r.password_temporal, s.id);
  } });
};
ACC.baja = (t) => {
  const s = al(t.dataset.id);
  hojaConfirma({ titulo: `¿Dar de baja a ${s.n}?`, texto: 'Se borran su ficha y sus exámenes. No se puede deshacer. Sus pagos se conservan como historial.', boton: 'Dar de baja', escribe: nom1(s), volver: s.id, fn: async () => {
    await api('/api/alumnos/' + encodeURIComponent(s.id), { method: 'DELETE' });
    await cargarDatos(); cerrarIns(); pintar(); aviso(`${s.n} dado de baja`);
  } });
};

/* ── Exámenes ── */
function hojaExamen(s, x) {
  const sig = x && x.cinta !== null ? x.cinta : Math.min(s.cinta + 1, BELTS.length - 1);
  abreHoja(x ? 'Editar examen' : 'Registrar examen', nom1(s), `<div class="dos">${campo('Fecha', `<input id="x-f" type="date" value="${iso(x ? x.d : HOY)}">`)}${campo('Resultado', `<select id="x-r">${['Pendiente','Aprobado','Reprobado'].map(r => opcion(r, r, x ? x.r : 'Pendiente')).join('')}</select>`)}</div>${campo('Hacia el grado', `<select id="x-c">${BELTS.map((b, i) => opcion(String(b.id), b.n, String(BELTS[sig].id))).join('')}</select>`)}${campo('Observaciones', `<textarea id="x-o">${esc(x ? x.obs : '')}</textarea>`)}<p class="nota-h" style="margin-top:8px;font-size:.8438rem">Al marcarlo Aprobado, el grado del alumno se actualiza.</p>${FORM_ERR}<button class="btn btn-1 btn-g" data-act="examen-guardar" data-id="${esc(s.id)}" ${x ? `data-x="${x.id}"` : ''}>Guardar</button>${x ? `<button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="examen-borrar" data-id="${esc(s.id)}" data-x="${x.id}">Eliminar examen</button>` : ''}`, { volver: s.id });
}
ACC['examen-nuevo'] = (t) => hojaExamen(al(t.dataset.id), null);
ACC['examen-editar'] = (t) => hojaExamen(al(insId), D.examenes.find(x => String(x.id) === t.dataset.x));
ACC['examen-guardar'] = (t) => {
  const s = al(t.dataset.id), f = val('x-f'); if (!f) return errorForm('Indica la fecha.');
  const cuerpo = { fecha: f, resultado: val('x-r'), observaciones: val('x-o'), id_cinta_aspirada: +val('x-c') };
  enviarForm(t, async () => {
    if (t.dataset.x) await api('/api/examenes/' + t.dataset.x, { method: 'PUT', body: cuerpo });
    else await api('/api/examenes', { method: 'POST', body: { ...cuerpo, num_control_alumno: s.id } });
    await cargarDatos(); pintar(); abreIns(s.id, null, true); aviso('Examen guardado');
  });
};
ACC['examen-borrar'] = (t) => {
  const v = t.dataset.id, id = t.dataset.x;
  hojaConfirma({ titulo: '¿Eliminar este examen?', texto: 'No se puede deshacer. El grado actual del alumno no cambia.', boton: 'Eliminar', volver: v, fn: async () => { await api('/api/examenes/' + id, { method: 'DELETE' }); await cargarDatos(); pintar(); abreIns(v, null, true); } });
};

/* ── Eventos ── */
function hojaEvento(e, fecha) {
  if (!esAdmin()) { abreHoja(e.t, cap(DIA[e.d.getDay()]) + ' ' + fLarga(e.d), `<div class="dato"><span>Tipo</span><b>${TIPO[e.k]}</b></div>${e.l ? `<div class="dato"><span>Lugar</span><b>${esc(e.l)}</b></div>` : ''}${e.desc ? `<p class="nota-h" style="margin-top:8px">${esc(e.desc)}</p>` : ''}`); return; }
  abreHoja(e ? 'Editar evento' : 'Nuevo evento', '', `${campo('Título', `<input id="v-t" maxlength="150" autocomplete="off" value="${esc(e ? e.t : '')}">`)}<div class="dos">${campo('Tipo', `<select id="v-k">${Object.keys(TIPO).map(k => opcion(k, TIPO[k], e ? e.k : 'otro')).join('')}</select>`)}${campo('Fecha', `<input id="v-f" type="date" value="${e ? iso(e.d) : esc(fecha || iso(HOY))}">`)}</div>${campo('Lugar', `<input id="v-l" maxlength="150" autocomplete="off" value="${esc(e ? e.l : '')}">`)}${campo('Descripción', `<textarea id="v-d">${esc(e ? e.desc : '')}</textarea>`)}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="evento-guardar" ${e ? `data-e="${esc(e.id)}"` : ''}>Guardar</button>${e ? `<button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="evento-borrar" data-e="${esc(e.id)}">Eliminar evento</button>` : ''}`, { foco: e ? null : '#v-t' });
}
const eventoPor = (id) => D.eventos.find(x => String(x.id) === String(id));
ACC.evento = (t) => { const e = eventoPor(t.dataset.e); if (e) hojaEvento(e); };
ACC['evento-nuevo'] = (t) => hojaEvento(null, t.dataset.f);
ACC['evento-guardar'] = (t) => {
  const tt = val('v-t'), f = val('v-f'); if (!tt || !f) return errorForm('Escribe el título y la fecha.');
  const datos = { t: tt, k: val('v-k'), d: fechaDe(f), l: val('v-l'), desc: val('v-d') };
  if (!t.dataset.e) { crearEvento(datos); S.calDia = datos.d; S.calI = datos.d.getFullYear() * 12 + datos.d.getMonth(); cerrarIns(); pintar(); return; }
  const e = eventoPor(t.dataset.e);
  enviarForm(t, async () => { await api('/api/eventos/' + e.id, { method: 'PUT', body: cuerpoEvento(datos) }); Object.assign(e, datos); cerrarIns(); pintar(); aviso('Evento guardado'); });
};
ACC['evento-borrar'] = (t) => {
  const e = eventoPor(t.dataset.e); D.eventos = D.eventos.filter(x => x !== e); cerrarIns(); pintar();
  const g = escribir(() => api('/api/eventos/' + e.id, { method: 'DELETE' })).then(() => true).catch(() => { D.eventos.push(e); repinta(); falla('No se pudo eliminar el evento'); return false; });
  aviso('Evento eliminado', () => { g.then(ok => { if (ok) crearEvento({ t: e.t, k: e.k, d: e.d, l: e.l, desc: e.desc }), repinta(); }); });
};

/* ── Clases ── */
function hojaClase(c) {
  const dias = diasDe(c ? c.dias : '');
  abreHoja(c ? 'Editar clase' : 'Nueva clase', '', `${campo('Nombre', `<input id="k-n" maxlength="50" autocomplete="off" value="${esc(c ? c.n : '')}" placeholder="Horario 5-6">`)}<div class="campo"><span>Días</span><div class="dias">${DIAS_CLASE.map(d => `<label><input type="checkbox" data-dia value="${d}" ${dias.includes(NUM_DIA[norm(d)]) ? 'checked' : ''}><span>${d.slice(0, 3)}</span></label>`).join('')}</div></div><div class="dos">${campo('Inicio', `<input id="k-i" type="time" value="${c ? c.ini : ''}">`)}${campo('Fin', `<input id="k-f" type="time" value="${c ? c.fin : ''}">`)}</div>${campo('Maestro', `<select id="k-m">${D.maestros.map(m => opcion(m.id, m.n, c ? c.maestro : '')).join('')}</select>`)}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="clase-guardar" ${c ? `data-c="${c.id}"` : ''}>Guardar</button>${c ? `<button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="clase-borrar" data-c="${c.id}">Eliminar clase</button>` : ''}`);
}
ACC['clase-nueva'] = () => hojaClase(null);
ACC['clase-editar'] = (t) => hojaClase(D.clases.find(c => c.id === t.dataset.c));
ACC['clase-guardar'] = (t) => {
  const dias = [...ins.querySelectorAll('[data-dia]:checked')].map(x => x.value).join(','), cuerpo = { nombre: val('k-n') || 'Clase', dia_semana: dias, hora_inicio: val('k-i'), hora_fin: val('k-f'), id_instructor: +val('k-m') || 1 };
  if (!dias || !cuerpo.hora_inicio || !cuerpo.hora_fin) return errorForm('Elige los días y el horario.');
  if (cuerpo.hora_fin <= cuerpo.hora_inicio) return errorForm('La hora de fin debe ser después del inicio.');
  enviarForm(t, async () => {
    if (t.dataset.c) await api('/api/clases/' + t.dataset.c, { method: 'PUT', body: cuerpo }); else await api('/api/clases', { method: 'POST', body: cuerpo });
    await cargarDatos(); cerrarIns(); pintar(); aviso('Clase guardada');
  });
};
ACC['clase-borrar'] = (t) => {
  const id = t.dataset.c, c = D.clases.find(x => x.id === id), n = D.alumnos.filter(s => s.claseId === id).length;
  hojaConfirma({ titulo: `¿Eliminar ${c.n}?`, texto: n ? `${n} alumnos se quedarán sin clase asignada. No se puede deshacer.` : 'No se puede deshacer.', boton: 'Eliminar', fn: async () => { await api('/api/clases/' + id, { method: 'DELETE' }); await cargarDatos(); cerrarIns(); pintar(); } });
};

/* ── Inventario ── */
const tStock = {};
const cuerpoArticulo = (a) => ({ descripcion: a.n, talla_modelo: a.talla, precio_unitario: a.precio, stock: a.stock, stock_minimo: a.min });
ACC.stock = (t, e) => {
  e.stopPropagation();
  const a = D.equipo.find(x => String(x.id) === t.dataset.e), n = Math.max(0, a.stock + +t.dataset.d); if (n === a.stock) return;
  if (a._antes === undefined) a._antes = a.stock;
  a.stock = n; main.querySelector(`[data-sn="${a.id}"]`).textContent = n;
  // Se toca varias veces seguidas: se guarda cuando termina
  clearTimeout(tStock[a.id]);
  tStock[a.id] = setTimeout(() => {
    const antes = a._antes; delete a._antes;
    escribir(() => api('/api/equipo/' + a.id, { method: 'PUT', body: cuerpoArticulo(a) })).then(() => { if (S.v === 'inventario') pintar(); }).catch(() => { a.stock = antes; repinta(); falla('No se guardó el inventario de ' + a.n); });
  }, 600);
};
function hojaArticulo(a) {
  abreHoja(a ? 'Editar artículo' : 'Nuevo artículo', '', `${campo('Descripción', `<input id="r-n" autocomplete="off" value="${esc(a ? a.n : '')}">`)}${campo('Talla o modelo', `<input id="r-t" autocomplete="off" value="${esc(a ? a.talla : '')}">`)}<div class="dos">${campo('Precio', `<input id="r-p" inputmode="decimal" autocomplete="off" value="${a ? a.precio : ''}">`)}${campo('Existencia', `<input id="r-s" inputmode="numeric" autocomplete="off" value="${a ? a.stock : 0}">`)}</div>${campo('Avisar cuando queden', `<input id="r-m" inputmode="numeric" autocomplete="off" value="${a ? a.min : 2}">`)}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="articulo-guardar" ${a ? `data-e="${a.id}"` : ''}>Guardar</button>${a ? `<button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="articulo-borrar" data-e="${a.id}">Eliminar artículo</button>` : ''}`);
}
ACC['articulo-nuevo'] = () => hojaArticulo(null);
ACC['articulo-editar'] = (t) => hojaArticulo(D.equipo.find(x => String(x.id) === t.dataset.e));
ACC['articulo-guardar'] = (t) => {
  const d = { n: val('r-n'), talla: val('r-t'), precio: parseFloat(val('r-p')), stock: parseInt(val('r-s')) || 0, min: parseInt(val('r-m')) || 0 };
  if (!d.n || !(d.precio >= 0)) return errorForm('Revisa la descripción y el precio.');
  enviarForm(t, async () => {
    if (t.dataset.e) await api('/api/equipo/' + t.dataset.e, { method: 'PUT', body: cuerpoArticulo(d) }); else await api('/api/equipo', { method: 'POST', body: cuerpoArticulo(d) });
    await cargarDatos(); cerrarIns(); pintar(); aviso('Artículo guardado');
  });
};
ACC['articulo-borrar'] = (t) => {
  const a = D.equipo.find(x => String(x.id) === t.dataset.e);
  hojaConfirma({ titulo: `¿Eliminar ${a.n}?`, texto: 'No se puede deshacer.', boton: 'Eliminar', fn: async () => { await api('/api/equipo/' + a.id, { method: 'DELETE' }); await cargarDatos(); cerrarIns(); pintar(); } });
};

/* ── Maestros ── */
function hojaMaestro(m) {
  abreHoja(m ? m.n : 'Nuevo maestro', m && m.usuario ? 'Usuario: ' + m.usuario : '', `${campo('Nombre', `<input id="m-n" autocomplete="off" value="${esc(m ? m.n : '')}">`)}<div class="dos">${campo('Cargo', `<input id="m-c" autocomplete="off" value="${esc(m ? m.cargo : '')}">`)}${campo('Grado', `<input id="m-g" autocomplete="off" value="${esc(m ? m.grado : '')}">`)}</div>${campo('Correo', `<input id="m-e" type="email" autocomplete="off" value="${esc(m ? m.email : '')}">`)}${campo('Teléfono', `<input id="m-t" inputmode="tel" autocomplete="off" value="${esc(m ? m.tel : '')}">`)}${m ? '' : campo('Usuario para entrar', '<input id="m-u" autocomplete="off">') + campo('Contraseña inicial', '<input id="m-p" type="password" autocomplete="new-password">')}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="maestro-guardar" ${m ? `data-m="${m.id}"` : ''}>Guardar</button>${m && m.id !== '1' ? `<button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="maestro-borrar" data-m="${m.id}">Eliminar maestro</button>` : ''}`);
}
ACC['maestro-nuevo'] = () => hojaMaestro(null);
ACC['maestro-editar'] = (t) => hojaMaestro(D.maestros.find(m => m.id === t.dataset.m));
ACC['maestro-guardar'] = (t) => {
  const d = { nombre: val('m-n'), cargo: val('m-c'), grado_cinta: val('m-g'), email: val('m-e'), telefono: val('m-t') };
  if (!d.nombre) return errorForm('Escribe el nombre.');
  if (!t.dataset.m && (!val('m-u') || val('m-p').length < 6)) return errorForm('Indica un usuario y una contraseña de al menos 6 caracteres.');
  enviarForm(t, async () => {
    if (t.dataset.m) await api('/api/instructores/' + t.dataset.m, { method: 'PUT', body: d });
    else await api('/api/instructores', { method: 'POST', body: { ...d, username: val('m-u'), password: document.getElementById('m-p').value } });
    await cargarDatos(); cerrarIns(); pintar(); aviso('Maestro guardado');
  });
};
ACC['maestro-borrar'] = (t) => {
  const m = D.maestros.find(x => x.id === t.dataset.m);
  hojaConfirma({ titulo: `¿Eliminar a ${m.n}?`, texto: 'Pierde su acceso y sus clases pasan al maestro principal. No se puede deshacer.', boton: 'Eliminar', escribe: m.n.split(' ')[0], fn: async () => { await api('/api/instructores/' + m.id, { method: 'DELETE' }); await cargarDatos(); cerrarIns(); pintar(); } });
};

/* ── Mi cuenta ── */
ACC.cuenta = () => {
  abreHoja('Mi cuenta', SESION.username, `${campo('Nombre', `<input id="c-n" autocomplete="off" value="${esc(SESION.nombre || '')}">`)}<button class="btn btn-2 btn-g" style="margin-top:10px" data-act="cuenta-nombre">Guardar nombre</button>${campo('Nueva contraseña', '<input id="c-pass" type="password" autocomplete="new-password">')}<button class="btn btn-2 btn-g" style="margin-top:10px" data-act="cambiar-pass">Cambiar contraseña</button>${FORM_ERR}`);
};
ACC['cuenta-nombre'] = (t) => {
  const n = val('c-n'); if (n.length < 2) return errorForm('El nombre es muy corto.');
  enviarForm(t, async () => { const r = await api('/api/auth/perfil', { method: 'PUT', body: { nombre: n } }); SESION.nombre = r.nombre; guardar('dojang-sesion', SESION); cerrarIns(); pintar(); aviso('Nombre guardado'); });
};
ACC['cambiar-pass'] = (t) => {
  const n = document.getElementById('c-pass').value; if (n.length < 6) return errorForm('La contraseña necesita al menos 6 caracteres.');
  enviarForm(t, async () => { await api('/api/auth/cambiar-pass', { method: 'POST', body: { nuevaPassword: n } }); cerrarIns(); aviso('Contraseña cambiada'); });
};

/* ── Registrar: una sola caja para cobrar, abonar, crear pagos y eventos ── */
const cmd = document.getElementById('cmd'), cmdIn = document.getElementById('cmd-in'), cmdRes = document.getElementById('cmd-res'), cmdCaja = document.getElementById('cmd-caja');
let cmdItems = [], cmdSel = 0;
function interpretar(q) {
  const raw = q.trim(), adm = esAdmin();
  if (!raw) {
    if (!adm) return { items: [] };
    const pen = pendientes().slice(0, 2);
    return { cab: 'Sugerencias', items: [...pen.map(p => ({ ic: 'cobros', t: `Cobrar a ${nom1(p.s)}`, sub: `${cap(MES[p.i % 12])} · ${$$(CUOTA)} · ${textoAtraso(p.dias)}`, run() { cobrar(p.s, p.i); } })),
      { ic: 'cobros', t: 'Abonar a un pago', sub: 'Escribe nombre y monto: emilio 300', fill: 'emilio 300' }, { ic: 'evento', t: 'Crear un evento', sub: 'Escribe tipo y fecha: fogueo 12 mar', fill: 'fogueo 12 mar' }, { ic: 'persona', t: 'Nuevo alumno', sub: 'Abre el registro', run() { hojaAlumno(null); }, sinPintar: true }] };
  }
  let t = norm(raw), fecha = null;
  const mf = t.match(/\b(\d{1,2})\s*(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*/);
  if (mf) { const mi = MES3.indexOf(mf[2]); fecha = new Date(HOY.getFullYear(), mi, +mf[1]); if (fecha < HOY) fecha = new Date(HOY.getFullYear() + 1, mi, +mf[1]); t = t.replace(mf[0], ' '); }
  if (/\bmanana\b/.test(t)) { fecha = new Date(HOY); fecha.setDate(fecha.getDate() + 1); t = t.replace('manana', ' '); }
  else if (/\bhoy\b/.test(t)) { fecha = new Date(HOY); t = t.replace('hoy', ' '); }
  const mm = t.match(/\$?\b(\d{2,6}(?:\.\d{1,2})?)\b/), monto = mm ? +mm[1] : null; if (mm) t = t.replace(mm[0], ' ');
  const toks = t.split(/\s+/).filter(Boolean), usados = new Set();
  const conservar = (lista) => raw.split(/\s+/).filter(w => lista.includes(norm(w))).join(' ');   // conserva acentos y mayúsculas
  const mt = adm && toks.find(w => /^(examen|torneo|fogueo|evento|convivencia|otro)$/.test(w));
  const coinc = D.alumnos.filter(s => { const ps = norm(s.n).split(' '); return toks.some(w => w.length >= 3 && ps.some(p => p.startsWith(w) && (usados.add(w), true))); });
  const resto = toks.filter(w => !usados.has(w)), items = [];
  if (mt && (!coinc.length || !monto)) {
    const k = ['examen','torneo','fogueo'].includes(mt) ? mt : 'otro';
    const tit = conservar(toks.filter(w => w !== 'evento' && w !== 'otro')), titulo = tit && tit.split(/\s+/).length > 1 || mt === 'convivencia' ? cap(tit) : ({ examen: 'Examen de grado', torneo: 'Torneo', fogueo: 'Fogueo', otro: 'Evento' }[k]);
    if (!fecha) return { aviso: `Falta la fecha. Por ejemplo: ${mt} 12 mar`, items: [] };
    return { items: [{ ic: 'evento', t: `Crear: ${titulo}`, sub: `${cap(DIA[fecha.getDay()])} ${fLarga(fecha)} · ${TIPO[k]}`, run() { crearEvento({ t: titulo, k, d: fecha, l: '', desc: '' }); S.calDia = new Date(fecha); S.calI = fecha.getFullYear() * 12 + fecha.getMonth(); } }] };
  }
  coinc.slice(0, 5).forEach(s => {
    const nom = nom1(s), pen = adm ? pendientesDe(s) : [], pls = adm ? planesDe(s).filter(p => p.abonado < p.total) : [], con = conservar(resto);
    if (adm && monto && con) {
      const ex = pls.find(p => norm(p.concepto).includes(norm(con)));
      if (norm(con) === 'mensualidad') items.push({ av: s, bloq: true, t: 'Las mensualidades son de ' + $$(CUOTA), sub: 'Escribe solo: ' + norm(nom) + ' ' + CUOTA });
      else if (ex) { const r = ex.total - ex.abonado; if (monto > r) items.push({ av: s, bloq: true, t: `${ex.concepto} de ${nom}: solo resta ${$$(r)}`, sub: `Prueba con ${r} o menos` }); else items.push({ av: s, t: `Abonar ${$$(monto)} a ${ex.concepto}`, sub: `${nom} · después restarán ${$$(r - monto)}`, run() { abonar(ex, monto); } }); }
      else items.push({ av: s, t: `Nuevo pago: ${cap(con)} · ${$$(monto)}`, sub: `A plazos para ${nom}`, run() { crearPlan(s, cap(con).slice(0, 50), monto); } });
    } else if (adm && monto) {
      if (pen.length && monto === CUOTA) { const p = pen[0]; items.push({ av: s, t: `Cobrar ${MES[p.i % 12]} a ${nom}`, sub: `Mensualidad · ${$$(CUOTA)}`, run() { cobrar(s, p.i); } }); }
      pls.forEach(p => { const r = p.total - p.abonado; if (monto > r) items.push({ av: s, bloq: true, t: `${p.concepto} de ${nom}: solo resta ${$$(r)}`, sub: `Prueba con ${r} o menos` }); else items.push({ av: s, t: `Abonar ${$$(monto)} a ${p.concepto}`, sub: `${nom} · después restarán ${$$(r - monto)}`, run() { abonar(p, monto); } }); });
      if (!pls.length && !(pen.length && monto === CUOTA)) items.push({ av: s, bloq: true, t: `${nom} no tiene saldo por ${$$(monto)}`, sub: `Para un pago nuevo agrega el concepto: dobok ${norm(nom)} ${monto}` });
    } else {
      if (pen.length) items.push({ av: s, t: `Cobrar ${MES[pen[0].i % 12]} a ${nom}`, sub: `Mensualidad · ${$$(CUOTA)} · ${textoAtraso(pen[0].dias)}`, run() { cobrar(s, pen[0].i); } });
      items.push({ av: s, t: `Abrir ficha de ${nom}`, sub: `${BELTS[s.cinta].n} · ${s.tutor}`, run() { abreIns(s.id, null, true); }, sinPintar: true });
    }
  });
  if (!items.length) return { aviso: adm ? 'No encontré a nadie con ese nombre. Prueba: emilio 300, dobok diego 800, fogueo 12 mar.' : 'No encontré a nadie con ese nombre.', items: [] };
  return { items };
}
function pintaCmd() {
  const r = interpretar(cmdIn.value); cmdItems = r.items; cmdSel = Math.max(0, cmdItems.findIndex(i => !i.bloq));
  cmdRes.innerHTML = (r.cab ? `<div class="cmd-cab">${r.cab}</div>` : '') + (r.aviso ? `<div class="cmd-aviso">${esc(r.aviso)}</div>` : '') + cmdItems.map((it, i) => `<button class="cmd-i ${i === cmdSel && !it.bloq ? 'act' : ''}" role="option" data-i="${i}" ${it.bloq ? 'disabled style="cursor:default"' : ''}>${it.av ? av(it.av) : `<span class="cmd-ico">${ico(it.ic, 17)}</span>`}<span style="min-width:0"><b style="${it.bloq ? 'color:var(--warn)' : ''}">${esc(it.t)}</b><small>${esc(it.sub || '')}</small></span><span class="ent">Enter</span></button>`).join('');
}
function abreCmd(pre, origen) {
  cmdIn.placeholder = esAdmin() ? 'emilio 500 · dobok diego 800 · fogueo 12 mar' : 'Busca un alumno';
  cmd.classList.add('abierto'); cmdIn.value = pre || ''; pintaCmd(); cmdIn.focus();
  // Con teclado abre sin animación; con el botón, crece desde el botón que la abrió
  if (origen && !reduce.matches) {
    const R = origen.getBoundingClientRect(), C = cmdCaja.getBoundingClientRect();
    cmdCaja.style.setProperty('--ox', (R.left + R.width / 2 - C.left) + 'px'); cmdCaja.style.setProperty('--oy', (R.top + R.height / 2 - C.top) + 'px');
    resorte({ de: .96, a: 1, r: .26, eps: .001, fn: v => { cmdCaja.style.transform = `scale(${v})`; cmdCaja.style.opacity = Math.min(1, (v - .96) / .03); }, fin: () => { cmdCaja.style.transform = ''; cmdCaja.style.opacity = ''; } });
  }
}
const cierraCmd = () => cmd.classList.remove('abierto');
function correCmd(it) {
  if (!it || it.bloq) return;
  if (it.fill) { cmdIn.value = it.fill; pintaCmd(); return; }
  cierraCmd(); it.run && it.run();
  if (!it.sinPintar) repinta();
}
cmdIn.addEventListener('input', pintaCmd);
cmdIn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); correCmd(cmdItems[cmdSel]); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const paso = e.key === 'ArrowDown' ? 1 : -1, n = cmdItems.length; if (!n) return;
    let k = cmdSel; for (let j = 0; j < n; j++) { k = (k + paso + n) % n; if (!cmdItems[k].bloq) break; }
    cmdSel = k; cmdRes.querySelectorAll('.cmd-i').forEach((b, i) => b.classList.toggle('act', i === k));
  }
});
cmdRes.addEventListener('click', (e) => { const b = e.target.closest('.cmd-i'); if (b) correCmd(cmdItems[+b.dataset.i]); });
document.getElementById('cmd-velo').addEventListener('click', cierraCmd);
ACC.cmd = (t) => abreCmd('', t);
