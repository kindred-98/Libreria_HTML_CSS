# Fase 6 aplicada — accesibilidad

**Fecha:** 2026-10-03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), «Fase 6 ·
accesibilidad» · **Entradas:** 6.1, 6.2 y 6.3 (todas nuevas) ·
**Estado: cerrada**

Los tres apartados de la fase quedaron hechos. El único STOP que el plan ponía
en esta fase era el del **6.3**: el piloto se ejecutó, se presentó el diff a
Ángel y él dio el visto bueno para aplicarlo al resto.

---

## 1. Lo que se hizo

| Punto | Commit | Estado |
|---|---|---|
| 6.1 axe-core en las páginas del sitio | `bfb196a` | ✅ hecho |
| 6.2 Los 7 demos con salto de encabezado | `347140b` | ✅ hecho |
| 6.3 `prefers-reduced-motion` (piloto + resto) | `8775339` | ✅ hecho |

```text
bfb196a  9 files changed, 415 insertions(+), 14 deletions(-)
         package.json, package-lock.json, Web/scripts/validar-a11y.mjs (nuevo)
         Web/styles/site.css, Web/styles/team-core.css, Web/scripts/app.js
         .github/workflows/validate.yml, CONTRIBUTING.md, CHANGELOG.md

347140b  11 files changed
         Web/scripts/validar-encabezados.mjs (nuevo), package.json,
         .github/workflows/validate.yml, CHANGELOG.md
         + los 7 index.html de las galerías

8775339  175 files changed, 2496 insertions(+), 53 deletions(-)
         Web/scripts/add-reduced-motion.mjs (nuevo), Web/scripts/validate.mjs
         CONTRIBUTING.md, CHANGELOG.md + los 171 CSS de los demos
```

---

## 2. 6.1 · axe-core en las páginas del sitio

`@axe-core/playwright` **4.13.0** con versión exacta (trae `axe-core` 4.13.0;
`playwright` sigue en `^1.63.0`).

`Web/scripts/validar-a11y.mjs` levanta `serve.mjs` y analiza **3 páginas × 2
idiomas × 2 temas = 12 pasadas**, con las reglas `wcag2a wcag2aa wcag21a
wcag21aa best-practice`. Además comprueba que al tabular un botón y un enlace
cambian de aspecto (`:focus-visible`).

- **Corta con `serious` y `critical`**; `moderate` y `minor` solo se informan.
- Las incidencias dentro de un iframe (las vistas previas de `components.html`)
  se listan con el prefijo `vista previa:` y **no cortan**: si cortaran, el CI
  dependería de que el catálogo no ruede un demo nuevo con un fallo.

**Arreglos en el código del sitio:**

| Qué | Antes | Después |
|---|---|---|
| `.component-number` (`site.css`) | `--quiet` → 3,90:1 claro / 4,14:1 oscuro | `--muted` → 6,06:1 / 7,06:1 |
| `.warp-card-caption` (`team-core.css`) | `--quiet` | `--muted` |
| Botón Aceptar cookies (`app.js`) | sin `background` → gris UA `rgb(107,107,107)` con 2,21:1 | `button-primary` |

El mismo criterio que ya tenía documentado `.footer-meta` en `site.css:1787`:
para texto pequeño se usa `--muted`, no `--quiet`.

**Resultado actual:** 0 violaciones `serious`/`critical` en las 12 pasadas.
Quedan 28 incidencias de información (`aria-allowed-role` ×8, `heading-order`
×8, `landmark-unique` ×4, y las de `vista previa:`).

CI: paso **Comprobar la accesibilidad de las páginas del sitio** en el job de
Node 24, tras el de layout y reutilizando su Chromium. `CONTRIBUTING.md` regla 5
corregida en el mismo commit.

---

## 3. 6.2 · Los 7 demos con salto de encabezado

`Web/scripts/validar-encabezados.mjs` y `npm run validar:encabezados`: recorre
el `index.html` de los 1018 demos de las tres carpetas, quita los comentarios
HTML, saca los encabezados en orden y anota todo nivel que suba de más de uno.

**Salida inicial: exactamente los 7 ids que preveía el plan** (686 demos con
encabezados):

```text
creaciones-primium/galerias/aurora-album     8 h3
creaciones-primium/galerias/cat-studio       h1 -> h3 (encabezado 2)
creaciones-primium/galerias/coffee-stage     h1 -> h3 (encabezado 2)
creaciones-primium/galerias/fogwood-diagram  h1 -> h3 (encabezado 2)
creaciones-primium/galerias/fruits-finder    h1 -> h3 (encabezado 2)
creaciones-primium/galerias/nightcity-film   h1 -> h3 (encabezado 2)
creaciones-primium/galerias/rooftops-board   h1 -> h3 (encabezado 2)
```

**Cambio:** `<h3` → `<h2` y `</h3>` → `</h2>`. **Sin ningún cambio de CSS**, por
dos motivos: las clases de título (`.page__name`, `.hv-name`, `.vp-name`,
`.ins-name`, `.rv-name`, `.vw-name`) fijan `font-size`, `margin` y `font-weight`
a mano, y el único selector por etiqueta que existe (`h1,h2,h3` de
`aurora-album/styles.css`) ya incluye el `h2`.

CI: el paso entra en **las tres versiones de Node**, no solo en la de 24.

---

## 4. 6.3 · `prefers-reduced-motion`

`Web/scripts/add-reduced-motion.mjs`, **idempotente** y con marcador
`/* reduced-motion (Fase 6) */`. Tres modos:

| Modo | Qué hace |
|---|---|
| `--dry-run` (por defecto) | solo informe, no escribe nada |
| `--piloto` | 10 Effects + 10 Animations, ordenados por ruta |
| `--todos` | todo lo elegible |

### 4.1 Informe de partida (1018 demos)

| Estado | N |
|---|---|
| Ya escuchaban `prefers-reduced-motion` | 722 |
| Categoría **Loaders** (excluida) | 96 |
| **Movimiento CSS → elegibles** | **171** |
| Solo JavaScript (no se toca) | 14 |
| Sin movimiento | 15 |

Comprobación cruzada: hay 818 ficheros `.css` con la preferencia y 722 demos
contabilizados como «ya cubierto»; la diferencia de 96 es exactamente la
categoría Loaders, que el script clasifica antes de mirar el contenido.

**Elegibles por categoría:** Effects 127 · Other 10 · Controls 10 · Cards 7 ·
Animations 6 · Navigation 5 · Buttons 5 · Forms 1.

**Trabajo futuro (14 demos que solo animan desde JavaScript):** Effects 5 ·
Animations 4 · Other 2 · Controls 1 · Cards 1 · Buttons 1. Detectados por
`requestAnimationFrame`, `setInterval`, `canvas` o `getContext(`. Un
`animation-duration` no afecta a nada que se dibuje marco a marco: necesitan
`window.matchMedia("(prefers-reduced-motion: reduce)").matches` en su script.

### 4.2 El STOP del piloto

Se aplicó a **16 demos** (10 Effects + los 6 Animations que había), se ejecutó
`npm run validar:demos` (1018 · 0 fallos) y el diff se presentó a Ángel.

```text
16 files changed, 206 insertions(+), 14 deletions(-)
```

Solo se añade el bloque al final de cada CSS. Las 14 «borraciones» no son
cambios de estilo: son el arreglo del `No newline at end of file` que traían
esos 14 ficheros.

**Visto bueno de Ángel: «Sí, aplicar a los 155».** Se ejecutó `--todos` y los
171 quedaron cubiertos.

### 4.3 Qué no se tocó

- **Los 96 Loaders**: la animación de un indicador de carga *es* la
  información. De hecho, los 96 ya traían su propio bloque de la preferencia.
- **Los 14 demos de solo JavaScript**: imposible de resolver con CSS.
- **Los 15 demos sin movimiento**: no hay nada que reducir.

### 4.4 Bloque aplicado

```css
/* reduced-motion (Fase 6) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

El bloque no apaga la animación: la deja en 0,01 ms, que basta para que el
navegador la dé por resuelta y se vea el estado final sin el recorrido.

Si el demo no tuviera ningún `.css` (no es el caso: los 1018 tienen exactamente
uno), el script escribe dentro del último `<style>` del `index.html`.

### 4.5 Regla nueva y aviso

- **`CONTRIBUTING.md` regla 7**: el bloque, sus dos excepciones y cómo
  detectar los que faltan.
- **`validate.mjs` apartado 9**: **aviso, no fallo**. Recorre las carpetas de
  los componentes que no son Loaders y avisa si su CSS anima sin escuchar la
  preferencia. Hoy sale **0 avisos**; el aviso se verificó quitando el bloque
  de un demo a mano (`AVISO: 1 demo(s) animan con CSS sin escuchar
  prefers-reduced-motion: countdown-submit-button`) y restaurándolo después.

Un detalle que costó encontrar: el apartado 9 se apoyaba en `exists()`, que
comprueba `isFile()` y por tanto devuelve `false` para las carpetas, así que el
aviso nunca salía. Se sustituyó por `readdir` con `try/catch`.

---

## 5. Criterios de aceptación

| Criterio del plan | Estado |
|---|---|
| `npm run validar:a11y` sin `serious` ni `critical` | ✅ 0 en 12 pasadas |
| 0 saltos de encabezado en los demos | ✅ los 7 corregidos, `validar:encabezados` en verde |
| El informe da modificados, excluidos y solo-JS | ✅ 171 / 96 / 14 en `--dry-run` |
| `npm run validar:demos` sin fallos nuevos | ✅ 1018 · 0 fallos |
| Idempotencia del script | ✅ segundo `--dry-run`: 171 aplicados, 0 elegibles |
| Regla en `CONTRIBUTING.md` | ✅ regla 7 |
| Aviso (no fallo) en `validate.mjs` | ✅ apartado 9, verificado que dispara |

---

## 6. Estado después de la fase

| Punto | Estado |
|---|---|
| 6.1 axe-core + arreglos | **cerrado** (`bfb196a`) |
| 6.2 Saltos de encabezado | **cerrado** (`347140b`) |
| 6.3 `prefers-reduced-motion` | **cerrado** (`8775339`), STOP superado con visto bueno |
| Línea base del humo | **vacía** (`[]`), sin cambios en esta fase |
| `npm run validar` | ✅ EXIT 0 |
| `npm run validar:layout` | ✅ 5 páginas × 23 anchos |
| `npm run validar:a11y` | ✅ EXIT 0 |
| `npm run validar:encabezados` | ✅ 1018 recorridos, 0 saltos |
| `npm run validar:demos` | ✅ 1018/1018, 0 fallos |
| 9 alertas de CodeQL | abiertas, decidido no tocar |
| 3 issues de SonarCloud | fuera del plan, sin mirar |
| Correo en el historial de git | abierto → fuera del plan |

---

## 7. Siguiente: Fase 7

`Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md` §Fase 7 — **contenido y
calidad del CI**.

1. **7.1** Reclasificar los **36 demos de la categoría «Other»** usando el campo
   `category` de `Web/data/component-overrides.json`. Sin renombrar carpetas; la
   tabla `id → categoría nueva` va en el informe.
2. **7.2** Duplicados: hash del contenido normalizado (HTML, CSS y JS sin
   espacios ni comentarios) más similitud por tokens (≥ 0,9). **Solo informe, no
   se borra nada.**
3. **7.3** Calidad del CI: `html-validate` sobre `Web/*.html` y `404.html`,
   `Web/scripts/validar-enlaces.mjs`, y un workflow semanal con `schedule` y
   `continue-on-error` para los enlaces externos.
4. **7.4** `sitemap.xml` con `<lastmod>` calculado con `git log -1 --format=%cs`.
5. **§7.5** Cabecera `[1.0.0]` en el CHANGELOG.
