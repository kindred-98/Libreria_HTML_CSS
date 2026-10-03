# Fase 4 aplicada — arreglar lo que detectó el humo

**Fecha:** 2026-10-03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), §Fase 4 ·
**Entrada:** `Web/data/smoke-baseline.json` (3 demos) · **Estado: cerrada**

El STOP del plan no se activa: son **3 demos, no más de 100**. Tampoco había
ningún 404, así que el orden de prioridad se reduce a las dos categorías que
quedan, y los commits van agrupados por categoría como manda el plan.

La línea base queda **vacía** y los dos comandos pasan.

---

## 1. Qué se hizo

| Prioridad | Commit | Demo |
|---|---|---|
| 2 · excepciones | `0750085` | `formularios-plan-cancellation-flow` |
| 2 · excepciones | `0750085` | `botones-cavitation-bubble-button` |
| 3 · error de consola | `8495576` | `animaciones-mobius-infinity-loop` |

**Alcance: 3 ficheros de demo, 15 líneas añadidas y 18 quitadas** (10 de ellas
son la línea base, que pasa de 3 entradas a `[]`).

```text
0750085  4 files changed, 23 insertions(+), 11 deletions(-)
8495576  3 files changed, 20 insertions(+),  8 deletions(-)
```

En cada commit se eliminó su entrada de `Web/data/smoke-baseline.json`,
tal como exige el plan.

---

## 2. Los tres arreglos

### 2.1 `formularios-plan-cancellation-flow` — `el("motivo")` no existe

**Síntoma:** `Cannot read properties of null (reading 'addEventListener')`

**Causa.** `CAMPOS[0]` es `{ id: "motivo", etapa: 1 }`, pero en `index.html`
`motivo` **no es un elemento**: es el `name` de un grupo de seis radios
(`motivo_precio`, `motivo_uso`, …) que no llevan ningún contenedor con
`id="motivo"`. El bucle de la línea 180 hacía:

```js
const control = el(f.id);          // ← null para "motivo"
control.addEventListener("blur", …);   // ← aquí revienta
```

**Arreglo (3 líneas).** Ese grupo ya está enlazado en la línea 203, con
`pintar(CAMPOS[0])` en `change` y `blur`, que es exactamente lo que habría
hecho esta rama; con lo que basta con no registrar nada donde no hay control:

```js
const control = el(f.id);
if (!control) return;
```

No se toca el HTML ni la estructura de `CAMPOS`: el comportamiento visible es
idéntico, porque las dos ramas hacían lo mismo para este campo.

### 2.2 `botones-cavitation-bubble-button` — `.toFixed` de `undefined`

**Síntoma:** `Cannot read properties of undefined (reading 'toFixed')`,
**intermitente** (apareció en 1 de las 4 pasadas completas de la Fase 3).

**Causa.** La línea 114 es `B.x.toFixed(1)`, y `B.x` solo se inicializa aquí:

```js
if (B.gen !== gen) { … B.x = …; B.y = …; B.mx = …; }   // líneas 64-71
```

`B.gen` arranca en `-1` (línea 26) y `gen` se calcula como
`Math.floor(t / d + …)`. El bucle llama a `render(now)` con **la marca de
tiempo del frame** (líneas 178-181), mientras `t0` se tomó con
`performance.now()` antes de pedir ese frame. Chromium entrega en el callback
la marca del frame **en curso**, que empezó antes que el guion: `now < t0`,
`t` sale negativa, `Math.floor` devuelve `-1`, `-1 !== -1` es falso, **no se
inicializa nada** y la línea de dibujo revienta al leer `.toFixed`.

**Arreglo (una línea):**

```js
var t = Math.max(0, (now - t0) / 1000);
```

Con `t ≥ 0`, `gen` ya nunca puede valer `-1`, así que el centinela dispara la
inicialización en la primera llamada. No se toca el centinela ni el resto del
bucle.

**Comprobación antes/después, misma sonda de 40 recargas:**

```text
ORIGINAL : 11 pageerror(s) en 40 recargas
   x Cannot read properties of undefined (reading 'toFixed')

ARREGLADA: 0 pageerror(s) en 40 recargas
```

### 2.3 `animaciones-mobius-infinity-loop` — `Float64Array` desbordado

**Síntoma:** `Error: <path> attribute d: Expected number, "…310.6 318L313.5 NaNLNaN NaNLNaN …".`

**Causa.** De los siete buffers del fichero, seis tienen el tamaño que les
corresponde y uno no:

```js
const P  = new Float64Array((SEG + 1) * 2);   // x/y por parejas  ✅
const Pm = new Float64Array((SEG + 1) * 2);   // x/y por parejas  ✅
const C  = new Float64Array(SEG + 1);         // ← ¡solo 169!
```

Pero `C` se rellena igual que las otras dos (líneas 92-93):

```js
C[i * 2]     = CX + tmp[0] * kc * SCALE;
C[i * 2 + 1] = CY - tmp[1] * kc * SCALE;
```

Un `Float64Array` **no crece**: escribir más allá de la longitud es un no-op
silencioso. Para `i ≥ 85`, `C[i*2]` y `C[i*2+1]` quedan sin tocar, la lectura
devuelve `undefined` y `fmt()` les pone `"NaN"` en el `d` de los dos
`<path>` del lomo (`spine` y `spineHalo`, los dos únicos que se alimentan de
`C`).

**Arreglo (una línea):** el buffer pasa a `(SEG + 1) * 2`.

**La cuenta cuadra:** los puntos buenos son 85 (índices 0-84 → 973
caracteres de path), y el `NaN` aparecía justo en la **posición 973** del
`d` que devolvía la sonda.

**Comprobación antes/después:**

```text
ANTES : 2 paths con NaN/Infinity/undefined  (spine y spineHalo)
DESPUÉS: 0
```

---

## 3. Criterios de aceptación

| Criterio | Estado |
|---|---|
| La línea base queda vacía, o cada entrada restante tiene `motivo` | ✅ **vacía** (`[]`), sin necesidad de ningún `motivo` |
| `npm run validar:demos` pasa | ✅ `1018 demos · 0 con fallos · 1018 sin ninguno`, EXIT 0 |
| `npm run validar` pasa | ✅ EXIT 0 (y `validar:layout` también) |
| Sin `localStorage`/`sessionStorage` reescritos y sin tocar el `sandbox` | ✅ ningún arreglo entra ahí (regla 7) |
| Sin rediseños ni reformateos | ✅ 15 líneas añadidas en total, 3 en el peor caso |

Resultado final de la pasada completa:

```text
1018 demos · 0 con fallos · 1018 sin ninguno
demos con peticiones externas: 85 (hosts: upload.wikimedia.org)
EXIT 0
```

---

## 4. Estado después de la fase

| Punto del plan | Estado |
|---|---|
| STOP si > 100 en la línea base | no se activó (eran 3) |
| 1. Recursos propios con 404 | no había ninguno |
| 2. Excepciones de JavaScript | **cerrado** (`0750085`) |
| 3. Errores de consola | **cerrado** (`8495576`) |
| Arreglar lo mínimo, sin rediseñar | **cerrado** |
| Agrupar los commits por categoría | **cerrado** (2 commits) |
| Borrar de la línea base en el mismo commit | **cerrado** (en los dos) |
| Campo `motivo` para lo no arreglable | no hizo falta |
| Línea base vacía | **cerrada** (`[]`) |
| `validar:demos` y `validar` pasan | **cerrado** (EXIT 0) |
| 9 alertas de CodeQL | abiertas, decidido no tocar |
| 3 issues de SonarCloud | fuera del plan, sin mirar |
| Correo en el historial de git | abierto → **fase 9** |

---

## 5. Siguiente: Fase 5

`Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md` §Fase 5 — **imágenes de
Wikimedia en local**. La Fase 3 ya dejó la lista: **85 demos `galerias-*`,
≈540 peticiones a `upload.wikimedia.org`**.

1. **5.1** `Web/scripts/localizar-imagenes.mjs` con `--dry-run`: URLs únicas,
   tamaño estimado con `HEAD`, distribución por demo y referencias construidas
   en JS (que no son URLs literales).
   > **STOP:** si el total supera **40 MB**, decisión de Ángel antes de seguir.
2. **5.2** Descarga en `<demo>/img/<sha256-12>.<ext>`, reescritura de las
   referencias, `User-Agent` identificable, 2 peticiones/s y reintentos ante
   `429`.
3. **5.3** Autor y licencia desde la API de Commons, `CREDITS.md` en cada demo
   que viaje en su ZIP; sin licencia libre clara, **no se descarga**.
