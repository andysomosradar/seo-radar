# Radar Sitemap Generator

Genera automáticamente el `sitemap.xml` de somosradar.com leyendo el CMS de Framer cada día.

## Setup

1. Crea un repositorio en GitHub y sube estos archivos
2. Ve a **Settings → Secrets and variables → Actions**
3. Crea un nuevo secret llamado `FRAMER_API_KEY` con tu API key de Framer
4. Activa **GitHub Pages** en Settings → Pages → Branch: `main` / carpeta: `/ (root)`
5. En Google Search Console, agrega el sitemap:
   ```
   https://TU-USUARIO.github.io/TU-REPO/sitemap.xml
   ```

## Cómo funciona

- Se ejecuta automáticamente todos los días a las 6am
- Lee todas las colecciones CMS de Framer
- Genera `sitemap.xml` con páginas estáticas + todos los artículos del blog
- Cualquier artículo nuevo en Framer aparecerá al día siguiente en el sitemap
