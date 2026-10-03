# Fase 1 aplicada — sandbox, wallet, audit, CodeQL y `SECURITY.md`

**Fecha:** 2026-10-02/03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), §Fase 1 ·
**Alcance:** cinco subfases (1.1 a 1.5) · **Estado: cerrada y fusionada**

La Fase 1 es la que convierte en código todo lo que la Fase 0 preparó en la
interfaz: los demos dejan de correr en el origen del sitio, la dirección de
donación y las vulnerabilidades de dependencias pasan a comprobarse en cada
ejecución del CI, CodeQL empieza a analizar el código, `SECURITY.md` deja de
publicar un correo personal, y de paso se corrige un nombre de status check que
habría dejado bloqueado cualquier PR.

Todo entró por el **PR #3**, fusionado en `main` con **`ff215a2`**.

---

## 1. Qué se hizo

| Subfase | Commit | Qué cambió |
|---|---|---|
| 1.1 | `d5c73a1` | CSP con `sandbox` para las 1018 rutas de demo |
| — | `edb17ca` | constancia de la Fase 0 en `FaseAplicadaDeClaude/Fase0.md` |
| 1.2 | `d44acff` | test de la dirección de donación en el CI |
| 1.3 | `6a0a008` | `npm audit --audit-level=high` en el CI |
| 1.4 | `6f5a1e8` | `.github/workflows/codeql.yml` con acciones fijadas por SHA |
| 1.5 | `c54200b` | `SECURITY.md` sin correo personal |
| 1.5+ | `d2a79fb` | el correo también fuera de `PLAN-MEJORAS-OPENCODE.md` |

**Alcance del PR: 9 ficheros, 635 líneas añadidas, 9 quitadas.**

```text
.github/workflows/codeql.yml                       |  66 +++++   (nuevo)
.github/workflows/validate.yml                     |   9 +
CHANGELOG.md                                       | 157 +++++++++++++
.../FaseAplicadaDeClaude/Fase0.md                  | 229 +++++++++++++++++++++
SECURITY.md                                        |   2 +-
Web/scripts/serve.mjs                              |  38 +++-
Web/scripts/validar-csp.mjs                        |  76 ++++++-
Web/scripts/validate.mjs                           |  31 +++
vercel.json                                        |  36 ++++
9 files changed, 635 insertions(+), 9 deletions(-)
```

### 1.1 Los demos se abren con `sandbox`

**El problema.** Todos los demos del sitio se servían con la CSP global
`/(.*)`, que solo fija cabeceras de seguridad y **no aísla nada**. Al abrir un
demo directamente en el navegador —no dentro del iframe del catálogo— corría
**en el origen del sitio**: mismo `localStorage`, mismo alcance de cookies,
mismo `document.cookie`. Cualquier demo de terceros con un `innerHTML` mal usado
(`innerHTML` mal usado, las 6 alertas de CodeQL de §3.3) habría estado en las
mismas condiciones que la web principal.

**Lo que cambió.** Cuatro bloques nuevos en `vercel.json`, colocados **después**
del global `/(.*)` (Vercel aplica el último `source` que coincide, así que el
orden es lo que hace que ganen):

| `source` | `sandbox` |
|---|---|
| `/CreacionesNuevas/(.*index\.html)` | `allow-scripts allow-forms allow-popups allow-downloads` |
| `/creaciones-primium/(.*index\.html)` | ídem |
| `/DavokerDise%C3%B1ador/(.*index\.html)` | ídem (forma URL-encoded) |
| `/DavokerDiseñador/(.*index\.html)` | ídem (forma acentuada) |

**Nunca `allow-same-origin`.** Sin eso, el documento queda en un origen opaco:
no lee ni escribe `localStorage`, no ve `document.cookie`, no puede llamar a
`localStorage` (que además lanza excepción dentro del sandbox) y no puede
tocar el iframe padre.

Dos scripts para que el comprobador y el servidor local piensen igual:

- `Web/scripts/validar-csp.mjs` — selecciona la política global por
  `source === "/(.*)"` (no por posición), valida que los cuatro bloques tengan
  `sandbox` y que cubran exactamente las **1018 de 1018** rutas de demo.
- `Web/scripts/serve.mjs` — `cspRules` + `cspFor(ruta)`, que recorta la query
  con `new URL(request.url, ...).pathname` para que `?previewRevision=99` no
  se lo salte.

### 1.2 Test de la dirección de donación

Nueva **sección 8** en `Web/scripts/validate.mjs`: `donationAddress` +
`donationFiles` (los 3 HTML + `app.js`). Comprueba que la dirección
`0xa8f0230135b4f6a959358be3e8e8531f3551fa81` esté escrita exactamente una vez
por HTML y dos veces en `app.js`, y **falla** si difiere o si falta.

No hay forma de que alguien cambie la wallet por la suya y pase el CI sin que
se note.

### 1.3 `npm audit` en el CI

Paso `npm audit --audit-level=high` tras `npm ci` en `.github/workflows/validate.yml`.

- **`--audit-level=high`**: corta vulnerabilidades *high* y *critical*; las
  *moderate* no rompen el PR para no dejar el repo permanentemente en rojo.
- Estado en el momento de escribir esto: **`found 0 vulnerabilities`**.
- El YAML se validó con `npx js-yaml` antes de commitearlo.

### 1.4 Análisis de código con CodeQL

Fichero nuevo `.github/workflows/codeql.yml`:

| Campo | Valor |
|---|---|
| Disparadores | `push(main)`, `pull_request`, cron `17 4 * * 1` (lunes 04:17 UTC) |
| Lenguajes | `javascript-typescript` |
| Permisos | `contents: read` + `security-events: write` |
| `build-mode` | `none` |
| Acciones | fijadas por **SHA**, con comentario `# vX.Y.Z` |

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
uses: github/codeql-action@2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2 # v4.38.2
```

Las dos SHAs salen de `git ls-remote` (`gh` no está instalado). La del
`codeql-action` es la del **tag anotado**, que no es la del commit que apunta
la rama: por eso no coincide con lo que saldría de un `git rev-parse`.

**Por qué solo corre en `main` y en los PRs:** el cron es semanal y los
resultados completos sobre los 1018 demos solo existen en `main`.

### 1.5 `SECURITY.md` sin correo personal

`SECURITY.md:22` pasó del párrafo «Alternativa por correo» a un enlace
directo:

```text
https://github.com/kindred-98/Libreria_HTML_CSS/security/advisories/new
```

El **STOP** de la fase exigía tener activo el reporte privado de
vulnerabilidades (Fase 0), y lo estaba, así que se podía hacer.

Verificado: **1 ocurrencia** en todo el repo y la URL responde `302` hacia
`github.com/login?return_to=...advisories/new`, o sea que existe y pide login
— justo lo que tiene que ver alguien que va a reportar.

**Ampliación posterior (`d2a79fb`):** con el visto bueno de Ángel, el correo
también salió de `PLAN-MEJORAS-OPENCODE.md:110`, sustituido por el marcador
`<correo-personal-del-mantenedor>`. La orden del `grep` del plan sigue
funcionando con el marcador.

---

## 2. Decisiones y desviaciones

### 2.1 Desviación: `(.*index\.html)` en vez de `(.*\.html)`

El plan decía *«reutilizando los patrones `\.html` que ya existen en el
archivo»*. Si se copian tal cual, arrastran **`davoker.html` y `transicion.html`**, que son
páginas del sitio y no demos, y acaban metidas en el sandbox sin motivo.

Comprobación previa:

```text
1018 de 1018 rutas de demo terminan en index.html · 0 excepciones
```

Con el comodín `.*index\.html` se cubre **todo** sin dejar nada fuera y sin
meter a nadie de más. **Decisión tomada y documentada aquí.**

### 2.2 Corrección del ruleset: los status checks no existían

La Fase 0 configuró `Require status checks to pass` con **`Validar sitio`**.
Ese es el **nombre del workflow**, pero GitHub crea un check por **job** y el
nombre del workflow **no se reporta como check**.

Resultado: al abrir el PR, `main` esperaba un check que **nunca llegaba** y no
dejaba mergear. Se corrigió en el ruleset a los tres nombres reales:

```text
Validar (Node 20)   ·   Validar (Node 22)   ·   Validar (Node 24)
```

Los tres son ahora **Required**. Es un error propio de la Fase 0, detectado al
usarlo, y queda anotado para que no se repita.

### 2.3 `Require an additional approval for unattributed Copilot pull requests`

Regla extra que la Fase 0 dejó **activada**. Solo aplica a PRs redactados por
Copilot sin atribución y no molesta a nadie.

---

## 3. Verificación

### 3.1 Comandos

```text
npm run validar
  info  1018 componentes · 1018 descargables · 0 sin redistribucion
  Todo correcto: 1018 componentes coherentes con el disco.
  demos aisladas con sandbox: 1018 de 1018
  ok: el CSP cubre todos los recursos externos que usan los demos, y no sobra nada

npm run validar:layout
  info  5 paginas x 23 anchos = 115 medidas, tolerancia 1px
  Ninguna pagina se sale de lado en 23 anchos.

npm audit --audit-level=high      -> found 0 vulnerabilities (exit 0)
npx js-yaml validate.yml          -> exit 0
npx js-yaml codeql.yml            -> exit 0
git grep -rn "angelecheniq" -- Docs/   -> 0 apariciones
```

### 3.2 Prueba `curl` obligatoria en el preview (1.1)

Contra `https://libreria-html-css-git-update-kindred-98-ad.vercel.app`, 8/8:

```text
[OK] SITIO  sin sandbox    /Web/index.html
[OK] SITIO  sin sandbox    /Web/components.html
[OK] SITIO  sin sandbox    /Web/team-core.html
[OK] DEMO   CON sandbox    /CreacionesNuevas/3d-cube-rubiks-twist/index.html
[OK] DEMO   CON sandbox    ...index.html?previewRevision=99
[OK] DEMO   CON sandbox    /CreacionesNuevas/3d-range-slider/index.html
[OK] DEMO   CON sandbox    /DavokerDise%C3%B1ador/harry_potter/arena/index.html
[OK] DEMO   CON sandbox    /creaciones-primium/animaciones/bokeh-depth-of-field/index.html
```

**Vercel Authentication** estaba activa y devolvía `302` a `vercel.com/sso-api`:
se apagó para el `curl` y **se volvió a encender después** (re-verificado: sigue
en `302`).

En **producción**, una vez fusionado:

```text
HTTP/1.1 200 OK   /Web/index.html                             sin sandbox
HTTP/1.1 200 OK   /CreacionesNuevas/3d-cube-rubiks-twist/...   CON sandbox
Validar sitio en main                                          success
CodeQL en main                                                 success (2 min 16 s)
```

### 3.3 Pruebas negativas (romper a propósito y revertir)

Nueve pruebas. En todos los casos los ficheros quedaron **idénticos** al final
(`git diff` vacío).

| Qué se rompió | Resultado |
|---|---|
| Sandbox basura en los 4 bloques | exit 1 |
| Borrados los 4 bloques | exit 1 |
| Sandbox añadido a la global `/(.*)` | exit 1 — *«aislaria la propia web»* |
| Sin sandbox en un solo bloque | exit 1 — *«119 de 1018 demos no quedan aisladas»* |
| `source` duplicado que deja hueco | exit 1 — *«248 de 1018 demos no quedan aisladas»* |
| Otra wallet en `components.html` | exit 1 (2 fallos) |
| Wallet borrada de `team-core.html` | exit 1 |
| Segunda wallet metida en `app.js` | exit 1 |
| Las dos wallets de `app.js` cambiadas | exit 1 |

### 3.4 Resultado de CodeQL en `main` — 9 alertas abiertas

El plan mandaba **contarlos, no arreglarlos**. Recuento tras el primer
escaneo completo:

| Regla | Nº | Severidad |
|---|---|---|
| `DOM text reinterpreted as HTML` | 6 | High |
| `Incomplete string escaping or encoding` | 1 | High |
| `Double escaping or unescaping` | 1 | High |
| `Replacement of a substring with itself` | 1 | Medium |

**8 en demos de terceros** (`CreacionesNuevas/`, `creaciones-primium/`) y
**1 en código propio**.

**Las 6 de XSS** — el patrón es `chip.innerHTML = val` con `val` del propio
usuario (`CreacionesNuevas/tag-input-chip-form/script.js:7` y cinco parecidas).
Es auto-XSS y además va dentro del iframe con `sandbox` de la 1.1 + el CSP
`sandbox`: **no puede tocar el `localStorage` ni las cookies del sitio.**

**La nuestra** — `Web/scripts/generate-catalog.mjs:120`, en `cleanText()`:
descodifica `&amp;` antes que `&lt;`, así que `&amp;lt;` se descodifica dos
veces. `cleanText()` solo se usa en el título del demo (`:299`) y `app.js` pinta
con `textContent`/`createElement`; su único `innerHTML` (`:532`) es un SVG fijo.
**No hay camino a HTML: no es explotable.**

**La `Incomplete string escaping`** — `guild-application-long/script.js:343`,
`.replace('*', '')` con *string* (no regex) solo quita la primera `*`. El
sumidero es `textContent`: es **un asterisco de más**, no seguridad.

**La `Replacement of a substring with itself`** —
`mandelbrot-fractal-zoom/script.js:252`, `.replace("e-","e-")` es un **no-op**
que no hace nada. Cero impacto.

**Decisión (Ángel, 2026-10-03): se dejan las 9 abiertas** y se pasa a la Fase 2.
Siguen visibles en la pestaña *Security* como pendiente; ninguna pone en riesgo
la web y la de código propio ya está caracterizada.

---

## 4. Estado después de la fase

| Punto del plan | Estado |
|---|---|
| 1.1 CSP `sandbox` para los demos | **cerrado** (1018/1018, 8/8 en preview) |
| 1.2 Test de la dirección de donación | **cerrado** (4 pruebas negativas) |
| 1.3 `npm audit` en el CI | **cerrado** (0 vulnerabilidades) |
| 1.4 CodeQL en cada PR | **cerrado** (acciones por SHA, run en verde) |
| 1.5 `SECURITY.md` sin correo | **cerrado** (+ ampliación `d2a79fb`) |
| Ruleset con nombres de check correctos | **corregido** (§2.2) |
| 9 alertas de CodeQL | abiertas, decidido no tocar (§3.4) |
| Correo en el historial de git | abierto → **fase 9** (requiere `git filter-repo`) |
| 3 issues de SonarCloud | fuera del plan, sin mirar |

---

## 5. Siguiente: Fase 2

`Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md` §Fase 2 — **bugs concretos**:

1. **2.1 `markdown-preview-live`** — cambiar `` /```([sS]*?)```/g `` por
   `` /```([\s\S]*?)```/g ``. El `[sS]` solo coincide con las letras *s* y *S*,
   así que los bloques de código **nunca se renderizan**. **No se puede reordenar
   el escape** de `&`, `<` y `>`, que va primero y es lo que evita el XSS en un
   demo que usa `innerHTML`. Dos pruebas con Playwright, ya disponible como
   `devDependency`.
2. **2.2 `url-qr-code-generator`** — dejar de mandar la URL del usuario a
   `api.qrserver.com` (`script.js:8`) e incrustar `qrcode-generator` (MIT) en
   `vendor/` con su licencia, generar el QR en local como data URL, mantener el
   botón de descarga, manejar «URL demasiado larga» en `qrHint`, dar de alta la
   librería en `Docs/THIRD_PARTY_NOTICES.md`, verificar el ZIP del demo y
   `missingReferences`, y **quitar `api.qrserver.com` de `img-src` en los dos
   bloques CSP** de `vercel.json` si ya nadie lo usa.

Criterios: `grep` de `qrserver` sin resultados fuera de `Docs/`, QR generado sin
conexión, y `npm run validar` en verde.
