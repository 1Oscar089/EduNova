// EduNova — Panel del Estudiante (vanilla JS)
function initEstudiante() {
  let view = 'home';
  const content = document.getElementById('content');

  function render() {
    if (view === 'home') renderHome();
    else if (view === 'clases') renderClases();
    else if (view === 'tareas') renderTareas();
    else if (view === 'examenes') renderExamenes();
    else if (view === 'tienda') renderTienda();
    else if (view === 'juegos') renderJuegos();
    else if (view === 'perfil') renderPerfil();
    else if (view === 'recursos') renderRecursos();
  }

  function back() { view = 'home'; render(); }
  function renderBar() { renderUserBar(document.getElementById('userbar'), { onBack: back }); }

  const u = Auth.getCurrent();

  // ===== HOME =====
  function renderHome() {
    renderUserBar(document.getElementById('userbar'));
    const cards = [
      { id: 'clases', t: 'Clases', d: 'Tus clases por materia, con unidades y lecciones.', ic: '📚', cls: 'ic-emerald' },
      { id: 'tareas', t: 'Tareas', d: 'Tareas pendientes y entregadas con su nota.', ic: '📝', cls: 'ic-teal' },
      { id: 'examenes', t: 'Examenes', d: 'Examenes disponibles y tus resultados.', ic: '📋', cls: 'ic-amber' },
      { id: 'tienda', t: 'Tienda', d: 'Canjea tus puntos por premios.', ic: '🛒', cls: 'ic-rose' },
      { id: 'juegos', t: 'Juegos', d: 'Juega y gana mas puntos con tus vidas.', ic: '🎮', cls: 'ic-sky' },
      { id: 'perfil', t: 'Perfil', d: 'Tu informacion y progreso.', ic: '👤', cls: 'ic-violet' },
      { id: 'recursos', t: 'Recursos', d: 'Libros, enlaces y materiales.', ic: '🔗', cls: 'ic-orange' }
    ];
    content.innerHTML =
      '<h1 style="font-size:32px;font-weight:900;color:#064e3b;margin-bottom:4px">¡Hola, estudiante!</h1>' +
      '<p style="color:#10b981;margin-bottom:24px">Explora tus clases, tareas, examenes y mucho mas.</p>' +
      '<div class="cards-grid">' + cards.map(c =>
        '<button class="home-card" onclick="window._go(\'' + c.id + '\')">' +
          '<div class="top"><div class="ic ' + c.cls + '"><span style="font-size:24px">' + c.ic + '</span></div><span class="emoji">' + c.ic + '</span></div>' +
          '<h2>' + c.t + '</h2><p>' + c.d + '</p><div class="open">Abrir →</div></button>'
      ).join('') + '</div>';
  }
  window._go = function(v) { view = v; render(); };

  function header(icon, title, subtitle) {
    return '<div class="page-header"><div class="page-header-left"><button class="back-btn" onclick="window._go(\'home\')">←</button>' +
      '<div class="icon-box">' + icon + '</div><div><h1>' + title + '</h1>' + (subtitle ? '<p>' + subtitle + '</p>' : '') + '</div></div></div>';
  }

  function htmlRoute(grado, tipo, id) {
    const gnum = { Septimo: '7', Octavo: '8', Noveno: '9' }[grado];
    const carp = { clase: 'clases', tarea: 'tareas', examen: 'examenes' }[tipo];
    return gnum + '/' + carp + '/' + id + '.html';
  }

  function materiaEmoji(m) { return { Matematica: '🔢', Ciencia: '🔬', English: '📘' }[m] || '📚'; }

  // ===== CLASES =====
  async function renderClases() {
    renderBar();
    content.innerHTML = header('📚', 'Mis Clases', u.grado + ' grado') + '<div id="lst"></div>';
    const lst = document.getElementById('lst');
    lst.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">Cargando...</p>';
    const materias = ['Matematica', 'Ciencia', 'English'];
    let allEmpty = true;
    let html = '';
    for (const m of materias) {
      const res = await Clases.list(u.grado, m);
      if (!res.ok || !res.clases.length) continue;
      allEmpty = false;
      const tree = {};
      res.clases.forEach(c => { if (!tree[c.unidad]) tree[c.unidad] = {}; if (!tree[c.unidad][c.leccion]) tree[c.unidad][c.leccion] = []; tree[c.unidad][c.leccion].push(c); });
      html += '<div class="tree-unit"><div class="tree-unit-head"><span style="font-size:20px">' + materiaEmoji(m) + '</span><h3>' + m + '</h3></div><div class="tree-unit-body">';
      Object.keys(tree).sort((a, b) => Number(a) - Number(b)).forEach(un => {
        html += '<div class="tree-leccion" style="border-left-color:#d1fae5"><div style="margin-bottom:8px"><span class="badge badge-emerald">Unidad ' + un + '</span></div>';
        Object.keys(tree[un]).sort((a, b) => Number(a) - Number(b)).forEach(le => {
          html += '<div style="margin-bottom:12px"><span class="badge badge-gray" style="font-size:10px">Leccion ' + le + '</span><div class="items-grid" style="margin-top:6px">';
          tree[un][le].forEach(async c => {
            let nota = null;
            if (c.evaluada) { const nr = await Notas.get(u.grado, m, 'clase', u.nie, c.id); if (nr.ok) nota = nr.nota; }
          });
          });
        });
      });
      // The async-in-map above is tricky; do it simpler:
      html = ''; // reset and rebuild properly below
      break;
    }
    // Proper rebuild (sequential awaits)
    html = '';
    for (const m of materias) {
      const res = await Clases.list(u.grado, m);
      if (!res.ok || !res.clases.length) continue;
      allEmpty = false;
      const tree = {};
      res.clases.forEach(c => { if (!tree[c.unidad]) tree[c.unidad] = {}; if (!tree[c.unidad][c.leccion]) tree[c.unidad][c.leccion] = []; tree[c.unidad][c.leccion].push(c); });
      html += '<div class="tree-unit"><div class="tree-unit-head"><span style="font-size:20px">' + materiaEmoji(m) + '</span><h3>' + m + '</h3></div><div class="tree-unit-body">';
      for (const un of Object.keys(tree).sort((a, b) => Number(a) - Number(b))) {
        html += '<div style="border-left:3px solid #d1fae5;padding-left:12px;margin-bottom:12px"><span class="badge badge-emerald">Unidad ' + un + '</span>';
        for (const le of Object.keys(tree[un]).sort((a, b) => Number(a) - Number(b))) {
          html += '<div style="margin-top:8px"><span class="badge badge-gray" style="font-size:10px">Leccion ' + le + '</span><div class="items-grid" style="margin-top:6px">';
          for (const c of tree[un][le]) {
            let nota = null;
            if (c.evaluada) { const nr = await Notas.get(u.grado, m, 'clase', u.nie, c.id); if (nr.ok) nota = nr.nota; }
            html += '<div class="item-card"><div style="display:flex;justify-content:space-between;gap:4px"><div><div class="meta">' + c.id + '</div><h4 style="font-size:14px">' + escapeHtml(c.tema) + '</h4></div>' +
              (nota !== null ? '<span class="nota-pill ' + (nota >= 6 ? 'nota-aprob' : 'nota-reprob') + '">' + Number(nota).toFixed(1) + '</span>' : (c.evaluada ? '<span class="badge badge-gray">Sin nota</span>' : '')) + '</div>' +
              '<a class="btn btn-outline btn-sm" href="' + htmlRoute(u.grado, 'clase', c.id) + '" target="_blank">📄 Abrir</a></div>';
          }
          html += '</div></div>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }
    if (allEmpty) { lst.innerHTML = '<div class="empty"><div class="ico">📚</div><h3>Aun no hay clases</h3><p>Cuando tu docente cree clases, apareceran aqui.</p></div>'; return; }
    lst.innerHTML = html;
  }

  // ===== TAREAS =====
  async function renderTareas() {
    renderBar();
    content.innerHTML = header('📝', 'Mis Tareas', u.grado + ' grado') + '<div id="lst"></div>';
    const lst = document.getElementById('lst');
    const materias = ['Matematica', 'Ciencia', 'English'];
    let html = '';
    let any = false;
    for (const m of materias) {
      const res = await Tareas.list(u.grado, m);
      if (!res.ok || !res.tareas.length) continue;
      any = true;
      for (const t of res.tareas) {
        const nr = await Notas.get(u.grado, m, 'tarea', u.nie, t.id);
        const nota = nr.ok ? nr.nota : null;
        const ahora = Date.now();
        const inicio = new Date(t.fechaInicio).getTime();
        const fin = new Date(t.fechaFin).getTime();
        const vencida = ahora > fin;
        const disponible = ahora >= inicio;
        html += '<div class="item-card"><div style="display:flex;justify-content:space-between;gap:4px"><div><div style="display:flex;gap:4px;align-items:center">' + materiaEmoji(m) + ' <div class="meta">' + t.id + '</div></div><h4>' + escapeHtml(t.titulo) + '</h4></div>' +
          (nota !== null ? '<span class="nota-pill ' + (nota >= 6 ? 'nota-aprob' : 'nota-reprob') + '">' + Number(nota).toFixed(1) + '</span>' : vencida ? '<span class="badge badge-gray">Cerrada</span>' : disponible ? '<span class="badge badge-amber">Activa</span>' : '<span class="badge badge-gray">Proximamente</span>') + '</div>' +
          (t.indicaciones ? '<div class="desc">' + escapeHtml(t.indicaciones) + '</div>' : '') +
          '<div class="date">📅 ' + new Date(t.fechaInicio).toLocaleDateString('es') + ' → ' + new Date(t.fechaFin).toLocaleDateString('es') + '</div>' +
          (disponible ? '<a class="btn btn-outline btn-sm" href="' + htmlRoute(u.grado, 'tarea', t.id) + '" target="_blank">📄 ' + (nota !== null ? 'Ver' : 'Realizar') + '</a>' : '') +
          (nota !== null ? '<div style="font-size:12px;color:#10b981;margin-top:6px">✓ Tarea entregada</div>' : '') + '</div>';
      }
    }
    lst.innerHTML = any ? '<div class="items-grid">' + html + '</div>' : '<div class="empty"><div class="ico">📝</div><h3>No hay tareas</h3></div>';
  }

  // ===== EXAMENES =====
  async function renderExamenes() {
    renderBar();
    content.innerHTML = header('📋', 'Mis Examenes', u.grado + ' grado') + '<div id="lst"></div>';
    const lst = document.getElementById('lst');
    const materias = ['Matematica', 'Ciencia', 'English'];
    let html = '';
    let any = false;
    for (const m of materias) {
      const res = await Examenes.list(u.grado, m);
      if (!res.ok || !res.examenes.length) continue;
      any = true;
      for (const t of res.examenes) {
        const nr = await Notas.get(u.grado, m, 'examen', u.nie, t.id);
        const nota = nr.ok ? nr.nota : null;
        const ahora = Date.now();
        const inicio = new Date(t.fechaInicio).getTime();
        const fin = new Date(t.fechaFin).getTime();
        const vencida = ahora > fin;
        const disponible = ahora >= inicio;
        html += '<div class="item-card" style="border:2px solid #fef3c7"><div style="display:flex;justify-content:space-between;gap:4px"><div><div style="display:flex;gap:4px;align-items:center">' + materiaEmoji(m) + ' <div class="meta">' + t.id + '</div></div><h4>' + escapeHtml(t.titulo) + '</h4></div>' +
          (nota !== null ? '<span class="nota-pill ' + (nota >= 6 ? 'nota-aprob' : 'nota-reprob') + '">' + Number(nota).toFixed(1) + '</span>' : vencida ? '<span class="badge badge-gray">Cerrado</span>' : disponible ? '<span class="badge badge-amber">Disponible</span>' : '<span class="badge badge-gray">Proximamente</span>') + '</div>' +
          (t.indicaciones ? '<div class="desc">' + escapeHtml(t.indicaciones) + '</div>' : '') +
          '<div class="date">📅 ' + new Date(t.fechaInicio).toLocaleDateString('es') + ' → ' + new Date(t.fechaFin).toLocaleDateString('es') + '</div>' +
          (disponible ? '<a class="btn btn-amber btn-sm" href="' + htmlRoute(u.grado, 'examen', t.id) + '" target="_blank">📋 ' + (nota !== null ? 'Ver' : 'Presentar') + '</a>' : '') +
          (nota !== null ? '<div style="font-size:12px;color:#10b981;margin-top:6px">✓ Examen presentado</div>' : '') + '</div>';
      }
    }
    lst.innerHTML = any ? '<div class="items-grid">' + html + '</div>' : '<div class="empty"><div class="ico">📋</div><h3>No hay examenes</h3></div>';
  }

  // ===== TIENDA =====
  let carrito = {};
  async function renderTienda() {
    renderBar();
    content.innerHTML = header('🛒', 'Tienda', 'Canjea tus puntos por premios') +
      '<div style="background:linear-gradient(90deg,#f59e0b,#fbbf24);color:#451a03;border-radius:16px;padding:16px;margin-bottom:16px;display:flex;justify-content:space-between;font-weight:900"><span>⭐ ' + u.puntos + ' puntos</span><span>❤️ ' + u.vidas + ' vidas</span></div>' +
      '<div class="tabs"><button class="active" onclick="window._tTab(\'tienda\',this)">🛒 Tienda</button><button onclick="window._tTab(\'pedidos\',this)">📦 Mis Pedidos</button></div>' +
      '<div id="t-content"></div>';
    window._tTab('tienda', document.querySelector('.tabs button'));
  }
  window._tTab = function(tab, btn) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'tienda') renderShop();
    else renderMisPedidos();
  };
  async function renderShop() {
    const res = await Tienda.articulos();
    const div = document.getElementById('t-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.articulos.length) { div.innerHTML = '<div class="empty"><div class="ico">🛒</div><h3>Tienda vacia</h3></div>'; return; }
    let html = '<div class="shop-grid">' + res.articulos.map(a => {
      const cant = carrito[a.id] || 0;
      const sinStock = a.stock <= 0;
      return '<div class="shop-item"><div class="emoji">' + (a.emoji || '🎁') + '</div><h4>' + escapeHtml(a.nombre) + '</h4><div class="precio">⭐ ' + a.precio + '</div><div class="stock">Stock: ' + a.stock + '</div>' +
        (sinStock ? '<span class="badge badge-gray">Agotado</span>' :
          cant > 0 ? '<div class="qty"><button onclick="window._cart(\'' + a.id + '\',-1)">−</button><b>' + cant + '</b><button onclick="window._cart(\'' + a.id + '\',1)">+</button></div>' :
          '<button class="btn btn-outline btn-sm" style="width:100%;margin-top:6px" onclick="window._cart(\'' + a.id + '\',1)">+ Agregar</button>') + '</div>';
    }).join('') + '</div>';
    const totalItems = Object.values(carrito).reduce((s, c) => s + c, 0);
    const total = Object.entries(carrito).reduce((s, [id, cant]) => { const a = res.articulos.find(x => x.id === id); return s + (a ? a.precio * cant : 0); }, 0);
    if (totalItems > 0) html += '<div class="cart-bar"><div>🛒 ' + totalItems + ' articulo(s) · <b style="color:#fbbf24">⭐ ' + total + '</b></div><button class="btn" style="background:#f59e0b;color:#451a03" onclick="window._comprar()">Canjear ahora</button></div>';
    div.innerHTML = html;
    window._artsCache = res.articulos;
  }
  window._cart = function(id, delta) {
    const cant = (carrito[id] || 0) + delta;
    if (cant <= 0) delete carrito[id]; else carrito[id] = cant;
    renderShop();
  };
  window._comprar = async function() {
    const totalItems = Object.values(carrito).reduce((s, c) => s + c, 0);
    if (!totalItems) { toast('Carrito vacio', null, 'error'); return; }
    const total = Object.entries(carrito).reduce((s, [id, cant]) => { const a = window._artsCache.find(x => x.id === id); return s + (a ? a.precio * cant : 0); }, 0);
    if (total > u.puntos) { toast('Puntos insuficientes', 'Necesitas ' + total + ' ⭐, tienes ' + u.puntos + '.', 'error'); return; }
    const items = Object.entries(carrito).map(([articuloId, cantidad]) => ({ articuloId, cantidad }));
    const res = await Tienda.crearPedido({ estudianteNie: u.nie, estudianteNombre: u.nombre, items });
    if (res.ok) {
      carrito = {};
      // actualizar user local
      u.puntos -= total;
      Auth.setCurrent(u);
      updateUserBarStats();
      toast('Pedido realizado', 'Canjeaste ' + total + ' ⭐. Espera al docente.');
      renderShop();
    } else toast('Error', res.error, 'error');
  };
  async function renderMisPedidos() {
    const res = await Tienda.pedidos();
    const arts = await Tienda.articulos();
    const div = document.getElementById('t-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    const mios = res.pedidos.filter(p => p.estudianteNie === u.nie);
    if (!mios.length) { div.innerHTML = '<div class="empty"><div class="ico">📦</div><h3>No tienes pedidos</h3></div>'; return; }
    div.innerHTML = mios.map(p => {
      const total = p.items.reduce((s, it) => { const a = arts.articulos.find(x => x.id === it.articuloId); return s + (a ? a.precio * it.cantidad : 0); }, 0);
      return '<div class="item-card"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#6b7280">' + new Date(p.fecha).toLocaleString('es') + '</span>' +
        (p.entregado ? '<span class="badge badge-emerald">✓ Entregado</span>' : '<span class="badge badge-amber">⏳ En espera</span>') + '</div>' +
        p.items.map(it => { const a = arts.articulos.find(x => x.id === it.articuloId); return '<div style="display:flex;justify-content:space-between;font-size:14px;padding:4px 0"><span>' + (a ? a.emoji : '🎁') + ' ' + (a ? escapeHtml(a.nombre) : '') + ' × ' + it.cantidad + '</span><b>⭐ ' + (a ? a.precio * it.cantidad : 0) + '</b></div>'; }).join('') +
        '<div style="border-top:1px solid #f0fdf4;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:900"><span>Total</span><span style="color:#92400e">⭐ ' + total + '</span></div></div>';
    }).join('');
  }

  // ===== JUEGOS =====
  async function renderJuegos() {
    renderBar();
    content.innerHTML = header('🎮', 'Juegos', 'Juega y gana puntos') +
      '<div style="background:linear-gradient(90deg,#0284c7,#0369a1);color:#fff;border-radius:16px;padding:16px;margin-bottom:16px;display:flex;justify-content:space-between;font-weight:900"><span>❤️ ' + u.vidas + ' vidas</span><span>⭐ ' + u.puntos + ' puntos</span></div>' +
      '<div id="lst"></div>';
    const res = await Juegos.list();
    const lst = document.getElementById('lst');
    if (!res.ok) { lst.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.juegos.length) { lst.innerHTML = '<div class="empty"><div class="ico">🎮</div><h3>No hay juegos</h3></div>'; return; }
    lst.innerHTML = '<div class="items-grid">' + res.juegos.map(j => {
      const bloqueado = u.vidas < j.vidasNecesarias;
      return '<div class="item-card"><div style="background:linear-gradient(135deg,' + (bloqueado ? '#d1d5db,#9ca3af' : '#0284c7,#0369a1') + ');color:#fff;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center;position:relative"><div style="font-size:40px">' + (j.emoji || '🎯') + '</div><h4 style="color:#fff">' + escapeHtml(j.titulo) + '</h4>' + (bloqueado ? '<div style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,.3);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center">🔒</div>' : '') + '</div>' +
        '<div class="desc">' + escapeHtml(j.descripcion) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin:8px 0">' +
          '<div class="badge badge-rose">❤️ ' + j.vidasNecesarias + '</div>' +
          '<div class="badge badge-emerald">📊 ' + j.niveles + '</div>' +
          '<div class="badge badge-amber">⭐ ' + j.puntosPorNivel + '</div>' +
          (j.tiempo ? '<div class="badge badge-violet">⏱️ ' + j.tiempo + ' min</div>' : '<div class="badge badge-gray">Sin limite</div>') +
        '</div>' +
        (bloqueado ? '<button class="btn btn-block" style="background:#e5e7eb;color:#9ca3af" disabled>🔒 Bloqueado</button>' :
          (j.url ? '<a class="btn btn-sky btn-block" href="' + escapeHtml(j.url) + '" target="_blank" onclick="window._jugar(\'' + j.id + '\',' + j.vidasNecesarias + ',' + j.puntosPorNivel + ',' + j.niveles + ',event)">▶️ Jugar</a>' :
          '<button class="btn btn-sky btn-block" onclick="window._jugar(\'' + j.id + '\',' + j.vidasNecesarias + ',' + j.puntosPorNivel + ',' + j.niveles + ')">▶️ Jugar</button>')) +
      '</div>';
    }).join('') + '</div>';
  }
  window._jugar = async function(id, vidas, ptsNivel, niveles, ev) {
    if (u.vidas < vidas) { toast('Vidas insuficientes', 'Necesitas ' + vidas + ' ❤️', 'error'); return; }
    if (!confirm('Jugar? Se consumiran ' + vidas + ' ❤️ vidas.')) { if (ev) ev.preventDefault(); return; }
    // descontar vidas
    const rv = await Auth.ajustarVidas(u.nie, -vidas);
    if (rv.ok) { u.vidas = rv.vidas; Auth.setCurrent(u); updateUserBarStats(); }
    // simular puntos ganados (en produccion el juego HTML reportaria el score real)
    const nivelesCompletados = Math.floor(Math.random() * niveles) + 1;
    const ganados = nivelesCompletados * ptsNivel;
    const rp = await Auth.ajustarPuntos(u.nie, ganados);
    if (rp.ok) { u.puntos = rp.puntos; Auth.setCurrent(u); updateUserBarStats(); }
    toast('¡Buen juego!', 'Completaste ' + nivelesCompletados + '/' + niveles + ' niveles. Ganaste ' + ganados + ' ⭐.');
    if (!ev) renderJuegos();
  };

  // ===== PERFIL =====
  function renderPerfil() {
    renderBar();
    content.innerHTML = header('👤', 'Mi Perfil', 'Tu informacion') +
      '<div style="max-width:600px;margin:0 auto">' +
      '<div class="perfil-hero"><div class="av">' + iniciales(u.nombre) + '</div><h2>' + escapeHtml(u.nombre) + '</h2><p>Estudiante de ' + u.grado + ' grado</p></div>' +
      '<div class="perfil-stats"><div class="perfil-stat"><div class="ic" style="background:#fee2e2;color:#e11d48">❤️</div><div class="num" style="color:#e11d48">' + u.vidas + '</div><div class="lbl">Vidas</div></div>' +
      '<div class="perfil-stat"><div class="ic" style="background:#fef3c7;color:#d97706">⭐</div><div class="num" style="color:#d97706">' + u.puntos + '</div><div class="lbl">Puntos</div></div></div>' +
      '<div class="item-card" style="margin-top:16px">' +
      '<div class="info-row"><div class="l">🆔 NIE</div><div class="r">' + u.nie + '</div></div>' +
      '<div class="info-row"><div class="l">🎓 Grado</div><div class="r">' + u.grado + '</div></div>' +
      '<div class="info-row"><div class="l">👤 Nombre</div><div class="r">' + escapeHtml(u.nombre) + '</div></div>' +
      '</div>' +
      '<div class="alert alert-warn" style="margin-top:16px"><b>💡 Consejo:</b> Participa en clases, tareas y examenes para ganar puntos. Conserva tus vidas para desbloquear juegos.</div>' +
      '</div>';
  }

  // ===== RECURSOS =====
  async function renderRecursos() {
    renderBar();
    content.innerHTML = header('🔗', 'Recursos', u.grado + ' grado') + '<div id="lst"></div>';
    const res = await Recursos.list();
    const lst = document.getElementById('lst');
    if (!res.ok) { lst.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    const mios = res.recursos.filter(r => r.grado === 'Todos' || r.grado === u.grado);
    if (!mios.length) { lst.innerHTML = '<div class="empty"><div class="ico">🔗</div><h3>No hay recursos</h3></div>'; return; }
    lst.innerHTML = '<div class="items-grid">' + mios.map(r =>
      '<a class="item-card" href="' + escapeHtml(r.url) + '" target="_blank" style="text-decoration:none;color:inherit"><div style="display:flex;justify-content:space-between"><div style="font-size:32px">' + (/^https?:\/\//.test(r.url) ? '🌐' : '📕') + '</div><span class="badge ' + (r.grado === 'Todos' ? 'badge-orange' : 'badge-emerald') + '">' + (r.grado === 'Todos' ? 'Todos' : '7°') + '</span></div>' +
      '<h4>' + escapeHtml(r.titulo) + '</h4><div class="desc">' + escapeHtml(r.descripcion) + '</div><div class="open" style="color:#ea580c">Abrir recurso →</div></a>'
    ).join('') + '</div>';
  }

  render();
}
