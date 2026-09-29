# Primera auditoría — limpieza de archivos sin uso

- **Fecha:** 2026-09-27
- **Alcance:** repositorio completo, con foco en el payload que se publica en Vercel
- **Objetivo:** localizar archivos, carpetas y artefactos que no usa la aplicación y que pueden eliminarse sin romper el sitio
- **Método:** recorrido del árbol de ficheros, lectura de los puntos de entrada (`index.html`, `vercel.json`, `Web/scripts/app.js`), grafo de referencias desde cada demo, y contraste con el catálogo generado

---

## 1. Resumen ejecutivo

| Métrica | Antes | Después | Diferencia |
| --- | --- | --- | --- |
| Tamaño del repo (sin `.git`) | 39,28 MB | 25,64 MB | **−13,64 MB (−35 %)** |
| Ficheros versionados en Git | — | 6 eliminados | — |
| Carpetas eliminadas | — | 2 | — |
| Líneas de configuración modificadas | — | 2 ficheros | — |

**Resultado:** no se rompió ninguna referencia. La búsqueda de los nombres de todos los ficheros eliminados en el código (`.html`, `.css`, `.js`, `.mjs`) no devuelve ninguna coincidencia.

El peso restante (22,69 MB) está casi todo en `GevendraAutorExterno/` y corresponde a **material que sí se usa**: las 116 demos de terceros se muestran en vista previa dentro de un `iframe`.

---

## 2. Acciones ejecutadas en esta auditoría

### 2.1 Ficheros eliminados con `git rm`

| Fichero | Tamaño | Motivo |
| --- | --- | --- |
| `Web/data/catalog.js` | 2,03 MB | Catálogo completo con el código fuente de los 384 componentes. Solo se carga al abrir con `file://` (`Web/scripts/app.js:536`) o si falla la petición de `catalog.json` (`app.js:547`). **En Vercel nunca se carga.** Es un artefacto generado por `generate-catalog.mjs`. |
| `GevendraAutorExterno/trick-and-treat-toggle/cover-2.jpg` | 7,15 MB | La demo es 100 % CSS: `index.html` y `style.css` dibujan el pulley y el caramelo con `radial-gradient` / `linear-gradient`. No hay ninguna etiqueta `<img>` ni regla `url()`. Resto del repositorio de origen. |
| `GevendraAutorExterno/trick-and-treat-toggle/reel-45.png` | 1,12 MB | Ídem, mismo componente. |
| `GevendraAutorExterno/trick-and-treat-toggle/main-reel.jpg` | 747 KB | Ídem, mismo componente. |
| `GevendraAutorExterno/profile-card-02/assets/profile.png` | 640 KB | El `index.html` solo carga `assets/peakpx-removebg-preview.png` (301 KB) como imagen de fondo. |
| `GevendraAutorExterno/modern-contact-card/logo.jpg` | 11,6 KB | El `index.html` solo carga `moshed-2023-10-17-13-58-25.gif`; el CSS importa únicamente la fuente `font/creation-demo.otf`. |

**Total recuperado con `git rm`: 11,70 MB.**

> Las 4 imágenes de `trick-and-treat-toggle` sumaban 8,99 MB y ninguna se mostraba. Es el mayor bloque de peso muerto del repositorio.

### 2.2 Carpetas eliminadas

| Carpeta | Tamaño | Motivo |
| --- | --- | --- |
| `.github-pages-site/` | 2,16 MB | Artefacto de build generado por `Web/scripts/build-site.mjs`. Ya estaba en `.gitignore` (línea 2) y en `.vercelignore` (línea 13). Lo regenera `.github/workflows/deploy-pages.yml` en cada ejecución. No se versiona. |
| `.qodo/` | 0 bytes | Solo contenía directorios vacíos (`.qodo/agents/`, `.qodo/workflows/`). Ya estaba en `.vercelignore` (línea 7). Git no versiona carpetas vacías, así que no queda nada en el índice. |

### 2.3 Cambios de configuración

**`.gitignore`** — se añadió el catálogo completo como artefacto generado:

```gitignore
# Catálogo completo: solo lo usa la apertura con file://, nunca en HTTP.
# Se regenera con Web/scripts/generate-catalog.mjs
Web/data/catalog.js
```

**`.vercelignore`** — se añadió la misma ruta para sacarla del payload de despliegue:

```gitignore
# El catálogo completo solo se carga al abrir con file://; en HTTP se usa
# catalog.json. Se regenera con Web/scripts/generate-catalog.mjs.
Web/data/catalog.js
```

Motivo de quitarlo del versionado: `generate-catalog.mjs` lo reescribe en **cada** ejecución (línea 306-310). Versionar un artefacto de 2 MB que se regenera siempre solo genera diffs enormes y ruido en el historial. Ahora se comporta igual que `.github-pages-site`: existe en local cuando se necesita, nunca se versiona ni se despliega.

---

## 3. Archivos conservados deliberadamente

Por indicación expresa, **no** se eliminaron:

| Ruta | Tamaño | Motivo |
| --- | --- | --- |
| `Docs/Opencode/Plan.md` | 19,5 KB | Documentación interna del plan de mejora. Ya fuera del despliegue por `.vercelignore` línea 3. |
| `Docs/Prompt/Primer_prompt.md` | 15 KB | Igual que el anterior. |
| `CHANGELOG.md` | 37 KB | Historial del proyecto. Ya fuera del despliegue por `.vercelignore` línea 10. |
| `Web/README.md` | 5,9 KB | Documentación de la aplicación. |

Ninguno de los cuatro afecta al payload de Vercel: los tres primeros ya estaban excluidos y `Web/README.md` pesa 5,9 KB.

---

## 4. Verificación de que no se rompió nada

| Comprobación | Resultado |
| --- | --- |
| Referencias a los 6 ficheros eliminados en `.html`, `.css`, `.js`, `.mjs` | **0 coincidencias** |
| Entradas en `Web/data/catalog.json` | 384 |
| Ficheros en `Web/data/sources/*.json` | 384 |
| `sources/` huérfanos (sin entrada en el catálogo) | **0** |
| Entradas del catálogo sin fichero en `sources/` | **0** |
| Ficheros conservados solicitados | `Docs/Opencode/` ✓ `Docs/Prompt/` ✓ `CHANGELOG.md` ✓ `Web/README.md` ✓ |

### Por qué no hay riesgo de 404 por metadatos obsoletos

`catalog-format.mjs:10` descarta el array `files` al construir el índice (`toIndexEntry`), así que **`catalog.json` nunca guarda la lista de ficheros**. Esa lista solo vive en `sources/<id>.json` (`toSourceEntry`) y su único consumidor es `downloadComponentZip` (`app.js:565`).

Los tres componentes afectados (`trick-and-treat-toggle`, `profile-card-02`, `modern-contact-card`) tienen `downloadable: false` y `license: "Unverified"`, por lo que su botón ZIP está deshabilitado y `component.files` nunca llega a invocarse. Aun así, regenerar el catálogo deja los `sources/*.json` limpios (ver §5.1).

---

## 5. Hallazgos pendientes

### 5.1 El catálogo está desincronizado con el disco

Dos demos terminados existen en `creaciones-primium/animaciones/` pero **no aparecen** en `catalog.json`, así que no se publicarán:

- `creaciones-primium/animaciones/snow-glacier-cascade/` (`index.html` + `styles.css`)
- `creaciones-primium/animaciones/tornado-vortex-debris/` (`index.html` + `styles.css` + `script.js`)

**Acción:** ejecutar `node Web/scripts/generate-catalog.mjs` antes de desplegar. El generador también limpia los `sources/*.json` de los ficheros eliminados en esta auditoría.

### 5.2 Carpetas de trabajo incompletas en `creaciones-primium/animaciones/`

| Carpeta | Estado |
| --- | --- |
| `chromatic-aberration-shutter/` | Solo `index.html`, falta `styles.css` |
| `ecg-heartbeat-pulse/` | Solo `index.html`, falta `styles.css` |
| `fiber-optic-light-stream/` | Solo `styles.css`, falta `index.html` |
| `cloud-drift-parallax/` | Vacía |
| `sakura-petal-vortex/` | Vacía |
| `wind-swept-grass-field/` | Vacía |

Las vacías no se detectan con `generate-catalog.mjs` (busca `index.html`) y las incompletas se indexan igual, con la página rota. Las tres vacías tampoco aparecen en el índice de Git, porque Git no versiona directorios vacíos. **Decidir si se completan o se eliminan antes del lanzamiento.**

### 5.3 `build-site.mjs` no conoce `creaciones-primium`

`Web/scripts/build-site.mjs:9` declara solo dos raíces:

```js
const libraryRoots = ["GevendraAutorExterno", "CreacionesNuevas"].map((name) => ({ ... }));
```

`generate-catalog.mjs:8-28` sí declara las tres. Hoy no provoca error porque los componentes de `creaciones-primium` no tienen fichero `LICENSE` en su carpeta, así que `downloadable` es `false` y el constructor los filtra antes de buscar la raíz. **Pero en cuanto uno gane `redistributable: true` en `component-overrides.json`, `build-site.mjs` abortará con `Unknown library root`.** Añadir la raíz o documentar la decisión.

### 5.4 README desactualizado

`README.md` y `Web/README.md` siguen diciendo **364 demos** en dos colecciones. El estado real es **384 componentes en tres colecciones**:

| Raíz | Componentes | ZIP |
| --- | --- | --- |
| `GevendraAutorExterno/` | 116 | Deshabilitado (sin licencia en el repo de origen) |
| `CreacionesNuevas/` | 248 | Habilitado (MIT propia) |
| `creaciones-primium/` | 20 | Deshabilitado (sin `LICENSE` en la carpeta) |
| **Total** | **384** | **248 descargables** |

---

## 6. Estado del payload de despliegue

Lo que Vercel sube tras aplicar `.vercelignore`:

| Carpeta | Tamaño | Comentario |
| --- | --- | --- |
| `GevendraAutorExterno/` | 22,69 MB | 116 demos de terceros. Las vistas previas cargan `../GevendraAutorExterno/...`, así que **esta carpeta tiene que publicarse** (lo dice `README.md:132`). |
| `CreacionesNuevas/` | 0,83 MB | 248 demos propias. |
| `creaciones-primium/` | 0,69 MB | 20 demos en curso. |
| `Web/` | 1,34 MB | La aplicación. Antes eran 3,37 MB. |
| Ficheros de raíz | ~0,03 MB | `index.html`, `vercel.json`, `LICENSE`, `README.md` |
| **Total** | **25,64 MB** (1 630 ficheros) | Antes 39,28 MB |

Excluidos: `.git/`, `.github/`, `Docs/` (salvo `THIRD_PARTY_NOTICES.md`), `CHANGELOG.md`, `node_modules/`, `Thumbs.db`, `.DS_Store`, `Web/data/catalog.js`.

### Configuración de Vercel

No hay que cambiarla. `vercel.json` ya fija lo necesario:

- `framework: null`, `buildCommand: null`, `outputDirectory: "."` → sin build, se sirve la raíz.
- Redirección `/` → `/Web/` (temporal) y `/Web` → `/Web/` (permanente). La barra final es obligatoria: sin ella se rompen las rutas relativas de las vistas previas.
- Cabeceras de seguridad en `/(.*)`.

En el panel: **Framework Preset: Other**, **Build Command vacío**, **Output Directory: `.`**.

---

## 7. Mapa de dependencias de `Web/`

Para futuras limpiezas, esta es la referencia de qué archivo toca qué:

| Archivo | Consumido por | ¿En el despliegue? |
| --- | --- | --- |
| `Web/index.html` | Punto de entrada | Sí |
| `Web/styles/site.css` | `Web/index.html:31` | Sí |
| `Web/scripts/app.js` | `Web/index.html:33` | Sí |
| `Web/scripts/zip.js` | `Web/index.html:32` | Sí |
| `Web/data/catalog.json` | `app.js:543` (fetch) | Sí |
| `Web/data/sources/<id>.json` | `app.js:555` (fetch perezoso) | Sí, 384 ficheros |
| `Web/data/component-overrides.json` | `generate-catalog.mjs:32` | Sí (inerte en runtime) |
| `Web/data/catalog.js` | `app.js:536-547` (solo `file://`) | **No** (excluido en esta auditoría) |
| `Web/scripts/generate-catalog.mjs` | Workflow de Pages, y a mano | Sí, pero no se ejecuta |
| `Web/scripts/catalog-format.mjs` | Los dos scripts de build | Sí, pero no se ejecuta |
| `Web/scripts/build-site.mjs` | `deploy-pages.yml:26` | Sí, pero no se ejecuta |
| `Web/og-image.png` | Open Graph / Twitter Card | Sí |
| `Web/favicon.svg` | `Web/index.html:12-13` | Sí |
| `Web/robots.txt`, `Web/sitemap.xml` | SEO | Sí |
| `Web/README.md` | — | Sí (inerte) |

---

## 8. Conclusión

La aplicación no tenía archivos de código muerto: los cinco scripts de `Web/scripts/`, los tres ficheros de `Web/data/` y los 384 `sources/*.json` están todos en uso, y el catálogo cuadra exactamente con el disco.

El peso innecesario estaba en dos sitios, y ambos están resueltos:

1. **Imágenes huérfanas** en demos de terceros: 9,64 MB de JPEG/PNG que ningún HTML ni CSS cargaba. Ahora 0.
2. **Artefactos de build** en el payload: 4,19 MB entre `.github-pages-site/` y `Web/data/catalog.js`. Ahora 0.

Pendiente antes de publicar: regenerar el catálogo (§5.1), decidir el fate de las 6 carpetas WIP (§5.2) y corregir las cifras del README (§5.4).
