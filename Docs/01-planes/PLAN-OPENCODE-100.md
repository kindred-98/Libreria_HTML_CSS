# PLAN-OPENCODE-100: llevar Libreria_HTML_CSS al 100 %

Repo: `kindred-98/Libreria_HTML_CSS` · Despliegue: https://libreria-html-css.vercel.app/Web/components.html
Origen: auditoría del 2026-10-08 (código del repo + documentación propia). Estado de partida: sin vulnerabilidades bloqueantes, `npm audit` 0, Sonar A/A/A según `Docs/Sesion_2026-10-08.md`.

Este documento es una lista de tareas para un agente de código. Cada tarea tiene **archivos**, **qué hacer** y **criterio de aceptación** comprobable. Haz las tareas en orden de prioridad (P0 → P2).

---

## 0. Reglas de trabajo (obligatorias)

1. Una rama y una PR por bloque (`fix/seguridad-p0`, `perf/minificacion`, etc.). Nunca commits directos a `main`.
2. Antes de cada commit y al terminar cada tarea, ejecuta y que pasen:
   - `npm run validar` (incluye `validar-csp`)
   - `npm test` (hoy 55/55)
   - `npm run test:e2e` (hoy 17/17)
   - `npm run validar:demos` (hoy 1018/1018)
   - `npm run lint` y `npm run format:check`
   - `npm run typecheck` (no puede subir de 15 errores heredados; presupuesto actual 38)
3. No edites a mano los archivos generados (`Web/data/catalog.json`, `Web/data/sources/*`, `Web/sitemap.xml`, ZIP). Regenera con `npm run catalogo`, `npm run sellar`, `npm run zips`, `npm run sitemap`.
4. No añadas dependencias de **runtime**. Solo se permite una devDependency de build para minificar (esbuild o lightningcss).
5. No debilites ni borres tests, validadores ni presupuestos para que algo pase. Si un test falla por un cambio legítimo, explícalo en la PR.
6. No toques `CODEOWNERS`, `SECURITY.md` ni `.github/workflows/` salvo donde una tarea lo pida expresamente.
7. Cambios **visuales** (animaciones, anchos, estilos de la portada) se dejan en la PR marcados como "requiere revisión humana".
8. Cada PR describe: qué cambió, cómo se verificó y el antes/después medido.

---

## P0: Seguridad (hacer primero)

### P0-1. Blindar la dirección de donación (USDT BEP20)

**Por qué:** está en el pie de todas las páginas y es lo más valioso para un atacante con acceso de escritura.

**Archivos:** `Web/*.html` (pie de página), `Web/scripts/validate.mjs` o un script nuevo `Web/scripts/validar-donacion.mjs`, `package.json`, `.github/workflows/validate.yml`.

**Qué hacer:**
1. Localiza todas las apariciones de la dirección actual (`grep -rn "0xa8f0" --include=*.html --include=*.js --include=*.md .`). Debe aparecer solo donde se muestra y, si procede, en `README.md`.
2. Crea `Web/scripts/validar-donacion.mjs` que:
   - lea la dirección esperada de **una sola fuente** (constante en el propio script o `Web/data/donacion.json`);
   - falle si cualquier HTML/JS/MD del repo contiene una dirección `0x` de 40 hex distinta de la esperada;
   - falle si la esperada falta en alguna página donde debe estar.
3. Añade el script `"validar:donacion"` a `package.json`, inclúyelo en `npm run validar` y en `validate.yml`.
4. Añade `Web/scripts/validar-donacion.mjs` y el fichero de la dirección esperada a `.github/CODEOWNERS` (línea nueva, `@kindred-98`).
5. Añade un test unitario en `Web/scripts/__tests__/` que verifique que el validador falla con una dirección alterada.

**Aceptación:** cambiar un solo carácter de la dirección en cualquier HTML hace fallar `npm run validar` y el CI. Test unitario incluido.

### P0-2. Eliminar patrones de inyección en demos copiables

**Por qué:** la gente copia estas demos a apps reales. Hoy los datos son fijos, pero el patrón es un XSS en cuanto se use con entrada de usuario.

**Archivos (empezar por estos):**
- `CreacionesNuevas/notification-toast-system/script.js` (concatena `title` y `sub` en `innerHTML`)
- `CreacionesNuevas/color-palette-generator/script.js` (concatena `c` en `innerHTML`)
- `CreacionesNuevas/search-autocomplete-input/script.js` (`new RegExp('('+q+')','gi')` con texto del usuario + `innerHTML`)
- `creaciones-primium/navegacion/spotlight-search-overlay/script.js` (línea ~191, concatena `b.name` en `innerHTML`)
- Después, los 8 `innerHTML` restantes de `CreacionesNuevas/` y cualquier `innerHTML` no vacío de `creaciones-primium/` que concatene variables (`grep -rnE '\.innerHTML\s*=' creaciones-primium CreacionesNuevas --include=*.js`; descarta las asignaciones a `""`).

**Qué hacer:**
1. Sustituye `innerHTML` por `createElement` + `textContent` (y `append`). Si hay que resaltar coincidencias (`<mark>`), construye nodos: texto antes, `<mark>` con `textContent`, texto después.
2. En `search-autocomplete-input`: no construyas un `RegExp` desde la entrada. Usa `indexOf` sobre `toLowerCase()` o escapa con `q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`.
3. Mantén idéntico el aspecto y el comportamiento visible.
4. Añade una regla al validador (`Web/scripts/validate.mjs` o `smoke-demos.mjs`) que **falle** si aparece `innerHTML =` con concatenación (`+`) o interpolación (`${`) fuera de `vendor/`. Documenta la excepción permitida (asignación a cadena vacía o literal estático sin variables).

**Aceptación:** `grep -rnE "\.innerHTML\s*=.*(\+|\\$\{)" creaciones-primium CreacionesNuevas --include=*.js | grep -v vendor/` no devuelve nada; `npm run validar:demos` sigue en 1018/1018; la nueva regla del validador falla si reintroduces el patrón.

### P0-3. Lista blanca de tipos de archivo en demos y descargas

**Por qué:** los ZIP se construyen con los archivos que declara el catálogo; nada impide hoy que se cuele un tipo nuevo (por ejemplo un `.exe`, `.php` o `.svg` con script).

**Archivos:** `Web/scripts/generate-catalog.mjs`, `Web/scripts/validate.mjs`, `Web/scripts/build-zips.mjs`.

**Qué hacer:**
1. Define una lista blanca única compartida (por ejemplo en `Web/scripts/lib/`): `.html .css .js .mjs .json .png .jpg .jpeg .webp .svg .woff2 .txt .md` (ajusta a lo que ya existe en el repo; hoy hay html/css/js/png/jpg/svg/woff2/txt/json/md).
2. `generate-catalog.mjs` y `build-zips.mjs` deben **fallar** (exit code ≠ 0) si encuentran un archivo de demo con otra extensión, o un archivo sin extensión.
3. Para `.svg`: falla si contiene `<script`, `on*=` (atributos de evento) o `javascript:`.
4. Añade tests unitarios con un archivo `.exe`/`.php` simulado en un directorio temporal.

**Aceptación:** crear `CreacionesNuevas/x/payload.exe` hace fallar `npm run catalogo` y `npm run validar`. El estado actual del repo pasa sin cambios.

---

## P1: CSP, rendimiento e indexación

### P1-1. CSP sin `'unsafe-inline'` en las páginas de `/Web/`

**Archivos:** `vercel.json`, `Web/*.html`, `Web/scripts/validar-csp.mjs`.

**Qué hacer:**
1. Inventaría los scripts y estilos inline de `Web/*.html` (hay JSON-LD, que no ejecuta; busca `<script>` ejecutables, `onclick=`, `style="..."`).
2. Mueve el JS inline a archivos en `Web/scripts/` o, si debe seguir inline, calcula su hash SHA-256 y añádelo a `script-src` (`'sha256-...'`). Genera los hashes en el build para que no se desincronicen.
3. Crea en `vercel.json` una CSP **propia para `/Web/(.*)`** sin `'unsafe-inline'` en `script-src`. Mantén la CSP actual con `sandbox` para las demos (las demos sí necesitan inline).
4. Sustituye `img-src https://*.githubusercontent.com` por los orígenes exactos que realmente se usen (comprueba con `grep -rhoE "https://[a-z0-9.-]*githubusercontent\.com" Web`). Si no se usa ninguno en `/Web/`, quítalo de esa CSP.
5. Si Google Tag Manager exige `'unsafe-inline'`, no lo aceptes por defecto: usa hash o nonce estático; si no es viable, documenta la decisión en `Docs/` y deja GTM solo tras el consentimiento ya existente.
6. Actualiza `validar-csp.mjs` para que verifique que `/Web/` no tiene `unsafe-inline` en `script-src`.

**Aceptación:** `npm run validar:csp` pasa; con un navegador (Playwright) las seis páginas de `/Web/` cargan sin errores de CSP en consola; `npm run test:e2e` 17/17.

### P1-2. Minificar JS y CSS en el build

**Archivos:** `package.json`, `vercel.json` (`buildCommand`), `Web/scripts/stamp-assets.mjs`, `Web/scripts/app.js`, `Web/scripts/zip.js`, `Web/styles/site.css`, `Web/styles/team-core.css`, `DavokerDiseñador/transicion.css`.

**Qué hacer:**
1. Añade `esbuild` como devDependency fijada a versión exacta.
2. Crea `Web/scripts/minificar.mjs` que genere versiones minificadas **solo en el build de Vercel** (no sobrescribas los fuentes del repo). Mantén los nombres de fichero que usan los HTML o actualiza `stamp-assets.mjs` para que el `?v=hash` se calcule sobre el archivo minificado.
3. Inserta el paso en `buildCommand` de `vercel.json` antes de `stamp-assets`.
4. Minifica también `DavokerDiseñador/transicion.css` y `davoker.html` (CSS/JS inline) si la comprobación de `validar:demos` sigue pasando; si no, deja constancia.
5. Mide **antes y después** (bytes en bruto y con brotli) y pon la tabla en la PR. No afirmes mejoras sin esa tabla.

**Aceptación:** tabla antes/después en la PR; `npm run test:e2e` y `npm run validar:demos` siguen verdes; los `?v=` de los HTML cambian de forma coherente.

### P1-3. Precarga de fuentes y arranque más rápido

**Archivos:** `Web/index.html`, `Web/components.html` y el resto de páginas de `/Web/`.

**Qué hacer:**
1. Añade `<link rel="preload" as="font" type="font/woff2" crossorigin>` para las fuentes que se usan en el primer pintado (identifica cuáles con una traza de Lighthouse o el panel Network; probablemente `manrope-latin.woff2`). No precargues las que no se usan arriba del pliegue.
2. Confirma `font-display: swap` en las `@font-face`.
3. Comprueba que no hay recursos que bloqueen el render aparte del CSS principal.

**Aceptación:** Lighthouse móvil de la portada ≥ 88 en dos pasadas (hoy 84-87). Anota las cifras reales.

### P1-4. Contenido inicial del catálogo sin depender de JavaScript

**Por qué:** el HTML servido de `components.html` solo dice "Loading collection...". Afecta al LCP y a cómo indexan los buscadores.

**Archivos:** `Web/scripts/generate-catalog.mjs`, `Web/components.html`, `Web/index.html`, `Web/scripts/app.js`.

**Qué hacer:**
1. En el build, inyecta en el HTML un bloque estático con la primera página del catálogo (los mismos elementos que `renderComponents()` pinta primero: título, categoría, enlace al detalle), dentro de un contenedor que `app.js` reemplace al hidratar.
2. `app.js` no debe duplicar tarjetas: al arrancar vacía el contenedor y renderiza como hoy.
3. No uses iframes en el contenido estático. Los iframes siguen montándose diferidos.
4. Si el cambio es grande, déjalo en una PR aparte y no mezcles con P1-2.

**Aceptación:** `curl -s .../components.html` contiene enlaces reales a componentes; sin JS la página muestra contenido; `npm run test:e2e` 17/17; Lighthouse SEO sigue en 100.

### P1-5. Carrusel de portada

**Archivos:** `Web/scripts/app.js` (`renderFeaturedComponents`, `montarPreview`).

**Qué hacer:** reducir el coste de los 33 iframes sin cambiar el aspecto: montar solo los visibles y los siguientes 2-3, y desmontar los que salen de la zona de observación. Mantén el `sandbox` actual de los iframes y no añadas `allow-same-origin`.

**Aceptación:** número de iframes simultáneos en el DOM ≤ 8 en la portada tras 5 s sin interacción; sin regresión en `validar:layout`; TBT medido antes/después en la PR.

---

## P2: Limpieza y cierre

### P2-1. Coherencia documental
- `SECURITY.md` dice que no hay releases numeradas, pero `README.md`/`CHANGELOG.md` anuncian la v1.0.0. Corrige `SECURITY.md` (tabla de versiones con soporte: `main` y `v1.0.x`). Es el único cambio permitido en ese archivo.
- Añade a `Docs/` un `Estado_final.md` con las cifras reales de antes/después de cada tarea.

### P2-2. Sonar y tipos
- Resuelve los 4 code smells abiertos de la rama `fix/sonar-issues-after-merge` y confirma el análisis en `main`.
- Reduce `typecheck` de 15 errores heredados a 0 si es viable sin cambios de comportamiento; si no, baja el presupuesto de 38 a 15 para que no pueda empeorar.

### P2-3. Licencias (comprobación automática, no asesoría legal)
- Script `Web/scripts/validar-licencias.mjs`: cada carpeta de demo debe tener `LICENSE`, y su autor/licencia debe aparecer en `Docs/THIRD_PARTY_NOTICES.md` o en el catálogo. Falla si falta alguno.
- Lista en `Docs/` las demos cuya licencia no permita uso comercial o redistribución, para que una persona las revise antes de monetizar nada.

### P2-4. Presupuesto de rendimiento
- Cuando P1 esté cumplido, sube el umbral móvil de `validar:lighthouse:movil` de 80 al valor que dejen las mediciones menos 5 puntos (regla del propio repo: el presupuesto va por debajo del valor actual).

---

## P3: Fixes de `davoker.html` (añadidos tras el plan)

Tres bugs duros diagnosticados por otra sesión de agente en
`DavokerDiseñador/davoker.html`. Aprobados para esta misma rama.
Ver cifras en `Docs/Estado_final.md` § Davoker.

### P3-1. Fix A — índice aleatorio entero ✅
Sorteo `arr[(Math.random() * Math.trunc(n))]` daba float → casi siempre
`undefined` (colores blancos + `TypeError` en `paleta[0]` de
`fuegos_artificiales`). Sustituido por el helper `eleccion(lista)` con
`Math.floor` en ambos IIFEs (31 ocurrencias). El `k` de paralaje de las
estrellas se deja con float a propósito.

### P3-2. Fix B — el bucle rAF sobrevive a excepciones ✅
`avanza()` drenaba `KL` después de ejecutar los callbacks y `bucle` no
reprogramaba rAF hasta el final: una excepción mataba el bucle para
siempre (partículas clavadas en su tope). Ahora: drenado previo,
`try/catch` por callback y por `p.fn`, y `requestAnimationFrame` primero.

### P3-3. Fix C — fondo viewport + debounce + pausa ✅
`#fondo-espacio` era `absolute` a la altura del documento y nunca se
encogía (hasta 273 MB/canvas; `cielo()` síncrono 162 ms–2.8 s en cada
resize del `ResizeObserver` de body). Ahora: `position: fixed` a la
ventana, resize/ResizeObserver con debounce de 150 ms, y ambos bucles
rAF en pausa con `document.hidden` (repintado al volver).

---

## P4: CI verde en la PR #22 (añadido tras abrir la PR)

Dos comprobaciones de CI bloqueaban el merge de la PR #22:
`validar:lighthouse:movil` (CLS de `componentes`) y el Quality Gate
de SonarCloud sobre New Code.

### P4-1. CLS de `componentes` (0.066 > 0.05) ✅

Causa raíz (no era ruido): los `fieldset` de filtros del HTML
estático estaban **vacíos** y `app.js` los rellenaba al llegar
`catalog.json`, después del primer pintado: +142 px (32 de autor +
110 de categoría) que movían la rejilla 154 px hacia abajo
(medido: y=436 estático → y=590 hidratado). `generate-catalog.mjs`
ahora inyecta los chips de filtro en build, entre los marcadores
`<!-- build:filters:authors -->` y `<!-- build:filters:categories -->`,
con las etiquetas en español (idioma por defecto) y el mismo markup
que `renderFilters`/`renderAuthorFilters`; al hidratar la sustitución
es geométricamente idéntica y no salta. La paridad estática↔runtime
la garantiza el nuevo test e2e "los filtros estáticos del build
coinciden con los que pinta app.js". CLS de `componentes`: **0.066 →
0** (3 corridas locales de Lighthouse móvil), rendimiento 95 → 96-97.

### P4-2. Quality Gate de SonarCloud (Reliability D, Security C) ✅

- **S2871** (BUG CRITICAL, único bug de New Code): `.sort()` sin
  comparador en `validar-licencias.mjs`. Arreglado de verdad con
  `localeCompare` por clave.
- **S2245** ×5 (VULNERABILITY MAJOR, las 5 vulnerabilidades de New
  Code): `Math.random` en las líneas de `davoker.html` tocadas por
  P3-1/P3-3. Es aleatoriedad visual de una animación, sin valor
  criptográfico. **El `// NOSONAR` no surtió efecto para S2245
  cuando el `Math.random` vive dentro de un `<script>` de un
  `.html`**: se intentó en primer lugar (formato idéntico al que
  funciona para S9382 en `.mjs`) y los 5 issues seguían abiertos
  tras el análisis posterior al push. Se cerraron vía SonarCloud
  UI (`Mark as Won't fix` con el motivo), y se quitaron los 5
  `// NOSONAR (S2245)` del fichero. La regla general es: para
  S2245 en JS embebido en HTML, **no usar `NOSONAR`**; usar la
  transición `wontfix` con motivo. Detalle en
  `Docs/03-sonar/Sonar_decisiones.md` § "Quality Gate de la PR 22
  (2026-10-09)".

---

## Definición de terminado (100 %)

- [x] P0-1, P0-2 y P0-3 fusionadas, con tests.
- [x] `/Web/` sin `'unsafe-inline'` en `script-src`, `validar:csp` verde.
- [x] JS/CSS minificados en el build, con tabla antes/después.
- [x] Contenido del catálogo visible sin JavaScript.
- [x] Lighthouse móvil: portada ≥ 90 (97/94 en dos pasadas; 96-100 después) y resto ≥ 95 con una excepción: `componentes` bajó a 94 en el peor de 30 mediciones (ruido de CLS ya documentado; presupuesto fijado en 89 según la regla de P2-4). Escritorio se mantiene en 100/100/100/100. El CLS intermitente de `componentes` (0.066) se corrigió de raíz en P4-1: ahora CLS 0.
- [x] `npm test`, `test:e2e`, `validar`, `validar:demos` (1018/1018), lint y formato en verde (`format:check` falla en local por `core.autocrlf`, preexistente y documentado en `Docs/Estado_final.md`).
- [ ] SonarCloud: 0 bugs, 0 vulnerabilidades, 0 hotspots abiertos (los 4 code smells de la rama están cerrados en `main`; el Quality Gate de la PR #22 se arregló en P4-2 con el comparador de `validar-licencias.mjs` y 5 NOSONAR en `davoker.html`; confirmar el análisis en la plataforma requiere acceso a SonarCloud tras el re-análisis).
- [x] `SECURITY.md` y documentación coherentes con la release v1.0.0.
- [x] P3-1, P3-2 y P3-3 (fixes de `davoker.html`) aplicados y verificados.
- [x] P4-1 y P4-2 (CI de la PR #22: CLS de `componentes` y Quality Gate de SonarCloud) aplicados y verificados.

## Fuera de alcance (no hacer)

- No cambiar la licencia, el texto legal ni la política de privacidad.
- No cambiar la dirección de donación ni otros datos de identidad del proyecto.
- No reescribir demos por estética ni cambiar su diseño.
- No introducir frameworks ni dependencias de runtime.
