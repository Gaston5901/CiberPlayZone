# CiberPlayZone — One Page

One-page estática pensada para celular (navbar + carrusel + integrantes con modal “Ver más”).

## Cómo poner tus imágenes

- **Logo:** poné tu logo en `assets/zonas/logo.png` (o usá otro nombre/formato y actualizá la ruta en `index.html`).
- **Fotos de Zonas y servicios (carrusel):** poné tus fotos en `assets/zonas/` con estos nombres:
   - `assets/zonas/pc.jpg`
   - `assets/zonas/consolas.jpg`
   - `assets/zonas/torneos.jpg`
   - `assets/zonas/snacks.jpg`

   Si todavía no están, no pasa nada: el sitio hace fallback a los íconos SVG.
- **Fotos del equipo:** poné las imágenes en `assets/` (ej: `assets/gerente.jpg`) y actualizá `app.js` en el array `members` (campo `img`).

Ejemplo:

- `img: 'assets/gerente.jpg'`

## GitHub Pages (sin base de datos)

Sí: esto funciona perfecto en GitHub Pages sin base de datos.

GitHub Pages sirve archivos estáticos (HTML/CSS/JS + imágenes). Mientras tus imágenes estén **dentro del repo** y las referencies con rutas relativas (como está ahora), se van a ver igual de lindo.

### Pasos rápidos

1. Subí el proyecto a un repo en GitHub.
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** (o `master`) y carpeta **/ (root)**
4. Esperá a que te dé la URL del sitio.

## Notas

- Formularios “reales” (guardando datos) requieren backend. En Pages podés:
  - abrir WhatsApp/mail (como está), o
  - usar un servicio externo tipo Formspree/Google Forms.
