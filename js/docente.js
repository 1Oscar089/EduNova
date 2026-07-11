// EduNova — Panel del Docente (vanilla JS)
function initDocente() {
  let view = 'home';
  const content = document.getElementById('content');

  function render() {
    if (view === 'home') renderHome();
    else if (view === 'clases') renderClases();
    else if (view === 'tareas') renderTareas();
    else if (view === 'examenes') renderExamenes();
    else if (view === 'tienda') renderTienda();
    else if (view === 'estudiantes') renderEstudiantes();
    else if (view === 'juegos') renderJuegos();
    else if (view === 'recursos') renderRecursos();
  }

  function renderUserBarBack() {
    renderUserBar(document.getElementById('userbar'), { onBack: () => { view = 'home'; render(); } });
  }

  // ===== HOME =====
  function renderHome() {
    renderUserBar(document.getElementById('userbar'));
    const cards = [
      { id: 'clases', t: 'Clases', d: 'Gestiona clases por grado y materia, con unidades, lecciones y temas.', ic: '📚', cls: 'ic-emerald' },
      { id: 'tareas', t: 'Tareas', d: 'Crea, edita y elimina tareas. Visualiza las notas de los estudiantes.', ic: '📝', cls: 'ic-teal' },
      { id: 'examenes', t: 'Examenes', d: 'Administra examenes y revisa el desempeño por grado y materia.', ic: '📋', cls: 'ic-amber' },
      { id: 'tienda', t: 'Tienda', d: 'Articulos de la tienda y gestion de pedidos de los estudiantes.', ic: '🛒', cls: 'ic-rose' },
      { id: 'estudiantes', t: 'Estudiantes', d: 'Listado de estudiantes y sus puntos. Promocion al siguiente grado.', ic: '👥', cls: 'ic-violet' },
      { id: 'juegos', t: 'Juegos', d: 'Gestion de juegos educativos: vidas, niveles, puntos y tiempo.', ic: '🎮', cls: 'ic-sky' },
      { id: 'recursos', t: 'Recursos', d: 'Enlaces a libros, paginas y materiales de apoyo.', ic: '🔗', cls: 'ic-orange' }
    ];
    content.innerHTML =
      '<h1 style="font-size:32px;font-weight:900;color:#064e3b;margin-bottom:4px">Panel del Docente</h1>' +
      '<p style="color:#10b981;margin-bottom:24px">Selecciona un modulo para comenzar a gestionar tu plataforma.</p>' +
      '<div class="cards-grid">' + cards.map(c =>
        '<button class="home-card" onclick="window._go(\'' + c.id + '\')">' +
          '<div class="top"><div class="ic ' + c.cls + '">' + icSvg(c.t) + '</div><span class="emoji">' + c.ic + '</span></div>' +
          '<h2>' + c.t + '</h2><p>' + c.d + '</p>' +
          '<div class="open">Abrir modulo →</div></button>'
      ).join('') + '</div>';
  }

  function icSvg(t) {
    // simple emoji-as-icon to avoid SVG bloat
    const map = { Clases: '📖', Tareas: '✏️', Examenes: '📊', Tienda: '🛍️', Estudiantes: '👨‍🏫', Juegos: '🕹️', Recursos: '📎' };
    return '<span style="font-size:24px">' + (map[t] || '📁') + '</span>';
  }

  window._go = function(v) { view = v; render(); };

  // ===== Panel header helper =====
  function header(icon, title, subtitle, actionHtml) {
    return '<div class="page-header">' +
      '<div class="page-header-left">' +
        '<button class="back-btn" onclick="window._go(\'home\')">←</button>' +
        '<div class="icon-box">' + icon + '</div>' +
        '<div><h1>' + title + '</h1>' + (subtitle ? '<p>' + subtitle + '</p>' : '') + '</div>' +
      '</div>' +
      (actionHtml ? '<div>' + actionHtml + '</div>' : '') +
    '</div>';
  }

  function toolbarGradoMateria(grado, materia, onChange) {
    return '<div class="toolbar">' +
      '<div class="field"><label>Grado</label><select id="f-grado" onchange="' + onChange + '">' +
        ['Septimo', 'Octavo', 'Noveno'].map(g => '<option value="' + g + '"' + (g === grado ? ' selected' : '') + '>' + (g === 'Septimo' ? '7°' : g === 'Octavo' ? '8°' : '9°') + ' - ' + g + '</option>').join('') +
      '</select></div>' +
      '<div class="field"><label>Materia</label><select id="f-materia" onchange="' + onChange + '">' +
        [['Matematica', '🔢 Matematica y Datos'], ['Ciencia', '🔬 Ciencia y Tecnologia'], ['English', '📘 English']].map(m => '<option value="' + m[0] + '"' + (m[0] === materia ? ' selected' : '') + '>' + m[1] + '</option>').join('') +
      '</select></div>' +
    '</div>';
  }

  function getGM() {
    return { grado: document.getElementById('f-grado').value, materia: document.getElementById('f-materia').value };
  }

  // ===== CLASES =====
  let cGrado = 'Septimo', cMateria = 'Matematica';
  function renderClases() {
    renderUserBarBack();
    content.innerHTML = header('📖', 'Clases', 'Gestion de clases por grado y materia',
      '<button class="btn btn-primary" onclick="window._claseNew()">+ Nueva Clase</button>') +
      toolbarGradoMateria(cGrado, cMateria, 'window._claseReload()') +
      '<div class="tabs"><button class="active" onclick="window._claseTab(\'lista\',this)">📚 Clases</button>' +
      '<button onclick="window._claseTab(\'notas\',this)">📊 Notas</button></div>' +
      '<div id="clase-content"></div>';
    window._claseReload();
  }
  window._claseReload = async function() {
    const g = getGM(); cGrado = g.grado; cMateria = g.materia;
    const res = await Clases.list(cGrado, cMateria);
    const div = document.getElementById('clase-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    // build tree
    const tree = {};
    res.clases.forEach(c => {
      if (!tree[c.unidad]) tree[c.unidad] = {};
      if (!tree[c.unidad][c.leccion]) tree[c.unidad][c.leccion] = [];
      tree[c.unidad][c.leccion].push(c);
    });
    if (!Object.keys(tree).length) {
      div.innerHTML = '<div class="empty"><div class="ico">📚</div><h3>No hay clases</h3><p>Crea tu primera clase para este grado y materia.</p></div>';
      return;
    }
    let html = '';
    Object.keys(tree).sort((a, b) => Number(a) - Number(b)).forEach(u => {
      html += '<div class="tree-unit"><div class="tree-unit-head"><span class="num">' + u + '</span><h3>Unidad ' + u + '</h3></div><div class="tree-unit-body">';
      Object.keys(tree[u]).sort((a, b) => Number(a) - Number(b)).forEach(l => {
        html += '<div class="tree-leccion"><span class="lbl">Leccion ' + l + '</span><div class="items-grid">';
        tree[u][l].forEach(c => {
          html += '<div class="item-card">' +
            '<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px"><div><div class="meta">' + c.id + '</div><h4>' + escapeHtml(c.tema) + '</h4></div>' +
              (c.evaluada ? '<span class="badge badge-amber">✓ Evaluada</span>' : '<span class="badge badge-emerald">○ Sin eval.</span>') + '</div>' +
            (c.evaluada && (c.fechaInicio || c.fechaFin) ? '<div class="date">📅 ' + (c.fechaInicio ? new Date(c.fechaInicio).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : '—') + ' → ' + (c.fechaFin ? new Date(c.fechaFin).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : '—') + '</div>' : '') +
            '<div class="actions">' +
              '<button class="btn btn-outline btn-sm" onclick="window._claseEdit(\'' + c.id + '\')">✏️ Editar</button>' +
              '<a class="btn btn-outline btn-sm" href="' + htmlRoute(c.grado, 'clase', c.id) + '" target="_blank">📄 Ver HTML</a>' +
              '<button class="btn btn-danger-ghost btn-sm" onclick="window._claseDel(\'' + c.id + '\')">🗑️</button>' +
            '</div></div>';
        });
        html += '</div></div>';
      });
      html += '</div></div>';
    });
    div.innerHTML = html;
    window._clasesCache = res.clases;
  };
  window._claseTab = function(tab, btn) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'lista') window._claseReload();
    else renderTablaNotas('clase', cGrado, cMateria, document.getElementById('clase-content'));
  };
  window._claseNew = function() { claseDialog(null); };
  window._claseEdit = function(id) {
    const c = window._clasesCache.find(x => x.id === id);
    claseDialog(c);
  };
  window._claseDel = async function(id) {
    if (!confirm('Eliminar esta clase?')) return;
    const res = await Clases.eliminar(id);
    if (res.ok) { toast('Clase eliminada'); window._claseReload(); }
    else toast('Error', res.error, 'error');
  };

  function claseDialog(c) {
    const edit = !!c;
    const unidades = edit ? [] : (window._clasesCache || []).map(x => x.unidad);
    const body =
      '<div class="row">' +
        '<div class="field"><label>Unidad</label><input id="d-unidad" type="number" min="1" value="' + (c ? c.unidad : (unidades[0] || 1)) + '"></div>' +
        '<div class="field"><label>Leccion</label><input id="d-leccion" type="number" min="1" value="' + (c ? c.leccion : 1) + '"></div>' +
      '</div>' +
      '<div class="field"><label>Tema de la clase</label><input id="d-tema" type="text" value="' + (c ? escapeHtml(c.tema) : '') + '" placeholder="Ej. Ecuaciones de primer grado"></div>' +
      '<label class="check-row"><input id="d-eval" type="checkbox" ' + (c && c.evaluada ? 'checked' : '') + ' onchange="document.getElementById(\'d-fechas\').classList.toggle(\'hidden\',!this.checked)"><div><div class="t">Esta clase tendra actividades evaluadas</div><div class="s">Se creara una columna en la tabla de notas</div></div></label>' +
      '<div id="d-fechas" class="' + (c && c.evaluada ? '' : 'hidden') + ' row">' +
        '<div class="field"><label>Fecha y hora de inicio</label><input id="d-fi" type="datetime-local" value="' + (c && c.fechaInicio ? c.fechaInicio.slice(0, 16) : '') + '"></div>' +
        '<div class="field"><label>Fecha y hora de fin</label><input id="d-ff" type="datetime-local" value="' + (c && c.fechaFin ? c.fechaFin.slice(0, 16) : '') + '"></div>' +
      '</div>' +
      '<div class="alert alert-info" style="font-size:12px"><b>Ruta del HTML:</b><br><code style="font-family:monospace">' + htmlRoute(cGrado, 'clase', edit ? c.id : '(auto)') + '</code></div>';
    const { overlay, close } = openModal(body, { title: edit ? 'Editar Clase' : 'Nueva Clase', foot: '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-primary" onclick="window._claseSave(' + (edit ? '\'' + c.id + '\'' : 'null') + ')">Guardar</button>' });
    window._claseClose = close;
  }
  window._claseSave = async function(id) {
    const data = {
      id: id, grado: cGrado, materia: cMateria,
      unidad: document.getElementById('d-unidad').value || '1',
      leccion: document.getElementById('d-leccion').value || '1',
      tema: document.getElementById('d-tema').value.trim(),
      evaluada: document.getElementById('d-eval').checked,
      fechaInicio: document.getElementById('d-eval').checked ? document.getElementById('d-fi').value : '',
      fechaFin: document.getElementById('d-eval').checked ? document.getElementById('d-ff').value : ''
    };
    if (!data.tema) { toast('Falta el tema', null, 'error'); return; }
    const res = id ? await Clases.editar(data) : await Clases.crear(data);
    if (res.ok) { toast(id ? 'Clase actualizada' : 'Clase creada', res.clase ? 'ID: ' + res.clase.id : ''); window._claseClose(); window._claseReload(); }
    else toast('Error', res.error, 'error');
  };

  // ===== TAREAS =====
  let tGrado = 'Septimo', tMateria = 'Matematica';
  function renderTareas() {
    renderUserBarBack();
    content.innerHTML = header('📝', 'Tareas', 'Gestion de tareas',
      '<button class="btn btn-teal" onclick="window._tareaNew()">+ Nueva Tarea</button>') +
      toolbarGradoMateria(tGrado, tMateria, 'window._tareaReload()') +
      '<div class="tabs"><button class="active" onclick="window._tareaTab(\'lista\',this)">📝 Tareas</button>' +
      '<button onclick="window._tareaTab(\'notas\',this)">📊 Notas</button></div>' +
      '<div id="tarea-content"></div>';
    window._tareaReload();
  }
  window._tareaReload = async function() {
    const g = getGM(); tGrado = g.grado; tMateria = g.materia;
    const res = await Tareas.list(tGrado, tMateria);
    const div = document.getElementById('tarea-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.tareas.length) { div.innerHTML = '<div class="empty"><div class="ico">📝</div><h3>No hay tareas</h3><p>Crea una tarea para este grado y materia.</p></div>'; return; }
    div.innerHTML = '<div class="items-grid">' + res.tareas.map(t =>
      '<div class="item-card"><div class="meta">' + t.id + '</div><h4>' + escapeHtml(t.titulo) + '</h4>' +
      (t.indicaciones ? '<div class="desc">' + escapeHtml(t.indicaciones) + '</div>' : '') +
      '<div class="date">📅 ' + new Date(t.fechaInicio).toLocaleDateString('es') + ' → ' + new Date(t.fechaFin).toLocaleDateString('es') + '</div>' +
      '<div class="actions"><button class="btn btn-outline btn-sm" onclick="window._tareaEdit(\'' + t.id + '\')">✏️ Editar</button>' +
      '<a class="btn btn-outline btn-sm" href="' + htmlRoute(tGrado, 'tarea', t.id) + '" target="_blank">📄 HTML</a>' +
      '<button class="btn btn-danger-ghost btn-sm" onclick="window._tareaDel(\'' + t.id + '\')">🗑️</button></div></div>'
    ).join('') + '</div>';
    window._tareasCache = res.tareas;
  };
  window._tareaTab = function(tab, btn) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'lista') window._tareaReload();
    else renderTablaNotas('tarea', tGrado, tMateria, document.getElementById('tarea-content'));
  };
  window._tareaNew = function() { tareaDialog(null); };
  window._tareaEdit = function(id) { tareaDialog(window._tareasCache.find(x => x.id === id)); };
  window._tareaDel = async function(id) { if (confirm('Eliminar?')) { const r = await Tareas.eliminar(id); if (r.ok) { toast('Eliminada'); window._tareaReload(); } } };
  function tareaDialog(t) {
    const edit = !!t;
    const body =
      '<div class="field"><label>Titulo</label><input id="d-titulo" type="text" value="' + (t ? escapeHtml(t.titulo) : '') + '" placeholder="Ej. Ejercicios de fracciones"></div>' +
      '<div class="field"><label>Indicaciones</label><textarea id="d-ind" rows="4">' + (t ? escapeHtml(t.indicaciones) : '') + '</textarea></div>' +
      '<div class="row"><div class="field"><label>Disponible desde</label><input id="d-fi" type="date" value="' + (t ? t.fechaInicio.slice(0, 10) : '') + '"></div>' +
      '<div class="field"><label>Cierra el</label><input id="d-ff" type="date" value="' + (t ? t.fechaFin.slice(0, 10) : '') + '"></div></div>' +
      '<div class="alert alert-info" style="font-size:12px"><b>Ruta:</b> <code>' + htmlRoute(tGrado, 'tarea', edit ? t.id : '(auto)') + '</code></div>';
    const { close } = openModal(body, { title: edit ? 'Editar Tarea' : 'Nueva Tarea', foot: '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-teal" onclick="window._tareaSave(' + (edit ? '\'' + t.id + '\'' : 'null') + ')">Guardar</button>' });
    window._tareaClose = close;
  }
  window._tareaSave = async function(id) {
    const data = { id, grado: tGrado, materia: tMateria, titulo: document.getElementById('d-titulo').value.trim(), indicaciones: document.getElementById('d-ind').value.trim(), fechaInicio: document.getElementById('d-fi').value, fechaFin: document.getElementById('d-ff').value };
    if (!data.titulo) { toast('Falta el titulo', null, 'error'); return; }
    if (!data.fechaInicio || !data.fechaFin) { toast('Falta el rango de fechas', null, 'error'); return; }
    const res = id ? await Tareas.editar(data) : await Tareas.crear(data);
    if (res.ok) { toast(id ? 'Actualizada' : 'Creada'); window._tareaClose(); window._tareaReload(); }
    else toast('Error', res.error, 'error');
  };

  // ===== EXAMENES =====
  let eGrado = 'Septimo', eMateria = 'Matematica';
  function renderExamenes() {
    renderUserBarBack();
    content.innerHTML = header('📋', 'Examenes', 'Gestion de examenes',
      '<button class="btn btn-amber" onclick="window._exaNew()">+ Nuevo Examen</button>') +
      toolbarGradoMateria(eGrado, eMateria, 'window._exaReload()') +
      '<div class="tabs"><button class="active" onclick="window._exaTab(\'lista\',this)">📋 Examenes</button>' +
      '<button onclick="window._exaTab(\'notas\',this)">📊 Notas</button></div>' +
      '<div id="exa-content"></div>';
    window._exaReload();
  }
  window._exaReload = async function() {
    const g = getGM(); eGrado = g.grado; eMateria = g.materia;
    const res = await Examenes.list(eGrado, eMateria);
    const div = document.getElementById('exa-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.examenes.length) { div.innerHTML = '<div class="empty"><div class="ico">📋</div><h3>No hay examenes</h3></div>'; return; }
    div.innerHTML = '<div class="items-grid">' + res.examenes.map(t =>
      '<div class="item-card"><div class="meta">' + t.id + '</div><h4>' + escapeHtml(t.titulo) + '</h4>' +
      (t.indicaciones ? '<div class="desc">' + escapeHtml(t.indicaciones) + '</div>' : '') +
      '<div class="date">📅 ' + new Date(t.fechaInicio).toLocaleDateString('es') + ' → ' + new Date(t.fechaFin).toLocaleDateString('es') + '</div>' +
      '<div class="actions"><button class="btn btn-outline btn-sm" onclick="window._exaEdit(\'' + t.id + '\')">✏️ Editar</button>' +
      '<a class="btn btn-outline btn-sm" href="' + htmlRoute(eGrado, 'examen', t.id) + '" target="_blank">📄 HTML</a>' +
      '<button class="btn btn-danger-ghost btn-sm" onclick="window._exaDel(\'' + t.id + '\')">🗑️</button></div></div>'
    ).join('') + '</div>';
    window._exaCache = res.examenes;
  };
  window._exaTab = function(tab, btn) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'lista') window._exaReload();
    else renderTablaNotas('examen', eGrado, eMateria, document.getElementById('exa-content'));
  };
  window._exaNew = function() { exaDialog(null); };
  window._exaEdit = function(id) { exaDialog(window._exaCache.find(x => x.id === id)); };
  window._exaDel = async function(id) { if (confirm('Eliminar?')) { const r = await Examenes.eliminar(id); if (r.ok) { toast('Eliminado'); window._exaReload(); } } };
  function exaDialog(t) {
    const edit = !!t;
    const body =
      '<div class="field"><label>Titulo</label><input id="d-titulo" type="text" value="' + (t ? escapeHtml(t.titulo) : '') + '"></div>' +
      '<div class="field"><label>Indicaciones</label><textarea id="d-ind" rows="4">' + (t ? escapeHtml(t.indicaciones) : '') + '</textarea></div>' +
      '<div class="row"><div class="field"><label>Disponible desde</label><input id="d-fi" type="date" value="' + (t ? t.fechaInicio.slice(0, 10) : '') + '"></div>' +
      '<div class="field"><label>Cierra el</label><input id="d-ff" type="date" value="' + (t ? t.fechaFin.slice(0, 10) : '') + '"></div></div>' +
      '<div class="alert alert-info" style="font-size:12px"><b>Ruta:</b> <code>' + htmlRoute(eGrado, 'examen', edit ? t.id : '(auto)') + '</code></div>';
    const { close } = openModal(body, { title: edit ? 'Editar Examen' : 'Nuevo Examen', foot: '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-amber" onclick="window._exaSave(' + (edit ? '\'' + t.id + '\'' : 'null') + ')">Guardar</button>' });
    window._exaClose = close;
  }
  window._exaSave = async function(id) {
    const data = { id, grado: eGrado, materia: eMateria, titulo: document.getElementById('d-titulo').value.trim(), indicaciones: document.getElementById('d-ind').value.trim(), fechaInicio: document.getElementById('d-fi').value, fechaFin: document.getElementById('d-ff').value };
    if (!data.titulo) { toast('Falta el titulo', null, 'error'); return; }
    if (!data.fechaInicio || !data.fechaFin) { toast('Falta el rango', null, 'error'); return; }
    const res = id ? await Examenes.editar(data) : await Examenes.crear(data);
    if (res.ok) { toast(id ? 'Actualizado' : 'Creado'); window._exaClose(); window._exaReload(); }
    else toast('Error', res.error, 'error');
  };

  // ===== TABLA DE NOTAS (compartida) =====
  async function renderTablaNotas(tipo, grado, materia, container) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">Cargando notas...</p>';
    const res = await Notas.getTabla(grado, materia, tipo);
    if (!res.ok) { container.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.columnas.length) { container.innerHTML = '<div class="empty"><div class="ico">📊</div><h3>No hay actividades evaluadas</h3></div>'; return; }
    if (!res.filas.length) { container.innerHTML = '<div class="empty"><div class="ico">👥</div><h3>No hay estudiantes</h3></div>'; return; }
    let html = '<div class="tabla-wrap"><div class="tabla-scroll"><table><thead><tr><th>Estudiante</th>';
    res.columnas.forEach(c => { html += '<th class="center">' + c + '</th>'; });
    html += '<th class="center prom">Prom.</th></tr></thead><tbody>';
    res.filas.forEach((f, i) => {
      html += '<tr style="' + (i % 2 ? 'background:#f0fdf470' : '') + '"><td><div style="font-size:10px;color:#9ca3af;font-family:monospace">' + f.nie + '</div>' + escapeHtml(f.nombre) + '</td>';
      res.columnas.forEach(c => {
        const v = f.notas[c];
        html += '<td class="center"><input type="number" min="0" max="10" step="0.1" value="' + (v !== null && v !== undefined ? v : '') + '" onchange="window._notaSave(\'' + grado + '\',\'' + materia + '\',\'' + tipo + '\',\'' + f.nie + '\',\'' + c + '\',this.value)"></td>';
      });
      const prom = f.promedio;
      html += '<td class="center"><span class="nota-pill ' + (prom === null || prom === '' ? 'badge-gray' : prom >= 6 ? 'nota-aprob' : 'nota-reprob') + '">' + (prom !== null && prom !== '' ? Number(prom).toFixed(1) : '—') + '</span></td></tr>';
    });
    html += '</tbody></table></div><div class="tabla-foot"><span>' + res.filas.length + ' estudiantes · ' + res.columnas.length + ' actividades</span></div></div>';
    container.innerHTML = html;
  }
  window._notaSave = async function(grado, materia, tipo, nie, activityId, value) {
    const nota = value === '' ? null : Math.max(0, Math.min(10, parseFloat(value)));
    if (value !== '' && isNaN(nota)) return;
    const res = await Notas.set(grado, materia, tipo, nie, activityId, nota);
    if (res.ok) { toast('Nota guardada'); renderTablaNotas(tipo, grado, materia, document.getElementById(tipo === 'clase' ? 'clase-content' : tipo === 'tarea' ? 'tarea-content' : 'exa-content')); }
    else toast('Error', res.error, 'error');
  };

  function htmlRoute(grado, tipo, id) {
    const gnum = { Septimo: '7', Octavo: '8', Noveno: '9' }[grado];
    const carp = { clase: 'clases', tarea: 'tareas', examen: 'examenes' }[tipo];
    return gnum + '/' + carp + '/' + id + '.html';
  }

  // ===== TIENDA =====
  function renderTienda() {
    renderUserBarBack();
    content.innerHTML = header('🛒', 'Tienda', 'Articulos y pedidos',
      '<button class="btn btn-rose" onclick="window._artNew()">+ Nuevo Articulo</button>') +
      '<div class="tabs"><button class="active" onclick="window._tiendaTab(\'art\',this)">🎁 Articulos</button>' +
      '<button id="tab-pedidos" onclick="window._tiendaTab(\'ped\',this)">📦 Pedidos</button></div>' +
      '<div id="tienda-content"></div>';
    window._tiendaTab('art', document.querySelector('.tabs button'));
  }
  window._tiendaTab = function(tab, btn) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'art') renderArticulos();
    else renderPedidos();
  };
  async function renderArticulos() {
    const res = await Tienda.articulos();
    const div = document.getElementById('tienda-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.articulos.length) { div.innerHTML = '<div class="empty"><div class="ico">🛒</div><h3>Tienda vacia</h3></div>'; return; }
    div.innerHTML = '<div class="items-grid">' + res.articulos.map(a =>
      '<div class="item-card" style="text-align:center"><div style="font-size:48px">' + (a.emoji || '🎁') + '</div>' +
      '<h4>' + escapeHtml(a.nombre) + '</h4><div class="desc">' + escapeHtml(a.descripcion) + '</div>' +
      '<div style="margin:8px 0"><span class="badge badge-amber">⭐ ' + a.precio + '</span> <span class="badge badge-gray">Stock: ' + a.stock + '</span></div>' +
      '<div class="actions" style="justify-content:center"><button class="btn btn-outline btn-sm" onclick="window._artEdit(\'' + a.id + '\')">✏️ Editar</button>' +
      '<button class="btn btn-danger-ghost btn-sm" onclick="window._artDel(\'' + a.id + '\')">🗑️</button></div></div>'
    ).join('') + '</div>';
    window._artsCache = res.articulos;
  }
  window._artNew = function() { artDialog(null); };
  window._artEdit = function(id) { artDialog(window._artsCache.find(x => x.id === id)); };
  window._artDel = async function(id) { if (confirm('Eliminar?')) { const r = await Tienda.eliminarArt(id); if (r.ok) { toast('Eliminado'); renderArticulos(); } } };
  function artDialog(a) {
    const edit = !!a;
    const emojis = ['🎁','🍪','🍬','⚽','🎨','📚','✏️','🧸','🎮','🥤','🍫','🎈'];
    const body =
      '<div class="field"><label>Emoji</label><div id="emoji-pick" style="display:flex;flex-wrap:wrap;gap:6px">' + emojis.map(e => '<button type="button" onclick="window._emojiPick(this,\'' + e + '\')" style="width:36px;height:36px;border:2px solid #f3f4f6;background:#ecfdf5;border-radius:8px;cursor:pointer;font-size:18px" data-e="' + e + '">' + e + '</button>').join('') + '</div></div>' +
      '<div class="field"><label>Nombre</label><input id="d-nombre" type="text" value="' + (a ? escapeHtml(a.nombre) : '') + '"></div>' +
      '<div class="field"><label>Descripcion</label><textarea id="d-desc" rows="2">' + (a ? escapeHtml(a.descripcion) : '') + '</textarea></div>' +
      '<div class="row"><div class="field"><label>Precio (⭐)</label><input id="d-precio" type="number" min="0" value="' + (a ? a.precio : 0) + '"></div>' +
      '<div class="field"><label>Stock</label><input id="d-stock" type="number" min="0" value="' + (a ? a.stock : 0) + '"></div></div>' +
      '<input type="hidden" id="d-emoji" value="' + (a ? a.emoji : '🎁') + '">';
    const { close } = openModal(body, { title: edit ? 'Editar Articulo' : 'Nuevo Articulo', foot: '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-rose" onclick="window._artSave(' + (edit ? '\'' + a.id + '\'' : 'null') + ')">Guardar</button>' });
    window._artClose = close;
    // pre-select emoji
    const cur = document.getElementById('d-emoji').value;
    document.querySelectorAll('#emoji-pick button').forEach(b => { if (b.dataset.e === cur) b.style.borderColor = '#e11d48'; });
  }
  window._emojiPick = function(btn, e) {
    document.getElementById('d-emoji').value = e;
    document.querySelectorAll('#emoji-pick button').forEach(b => b.style.borderColor = '#f3f4f6');
    btn.style.borderColor = '#e11d48';
  };
  window._artSave = async function(id) {
    const data = { id, nombre: document.getElementById('d-nombre').value.trim(), descripcion: document.getElementById('d-desc').value.trim(), precio: Number(document.getElementById('d-precio').value), stock: Number(document.getElementById('d-stock').value), emoji: document.getElementById('d-emoji').value };
    if (!data.nombre) { toast('Falta el nombre', null, 'error'); return; }
    const res = id ? await Tienda.editarArt(data) : await Tienda.crearArt(data);
    if (res.ok) { toast(id ? 'Actualizado' : 'Creado'); window._artClose(); renderArticulos(); }
    else toast('Error', res.error, 'error');
  };

  async function renderPedidos() {
    const res = await Tienda.pedidos();
    const arts = await Tienda.articulos();
    const div = document.getElementById('tienda-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    const pendientes = res.pedidos.filter(p => !p.entregado).length;
    document.getElementById('tab-pedidos').innerHTML = '📦 Pedidos' + (pendientes ? ' <span class="badge">' + pendientes + '</span>' : '');
    if (!res.pedidos.length) { div.innerHTML = '<div class="empty"><div class="ico">📦</div><h3>No hay pedidos</h3></div>'; return; }
    div.innerHTML = res.pedidos.map(p => {
      const total = p.items.reduce((s, it) => { const a = arts.articulos.find(x => x.id === it.articuloId); return s + (a ? a.precio * it.cantidad : 0); }, 0);
      return '<div class="item-card" style="cursor:pointer" onclick="window._pedToggle(\'' + p.id + '\')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
          '<div><b>' + escapeHtml(p.estudianteNombre) + '</b><div style="font-size:12px;color:#6b7280">' + new Date(p.fecha).toLocaleString('es') + ' · ' + p.items.length + ' articulo(s) · ' + total + ' ⭐</div></div>' +
          (p.entregado ? '<span class="badge badge-emerald">✓ Entregado</span>' : '<span class="badge badge-amber">⏳ Pendiente</span>') +
        '</div>' +
        '<div id="ped-' + p.id + '" class="hidden" style="margin-top:12px">' +
          p.items.map(it => { const a = arts.articulos.find(x => x.id === it.articuloId); return '<div style="display:flex;justify-content:space-between;padding:8px;background:#f0fdf4;border-radius:8px;margin-bottom:4px"><div>' + (a ? a.emoji : '🎁') + ' ' + (a ? escapeHtml(a.nombre) : 'Articulo') + ' × ' + it.cantidad + '</div><b>⭐ ' + (a ? a.precio * it.cantidad : 0) + '</b></div>'; }).join('') +
          '<div style="margin-top:8px"><button class="btn ' + (p.entregado ? 'btn-outline' : 'btn-primary') + ' btn-sm" onclick="event.stopPropagation();window._pedEntregar(\'' + p.id + '\',' + !p.entregado + ')">' + (p.entregado ? '↩ Marcar pendiente' : '✓ Marcar entregado') + '</button></div>' +
        '</div></div>';
    }).join('');
    window._pedidosCache = res.pedidos;
  }
  window._pedToggle = function(id) {
    const el = document.getElementById('ped-' + id);
    if (el) el.classList.toggle('hidden');
  };
  window._pedEntregar = async function(id, val) {
    const res = await Tienda.actualizarPedido(id, { entregado: val });
    if (res.ok) { toast(val ? 'Pedido entregado' : 'Marcado pendiente'); renderPedidos(); }
    else toast('Error', res.error, 'error');
  };

  // ===== ESTUDIANTES =====
  function renderEstudiantes() {
    renderUserBarBack();
    content.innerHTML = header('👥', 'Estudiantes', 'Listado, puntos y promocion',
      '<button class="btn btn-violet" onclick="window._promover()">⬆️ Promover seleccionados</button>') +
      '<div class="tabs"><button class="active" onclick="window._estTab(\'activos\',this)">👥 Activos</button>' +
      '<button onclick="window._estTab(\'arch\',this)">📦 Archivados</button></div>' +
      '<div id="est-content"></div>';
    window._estTab('activos', document.querySelector('.tabs button'));
  }
  let estGradoSel = 'Septimo';
  let estSelected = new Set();
  window._estTab = function(tab, btn) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEstList(tab);
  };
  async function renderEstList(tab) {
    const res = await Estudiantes.list();
    const div = document.getElementById('est-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (tab === 'activos') {
      const grados = ['Septimo', 'Octavo', 'Noveno'];
      let activos = res.estudiantes.filter(e => !e.archived);
      div.innerHTML =
        '<div class="filtros-chips">' + grados.map(g => '<button class="' + (g === estGradoSel ? 'active' : '') + '" onclick="estGradoSel=\'' + g + '\';renderEstList(\'activos\')">' + (g === 'Septimo' ? '7°' : g === 'Octavo' ? '8°' : '9°') + '</button>').join('') + '</div>' +
        '<div class="alert alert-warn" style="font-size:13px"><b>ℹ️ Promocion:</b> Los estudiantes seleccionados suben al siguiente grado. Los no seleccionados se archivan.</div>';
      const lista = activos.filter(e => e.grado === estGradoSel);
      if (!lista.length) { div.innerHTML += '<div class="empty"><div class="ico">👥</div><h3>No hay estudiantes en ' + estGradoSel + '</h3></div>'; return; }
      let html = '<div class="tabla-wrap"><div class="tabla-scroll"><table><thead><tr><th><input type="checkbox" id="est-all" onchange="window._estAll(this)"></th><th>Estudiante</th><th>NIE</th><th>Vidas</th><th>Puntos</th><th>Estado</th></tr></thead><tbody>';
      lista.forEach((e, i) => {
        const sel = estSelected.has(e.nie);
        html += '<tr style="' + (i % 2 ? 'background:#f0fdf470' : '') + ';' + (sel ? 'box-shadow:inset 0 0 0 2px #7c3aed' : '') + '">' +
          '<td><input type="checkbox" ' + (sel ? 'checked' : '') + ' onchange="window._estToggle(\'' + e.nie + '\',this.checked)"></td>' +
          '<td><b>' + escapeHtml(e.nombre) + '</b></td><td style="font-family:monospace;font-size:12px;color:#9ca3af">' + e.nie + '</td>' +
          '<td class="center"><span class="badge badge-rose">❤️ ' + e.vidas + '</span></td>' +
          '<td class="center"><span class="badge badge-amber">⭐ ' + e.puntos + '</span></td>' +
          '<td class="center">' + (sel ? '<span class="badge badge-violet">⬆️ ' + (estGradoSel === 'Noveno' ? 'Graduar' : 'Promover') + '</span>' : '<span class="badge badge-gray">📦 Archivar</span>') + '</td></tr>';
      });
      html += '</tbody></table></div></div>';
      div.innerHTML += html;
      window._estCache = lista;
    } else {
      const arch = res.estudiantes.filter(e => e.archived);
      if (!arch.length) { div.innerHTML = '<div class="empty"><div class="ico">📦</div><h3>No hay archivados</h3></div>'; return; }
      let html = '<div class="tabla-wrap"><table><thead><tr><th>Estudiante</th><th>NIE</th><th>Ultimo grado</th><th>Puntos</th></tr></thead><tbody>';
      arch.forEach(e => { html += '<tr><td>' + escapeHtml(e.nombre) + '</td><td style="font-family:monospace;font-size:12px">' + e.nie + '</td><td>' + (e.grado || '—') + '</td><td>' + e.puntos + '</td></tr>'; });
      html += '</tbody></table></div>';
      div.innerHTML = html;
    }
  }
  window._estToggle = function(nie, val) { if (val) estSelected.add(nie); else estSelected.delete(nie); renderEstList('activos'); };
  window._estAll = function(cb) { if (cb.checked) window._estCache.forEach(e => estSelected.add(e.nie)); else window._estCache.forEach(e => estSelected.delete(e.nie)); renderEstList('activos'); };
  window._promover = async function() {
    if (!estSelected.size) { toast('Selecciona estudiantes', 'Marca quienes seran promovidos.', 'error'); return; }
    if (!confirm('Promover ' + estSelected.size + ' estudiantes de ' + estGradoSel + '? Los no seleccionados se archivaran.')) return;
    const res = await Estudiantes.promover(Array.from(estSelected));
    if (res.ok) { toast('Promocion realizada', res.promovidos + ' promovidos, ' + res.archivados + ' archivados.'); estSelected.clear(); renderEstList('activos'); }
    else toast('Error', res.error, 'error');
  };

  // ===== JUEGOS =====
  function renderJuegos() {
    renderUserBarBack();
    content.innerHTML = header('🎮', 'Juegos', 'Juegos educativos',
      '<button class="btn btn-sky" onclick="window._juegoNew()">+ Nuevo Juego</button>') +
      '<div id="juego-content"></div>';
    renderJuegosList();
  }
  async function renderJuegosList() {
    const res = await Juegos.list();
    const div = document.getElementById('juego-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.juegos.length) { div.innerHTML = '<div class="empty"><div class="ico">🎮</div><h3>No hay juegos</h3></div>'; return; }
    div.innerHTML = '<div class="items-grid">' + res.juegos.map(j =>
      '<div class="item-card"><div style="background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center"><div style="font-size:40px">' + (j.emoji || '🎯') + '</div><h4 style="color:#fff">' + escapeHtml(j.titulo) + '</h4></div>' +
      '<div class="desc">' + escapeHtml(j.descripcion) + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin:8px 0">' +
        '<div class="badge badge-rose">❤️ ' + j.vidasNecesarias + '</div>' +
        '<div class="badge badge-emerald">📊 ' + j.niveles + ' niveles</div>' +
        '<div class="badge badge-amber">⭐ ' + j.puntosPorNivel + '/nivel</div>' +
        (j.tiempo ? '<div class="badge badge-violet">⏱️ ' + j.tiempo + ' min</div>' : '<div class="badge badge-gray">Sin limite</div>') +
      '</div>' +
      '<div class="actions"><button class="btn btn-outline btn-sm" onclick="window._juegoEdit(\'' + j.id + '\')">✏️ Editar</button>' +
      '<button class="btn btn-danger-ghost btn-sm" onclick="window._juegoDel(\'' + j.id + '\')">🗑️</button></div></div>'
    ).join('') + '</div>';
    window._juegosCache = res.juegos;
  }
  window._juegoNew = function() { juegoDialog(null); };
  window._juegoEdit = function(id) { juegoDialog(window._juegosCache.find(x => x.id === id)); };
  window._juegoDel = async function(id) { if (confirm('Eliminar?')) { const r = await Juegos.eliminar(id); if (r.ok) { toast('Eliminado'); renderJuegosList(); } } };
  function juegoDialog(j) {
    const edit = !!j;
    const emojis = ['🎯','🧩','♟️','🚀','🌈','🧠','⚔️','🏆','🎲','🔮','🪐'];
    const body =
      '<div class="field"><label>Emoji</label><div id="emoji-pick" style="display:flex;flex-wrap:wrap;gap:6px">' + emojis.map(e => '<button type="button" onclick="window._emojiPick(this,\'' + e + '\')" style="width:36px;height:36px;border:2px solid #f3f4f6;background:#e0f2fe;border-radius:8px;cursor:pointer;font-size:18px" data-e="' + e + '">' + e + '</button>').join('') + '</div></div>' +
      '<div class="field"><label>Titulo</label><input id="d-titulo" type="text" value="' + (j ? escapeHtml(j.titulo) : '') + '"></div>' +
      '<div class="field"><label>Descripcion</label><textarea id="d-desc" rows="2">' + (j ? escapeHtml(j.descripcion) : '') + '</textarea></div>' +
      '<div class="row"><div class="field"><label>Vidas necesarias</label><input id="d-vid" type="number" min="0" value="' + (j ? j.vidasNecesarias : 1) + '"></div>' +
      '<div class="field"><label>Niveles</label><input id="d-niv" type="number" min="1" value="' + (j ? j.niveles : 5) + '"></div></div>' +
      '<div class="row"><div class="field"><label>Puntos por nivel</label><input id="d-pts" type="number" min="0" value="' + (j ? j.puntosPorNivel : 10) + '"></div>' +
      '<div class="field"><label>Tiempo (min, opcional)</label><input id="d-tiempo" type="number" min="0" value="' + (j && j.tiempo ? j.tiempo : '') + '"></div></div>' +
      '<div class="field"><label>URL del juego</label><input id="d-url" type="text" value="' + (j ? escapeHtml(j.url) : '') + '" placeholder="https://..."></div>' +
      '<input type="hidden" id="d-emoji" value="' + (j ? j.emoji : '🎯') + '">';
    const { close } = openModal(body, { title: edit ? 'Editar Juego' : 'Nuevo Juego', foot: '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-sky" onclick="window._juegoSave(' + (edit ? '\'' + j.id + '\'' : 'null') + ')">Guardar</button>' });
    window._juegoClose = close;
    const cur = document.getElementById('d-emoji').value;
    document.querySelectorAll('#emoji-pick button').forEach(b => { if (b.dataset.e === cur) b.style.borderColor = '#0284c7'; });
  }
  window._juegoSave = async function(id) {
    const data = { id, titulo: document.getElementById('d-titulo').value.trim(), descripcion: document.getElementById('d-desc').value.trim(), vidasNecesarias: Number(document.getElementById('d-vid').value), niveles: Number(document.getElementById('d-niv').value), puntosPorNivel: Number(document.getElementById('d-pts').value), tiempo: document.getElementById('d-tiempo').value ? Number(document.getElementById('d-tiempo').value) : '', url: document.getElementById('d-url').value.trim(), emoji: document.getElementById('d-emoji').value };
    if (!data.titulo) { toast('Falta el titulo', null, 'error'); return; }
    const res = id ? await Juegos.editar(data) : await Juegos.crear(data);
    if (res.ok) { toast(id ? 'Actualizado' : 'Creado'); window._juegoClose(); renderJuegosList(); }
    else toast('Error', res.error, 'error');
  };

  // ===== RECURSOS =====
  function renderRecursos() {
    renderUserBarBack();
    content.innerHTML = header('🔗', 'Recursos', 'Enlaces y materiales',
      '<button class="btn btn-orange" onclick="window._recNew()">+ Nuevo Recurso</button>') +
      '<div id="rec-content"></div>';
    renderRecursosList();
  }
  async function renderRecursosList() {
    const res = await Recursos.list();
    const div = document.getElementById('rec-content');
    if (!res.ok) { div.innerHTML = '<div class="alert alert-error">' + res.error + '</div>'; return; }
    if (!res.recursos.length) { div.innerHTML = '<div class="empty"><div class="ico">🔗</div><h3>No hay recursos</h3></div>'; return; }
    div.innerHTML = '<div class="items-grid">' + res.recursos.map(r =>
      '<div class="item-card"><div style="display:flex;justify-content:space-between"><div style="font-size:32px">' + (/^https?:\/\//.test(r.url) ? '🌐' : '📕') + '</div>' +
      '<span class="badge ' + (r.grado === 'Todos' ? 'badge-orange' : 'badge-emerald') + '">' + (r.grado === 'Todos' ? 'Todos' : (r.grado === 'Septimo' ? '7°' : r.grado === 'Octavo' ? '8°' : '9°')) + '</span></div>' +
      '<h4>' + escapeHtml(r.titulo) + '</h4><div class="desc">' + escapeHtml(r.descripcion) + '</div>' +
      '<a href="' + escapeHtml(r.url) + '" target="_blank" class="btn btn-outline btn-sm" style="margin-top:8px">🔗 Abrir</a>' +
      '<div class="actions" style="margin-top:8px"><button class="btn btn-outline btn-sm" onclick="window._recEdit(\'' + r.id + '\')">✏️ Editar</button>' +
      '<button class="btn btn-danger-ghost btn-sm" onclick="window._recDel(\'' + r.id + '\')">🗑️</button></div></div>'
    ).join('') + '</div>';
    window._recsCache = res.recursos;
  }
  window._recNew = function() { recDialog(null); };
  window._recEdit = function(id) { recDialog(window._recsCache.find(x => x.id === id)); };
  window._recDel = async function(id) { if (confirm('Eliminar?')) { const r = await Recursos.eliminar(id); if (r.ok) { toast('Eliminado'); renderRecursosList(); } } };
  function recDialog(r) {
    const edit = !!r;
    const body =
      '<div class="field"><label>Titulo</label><input id="d-titulo" type="text" value="' + (r ? escapeHtml(r.titulo) : '') + '"></div>' +
      '<div class="field"><label>URL</label><input id="d-url" type="text" value="' + (r ? escapeHtml(r.url) : '') + '" placeholder="https://..."></div>' +
      '<div class="field"><label>Descripcion</label><textarea id="d-desc" rows="2">' + (r ? escapeHtml(r.descripcion) : '') + '</textarea></div>' +
      '<div class="field"><label>Grado</label><select id="d-grado"><option value="Todos"' + (r && r.grado === 'Todos' ? ' selected' : '') + '>Todos los grados</option>' +
        ['Septimo', 'Octavo', 'Noveno'].map(g => '<option value="' + g + '"' + (r && r.grado === g ? ' selected' : '') + '>' + (g === 'Septimo' ? '7°' : g === 'Octavo' ? '8°' : '9°') + ' - ' + g + '</option>').join('') + '</select></div>';
    const { close } = openModal(body, { title: edit ? 'Editar Recurso' : 'Nuevo Recurso', foot: '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-orange" onclick="window._recSave(' + (edit ? '\'' + r.id + '\'' : 'null') + ')">Guardar</button>' });
    window._recClose = close;
  }
  window._recSave = async function(id) {
    const data = { id, titulo: document.getElementById('d-titulo').value.trim(), url: document.getElementById('d-url').value.trim(), descripcion: document.getElementById('d-desc').value.trim(), grado: document.getElementById('d-grado').value };
    if (!data.titulo || !data.url) { toast('Falta titulo o URL', null, 'error'); return; }
    const res = id ? await Recursos.editar(data) : await Recursos.crear(data);
    if (res.ok) { toast(id ? 'Actualizado' : 'Creado'); window._recClose(); renderRecursosList(); }
    else toast('Error', res.error, 'error');
  };

  render();
}
