# Fase 2 aplicada — markdown y QR sin servicio externo

**Fecha:** 2026-10-03 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), §Fase 2 ·
**Alcance:** dos subfases (2.1 y 2.2) · **Estado: cerrada y fusionada**

La Fase 2 es la primera que arregla demos de verdad. La 2.1 corrige una regex
que impedía renderizar ningún bloque de código, y la 2.2 deja de mandar la URL
del visitante a un dominio de terceros: el QR se dibuja ahora en el navegador
con una librería incrustada en el repo.

Todo entró por el **PR #4**, fusionado en `main` con **`06daa83`**.

---

## 1. Qué se hizo

| Subfase | Commit | Qué cambió |
|---|---|---|
| — | `d2a79fb` | el correo personal sale de `PLAN-MEJORAS-OPENCODE.md` (ampliación 1.5) |
| — | `8eaf9f7` | constancia de la Fase 1 en `FaseAplicadaDeClaude/Fase1.md` |
| 2.1 | `e97c51b` | `` /```([sS]*?)```/g `` → `` /```([\s\S]*?)```/g `` + comentario |
| 2.2 | `ce0b87c` | QR en local con `qrcode-generator` incrustado; `api.qrserver.com` fuera |

**Alcance del PR: 13 ficheros, 2 768 líneas añadidas, 14 quitadas.**

Los dos primeros commits **no son de la Fase 2**: eran material de la Fase 1
que seguía pendiente y viajó en el mismo PR para no abrir dos.

```text
CreacionesNuevas/markdown-preview-live/script.js   |    6 +-
CreacionesNuevas/url-qr-code-generator/index.html  |    3 +-
CreacionesNuevas/url-qr-code-generator/script.js   |   18 +-
.../vendor/LICENSE-qrcode-generator                |   21 +
.../url-qr-code-generator/vendor/qrcode.js         | 2297 ++++++++++++++
.../FaseAplicadaDeClaude/Fase1.md                  |  327 +++
Docs/02-auditorias/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md |    2 +-
Docs/THIRD_PARTY_NOTICES.md                        |   15 +
PRIVACY.md                                         |    1 -
README.md                                          |    2 +-
Web/scripts/validar-csp.mjs                        |    1 -
vercel.json                                        |   10 +-
13 files changed, 2768 insertions(+), 14 deletions(-)
```

### 2.1 `markdown-preview-live`: la regex que nunca coincidía

**El bug.** `CreacionesNuevas/markdown-preview-live/script.js`:

```js
.replace(/```([sS]*?)```/g,'<pre><code>$1</code></pre>')
               ^^^
```

`[sS]` significa *«la letra **s** o la letra **S**»*. Lo que se quería era
`[\s\S]`, es decir *«cualquier carácter, **también los saltos de línea**»*.
Le faltaba una barra.

Como consecuencia, un bloque con ``` solo se habría detectado si **todo su
contenido** estuviera formado por las letras s y S. En la práctica nunca pasa:
el demo rompía el bloque con la regla de código en línea y el usuario veía las
comillas invertidas en crudo. El propio texto de ejemplo que trae `index.html`
(líneas 24 a 26) ya contenía un bloque que no se renderizaba.

**Lo que no se tocó.** `parse()` se vuelca a `innerHTML` en las dos últimas
líneas del fichero, y es el escape de `&`, `<` y `>` de la primera línea de
`parse()` lo que hace que `<img src=x onerror=...>` se pinte como texto. Se
mantuvo ese orden y se añadió un comentario de cuatro líneas que lo explica,
justo encima, para que nadie lo reordene después.

### 2.2 `url-qr-code-generator`: el QR deja de salir de la web

**El problema.** `script.js` construía

```js
const api='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(url);
```

La URL del visitante viajaba a un dominio ajeno: el demo dependía de un tercero
para funcionar, no trabajaba sin conexión y la CSP tenía que abrir `img-src`
para ese host.

**Lo que se hizo.**

| Paso | Detalle |
|---|---|
| Versión | `npm view qrcode-generator version` → **2.0.4**, `"license": "MIT"` |
| Descarga | `npm pack qrcode-generator`, del tarball solo el build UMD `dist/qrcode.js` |
| Incrustado | `vendor/qrcode.js` (56 694 B) + `vendor/LICENSE-qrcode-generator` (1 071 B) |
| Carga | `<script defer src="vendor/qrcode.js">` **antes** de `script.js` en `index.html` |
| `script.js` | `qrcode(0,'M')` → `addData` → `make` → `createDataURL(...)`, data URL en el `<img>` |
| Error | `try/catch` sobre el mensaje real `code length overflow` → texto en `qrHint` |
| Descarga | sigue funcionando; el nombre pasa de `.png` a `.gif` porque el mime del data URL es `image/gif` |
| Aviso | sección nueva en `Docs/THIRD_PARTY_NOTICES.md` |

`typeNumber 0` es automático: la librería crece de 25 módulos para una URL
corta hasta 177, y lanza una **cadena** (no un `Error`) cuando la URL no cabe
— a partir de unos 3 000 caracteres, con `code length overflow. (20020>18672)`.

**El resto de la cadena:**

- `img-src` de `vercel.json` pierde `https://api.qrserver.com` en **los cinco
  bloques** CSP (el global más los cuatro de sandbox de la Fase 1).
- Su entrada sale de la tabla `RELEVANCE` de `Web/scripts/validar-csp.mjs`.
- `README.md` pasa de **nueve a ocho** hosts externos.
- `PRIVACY.md` deja de citarlo como destino de datos.

---

## 2. Decisiones y desviaciones

### 2.1 La señal que disparó el cambio

Antes de tocar nada, el plan manda dejar que avise `validar-csp`. Así salió:

```text
SOBRANTE: img-src sigue permitiendo api.qrserver.com, que ya no usa ningun demo
```

Y la tabla de hosts del propio validador pasó de **9 a 8**:

```text
upload.wikimedia.org          860 usos  [img-src]
commons.wikimedia.org         350 usos  [img-src]
github.com                      8 usos  [*]
avatars.githubusercontent.com    3 usos  [img-src]
www.googletagmanager.com        1 usos  [script-src]
www.google-analytics.com        1 usos  [connect-src, img-src]
region1.google-analytics.com    1 usos  [connect-src]
libreria-html-css.vercel.app    1 usos  [*]
```

### 2.2 Desviaciones respecto al plan

1. **Se tocaron `README.md` y `PRIVACY.md`, que el plan no menciona.** Al
   quitar el tercero, las dos afirmaciones quedaban falsas: `README.md` decía
   «nueve hosts externos» y `PRIVACY.md` listaba `api.qrserver.com` como
   destino de datos. Dejarlas habría sido publicar una mentira en una
   política de privacidad.
2. **Se quitó la entrada `RELEVANCE` de `validar-csp.mjs`.** El plan solo
   hablaba de `vercel.json`, pero la entrada quedaba muerta y seguía diciendo
   «QR generados al vuelo». No cambia el comportamiento: esa tabla solo se
   aplicaba a hosts presentes en el escaneo.
3. **Se actualizó el `meta description` de `index.html`**, que seguía diciendo
   «using the QR Server API».
4. **La resolución del QR se calcula.** `Math.round(180/(módulos+8))` para que
   el GIF nazca cerca de los **180 px** que fija el CSS de `#qrImg`. El plan no
   especificaba tamaño y con el valor por defecto de la librería (2 px por
   módulo) el QR salía ampliado y borroso. Con margen por módulo la librería ya
   respeta la zona de silencio de 4 módulos que pide el estándar.
5. **Los tests no se commitean**, como pide el plan («sin commitear
   dependencias nuevas»). Se corrieron con Playwright, que ya era
   `devDependency`, y los scripts se borraron al terminar.

### 2.3 Sobre el ZIP del componente

`build-zips.mjs` solo escribe ZIP en disco para los 119 de `DavokerDiseñador`:
`rutaSalidaZip()` devuelve `null` para el resto (línea 150), porque
`app.js` los construye en el navegador. Así que el ZIP de este componente no se
genera en disco.

Lo que sí se comprobó es la **lista de la que ese ZIP se alimenta**,
`Web/data/sources/url-qr-code-generator.json`:

```text
license: MIT   ·   licenseFile: LICENSE   ·   downloadable: true
missingReferences: []

files (6):
  index.html                               url-qr-code-generator/index.html
  LICENSE                                  url-qr-code-generator/LICENSE
  script.js                                url-qr-code-generator/script.js
  styles.css                               url-qr-code-generator/styles.css
  vendor/LICENSE-qrcode-generator          url-qr-code-generator/vendor/LICENSE-qrcode-generator
  vendor/qrcode.js                         url-qr-code-generator/vendor/qrcode.js
```

`vendor/` es **la primera carpeta de su tipo en todo el repositorio**: antes no
existía ninguna.

---

## 3. Verificación

### 3.1 Comandos

```text
npm run validar
  info  1018 componentes · 1018 descargables · 0 sin redistribucion
  Todo correcto: 1018 componentes coherentes con el disco.
  demos aisladas con sandbox: 1018 de 1018
  ok: el CSP cubre todos los recursos externos que usan los demos, y no sobra nada
  EXIT=0

npm run validar:layout
  info  5 paginas x 23 anchos = 115 medidas, tolerancia 1px
  Ninguna pagina se sale de lado en 23 anchos.
  EXIT=0

git grep -rn "qrserver" -- "*.js" "*.html" "*.css"    ->  sin resultados
npm audit --audit-level=high                          ->  found 0 vulnerabilities
```

### 3.2 Criterios de aceptación de la fase

| Criterio | Resultado |
|---|---|
| `grep -rn "qrserver" --include=*.js --include=*.html --include=*.css .` no devuelve nada fuera de `Docs/` | ✅ **0 resultados** |
| El QR se genera sin conexión (Playwright en modo offline) | ✅ 0 peticiones externas |
| `npm run validar` pasa | ✅ exit 0 |

### 3.3 Prueba de la 2.1, antes y después

```text
ANTES   <pre><code> presente: FALSE
        salida: <code>`</code>js\nconst x = 42;\nconst y = 7;\n<code>`</code>
        (la regla de codigo en linea se comia las comillas del bloque)

DESPUES <pre><code> presente: TRUE
        salida: <pre><code>js\nconst x = 42;\nconst y = 7;\n</code></pre>

XSS en las dos versiones:
        entrada  <img src=x onerror=alert(1)>
        salida   &lt;img src=x onerror=alert(1)&gt;
        elementos <img>: 0  ·  alert() disparado: 0
```

Se ejecutó contra la versión antigua (sacada de `git show`) y contra la nueva,
mismo script y mismo navegador, para que la comparación sea real.

### 3.4 Prueba de la 2.2, Playwright en modo offline

```text
[1] QR generado sin conexion
    img.src       : data:image/gif;base64,R0lGODdhpQClAIAAAAAAAP//... (1894 chars)
    es data URL   : true · img visible · qrHint oculto · dlBtn visible

[2] URL demasiado larga (3 200 caracteres)
    qrHint texto  : "URL too long for a QR code"
    img oculto    : true · dlBtn oculto: true
    (la libreria lanza "code length overflow. (20020>18672)")

[3] Vuelve a funcionar tras el error  ->  data:image/gif;base64,... (2174 chars)

[4] Boton de descarga  ->  SI · nombre: qrcode.gif

[5] Peticiones de red (offline)
    peticiones totales : 4 (las del propio file://)
    externas http(s)   : 0
    fallidas           : 0  ·  errores de pagina: 0
```

---

## 4. Estado después de la fase

| Punto del plan | Estado |
|---|---|
| 2.1 Regex de los bloques de código | **cerrado** (antes/después en §3.3) |
| 2.1 Orden de escape preservado y comentado | **cerrado** |
| 2.2 Librería MIT incrustada con su licencia | **cerrado** |
| 2.2 `script.js` genera el QR en local | **cerrado** |
| 2.2 Botón de descarga sigue funcionando | **cerrado** (`qrcode.gif`) |
| 2.2 Error de URL larga en `qrHint` | **cerrado** |
| 2.2 `<script>` en `index.html` antes de `script.js` | **cerrado** |
| 2.2 Aviso en `THIRD_PARTY_NOTICES.md` | **cerrado** |
| 2.2 `missingReferences` vacío | **cerrado** |
| 2.2 `api.qrserver.com` fuera de `img-src` (los 5 bloques) | **cerrado** |
| Correo fuera de `PLAN-MEJORAS-OPENCODE.md` | **cerrado** (`d2a79fb`) |
| `Fase1.md` como constancia | **cerrado** (`8eaf9f7`) |
| 9 alertas de CodeQL | abiertas, decidido no tocar |
| Correo en el historial de git | abierto → **fase 9** |
| 3 issues de SonarCloud | fuera del plan, sin mirar |

---

## 5. Siguiente: Fase 3

`Docs/02-auditorias/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md` §Fase 3 — **test de humo
de los 1 018 demos**. Esta fase **no arregla nada: solo mide**.

1. **3.1** `Web/scripts/smoke-demos.mjs` + `npm run validar:demos`. Levanta
   `Web/scripts/serve.mjs` y abre cada demo en un iframe con **el mismo sandbox
   que producción** (`allow-scripts allow-forms allow-popups`, sin
   `allow-same-origin`), concurrencia 6, espera `load` + 1 s. Registra errores
   de consola, excepciones, peticiones fallidas, respuestas ≥ 400 y **peticiones
   a hosts externos**, estas últimas abortadas con `page.route` para que el
   resultado no dependa de la red. Salida a `Web/data/smoke-report.json` (en
   `.gitignore`).
2. **3.2** `Web/data/smoke-baseline.json` (sí se versiona) con los fallos
   actuales. El comando pasa si no hay fallos **nuevos** y avisa si una entrada
   de la línea base ya no falla.
3. **3.3** Paso en el CI de Node 24 tras `validar:layout`, con medición de
   tiempo: si supera 10 minutos, `--muestra 60` en PRs y ejecución completa
   en `push` a `main` y `workflow_dispatch`.

Criterios: el comando termina y produce el informe, la línea base está creada y
el comando pasa con ella, y el informe del PR incluye total de demos, cuántas
fallan, desglose por tipo y la lista de las que hacen peticiones externas.

**Aviso de la fase 4:** si la línea base sale con **más de 100 demos rotos**,
hay que parar y entregar la lista priorizada a Ángel antes de arreglar nada.
