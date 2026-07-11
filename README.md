# EduNova · Plataforma Escolar

Plataforma educativa para docentes y estudiantes (7°, 8° y 9° grado). Hecha con **HTML + CSS + JavaScript puro** (vanilla JS) para el frontend y **Google Apps Script + Google Sheets** como backend.

---

## 📁 Qué contiene este repo

```
edunova/
├── index.html              ← Login + registro de estudiante + setup del admin
├── docente.html            ← Panel del docente (7 módulos)
├── estudiante.html         ← Panel del estudiante (7 módulos)
├── css/
│   └── estilos.css         ← Todos los estilos
├── js/
│   ├── api.js              ← Cliente del Apps Script (fetch)
│   ├── userbar.js          ← Barra de usuario (admin/estudiante)
│   ├── docente.js          ← Lógica del panel del docente
│   └── estudiante.js       ← Lógica del panel del estudiante
├── 7/  8/  9/              ← HTML de actividades por grado
│   ├── clases/             ← 7matu1l1c1.html, etc.
│   ├── tareas/             ← 7matt1.html, etc.
│   └── examenes/           ← 7matex1.html, etc.
├── apps-script/
│   └── Codigo.gs           ← Backend (pegar en Google Apps Script)
└── README.md
```

---

## 🚀 Configuración (una sola vez)

### 1. Crea el Google Sheet (base de datos)
1. Ve a [sheets.new](https://sheets.new) y crea una hoja nueva.
2. Llámala como quieras (ej. "EduNova BD"). **No crees las hojas manualmente** — el código las crea solas.

### 2. Instala el Apps Script
1. En tu Google Sheet: **Extensiones → Apps Script**.
2. Borra el contenido de `Code.gs` y pega **todo** el contenido de `apps-script/Codigo.gs`.
3. Guarda (💾).

### 3. Publica como aplicación web
1. En Apps Script: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. - **Ejecutar como**: Yo
   - **Quien tiene acceso**: Cualquiera
4. Copia la URL que te da (algo como `https://script.google.com/macros/s/AKfyc.../exec`). **Esa es tu URL de API.**

### 4. Sube el frontend a GitHub Pages
1. Crea un repo en GitHub (ej. `edunova`).
2. Sube **todos** los archivos de esta carpeta (`index.html`, `docente.html`, `estudiante.html`, `css/`, `js/`, `7/`, `8/`, `9/`).
   - **NO subas** `apps-script/Codigo.gs` como parte de la web (aunque puedes dejarlo en el repo para control de versiones, GitHub Pages no lo publica si está fuera de las rutas de la web).
3. En GitHub: **Settings → Pages → Source: main branch → /(root)**.
4. Espera 1-2 min. Tu web estará en `https://TU_USUARIO.github.io/edunova/`.

### 5. Configura el admin (primera vez)
1. Abre tu web en GitHub Pages.
2. Abre el login y haz clic en el enlace discreto **"🔒 Acceso docente"** (abajo del formulario).
3. Pega la **URL de Apps Script** que copiaste en el paso 3.
4. Clic en **Conectar**.
5. Se generan un **NIE** y una **contraseña** privados → **cópialos y guárdalos** (la contraseña solo se muestra una vez).
6. Clic en **"He guardado mis credenciales — Entrar"**. ¡Ya estás en el panel del docente!

---

## 👩‍🏫 Uso como docente

Desde el panel tienes 7 módulos:

| Módulo | Para qué |
|--------|----------|
| **Clases** | Crear/editar/eliminar clases por grado y materia. Marca "evaluada" si tiene nota. Genera IDs tipo `7matu1l1c1`. |
| **Tareas** | CRUD de tareas con título, indicaciones y rango de fechas. |
| **Examenes** | CRUD de exámenes. |
| **Tienda** | Artículos (con precio en ⭐) + gestión de pedidos de estudiantes. |
| **Estudiantes** | Listado con vidas/puntos. Selecciona quiénes se promueven al siguiente grado (los demás se archivan). |
| **Juegos** | CRUD de juegos (vidas necesarias, niveles, puntos por nivel, tiempo). |
| **Recursos** | Enlaces a libros/páginas por grado. |

Cada clase/tarea/examen tiene un botón **"Ver HTML"** que abre el archivo estático correspondiente (ej. `7/clases/7matu1l1c1.html`). **Ese HTML debes crearlo tú** (copia la plantilla `7/clases/7matu1l1c1.html` como base) y subirlo a GitHub.

Las **tablas de notas** están en la pestaña "📊 Notas" de cada módulo: estudiantes ordenados alfabéticamente (por 3ª→4ª→1ª→2ª palabra del nombre, omitiendo "de"/"del"), columnas en orden cronológico, promedio automático.

---

## 👧 Uso como estudiante

1. El estudiante entra a la web → **Registrarse**:
   - Nombre completo (solo MAYÚSCULAS, sin tildes, Ñ permitida)
   - NIE (solo números)
   - Contraseña (con ojito 👁️)
   - Grado (7°, 8°, 9°)
2. Comienza con **5 ❤️ vidas** y **0 ⭐ puntos**.
3. Desde su panel ve: Clases, Tareas, Exámenes (con su nota si ya entregó), Tienda (canjea puntos), Juegos (consumen vidas, dan puntos), Perfil, Recursos.

---

## 🧩 Crear el HTML de una actividad

Cuando creas una clase/tarea/examen en el panel del docente, se te muestra la ruta donde debe vivir el HTML (ej. `7/clases/7matu1l1c1.html`).

1. Copia `7/clases/7matu1l1c1.html` como plantilla.
2. Pégalo en la ruta correcta dentro de tu repo.
3. Cambia estas variables en el `<script>`:
   ```js
   const ACTIVITY_ID = '7matu1l1c1';  // el ID de tu actividad
   const GRADO = 'Septimo';
   const MATERIA = 'Matematica';
   const TIPO = 'clase';  // 'clase' | 'tarea' | 'examen'
   ```
4. Agrega el contenido (explicación, preguntas, ejercicios) en el cuerpo.
5. Para **auto-calificación**: en la función `enviar()`, calcula la nota y pásala a `Notas.set(..., nota)` en vez de `null`.
6. `git push` → GitHub Pages lo publica automáticamente.

El HTML ya incluye:
- Userbar con los datos del estudiante (vidas, puntos)
- Función `enviar()` que guarda la nota en el Sheet vía Apps Script
- Función `mostrarNota()` si ya está calificado
- Helpers para actualizar vidas/puntos/hacer pedidos

---

## 🔌 Estructura del Google Sheet

El Apps Script crea estas hojas automáticamente:

| Hoja | Contenido |
|------|-----------|
| `Usuarios` | NIE, nombre, password, grado, rol, vidas, puntos, archived |
| `Clases` | id, grado, materia, unidad, leccion, tema, evaluada, fechas |
| `Tareas` | id, grado, materia, titulo, indicaciones, fechas |
| `Examenes` | id, grado, materia, titulo, indicaciones, fechas |
| `Tienda` | id, nombre, descripcion, precio, stock, emoji |
| `Pedidos` | id, estudianteNie, estudianteNombre, items (JSON), fecha, entregado |
| `Juegos` | id, titulo, vidasNecesarias, niveles, puntosPorNivel, tiempo, url, emoji |
| `Recursos` | id, titulo, url, descripcion, grado |
| `7matcla`, `7mattar`, `7matexa` | Tabla de notas grado 7 matematica (clases/tareas/examenes) |
| `7ciecla`, `7cietar`, `7cieexa` | Tabla de notas grado 7 ciencia |
| `7engcla`, ... | … y así para 8° y 9° |

---

## 🆘 Problemas frecuentes

**"No se pudo conectar con el servidor"**
→ Revisa que la URL de Apps Script esté bien pegada (Acceso docente → Reconfigurar) y que la implementación sea "Cualquiera".

**El estudiante no ve sus clases**
→ Verifica que la clase tenga el grado y materia correctos, y que el estudiante esté en ese grado.

**Olvidé la contraseña del admin**
→ Acceso docente → "Reconfigurar administrador". Se borra el admin actual y se genera uno nuevo (los estudiantes no se borran).

**GitHub Pages no actualiza**
→ Espera 1-2 minutos tras el `git push`. Si persiste, fuerza el caché con Ctrl+Shift+R.

---

## 📝 Notas

- Todo el estado del estudiante logueado se guarda en `localStorage` para velocidad.
- El admin no se "ve" desde el login público: solo un enlace discreto "🔒 Acceso docente" abajo del formulario.
- Las validaciones de nombre (MAYÚSCULAS, sin tildes, Ñ) y NIE (solo números) son tanto en frontend como en backend.
- No se permiten dos estudiantes con el mismo NIE o el mismo nombre completo.

¡Listo! Cualquier mejora o bug, abre un issue. 🎓
