# Fase 5 aplicada y descartada - imágenes de Wikimedia en local

**Fecha:** 2026-10-03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), «Fase 5 ·
imágenes de Wikimedia en local» · **Entrada:** ninguno (fase nueva) ·
**Estado: descartada por decisión de Ángel**

Se completó el **5.1 (inventario)**, que es el que el plan pone deliberadamente
delante de un STOP. El inventario devolvió **87,26 MB**, más del doble de los
**40 MB** que fija el plan, así que se presentó a Ángel antes de tocar nada.
Su decisión fue **cancelar la fase**: no se descarga, no se reescribe y no se
toca el CSP. Las 416 imágenes siguen en `upload.wikimedia.org`.

---

## 1. Lo que se hizo

| Punto | Commit | Estado |
|---|---|---|
| 5.1 Inventario (`--dry-run`) | `8f52077` | ✅ hecho |
| 5.2 Descarga en `<demo>/img/` | — | ☒ descartada |
| 5.3 `CREDITS.md` y licencias | — | ☒ descartada |
| 5.4 Quitar Wikimedia del CSP | — | ☒ descartada |

```text
8f52077  3 files changed, 339 insertions(+)
         Web/scripts/localizar-imagenes.mjs (nuevo, 316 líneas)
         .gitignore (+5)
         CHANGELOG.md (+18)
```

El script **se conserva**: es una herramienta de auditoría que permite volver a
medir el inventario cuando se quiera, y es la justificación documental de por qué
la fase no siguió adelante.

---

## 2. El inventario

```text
ficheros html/css/js recorridos : 2673
URLs unicas de imagen          : 416
referencias totales            : 860
demos afectados                : 86
fichas de Commons (no imagen)  : 465
referencias que no son literal : 0
```

Cifras medidas con `HEAD` (2 peticiones/s, reintentos con espera creciente
ante un `429`, `User-Agent` propio):

| Ancho | Repo (contenido único) | Despliegue (cada demo con su copia) |
|---|---|---|
| **960px** — lo que referencian hoy | **87,26 MB** (91.500.053 B) | **150,17 MB** (157.462.872 B) |
| **500px** — ancho estándar inferior | **26,84 MB** | ≈46 MB |
| Umbral del plan | **40 MB** | — |

412 de las 416 URLs son miniaturas `960px-`; las 4 restantes son ficheros
originales directos. La distribución por demo va de **0,8 MB** (`aurora-album`)
a **4,4 MB** (`sakura-timeline`), con la mayoría entre 1 y 3 MB.

**0 referencias construidas en JS**: todas son URL literales, así que la
reescritura habría sido mecánica. Y `aurora-album` es el único demo con
referencias que el test de humo no llegó a pedir (imágenes con `loading="lazy"`
fuera del primer pantallazo).

---

## 3. Por qué se detuvo en 40 MB

Dato de contexto que no estaba en el plan y que se le presentó junto al
inventario: el repositorio hoy pesa **63,63 MiB** de pack y contiene
**3 imágenes / 0,2 MB** (es texto puro). Con las 960px pasaría a ≈151 MiB,
**más que el doble**, y esas binarias no se borran del historial nunca. El
árbol de trabajo iría de 85,3 MB a 235 MB.

Además apareció una restricción de Wikimedia que el plan no contempla: los
hotlinks **solo se aceptan en anchos estándar**

```text
20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840
```

Probar `640px` o `480px` devuelve **400** con el mensaje *«Use thumbnail sizes
listed on https://w.wiki/GHai»*. Por eso la única alternativa por debajo de
960px era el **500px**, medido en **26,84 MB** (cabe en el umbral).

### El motivo real de la calidad

Si se hubiera bajado a 500px, la pérdida se habría notado: las fotos de las
galerías van con `width:100%` dentro de tarjetas (ahí 500px basta), pero casi
todas tienen un **lightbox a pantalla completa** (`object-fit: contain`, ver
`.reader__img` de `coffee-finder`) donde una imagen de 500px se ve blanda en
un monitor grande. Ese era el trade-off que había que elegir, no solo el
tamaño en MB.

---

## 4. Decisión de Ángel

> **Cancelar la Fase 5.** No se baja nada; las imágenes siguen en Wikimedia;
> la fase se anota en el CHANGELOG como descartada y se continúa con la Fase 6.

Se le presentaron cuatro opciones (500px, 960px completo, cancelar, subconjunto
parcial) con sus cifras; eligió **cancelar**.

---

## 5. Consecuencias para el resto del plan

Tres puntos del plan quedan **inalcanzables** tal y como están redactados, y
hay que tenerlos presentes en la re-auditoría:

| Punto del plan | Situación |
|---|---|
| `validar:demos` con **0 peticiones externas a Wikimedia** | ❌ seguirán siendo ≈540 en 85 demos |
| «Ningún demo con imágenes localizadas queda sin `CREDITS.md`» | ❌ no hay imágenes localizadas |
| «0 referencias a `upload.wikimedia.org` y `commons.wikimedia.org` como recursos cargados» (§Estado esperado) | ❌ se mantiene el hotlinking |

Y dos decisiones que sí se mantienen:

| Punto | Estado |
|---|---|
| `validar:demos` con **0 fallos** | ✅ se mantiene (los 85 externos se anotan como `externo`, no como fallo) |
| Quitar Wikimedia de `img-src` (§5.4) | ✅ no se hace; `validar-csp` sigue viéndolos usados, así que no tocar los bloques |

El objetivo de la fase —que los demos funcionen sin depender de Wikimedia ni
informarle de cada visita— **queda sin cubrir**. Si en el futuro se quiere
retomar, el punto de entrada es `Web/scripts/localizar-imagenes.mjs --dry-run`
y la primera pregunta sigue siendo la de los MB.

---

## 6. Estado después de la fase

| Punto del plan | Estado |
|---|---|
| 5.1 Inventario con `--dry-run` | **cerrado** (`8f52077`) |
| STOP si > 40 MB | **activado** (87,26 MB) → decisión de Ángel |
| 5.2 Descarga y reescritura | **descartada** por Ángel |
| 5.3 `CREDITS.md` y licencias | **descartada** por Ángel |
| 5.4 Quitar Wikimedia del CSP | **descartada** por Ángel (no procede) |
| Línea base del humo | **vacía** (`[]`), sin cambios en esta fase |
| `npm run validar` | ✅ EXIT 0 |
| `npm run validar:demos` | ✅ 1018/1018, 0 fallos |
| 9 alertas de CodeQL | abiertas, decidido no tocar |
| 3 issues de SonarCloud | fuera del plan, sin mirar |
| Correo en el historial de git | abierto → fuera del plan |

---

## 7. Siguiente: Fase 6

`Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md` §Fase 6 — **accesibilidad**.

1. **6.1** `@axe-core/playwright` como `devDependency` (versión exacta) y
   `Web/scripts/validar-a11y.mjs` con `npm run validar:a11y`: analiza
   `index.html`, `components.html` y `team-core.html`, en los dos idiomas y en
   los dos temas; **falla** con violaciones `serious`/`critical`. Corrige lo que
   salga en `Web/`, comprueba los `:focus-visible` y añádelo al job de Node 24
   del CI.
2. **6.2** Script que detecte los **7 demos con saltos `h1 → h3`**, los liste y
   los corrija (y ajuste el CSS si usa selectores `h3`).
3. **6.3** `Web/scripts/add-reduced-motion.mjs`, idempotente, con marcador
   `/* reduced-motion (Fase 6) */`. Excluye la categoría **Loaders** y los
   demos que animan solo con JavaScript. **STOP tras el piloto de 20 demos**
   (10 efectos + 10 animaciones): hay que presentar el diff a Ángel antes de
   aplicarlo al resto.
