# 🏋️ Rutina Mensual — App de seguimiento

App web para registrar tus entrenamientos diarios y ver estadísticas a largo plazo. Sin servidor, sin base de datos: todo se guarda en el navegador.

## Archivos del proyecto

```
rutina-app/
├── index.html   ← App principal
├── styles.css   ← Estilos
├── app.js       ← Lógica y estadísticas
└── data.js      ← Datos de la rutina
```

---

## 🚀 Cómo subirlo a GitHub Pages (paso a paso)

### Paso 1 — Crear cuenta en GitHub
1. Ve a [github.com](https://github.com) y crea una cuenta si no tienes (es gratis).

### Paso 2 — Crear un repositorio nuevo
1. Haz clic en el botón **"+"** arriba a la derecha → **"New repository"**
2. Ponle un nombre, por ejemplo: `mi-rutina`
3. Marca la casilla **"Public"** (necesario para GitHub Pages gratis)
4. Haz clic en **"Create repository"**

### Paso 3 — Subir los archivos
1. En la página del repositorio vacío, haz clic en **"uploading an existing file"**
2. Arrastra los 4 archivos (`index.html`, `styles.css`, `app.js`, `data.js`) a la zona de carga
3. Escribe un mensaje en "Commit changes", por ejemplo: `Primer commit`
4. Haz clic en **"Commit changes"**

### Paso 4 — Activar GitHub Pages
1. Ve a la pestaña **"Settings"** del repositorio
2. En el menú izquierdo, haz clic en **"Pages"**
3. En "Source", selecciona **"Deploy from a branch"**
4. En "Branch", selecciona **"main"** y carpeta **"/ (root)"**
5. Haz clic en **"Save"**

### Paso 5 — Acceder a tu app
- En unos segundos aparecerá un mensaje: *"Your site is live at..."*
- La URL será algo como: `https://tu-usuario.github.io/mi-rutina/`
- ¡Abre esa URL desde el móvil y añádela a la pantalla de inicio!

---

## 📱 Añadir a pantalla de inicio (como app)

**En iPhone (Safari):**
1. Abre la URL en Safari
2. Toca el botón de compartir (□↑)
3. → **"Añadir a pantalla de inicio"**
4. Ponle nombre y confirma

**En Android (Chrome):**
1. Abre la URL en Chrome
2. Toca los tres puntos (⋮)
3. → **"Añadir a pantalla de inicio"**

---

## 💾 ¿Cómo se guardan los datos?

Los datos se guardan en el `localStorage` de tu navegador, en el dispositivo donde uses la app. Esto significa:
- ✅ Funcionan sin internet después de la primera carga
- ✅ Se mantienen aunque cierres el navegador
- ⚠️ Son específicos del dispositivo y navegador (no se sincronizan entre móvil y ordenador)
- ⚠️ Se borran si limpias los datos del navegador

**Recomendación:** Usa el botón **"Exportar datos como JSON"** en Estadísticas para hacer copias de seguridad periódicas.

---

## ✏️ Modificar la rutina

Si en el futuro quieres cambiar ejercicios, edita el archivo `data.js` y vuelve a subirlo a GitHub. La app se actualizará automáticamente.
