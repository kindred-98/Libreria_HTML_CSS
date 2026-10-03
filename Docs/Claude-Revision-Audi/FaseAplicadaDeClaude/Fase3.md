# Fase 3 aplicada — test de humo de los 1 018 demos

**Fecha:** 2026-10-03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), §Fase 3 ·
**Alcance:** 3.1 script + 3.2 línea base + 3.3 CI · **Estado: cerrada**

La Fase 3 **no arregla nada: solo mide**. Hasta ahora las validaciones
(`validate.mjs`, `validar-csp.mjs`, `validar-layout.mjs`) miraban ficheros,
cabeceras y el ancho de las páginas sin abrir ni un demo; un demo que
revienta en runtime no hacía fallar ninguna de ellas. Este es el paso que abre
los 1 018 y cuenta lo que pasa.

Todo entró en **un solo commit, `28704f3`**, todavía en `Update`.

---

## 1. Qué se hizo

| Punto | Commit | Qué cambió |
|---|---|---|
| 3.1 | `28704f3` | `Web/scripts/smoke-demos.mjs` + `npm run validar:demos` |
| 3.2 | `28704f3` | `Web/data/smoke-baseline.json` (versionada) y `smoke-report.json` al `.gitignore` |
| 3.3 | `28704f3` | paso «Abrir los demos (test de humo)» en el job de Node 24 de `validate.yml` |

**Alcance: 6 ficheros, 459 líneas añadidas.**

```text
 .github/workflows/validate.yml |  11 ++
 .gitignore                     |   4 +
 CHANGELOG.md                   |  34 +++
 Web/data/smoke-baseline.json   |  17 ++
 Web/scripts/smoke-demos.mjs    | 392 +++++++++++++++++++++++++
 package.json                   |   1 +
 6 files changed, 459 insertions(+)
```

### 3.1 Cómo se abre cada demo

Por cada entrada del catálogo:

1. Se levanta `Web/scripts/serve.mjs` en un **puerto libre** (no uno fijo: en
   local casi siempre hay ya un servidor corriendo y tropezar con él daría un
   error que no tiene nada que ver con los demos).
2. Se navega a **`/404.html`** y se limpia su `<body>` para dejar ahí un solo
   `<iframe>` con `sandbox="allow-scripts allow-forms allow-popups"`, **el
   mismo que escribe `app.js` en producción**, sin `allow-same-origin`.
3. El `src` del iframe es el demo, con `load` + 1 s de espera, y **concurrencia
   de 6** páginas.

**Por qué `404.html` y no la portada.** El plan solo pide «una página que
contenga un iframe», pero hay dos condiciones que no estaban escritas:

- El demo lleva `frame-ancestors 'self'` en su CSP, así que **el iframe solo
  se puede montar desde una página de este mismo origen**. Una `about:blank`
  o un `setContent` la rompería.
- Esa página no debe tener JS que se ejecute mientras tanto. La portada
  (`/Web/`) no vale: `app.js` construye su propia rejilla de previews y
  **contaminaba cada demo con los `ERR_ABORTED` de los suyos**. `404.html` es
  la única cuyo guion es sincrono, no tiene timers ni pide nada por red, y no
  vuelve a ejecutarse cuando se vacía el cuerpo.

- El cuerpo **se limpia también al terminar cada demo**, todavía con el demo
  atribuido, para que las peticiones que queden en vuelo se anoten contra él
  y no se cuelen en el siguiente.

**Todo lo externo se corta** con `page.route` antes de tocar la red y se anota
aparte como `externo` por host: así el resultado es el mismo con el wifi caído
y no depende de lo que esté sirviendo Wikimedia hoy.

### 3.2 Línea base y por qué se normalizan los mensajes

`Web/data/smoke-baseline.json` **sí se versiona**; `smoke-report.json` no (va
al `.gitignore`). La comparación usa la clave triple `id + tipo + mensaje`, y
sin normalizar se volvía ruido puro en las primeras pruebas. Tres tipos de
variación que hay que quitar antes de comparar:

| Qué varía | Por qué | Se quita con |
|---|---|---|
| El puerto | es libre y distinto en cada arranque | `http://127.0.0.1:NNNN` → `<origen>` |
| `?previewRevision=...` | lo pone el catálogo y cambia con cada `npm run catalogo` | query eliminada de la URL |
| Coordenadas y milisegundos dentro del mensaje de consola | el motor escribe valores de runtime **y además elide el mensaje por el medio**, de modo que la cola cambia en cada frame | dígitos → `#` y recorte a 40 caracteres |

El recorte solo afecta a `consola` y `excepcion`, nunca a `fallida` ni a
`http400`: en esos dos el estado HTTP y el path sí son diagnóstico y hay que
conservarlos enteros.

En el informe se guarda **el texto original** y la normalización se vuelve a
aplicar al comparar, así que el informe sigue siendo legible.

### 3.3 CI

Paso nuevo en `validate.yml`, **solo en el job de Node 24**, justo después de
`validar:layout` y reutilizando el Chromium que ese paso ya instaló (instalarlo
tres veces, una por versión de Node, no tendría sentido). El plan contemplaba
`--muestra 60` si superaba los 10 minutos: **no hace falta, tarda 3 min 22 s**,
así que corre completa también en los PR.

---

## 2. Los datos de la primera pasada

```text
1018 demos · 3 con fallos · 1015 sin ninguno
por tipo: excepcion=2 · consola=1
demos con peticiones externas: 85 (hosts: upload.wikimedia.org)
tiempo: 202 s (3 min 22 s)
```

**El umbral de parada del plan son 100 demos rotos. Hay 3**, así que la fase
sigue sin tocar nada: la lista es corta y se puede abordar en la Fase 4.

### 2.1 Los tres demos rotos

| Demo | Tipo | Mensaje | Qué es |
|---|---|---|---|
| `animaciones-mobius-infinity-loop` | consola | `Error: <path> attribute d: Expected number, ".310.6 318L313.5 NaNLNaN NaNLNaN .".` | un `<path>` SVG se dibuja con `NaN` en las coordenadas |
| `formularios-plan-cancellation-flow` | excepción | `Cannot read properties of null (reading 'addEventListener')` | busca un nodo que no está al enlazarlo |
| `botones-cavitation-bubble-button` | excepción | `Cannot read properties of undefined (reading 'toFixed')` | intermitente (ver abajo) |

`botones-cavitation-bubble-button` **solo revienta unas veces**: su bucle de
render arranca con `requestAnimationFrame` + `setInterval` (líneas 178-184) y
depende del frame en el que coja el navegador. En las cuatro pasadas que se
hicieron apareció en una. **Está en la línea base**, así que:

- cuando salta → coincide con la línea base → el comando pasa;
- cuando no salta → el script imprime un `aviso` (que **no** falla) y sugiere
  repetir antes de borrar nada.

Si alguien regenera la línea base en una pasada tranquila, ese fallo se
escapa y el CI se pone rojo sin que haya regresión. Está documentado en la
cabecera del propio script.

### 2.2 Los 85 demos con peticiones externas

Todos son `galerias-*` y todos van al mismo sitio: **`upload.wikimedia.org`
(≈540 peticiones)**. Es el único host externo que queda **sin llamadas
propias** en los demos; el resto de hosts que enumera `validar-csp.mjs`
(github, avatars, google-analytics, googletagmanager, commons.wikimedia) vienen
de la portada y del catálogo, no de los demos.

> Las 85 entradas, que son la **entrada de la Fase 5**:

```text
galerias-aurora-fan, galerias-autumn-timeline, galerias-birds-carousel,
galerias-birds-sphere, galerias-bloom-cube, galerias-bloom-finder,
galerias-bridge-board, galerias-bridge-overlay, galerias-bridge-vitrine,
galerias-butterfly-sphere, galerias-cafe-book, galerias-canyon-fan,
galerias-canyon-strip, galerias-cat-carousel, galerias-cat-studio,
galerias-cathedral-board, galerias-cathedral-parallax, galerias-coffee-finder,
galerias-coffee-mural, galerias-coffee-stage, galerias-dessert-mural,
galerias-dessert-stage, galerias-dog-carousel, galerias-dog-studio,
galerias-dunes-filter, galerias-dunes-phone, galerias-dunes-strip,
galerias-facade-exploded, galerias-facade-vitrine, galerias-falls-coverflow,
galerias-falls-diagram, galerias-falls-filter, galerias-feast-book,
galerias-feast-stage, galerias-fogwood-diagram, galerias-fogwood-filter,
galerias-fogwood-phone, galerias-fruits-cube, galerias-fruits-finder,
galerias-fruits-mural, galerias-glacier-fan, galerias-lake-phone,
galerias-lake-strip, galerias-market-book, galerias-market-parallax,
galerias-mistpeak-hud, galerias-mistpeak-slides, galerias-mountain-grid,
galerias-mountain-hud, galerias-mountain-slides, galerias-nebula-album,
galerias-nebula-film, galerias-nebula-preview, galerias-neoncity-film,
galerias-neoncity-marquee, galerias-nightcity-film, galerias-nightcity-marquee,
galerias-nightcity-preview, galerias-ocean-coverflow, galerias-reef-grid,
galerias-reef-map, galerias-reef-sphere, galerias-rooftops-board,
galerias-rooftops-overlay, galerias-rooftops-parallax, galerias-sakura-cube,
galerias-sakura-timeline, galerias-shore-coverflow, galerias-shore-slides,
galerias-stadium-grid, galerias-stadium-hud, galerias-stadium-map,
galerias-stairs-overlay, galerias-stairs-vitrine, galerias-starsky-album,
galerias-starsky-preview, galerias-street-exploded, galerias-tokyo-exploded,
galerias-tokyo-marquee, galerias-ukiyoe-grid, galerias-ukiyoe-map,
galerias-winter-studio, galerias-winter-timeline, galerias-woods-diagram,
galerias-woods-filter
```

### 2.3 Dos intentos fallidos que costaron entender

1. **`/Web/` + ruta del catálogo → doble barra.** La ruta del catálogo
   (`/CreacionesNuevas/...`) ya es absoluta desde la raíz, y anteponerle
   `/Web/` producía `.../Web//CreacionesNuevas/...`, un 404 en los 1 018.
   La primera línea base salió con **1 642 fallos** y 0 peticiones externas.
2. **La portada como wrapper.** Mientras se cargaba `/Web/`, `app.js` montaba
   su propia rejilla; al vaciar el `<body>` esos iframes se abortaban y sus
   errores se anotaban contra el demo que estaba tocando. Los `?previewRevision`
   de los `ERR_ABORTED` del primer informe venían de ahí.

Ambos están corregidos y la segunda línea base es la válida.

---

## 3. Desviaciones respecto al plan

| Plan | Hecho | Por qué |
|---|---|---|
| «una página de Playwright que contenga un iframe» | `/404.html` como wrapper | `frame-ancestors 'self'` exige origen propio; la portada contamina |
| «respuestas HTTP = 400» | **≥ 400** | un 404 o un 500 es tan fallo como un 400 |
| (no previsto) normalización de mensajes | puerto, query y dígitos | sin ella la comparación es ruido puro |
| `--muestra 60` si > 10 min | no hace falta | 3 min 22 s |
| (no previsto) manejo de fallos intermitentes | `aviso` que no falla + nota en el docblock | `cavitation-bubble-button` salta solo unas veces |

No se toca ningún demo: arreglar estos tres es la **Fase 4**.

---

## 4. Estado después de la fase

| Punto del plan | Estado |
|---|---|
| 3.1 `smoke-demos.mjs` y `npm run validar:demos` | **cerrado** |
| 3.1 iframe con el sandbox de producción | **cerrado** |
| 3.1 concurrencia 6, `load` + 1 s | **cerrado** |
| 3.1 registro de consola, excepción, fallidas, ≥ 400 y externas | **cerrado** |
| 3.1 externas abortadas con `page.route` | **cerrado** |
| 3.1 `smoke-report.json` en `.gitignore` | **cerrado** |
| 3.2 `smoke-baseline.json` versionada | **cerrado** |
| 3.2 pasa sin fallos nuevos; avisa de entradas obsoletas | **cerrado** (EXIT 0) |
| 3.3 paso en CI de Node 24 tras `validar:layout` | **cerrado** |
| 3.3 `--muestra 60` si > 10 min | no hace falta |
| ≤ 100 demos rotos | **cerrado**: 3 |
| Informe con total, fallos, tipo y externas | **cerrado** (§2) |
| 9 alertas de CodeQL | abiertas, decidido no tocar |
| 3 issues de SonarCloud | fuera del plan, sin mirar |
| Correo en el historial de git | abierto → **fase 9** |

---

## 5. Siguiente: Fase 4

`Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md` §Fase 4 — **arreglar lo
que detectó el humo**. Entrada: `Web/data/smoke-baseline.json`.

Hay que arreglar tres demos, no cien:

1. `animaciones-mobius-infinity-loop` — el `<path>` con `NaN`.
2. `formularios-plan-cancellation-flow` — el nodo `null` al enlazar eventos.
3. `botones-cavitation-bubble-button` — el `toFixed` sobre `undefined`.

Al arreglarlos, sus entradas saldrán de la línea base y el script avisará para
borrarlas; esa limpieza forma parte de la fase.
