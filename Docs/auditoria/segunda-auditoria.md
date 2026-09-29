# Segunda auditoría — un solo sitio, CI de validación y cabeceras de seguridad

- **Fecha:** 2026-09-27
- **Alcance:** continuidad de la [primera auditoría](./primera-auditoria.md), que se conserva sin cambios
- **Objetivo:** eliminar el segundo punto de despliegue, que fallaba en cada subida, y cubrir el fallo silencioso más probable del repositorio
- **Método:** lectura del workflow y de sus anotaciones, análisis de `vercel.json`, comprobación previa de qué recursos usa la aplicación antes de añadir la CSP, y prueba del path traversal de `serve.mjs`

---

## 1. Resumen ejecutivo

| Métrica | Antes | Después |
| --- | --- | --- |
| Puntos de despliegue | 2 (Vercel + GitHub Pages) | **1 (Vercel)** |
| Workflows que fallaban en cada `push` | 1 | **0** |
| Cabeceras de seguridad en `vercel.json` | 3 | **6** |
| Comprobaciones automáticas del catálogo | 0 | **5** |
| Componentes indexados | 396 | **473** |
| Componentes sin redistribución | 148 | **225** |
| `missingReferences` sin resolver | 0 | **0** |

El repositorio **creció** de 25,64 MB a 32,17 MB. No es una regresión: `creaciones-primium/` pasó de 32 a 109 componentes mientras se trabajaba en esta auditoría. El peso sigue dominado por material en uso, igual que tras la primera auditoría.

---

## 2. Causa del error de GitHub Actions

El workflow `deploy-pages.yml` fallaba en todas las subidas con:

```
HttpError: Not Found - .../pages#get-a-apiname-pages-site
Get Pages site failed. Please verify that the repository has Pages enabled
and configured to build using GitHub Actions, or consider exploring the
`enablement` parameter for this action.
```

**No era un error del código.** `actions/configure-pages@v5` empieza pidiendo los metadatos del sitio con `GET /repos/{owner}/{repo}/pages`. Ese endpoint devuelve **404 Not Found** cuando el repositorio no tiene un sitio de Pages creado. La acción moría en su primera llamada, antes de `upload-pages-artifact`, y el job `deploy` nunca llegaba a ejecutarse por `needs: build`.

GitHub Pages estaba, y sigue estando, **deshabilitado** en el repositorio.

### Por qué `enablement` no lo arreglaba

El propio mensaje sugiere `enablement`, pero el `action.yml` de la acción es explícito:

> This option requires a token other than `GITHUB_TOKEN` to be provided. In the
> context of a Personal Access Token, the `repo` scope or Pages write permission
> is required. In the context of a GitHub App, the `administration:write` and
> `pages:write` permissions are required.

El bloque `permissions:` del workflow (`contents: read`, `pages: write`, `id-token: write`) era **correcto para desplegar**, pero no para *habilitar* Pages: hace falta nivel administrativo, que el `GITHUB_TOKEN` omite deliberadamente por seguridad. Es diseño de GitHub, no una mala configuración.

### Las otras tres anotaciones

| Anotación | Causa | Resolución |
| --- | --- | --- |
| Node.js 20 deprecado | `checkout@v4`, `configure-pages@v5` y `setup-node@v4` targetizaban Node 20 | Irrelevante: el workflow se eliminó. El nuevo usa `@v5` en ambos, ya sobre Node 24 |
| `ubuntu-latest` migrará a Ubuntu 26 el 2026-10-19 | Etiqueta móvil del runner | Irrelevante por lo mismo. El nuevo fija `ubuntu-24.04` |
| `punycode` DeprecationWarning | `upload-pages-artifact@v4` fija internamente un `upload-artifact` antiguo | Irrelevante por lo mismo |

---

## 3. Por qué se eliminó en lugar de arreglarse

Arreglarlo era posible con un clic en **Settings → Pages → Source → GitHub Actions**. No se hizo por una razón de fondo.

`build-site.mjs` filtraba por `downloadable === true`, así que el artefacto de Pages llevaba **248 de 396** componentes. Excluía los 116 de `GevendraAutorExterno` (sin licencia en su repositorio de origen) y los de `creaciones-primium` (sin `LICENSE` en la carpeta).

Habilitar Pages habría producido **dos sitios distintos**: Vercel con los 396 componentes y Pages con 248. Más una URL que mantener, su propio canonical, su propio sitemap y un segundo sitio que se pudriría con cada cambio. Y un artefacto de publicación que se puede filtrar por error es un riesgo de licencia, no solo de mantenimiento.

Con un solo punto de despliegue, la superficie de error se reduce a un sitio.

---

## 4. Cambios ejecutados

### 4.1 Ficheros eliminados

| Fichero | Motivo |
| --- | --- |
| `.github/workflows/deploy-pages.yml` | Robot de un despliegue que no se quiere |
| `Web/scripts/build-site.mjs` | Solo lo consumía ese workflow |

`Web/scripts/catalog-format.mjs` **no** se eliminó. `generate-catalog.mjs` importa `toIndexEntry` y `writeSources` de ahí, y `writeSources` usa `toSourceEntry` por dentro. Lo que sí se eliminó fue `readSource()`, que únicamente consumía `build-site.mjs`, y el import `readFile` que quedaba sin uso.

Con `build-site.mjs` fuera, `creaciones-primium` deja de ser un caso latente: el script declaraba solo dos raíces y habría lanzado `Unknown library root` en cuanto un componente de esa colección ganase `redistributable: true` en los overrides.

### 4.2 Nuevo `Web/scripts/validate.mjs`

Sin dependencias. Se ejecuta igual en local que en CI:

```powershell
node Web/scripts/validate.mjs
```

| # | Comprobación | Qué evita |
| --- | --- | --- |
| 1 | `node --check` en los 6 `.js` y `.mjs` | La web en blanco por un error de sintaxis |
| 2 | Ids únicos, y catálogo ↔ `sources/` en ambos sentidos | Un demo que abre a error, o un `sources/` huérfano |
| 3 | Cada `preview` apunta a un `index.html` real | Previews con 404 |
| 4 | `missingReferences` vacío en todas las entradas | Referencias locales rotas |
| 5 | Todo `index.html` del disco figura en el catálogo | **Demos que existen pero no se ven** |

La quinta es la que justifica el script. Un demo añadido sin regenerar el catálogo **no aparece en la web y no produce ningún síntoma**: no hay error, no hay aviso en consola, no hay 404. Solo que el demo no está.

**Al escribirlo ya encontró 77 demos** de `creaciones-primium/botones/` presentes en disco y ausentes de `catalog.json`, y **cero** fallos de sintaxis, `sources`, `preview` o referencias. Ninguno de esos 77 era un error: era trabajo en curso sin indexar.

### 4.3 Nuevo `.github/workflows/validate.yml`

Se ejecuta en cada `push` a `main` y en cada pull request. **No despliega**, así que no depende de GitHub Pages y no puede fallar por ella.

```yaml
jobs:
  validar:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: node Web/scripts/validate.mjs
      - run: node Web/scripts/generate-catalog.mjs && git diff --quiet -- Web/data
```

El segundo paso detecta el desajuste: regenera el catálogo y falla si `Web/data/` cambia. Si el catálogo está al día, el diff es vacío y el job pasa.

Dos decisiones deliberadas:

- **`ubuntu-24.04` en vez de `ubuntu-latest`**, para no depender de la migración a Ubuntu 26 ni recibir el aviso.
- **Sin `configure-pages`, `upload-pages-artifact` ni `deploy-pages`.** Un workflow que valida y no publica es exactamente lo que hace falta; cuanto menos superficie, menos puede romperse.

El YAML se validó con un parser real, no solo revisado a ojo.

### 4.4 Cabeceras de seguridad en `vercel.json`

De tres a seis. Las nuevas:

| Cabecera | Valor |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://github.com https://*.githubusercontent.com; frame-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

La CSP **no se aplicó a ciegas.** Antes de escribirla se comprobó qué usa la aplicación de verdad:

| Riesgo | Comprobación | Resultado |
| --- | --- | --- |
| Scripts inline bloqueados | `<script>` sin `src` en las 3 páginas | Solo el de la redirección de `index.html` raíz |
| Estilos inline bloqueados | `style="..."` en las 3 páginas | 0 |
| CSSOM bloqueado | `style.setProperty()` en `app.js` | 7 usos, **no restringidos** por CSP |
| `eval` bloqueado | `eval(` y `new Function` | 0 |
| Recursos remotos | URLs de `Web/*.html` y `app.js` | Solo Google Fonts y avatares de GitHub |
| `data:` URIs | `data:image` y `data:font` | 0 |

Con esos datos, `script-src 'self' 'unsafe-inline'` es el valor adecuado: lo único inline es la redirección raíz, y `'unsafe-inline'` sigue impidiendo la ejecución de scripts remotos, que es de donde viene el riesgo real.

**La CSP no afecta a las vistas previas.** `frame-src 'self'` las permite porque están en el mismo origen. Y los demos de terceros, que van dentro de un `iframe`, **no quedan sujetos a esta CSP**: cada documento aplica la suya, así que los que cargan recursos remotos siguen funcionando.

### 4.5 Corregido el path traversal de `serve.mjs`

El servidor local comprobaba la seguridad así:

```js
const base = path.join(repositoryDirectory, requested);
if (!base.startsWith(repositoryDirectory)) return null;
```

`startsWith` sin separador final deja pasar cualquier carpeta hermana cuyo nombre empiece por el del repositorio. Probado antes de corregir:

```
/../Libreria_HTML_CSS_vecino/secreto.txt   ->  PASA (se servía)
```

Sustituido por `path.relative`, que es la comprobación correcta:

```js
const base = path.resolve(repositoryDirectory, `.${path.posix.sep}${requested}`);
const relative = path.relative(repositoryDirectory, base);
if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
```

Verificado tras el cambio:

| Petición | Resultado |
| --- | --- |
| `/Web/index.html` | servido |
| `/Web/data/catalog.json?x=1` | servido |
| `/../Libreria_HTML_CSS_vecino/secreto.txt` | **bloqueado** |
| `/../../Windows/win.ini` | **bloqueado** |
| `/..%2f..%2fWindows/win.ini` | **bloqueado** |

Solo afectaba al servidor local, nunca al sitio publicado. `build-site.mjs` lo hacía bien con `${repositoryDirectory}${path.sep}`; `serve.mjs` se equivocó al escribirlo.

### 4.6 Correcciones heredadas de la revisión de rutas

| Corrección | Antes | Después |
| --- | --- | --- |
| Cache-busting | El HTML pedía `?v=20260927-27` y `app.js` llevaba `previewRevision = "20260926-2"` como literal suelto | `appVersion` se **deriva** del `?v=` que ya ponen las 3 páginas. Una sola fuente de verdad |
| `robots.txt` | `Disallow: /Web/?component=` no bloqueaba nada, porque el detalle vive en `components.html` desde que la web se partió en tres páginas. Los detalles eran indexables pese a su `noindex` | `Disallow: /Web/components.html?component=` |
| `robots.txt` | `Disallow: /.github-pages-site/` — ruta que no se publica en ningún hosting | eliminada |
| Código muerto | `applyCategoryFromUrl()` leía un `?category=` que nada generaba | función y llamada eliminadas |

### 4.7 Documentación y limpieza

- `README.md` y `Web/README.md`: estructura, sección *Despliegue* (Vercel como único destino, GitHub Pages y Netlify marcados como no usados), sección nueva *Validación continua*, y cifras actualizadas.
- `THIRD_PARTY_NOTICES.md`: se eliminó la recomendación de `build-site.mjs` y se documenta que el sitio se despliega en Vercel sirviendo la raíz y que **no existe artefacto de publicación alternativo**, precisamente para que no se publiquen por error componentes sin permiso de redistribución.
- `CHANGELOG.md`: entrada nueva al principio, con el formato de Keep a Changelog que ya usa el repositorio.
- `.gitignore` y `.vercelignore`: fuera las reglas de `.github-pages-*`, que solo existían para el artefacto eliminado.

---

## 5. El problema abierto: el catálogo hay que regenerarlo a mano

Este era el punto que más afectaba al trabajo diario.

`catalog.json` y los ficheros de `sources/` son **artefactos generados** que estaban versionados. Cualquier demo nuevo no aparecía hasta que alguien recordaba ejecutar:

```powershell
node Web/scripts/generate-catalog.mjs
```

`validate.mjs` y el CI avisaban cuando se olvidaba, pero seguían siendo un paso manual. Con creación continua de componentes —109 ya solo en `creaciones-primium/`— ese paso se iba a repetir muchas veces.

### Opciones consideradas

| Opción | Cómo funciona | Ventaja | Inconveniente |
| --- | --- | --- | --- |
| **A. Generar en el build de Vercel** | `"buildCommand": "node Web/scripts/generate-catalog.mjs"` | **Cero pasos manuales.** El catálogo siempre cuadra por construcción. Da igual quién añada los demos | `buildCommand` pasa a ser obligatorio; si el generador falla, el despliegue falla, lo cual es correcto |
| B. Auto-commit desde CI | Un paso con `contents: write` que ejecute el generador y commitee si cambió | El repositorio se autosincroniza sin tocar Vercel | Commits de bot en `main`; si otro agent empuja a la vez, el push puede rechazarse y el job queda rojo |
| C. Hook local | `pre-commit` que regenere el catálogo | Falla antes de commitear, no después | Solo funciona en las máquinas donde se instale; un agent que no lo ejecute lo ignora |
| D. Modo watch | `node Web/scripts/generate-catalog.mjs --watch` | Mientras trabajas, el catálogo se actualiza solo | Hay que acordarse de lanzarlo en una terminal aparte |

### Decisión: A, aplicada

Se implementó la **opción A**. `vercel.json` fija `"buildCommand": "node Web/scripts/generate-catalog.mjs"` y los datos generados salen de git.

Las tres implicaciones previstas se resolvieron así:

| Implicación | Resolución |
| --- | --- |
| Los datos generados ya no necesitan estar en git | `Web/data/catalog.json`, `catalog.js` y `sources/` en `.gitignore`, con `git rm --cached` |
| El `git diff` de `validate.yml` dejaba de tener sentido | Sustituido por los dos comandos reales: generar y luego validar |
| El modo `file://` usa `catalog.js` en local | Se sigue generando, solo que sin versionar |

El beneficio mayor no fue eliminar un paso manual, sino **evitar conflictos de merge**: con 473 ficheros de `sources/` versionados, dos agentes añadiendo demos a la vez chocaban en casi todos ellos. Al no estar versionados, cada commit de agente solo toca los demos que ha creado.

`.vercelignore` **no** incluye los datos generados, a propósito: si lo hiciera, el build los crearía y Vercel los eliminaría de la salida, dejando el sitio sin catálogo. Se suben (~1,6 MB) y el build los sobrescribe.

`validate.mjs` comprueba al principio que el catálogo exista. En un clon nuevo, donde no está, avisa con el comando exacto en lugar de soltar un error de Node. Probado sobre un árbol vacío: `exit=1` con el mensaje correcto.

---

## 6. Estado actual verificado

```
$ node Web/scripts/generate-catalog.mjs
Generated 473 component entries at Web\data\catalog.json and 473 source files at Web\data\sources\.

$ node Web/scripts/validate.mjs
info  473 componentes · 248 descargables · 225 sin redistribucion
Todo correcto: 473 componentes coherentes con el disco.
exit=0
```

`generate-catalog.mjs` es **idempotente**: dos ejecuciones seguidas producen el mismo resultado, 78 ficheros de `Web/data` con cambios en ambas y ninguno nuevo en la segunda.

| Comprobación | Resultado |
| --- | --- |
| `node --check` en los 6 scripts | 6 OK |
| `vercel.json`, `catalog.json`, `component-overrides.json` | JSON válido |
| `validate.yml` | YAML válido, 4 pasos, sin `configure-pages` |
| Servidor local | 200 en las 3 páginas, `catalog.json`, `robots.txt`, `og-image.png`, `assets/donate-qr.png` y previews de las 3 colecciones |
| Path traversal | 3 vectores bloqueados, rutas legítimas servidas |
| `missingReferences` | 0 |
| Componentes | 473 = 116 + 248 + 109 |

### Reparto actual

| Colección | Componentes | Descargables |
| --- | --- | --- |
| `CreacionesNuevas/` | 248 | **248** (MIT propia) |
| `GevendraAutorExterno/` | 116 | 0 (sin licencia en el repo de origen) |
| `creaciones-primium/` | 109 | 0 (sin `LICENSE` en la carpeta) |
| **Total** | **473** | **248** |

`creaciones-primium/` reparte sus 109 componentes en `botones/` (77) y `animaciones/` (32).

### Tamaño

| Métrica | Antes de la 1.ª auditoría | Ahora |
| --- | --- | --- |
| Repo sin `.git` | 39,28 MB | 32,17 MB |
| `GevendraAutorExterno/` | 32,33 MB | 22,69 MB |
| `Web/` | 3,23 MB | ~5,7 MB |
| `Web/data/catalog.js` (no se despliega) | 2,03 MB | 4,16 MB |
| `Web/data/sources/` | 379 ficheros | 473 ficheros, 1,15 MB |
| `.git` | 36,00 MB | 37,88 MB |

`Web/` creció porque `catalog.js` (4,16 MB) y `sources/` (473 ficheros) subieron con los componentes nuevos. `catalog.js` está en `.gitignore` y `.vercelignore`, así que **no forma parte del payload de despliegue**.

---

## 7. Lo que queda pendiente

1. **`.git` ocupa 37,88 MB** frente a 32,17 MB de contenido. Un `git gc --aggressive` lo reduciría, y las 93 renombradas de capitalización de la Fase 10 dejan entradas grandes en el historial. No afecta al sitio publicado, solo al disco local y al tamaño del clon.
2. **Versión de las cabeceras en `Web/*.html`**: las tres páginas llevan `?v=20260927-27`. Con la unificación de §4.6 basta cambiar ese valor en las tres cuando toque publicar cambios de `app.js`, `site.css` o `zip.js`.
3. **`Docs/Opencode/Plan.md`** contiene referencias a `build-site.mjs` y a las fases de GitHub Pages. No se tocó: es un registro histórico del plan, igual que `CHANGELOG.md`. Los documentos que describen el estado actual —`README.md`, `Web/README.md` y `THIRD_PARTY_NOTICES.md`— sí están al día.
4. **En local hay que generar el catálogo antes de abrir el sitio.** Es el precio de la opción A y solo afecta al desarrollo: `node Web/scripts/generate-catalog.mjs`. En Vercel no hay paso manual.
