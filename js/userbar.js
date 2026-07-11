// EduNova — UserBar (barra de usuario)
// Renderiza la barra superior segun el rol del usuario logueado.

function renderUserBar(container, opts) {
  opts = opts || {};
  const u = Auth.getCurrent();
  if (!u) { window.location.href = 'index.html'; return; }
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  if (u.rol === 'admin') {
    el.innerHTML =
      '<header class="userbar admin">' +
        '<div class="userbar-inner">' +
          '<div class="userbar-left">' +
            '<div class="userbar-logo">🛡️</div>' +
            '<div class="userbar-brand">EduNova<small>Panel del Docente</small></div>' +
            '<div class="userbar-chip"><div class="av">A</div><span class="name">Admin</span></div>' +
          '</div>' +
          '<div class="userbar-stats">' +
            (opts.onBack ? '<button class="btn btn-ghost btn-sm" style="color:#fff" onclick="window._ubBack()">Inicio</button>' : '') +
            '<button class="btn btn-ghost btn-sm" style="color:#fff" onclick="Auth.logout()">Salir</button>' +
          '</div>' +
        '</div>' +
      '</header>';
  } else {
    el.innerHTML =
      '<header class="userbar student">' +
        '<div class="userbar-inner">' +
          '<div class="userbar-left">' +
            '<div class="userbar-logo">🎓</div>' +
            '<div class="userbar-brand">EduNova<small>Aula Estudiantil</small></div>' +
            '<div class="userbar-chip">' +
              '<div class="av">' + iniciales(u.nombre) + '</div>' +
              '<div><div class="name">' + escapeHtml(primerasDosPalabras(u.nombre)) + '</div>' +
              '<div class="grade">' + escapeHtml(u.grado) + ' grado</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="userbar-stats">' +
            '<span class="stat">❤️ ' + u.vidas + '</span>' +
            '<span class="stat puntos">⭐ ' + u.puntos + '</span>' +
            (opts.onBack ? '<button class="btn btn-ghost btn-sm" style="color:#fff" onclick="window._ubBack()">Inicio</button>' : '') +
            '<button class="btn btn-ghost btn-sm" style="color:#fff" onclick="Auth.logout()">Salir</button>' +
          '</div>' +
        '</div>' +
      '</header>';
  }
  if (opts.onBack) window._ubBack = opts.onBack;
}

function updateUserBarStats() {
  const u = Auth.getCurrent();
  if (!u) return;
  const vidasEl = document.querySelector('.userbar-stats .stat:not(.puntos)');
  const puntosEl = document.querySelector('.userbar-stats .stat.puntos');
  if (vidasEl) vidasEl.textContent = '❤️ ' + u.vidas;
  if (puntosEl) puntosEl.textContent = '⭐ ' + u.puntos;
}
