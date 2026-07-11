// EduNova — Cliente API (habla con Google Apps Script)
// =====================================================
// La URL del Apps Script se guarda en localStorage como "apiUrl"
// durante el setup del admin. Si no existe, las llamadas fallaran
// con un mensaje claro.

function getApiUrl() {
  return localStorage.getItem('edunova:apiUrl') || '';
}
function setApiUrl(url) {
  localStorage.setItem('edunova:apiUrl', url.trim());
}

async function api(action, params) {
  params = params || {};
  params.action = action;
  const url = getApiUrl();
  if (!url) {
    return { ok: false, error: 'No se ha configurado el enlace de Apps Script. Pide al docente que configure el acceso.' };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight CORS
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { ok: false, error: 'No se pudo conectar con el servidor: ' + e.message };
  }
}

// ===== Auth =====
const Auth = {
  async adminExists() { return api('adminExists'); },
  async setupAdmin() { return api('setupAdmin'); },
  async reconfigurarAdmin() { return api('reconfigurarAdmin'); },
  async login(nie, password) { return api('login', { nie, password }); },
  async crearEstudiante(nie, nombre, password, grado) { return api('crearEstudiante', { nie, nombre, password, grado }); },
  getCurrent() {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
    catch { return null; }
  },
  setCurrent(u) { localStorage.setItem('currentUser', JSON.stringify(u)); },
  clearCurrent() { localStorage.removeItem('currentUser'); },
  logout() { this.clearCurrent(); window.location.href = 'index.html'; },
  async ajustarVidas(nie, delta) { return api('ajustarVidas', { nie, delta }); },
  async ajustarPuntos(nie, delta) { return api('ajustarPuntos', { nie, delta }); }
};

// ===== Clases =====
const Clases = {
  async list(grado, materia) { return api('getClases', { grado, materia }); },
  async crear(c) { return api('crearClase', c); },
  async editar(c) { return api('editarClase', c); },
  async eliminar(id) { return api('eliminarClase', { id }); }
};

// ===== Tareas =====
const Tareas = {
  async list(grado, materia) { return api('getTareas', { grado, materia }); },
  async crear(t) { return api('crearTarea', t); },
  async editar(t) { return api('editarTarea', t); },
  async eliminar(id) { return api('eliminarTarea', { id }); }
};

// ===== Examenes =====
const Examenes = {
  async list(grado, materia) { return api('getExamenes', { grado, materia }); },
  async crear(e) { return api('crearExamen', e); },
  async editar(e) { return api('editarExamen', e); },
  async eliminar(id) { return api('eliminarExamen', { id }); }
};

// ===== Tienda =====
const Tienda = {
  async articulos() { return api('getArticulos'); },
  async crearArt(a) { return api('crearArticulo', a); },
  async editarArt(a) { return api('editarArticulo', a); },
  async eliminarArt(id) { return api('eliminarArticulo', { id }); },
  async pedidos() { return api('getPedidos'); },
  async crearPedido(p) { return api('crearPedido', p); },
  async actualizarPedido(id, patch) { return api('actualizarPedido', { id, ...patch }); }
};

// ===== Estudiantes =====
const Estudiantes = {
  async list() { return api('getEstudiantes'); },
  async promover(nies) { return api('promoverEstudiantes', { nies }); }
};

// ===== Juegos =====
const Juegos = {
  async list() { return api('getJuegos'); },
  async crear(j) { return api('crearJuego', j); },
  async editar(j) { return api('editarJuego', j); },
  async eliminar(id) { return api('eliminarJuego', { id }); }
};

// ===== Recursos =====
const Recursos = {
  async list() { return api('getRecursos'); },
  async crear(r) { return api('crearRecurso', r); },
  async editar(r) { return api('editarRecurso', r); },
  async eliminar(id) { return api('eliminarRecurso', { id }); }
};

// ===== Notas =====
const Notas = {
  async getTabla(grado, materia, tipo) { return api('getTabla', { grado, materia, tipo }); },
  async set(grado, materia, tipo, nie, activityId, nota) { return api('setNota', { grado, materia, tipo, nie, activityId, nota }); },
  async get(grado, materia, tipo, nie, activityId) { return api('getNota', { grado, materia, tipo, nie, activityId }); }
};

// ===== Utilidades =====
function normalizeNombre(v) {
  return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-ZÑ\s]/g, '').replace(/\s+/g, ' ').trim();
}
function isValidNombre(v) { return /^[A-ZÑ]+( [A-ZÑ]+)+$/.test(v.trim()); }
function isValidNie(v) { return /^\d{6,}$/.test(v.trim()); }
function primerasDosPalabras(n) { return String(n || '').trim().split(/\s+/).slice(0, 2).join(' '); }
function iniciales(n) { return String(n || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join(''); }

// ===== Toast =====
function toast(title, desc, type) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : type === 'warn' ? ' warn' : '');
  t.innerHTML = '<div class="t">' + escapeHtml(title) + '</div>' + (desc ? '<div class="d">' + escapeHtml(desc) + '</div>' : '');
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== Modal helper =====
function openModal(html, opts) {
  opts = opts || {};
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = '<div class="modal' + (opts.lg ? ' lg' : '') + '">' +
    '<div class="modal-head"><h3>' + (opts.title || '') + '</h3><button class="x">×</button></div>' +
    '<div class="modal-body">' + html + '</div>' +
    (opts.foot ? '<div class="modal-foot">' + opts.foot + '</div>' : '') +
    '</div>';
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.x').onclick = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  return { overlay, close };
}

function requireLogin() {
  const u = Auth.getCurrent();
  if (!u) { window.location.href = 'index.html'; return null; }
  return u;
}
