# Auditoría — Biblioteca HTML y CSS

**Fecha:** 2026-10-02 · **Commit revisado:** `39f4e8d` · **Método:** lectura del código y
ejecución real de los scripts del repositorio. Ningún hallazgo de esta auditoría se
responde con «creo que»: o hay un comando que lo demuestra, o no va aquí.

La auditoría anterior (2026-09-30) queda archivada en
[`Auditoria-2026-09-30.md`](./Auditoria-2026-09-30.md). Este documento la **sustituye**,
no la amplía: los hallazgos antiguos se han vuelto a medir y los que ya no se
reproducen están marcados como cerrados.

**Estado:** las seis fases de esta auditoría están aplicadas. El registro de qué se tocó,
con qué comando se comprobó y qué quedó descartado está en
[`Fases-de-Auditoria-Aplicadas/`](./Fases-de-Auditoria-Aplicadas/). **Este documento es
el diagnóstico en `39f4e8d`, el commit revisado**: §1 y §8 describen ese estado, no el de
hoy.

---

## 0. Resumen

| | |
|---|---|
| Componentes | **1 018** (248 `CreacionesNuevas` + 651 `creaciones-primium` + 119 `DavokerDiseñador`) |
| `npm run validar` | ✅ pasa (`1 018 componentes · 1 018 descargables`) |
| `npm run validar:csp` | ✅ pasa (2 688 ficheros, 9 hosts externos, 2 avisos no bloqueantes) |
| Dependencias npm | **1** (`playwright`, en `devDependencies`): la usa `validar-layout.mjs`, que es la comprobación que mide si una página se sale de lado |
| Hallazgos con ID | **10** (C-1…C-4, H-1…H-3, M-1…M-3): **1** crítico, **4** altos, **5** medios |
| Filas sin ID | **9** en §6 y §7 (una repite C-1): **1** alto, **5** medios, **2** bajos, 1 sin etiquetar |

**Lo más importante de este documento:** en la auditoría del 2026-09-30 se
declararon fases como completadas que no lo estaban (§1), y se anunció una
descarga de ZIP funcionando con una prueba que no cubría el caso del usuario (§2).

---

## 1. Estado real de las fases

El plan de fases (`Docs/01-planes/Plan_de_fases.md`) declaraba el estado. Se contrastó con el disco:

> **Nota:** esta tabla es el estado en `39f4e8d`. Hoy ya no es así: los 119 ZIP han salido
> del repo, `.gitattributes` tiene 16 líneas con 12 tipos binarios, los 9 ficheros
> estándar existen, `components.html` tiene `<h1>` y la matriz de Node es `[20, 22, 24]`.
> El detalle de cada cierre, en [`Fases-de-Auditoria-Aplicadas/`](./Fases-de-Auditoria-Aplicadas/).

| Fase | Lo que se dijo | Lo que hay |
|---|---|---|
| 0 — Baseline | hecha | ✅ hecha |
| 1 — Seguridad | hecha | ✅ hecha **en `generate-catalog.mjs`**, ❌ **no en `serve.mjs`** (ver H-1) |
| 2 — Legal | «completa» | ⚠️ parcial: los 119 ZIP **siguen versionados**; el CSS de terceros sin borrar |
| 3 — Documentación | parcial | ⚠️ parcial: 16 filas falsas siguen (ver §4) |
| 4 — Higiene | pendiente | ❌ no empezada: `.gitattributes` tiene 2 líneas |
| 5 — Ficheros estándar | pendiente | ❌ no empezada: faltan los 9 |
| 6 — Código muerto | pendiente | ❌ no empezada: `components.html` sigue sin `<h1>` |
| 7 — CI | pendiente | ⚠️ parcial: solo el aviso de `sandbox`; la matriz sigue en `[22]` |
| 8 y 9 | requieren decidir | ⏸️ sin empezar |

`Docs/01-planes/Plan_de_fases.md` sigue describiendo la decisión de la Fase 2.2 que **no** se
tomó (retirar los 119 ZIP del repo). Hay que actualizarlo.

---

## 2. El bug que reportaste: la descarga del ZIP de Davoker

### 2.1 Lo que reproduce un visitante

Al abrir el portal de Davoker en `Web/components.html`, la portada
(`DavokerDiseñador/davoker.html`) **no enseña las 119 tarjetas**. Las reglas CSS de
`davoker.html:640-651` hacen esto:

```css
/* ninguna categoría abierta: solo la muestra aleatoria */
body:not(:has(.grupo[open])) .galeria .tarjeta:not(.sorteada) { display: none; }

/* categoría abierta: las de las demás categorías quedan ocultas */
body:has(.grupo[open]):not(:has(#g-miscelanea[open]))
    .galeria .tarjeta[data-cat="miscelanea"] { display: none; }
```

Medido en el navegador, al cargar el portal:

```
grupos abiertos: []          ← ninguno
tarjeta visible:  gelatina   ← una al azar, marcada con .sorteada
display de #glitch: none      ← las otras 118 ocultas
```

El botón «Descargar efecto (.zip)» **existe 119 veces en el DOM, pero 118 están dentro
de tarjetas con `display: none`**, es decir, con `width: 0, height: 0` y sin
`offsetParent`. Un elemento así no se puede pulsar: no hay nada donde hacer clic.

Para llegar al botón hay que **desplegar antes su categoría** en el índice lateral.
Eso no está escrito en ninguna parte, y desde el punto de vista del visitante se
traduce exactamente en «el botón no hace nada».

**Este es el hallazgo principal de esta auditoría.** No es un problema de descarga: es
un problema de que el botón no está donde el usuario cree que está.

### 2.2 Los tres caminos de descarga, medidos

Con Playwright (Chromium), servidor local, `acceptDownloads: true`:

| Camino | Resultado |
|---|---|
| Portal, dentro del iframe, con la categoría desplegada | ✅ `glitch.zip` descargado |
| Showcase (`miscelanea/glitch/index.html`), dentro del iframe | ✅ `glitch.zip` descargado |
| Ficha del componente en `Web/`, botón «Descargar ZIP» | ✅ `harry-potter-arena.zip` (blob) |

Los tres funcionan **en Chromium**. Eso no demuestra que funcionen en el navegador de
quien reporta el fallo, y por eso este documento **no da el bug por cerrado**. Falta
 saber en qué navegador se prueba.

Los dos caminos internos dependen de que el navegador acepte la descarga de un
`<a download>` servido desde un iframe con origen opaco
(`sandbox="allow-scripts allow-forms allow-popups allow-downloads"`,
`Web/components.html:95`). El tercero no depende: genera el ZIP en el navegador con un
`blob:` y por eso es el único que se comporta igual en todas partes.

### 2.3 Por qué los componentes propios y los de Fatma sí funcionan

Porque no usan el camino frágil. `Web/scripts/app.js:1216-1245` construye el ZIP en el
navegador a partir del catálogo y lo entrega como `blob:`. No hay sandbox de por medio,
no hay ficheros `.zip` en el disco y no depende del `atributo download`. Los
componentes de Davoker son los únicos que dependen de un fichero estático y de un
iframe con origen opaco.

---

## 3. Seguridad

### H-1 — ALTO · `serve.mjs` sigue vulnerable a enlaces simbólicos

El commit `deb98b0` se anuncia como «cierra los 4 fallos de seguridad», pero el symlink
**nunca se corrigió en `serve.mjs`**. `resolveRequest()` (`:103-111`) valida la ruta
normalizada y después `stat`/`readFile` (`:140-142`) siguen el enlace. Comprobado: un
junction fuera de la raíz se sirve con `200`.

La corrección correcta ya existe 100 líneas más abajo, en
`generate-catalog.mjs:209,213` (`lstat()` + `realpath()`). Hay que copiarla.

Escenario: alguien abre un PR que añade un enlace simbólico a `~/.ssh/id_rsa`; quien
mantenga el repo arranca `npm run servidor` en macOS o Linux y sirve ese fichero. El
servidor está ligado a `127.0.0.1`, así que hace falta que la víctima abra la URL.

### H-2 — MEDIO · `build-zips.mjs` se incluye a sí mismo

`Web/data/sources/miscelanea-glitch.json` lista `miscelanea-glitch/glitch.zip` como
fichero del componente, y ese ZIP es también la salida del script. Cada ejecución
empaqueta el ZIP anterior. Medido en un directorio aparte:

```
build 1 -> 137 897 B
build 2 -> 162 153 B
build 3 -> 186 409 B
build 4 -> 210 665 B     (+24 256 B por build, sin techo)
```

En el repositorio, **119 de 119 ZIP** contienen un `.zip` anidado, con hasta **4
niveles** de anidamiento. De los 10,4 MB que ocupan los ZIP, **7,95 MB son ZIP dentro de
ZIP**.

### H-3 — MEDIO · `build-zips.mjs` mete la licencia equivocada

`build-zips.mjs:172` resuelve `sourceData.licenseFile` contra la **raíz del repo** en
vez de contra el directorio de la colección. El resultado: el ZIP de cada demo de
Davoker lleva en la raíz el `LICENSE` de kindred-98 (2 237 B) y no el de davoker
(1 085 B). Además omite el `ATTRIBUTION.txt` que `app.js` sí genera, de modo que los dos
caminos de descarga producen ficheros distintos, contrario a lo que dice el comentario
del propio script.

### M-1 — MEDIO · `esc()` no escapa comillas

`creaciones-primium/navegacion/omnibox-jump-bar/script.js:42-44`: `esc()` escapa
`& < >` pero no `"`, y se usa dentro de un atributo entrecomillado. Se pueden inyectar
atributos (`onmouseover`) sobre el `<button>`. Como `<` y `>` sí se escapan, no se puede
inyectar una etiqueta nueva. **Es self-XSS**: lo dispara quien escribe en el input. Se
arregla añadiendo `"` y `'` a `esc()`.

### M-2 — MEDIO · `.env` se sirve en local

`serve.mjs:90` filtra una lista corta (`.git|.github|.qodo|.vercel|.vscode|.idea`).
Ampliado a todo `^\.` lo cierra.

### M-3 — MEDIO · CI con acciones fijadas por tag

`.github/workflows/validate.yml:25,28` usa `actions/checkout@v5` y
`actions/setup-node@v5`. Un tag se puede mover; fijar por SHA lo elimina. Además
conviene `persist-credentials: false`.

### Lo que está bien (no tocar)

- **Path traversal cerrado.** 9 variantes probadas, ninguna pasa. `decodeURIComponent`
  va dentro del `try`, así que `GET /%zz` ya no tumba el servidor.
- **`app.js` no tiene XSS.** Todos los sinks usan `textContent` o `createTextNode`; el
  único `innerHTML` es un SVG literal. `?component=` se valida contra el catálogo.
- **0 `eval`, 0 `new Function`, 0 `document.write`, 0 `outerHTML`** en los 1 018 demos.
- **`zip.js:28-34` tiene protección zip-slip** escrita a propósito.
- **CSP sin comodines peligrosos** (`object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `frame-ancestors 'self'`), validada en CI incluidos hosts
  huérfanos.
- **Los 2 iframes del sitio no llevan `allow-same-origin`**: los demos no ven el
  `localStorage` del sitio ni el consentimiento de cookies.
- **0 secretos** en los 3 210 ficheros versionados, buscados con 9 patrones.
- **1 dependencia npm** (`playwright`, en `devDependencies`, solo para `validar-layout.mjs`),
  y los escritores de ZIP siguen estando hechos a mano para conservarlo.

---

## 4. Documentación que contradice al código

**16 filas.** Las que rompen algo si se siguen:

| Fichero:línea | Dice | Realidad |
|---|---|---|
| `README.md:142` | el build es solo `generate-catalog.mjs` | `vercel.json:4` corre **3** comandos; siguiendo el README el despliegue sale sin assets sellados ni ZIP |
| `README.md:148` | «solo tres hosts externos» | `validar-csp.mjs` lista **9** |
| `README.md:11,132` | los 116 demos «quedan en el disco local» | `GevendraAutorExterno/` no existe ni en disco ni en git |
| `CONTRIBUTING.md:165` | `Docs/` solo tiene `THIRD_PARTY_NOTICES.md` | tiene **5** ficheros |
| `SECURITY.md:39-42` | el alcance son 4 scripts | son **9**, y no menciona los 119 demos de Davoker |
| `SECURITY.md:55` | `sandbox="allow-scripts allow-forms allow-popups"` | `components.html:95` añade `allow-downloads` |
| `Web/README.md:88` | «nunca los 396 que muestra Vercel» | los **1 018** son descargables |
| `Web/robots.txt:4` | «los 885 detalles» | **1 018** |
| `README.md:154` | «los mismos 473 ficheros de sources» | **1 018** |
| `README.md:45`, `Web/README.md:31` | Node 18 | `package.json` exige `>=20` |
| `SECURITY.md:47`, `CONTRIBUTING.md:17` | `GevendraAutorExterno/` está en el repo | está en `.gitignore` |
| `SECURITY.md:48` | «vulnerabilidades en jQuery, Ionicons» | **0 coincidencias** en el repo |
| `Web/README.md:84` | «no hay script de build» | hay `buildCommand` |
| `Docs/THIRD_PARTY_NOTICES.md:87,97,110` | hay redirects y `X-Robots-Tag` en el despliegue | `vercel.json` tiene 2 redirects y **cero** `X-Robots-Tag` |
| `.gitignore:44` | el aviso está en `Docs/Legalizacion/` | la ruta es `Docs/` |
| `Web/README.md:1` | «Aplicación web Component/Field» | es la *Biblioteca HTML y CSS* |

Enlaces Markdown rotos: **0**.

---

## 5. Legal

### C-1 — CRÍTICO · 577 KB de la portada de GitHub dentro de un ZIP redistribuible

`CreacionesNuevas/url-qr-code-generator/vendor/recurso-84b7e44a.css`, 576 817 bytes.
Leído: los primeros bytes son `<!DOCTYPE html>` de `https://github.com`, con sus
`dns-prefetch` a `github.githubassets.com` y sus logotipos. Es la **portada de GitHub,
Inc.**, no un CSS. Va referenciado en `index.html:15` como valor por defecto del input y
**va dentro del ZIP** que genera `app.js`.

La `LICENSE` de esa carpeta excluye expresamente los recursos de terceros. El proyecto
**no puede redistribuir** ese fichero.

Arreglo: borrarlo y poner `https://example.com` (que ya es el `placeholder`).

### C-2 — ALTO · Correos personales publicados

- Una dirección de correo personal del mantenedor en **65 de 78 commits**, y además en
  `SECURITY.md:22` como canal de contacto.
- Un correo de centro educativo, en los metadatos de 2 commits
  de `fatmaerm` que **no son ancestros de `main` pero sí están en
  `refs/remotes/origin/fatmaerm/main`**, una referencia remota publicada.

`SECURITY.md:22` es lo único arreglable sin reescribir historia: sustituirlo por el
canal privado de avisos de GitHub, que el propio fichero ya describe.

### C-3 — ALTO · `LICENSE` describe ficheros que no existen

`LICENSE:9-10` cita `CreacionesNuevas/LICENSE`, que **nunca existió en ningún commit**
(`git log --all -- CreacionesNuevas/LICENSE` no devuelve nada). Y `LICENSE:14-16` afirma
que los ZIP «se generan en el despliegue», cuando están commiteados.

### C-4 — ALTO · 0 de 1 018 demos llevan crédito de autoría

Ninguno tiene `<meta name="author">` ni `<link rel="license">`. Quien copia un demo se
lo lleva sin el copyright que la MIT exige conservar. Solo 5 ficheros del repo
contienen nombre de autora, y 3 de ellos son la portada de Davoker.

### Lo que está bien (no tocar)

- **Las galerías de Wikimedia están resueltas como deben resolverse**: 86 carpetas, 676
  fotos, **ninguna distribuida**, todo hotlink, atribución por foto dentro de la página.
  Sin copias no hay obligación de compartir-al-similar.
- Los 248 `LICENSE` de `CreacionesNuevas/` son byte-idénticos y excluyen terceros.
- `creaciones-primium/LICENSE` nombra a las dos autoras.
- Las 6 fuentes OFL están sin modificar, con sus dos `OFL-*.txt` completos.
- El tratamiento de `GevendraAutorExterno/` es ejemplar: se detectó que su repo de
  origen no declara licencia, se pidió autorización sin respuesta, se retiró el `LICENSE`
  MIT que esa carpeta había llegado a llevar y se documentó por qué.

---

## 6. Accesibilidad

| Sev | Ubicación | Hallazgo |
|---|---|---|
| **ALTO** | `Web/styles/site.css:741` | `.search-box input { outline: 0 }` anula el `input:focus-visible` de la línea 135 (misma especificidad, gana por orden). El buscador de `components.html` es **invisible al tabular**. |
| MEDIO | `Web/components.html:80-84` | El `<label>` del buscador no contiene texto, así que su **nombre accesible es «/»**. |
| MEDIO | `Web/components.html:93` | `aria-live="polite"` en el contenedor que se reemplaza entero en cada cambio: el lector de pantalla reanuncia las 9 tarjetas cada vez, además del recuento de la línea 85. |
| MEDIO | `Web/styles/site.css:1753` | `.footer-meta` a `--quiet` sobre `--page`: **3,50:1** en tema claro. AA pide 4,5:1. |
| BAJO | `index.html:37`, `components.html:37`, `team-core.html:41` | «Skip to content» literal, sin traducir, en páginas `lang="es"`. |
| — | `Web/components.html:75` | Empieza en `<h2>`: **falta el `<h1>`**. |

Correcto y verificado: los filtros son `<button>` reales con `aria-pressed`, las
tarjetas responden a Enter y Espacio, hay `<legend>` en los `<fieldset>`, `lang` se
actualiza al cambiar de idioma, y las fuentes usan `font-display: swap`.

---

## 7. Rendimiento

| Sev | Hallazgo |
|---|---|
| **ALTO** | Los 577 KB de GitHub se sirven en producción y van dentro de un ZIP (C-1). |
| MEDIO | `catalog.json` pesa **707 KB** y se pide **dos veces**: el `<link rel="preload" … crossorigin>` de las tres páginas y el `fetch()` de `app.js:1196` **sin** `crossorigin` no comparten clave de caché. |
| MEDIO | Los 119 ZIP versionados (10,4 MB) **no están** en `.vercelignore`, así que se despliegan. |
| BAJO | `Web/data/catalog.js`, 22,9 MB, existe en disco; está en `.gitignore`, pero cualquier `git add -A` con el `.gitignore` alterado lo expone. |

Correcto: la rejilla **sí está paginada** (`pageSize = 9`), los previews se montan con
`IntersectionObserver` (`rootMargin: 400px`), los scripts usan `defer`, y la compresión
brotli funciona (23,5 MB → 3,29 MB).

---

## 8. Higiene y CI

### Faltan

- `.gitattributes`: 2 líneas, **ningún binario declarado**. Faltan `*.zip`, `*.woff2`,
  `*.jpg`.
- `.gitignore`: `*.zip`, `Web/zips/`, `.idea/`, `*.iml`, `*.swp`, `*~`, `*.orig`,
  `*.rej`, `dist/`, `build/`, `coverage/`, `yarn-error.log`, `pnpm-debug.log*`.
- `.vercelignore`: `*.zip`, `.git/`, `GevendraAutorExterno/`. Además `Docs/**` seguido de
  `!Docs/THIRD_PARTY_NOTICES.md` es un bug de semántica gitignore: **no se puede
  reincluir un fichero si su carpeta madre está excluida**, así que al primer `Docs/algo/`
  el aviso de licencias dejaría de publicarse sin aviso.
- Los 9 ficheros estándar: `CODE_OF_CONDUCT.md`, `.editorconfig`, `.nvmrc`, `PRIVACY.md`,
  `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`,
  `.github/dependabot.yml`, `.github/FUNDING.yml`, `.github/CODEOWNERS`.
- `.github/workflows/validate.yml`: matriz de Node `[20, 22, 24]` (hoy fija `22`, así
  que lo que `package.json` promete no está verificado); y **ejecutar lo que ejecuta
  Vercel**: hoy el CI corre `generate-catalog + validate + validar-csp`, y
  `stamp-assets.mjs` y `build-zips.mjs` nunca se ejecutan en CI.

### Código muerto

- `Web/scripts/stamp-assets.mjs:74` — `const eol` calculada y nunca usada; el comentario
  de `:83-85` sugiere que cumple una función que no cumple.
- `creaciones-primium/tarjetas/.gitkeep` — redundante, la carpeta ya tiene 71
  subcarpetas. (El de `otros/` sí hace falta.)
- `.footer-meta` declarado dos veces en `site.css`.
- `Web/scripts/build-zips.mjs` se ejecuta en producción pero no aparece en ningún
  documento: ni en los scripts de `package.json`, ni en el árbol del README, ni en el
  alcance de `SECURITY.md`.

---

## 9. El historial

El rumor de «unas 1 700 líneas de notas internas» era una estimación muy a la baja:

```
git show d650750 --numstat    ->  9 793 líneas borradas
                                9 308 de ellas bajo Docs/
```

Incluyen los prompts completos con los que se generó la biblioteca. Todo eso es
recuperable hoy con `git show d650750^:<ruta>`. Además, `Docs/` vuelve a estar
versionado con **5 documentos de trabajo** dentro de un repositorio público.

Nada de esto se arregla borrando ficheros: requiere reescribir la historia, en las
**tres** ramas, con force-push. Es una decisión de quien mantiene el proyecto, y no debe
ir junto a ningún otro cambio.

---

## 10. Orden propuesto

| # | Qué | Coste |
|---|---|---|
| 1 | Enseñar por qué no hay botón visible en el portal de Davoker (§2.1) | pequeño, pero es lo que más te está costando |
| 2 | Borrar el CSS de GitHub y poner una URL de ejemplo (C-1) | 1 comando + 1 línea |
| 3 | `SECURITY.md:22` → canal privado de GitHub (C-2) | **descartada**: ver Fase 1 |
| 4 | Excluir `*.zip` en `collectComponentFiles` y sacarlos del índice (H-2) | libera 7,95 MB |
| 5 | Arreglar `build-zips.mjs` para que use la licencia de la colección (H-3) | ~5 líneas |
| 6 | Portar `lstat`/`realpath` de `generate-catalog.mjs` a `serve.mjs` (H-1) | copiar 2 líneas |
| 7 | `site.css:741` — quitar el `outline: 0` del buscador | 1 línea |
| 8 | Las 16 filas de documentación (§4) | mecánico |
| 9 | `.gitignore`, `.vercelignore`, `.gitattributes`, ficheros estándar (§8) | mecánico |
| 10 | Crédito en los 1 018 demos (C-4) | **decisión**: 1 018 ficheros o solo dentro del ZIP |
| 11 | Reescribir el historial (§9) | **decisión**: force-push en 3 ramas |
