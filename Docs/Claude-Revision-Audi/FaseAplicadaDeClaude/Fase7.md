# Fase 7 aplicada — contenido y calidad del CI

**Fecha:** 2026-10-03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), «Fase 7 · contenido
y calidad del CI» · **Apartados:** 7.1, 7.2, 7.3, 7.4, 7.5 y 7.6 (todos) ·
**Estado: cerrada — fin del plan**

Los seis apartados quedaron hechos, incluido el opcional del **7.6**, que no
tenía STOP: se activó porque la condición de tiempo que ponía el plan se
cumplía.

---

## 1. Lo que se hizo

| Punto | Commit | Estado |
|---|---|---|
| 7.1 Los 36 demos de la categoría «Other» | `6f15ee8` | ✅ hecho (35 de 36) |
| 7.2 Duplicados (solo informe) | `9b998d2` | ✅ hecho, 0 duplicados |
| 7.3 Calidad del CI (HTML, enlaces, externos) | `13cf4df` | ✅ hecho |
| 7.4 `sitemap.xml` con `<lastmod>` | `13cf4df` | ✅ hecho |
| 7.5 Versión `[1.0.0]` y release | este commit | ✅ hecho, release pendiente de Ángel |
| 7.6 (Opcional) Lighthouse CI | `13cf4df` | ✅ hecho |

```text
6f15ee8  2 files changed, 49 insertions(+), 35 deletions(-)
         Web/data/component-overrides.json, CHANGELOG.md

9b998d2  5 files changed, 1771 insertions(+), 3 deletions(-)
         Web/scripts/detectar-duplicados.mjs (nuevo), package.json,
         package-lock.json, CONTRIBUTING.md, CHANGELOG.md

13cf4df  14 files changed, 721 insertions(+), 20 deletions(-)
         Web/scripts/validar-enlaces.mjs (nuevo),
         Web/scripts/comprobar-enlaces-externos.mjs (nuevo),
         Web/scripts/generar-sitemap.mjs (nuevo),
         Web/scripts/validar-lighthouse.mjs (nuevo),
         .github/workflows/validate.yml,
         .github/workflows/enlaces-externos.yml (nuevo),
         vercel.json, Web/sitemap.xml, CHANGELOG.md
         + 404.html, index.html, Web/index.html, Web/components.html,
         Web/team-core.html (arreglos de html-validate)
```

---

## 2. 7.1 · Los demos de la categoría «Other»

Lee `Web/data/component-overrides.json`, usa su campo `category` y **no
renombra ninguna carpeta**. 35 de los 36 demos pasan a una categoría
existente; queda **1**.

| `id` | Categoría nueva |
|---|---|
| `8bit-game-heart-hud` | Animations |
| `alien-glyph-translator` | Forms |
| `analog-crt-oscilloscope` | Animations |
| `api-status-ping-pill` | Cards |
| `ascii-art-generator` | Forms |
| `audio-cassette-synth` | Controls |
| `audio-equalizer-music-pill` | Controls |
| `ci-cd-pipeline-flow` | Animations |
| `code-snippet-terminal-badge` | Cards |
| `color-palette-generator` | Controls |
| `cpu-core-load-matrix` | Animations |
| `cyber-hex-diagnostics-tile` | Cards |
| `database-query-cluster` | Animations |
| `docker-container-pod-status` | Cards |
| `git-branch-graph-visualizer` | Animations |
| `github-contribution-matrix-heat` | Cards |
| `json-collapsible-tree-node` | Navigation |
| `keyboard-shortcut-display` | Effects |
| `markdown-checklist-strike` | Forms |
| `markdown-preview-live` | Forms |
| `mech-robot-hud-targeting` | Effects |
| `memory-heap-ram-gauge` | Controls |
| `neural-synapse-network` | Animations |
| `quantum-entanglement-particles` | Animations |
| `quantum-qubit-bloch-sphere` | Animations |
| `regex-token-matcher` | Forms |
| `satellite-telemetry-globe` | Animations |
| `server-rack-led-blinker` | Animations |
| `status-badge-glow-matrix` | Cards |
| `teletext-80s-weather-screen` | Cards |
| `terminal-code-matrix-decode` | Animations |
| `terminal-syntax-highlighter` | Effects |
| `url-qr-code-generator` | Forms |
| `webhook-event-payload-stream` | Animations |
| `websocket-handshake-anim` | Animations |
| **`dev-console-easter-egg`** | **se queda en Other** |

**Justificación del único que queda:** `dev-console-easter-egg` no tiene
interfaz: se abre la consola del navegador y se ejecuta a mano. Ninguna
categoría del catálogo describe eso, y meterlo en otra sería mentir en el
filtro.

**Recuento nuevo del catálogo** (regenerado con `npm run catalogo`):

| Categoría | Antes | Después |
|---|---|---|
| Effects | 198 | 201 |
| Navigation | 160 | 161 |
| Animations | 87 | 101 |
| Cards | 89 | 96 |
| Loaders | 96 | 96 |
| Galleries | 95 | 95 |
| Controls | 89 | 93 |
| Buttons | 89 | 89 |
| Forms | 79 | 85 |
| **Other** | **36** | **1** |
| **Total** | **1018** | **1018** |

---

## 3. 7.2 · Duplicados (solo informe)

`Web/scripts/detectar-duplicados.mjs` y `npm run duplicados`.

**Cómo calcula:** normaliza HTML, CSS y JS (quita comentarios y espacios,
baja a minúsculas fuera de cadenas), calcula SHA-256 del resultado y, además,
una similitud de Jaccard sobre tokens. Los tokens presentes en **más de la
mitad de los demos (509 de 1018)** se ignoran: sin eso, todos parecerían
iguales por compartir `div`, `class` y las mismas utilidades.

- `UMBRAL = 0,90` para declarar duplicado; por debajo, lista informativa desde
  0,70.
- **Siempre sale con exit 0 y no borra nada**, como pide el plan.

**Resultado en la biblioteca:**

| Comprobación | Resultado |
|---|---|
| Grupos con hash idéntico | **0** |
| Pares con similitud ≥ 0,90 | **0** |
| Máximo real de la biblioteca | **0,726** |

El más parecido es `DavokerDiseñador/matrix/conejo` contra
`DavokerDiseñador/matrix/dodge` (0,726): comparten plantilla de «matrix», no
son el mismo componente. Tiempo: ~14 s.

---

## 4. 7.3 · Calidad del CI

### 4.1 `html-validate` sobre las páginas del sitio

`html-validate` **11.16.1** (versión exacta) y `npm run validar:html`:
`Web/*.html`, `404.html` y `index.html`. **No** se aplica a los 1.018 demos —
están hechos a mano por autores distintos e imponerles una norma ajena
reventaría el CI en el primer push.

Arreglos para que pasara:

| Fichero | Qué |
|---|---|
| `404.html`, `index.html`, `Web/index.html`, `Web/components.html`, `Web/team-core.html` | `<!doctype html>` → `<!DOCTYPE html>` (con `--fix`) |
| `Web/index.html` | el resumen lateral gana `role="group"` |
| `Web/index.html` | los dos botones del carrusel, `aria-label="Go back"` / `"Advance"` |
| `Web/components.html` | se quita el `for` redundante de la etiqueta de búsqueda |
| `Web/team-core.html` | comentario de desactivación **antes** del `<iframe scrolling="no">` |

Dos detalles que costaron: el `aria-label` estático es el mismo valor por
defecto que pone `app.js` al cambiar de idioma (y `data-i18n-aria-label` lo
sobreescribe), así que no rompe la i18n; y el comentario de desactivación no
puede ir dentro de la etiqueta, eso dejaría el HTML roto.

### 4.2 Enlaces y anclas del sitio

`Web/scripts/validar-enlaces.mjs` y `npm run validar:enlaces`. Sobre las 5
páginas del sitio comprueba que cada `href`/`src` relativo apunta a un fichero
que existe y que cada `#ancla` — en la misma página o en otra — tiene su `id`
en el fichero de destino. Hoy: **46 destinos locales y 18 externos, 0 rotos**.

Hay que decodificar la ruta con `decodeURIComponent`: hay destinos con `%C3%B1`
(`DavokerDise%C3%B1ador/davoker.html`) que sin decodificar dan un falso
negativo.

Paso en el CI **en las tres versiones de Node** (es estático y tarda 1,3 s).

### 4.3 Enlaces externos, workflow semanal

`Web/scripts/comprobar-enlaces-externos.mjs` con `npm run enlaces:externos`, y
`.github/workflows/enlaces-externos.yml` aparte de `validate.yml`:

- `schedule: "17 6 * * 1"` (lunes) y `workflow_dispatch`.
- **`continue-on-error: true`** y **sin `pull_request`**: no bloquea PRs.
- Sin `npm ci`: el script solo usa API de Node (`fetch`), así que ahorra un
  minuto de instalación.
- Acciones fijadas por SHA, como en el resto del repo.

11 URLs de fuera (las de `localhost`/`127.0.0.1` se saltan), todas en 200, ~6
segundos. Intenta `HEAD` y, si el servidor lo rechaza, repite con `GET`.

---

## 5. 7.4 · `sitemap.xml`

`Web/scripts/generar-sitemap.mjs` y `npm run sitemap`.

- Borra los `<lastmod>` previos y vuelve a escribirlos con
  `git log -1 --format=%cs -- <archivo>`.
- El mapeo `…/Web/…` → `Web/index.html` es el que ya usaba `stamp-assets`.
- **Si git no da historial para un fichero, omite la etiqueta** en lugar de
  inventar la fecha: es lo que pasará en el clon superficial de Vercel.
- Idempotente (seguida, misma salida) y ya es el último paso del
  `buildCommand` de `vercel.json`.

Comprobado en local: 3/3 URLs con `2026-10-02`. Y la rama de omisión se probó
a mano con una URL que no existe en el historial: `3 con <lastmod>, 1 sin
fecha`.

---

## 6. 7.5 · Versión y release

Cabecera **`## [1.0.0] - 2026-10-03`** añadida al `CHANGELOG.md`, encima de
todas las entradas de fase.

**El tag y la release no se crean desde aquí.** El plan lo deja en manos de
Ángel; el comando, cuando la PR ya esté en `main`:

```bash
gh release create v1.0.0 \
  --target main \
  --title "1.0.0" \
  --notes "Primera version estable del catalogo: fases 0 a 7 de la auditoria aplicadas."
```

Y la PR en sí, recuerda, se abre desde el navegador con:

```text
https://github.com/kindred-98/Libreria_HTML_CSS/compare/main...Update
```

---

## 7. 7.6 · Lighthouse CI (opcional)

**Condición del plan:** «Solo si el CI sigue por debajo de los 15 minutos
totales». Medida de la secuencia completa del job más largo (Node 24) en
local: **316,4 s ≈ 5 min 16 s**, y **362 s ≈ 6 min** con las once
comprobaciones ya montadas. Muy por debajo de 15 minutos → se activa.

### 7.6.1 Dependencia: por qué `lighthouse` y no `@lhci/cli`

La primera instalación fue `@lhci/cli` 0.15.1, el empaquetado oficial. Fija
`lighthouse@12.6.1`, y con él entraron **11 vulnerabilidades *high*** en
`npm audit`:

```text
basic-ftp (high) · extract-zip ×2 (high) · tmp (high)
puppeteer-core 19.8.4-24.43.1 (high) · lighthouse 12.x · @lhci/utils
```

Eso rompía el propio gate del CI (`npm audit --audit-level=high`, que pasó a
salir con EXIT 1). `extract-zip` **no tiene versión arreglada** (la última es
la de 2020), así que con Lighthouse 12 no había forma de limpiarlo: el paquete
que lo arrastra, `@puppeteer/browsers`, lo sustituyó por `modern-tar` a partir
de la 3.x.

**Solución:** usar `lighthouse` **13.5.0** directamente (sin `@lhci/cli`) y
escribir el script como el resto de comprobaciones del repositorio. Con esa
versión:

```text
devDependencies: @axe-core/playwright 4.13.0 · html-validate 11.16.1 ·
                 lighthouse 13.5.0 · chrome-launcher 1.2.2 · playwright ^1.63.0
npm audit --audit-level=high  →  EXIT 0 (0 vulnerabilidades)
```

`chrome-launcher` se declara aparte porque `lighthouse()` **solo mide: no
arranca el navegador** (en la línea de comandos ese trabajo lo hace su binario).

### 7.6.2 El script

`Web/scripts/validar-lighthouse.mjs` y `npm run validar:lighthouse`. Levanta
`serve.mjs`, abre el Chromium de Playwright (el mismo que layout y a11y, no
descarga otro) con `chrome-launcher`, y mide las tres páginas del sitio.

**Umbrales (los del plan):** rendimiento **≥ 80**; accesibilidad, buenas
prácticas y SEO **≥ 95**. Si algo baja, sale exit 1 con la lista de categorías.

| Página | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| portada (`Web/index.html`) | **99** | 100 | 100 | 100 |
| componentes (`Web/components.html`) | **86** | 95 | 100 | 100 |
| team core (`Web/team-core.html`) | **100** | 100 | 100 | 100 |

Tres pasadas seguidas, mismos valores (portada 93 la primera, que es la de
arranque en frío). ~35 s.

### 7.6.3 Por qué el preset *desktop*

Lighthouse trae por defecto el preset **móvil** (412 px, CPU ×4, red
simulada). Medido con él:

```text
portada      81 → 77 → 77        (TBT 1040 ms, un solo task de 639 ms en app.js)
componentes  76 → 75 → 80        (CLS 0,39; el <footer> baja 0,29 al entrar
                                  las tarjetas del catálogo)
team core    93
```

Dos problemas: el umbral de 80 **parpadearía** en cada ejecución (±5 puntos),
y la medición no corresponde con el sitio — todas las demás comprobaciones del
repositorio miden a **1350 px** (`validar-layout.mjs`, `validar-a11y.mjs`), el
catálogo está pensado para pantalla ancha, y el throttling móvil simula una
red y una CPU que no existen en un sitio estático servido en local.

Se usa por tanto el **preset desktop** (1350 × 940, sin throttling de CPU),
escrito a mano en el `settings` porque el programa no expone `--preset` al
usarse como librería. Los valores móviles quedan arriba, por si alguien
quiere volver a mirarlos.

### 7.6.4 Hallazgos que dejan anotados (trabajo futuro, fuera de la fase)

- **`components.html`: CLS 0,28-0,40.** El culpable es el `<footer>`: la
  rejilla arranca vacía y, cuando entran las tarjetas del catálogo, el pie
  se empuja hacia abajo. Se arregla reservando altura inicial (esqueleto) o
  pintando el catálogo antes del primer pintado.
- **`index.html`: TBT 600-1040 ms en móvil.** Un único task de ~639 ms en
  `app.js` al renderizar las 1.018 tarjetas de `catalog.json` (724 KB sin
  comprimir). Con la CPU ×4 del preset móvil eso son 2,5 s.
- Ambos desaparecen en el preset desktop, de ahí que el margen sobre el umbral
  sea real pero no enorme (86 frente a 80 en componentes).

### 7.6.5 En el CI

Paso **Medir las páginas con Lighthouse** en el job de Node 24, después del de
accesibilidad y reutilizando su Chromium.

`lighthouse` 13 exige **Node ≥ 22.19**, así que solo se ejecuta en Node 24; los
jobs de 20 y 22 lo instalan con `npm ci` (un `npm warn EBADENGINE`, no un
fallo) y no lo corren. Está anotado en `CONTRIBUTING.md` regla 5.

---

## 8. Criterios de aceptación

| Criterio del plan | Estado |
|---|---|
| «Other» solo con los que no encajan, y cada uno justificado | ✅ queda 1 (`dev-console-easter-egg`), justificado |
| `html-validate` y la comprobación de enlaces pasan | ✅ `validar:html` 0 · `validar:enlaces` 0 rotos |
| `npm run validar` pasa | ✅ EXIT 0 |
| (7.2) hash + similitud ≥ 0,9, sin borrar nada | ✅ 0 duplicados, exit 0 siempre |
| (7.4) `<lastmod>` con `git log`, omisión si no hay historial | ✅ 3/3 y rama de omisión probada |
| (7.5) cabecera `[1.0.0]`, sin tag ni release | ✅ hecha; comando en el §6 |
| (7.6) umbrales ≥ 80 / ≥ 95 y CI < 15 min | ✅ 99/86/100 y ~6 min |

---

## 9. Estado después de la fase

| Punto | Estado |
|---|---|
| 7.1 Reclasificación de Other | **cerrado** (`6f15ee8`), 36 → 1 |
| 7.2 Duplicados | **cerrado** (`9b998d2`), 0 duplicados |
| 7.3 Calidad del CI | **cerrado** (`13cf4df`) |
| 7.4 `sitemap.xml` | **cerrado** (`13cf4df`) |
| 7.5 Versión 1.0.0 | **cerrado** (este commit), release pendiente de Ángel |
| 7.6 Lighthouse | **cerrado** (`13cf4df`), condición de tiempo cumplida |
| `npm run validar` | ✅ EXIT 0 |
| `npm run validar:layout` | ✅ 5 páginas × 23 anchos |
| `npm run validar:a11y` | ✅ 0 `serious`/`critical` en 12 pasadas |
| `npm run validar:encabezados` | ✅ 1018 recorridos, 0 saltos |
| `npm run validar:html` | ✅ EXIT 0 |
| `npm run validar:enlaces` | ✅ 46 locales + 18 externos, 0 rotos |
| `npm run validar:lighthouse` | ✅ 3 páginas, 4 categorías |
| `npm run validar:demos` | ✅ 1018/1018, 0 fallos |
| `npm run duplicados` | ✅ 0 duplicados |
| `npm run enlaces:externos` | ✅ 11/11 en 200 |
| `npm run sitemap` | ✅ 3/3 con `lastmod` |
| Batería completa (11 comandos) | ✅ **362 s**, todos EXIT 0 |
| Línea base del humo | **vacía** (`[]`), sin cambios en esta fase |
| `npm audit --audit-level=high` | ✅ 0 vulnerabilidades |
| 9 alertas de CodeQL | abiertas, decidido no tocar |
| 3 issues de SonarCloud | fuera del plan, sin mirar |
| Correo en el historial de git | fuera del plan |

---

## 10. Fin del plan

Las ocho fases del
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md) están cerradas: la 0
y las 1-4 y 6 antes de esta sesión, la 5 **cancelada por Ángel** (87,26 MB
> umbral 40 MB) y la 7 con este informe.

**Último paso, el que no se hace desde aquí:**

```text
https://github.com/kindred-98/Libreria_HTML_CSS/compare/main...Update
```

Al abrir la PR se disparará `validate.yml` en las tres versiones de Node; el
tag `v1.0.0` se crea una vez la PR esté en `main` con el comando del §6.
