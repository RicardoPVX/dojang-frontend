'use strict';
/* ── Apartado de padres: una sola pantalla, en el orden en que un padre se pregunta las cosas ── */
const hijoActual = () => D.alumnos[Math.min(S.famHijo, D.alumnos.length - 1)];
const tutorActual = () => { const s = D.alumnos[0]; return s ? { n: s.tutor, tel: s.tel } : { n: SESION.nombre || SESION.username, tel: '' }; };

function pintarFamilia() {
  const ks = D.alumnos, f = tutorActual();
  document.title = 'Portal familiar — Dojang';
  if (!ks.length) {
    main.innerHTML = `<div class="fam"><div class="fam-t"><h1>Hola</h1><button class="cuenta" data-act="f-cuenta" aria-label="Mi cuenta">${esc(f.n[0])}</button></div><div class="card vacio">Esta cuenta todavía no tiene alumnos. Pregunta en el dojang.</div></div>`;
    return;
  }
  S.famHijo = Math.min(S.famHijo, ks.length - 1);
  main.innerHTML = `<div class="fam"><div class="fam-t"><h1>Hola, ${esc(f.n.split(' ')[0])}</h1><button class="cuenta" data-act="f-cuenta" aria-label="Mi cuenta">${esc(f.n[0])}</button></div>
  <div class="pasa" id="pasa"><div class="pasa-t" id="pasa-t">${ks.map(k => { const b = BELTS[k.cinta], ok = !pendientesDe(k).length; return `<div class="pase" style="background:${b.c};color:${b.t}">${b.f ? `<span class="franja" style="background:${b.f}"></span>` : ''}<h2>${esc(k.n)}</h2><small>${gradoTxt(b)}</small><div class="pie" style="${b.f ? 'padding-right:26px' : ''}"><small>${k.claseN ? `${esc(k.claseN)}<br>${esc(diasTxt(k.claseDias))}` : 'Sin clase asignada'}</small><b>${ok ? 'Al corriente' : 'Pago pendiente'}</b></div></div>`; }).join('')}</div></div>
  ${ks.length > 1 ? `<div class="puntitos">${ks.map((k, i) => `<i class="${i === S.famHijo ? 'on' : ''}"></i>`).join('')}</div>` : ''}
  <div id="fam-d">${detalleFam(ks[S.famHijo])}</div></div>
  <button class="fab glass" data-act="f-msg">${ico('msg', 18)}Escribir a la escuela</button>`;
  montaPases(ks.length);
}
function estadoFam(s) {
  const pen = pendientesDe(s);
  if (pen.length) return { cir: 'bad', ic: 'cobros', t: `${$$(pen.length * CUOTA)} pendientes`, sub: `${cap(pen.map(p => MES[p.i % 12]).join(', '))}. Se pagan en el dojang y aquí aparecen en cuanto los registran.` };
  if (HOY_I < INICIO) return { cir: 'ok', ic: 'check', t: 'Sin pagos pendientes', sub: 'Las mensualidades empiezan en noviembre de 2027.' };
  const e = estado(s, HOY_I), sig = HOY_I + 1;
  if (e.t === 'pagado') return { cir: 'ok', ic: 'check', t: `${cap(MES[HOY.getMonth()])} pagado`, sub: `Se registró el ${fCorta(e.f)}. El siguiente vence el ${s.dia} de ${MES[sig % 12]}.` };
  if (e.t === 'futuro') return { cir: 'ok', ic: 'check', t: 'Al corriente', sub: `${cap(MES[HOY.getMonth()])} vence el ${fCorta(e.due)}.` };
  return { cir: 'ok', ic: 'check', t: 'Al corriente', sub: `Sus mensualidades empiezan en ${MES[inicioDe(s) % 12]}.` };
}
function detalleFam(s) {
  const st = estadoFam(s), pl = planesDe(s), px = proxExamen(s), sig = BELTS[s.cinta + 1], pc = proxClase(s), b = BELTS[s.cinta], xs = examenesDe(s);
  const evs = D.eventos.filter(x => x.d >= HOY).sort((a, c) => a.d - c.d).slice(0, 4), meses = [];
  for (let i = inicioMeses(), n = 0; n < 6; i++, n++) meses.push(i);
  const msgs = [...D.dudas].sort((a, c) => c.f - a.f);
  const siguePrograma = xs.find(x => x.r === 'Pendiente' && x.d >= HOY);
  const pasados = xs.filter(x => x !== siguePrograma).slice(0, 4);
  return `<div class="card"><div class="estado-fam"><span class="cir" style="background:var(--${st.cir}-bg);color:var(--${st.cir})">${ico(st.ic, 19)}</span><div><b>${st.t}</b><small>${st.sub}</small></div></div>
   <div class="estado-meses"><div class="meses6">${meses.map(i => { const m = estado(s, i); return `<div><i class="${m.t === 'pagado' ? 'p' : m.t === 'debe' ? 'd' : ''}"></i>${MES3[i % 12]}</div>`; }).join('')}</div></div>
   <button class="ver-mas" data-act="f-pagos">Ver todos los pagos${ico('sig', 16)}</button></div>
  ${pl.length ? `<div class="sec" style="margin-top:22px"><div class="sec-t"><h2>A plazos</h2></div><div class="card lista">${pl.map(p => `<div class="fila quieta"><div class="fila-c"><b>${esc(p.concepto)}</b><div class="barra-p" style="margin:7px 0 3px;height:5px"><i style="transform:scaleX(${p.total ? p.abonado / p.total : 0})"></i></div><small class="num">${$$(p.abonado)} de ${$$(p.total)}</small></div>${p.abonado < p.total ? `<span class="fila-m num">Resta ${$$(p.total - p.abonado)}</span>` : '<span class="etq e-ok">Liquidado</span>'}</div>`).join('')}</div></div>` : ''}
  <div class="sec" style="margin-top:22px"><div class="sec-t"><h2>Lo que sigue</h2></div><div class="card lista">
   ${pc ? `<div class="fila quieta"><span class="cmd-ico">${ico('hoy', 17)}</span><div class="fila-c"><b>Próxima clase: ${pc.cuando}</b><small>${esc(s.claseN)} · ${s.claseIni}–${s.claseFin}</small></div></div>` : ''}
   ${evs.map(x => `<button class="fila" data-act="f-evento" data-e="${esc(x.id)}"><div class="dia-c"><small>${MES3[x.d.getMonth()]}</small><b class="num">${x.d.getDate()}</b></div><div class="fila-c"><b>${esc(x.t)}</b><small>${cap(DIA[x.d.getDay()])}${x.l ? ' · ' + esc(x.l) : ''}</small></div>${ico('sig', 16)}</button>`).join('')}
   ${!pc && !evs.length ? '<div class="vacio">Sin eventos próximos.</div>' : ''}</div></div>
  <div class="sec" style="margin-top:22px"><div class="sec-t"><h2>Su camino</h2></div><div class="card camino"><h3>${gradoTxt(b)}</h3><div class="grados" aria-hidden="true">${BELTS.map((x, i) => `<i class="${i > s.cinta ? 'nada' : i === s.cinta ? 'ya' : ''}" style="background:${x.f ? `linear-gradient(90deg,${x.c} 60%,${x.f} 60%)` : x.c}"></i>`).join('')}</div>
   <small>${!sig ? 'Grado más alto' : siguePrograma ? `Examen para ${siguePrograma.cinta !== null ? BELTS[siguePrograma.cinta].n : sig.n} el ${fCorta(siguePrograma.d)}` : px <= HOY ? `Ya puede presentar examen para ${sig.n}` : `Podrá presentar examen para ${sig.n} desde el ${fCorta(px)}`}</small>
   ${pasados.length ? `<div style="margin-top:10px">${pasados.map(x => `<div class="hist"><div>${x.cinta !== null ? BELTS[x.cinta].n : esc(x.nombre || 'Examen')}<small>${fLarga(x.d)}</small></div><span class="etq ${x.r === 'Aprobado' ? 'e-ok' : x.r === 'Reprobado' ? 'e-mal' : 'e-neu'}">${esc(x.r)}</span></div>`).join('')}</div>` : ''}</div></div>
  <div class="sec" style="margin-top:22px"><div class="sec-t"><h2>Datos de ${esc(nom1(s))}</h2><button data-act="f-editar">Editar</button></div><div class="card datos">
   ${s.edad !== null ? `<div class="dato"><span>Edad</span><b>${s.edad} años</b></div>` : ''}<div class="dato"><span>Ingreso</span><b>${fLarga(s.ingreso)}</b></div><div class="dato"><span>Día de pago</span><b>${s.dia} de cada mes</b></div><div class="dato"><span>Tipo de sangre</span><b>${esc(s.sangre || 'Sin indicar')}</b></div><div class="dato"><span>Dirección</span><b>${esc(s.dir || 'Sin indicar')}</b></div><div class="dato"><span>Emergencias</span><b>${esc([s.emer, s.telEmer].filter(Boolean).join(' · ') || 'Sin indicar')}</b></div><div class="dato"><span>Notas médicas</span><b>${esc(s.med || 'Ninguna')}</b></div></div></div>
  ${msgs.length ? `<div class="sec" style="margin-top:22px"><div class="sec-t"><h2>Tus mensajes</h2></div><div class="card">${msgs.map(d => { const a = al(d.al); return `<div class="msg-f"><p>${esc(d.t)}</p><div><span>${fCorta(d.f)}${a ? ' · sobre ' + esc(nom1(a)) : ''}</span><span class="etq ${d.leida ? 'e-ok' : 'e-neu'}">${d.leida ? 'Leído por la escuela' : 'Enviado'}</span></div></div>`; }).join('')}</div></div>` : ''}`;
}
const refrescaFam = () => { const d = document.getElementById('fam-d'); if (d && hijoActual()) d.innerHTML = detalleFam(hijoActual()); };

function montaPases(n) {
  const c = document.getElementById('pasa'), t = document.getElementById('pasa-t'); if (!c) return;
  const paso = () => t.children[0].offsetWidth + 12, cen = () => (c.clientWidth - t.children[0].offsetWidth) / 2, xDe = (i) => cen() - i * paso();
  let x = xDe(S.famHijo), h = null, ini = null, mov = false, ras;
  const pon = (v) => { x = v; t.style.transform = `translateX(${v}px)`; };
  pon(x);
  c.onpointerdown = (e) => { h && h.alto(); ini = { px: e.clientX, x }; mov = false; ras = rastro(); ras.add(e.clientX); };
  c.onpointermove = (e) => {
    if (!ini) return;
    const dx = e.clientX - ini.px;
    if (!mov) { if (Math.abs(dx) < 10) return; mov = true; c.setPointerCapture(e.pointerId); }
    ras.add(e.clientX);
    const mx = xDe(0), mn = xDe(n - 1); let v = ini.x + dx;
    if (v > mx) v = mx + elastico(v - mx, c.clientWidth);
    if (v < mn) v = mn + elastico(v - mn, c.clientWidth);
    pon(v);
  };
  const sol = () => {
    if (!ini) return;
    const era = mov; ini = null; if (!era) return;
    const v = ras.v(), d = x + proyectar(v, .99);
    let k = Math.round((cen() - d) / paso());
    k = Math.max(S.famHijo - 1, Math.min(S.famHijo + 1, k)); k = Math.max(0, Math.min(n - 1, k));
    cambiaHijo(k);
    h = resorte({ de: x, a: xDe(k), v, r: .36, d: .86, eps: .5, fn: pon });
  };
  c.onpointerup = sol; c.onpointercancel = sol;
  c.tabIndex = 0; c.setAttribute('aria-label', 'Hijos: usa las flechas para cambiar');
  c.onkeydown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const k = Math.max(0, Math.min(n - 1, S.famHijo + (e.key === 'ArrowRight' ? 1 : -1)));
      cambiaHijo(k); h && h.alto(); h = resorte({ de: x, a: xDe(k), r: .36, d: 1, eps: .5, fn: pon });
    }
  };
}
function cambiaHijo(k) {
  if (k === S.famHijo) return;
  S.famHijo = k; vibra(6);
  document.querySelectorAll('.puntitos i').forEach((p, i) => p.classList.toggle('on', i === k));
  const d = document.getElementById('fam-d'); d.innerHTML = detalleFam(hijoActual());
  if (!reduce.matches) resorte({ de: 0, a: 1, r: .24, eps: .002, fn: v => { d.style.opacity = .35 + .65 * v; d.style.transform = `translateY(${(1 - v) * 5}px)`; }, fin: () => { d.style.transform = ''; d.style.opacity = ''; } });
}

/* ── Hojas ── */
ACC['f-pagos'] = () => {
  const s = hijoActual(), filas = []; let total = 0;
  for (let i = HOY_I; i >= inicioDe(s); i--) {
    const e = estado(s, i);
    if (e.t === 'pagado') total += e.p.total;
    if (e.t === 'pagado' || e.t === 'debe') filas.push(`<div class="hist"><div>${cap(MES[i % 12])} ${Math.floor(i / 12)}<small>${e.t === 'pagado' ? 'Pagó el ' + fCorta(e.f) : 'Venció el ' + fCorta(e.due)}</small></div>${e.t === 'pagado' ? `<span class="num">${$$(e.p.total)}</span>` : '<span class="etq e-mal">Pendiente</span>'}</div>`);
  }
  const pl = planesDe(s);
  abreHoja('Pagos de ' + nom1(s), 'Mensualidades pagadas: ' + $$(total), `<div class="bloque" style="margin-top:4px"><h3>Mensualidades</h3>${filas.join('') || `<p class="nota-h">${HOY_I < INICIO ? 'Empiezan en noviembre de 2027.' : 'Todavía no hay mensualidades.'}</p>`}</div>${pl.length ? `<div class="bloque"><h3>A plazos</h3>${pl.map(p => `<div class="hist"><div>${esc(p.concepto)}<small class="num">Abonado ${$$(p.abonado)} de ${$$(p.total)}</small></div>${p.abonado >= p.total ? '<span class="etq e-ok">Liquidado</span>' : `<span class="num">Resta ${$$(p.total - p.abonado)}</span>`}</div>`).join('')}</div>` : ''}`);
};
ACC['f-evento'] = (t) => {
  const e = eventoPor(t.dataset.e); if (!e) return;
  abreHoja(e.t, cap(DIA[e.d.getDay()]) + ' ' + e.d.getDate() + ' de ' + MES[e.d.getMonth()] + ' de ' + e.d.getFullYear(), `<div class="dato"><span>Tipo</span><b>${TIPO[e.k]}</b></div>${e.l ? `<div class="dato"><span>Lugar</span><b>${esc(e.l)}</b></div>` : ''}${e.desc ? `<p class="nota-h" style="margin-top:8px">${esc(e.desc)}</p>` : ''}<button class="btn btn-2 btn-g" data-act="f-ics" data-e="${esc(e.id)}">${ico('cal', 17)}Agregar a mi calendario</button>`);
};
ACC['f-ics'] = (t) => {
  const e = eventoPor(t.dataset.e), p = (n) => String(n).padStart(2, '0'), dia = (d) => d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()), fin = new Date(e.d); fin.setDate(fin.getDate() + 1);
  const limpio = (x) => String(x).replace(/[,;\\\r\n]+/g, ' ');
  const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MMW MDK//Dojang//ES', 'BEGIN:VEVENT', 'UID:evento-' + e.id + '@dojang', 'DTSTAMP:' + dia(HOY) + 'T000000Z', 'DTSTART;VALUE=DATE:' + dia(e.d), 'DTEND;VALUE=DATE:' + dia(fin), 'SUMMARY:' + limpio(e.t), e.l ? 'LOCATION:' + limpio(e.l) : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' })); a.download = norm(e.t).replace(/[^a-z0-9]+/g, '-') + '.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
ACC['f-msg'] = () => {
  const ks = D.alumnos;
  abreHoja('Escribir a la escuela', 'La escuela lo verá en su pantalla de Hoy', `${ks.length > 1 ? campo('Sobre', `<select id="m-al">${ks.map((k, i) => opcion(k.id, k.n, ks[S.famHijo].id)).join('')}</select>`) : ''}${campo('Tu mensaje', '<textarea id="m-t" data-msg placeholder="¿En qué te ayudamos?"></textarea>')}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="f-enviar" id="m-env" disabled>Enviar</button>`, { foco: '#m-t' });
};
ins.addEventListener('input', (e) => { if (e.target.matches('[data-msg]')) document.getElementById('m-env').disabled = !e.target.value.trim(); });
ACC['f-enviar'] = (t) => {
  const txt = val('m-t'); if (!txt) return;
  const alumno = val('m-al') || (hijoActual() && hijoActual().id) || null;
  enviarForm(t, async () => {
    const r = await api('/api/dudas', { method: 'POST', body: { mensaje: txt, num_control_alumno: alumno } }), d = mapDuda(r);
    D.dudas.push(d); cerrarIns(); refrescaFam();
    aviso('Mensaje enviado a la escuela', () => { D.dudas = D.dudas.filter(x => x !== d); escribir(() => api('/api/dudas/' + d.id, { method: 'DELETE' })).catch(() => { D.dudas.push(d); repinta(); falla('La escuela ya lo leyó: no se pudo retirar'); }); });
  });
};
ACC['f-editar'] = () => {
  const s = hijoActual();
  abreHoja('Datos de ' + nom1(s), '', `${campo('Dirección', `<input id="e-dir" autocomplete="off" value="${esc(s.dir)}">`)}${campo('Tipo de sangre', `<select id="e-san">${opcion('', 'Sin indicar', s.sangre)}${SANGRES.map(x => opcion(x, x, s.sangre)).join('')}</select>`)}<div class="dos">${campo('Contacto de emergencia', `<input id="e-emer" maxlength="100" autocomplete="off" value="${esc(s.emer)}">`)}${campo('Su teléfono', `<input id="e-tel" maxlength="20" inputmode="tel" autocomplete="off" value="${esc(s.telEmer)}">`)}</div>${campo('Notas médicas', `<textarea id="e-med" placeholder="Alergias, medicamentos, algo que debamos saber">${esc(s.med)}</textarea>`)}${FORM_ERR}<button class="btn btn-1 btn-g" data-act="f-guardar">Guardar</button>`);
};
const cuerpoPersonal = (x) => ({ direccion: x.dir, tipo_sangre: x.sangre, contacto_emergencia: x.emer, tel_emergencia: x.telEmer, notas_medicas: x.med });
ACC['f-guardar'] = (t) => {
  const s = hijoActual(), antes = { dir: s.dir, sangre: s.sangre, emer: s.emer, telEmer: s.telEmer, med: s.med };
  const nuevo = { dir: val('e-dir'), sangre: val('e-san'), emer: val('e-emer'), telEmer: val('e-tel'), med: val('e-med') };
  enviarForm(t, async () => {
    await api(`/api/alumnos/${encodeURIComponent(s.id)}/personal`, { method: 'PUT', body: cuerpoPersonal(nuevo) });
    Object.assign(s, nuevo); cerrarIns(); refrescaFam();
    aviso('Datos guardados', () => { Object.assign(s, antes); escribir(() => api(`/api/alumnos/${encodeURIComponent(s.id)}/personal`, { method: 'PUT', body: cuerpoPersonal(antes) })).catch(() => { Object.assign(s, nuevo); repinta(); falla('No se pudo deshacer'); }); });
  });
};
ACC['f-cuenta'] = () => {
  const f = tutorActual(), ks = D.alumnos;
  abreHoja(f.n, ks.length > 1 ? ks.length + ' hijos con una sola cuenta' : 'Mi cuenta', `${ks.length ? `<div class="bloque" style="margin-top:4px"><h3>${ks.length > 1 ? 'Mis hijos' : 'Alumno'}</h3>${ks.map(k => `<div class="hist"><span>${esc(k.n)}</span><small>${esc(k.id)}</small></div>`).join('')}</div>` : ''}
  ${campo('Teléfono', `<input id="c-tel" maxlength="20" inputmode="tel" autocomplete="off" value="${esc(f.tel)}">`)}<button class="btn btn-2 btn-g" style="margin-top:10px" data-act="f-tel">Guardar teléfono</button>
  <div style="margin-top:20px">${campo('Nueva contraseña', '<input id="c-pass" type="password" autocomplete="new-password">')}</div><button class="btn btn-2 btn-g" style="margin-top:10px" data-act="cambiar-pass">Cambiar contraseña</button>
  <button class="btn btn-3 btn-g" style="margin-top:14px" data-act="tema">Claro / oscuro</button><button class="btn btn-peligro btn-g" style="margin-top:8px" data-act="salir">Cerrar sesión</button>${FORM_ERR}`);
};
ACC['f-tel'] = (t) => {
  const v = val('c-tel');
  enviarForm(t, async () => {
    const r = await api('/api/auth/mi-contacto', { method: 'PUT', body: { telefono: v } });
    D.alumnos.forEach(s => { s.tel = r.telefono; }); cerrarIns(); aviso('Teléfono guardado');
  });
};
