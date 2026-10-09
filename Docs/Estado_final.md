# Estado final del PLAN-OPENCODE-100

Cifras reales medidas en `planning/v1.2.0-more-demos` después de aplicar las
tareas P0-1, P0-2, P0-3, P1-1, P1-2, P1-3, P1-4, P1-5 y P2-1. Las
tareas P2-2, P2-3, P2-4 y la limpieza de `davoker.html` llegan después.

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

## Resumen de la batería (al cierre de P2-1)

- `npm run validar`: 1748 ficheros coherentes en donación, CSP sin
  advertencias.
- `npm test`: 81/81.
- `npm run test:e2e`: 17/17.
- `npm run validar:demos`: 1018/1018.
- `npm run validar:layout`: 184/184 medidas.
- `npm run validar:html`: verde.
- `npm run lint`: verde.
- `npm run typecheck`: 15 errores heredados (presupuesto 38).
- `npm run format:check`: 39 ficheros en CRLF/LF (pre-existente
  en el entorno; no bloqueante, queda para P2-2).
