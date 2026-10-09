# Estado final del PLAN-OPENCODE-100

Cifras reales medidas en `planning/v1.2.0-more-demos` después de aplicar las
tareas P0-1, P0-2, P0-3, P1-1, P1-2, P1-3, P1-4, P1-5, P2-1, P2-2,
P2-3 y P2-4, más los 3 fixes de `davoker.html` (P3-1, P3-2 y P3-3
del plan) aplicados en los commits `1e6f2ab`, `255276b` y `61a6a57`.

## P0-1. Dirección de donación

- Fuente única: `Web/data/donacion.json` (1 fichero).
- Aparece en código de producción en 5 sitios: `app.js` (clave i18n en
  español e inglés), `index.html`, `components.html`, `team-core.html`.
- `validar:donacion` barre **1748 ficheros** del repo y exige que la
  dirección esperada sea la misma en todos; falla con `exit 1` si un
  solo carácter cambia. Test unitario (`donacion.test.mjs`) cubre el
  caso de dirección alterada y dirección ilegible.

## P0-2. Inyección en demos

- Demos tocados: 10 (`CreacionesNuevas/color-palette-generator`,
  `CreacionesNuevas/notification-toast-system`,
  `CreacionesNuevas/search-autocomplete-input`,
  `creaciones-primium/animaciones/mobius-infinity-loop`,
  `creaciones-primium/animaciones/watercolor-bleed-bloom`,
  `creaciones-primium/botones/marquee-ticker-button`,
  `creaciones-primium/botones/shockwave-ring-button`,
  `creaciones-primium/galerias/facade-vitrine`,
  `creaciones-primium/galerias/winter-studio`,
  `creaciones-primium/navegacion/spotlight-search-overlay`).
- `innerHTML` con concatenación o `${}` fuera de `vendor/` en las
  carpetas `CreacionesNuevas/` y `creaciones-primium/`: **0** después
  de la tarea (verificado con `grep -rnE "\.innerHTML\s*=.*(\+|\$\{)"`).
- Regla nueva en `validate.mjs` (§10) que falla si vuelve a aparecer.

## P0-3. Lista blanca de extensiones

- Lista: 12 extensiones permitidas más `LICENSE`/`LICENSE-*` sin
  extensión (`extensiones.mjs`).
- Ficheros con extensiones fuera de la lista en las raíces de demos:
  **0**.
- `validar-extensiones.mjs` se ejecuta desde `generate-catalog.mjs`,
  `validate.mjs` y `build-zips.mjs`. Crea `CreacionesNuevas/x/payload.exe`
  → `npm run catalogo` y `npm run validar` devuelven `exit 1`. Test
  unitario (`extensiones.test.mjs`) cubre el caso.

## P1-1. CSP sin `'unsafe-inline'` en `/Web/`

- `vercel.json`: bloque nuevo `source: "/Web/(.*)"` con `script-src 'self'
  https://www.googletagmanager.com`, sin `'unsafe-inline'`. El bloque
  global mantiene `'unsafe-inline'` y `sandbox` para los demos
  (necesario).
- `img-src` cambiado de `https://*.githubusercontent.com` a
  `https://avatars.githubusercontent.com` (único origen usado en
  `Web/`).
- `validar-csp.mjs` añade la comprobación: si el bloque `/Web/(.*)`
  contiene `'unsafe-inline'` en `script-src` o `sandbox` → `exit 1`.
- Verificación en navegador con Playwright: las 6 páginas de `/Web/`
  cargan sin errores de CSP en consola. `npm run test:e2e` 17/17.

## P1-2. Minificación

Tabla cruda / brotli (medido con `zlib.brotliCompressSync` a calidad 11):

| Fichero | Crudo antes | Crudo después | Brotli antes | Brotli después |
|---|--:|--:|--:|--:|
| `Web/scripts/app.js` | 110 495 | 67 785 | 29 238 | 18 654 |
| `Web/scripts/zip.js` | 4 674 | 2 715 | 1 186 | 973 |
| `Web/styles/site.css` | 61 188 | 34 481 | 13 755 | 6 957 |
| `Web/styles/team-core.css` | 13 619 | 6 801 | 3 694 | 1 621 |
| `DavokerDiseñador/transicion.css` | 236 102 | 158 670 | 30 555 | 25 707 |
| **Total** | **426 078** | **270 452** | **78 428** | **53 912** |

- Reducción: **-36,5 % en crudo, -31,3 % con brotli**.
- `?v=` de los HTML recalculado por `stamp-assets.mjs` sobre el
  contenido minificado: `app.js` `e8ab702b` → `765d1d8f`,
  `site.css` `8c0c1494` → `8dee9084`, `zip.js` `a138f906` → `63307334`.
- Solo en el build de Vercel (`VERCEL=1` o `--force`); en local no
  toca los fuentes.

## P1-3. Preload de fuentes

- `<link rel="preload" href="./assets/fonts/manrope-latin.woff2" as="font"
  type="font/woff2" crossorigin>` en las 6 páginas de `/Web/`.
- `font-display: swap` ya estaba en las 6 `@font-face` (DM Mono 400/500
  latin + latin-ext, Manrope 200-800 latin + latin-ext).
- Lighthouse móvil de la portada tras la tarea (1 pasada):
  **rendimiento 100, LCP 2,4 s, TBT 10 ms, CLS 0**.

## P1-4. Catálogo visible sin JavaScript

- `generate-catalog.mjs` inyecta en `components.html` la primera página
  del catálogo (9 tarjetas) dentro de `<div id="component-grid">`,
  entre los marcadores `<!-- build:catalog -->` y `<!-- /build:catalog -->`.
  La operación es idempotente.
- `curl -s .../components.html` contiene 9 `<a class="card-link"
  href="./components.html?component=...">` reales.
- Regresión detectada: `componentes` intermitentemente superaba
  `CLS 0,05` (entre 0,066 y 0,075) por el cambio de altura de
  `#results-count` entre "Cargando colección..." (1 línea) y el
  conteo final (2 líneas). Arreglado en el commit `0ed260d` con
  `min-height: 30px` en `.results-count`. Verificado con
  `PerformanceObserver`: `CLS total: 0.0000`.
- Lighthouse desktop de las 5 páginas tras la tarea: **SEO 100** en
  todas.

## P1-5. Carrusel de portada

- Iframes simultáneos en la portada tras 5 s sin interacción
  (medido en local con Playwright 412×915 dpr 2): **2** (el visible
  y el siguiente dentro del `rootMargin 400px`), frente a los 33
  previos.
- Límite del plan: ≤ 8. Cumplido.
- `validar:layout` verde (184 medidas, 8 páginas × 23 anchos).
- Lighthouse móvil de la portada tras la tarea (2 pasadas): 96
  (TBT 120 ms, CLS 0) y 98 (TBT 40 ms, CLS 0,014). La variabilidad
  de TBT cae dentro del ruido medido en P1-3 (10-190 ms entre
  pasadas), no es regresión del cambio.
- `componentes` mostró un `CLS 0,066` en 1 de 2 pasadas: coincide
  con la varianza intermitente ya observada antes del fix de altura
  de P1-4; no introduce un nuevo movimiento de layout.

## P2-1. Coherencia documental

- `SECURITY.md` actualizado: la tabla de versiones con soporte
  reconoce `main` y `v1.0.x`; se reescribe el párrafo siguiente
  para que no contradiga a `README.md` y `CHANGELOG.md`. Único
  cambio permitido en ese fichero según el plan.
- Este documento.

## P2-2. Sonar y tipos

- Los 4 code smells abiertos de la rama `fix/sonar-issues-after-merge`
  ya están cerrados en `main` (PR #20 + #21 merge, commits
  `d03d226` y `d409dca`). Esta tarea los verificó y los dio por
  resueltos: `validar` y la batería no introducen nuevos.
- `validar-tipos.mjs` (que hace de `tsc --checkJs` sobre
  `Web/scripts/**`) detecta 15 errores heredados en código que ya
  funcionaba. El plan dice: "reduce a 0 si es viable sin cambios de
  comportamiento; si no, baja el presupuesto de 38 a 15". Tocar el
  código heredado sería un PR de tipos de gran alcance, así que se
  baja el presupuesto a 15 para que no pueda empeorar: la regla
  del script ya es que cada error arreglado baja el presupuesto, y
  un error nuevo lo supera y falla el CI con el mensaje "por encima
  del presupuesto".

## P2-3. Licencias

- `Web/scripts/validar-licencias.mjs` nuevo: verifica que cada raíz
  de demos lleva su `LICENSE` (CreacionesNuevas por demo, las
  otras dos en la raíz) y que las licencias declaradas en
  `Web/data/sources/*.json` están mencionadas en
  `Docs/THIRD_PARTY_NOTICES.md`. Cableado como
  `npm run validar:licencias`.
- `Docs/Demos_con_restricciones.md` nuevo: inventario de los
  componentes con una `license` distinta de MIT. Hoy, con la
  colección actual, **0 componentes con una licencia distinta de
  MIT** — los 1018 declaran MIT. Los 770 con `downloadable: false`
  no son restricciones de licencia, son técnicas (LICENSE ausente
  en el demo, source unverified, missingReferences) y `npm run
  validar` ya las cuenta como aviso.
- Las únicas restricciones adicionales del proyecto son las de las
  676 fotos de `creaciones-primium/galerias/` (CC-BY-SA 3.0, CC-BY-SA
  4.0, CC0, GFDL 1.2, etc.), documentadas en la sección
  "Fotografías de las galerías (Wikimedia Commons)" de
  `Docs/THIRD_PARTY_NOTICES.md`.

## P2-4. Presupuesto de rendimiento

- `validar-lighthouse-movil.mjs`: `UMBRAL_RENDIMIENTO` sube de 85 a
  **89** según la regla del plan ("el valor que dejen las mediciones
  menos 5 puntos"). 30 mediciones de rendimiento (5 corridas × 6
  páginas) tras los cambios de P1 dieron un peor caso de 94 en
  `componentes`; 94 − 5 = 89. El presupuesto deja ~6 puntos de margen
  sobre la peor observada para absorver la variabilidad normal de
  Lighthouse en headless.
- El umbral de CLS sigue en 0.05. En 2 de las 30 mediciones de
  verificación, `componentes` mostró CLS 0.066, que superaba el
  presupuesto. Aquí se atribuyó a "variabilidad intermitente" (P1-4
  y P1-5), pero tenía causa raíz y se corrigió después, en el
  commit de CI de la PR #22: ver § P4. CLS tras ese fix: 0 en tres
  corridas locales de Lighthouse móvil.

## Davoker (P3-1, P3-2 y P3-3)

### P3-1. Fix A — índice aleatorio entero

- 31 sorteos corregidos en `DavokerDiseñador/davoker.html`: 22
  literales inline `["#a","#b"][...]`, 5 accesos a `cols`, y 1 cada
  uno de `paletas`, `frases`, `g` y `"01".charAt(...)`.
- Helper `eleccion(lista)` con `Math.floor(Math.random() * n)`
  declarado en los dos IIFEs (fondo y efectos).
- Único `Math.trunc` que queda (comprobado con grep): el `k` de
  paralaje de las estrellas, float intencionado y documentado en el
  comentario del helper.
- Verificación (Playwright): 60 disparos sin excepciones; `activas`
  decae 79 → 57 → 38 → 10 → 0; fondo con **0 % de píxeles blancos
  puros** (con el bug salían todas las estrellas en blanco); 0
  `pageerror`.

### P3-2. Fix B — el bucle rAF sobrevive a excepciones

- `avanza()`: la cola `KL` se drena **antes** de ejecutar los
  callbacks (antes se reasignaba después, así que una excepción
  perdía el vaciado), con `try/catch` por callback y por `p.fn`.
- `bucle`: `requestAnimationFrame` se reprograma **primero** y
  `avanza`/`pinta` van dentro de `try/catch`.
- Verificación: 60 disparos sin excepciones con decaimiento normal;
  además se parcheó `CanvasRenderingContext2D.fill` para lanzar
  excepciones reales en `pinta()`: **80 excepciones inyectadas y el
  bucle siguió vivo** (288 → 94 → 0 partículas tras restaurar).

### P3-3. Fix C — fondo viewport, debounce y pausa

- `#fondo-espacio`: `position: absolute` + alto del documento →
  `position: fixed; inset: 0` (viewport). `medir()` pasa de
  `max(innerHeight, scrollHeight)` a `innerHeight`.
- Buffer del canvas: **68 MB y creciente** (no se encogía: al cerrar
  todo seguía en 12408 px de alto) → **4,9 MB fijo** en 900 px.
- `cielo()` en cada resize sin control → `resize` y
  `ResizeObserver` agrupados con debounce de 150 ms.
- Ambos bucles rAF en pausa con `document.hidden` y repintado al
  volver (`visibilitychange`, reset del `dt`).
- Verificación: abrir y cerrar todas las carpetas del índice
  mantiene el fondo en 900 px; 50 clics sin que muera el bucle de
  efectos; 0 `pageerror`; capturas arriba y al pie sin costura
  visible (el color de `body` coincide con el cielo).
- **Cambio visual: requiere revisión humana** (el cielo ya no se
  desplaza con el scroll; queda fijo en la ventana).

## P4. CI de la PR #22 (CLS y Quality Gate)

Al abrir la PR #22 dos comprobaciones quedaron en rojo.

### P4-1. CLS de `componentes`: 0.066 → 0

- **Causa raíz** (no era ruido intermitente, como se creía en P1-4
  y P1-5): los `fieldset#author-filters` y `fieldset#category-filters`
  del HTML estático estaban vacíos; `app.js` los rellenaba con los
  chips al cargar `catalog.json`, después del primer pintado. Medido
  con y sin JavaScript a 412 px: los fieldsets pasaban de 0 a
  **32 + 110 px** y la rejilla se movía de y=436 a y=590
  (**+154 px**), justo el shift de 0.066 que veía Lighthouse
  (`layout-shifts`: un único evento en `#component-grid`).
- **Fix**: `generate-catalog.mjs` inyecta los chips de filtro en
  build entre los marcadores `<!-- build:filters:authors -->` y
  `<!-- build:filters:categories -->`, con las etiquetas en español
  (idioma por defecto del sitio), el mismo orden (`localeCompare`,
  igual que `getCategories`/`getAuthors`), las mismas clases (incluidas
  las animaciones `filter-button--liquid/datamosh/pulse`) y el mismo
  `aria-pressed` inicial (`Todas` activa, ningún autor). Al hidratar,
  `renderFilters`/`renderAuthorFilters` sustituyen el bloque por
  botones geométricamente idénticos: no hay movimiento.
- **Guard**: nuevo test e2e "componentes: los filtros estáticos del
  build coinciden con los que pinta app.js" (lee los chips con
  JavaScript desactivado y los compara con los hidratados: texto,
  clase, `aria-pressed` y `type`). Si las etiquetas de
  `translations.es` de `app.js` cambian sin cambiarlas en el build,
  el test falla en CI.
- **Medición**: CLS de `componentes` con Lighthouse móvil: **0 en 3
  corridas locales** (antes 0.066 reproducido en la misma sonda);
  rendimiento 95 → 96-97.

### P4-2. Quality Gate de SonarCloud (New Code: Reliability D, Security C)

- **1 BUG**: `javascript:S2871` (CRITICAL) en
  `validar-licencias.mjs:138`, `.sort()` sin función comparadora
  sobre las entradas del `Map`. Arreglado con
  `localeCompare` por clave.
- **5 VULNERABILIDADES**: `javascript:S2245` (MAJOR) en las cinco
  líneas con `Math.random` tocadas por P3-1/P3-3 en
  `davoker.html` (2 helpers `eleccion`, el `k` de paralaje, la `y`
  de las fugaces y el `charAt` de los destellos). Aleatoriedad
  visual de una animación, sin valor criptográfico. **El
  `// NOSONAR` no funcionó en este caso** (el JS vive dentro de
  un `<script>` de un `.html`; la supresión `NOSONAR` no se
  propaga al informe del analizador JS/TS para S2245). Se
  cerraron vía **SonarCloud UI → Mark as Won't fix** con el motivo
  en el comentario, y se quitaron los 5 `// NOSONAR (S2245)` del
  fichero. Detalle y por qué en
  `Docs/03-sonar/Sonar_decisiones.md` § "Quality Gate de la PR 22
  (2026-10-09)".
- Los 26 code smells de New Code no bloquean: el Quality Gate solo
  exigía Reliability y Security ≥ A sobre New Code.

## Resumen de la batería (al cierre de P4)

- `npm run validar`: 1753 ficheros coherentes en donación, CSP sin
  advertencias.
- `npm run validar:licencias`: 0 componentes con licencia distinta
  de MIT; las tres raíces tienen su `LICENSE` esperado.
- `npm test`: 81/81.
- `npm run test:e2e`: 18/18 (el décimo octavo es el test de paridad
  de filtros estáticos↔hidratados de P4-1).
- `npm run validar:demos`: 1018/1018.
- `npm run validar:layout`: 184/184 medidas.
- `npm run validar:html`: verde.
- `npm run validar:a11y`: sin violaciones serious ni critical en
  24 pasadas (12 reglas avisadas, preexistentes).
- `npm run validar:lighthouse:movil` tras P4: 3 corridas completas;
  `componentes` con **CLS 0** en todas (antes 0.066 reproducido de
  forma estable) y las 6 páginas dentro de presupuesto en 2 de las 3
  corridas. En la restante, `team core` marcó CLS 0.052 (umbral
  0.05): es una página que P4 no toca, estable en 0.013-0.016 en 8
  mediciones sueltas, y su pico puntual queda aquí registrado por si
  vuelve a salir en CI.
- `npm run validar:lighthouse` (desktop): 6/6 páginas por encima del
  umbral en las 4 categorías (100/99/100/100/100/100).
- `npm run lint`: verde.
- `npm run typecheck`: 15 errores heredados (presupuesto 15,
  bajado de 38 en P2-2).
- `npm run format:check`: 39 ficheros en CRLF/LF (pre-existente
  en el entorno; no bloqueante en CI, donde los ficheros llegan en
  LF: los ficheros tocados por P4 pasan `prettier --check` con
  contenido LF).
