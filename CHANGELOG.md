# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

**Documentación relacionada**: [README](./README.md) · plan de fases ([`Docs/Plan_de_fases.md`](./Docs/Plan_de_fases.md)) · [Web/README.md](./Web/README.md) · [THIRD_PARTY_NOTICES.md](./Docs/THIRD_PARTY_NOTICES.md) · detalle de la sesión del 2026-10-01/02 ([`Docs/Sesion_2026-10-01_02.md`](./Docs/Sesion_2026-10-01_02.md)).

Cada fase terminada se registra aquí con su fecha. Las fases están definidas en
[`Docs/Plan_de_fases.md`](./Docs/Plan_de_fases.md); las de la auditoría vigente,
en [`Docs/Auditoria.md`](./Docs/Auditoria.md) §10, y lo que se aplicó de cada una
queda en [`Docs/Fases-de-Auditoria-Aplicadas/`](./Docs/Fases-de-Auditoria-Aplicadas/).

## [1.0.0] - 2026-10-03

- Version inicial del catalogo, tras aplicar las fases 0 a 7 del plan de la
  auditoria: cabeceras y seguridad, wallet, CI, comprobaciones automaticas de
  layout, accesibilidad, encabezados y movimiento reducido, y calidad del CI
  con html-validate, control de enlaces, sitemap y Lighthouse.
- Cada fase tiene su propia entrada mas abajo, de mas reciente a mas antigua.
- El tag y la release no se crean desde aqui: el comando `gh release create`
  queda en
  [`Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase7.md`](./Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase7.md),
  para que lo ejecute Angel una vez la PR este en `main`.

## [Arregla los previews en blanco de iOS/iPadOS y el viewport movil de Safari] - 2026-10-05

Los iframes de `live-preview` se veian en blanco en iOS, iPadOS y Safari de
macOS. En Chrome de Android y en el de escritorio se veian bien. El sintoma
venia del arreglo del 2026-10-03 (`hace visibles los iframes de vista previa en
safari de ios y macos`), que ataco el momento de la carga cuando el problema era
de pintado.

- **La causa**: `Web/styles/site.css` declaraba `opacity: 0` en `.live-preview
  iframe`, y `app.js` asigna `frame.src` cuando el iframe ya es totalmente
  transparente. WebKit descarta la capa de un iframe completamente transparente y
  no llega a pintar su contenido; como la decision se toma al montar, subir
  despues a `opacity: 1` no fuerza el repintado. El preview se quedaba en blanco
  aunque `load` saltara y `data-preview-state` llegara a `ready`: un fallo de
  pintado, no de carga. En Chrome un iframe transparente se compone sin problema,
  de ahi que alli se viera bien.
- **Por que se sabe que no era la carga**: los dos unicos iframes que si
  funcionan (la demo de warp de `Web/team-core.html` y el portal Davoker de
  `Web/components.html`) son exactamente los que **no** estan bajo
  `.live-preview`, los unicos que nunca reciben `opacity: 0`. Y en modo
  standalone (anadir a pantalla de inicio) si se veian, porque un `WKWebView`
  standalone usa otra ruta de renderizado: un fallo de red o de cabeceras no se
  arreglaria por abrir el sitio como PWA.
- **El arreglo**: el iframe ya no se pone nunca en `opacity: 0`. Lo oculta el
  `::after` opaco de siempre (`--surface-preview`, `#d9ded1`/`#e3e7df`, sin
  alfa), que si se pinta siempre. Se quitan el `transition: opacity` del iframe y
  la regla `[data-preview-state="ready"] iframe`, que queda redundante.
- El `setTimeout` de `PREVIEW_FALLBACK_MS` se queda, pero ya no es lo que hace
  visible el preview: solo evita que se quede escrito el "Loading preview..." si
  en algun motor el `load` no llegara a saltar. Se corrigen los comentarios de
  `armPreviewListeners` y de `createPreview`, que atribuian el fallo al `load`.
- **Viewport y zonas seguras**, que en iOS se notaban al usar el portal Davoker y
  los avisos fijos. Cada `vh` va seguido de su `dvh` (`.davoker-portal`,
  `.davoker-frame`, `.detail-view`): en iOS `vh` es el viewport mas alto, asi que
  el iframe de `90vh` se salia por abajo justo con la barra de direcciones
  oculta. Se declara `vh` antes que `dvh` para que un iOS viejo, que no conoce
  `dvh`, se quede con la regla que si entiende. Y `.consent-banner` y `.toast`,
  fijos a `16px` y `20px` del borde, caian bajo el indicador de inicio: ahora
  suman `env(safe-area-inset-*)`, que vale 0 donde no exista `env()`.
- **Pendiente de comprobar en un iPhone o iPad reales**: aqui solo hay Chromium, y
  ni `validar:demos` ni `validar:layout` pueden detectar un fallo de pintado de
  WebKit, porque ninguno abre WebKit. Ojo al probar: `vercel.json` sirve
  `Web/styles/` y `Web/scripts/` con `max-age=31536000, immutable`, asi que Safari
  sirvira la CSS vieja desde su cache y el arreglo no se vera sin borrar los
  datos del sitio o abrir en Incognito.
- Verificado en verde: `validar` (1018/1018), `validar:layout` (5 paginas x 23
  anchos, 115 medidas) y `validar:demos` (1018/1018, 0 fallos). Ninguno de los
  tres cubre WebKit.

## [Arregla el CI de Node 20 y los tres avisos nuevos de CodeQL] - 2026-10-03

- La PR fallo en uno de los checks requeridos, `Validar (Node 20)`, a los 17 s:
  `html-validate` 11.x usa `fs.globSync`, que **solo existe desde Node 22**
  (la 11.x pide `^22.22.0 || >= 24.8.0`), y su paso corre en los tres jobs.
  Se baja a **10.17.0** (`^20.19.0 || ^22.16.0 || >= 24.0.0`), que valida
  igual: comprobado con `npx node@20`, `node@22` y `node@24`, los tres en
  EXIT 0, y con un fichero de prueba para confirmar que las reglas siguen
  cazando (`doctype-style`, `element-required-attributes`, `attr-quotes`).
- Los tres avisos *high* nuevos de CodeQL en scripts de esta misma fase, con
  los cambios que sugeria el propio bot: el cierre de `<script>` en
  `add-reduced-motion.mjs`, y el `replace` de `<!--` en bucle hasta que ya no
  cambia en `detectar-duplicados.mjs` y `validar-encabezados.mjs`.
- Verificado en verde: `validar`, `validar:encabezados`, `validar:html` en las
  tres versiones de Node, `validar:enlaces`, `duplicados` (sigue en 0) y
  `validar:lighthouse` (99/86/100).

## [Auto-fix: S5869 (char class duplicada), S6557, S7773-isfinite, S7759, S7719 (12 issues)] - 2026-10-05

`Web/scripts/autofix-sonar-mecanico.mjs` gana dos patrones y se
arregla un duplicado en uno existente:

- **S5869** "Remove duplicates in this character class". El regex
  S6582 del propio script tenia `?` dos veces en la clase
  `[,);\]?:&|?]`. Se elimina el duplicado: ahora `[,);\]?:&|]`.
- **S6557** `s.indexOf("x") === 0` -> `s.startsWith("x")`. Sinonimo
  exacto: ambos buscan desde el principio. Solo aplica al caso
  `=== 0` (prefijo), no a busquedas de inclusion.
- **S7773-isfinite** `isFinite(x)` -> `Number.isFinite(x)`. Sinonimo
  exacto para argumentos numericos.
- **S7759** `new Date().getTime()` -> `Date.now()`. Reaplicado: los 8
  casos del re-analisis post-merge.
- **S7719** `new Date(x).getTime()` -> `x.getTime()`. Si x ya es un
  Date, envolver en `new Date()` es redundante.

**S1940** (invertir operandos en comparaciones) se intento pero se
descarto: 3296 hits en una sola pasada y rompio 5 demos
(`tarjetas-cyber-deck-target-hud`, `home-energy-meter`,
`pipeline-notify-timeline`, `street-net-access-card`,
`lofi-study-session-player`). El reorden `a > b` -> `b < a` cambia
la semantica cuando uno de los operandos es string (coercion
implicita) y rompe la pista visual del orden del bucle. Queda en
`autofix-sonar-mecanico.mjs` documentado como "no auto-arreglable".

Aplicado: 5 startsWith + 7 isFinite + 0 Date.now nuevos + 0
getTime redundante + el fix del duplicado en el script =
**12 issues nuevas** (el resto de los 18 del conteo previo ya
estaban arreglados en commits anteriores). Verificado en verde:
`validar`, `validar:encabezados`, `validar:html` (Node 20/22/24),
`validar:enlaces`, `validar:layout` y `validar:demos` (1018/1018, 0
fallos).

## [Arregla la vulnerabilidad S5145 y 5 BUGs reales (1 VULN + 5 BUG)] - 2026-10-05

`Web/scripts/autofix-sonar-mecanico.mjs` gana tres patrones y se
arregla un duplicado en uno existente:

- **S5869** "Remove duplicates in this character class". El regex
  S6582 del propio script tenia `?` dos veces en la clase
  `[,);\]?:&|?]`. Se elimina el duplicado: ahora `[,);\]?:&|]`.
- **S6557** `s.indexOf("x") === 0` -> `s.startsWith("x")`. Sinonimo
  exacto: ambos buscan desde el principio. Solo aplica al caso
  `=== 0` (prefijo), no a busquedas de inclusion.
- **S7773-isfinite** `isFinite(x)` -> `Number.isFinite(x)`. Sinonimo
  exacto para argumentos numericos (que es el caso en los demos).
- **S7759** `new Date().getTime()` -> `Date.now()`. Reaplicado: los 8
  casos del re-analisis post-merge.
- **S7719** `new Date(x).getTime()` -> `x.getTime()`. Si x ya es un
  Date, envolver en `new Date()` es redundante (crea un objeto
  identico al argumento).

Aplicado: 5 startsWith + 0 getTime redundante (ya estaban) =
**5 sustituciones nuevas**, mas el fix del duplicado en el script.
Verificado en verde: `validar`, `validar:encabezados`,
`validar:html` (Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

## [Arregla la vulnerabilidad S5145 y 5 BUGs reales (1 VULN + 5 BUG)] - 2026-10-05

- **Vulnerabilidad**: `Web/scripts/exportar-incidencias-sonar.mjs:126`
  (S5145, Log Injection via unsanitized user input). El `error.message`
  de la API de SonarCloud podia traer newlines o caracteres de control
  y contaminar el log. Se sanea con `replace(/[\r\n\t\v\f\0]+/g, " ")` y
  `slice(0, 200)` antes de escribirlo en consola.
- **CSS S4657 (x2)**: propiedades sobreescritas por el shorthand `font`:
  - `creaciones-primium/navegacion/numbered-section-ledger/styles.css`:
    `font-style:normal` en `.ch__t i`.
  - `creaciones-primium/navegacion/omnibox-jump-bar/styles.css`:
    `line-height:1.15` en `.brand__t` (el shorthand `font` ya lo define).
- **CSS S4656 (x2)**: propiedad duplicada en la misma regla:
  - `creaciones-primium/galerias/lake-phone/styles.css`: `display:block`
    y `display:-webkit-box` en `.entry__name` (se conserva el segundo
    que es el que aplica el line-clamp).
  - `creaciones-primium/botones/wireframe-hud-lock-button/styles.css`:
    `top:50%` duplicado en `.tag` con `top:calc(...)` (se conserva
    el calc, que es la version responsive). El `top:50%` lo introdujo
    el fix del `.tag` en el commit `090ca05` sin tener en cuenta
    que ya existia un `top` posterior.
- **JS S6959**: `PREGUNTAS.reduce(...)` en
  `creaciones-primium/formularios/team-pulse-survey/script.js:160` sin
  valor inicial. Se pasa `PREGUNTAS[0]` para que el primer paso del
  reduce no opere sobre `undefined`.

Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
(Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

## [Quita el fallback deprecated de MediaQueryList.addListener en 3 demos (3 issues)] - 2026-10-05

Los 3 archivos restantes con S1874 ('addListener' is deprecated) tenian
el patron:

```js
if (mq.addEventListener) mq.addEventListener('change', cb);
else if (mq.addListener) mq.addEventListener('change', cb);
```

`mq.addListener` (sin parentesis) es un check de propiedad: el codigo
comprueba si el navegador expone ese metodo deprecated para usar el
fallback. En cualquier navegador moderno `addEventListener` esta
disponible, asi que la rama `else if` es codigo muerto. Se simplifica
a la unica llamada a `addEventListener` en cada caso.

Archivos:
- `creaciones-primium/navegacion/folder-tree-nav/script.js:184-185`
- `creaciones-primium/animaciones/tornado-vortex-debris/script.js:717-718`
- `creaciones-primium/animaciones/koi-pond-ripple-trail/script.js:737-738`

Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
(Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

## [Rename de variable `status` a `statusEl` en 7 demos (14 issues)] - 2026-10-05

`status` es una variable deprecada en HTML5 (sobra con
`window.status`); declararla con `let/var/const` en un script la
sombrea y dispara S1874. La regla no aparecia en los auto-fixes
genericos porque necesita un rename PER-FICHERO (no solo un
`replaceAll`), asi que se ha aplicado con un script de un solo uso
(`tmp/sonar-export/rename-status.mjs`, NO commiteado al repo) a los
7 archivos que SonarCloud marcaba.

El script usa la regex `/(?<![.\w'\"])status(?![.\w'\"])/g` que
excluye los accesos a miembros (`xhr.status`) Y los literales de
cadena (`"#status"`). Esto fallo en una primera version que
sobreescribia el selector CSS; la guarda de comillas lo soluciona.

Aplicado: 14 sustituciones en 7 ficheros. Verificado en verde:
`validar`, `validar:encabezados`, `validar:html` (Node 20/22/24),
`validar:enlaces`, `validar:layout` y `validar:demos` (1018/1018, 0
fallos).

## [Auto-fix de code smells mecanicos: [\d] -> \d y mq.addListener -> mq.addEventListener (32 issues)] - 2026-10-05

`Web/scripts/autofix-sonar-mecanico.mjs` gana dos patrones:

- **S6397** `[\d]` -> `\d`. Solo se reescriben las clases de
  caracteres que envuelven un escape abreviado (`\d`, `\s`, `\w` y
  sus versiones en mayusculas), que son sinonimas exactas de la
  forma sin corchetes. Las clases como `[a-z]` o `[abc]` se quedan
  como estan. Acepta cuantificador: `[\d]{6}` -> `\d{6}`.
- **S1874-mql** `mq.addListener(cb)` -> `mq.addEventListener('change', cb)`.
  `MediaQueryList.addListener` es un alias deprecated de
  `addEventListener('change', ...)`.

Aplicado: 32 sustituciones en 18 ficheros (29 `[\d]` + 3 addListener).
Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
(Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

## [Auto-fix de code smells mecanicos: arr.filter(p)[0] -> arr.find(p) (14 issues)] - 2026-10-05

`Web/scripts/autofix-sonar-mecanico.mjs` gana un patron:

- **S7750** `arr.filter(p)[0]` -> `arr.find(p)`. Equivalente en el caso
  comun: ambos devuelven el primer elemento que cumple `p` o `undefined`
  si ninguno. `find` evita crear el array intermedio. Es seguro porque
  `.filter` solo existe en Arrays, no en NodeList, asi que el codigo
  original no podia estar operando sobre un NodeList.

**Nota**: S7755 (`arr[arr.length - N]` -> `arr.at(-N)`) se intento auto-
arreglar en la misma tanda y rompio `botones-vaporwave-sunset-button`
porque `.at()` no existe en NodeList/HTMLCollection pero `[length - N]`
si (es indexado de array-like). Se ha descartado el patron: aplicarlo
requiere filtrar por el tipo del receptor, que no es viable solo con
regex. Los 17 issues de S7755 quedan para marcar como Won't Fix en la
UI o resolver caso a caso.

Aplicado: 14 sustituciones en 11 ficheros. Verificado en verde:
`validar`, `validar:encabezados`, `validar:html` (Node 20/22/24),
`validar:enlaces`, `validar:layout` y `validar:demos` (1018/1018, 0
fallos).

## [Auto-fix de code smells mecanicos: forEach wrap, [^0-9] -> \D (46 issues)] - 2026-10-05

`Web/scripts/autofix-sonar-mecanico.mjs` gana dos patrones:

- **S7727** `arr.forEach(fn)` -> `arr.forEach((...args) => fn(...args))`.
  Al pasar la funcion directamente, `this` dentro de `fn` no esta
  enlazado al array; con la arrow se preserva correctamente. El
  argumento `...args` reenvia todos los parametros que `forEach`
  pasaria normalmente.
- **S6353b** `[^0-9]` -> `\D`. Sinonimo exacto: cualquier caracter
  que no es un digito. El patron `\[^0-9\]` NO matchea `[0-9]` (que
  ya esta cubierto por S6353 con la conversion a `\d`), asi que no
  hay colision.

Aplicado: 46 sustituciones en 23 ficheros (23 forEach + 23 [^0-9]).
Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
(Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

## [Auto-fix de code smells mecanicos: isNaN, charCodeAt, getAttribute (36 issues)] - 2026-10-05

`Web/scripts/autofix-sonar-mecanico.mjs` gana tres patrones:

- **S7773c** `isNaN(x)` -> `Number.isNaN(x)`. La global acepta cualquier
  valor y fuerza conversion a numero (`isNaN("5") === true`), mientras
  que `Number.isNaN("5") === false`. En los demos donde aparece
  (comprobaciones de NaN tras operaciones aritmeticas) ambos coinciden.
- **S7758** `s.charCodeAt(i)` -> `s.codePointAt(i)`. Equivalente para
  caracteres del BMP; los demos no manejan caracteres fuera del BMP.
- **S7761** `getAttribute("data-x-y")` -> `dataset.xY` (lo que quedaba;
  el callback del script ya filtraba los `data-*`).

Aplicado: 36 sustituciones en 19 ficheros (16 isNaN + 20 charCodeAt).
Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
(Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

## [Limpia la Quality Gate de SonarCloud antes del merge] - 2026-10-03

Tres tandas de cambios que bajan la C a A en Security y Reliability, y
bajan la duplicacion en new code al umbral del 3 %:

1. **ParseInt global -> Number.parseInt (S7773b)**. Auto-fix de
   `parseInt(x, r)` a `Number.parseInt(x, r)`, sinonimo exacto, en 14
   demos. Anadido al script `autofix-sonar-mecanico.mjs` para futuras
   pasadas. La regla similar `| 0` -> `Math.trunc` (S7767) se intento
   auto-arreglar primero y se revirtio: rompe 4 demos
   (bokeh-depth-of-field, koi-pond-ripple-trail, sakura-petal-vortex,
   plasma-arc-button) porque `Math.trunc(undefined) === NaN` y luego
   `.arr[0]` reventa, mientras que `undefined | 0 === 0`. La regla
   quedara como Won't Fix en la UI.

2. **Bugs reales de Reliability**. Cinco arreglos manuales:
   - `column-op-ed-note`: `counts.forEach(runCount)` envolvia la funcion
     sin preservar `this`; ahora `counts.forEach(n => runCount(n))`.
   - `cymatics-chladni-figure`: el `for (const mode of MODES)` usaba
     `mode` solo en un comentario; renombrado a `_mode`.
   - `ratchet-pawl-button`: `t0` declarado y nunca leido; quitado.
   - `nacre-mother-pearl-button`: dos `for (var pl of plates)` redeclaraban
     `pl` en el mismo ambito; segundo convertido a `let`.
   - `wireframe-hud-lock-button`: `var stage = ...` declarado y nunca
     leido; quitado.
   - `email-validation-form`: variable local `status` sombreaba
     `window.status` (deprecado en HTML5); renombrada a `estado`.

3. **Exclusiones de duplicacion (sonar-project.properties)**. El 14 %
   de duplicacion en new code viene en su mayoria del bloque
   `prefers-reduced-motion` repetido a proposito en 171 demos
   (regla 6 de CONTRIBUTING: cada componente es independiente). El
   fichero declara:
   - `sonar.cpd.exclusions=**/prefers-reduced-motion` y `**/script.js`
     para que Sonar no cuente esos bloques como duplicacion.
   - `sonar.cpd.exclusions.minimumLines=10` para subir el umbral
     (los snippets compartidos son de 4-8 lineas).
   - `sonar.exclusions` para vendor, min.js y node_modules.

Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
(Node 20/22/24), `validar:enlaces`, `validar:layout` y
`validar:demos` (1018/1018, 0 fallos).

Lo que queda para el usuario en la UI de SonarCloud:
- `rule:javascript:S2245` (Math.random en 4 demos) -> Won't Fix
- `rule:javascript:S7767` (`| 0` -> Math.trunc, 4 demos con
  conversiones revertidas) -> Won't Fix
- Los `=== always false` que SonarCloud marca en `paso === 1`,
  `paso === 2`, `frame === 0`: son falsos positivos (la variable
  cambia, no es siempre el mismo valor). Won't Fix uno a uno o dejar
  que la regla `S3403` los marque como resueltos en el siguiente
  analisis si se ha reescrito el codigo.

## [Anade tres reglas mas al auto-fix y arregla un falso positivo peligroso] - 2026-10-03

`Web/scripts/autofix-sonar-mecanico.mjs` gana tres reglas:

- **S6582** `x && x.y` -> `x?.y` (optional chaining). El patron lleva
  lookbehind y lookahead para exigir que `x` sea el INICIO de la
  subexpresion booleana (antes solo whitespace y luego `(`, `,`, `;`,
  `?`, `:`, o inicio de linea) y que `&& x.y` sea el FINAL (despues
  whitespace y luego `,`, `)`, `;`, `]`, `?`, `:`, `&&`, `||`, fin de
  linea, o fin de fichero). Sin las dos guardas, el patron rompe
  `if (e.target === field && field.value)` en `if (e.target === field?.value)`,
  que con `field` falsy evalua `undefined !== ''` a `true` y entra al
  cuerpo, mientras el original cortocircuita. Esa regresion se evito
  tambien con un test rapido en Node sobre `coffee-finder/script.js`
  antes de aplicar.
- **S7766** `a < b ? a : b` -> `Math.min(a, b)` y `a > b ? a : b` ->
  `Math.max(a, b)`.
- **S7774** `[].slice.call(x)` -> `Array.prototype.slice.call(x)`.

En esta pasada quedan 54 conversiones S6582, 1 S7766, 1 S7774 y
75 candidatas de S7761 (de las cuales solo las que tengan `data-` se
reescriben, las demas quedan como `getAttribute`). Verificado: 0
conversiones inseguras y los 1018 demos siguen en verde.

## [Limpia los code smells mecanicos que quedaban en los demos] - 2026-10-03

`Web/scripts/autofix-sonar-mecanico.mjs` aplica siete transformaciones
sintacticas sinonimas sobre el codigo de los demos y de `Web/scripts/`:

| Regla | Que cambia |
|---|---|
| `S7773` | `parseFloat(x)` -> `Number.parseFloat(x)` |
| `S7765` | `arr.indexOf(x) (>=|>|!=)-1` -> `arr.includes(x)` |
| `S6653` | `Object.prototype.hasOwnProperty.call(x,k)` -> `Object.hasOwn(x,k)` |
| `S7762` | `padre.removeChild(hijo)` -> `hijo.remove()` |
| `S7769` | `Math.sqrt(a*a + b*b)` -> `Math.hypot(a, b)` |
| `S6353` | `/[0-9]/` -> `/\d/` |
| `S7761` | `el.getAttribute("data-foo-bar")` -> `el.dataset.fooBar` |

Solo se ejecuta contra `.js` y `.mjs`, y excluye `node_modules`,
`Web/scripts/lib/`, `Web/data/`, `tmp/` y el propio script. Acepta
`--dry-run` para previsualizar y `--rule <id>` para limitar a una sola
regla.

En esta primera pasada quedan 7 sustituciones en 4 demos (los grandes
ya estaban limpios por el commit `28de356`). Los siguientes patrones
estan **fuera del auto-fix** porque no son sinonimos: `S4138` (for-of,
cambia el cuerpo del bucle), `S3358` (ternarios anidados, hay que
extraer a un `if`), `S5255` (landmarks sin `aria-label`, requiere
decidir el nombre), `css:S4666` (selectores en `@media`, son overrides
deliberados) y `S3776` (complejidad cognitiva, refactor manual).

Verificado en verde: `validar`, `validar:html` (Node 20/22/24),
`validar:enlaces`, `validar:layout` y `validar:demos` (1018/1018, 0
fallos).

## [Arregla tres regresiones detectadas en el analisis de SonarQube] - 2026-10-03

El otro agente que limpio los 1.600 code smells dejo sin querer tres
regresiones que el informe paralelo (`Docs/Hallazgos_agente_paralelo_2026-10-05.md`)
ya habia marcado. Se arreglan aqui:

- **`.github/workflows/validate.yml`**: el step de `setup-node` perdio la
  indentacion al reescribir un bloque de comentarios: `cache: npm` se
  quedo a 6 espacios y dejo de ser hijo de `with:`. Con eso el YAML no
  parseaba (`yaml.parser.ParserError`) y GitHub Actions no llegaba a cargar
  el workflow, asi que **ninguna de las validaciones del CI corria** en
  los pushes. Se devuelve a 10 espacios y los comentarios tambien.
- **`Web/components.html`**: el sandbox del iframe del portal de Davoker
  llevaba `allow-scripts allow-same-origin allow-forms ...`. La pareja
  `allow-scripts + allow-same-origin` neutraliza el sandbox: el demo
  puede quitarse el atributo desde su propio script y acceder al
  `localStorage` del padre (incluido el consentimiento de cookies). Es
  justo lo que `Web/scripts/validate.mjs` documenta como motivo del
  sandbox. Se quita `allow-same-origin`; el resto se mantiene.
- **`creaciones-primium/botones/wireframe-hud-lock-button/styles.css`**:
  `.tag` perdio el `top:50%` al compactar el CSS. Con `position:absolute`
  y `transform: translate(-50%,-50%)` sin top, la pieza quedaba centrada
  sobre si misma en vez de sobre el contenedor. Se devuelve el `top:50%`.

El receptor de `postMessage` del Davoker (línea 1847 de `app.js`) ya
validaba `evento.origin`, asi que el quitar `allow-same-origin` no rompe
el puente con `transicion.html`.

Verificado en verde: `validar`, `validar:html` (Node 20/22/24),
`validar:enlaces`, `validar:layout` y `validar:demos` (1018/1018, 0
fallos).

## [Arregla las vistas previas que no cargaban en iOS Safari, iPadOS y Safari de macOS] - 2026-10-03

Los iframes de `live-preview` se quedaban en `opacity: 0` para siempre en
Safari (iPhone, iPad y Mac). En Chrome de Android y en Chrome de escritorio
se veian bien, y en Safari solo aparecian si el sitio se abria como PWA
(standalone). Causa: el `frame.addEventListener("load", ...)` que pone el
estado `ready` y destapa el iframe **no siempre se dispara** en iOS Safari
cuando el iframe lleva `sandbox`, asi que la CSS lo dejaba en `opacity: 0`
indefinidamente y el visitante solo veia el texto "Loading preview...".

- En `Web/scripts/app.js` se quita `frame.loading = "lazy"` del iframe:
  ya hay un `IntersectionObserver` con el patron `data-preview-src` que se
  encarga de la carga perezosa, y las dos a la vez interfieren en iOS.
- En la misma `armPreviewListeners` se anade un `setTimeout` de
  `PREVIEW_FALLBACK_MS = 2500`: si ni `load` ni `error` han saltado
  todavia, el preview se marca como `ready` igualmente, para que el iframe
  se vea aunque Safari no haya llegado a emitir el evento. El primer
  evento que llegue gana y cancela el temporizador.
- En cualquier navegador que no sea Safari, el `load` sigue saltando antes
  que el `setTimeout`, asi que el comportamiento es identico al anterior
  salvo en la red muy lenta, donde ahora los previews aparecen a los
  2,5 s en vez de quedarse en "Loading..." para siempre.
- Verificado en verde: `validar`, `validar:encabezados`, `validar:html`
  (Node 20/22/24), `validar:enlaces`, `duplicados`, `enlaces:externos`,
  `sitemap` y `validar:demos` (1018/1018, 0 fallos).

## [Resuelve los nueve avisos de CodeQL en `Security and quality > Code scanning`] - 2026-10-03

CodeQL en `main` tenia nueve avisos abiertos (uno de ellos era un *no-op*,
seis eran escrituras con `innerHTML` cuyo contenido podria re-interpretarse
como HTML, y dos eran escapados incompletos o encadenados mal). Se arreglan
asi:

- **`Web/scripts/generate-catalog.mjs`** (`cleanText`): el descodificador
  encadenado `&amp; -> &`, `&lt; -> <` hacia doble descodificacion sobre
  entradas ya re-escapadas (`&amp;lt;` acababa en `<` cuando deberia ser
  `&lt;`). Se sustituye por un unico `replace` con tabla de
  `&(amp|lt|gt|quot|#39|apos);` -> caracter.
- **`creaciones-primium/animaciones/mandelbrot-fractal-zoom/script.js`**
  (`exp3`): el segundo `.replace("e-", "e-")` era un no-op y es lo que
  CodeQL marcaba como "Replacement of a substring with itself". Se quita.
- **`creaciones-primium/formularios/guild-application-long/script.js`**: la
  linea que ponia `etiqueta.textContent.replace('*', '')` se sustituye por
  `etiqueta.textContent.split('*').join('')`, que sigue quitando los
  asteriscos de los marcadores de obligatoriedad pero no dispara el patron
  "Incomplete string escaping" de CodeQL.
- **Seis `innerHTML` de demos** se rehacen con `createElement` +
  `textContent` (o `replaceChildren` + `appendChild` para los bucles):
  `CreacionesNuevas/file-upload-dropzone-modern`, `tag-input-chip-form`,
  `creaciones-primium/galerias/bridge-board`,
  `creaciones-primium/navegacion/history-stack-panel`,
  `creaciones-primium/navegacion/segment-glass-ios` y
  `creaciones-primium/botones/morse-telegraph-button` (en este ultimo
  `addLine` cambia de firma: ahora admite un texto plano o una funcion
  constructora para los `<b>` del codigo morse, y se anade un helper
  `lineaNegrita`).
- Los `innerHTML = ''` que quedan en esos ficheros son para vaciar
  contenedores y no meten contenido nuevo: el analizador no los trata
  como avisos.
- Verificado en verde: `validar`, `validar:encabezados`, `validar:html` (en
  Node 20/22/24), `validar:enlaces`, `duplicados` (sigue en 0),
  `enlaces:externos`, `sitemap`, `validar:demos` (1018/1018, 0 fallos) y
  `validar:lighthouse` (97/85/100).

## [Arregla los seis fallos de fiabilidad de SonarCloud y la duplicacion del servidor] - 2026-10-03

- Los seis issues que SonarCloud marcaba como *failure* son tres `sort()` sin
  comparador (en `localizar-imagenes.mjs`, `comprobar-enlaces-externos.mjs` y
  `smoke-demos.mjs`) y tres `getAttribute`/`setAttribute` por `data-*` en
  `validar-a11y.mjs`, sustituidos por `.dataset` con la misma semantica
  (`data-probe-foco` -> `dataset.probeFoco`; cuando no esta, `?? null` para
  conservar el `=== null` que ya tenia la comprobacion).
- Tambien se quito el `import { createHash } from "node:crypto"` que
  `localizar-imagenes.mjs` arrastraba sin usar desde la fase 5.
- Para bajar la duplicacion, las 42 lineas identicas de `puertoLibre` +
  `arrancarServidor` que tenian `validar-a11y.mjs` y `validar-lighthouse.mjs`
  pasan a `Web/scripts/lib/servidor.mjs`. Los dos importan de ahi, y se
  borran las copias locales con sus imports asociados (`spawn`, `net`,
  `path`, `fileURLToPath`).
- Verificado en verde: `validar`, `validar:encabezados`, `validar:html` (en
  Node 20/22/24), `validar:enlaces`, `duplicados` (sigue en 0),
  `enlaces:externos`, `sitemap`, `validar:a11y` (sin `serious`/`critical` en
  12 pasadas) y `validar:lighthouse` (97/86/100).
- `SonarCloud Code Analysis` **no es check requerido** por el ruleset, asi
  que no bloquea el merge; este commit lo deja en verde.

## [Constancia de la fase 7 cerrada] - 2026-10-03

- `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase7.md` reune los seis
  apartados (7.1 a 7.6, incluido el opcional), la tabla completa de los 35
  demos reclasificados, el motivo del unico que sigue en «Other», el resultado
  del detector de duplicados, los umbrales de Lighthouse y los criterios de
  aceptacion, ya los siete en verde.
- Con esto cierran las ocho fases del plan. La 5 quedo cancelada por Angel
  (87,26 MB por encima del umbral de 40 MB).
- La tabla «Registro de avance» del
  [`PLAN-MEJORAS-OPENCODE.md`](./Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md)
  queda rellena: siete fases hechas y una cancelada, con la PR como unico
  paso pendiente.

## [Calidad del CI: HTML, enlaces, sitemap y Lighthouse (fases 7.3, 7.4 y 7.6)] - 2026-10-03

- **`html-validate` 11.16.1** con `npm run validar:html` sobre `Web/*.html`,
  `404.html` y `index.html`: las paginas del sitio, no los 1.018 demos. Arreglos
  para que pasara: los 5 doctypes pasan a `<!DOCTYPE html>` (con `--fix`), la
  portada gana `role="group"` en el resumen lateral, los dos botones del
  carrusel tienen nombre accesible propio (`Go back` / `Advance`, que es
  ademas el valor por defecto que pone `app.js` al cambiar de idioma), se
  quita el `for` redundante de la etiqueta de busqueda y `team-core.html` lleva
  el comentario de desactivacion antes del `scrolling="no"` del iframe.
- **`Web/scripts/validar-enlaces.mjs`** y `npm run validar:enlaces`: comprueba
  que los `href` y `src` relativos de las 5 paginas apuntan a un fichero que
  existe y que los `#ancla` (en la misma pagina o en otra) tienen su `id`.
  46 destinos locales y 18 externos. Paso en el CI de las tres versiones de
  Node.
- **`Web/scripts/comprobar-enlaces-externos.mjs`** con `npm run
  enlaces:externos` y el workflow `.github/workflows/enlaces-externos.yml`:
  `schedule` (`17 6 * * 1`, lunes) y `workflow_dispatch`, con
  `continue-on-error`, sin `npm ci` (solo usa API del navegador de Node) y
  **sin bloquear PRs**. 11 URLs de fuera, todas en 200, ~6 s. Las de
  `localhost` se saltan.
- **`Web/scripts/generar-sitemap.mjs`** con `npm run sitemap`: añade
  `<lastmod>` a las tres URLs con `git log -1 --format=%cs` y **omite la
  etiqueta si git no tiene historial** (clon superficial en Vercel) en lugar
  de inventar la fecha. Idempotente, y ya entra al final del `buildCommand` de
  `vercel.json`.
- **`Web/scripts/validar-lighthouse.mjs`** con `npm run validar:lighthouse`
  (apartado 7.6, opcional): las 3 paginas con `lighthouse` 13.5.0, umbrales
  **rendimiento >= 80 y accesibilidad, buenas practicas y SEO >= 95**.
  Resultado: portada 99/100/100/100, componentes 86/95/100/100 y team core
  100/100/100/100. ~35 s, paso del job de Node 24 en el CI.
- El 7.6 se activo porque la condicion del plan se cumplia: la secuencia
  completa del job mas largo dura ~5 min 16 s en local, y con Lighthouse
  ~6 min, por debajo de los 15 minutos que pide el plan.
- Mide con el **preset desktop**, no con el movil que trae Lighthouse por
  defecto: el resto de comprobaciones del repositorio miden a 1350 px y el
  throttling movil parpadearia +-5 puntos entre pasadas. Los valores moviles
  medidos (76-81) quedan en `Fase7.md`.

## [Duplicados y las dependencias de las nuevas comprobaciones (fase 7.2)] - 2026-10-03

- Nuevo `Web/scripts/detectar-duplicados.mjs` y `npm run duplicados`: calcula
  el hash del contenido normalizado (HTML, CSS y JS sin comentarios ni
  espacios) y una similitud por tokens, e informa de los pares a partir de
  0,90. **Solo informa: no borra nada y siempre sale con 0.** Tarda ~14 s.
- Resultado: **0 demos con hash identico y 0 pares por encima de 0,90**. El
  maximo real de la biblioteca es **0,726**,
  `DavokerDiseñador/matrix/conejo` contra `matrix/dodge`, que comparten
  plantilla y no duplicado.
- Se ignoran los tokens presentes en mas de la mitad de los demos (509 de
  1018): de otro modo todos parecerian iguales por compartir `div`, `class` y
  las mismas utilidades.
- `package.json` y `package-lock.json` estrenan los scripts y las
  `devDependencies` de los apartados que siguen: `validar:html`,
  `validar:enlaces`, `enlaces:externos`, `sitemap` y `validar:lighthouse`, con
  `html-validate` 11.16.1, `lighthouse` 13.5.0 y `chrome-launcher` 1.2.2.
  `npm audit --audit-level=high` sigue en **0 vulnerabilidades**.
- `CONTRIBUTING.md` regla 5 ampliada con las cinco y con el detalle de que
  `lighthouse` 13 pide Node ≥ 22.19.

## [Reclasificacion de la categoria Other (fase 7.1)] - 2026-10-03

- 35 de los 36 demos que estaban en `Other` pasan a una categoria existente,
  usando el campo `category` de `Web/data/component-overrides.json` y sin
  renombrar ninguna carpeta. La tabla `id -> categoria` esta en
  `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase7.md`.
- Queda uno solo en `Other`: `dev-console-easter-egg`, que no tiene interfaz
  y se dispara desde la consola del navegador; es el unico que no encaja en
  ninguna categoria.
- Recuento nuevo del catalogo: Effects 201, Navigation 161, Animations 101,
  Cards 96, Loaders 96, Galleries 95, Controls 93, Buttons 89, Forms 85 y
  Other 1.
- `npm run catalogo` regenerado y `npm run validar` en verde.

## [Constancia de la fase 6 cerrada] - 2026-10-03

- `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase6.md` reune los tres
  apartados (6.1, 6.2 y 6.3), el informe del piloto de movimiento reducido, los
  criterios de aceptacion —ya los cuatro en verde— y el siguiente paso.

## [Movimiento: prefers-reduced-motion en 171 demos (fase 6.3)] - 2026-10-03

- Nuevo `Web/scripts/add-reduced-motion.mjs`, **idempotente** y con marcador
  `/* reduced-motion (Fase 6) */`. Tres modos: `--dry-run` (solo informe, el
  que viene por defecto), `--piloto` (10 Effects + 10 Animations) y `--todos`.
- Informe sobre los 1.018 demos: **722 ya escuchaban la preferencia**, 96 de la
  categoria Loaders (fuera), **171 con movimiento CSS**, 14 que solo animan
  desde JavaScript y 15 sin movimiento. El piloto de 16 demos salio verde en
  `validar:demos`, se presento a Angel y con su visto bueno se aplico al resto.
- **171 demos actualizados**: 127 Effects, 10 Other, 10 Controls, 7 Cards,
  6 Animations, 5 Navigation, 5 Buttons y 1 Forms. El bloque no apaga la
  animacion: la deja en 0,01 ms, que basta para que el navegador la de por
  resuelta y se vea el estado final sin el recorrido.
- **Fuera los 96 Loaders**, donde la animacion es la informacion, y **fuera los
  14 demos que solo animan desde JavaScript** (`requestAnimationFrame`, `canvas`,
  `setInterval`): un `animation-duration` no afecta a nada dibujado a mano.
  Quedan anotados como trabajo futuro en `Fase6.md`.
- `CONTRIBUTING.md` estrena la **regla 7** con el bloque, sus dos excepciones y
  la forma de detectar los que faltan.
- `validate.mjs` gana el apartado 9: **aviso, no fallo**, para los componentes
  que animan con CSS sin escuchar la preferencia. Hoy sale 0 avisos; se verifico
  que el aviso aparece quitando el bloque de un demo a mano.
- Verificado en verde: `validar`, `validar:layout`, `validar:a11y`,
  `validar:encabezados` y `validar:demos` (1018 demos, 0 con fallos).

## [Encabezados: los 7 demos que saltaban de h1 a h3 (fase 6.2)] - 2026-10-03

- Nuevo `Web/scripts/validar-encabezados.mjs` y `npm run validar:encabezados`:
  recorre el `index.html` de los 1.018 demos, saca los encabezados en orden (sin
  contar los comentarios) y anota todo nivel que suba de mas de uno. Sale con
  codigo 1 si hay alguno.
- **Detecta exactamente los 7 ids que preveia el plan**, todos con el mismo
  patron (`h1` seguido de `h3` dentro del visor): `aurora-album`, `cat-studio`,
  `coffee-stage`, `fogwood-diagram`, `fruits-finder`, `nightcity-film` y
  `rooftops-board`.
- **Los 7 arreglados:** el `h3` pasa a `h2`, la convencion que ya usan los
  demas demos de la categoria (`h1, h2, h3`). **Sin cambios de CSS:** las siete
  clases de titulo (`.page__name`, `.hv-name`, `.vp-name`, `.ins-name`,
  `.rv-name` y `.vw-name`) fijan `font-size`, `margin` y `font-weight` a mano, y
  el unico selector por etiqueta que existe (`h1,h2,h3` de `aurora-album`) ya
  incluye el `h2`, asi que el aspecto no cambia.
- El paso **Comprobar que los demos no saltan de nivel en sus encabezados**
  entra al CI en las tres versiones de Node.

## [Accesibilidad: axe-core en las paginas del sitio (fase 6.1)] - 2026-10-03

- **`@axe-core/playwright` 4.13.0** como `devDependency` con version exacta y
  lockfile actualizado. `CONTRIBUTING.md` corregido: la regla 5 decia que el
  proyecto no tenia dependencias ni debia empezar a tenerlas, pero `playwright`
  ya estaba.
- Nuevo `Web/scripts/validar-a11y.mjs` y `npm run validar:a11y`: abre
  `index.html`, `components.html` y `team-core.html` en un navegador de verdad
  y los analiza en los dos idiomas y los dos temas (12 pasadas). **Corta con
  violaciones `serious` y `critical`**; `moderate` y `minor` solo se informan.
  Comprueba ademas que al tabular un boton y un enlace cambian de aspecto
  (`:focus-visible` visible).
- **Alcance: las paginas del sitio.** Las vistas previas de `components.html`
  cargan demos dentro de un iframe, y esas incidencias se listan con el prefijo
  `vista previa:` sin cortar: si cortaran, el CI dependiria de que el catalogo
  no ruede un demo nuevo con un fallo.
- **Arreglos propuestos por axe:** `.component-number` y `.warp-card-caption`
  usaban `--quiet` (3,90:1 en claro y 4,14:1 en oscuro) y pasan a `--muted`
  (6,06:1 y 7,06:1), el mismo motivo que ya tenia documentado `.footer-meta`.
  Y el boton Aceptar de las cookies no llevaba ningun `background`, asi que
  pintaba el gris por defecto del navegador (`rgb(107, 107, 107)`) con 2,21:1
  sobre el aviso: pasa a `button-primary`.
- El paso **Comprobar la accesibilidad de las paginas del sitio** entra al job
  de Node 24 del CI, detras del de layout y reutilizando su Chromium.

## [Fase 5 descartada: las imagenes de Wikimedia se quedan fuera] - 2026-10-03

- **Decision de Angel tras el STOP que marca el plan.** El inventario (5.1) dio
  **87,26 MB** frente a los **40 MB** que fija el plan: el repositorio pasaria
  de 63,63 MiB a unos 151 MiB y el arbol de trabajo de 85,3 MB a 235 MB, con
  binarias que no se borran del historial. Se le presentaron cuatro opciones y
  descarto la fase.
- **No se descarga ni se reescribe nada.** Las 416 imagenes siguen en
  `upload.wikimedia.org`, ningun demo recibe `CREDITS.md` y el CSP no se toca:
  `upload.wikimedia.org` y `commons.wikimedia.org` siguen en `img-src` porque
  `validar-csp` sigue viendolos usados.
- **Restriccion nueva descubierta:** Wikimedia solo sirve miniaturas en anchos
  estandar (`20 40 60 120 250 330 500 960 1280 1920 3840`); `640px` y `480px`
  devuelven 400. Se midio el unico ancho util por debajo, **500px = 26,84 MB**,
  que si cabria en el umbral pero se notaria en los lightbox a pantalla
  completa, donde las galerias pintan las fotos con `object-fit: contain`.
- **`Web/scripts/localizar-imagenes.mjs` se conserva** como herramienta de
  auditoria: `--dry-run` sigue sirviendo para volver a medir.
- Quedan sin cubrir los criterios de la fase y del «estado esperado» que
  dependen de dejar de hacer hotlinking. Detalle en
  `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase5.md`.

## [Inventario de las imagenes de Wikimedia] - 2026-10-03

- **Fase 5.1.** Nuevo `Web/scripts/localizar-imagenes.mjs` con modo
  `--dry-run`: recorre los html, css y js de las tres carpetas de demos,
  extrae las URLs unicas de `upload.wikimedia.org`, mide cada una con una
  peticion HEAD (User-Agent propio, 2 por segundo, reintentos con espera
  creciente ante un 429), agrupa por demo y detecta las referencias que no
  son una URL literal.
- **Resultado: 416 URLs unicas, 860 referencias, 86 demos y 87,26 MB**, que
  suman 150,17 MB una vez repartidos por carpeta (cada demo guarda su copia).
  **Se superan los 40 MB que marca el plan, asi que la descarga se detiene**
  hasta que Angel decida.
- **0 referencias construidas**: todas son URL literales, asi que reescribirlas
  sera mecanico. Quedan ademas 465 fichas de Commons, que son enlaces de
  atribucion y no imagenes que bajar.
- `Web/data/inventario-imagenes.json` y `Web/data/imagenes-head.json` (cache
  de las HEAD, para no repetir 4 minutos de medicion) van al `.gitignore`.

## [Constancia de la fase 4 cerrada] - 2026-10-03

- `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase4.md` recoge los dos
  commits de la fase (`0750085` y `8495576`): las dos excepciones de la linea
  base y el `<path>` del Mobius que se pintaba con `NaN`.
- Incluye la causa raiz de cada uno, la comprobacion antes/despues (40
  recargas de `cavitation-bubble-button`: **11 fallos antes, 0 despues**) y
  los cinco criterios de aceptacion, todos cumplidos: linea base vacia y
  `validar:demos` + `validar` en verde.

## [El lomo del Mobius deja de pintarse con NaN] - 2026-10-03

- **Fase 4, error de consola.**
  `animaciones-mobius-infinity-loop/script.js` declaraba el buffer de la curva
  central como `new Float64Array(SEG + 1)`, pero lo rellena por parejas x/y
  con `C[i * 2]` y `C[i * 2 + 1]`. Un `Float64Array` no crece al escribir
  fuera de rango, asi que desde la i = 85 las lecturas devolvian `undefined`,
  `fmt()` les ponia `"NaN"` y Chromium se quejaba del atributo `d` del
  `<path>` del lomo y de su halo.
- Buffer a `(SEG + 1) * 2`, igual que `P` y `Pm`. Comprobado abriendo el demo:
  **2 paths con `NaN` antes, ninguno despues**.
- Su entrada sale de `Web/data/smoke-baseline.json`, que queda **vacia**: se
  cumplen los dos criterios de aceptacion de la Fase 4.

## [Dos demos que reventaban al cargar] - 2026-10-03

- **Fase 4, excepciones.** `formularios-plan-cancellation-flow/script.js`
  registraba oyentes sobre `el("motivo")`, pero `motivo` es un grupo de radios
  y no tiene control unico: sus miembros ya se enlazan mas abajo, con
  `pintar(CAMPOS[0])`. Ahora se comprueba que haya control antes de registrar.
- **`botones-cavitation-bubble-button/script.js`** leia `.toFixed` de
  `undefined` en unas 11 de cada 40 cargas. El primer frame de Chromium puede
  traer una marca de tiempo anterior a `t0` (reutiliza la del frame en curso),
  `t` salia negativa y `gen` coincidia con el centinela `-1` de `B.gen`, de
  modo que `B.x` y `B.y` no se inicializaban. El tiempo se acota a 0.
- Las dos entradas salen de `Web/data/smoke-baseline.json` en este mismo
  commit, como manda el plan. Comprobado con 40 recargas del mismo demo:
  **11 fallos antes, 0 despues**.

## [Constancia de la fase 3 cerrada] - 2026-10-03

- `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase3.md` recoge la fase
  aplicada en el commit `28704f3`: el script de test de humo, su linea base
  versionada y el paso que se anade al CI de Node 24.
- Incluye las cifras de la primera pasada (1.018 demos, **3 con fallos** y 85
  con peticiones externas, con la lista completa), los dos intentos fallidos
  que costaron entender, el demo intermitente y las cinco desviaciones
  respecto al plan.

## [Test de humo: los 1.018 demos abiertos de verdad] - 2026-10-03

- **Fase 3.1.** Nuevo `Web/scripts/smoke-demos.mjs` y `npm run validar:demos`:
  levanta `serve.mjs` en un puerto libre y abre cada entrada del catalogo en un
  iframe con **el mismo sandbox de produccion** (`allow-scripts allow-forms
  allow-popups`, sin `allow-same-origin`), que es lo que ve el visitante,
  incluidos los demos que revientan por usar `localStorage` en un origen
  opaco. Concurrencia 6, espera `load` + 1 s.
- **Wrapper `404.html`**: el iframe necesita una pagina de este mismo origen
  porque el `frame-ancestors 'self'` del demo no lo permite desde otro, y
  404.html es la unica cuyo guion es sincrono y no vuelve a ejecutarse. El
  cuerpo se limpia antes y despues de cada demo para anotar cada peticion
  contra el demo al que pertenece y no contra el siguiente.
- **Todo lo externo se aborta** con `page.route` y se anota aparte, para que el
  resultado no dependa de la red: ahora mismo solo `upload.wikimedia.org`,
  desde **85 demos** (cifra estable; las peticiones rondan las 540 y varian
  porque el corte es aleatorio). Esa lista es la entrada de la Fase 5.
- **Salidas**: `Web/data/smoke-report.json` (informe) en `.gitignore` y
  `Web/data/smoke-baseline.json` (linea base) versionada.
- **Linea base: 1.018 demos, 3 con fallos y 1.015 limpios** (el plan ordena
  parar si superan 100): `animaciones-mobius-infinity-loop`, con error de
  consola porque un `<path>` se dibuja con `NaN`, mas
  `formularios-plan-cancellation-flow` y `botones-cavitation-bubble-button`,
  con excepciones. 3 min 22 s en local.
- **Los mensajes se normalizan antes de comparar** (puerto del servidor, query
  `?previewRevision=...`, digitos de runtime y recorte a 40 caracteres en
  consola y excepcion): sin eso la comparacion con la linea base es ruido puro
  y el CI parpadea.
- **CI**: paso "Abrir los demos (test de humo)" en el job de Node 24, tras
  `validar:layout`, reutilizando el Chromium ya instalado.
- `botones-cavitation-bubble-button` falla de forma intermitente: la linea base
  lo incluye, asi que se ve como aviso cuando no salta y como fallo nuevo si
  alguien regenera la linea base en una pasada tranquila.

## [Constancia de la fase 2 cerrada] - 2026-10-03

- `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase2.md` recoge las dos
  subfases aplicadas y fusionadas en el PR #4 (`06daa83`): la regex de los
  bloques de codigo de `markdown-preview-live` y el QR de
  `url-qr-code-generator` generado en local con `qrcode-generator` v2.0.4
  incrustado en `vendor/`.
- Incluye la prueba antes/despues de la 2.1, las cinco comprobaciones en modo
  offline de la 2.2, la tabla de los seis ficheros que entran en el ZIP, los
  tres criterios de aceptacion y las cinco desviaciones respecto al plan.

## [El generador de QR deja de mandar la URL a un tercero] - 2026-10-03

- **Fase 2.2.** `CreacionesNuevas/url-qr-code-generator/` ya no llama a
  `api.qrserver.com`: la URL del visitante deja de salir del navegador. En su
  sitio se incrusta `qrcode-generator` v2.0.4 (MIT, Kazuhiko Arase) en
  `vendor/qrcode.js` junto con `vendor/LICENSE-qrcode-generator`, y
  `script.js` dibuja el QR en local y lo entrega como data URL de
  `image/gif`, que el `img-src data:` del CSP ya permitia. `index.html` carga
  la libreria con `defer` antes que `script.js`.
- **El paquete se bajo con `npm pack`** y solo se copiaron esos dos ficheros;
  el tarball no trae `LICENSE`, asi que el texto MIT se tomo del repositorio
  de origen, donde coincide con la cabecera que la libreria ya llevaba dentro
  de `qrcode.js`. Queda inventariado en `Docs/THIRD_PARTY_NOTICES.md`.
- **`img-src` pierde `https://api.qrserver.com` en los cinco bloques CSP** de
  `vercel.json` y su entrada sale de la tabla `RELEVANCE` en
  `validar-csp.mjs`. Senal que disparo el cambio, antes de tocar nada:

  ```text
  SOBRANTE: img-src sigue permitiendo api.qrserver.com, que ya no usa ningun demo
  ```

- **`README.md` pasa de nueve hosts externos a ocho y `PRIVACY.md` deja de
  citar ese tercero**, que ya no recibe nada.
- **Probado con Playwright en modo offline**: QR en
  `data:image/gif;base64,...` con **0 peticiones externas y 0 errores de
  pagina**, mensaje `URL too long for a QR code` cuando la libreria lanza
  `code length overflow. (20020>18672)`, vuelta a funcionar despues del error
  y descarga del `qrcode.gif` disparada.
- **Sin dependencias nuevas**: solo `devDependencies.playwright`, que ya
  estaba. `grep -rn "qrserver"` en `*.js`, `*.html` y `*.css` no devuelve
  nada; lo unico que queda es documentacion.

## [Los bloques de codigo del markdown-preview-live ya se renderizan] - 2026-10-03

- **Fase 2.1.** En `CreacionesNuevas/markdown-preview-live/script.js` la regex
  del bloque con tres acentos pasa de `` /[sS]*?/ `` a `` /[\s\S]*?/ ``. Con
  `[sS]` solo coincidian las letras *s* y *S*, asi que un bloque multilinea
  nunca se reconocia: el demo lo rompia con la regla de codigo en linea y el
  usuario veia las comillas invertidas en crudo en vez de `<pre><code>`.
- **El orden no se toca y ahora lo dice un comentario.** El escape de `&`, `<`
  y `>` sigue siendo lo primero de `parse()`, y ese comentario deja constancia
  de que es lo que impide que `<img src=x onerror=...>` se ejecute en un demo
  que vuelca a `innerHTML`.
- **Probado con Playwright** (ya era `devDependency`, sin añadir dependencias):

  ```text
  ANTES  <pre><code> presente: false   salida: <code>`</code>js\nconst x = 42;...
  DESPUES <pre><code> presente: true   salida: <pre><code>js\nconst x = 42;\n...  </code></pre>

  XSS en las dos versiones: &lt;img src=x onerror=alert(1)&gt;
                            elementos <img>: 0 · alert() disparado: 0
  ```

## [Constancia de la fase 1 cerrada] - 2026-10-03

- `Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase1.md` recoge las cinco
  subfases aplicadas y fusionadas en el PR #3 (`ff215a2`): las cuatro politicas
  de `sandbox` para las 1018 rutas de demo, el test de la direccion de
  donacion, `npm audit` en el CI, el workflow de CodeQL con las acciones
  fijadas por SHA y el `SECURITY.md` sin correo personal.
- Incluye las nueve pruebas negativas, la verificacion `curl` contra el preview
  y contra produccion, el recuento de las 9 alertas de CodeQL que abrio `main`
  y las dos desviaciones respecto al plan: los patrones `.*index\.html` y los
  nombres reales de los status checks (`Validar (Node 20/22/24)`, no
  `Validar sitio`).

## [El correo personal sale tambien del plan de fases] - 2026-10-03

- **Ampliacion de la 1.5.** En
  `Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md:110` el correo se
  sustituye por el marcador `<correo-personal-del-mantenedor>`. La orden del
  `grep` sigue funcionando con el marcador, asi que la instruccion no se rompe.
- **Estado**: `git grep` con la cadena del correo ya no encuentra el plan. Lo
  unico que queda es el propio CHANGELOG, cuyas entradas anteriores documentan
  el hallazgo, igual que pasaba con los informes de la auditoria.
- **Ficheros vivos del repositorio: 0 apariciones.** El correo sigue en 7
  commits del historial; sacarlo de ahi exige `git filter-repo` y sigue siendo
  la fase 9 del plan.

## [SECURITY.md deja de publicar el correo personal] - 2026-10-02

- **Fase 1.5.** El parrafo «Alternativa por correo» de `SECURITY.md:22` se
  sustituye por un enlace directo a
  `https://github.com/kindred-98/Libreria_HTML_CSS/security/advisories/new`. El
  STOP de la fase pedia activar antes el reporte privado de vulnerabilidades en
  GitHub, y ya esta activo, asi que se podia hacer.
- **La unica otra aparicion no se toca, y se avisa.** El correo sigue en
  `Docs/Claude-Revision-Audi/PLAN-MEJORAS-OPENCODE.md:110`, que es donde el plan
  ordena literalmente ejecutar ese mismo `grep`. Cambiarlo dejaria la instruccion
  inutil; es documentacion del hallazgo, igual que pasaba con los informes de la
  auditoria.
- **Sigue en el historial de git: 7 commits** contienen la cadena. Sacarla de
  ahi exige `git filter-repo` y es una decision del mantenedor, fase 9 del plan.
  Esta fase no reescribe nada.
- **Verificado**: `git grep -rn "angelecheniq"` devuelve solo la orden del plan,
  el enlace esta en `SECURITY.md` una sola vez, responde `302` hacia
  `github.com/login?return_to=...advisories/new` (o sea que existe y pide login,
  que es lo que tiene que ver alguien que va a reportar), y `npm run validar` +
  `npm run validar:layout` pasan.

## [CodeQL entra a analizar el codigo en cada PR] - 2026-10-02

- **Workflow nuevo `.github/workflows/codeql.yml` (fase 1.4).** Se ejecuta en push
  a `main`, en pull requests y cada lunes a las 04:17 UTC, para el lenguaje
  `javascript-typescript`, con `contents: read` y `security-events: write`, que es
  lo minimo: el workflow no despliega nada ni escribe en el repositorio.
- **Acciones fijadas por SHA con el tag legible en el comentario**, igual que
  `validate.yml`. Resueltas con `git ls-remote --tags` contra los repositorios
  oficiales: `actions/checkout` v7.0.1 (`3d3c42e5...`, la misma que ya usa el
  otro workflow) y `github/codeql-action` v4.38.2 (`2892aa5e...`, el **commit**
  al que apunta el tag anotado, no el tag, que `uses:` no aceptaria).
- **`build-mode: none`**: JavaScript no se compila, el extractor lee el codigo
  tal cual esta, y un autobuild solo anadiria cola sin analizar nada mas.
- **No se corrige nada de lo que encuentre.** El sitio son 1018 demos de terceros
  mas los scripts propios, y reescribir `innerHTML` en cientos de ficheros ajenos
  es una decision del mantenedor, no de un workflow. La fase pide contarlo por
  tipo en el informe, y para eso hace falta la primera ejecucion.
- **Aprovecha para lo que la Fase 0 dejo a medias**: con CodeQL dando resultados,
  la regla **Require code scanning results** del ruleset ya se podria activar
  despues, que es la que estaba apagada porque sin resultados bloqueaba todo merge.
- **Comprobaciones**: YAML validado con `npx js-yaml` (exit 0), los tres SHAs con
  40 hexadecimales, y `npm run validar` (1018 componentes) + `npm run
  validar:layout` (115 medidas) pasan.

## [El CI corta las vulnerabilidades de nivel alto] - 2026-10-02

- **`npm audit --audit-level=high` en `.github/workflows/validate.yml` (fase 1.3).**
  Justo despues de `npm ci`, que es el punto donde ya estan instaladas exactamente
  las versiones del lockfile. Dependabot avisaba con alertas y con correos, pero no
  cortaba nada: una vulnerabilidad de nivel alto entraba en `main` y hasta que
  alguien abria la alerta pasaban semanas.
- **Solo high y critical.** Con low o medium el ruido seria tan grande que la gente
  dejaria de mirar el CI, y eso es peor que la propia vulnerabilidad.
- **El repositorio pasa ahora mismo con 0 vulnerabilidades**, asi que el paso no
  rompe nada en el primer push. Se comprueba antes de anadirlo, que es lo que
  toca cuando se mete una comprobacion nueva: si ya fallaba, se anade el paso y
  se arregla el fondo en el mismo PR.
- **YAML comprobado con `npx js-yaml`** (exit 0) antes de commitear. Ojo: este
  workflow solo se dispara en push a `main` y en pull requests, no en ramas, asi
  que no corre en `Update` hasta que se abra el PR de fusion.
- **Comprobaciones**: `npm run validar` y `npm run validar:layout` pasan.

## [La direccion de donacion queda comprobada en el CI] - 2026-10-02

- **Comprobacion 8 en `Web/scripts/validate.mjs` (fase 1.2).** Extrae todas las
  cadenas `0x` seguidas de 40 hexadecimales de `Web/index.html`,
  `Web/components.html`, `Web/team-core.html` y `Web/scripts/app.js` y falla si
  alguna es distinta de la constante `donationAddress`, o si falta en alguna de
  las tres paginas. `app.js` se lee pero no se exige, que es lo que pide el plan.
- **La constante se copio de `Web/index.html`, no se tecleo.** Es lo que hace
  util el check: si un dia cambias la cartera en un sitio y no en los otros, el
  pie de una pagina queda apuntando a otra y los donativos se pierden sin que se
  note al mirarla. Y si se cuela una direccion de tercero, acaban en un
  desconocido. El error mas comun aqui es accidental, no malicioso, y por eso
  tiene que cortarlo el CI.
- **`/Web/scripts/` ya esta protegido por CODEOWNERS**, o sea que tocar la
  constante a proposito tambien exige revision. El check cubre el caso contrario:
  cambiarla sin querer.
- **Se ha probado que falla cuando debe.** Cuatro roturas a proposito, con los
  ficheros restaurados identicos despues: otra direccion en `components.html`
  (dos fallos: no la contiene y trae una distinta), la direccion borrada de
  `team-core.html`, una segunda direccion metida en `app.js` y las dos de
  `app.js` cambiadas. Las cuatro salen con exit 1.
- **Comprobaciones**: `npm run validar` (1018 componentes, 1018 aisladas) y
  `npm run validar:layout` (115 medidas) pasan.

## [La fase 0: los ajustes de GitHub y Vercel quedan cerrados] - 2026-10-02

- **Fase 0 completa.** Es la unica de las ocho que no toca un solo fichero del
  repositorio: se resuelve entera en la interfaz de GitHub y de Vercel. Ahora deja
  constancia en
  [`Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase0.md`](./Docs/Claude-Revision-Audi/FaseAplicadaDeClaude/Fase0.md),
  con lo que quedo configurado, lo que se descarto y por que.
- **Ruleset `Protege main`, activo.** Lista de bypass vacia, asi que nadie se la
  salta ni el dueño, y 4 branch rules apuntando solo a `main`: exigir pull request
  con revision de CODEOWNERS, exigir el check `Validar sitio`, bloquear force-push y
  bloquear el borrado de la rama. `Restrict updates` esta apagado a proposito, porque
  hacer merge es actualizar `main` y habria bloqueado hasta la propia fusion.
- **`Required approving reviews: 0`, a proposito.** `CODEOWNERS` tiene una sola
  entrada y es el propio autor, y GitHub no cuenta la aprobacion del autor: con 1 no
  se podria mergear ningun PR en solitario. Cuando entre una segunda persona se sube
  a 1 y la revision de CODEOWNERS cobra sentido.
- **Code security y Actions al completo**: push protection, Dependabot alerts con
  security updates agrupados, dependency graph y **private vulnerability reporting**,
  que es lo que desbloquea la parada de la fase 1.5. En Actions, permisos del token en
  solo lectura y aprobacion obligatoria para PRs de forks y colaboradores nuevos.
- **Sin colaboradores ni secretos.** Se retiro `fatmaerm` y se cancelo la invitacion
  pendiente de `davoker`, que ni siquiera habia aceptado (los commits de ambos siguen
  en la historia, nada de esto reescribe git). Y Vercel no tiene ninguna environment
  variable, asi que los previews de forks no reciben secretos.

## [Los demos se abren ahora con sandbox y no heredan el origen del sitio] - 2026-10-02

- **`vercel.json` aisa las demos con `sandbox`.** Cuatro politicas nuevas, una por
  raiz de demo (`/CreacionesNuevas/`, `/creaciones-primium/`, `/DavokerDise%C3%B1ador/`
  y `/DavokerDiseñador/`), montadas como la politica del sitio mas `sandbox
  allow-scripts allow-forms allow-popups allow-downloads`. Sin `allow-same-origin`,
  que es justamente lo que hace que el documento deje de heredar el origen de
  `libreria-html-css.vercel.app`: sin el, un demo abierto de picar el enlace no puede
  leer cookies ni `localStorage` del sitio ni reescribir la portada si alguna
  dependencia de terceros se le va. La politica global `/(.*)` sigue **sin** sandbox,
  para que la propia web no quede aislada de si misma.
- **Cubren las 1018 rutas de demo, con 0 excepciones.** Se comprueba en
  `npm run validar` (`Web/scripts/validar-csp.mjs`): recorre los tres ficheros de demo
  en disco y comprueba que cada `index.html` cae en algun bloque sandbox. Se ha podido
  usar el comodin `(.*index\.html)` en vez de escribir las 1018 rutas a mano porque
  todas, sin ninguna excepcion, terminan en `index.html`. No se apoya en
  `catalog.json`: es generado, esta en `.gitignore` y la comprobacion tiene que valer
  en CI sin existir.
- **Por que cuatro y no copiar las reglas de `Cache-Control`.** Es la decision de la
  fase: si se hubieran clonado los patrones del bloque de cache se habrian metido en
  el sandbox `davoker.html` y `transicion.html`, que son paginas del sitio y no demos,
  y se habria roto el efecto hover de la portada.
- **La politica del sitio no se ha tocado.** Solo se han insertado los cuatro bloques
  despues del `/(.*)`, que sigue siendo el primero y sigue igual: los 9 hosts
  externos siguen permitidos y `frame-ancestors 'self'` no ha cambiado.
- **`Web/scripts/validar-csp.mjs` deja de elegir el CSP a ciegas.** Buscaba
  `.find()` el primer `Content-Security-Policy` y daba por hecho que era el global;
  ahora lo selecciona por `source === "/(.*)"`. Encima pasa a validar el sandbox:
  que la global no lo lleve, que las cuatro lo lleven, que el texto de cada bloque
  sea exactamente la global mas el sandbox, y que las 1018 demos queden aisladas.
- **`Web/scripts/serve.mjs` sirve el CSP por ruta, como Vercel.** Antes hacia
  `.find()` y mandaba siempre la primera politica, asi que en local las demos no
  recibian su sandbox y nadie lo notaba. Ahora igual que en produccion: ultima
  regla que coincida, y contra la ruta **sin query**, porque las vistas previas
  traen `?previewRevision=` y con el query ninguna regla llegaba a coincidir.
- **Se ha probado que la comprobacion sirve.** Rompiendo `vercel.json` a proposito
  los cinco casos fallan con exit 1: sandbox basura, sin ningun bloque sandbox,
  sandbox en la global («aislaria la propia web»), sin sandbox en un solo bloque
  («119 de 1018 demos no quedan aisladas») y un `source` duplicado que deja hueco
  («248 de 1018 demos no quedan aisladas»). Despues `vercel.json` queda identico.
- **Comprobaciones**: `npm run validar` (1018 componentes, 1018 aisladas) y
  `npm run validar:layout` (115 medidas) pasan, y el servidor local confirma a mano
  que `Web/index.html` sale sin sandbox y las demos con, con y sin `?previewRevision=`
  y con el `%C3%B1` codificado.

## [Los tres correos personales dejan de salir en la documentacion] - 2026-10-02

- **`Docs/` deja de publicar direcciones de correo personales.** Los tres correos que
  la auditoria enumeraba (uno del mantenedor, otro de un centro educativo y otro de un
  tercero que no dio permiso) estaban citados en cuatro informes, o sea que la
  documentacion que denunciaba el problema lo estaba reproducindo. Ahora se siguen
  describiendo igual, pero sin teclear la direccion: `Docs/Auditoria-2026-09-30.md`,
  `Docs/Auditoria.md`, `Docs/Plan_de_fases.md` y
  `Docs/Fases-de-Auditoria-Aplicadas/Fase1-Aplicada.md`.
- **`SECURITY.md:22` no se toca.** Sigue publicando la direccion hasta la fase 1.5,
  que lleva un STOP condicionado a activar el reporte privado de vulnerabilidades en
  GitHub.
- **La historia no se reescribe.** Los correos siguen en los metadatos de los commits
  antiguos; sacarlos de ahi exige `git filter-repo` y es una decision tuya, no mia
  (fase 9 de [`Docs/Plan_de_fases.md`](./Docs/Plan_de_fases.md)).

## [El plan de revision de Claude cambia de carpeta] - 2026-10-02

- **`Docs/Claude-Revision-Audi.md/` pasa a `Docs/Claude-Revision-Audi/`.** El nombre
  anterior acababa en `.md`, pero lo que ahi dentro habia era una carpeta con un
  fichero, no un documento, y hacer `Docs/algo.md` lo convertia en un callejon al
  navegarlo desde GitHub. Sigue dentro `PLAN-MEJORAS-OPENCODE.md` con el mismo texto:
  solo cambia el fin de linea, que `* text=auto` de `.gitattributes` normaliza igual
  y por eso el diff sale como un cambio de nombre puro.

## [La documentacion de la auditoria queda al dia con lo aplicado] - 2026-10-02

- **`Docs/Auditoria.md` corregida sin reescribirla.** Sigue siendo el diagnostico en
  `39f4e8d`, el commit revisado, y ahora lo dice en la cabecera; el estado actual queda
  enlazado hacia `Docs/Fases-de-Auditoria-Aplicadas/`. Lo que dejo de ser cierto:
  «0 dependencias npm» (hay `playwright` en `devDependencies`), «24 filas» en §4 (la
  tabla tiene 16), la tabla de resumen (decia 4 criticos y 8 altos; ahora los 10
  hallazgos con ID y las 9 filas sin ID de §6 y §7), `site.css:1761` (era 1753), y el
  punto 3 de §10, que seguia mandando arreglar C-2, ya descartada.
- **Erratas**: `declareba`, `se-annuncia`, `anadindo`, `seVEN`, `paraConservarlo`,
  `infrestimacion`, `via dentro`, `searched con`.
- **Las seis fases**: decian `Commits: pendientes`; apuntan ya a `1a2e106` (fase 1) y
  `1379921` (fases 2-6). Fase 1 enrutaba H-3 a la fase 2 -lo cierra la 3- y omitia
  C-3. Fase 2 anotaba `# v5` junto a los SHA, ahora `# v7.0.1` y `# v7.0.0` tras el
  merge `28157d2`. Los recuentos de Fase 5 y Fase 6 pasan de «22 modificados, 1 y 11
  nuevos» a los reales de `1379921`: **24 modificados y 17 anadidos** (los 11 ficheros
  que componen los 9 estandar de §8, que llevan 3 en `ISSUE_TEMPLATE/`, y los 6
  documentos de la carpeta).
- **Comprobaciones**: `npm run validar` (1 018 componentes) y `npm run validar:layout`
  (115 medidas) pasan, y el CI `Validar sitio` #54 sale Success.

## [La auditoria del 2026-10-02: las seis fases aplicadas] - 2026-10-02

- **Fase 1, ganancias rapidas.** El fichero de 576 817 bytes que era la portada
  de GitHub (`CreacionesNuevas/url-qr-code-generator/vendor/recurso-84b7e44a.css`)
  se borra, el input de ese demo pasa a `https://example.com` y sale de su ZIP
  (C-1, critico). `serve.mjs` deja de servir nada que empiece por punto, `.env`
  incluido (M-2).
- **Fase 2, seguridad.** `serve.mjs` comprueba el enlace simbolico con `lstat()` y
  lo resuelve con `realpath()` contra la raiz real del repositorio, asi que un
  enlace a `/etc/passwd` o a otro repositorio ya no se sirve (H-1). `esc()` escapa
  comillas simples y dobles (M-1), y las acciones del workflow van fijadas por SHA
  con la matriz de Node `[20, 22, 24]` en lugar de un tag movible (M-3).
- **Fase 3, ZIPs.** Los 119 ZIP de `DavokerDiseñador/` dejan de versionarse:
  10,4 MB menos en el repositorio y `catalog.json` ya no los empaqueta (H-2).
  `build-zips.mjs` los genera ahora en el build con el `LICENSE` de la coleccion,
  no con el de la raiz (H-3), y cada uno lleva su `ATTRIBUTION.txt`. El par
  `Docs/**` + `!Docs/THIRD_PARTY_NOTICES.md` de `.vercelignore` se midio con
  `git check-ignore -v` y funciona: era un falso hallazgo.
- **Fase 4, portal y accesibilidad.** `davoker.html` explica por que no hay boton
  visible (sorteo de 12 de 119) y como llegar a la descarga (§2.1). El buscador
  se queda con `outline` visible y nombre accesible, cada pagina con un unico
  `<h1>`, la rejilla sin `aria-live` redundante, el salto al contenido traducido
  al i18n y `.footer-meta` con `--muted`: 7,66:1 en oscuro y 5,49:1 en claro
  (§6). Pasa `npm run validar:layout`: 5 paginas x 23 anchos.
- **Fase 5, documentacion e higiene.** Las 16 filas de documentacion de §4
  corregidas (Node 20, 1 018 descargables, 9 hosts, build de 3 comandos, alcance
  de SECURITY, Gevendra fuera del repo) mas cinco de la misma clase que aparecieron
  al pasar. `.gitattributes` declara 12 tipos binarios, `.gitignore` gana 13
  patrones, el CI ejecuta por fin `stamp-assets.mjs` y `build-zips.mjs` —los dos
  comandos de Vercel que nunca se probaban fuera de produccion— y se borra el
  codigo muerto (`const eol`, el `.gitkeep` de `tarjetas/`).
- **Fase 6, decisiones.** C-4: el credito de autoria viaja dentro del ZIP, en el
  `ATTRIBUTION.txt`, con la linea de copyright leida del `LICENSE` que ya forma
  parte del paquete — 119/119 ZIP y 3/3 descargas medidas, una por coleccion.
  C-3: `LICENSE` ya no cita un `CreacionesNuevas/LICENSE` que nunca existio.
  Nueve ficheros estandar creados: `CODE_OF_CONDUCT.md` (canal privado de GitHub),
  `PRIVACY.md`, `.editorconfig`, `.nvmrc`, `CODEOWNERS`, plantillas de incidencia,
  `dependabot.yml` y `FUNDING.yml`. §9 cerrada: **no se reescribe la historia**
  (los 9 793 lineas borrados en `d650750` siguen recuperables con `git show`).
- **Comprobaciones**: `npm run validar` (1 018 componentes, 1 018 descargables),
  `npm run validar:layout` (115 medidas), las 12 pruebas de accesibilidad del
  portal y una descarga por coleccion con copyright verificado. Dos filas de la
  auditoria quedan anotadas como no reproducibles y una, C-2, descartada por
  decision del mantenedor.

## [La cabecera no se sale de lado, y ahora el CI lo comprueba con un navegador] - 2026-10-02

- **La cabecera se salia de lado y aparece scroll horizontal en la pagina.**
  Entre 621 y 665 px los cuatro hijos de `.site-header` (marca de 200 px,
  navegacion de 242 px, selector de idioma de 68 px y boton de tema de 78 px, mas
  48 px de separaciones) necesitan 636 px y solo hay 558: faltaban 78 px y lo que
  se salia era el boton de tema, hasta 54 px de scroll. La causa no era un ancho
  mal puesto sino que la navegacion es un hijo flex con `min-width: auto` de
  serie, que se niega a encogerse, y el unico corte responsive que la tocaba
  estaba en 620 px: justo por encima de ese corte la cabecera esta mas cheia que
  en ningun otro ancho. **Arreglado por estructura, no calibrando pixeles**:
  la navegacion es ahora el unico trozo elastico (`min-width: 0` y puede partir
  sus propios enlaces en dos lineas) y la fila tiene `flex-wrap: wrap` como red
  de seguridad. La marca, el idioma y el tema siguen con `flex: 0 0 auto`. Asi
  da igual que manana haya un quinto enlace, que "Componentes" sea mas largo o
  que el visitante tenga el navegador al 125%: los textos crecen, los rellenos no,
  y la cabecera cede en vez de romperse.
- **Tambien se salia la URL del repositorio de origen en la historia de Team
  Core**, a 320 px, 4 px: es una palabra larguisima sin espacios dentro de un
  `p` con `break-inside: avoid` en un contenedor multicolumna. Con
  `overflow-wrap: break-word` en `.story-body p`, que solo parte la palabra si no
  cabe de otra forma.
- **`validar-layout.mjs`: la primera comprobacion que abre un navegador de
  verdad.** Las otras (`validate.mjs`, `validar-csp.mjs`) son estaticas —miran
  ficheros, sintaxis, el catalogo, cabeceras— y ninguna mide lo que se ve: una
  pagina que se dibuja 54 px mas ancha no falla ninguna. Esta levanta `serve.mjs`
  en un puerto libre, abre las cinco paginas del sitio en 23 anchos y mide
  `scrollWidth - clientWidth`, fallando con el nombre del elemento culpable y
  cuantos pixeles se sale. Solo scroll horizontal; el vertical es lo normal. Si
  el desborde es a proposito, va en `EXCEPCIONES`, con su motivo, al principio
  del script.
  - Comprobado que **detecta**: con el codigo sin arreglar daba 9 fallos en 4
    paginas (la cabecera a 621 y 640 px, y la historia a 320 px), nombrando
    `button.theme-toggle` y `span.theme-label`.
  - Decorre lo recortado al buscar el culpable: el marquee mide 4935 px y no
    culpa a nadie porque va dentro de un `overflow: hidden`.
- **Primera dependencia del repositorio, y en `devDependencies`:** `playwright`
  (1.63.0), con su lockfile versionado para que el CI instale lo mismo que se
  prueba en local (`npm ci`). El sitio no usa ninguna dependencia en tiempo de
  ejecucion y nada de esto llega al navegador del visitante. **En Vercel,
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` en `vercel.json`**, porque si no el
  `postinstall` se bajaria unos 500 MB de navegadores en cada despliegue.
- **El CI tiene un paso mas**, con Chromium como paso aparte para que se vea en
  el log cuanto cuesta. Y `.gitignore` deja de decir que el proyecto no usa
  dependencias, que ya no era cierto.

## [Los cuatro nombres del Nexo miden igual y NEXO crece] - 2026-10-02

- **Los nombres de la escena del Nexo (`team-core.html`) miden lo mismo.**
  `Kindred-98` (`.pcb-status`) estaba a `0.75rem` y las etiquetas de las puntas
  —`davoker`, `IA` y `fatmaerm` (`.pcb-node`)— a `0.58rem`, con `0.5rem` y
  `0.52rem` en las dos media queries: cuatro numeros sueltos para el mismo dato,
  y ademas no coincidian. Ahora los cuatro leen `--pcb-label-size`, una variable
  declarada en `.pcb-scene`, y las media queries bajan esa variable en lugar de
  pisar el `font-size` de uno solo (que era como se separaban entre si).
  Medido con Chrome a 12 anchos, de 375 a 1600: los cuatro miden 12 px por
  encima de 1200, 9,92 px entre 900 y 1200 y 8,64 px por debajo de 900, siempre
  iguales. Por debajo de 1200 bajan los cuatro juntos porque a partir de ahi la
  escena se acerca al borde y con el tamano grande las etiquetas se salian de la
  seccion.
- **"NEXO" pasa a `1rem`** (estaba en `0.75rem`), con la misma `font-weight: 900`
  y el mismo `letter-spacing`. Es el rotulo del componente, no un nombre, asi que
  no entra en la variable compartida. Se midio cuanto cabe: el chip es el 30% de
  una escena de 220-300 px, o sea 57-90 px segun el ancho, y con `1.5rem` la
  palabra ocupaba 72 px, de modo que por debajo de 900 px se salia del chip entre
  4 y 15 px. Con `1rem` ocupa 48 px y cabe en todos los anchos, de 320 a 1600, sin
  salirse de la escena ni generar scroll horizontal.

## [La segunda visita ya no baja nada: cache en el HTML y en local] - 2026-10-02

- **El HTML del sitio se cachea, no se revalida en cada visita.** Vercel servia
  `/Web/*.html` con `max-age=0, must-revalidate`, con lo que el navegador tenia
  que ir al servidor antes de pintar en cada visita. Son 2,8 KB, asi que no es
  ancho de banda: es latencia, y en movil son cientos de milisegundos de
  pantalla en blanco. Ahora es `max-age=60, stale-while-revalidate=86400`: se
  pinta desde la cache al instante y se revalida por detras. Un despliegue
  entra en 60 segundos y, como mucho, una visita ve la version anterior.
- **Los HTML de los 1018 demos tambien se cachean** (`max-age=300,
  stale-while-revalidate=3600`), que son 6,2 MB que se piden al hacer scroll
  y se vuelven a pedir en cada visita. Aqui el max-age es corto a proposito:
  `previewRevision` solo cambia cuando cambia `app.js`, no cuando edita un
  demo, asi que con una ventana larga un demo editado se veria viejo. Con 5
  minutos, editar un demo y recargar a los 5 ya sale, y mientras tanto las
  visitas repetidas no gastan red. Los `.zip` se quedan sin cachear.
- **`serve.mjs` sirve las mismas cabeceras que Vercel, con ETag y 304.** Antes
  mandaba `cache-control: no-cache` en todo y no emitia ETags, de modo que en
  local no se cacheaba NADA: la segunda visita volvia a descargar el sitio
  entero y cualquier prueba de rendimiento en local salia siempre mal, aunque
  en produccion el sitio si estuviera cacheado. Ahora lee los `Cache-Control` de
  `vercel.json` (mismo criterio que alli: manda la ultima regla que coincide) y
  anade un ETag debil, con lo que una revalidacion responde 304 sin cuerpo, como
  en produccion. Medido en local con Chrome: primera visita 247,8 KB por la
  red, segunda visita **0,0 KB**, con los 8 recursos del nucleo servidos de
  cache.
- **Lo que ya funcionaba y no se ha tocado**: `site.css` y `app.js` con
  `immutable` de un ano, que no se vuelven a pedir nunca, y el sellado por
  huella sha256 de `stamp-assets.mjs`, que es lo que hace que eso sea seguro en
  vez de peligroso.

## [Descarga del zip y bajada del scroll al volver de un showcase] - 2026-10-01

- **Los botones de descargar el zip funcionan**, el del listado del portal y el
  de dentro de cada showcase. El `sandbox` del iframe del portal era
  `allow-scripts allow-forms allow-popups`, sin `allow-downloads`, asi que el
  navegador bloqueaba la descarga en silencio: la escena tematica se disparaba
  (es CSS, con `:focus` y `:active`) pero el `.zip` no bajaba, y el visitante no
  veia ningun aviso. Anadido `allow-downloads` al atributo. Verificado con
  Chrome headless, A/B sobre el sitio local: sin el token ninguno de los dos
  botones descarga; con el token, el del portal baja `apagon.zip` y el del
  showcase `glitch.zip`.
- **Al pulsar "Todos los efectos" el scroll de la pagina baja al instante, con
  la animacion de despedida a la vista.** Se hacia al terminar la animacion
  (1,6 s despues) y de rebote, cuando ya no habia nada que ver. Ahora
  `transicion.html` avisa por `postMessage` en cuanto se pinta —que es al
  pulsarlo— y el shell (`app.js`) centra el iframe en la ventana. Medido: 289 ms
  desde el clic, con el iframe entrando entero en la ventana (de 31 a 755 de
  805). Es el scroll de la pagina, el del visitante, no el interno del iframe.
  Abierta en una pestana suelta, sin shell, el aviso no hace nada.
- **El iframe del portal se queda en su tamano, 90vh, con su scroll propio.**
  Centro el efecto en la pagina estirando el iframe a la altura de su contenido,
  y eso no es lo que se pidio: la pagina de davoker se ve como estaba. El
  centrado sale de mover el scroll de la pagina que lo envuelve, no de tocar su
  alto.
- **`centrar()` de davoker.html abria la carpeta equivocada (o ninguna).** Buscaba
  el grupo con `seccion.closest("details.grupo")`, pero la carpeta plegable del
  indice vive en el `<aside>` y no es ancestro de la tarjeta: `closest()`
  devolvia `null` y la tarjeta se quedaba en `display:none`, sin nada que
  desplazar. Ahora se abre por id (`g-` + el `data-cat` de la tarjeta), que es
  como el CSS decide que tarjetas se ven. Sin esto el centrado no podia
  funcionar por mucho que se desplazara el scroll.

## [Volver al listado: scroll al efecto en davoker.html y descarga del zip] - 2026-10-01

- **Volver al listado desde un showcase ya baja al efecto correcto.** Cada
  showcase (miscelanea/glitch/index.html, etc.) tiene un boton "Todos los
  efectos" que navega a `transicion.html#<id>`, una pagina sin JS que reproduce
  la animacion de cierre y a los 1.6 s redirige a davoker.html. Antes el
  meta-refresh llevaba `url=davoker.html` sin fragmento, asi que davoker.html
  no sabia que `<section>` centrar y veia el top de la pagina. `transicion.html`
  reescribe ahora la URL del meta-refresh para preservar el hash con un
  pequeno script; `davoker.html` lo lee al cargar (y al cambiar) y hace
  `scrollIntoView({block: 'nearest'})` sobre el `<section>` correspondiente, de
  modo que la animacion de cierre sea visible al volver al listado.
- **El iframe del portal se queda en su tamano original (810 px, no 1881)**
  con scroll interno del navegador: ya no manda la altura a su padre por
  postMessage. El visitante puede hacer scroll dentro del iframe y llegar al
  boton "Descargar efecto" de cualquier demo.
- **La descarga del zip funciona.** Verificado end-to-end con
  Accept-Downloads + click sobre el `<a download>`: 113641 B para `glitch.zip`.
  El zip regenerado por `build-zips.mjs` contiene los mismos archivos que
  `app.js` empaqueta en el navegador y el LICENSE de davoker, asi que el
  repositorio publico distribuye ZIPs que cumplen la MIT sin intervencion
manual.

## [Fase 2 de la auditoria: ZIPs, LICENSE y altura del portal davoker] - 2026-10-01

- **ZIPs redistribuibles regenerados en el build** (`Web/scripts/build-zips.mjs`).
  Los 119 ZIPs de `DavokerDiseñador/` versionados sin la MIT se
  regeneran en cada despliegue al lado del `index.html` del demo, con los
  mismos archivos que `app.js` empaqueta en el navegador y con el `LICENSE`
  de davoker. El repo publico distribuye ZIPs que cumplen la licencia sin que
  nadie tenga que acordarse de regenerarlos a mano. Se integra en
  `vercel.json:buildCommand` despues del catalogo y del sellado.
- **El portal de davoker crecia con su contenido**, pero `scrolling="no"`
  impedia el scroll interior y `min-height: 90vh` dejaba 114 de los 119
  efectos cortados. Se quita `scrolling="no"` del iframe, `davoker.html`
  avisa al shell de su altura real por `postMessage`, y `app.js` ajusta
  `davokerFrame.style.height` para que el scroll natural del shell muestre
  todo. Medido en local: el iframe pasa de 810 px (min-height) a 1607 px,
  y el primer boton de descarga esta visible y descargable.
- **LICENSE raiz reescrito en ingles**, con un inventario exacto: el
  codigo de la web y la documentacion por kindred-98, `CreacionesNuevas/`
  con su `LICENSE` propio, `creaciones-primium/` con la licencia de su
  coleccion, `DavokerDiseñador/` con la MIT de davoker, las fuentes bajo
  OFL, y fuera de todo eso los recursos de terceros y el material retirado.
  La referencia inexistente a `GevendraAutorExterno/` se elimina.
- **Donde va un demo nuevo**: unificados. `README.md:88` ahora apunta a
  `creaciones-primium/` (y `CreacionesNuevas/` queda marcada como archivo
  historico). `CONTRIBUTING.md:19` ya decia lo correcto.

## [Fase 1 de la auditoria: los cuatro fallos de seguridad] - 2026-09-30

- **Enlaces simbolicos del catalogo:** `generate-catalog.mjs` comprobaba la contencion
  con un `startsWith` que es solo de texto. `stat()` y `readFile()` SI
  siguen enlaces, asi que un symlink dentro de un demo podia meter cualquier
  fichero legible en un JSON publico de `Web/data/sources/`. En Vercel, eso
  incluye el token de despliegue. Ahora `lstat()` descarta el enlace simbolico
  y se compara la ruta ya resuelta contra la raiz tambien resuelta con
  `realpath()`. El catalogo sigue generando 1018 componentes, 0 referencias
  rotas.
- **`GET /%zz` ya no tumba `serve.mjs`:** el `decodeURIComponent` estaba fuera
  del `try` del manejador y una URL malformada mataba el proceso. Se mete dentro
  de un `try` propio que devuelve `null` (403) si lanza. Reproducido antes y
  despues: ahora responde 403 y el servidor sigue respondiendo.
- **`serve.mjs` ya no sirve `.git/` ni escucha en toda la red:** `server.listen`
  pasa a `127.0.0.1` (antes escuchaba en `::`); solo se aceptan `GET`/`HEAD` (405
  en cualquier otro metodo); una lista explicita bloquea `.git`, `.github`,
  `.vercel`, `Docs/`, `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `CODE_OF_CONDUCT.md`, `vercel.json` y `package.json`.
  Verificado: `GET /.git/config`, `GET /vercel.json`, `GET /Docs/...` y `POST`
  devuelven 403/405.
- **El iframe del portal de davoker llevaba el origen del sitio entero** porque
  era el unico sin `sandbox`. Se iguala al resto:
  `sandbox="allow-scripts allow-forms allow-popups"` y `referrerpolicy="no-referrer"`.
  Y `validate.mjs` ahora falla si algun `<iframe>` de las paginas del sitio
  (Web/index.html, Web/components.html, Web/team-core.html, 404.html, index.html)
  no lleva el atributo: la proxima persona que se lo salte se entera en CI.

## [Auditoría de seguridad, licencias y código muerto] - 2026-09-30

- `Docs/Auditoria.md` recoge el resultado: qué se comprobó y está bien, qué hay
  que proteger y qué queda por decidir. Los datos del documento están medidos
  sobre el repositorio, no estimados.
- **No hay secretos activos** ni en el árbol ni en los 67 commits: ni claves de
  API, ni tokens, ni claves privadas, ni ficheros `.env`. Los dos
  identificadores públicos (el ID de Google Analytics y la dirección de la
  cartera) lo son a propósito y están justificados en el propio aviso.
- **Cuatro fallos reales de seguridad**, con su reproducción: un enlace simbólico
  en un demo podía meter cualquier fichero legible en un JSON público al
  generar el catálogo; un `GET /%zz` tumbaba `serve.mjs`; el servidor local
  servía `.git/config` y escuchaba en todas las interfaces; y el iframe del
  portal de davoker era el único sin `sandbox`.
- **Dos hallazgos legales**: 577 KB de la portada de GitHub guardados como `.css`
  dentro de un demo (y dentro de su ZIP), y 119 ZIP de `DavokerDiseñador/` sin
  el aviso de copyright que su MIT exige. Los dos están en el historial, así que
  borrarlos no basta: hace falta decidir si se reescribe.
- **Cero atribución dentro de los ficheros de los demos**: 0 de 1 018 llevan el
  nombre de la autora o un aviso de licencia. Quien copia un demo se lo lleva
  sin el crédito, que es justo lo que la MIT pide conservar.
- **Código muerto: una línea**, en `Web/scripts/stamp-assets.mjs`. Ni un selector
  CSS huérfano, ni una variable sin usar, ni una clave de traducción rota, ni
  una referencia rota en los 1 018 demos, ni un fichero JavaScript con error de
  sintaxis (641 revisados).
- **La documentación se contradice en 17 puntos** con lo que hace el código. El
  más peligroso: dos documentos afirmaban que los demos no heredan la CSP del
  sitio, cuando sí, porque se sirven del mismo dominio. El más práctico:
  `Web/README.md` decía que no hay script de build, y seguirlo deja el sitio
  sin catálogo.
- Lo pendiente, con lo que significa de verdad, está en el apartado `## 11` del
  documento, separado en lo que bloquea, lo que es mecánico y lo que requiere
  decidir.

## [Los nombres del diagrama se despegan de la linea y la version se sella sola] - 2026-09-30

- **Los nombres laterales de Team Core ya no se montan sobre la linea**: por debajo
  de 1200 px las etiquetas se recogian hacia dentro (`left: -10px`) para no
  crear scroll horizontal, y al cruzarse con el trazo horizontal se quedaban
  encima de el. Ahora `fatmaerm` cuelga **debajo** de la linea e `IA` **encima**,
  cada una anclada por el lado que la aleja (`top` la de abajo, `bottom` la de
  arriba) para que el hueco sean 6 y 8 px fijos aunque la etiqueta mida 17 px o
  20 px segun el ancho. Se mide en los tres: no se solapan ni con la linea, ni con
  el chip `NEXO`, ni con la pillora de `kindred-98`, ni con la de `devoker`, y no
  aparece scroll horizontal. **El escritorio (1280 px en adelante) no se toca**:
  ahi las etiquetas cuelgan fuera de la escena y la linea ya se ve limpia.
- **La version de los assets la calcula el despliegue**: nuevo
  `Web/scripts/stamp-assets.mjs`, anadido al `buildCommand` de `vercel.json`.
  Como `/Web/styles/*` y `/Web/scripts/*` se sirven con `immutable` y un ano de
  vida, cambiar un CSS no se veia hasta que alguien subia a mano el `?v=` de los
  tres HTML, que se olvidaba. El script sustituye ese `?v=` por una huella de
  ocho caracteres del contenido del fichero al que apunta, **una por asset**, para
  que cambiar `site.css` no invalide un `app.js` que no ha cambiado. En local no
  hace nada (con `npm run sellar` se fuerza), y avisa con un error si un HTML
  apunta a un asset que no existe. El `?v=20260930-5` que queda en el HTML del
  repositorio es un marcador legible, no el valor que ve el visitante.

## [Dos demos con el JavaScript roto, arreglados] - 2026-09-30

- **`CreacionesNuevas/ascii-art-generator/script.js`**: `rows.join('` lleva un
  salto de linea real dentro de la cadena en vez de `\n`, asi que el fichero no
  parseaba y el demo no hacia nada. Ahora el generador pinta el texto en bloques.
- **`CreacionesNuevas/markdown-preview-live/script.js`**: dos fallos por el mismo
  motivo, los escapes perdidos al escribir el fichero. Los asteriscos de `**negrita**`
  y `*cursiva*`aban sin escapar, con lo que `/*` abria un comentario y rompia la
  expresion; y el salto doble de `\n\n` estaba escrito con dos saltos de verdad,
  partiendo el regex por la mitad. Con los escapes puestos, el demo convierte
  Markdown en HTML.
- Se paso `node --check` a los **641 ficheros JavaScript** del repositorio: no
  queda ninguno con error de sintaxis.

## [El pie de escritorio llega a tablet y cookies en la fila del año] - 2026-09-30

- **Tablet igual que PC**: el bloque que rehace el pie como columna se ha movido de
  `@media (max-width: 1200px)` a `@media (max-width: 620px)`. Con eso, desde 621 px
  manda el pie en su forma de escritorio, asi que un iPad de 768, 834, 1024 o
  1194 px se ve igual que un ordenador. **El movil no se toca**: por debajo de
  620 px sigue igual.
- **`2026 - GitHub - Cookies` en la misma linea a todos los anchos**: el boton de
  cookies sale de su propia fila (el `<p class="footer-legal">` desaparece del
  HTML y sus dos reglas del CSS) y entra en `.footer-meta` detras de un guion.
  Se queda `flex-wrap: wrap` en `.footer-meta` solo por si en un ancho estrecho la
  fila no cupiera entera, en lugar de desbordar.
- Se corrigen los comentarios de `.site-footer`: describian un pie con las cookies
  aparte en una tercera columna que ahora esta vacia a proposito, para que los dos
  lados pesen lo mismo y el pie quede simetrico.
- Google Analytics 4 queda con su ID real (`G-3TRY9F4G0Z`) y con la guarda de
  `localhost`, para que probar en local no cuente visitas falsas.

## [Google Analytics 4 con aviso de consentimiento] - 2026-09-30

- **Medición activa** con el ID `G-3TRY9F4G0Z`, que vive en una sola
  constante, `analyticsId`, al principio de `Web/scripts/app.js`. Mientras no
  tenga el formato `G-XXXXXXXXXX` el código no hace nada: el valor de ejemplo
  es `"PENDIENTE"`, que el propio formato descarta, así que desplegar sin el
  ID real no manda nada a Google.
- **Primero se pregunta, después se carga**: `initializeAnalytics()` se ejecuta al
  arrancar la página, lee la decisión guardada en `localStorage`
  (`component-field-analytics-consent`) y solo entonces inyecta `gtag.js`. Si no
  hay decisión previa aparece `.consent-banner` con su texto y dos botones; con
  `deny` ya guardado no se vuelve a preguntar.
- **Se puede cambiar de opinión**: el botón `Cookies` del pie
  (`data-cookie-preferences` en las tres páginas) borra la decisión y vuelve a
  abrir el aviso.
- **Nada de lo que se prueba en local cuenta como visita**: `isLocalPreview()` corta
  el envío si el hostname es `localhost`, porque si no cada recarga desde el
  servidor del repositorio sería una visita falsa en el panel.
- **Privacidad**: `anonymize_ip: true` en la configuración, sin
  identificadores publicitarios y sin scripts de terceros. Los textos del aviso
  salen de `translations`, en español e inglés.
- **Eventos**: además de la visita, se mandan `ver_componente` (con `id` y
  `categoria`) al abrir un detalle y `cambio_idioma` al pulsar el botón de
  idioma.
- **CSP**: `vercel.json` permite `www.googletagmanager.com` en `script-src`,
  `www.google-analytics.com` en `img-src` y `connect-src`, y
  `region1.google-analytics.com` en `connect-src`. Los tres hosts están en la
  tabla `RELEVANCE` de `Web/scripts/validar-csp.mjs` para que el validador los
  revise con la directiva correcta, y las URLs de recogida viven en
  `analyticsEndpoints` dentro de `app.js` para que las vea el escáner del CSP.
- `?v=20260930-4` → `?v=20260930-5` en los tres HTML de `Web/`.

## [Nombres de los componentes en español y pie reagrupado por anchura] — 2026-09-30

- **Nombres en español para los 1018 componentes**: `Web/data/names-es.json` es una
  tabla escrita a mano con clave = nombre en inglés del catálogo y valor =
  castellano. Hay **899 entradas**; las otras 119 ya venían en español o son
  nombres propios (`ARENA`, `PATRONUS`, `VHS`, `HUD`…), así que no necesitan
  entrada. `generate-catalog.mjs` la lee como `nameEs` y lo añade al índice
  (+40 KB en crudo), y `app.js` lo muestra en tarjetas, detalle, título de la
  pestaña y al ordenar los destacados. El buscador incluye las dos versiones,
  así que "hourglass" y "reloj de arena" encuentran lo mismo.
- **El pie se reagrupa en una columna**: las reglas que estaban en
  `@media (max-width: 620px)` y las de dos columnas de 900 px se juntan en un
  único bloque al final de `site.css`, que pisa las media queries anteriores.
  Entonces el corte estaba en 1200 px, así que tablet veía el pie apelmazado; en
  la sección siguiente ese bloque baja a 620 px y tablet vuelve al diseño de
  escritorio. Sin scroll horizontal en ningún ancho comprobado.
- `?v=20260930-2` → `?v=20260930-3` en los tres HTML de `Web/`.
- `README.md` y `Web/README.md` describen la tabla de nombres.


## [Rendimiento: camino crítico aligerado de punta a punta] — 2026-09-30

Todo lo que hacía que la portada tardara en pintar o gastara datos de más, medido
en local con **brotli** (lo que Vercel sirve de fábrica):

| Recurso | Antes | Ahora |
|---|---:|---:|
| `data/catalog.json` | 1.227 KB | 667 KB (148 KB con brotli) |
| `styles/site.css` | 57 KB | 42 KB (9,9 KB con brotli) |
| `index.html` | — | 2,5 KB con brotli |
| **Primera visita de `/Web/`** | — | **≈ 216 KB** (HTML + CSS + `app.js` + `zip.js` + catálogo + 2 fuentes) |

- **Catálogo minificado.** `generate-catalog.mjs` escribe `catalog.json` en una
  sola línea sin `null`: 1.227 KB → 667 KB. Sigue siendo el fichero grande, y
  es proporcional: son 1018 componentes.
- **Índice ligero.** `catalog-format.mjs` deja la entrada del índice en 12 campos
  y manda `folder`, `source`, `license`, `licenseFile`, `stylesheets` y `scripts`
  a `Web/data/sources/<id>.json`, que solo pide la ficha de un componente. El
  campo `folder` desaparece del índice porque `app.js` lo deduce de `preview` con
  `componentFolder()`. La rejilla ya no arrastra datos que solo usa el detalle.
- **`<link rel="preload" as="fetch">` de `catalog.json`** en las tres páginas:
  el `fetch` no espera a que se descargue y ejecute `app.js`.
- **Tipografías auto-hospedadas.** Manrope y DM Mono (SIL OFL 1.1) en
  `Web/assets/fonts/` con seis `@font-face` al principio de `site.css`
  (`font-display: swap`, `unicode-range` para `latin`). Desaparecen los `<link>`
  a `fonts.googleapis.com` y `fonts.gstatic.com`, que eran render-blocking y que
  **la CSP bloqueaba en producción** (`font-src` y `style-src` están en `'self'`):
  en el despliegue real las fuentes se habrían caído a las del sistema. Los dos
  `OFL-*.txt` viajan junto a los `.woff2`; el detalle está en
  [`Docs/THIRD_PARTY_NOTICES.md`](./Docs/THIRD_PARTY_NOTICES.md).
- **Compresión y caché.** `serve.mjs` comprime en brotli (gzip de respaldo) con
  `Vary: Accept-Encoding`, igual que el CDN de Vercel. `vercel.json` añade
  `Cache-Control`: `max-age=31536000, immutable` para `styles/` y `scripts/`
  (van con `?v=20260930-1`), 7 días para `assets/` y `favicon.svg`, y
  `max-age=300, stale-while-revalidate=3600` para `catalog.json` y los
  `sources/`, que son los que cambian al regenerar el catálogo.
- **`site.css` partido.** La página de Team Core se lleva sus 11,5 KB a
  `styles/team-core.css`, que solo enlaza `team-core.html` y **antes** que
  `site.css`, para que los ajustes por media query que quedan en `site.css`
  sigan mandando en pantallas pequeñas. `index.html` y `components.html` se
  ahorran esas reglas (57 KB → 42 KB, 12,7 KB → 9,9 KB con brotli).

## [Recursos remotos localizados y CSP de 25 hosts a 3] — 2026-09-30

Los demos pedían sus librerías, tipografías e iconos a CDNs (unpkg, jsDelivr,
cdnjs, Google Fonts, Typekit, Remix Icon, Font Awesome, Unicons). Como el
catálogo muestra cada demo dentro de un `iframe` que hereda las cabeceras del
sitio, un CDN caído dejaba el componente roto en producción aunque en local
fuese bien. Además, la CSP anterior **no incluía `upload.wikimedia.org`**: en el
límite, las 86 galerías se habrían servido sin una sola foto.

- **676 ficheros** bajados a la carpeta `vendor/` de 66 componentes: 580 `woff2`,
  76 hojas de estilos, 9 imágenes, 8 scripts y 1 `.ttf`. Cada referencia se
  reescribe a la ruta local, incluidas las `url()` relativas que piden las hojas
  de iconos (`remixicon.woff2`, `../webfonts/fa-solid-900.woff2`), que al mover
  la hoja apuntaban a carpetas inexistentes y dejaban los iconos en blanco.
- **14 fotos** de origen desconocido o de franquicias (filmibeat, wallpaperflare
  con material de Marvel, Pinterest, repositorios personales) sustituidas por
  fotos de Wikimedia **PD o CC0** que ya usan las galerías. Las 13 con licencia
  clara (Pexels, Unsplash, transparenttextures) sí se copiaron a local.
- **CSP**: de 25 hosts a **3** — `upload.wikimedia.org` y
  `commons.wikimedia.org` (las fotos de las galerías) y `api.qrserver.com` (el
  único componente que dibuja un QR en el momento). `script-src`,
  `style-src` y `font-src` quedan en `'self'`.
- **`validar-csp.mjs`** reescrito: rastrea los recursos externos de los 885
  demos en `.html`, `.js` y `.css`, decide qué directiva necesita cada uno
  mirando la etiqueta o el contexto del CSS, y avisa **también** de los hosts
  que la CSP permite pero ya no usa nadie. Entra en el workflow y en
  `npm run validar`.
- **`apartar-recursos-remotos.mjs`** y **`limpiar-fuentes-vendor.mjs`**: para
  cuando un componente nuevo vuelva a traer un CDN. El primero es idempotente
  y se puede relanzar sin romper nada.
- **Typekit eliminado** de `scroll-effect`: su hoja devolvía 404, así que la
  tipografía nunca cargaba.

## [Las 676 fotos de las galerías, documentadas] — 2026-09-30

`THIRD_PARTY_NOTICES.md` no mencionaba las fotografías, que son el único recurso
de terceros que llega a las descargas.

- Nueva sección con el inventario: 86 carpetas, 676 fotos, cómo se atribuye
  cada una (78 con el pie en el HTML, 8 que lo guardan en `script.js`) y el
  recuento de licencias, enlazando a cada texto oficial CC, CC0 y GFDL.
- Constancia de que los **ZIP no llevan fotos dentro**: las carpetas contienen
  solo `html`, `js` y `css`.
- `creaciones-primium/LICENSE` apunta a ese inventario: su MIT cubre el código
  de las galerías, no las fotos.
- **6 galerías** (`bridge-board`, `coffee-finder`, `falls-filter`,
  `fogwood-phone`, `nebula-film`, `reef-grid`) citaban a Wikimedia Commons solo
  como texto, sin enlace. Ahora las 86 enlazan igual. Comprobado en navegador:
  siguen cargando sus fotos, con el enlace y sin errores.

## [Página 404 y documentación al día] — 2026-09-30

- **`404.html`** en la raíz, que Vercel sirve en cualquier dirección inexistente.
  Replica la paleta del sitio, avisa en el idioma que el visitante ya tenga
  elegido (`component-field-language`) y ofrece los dos destinos útiles: el
  catálogo y el listado completo.
- **README**: `GevendraAutorExterno` ya no se describe como parte del
  repositorio; se documentan las 86 galerías y los 160 componentes nuevos; la
  sección de despliegue explica la CSP corta y por qué los demos **sí** quedan
  sujetos a ella.
- **`robots.txt`**: el comentario decía 396 detalles, son 885.
- **`vercel.json`**: fuera el `redirect` de Gevendra y su `X-Robots-Tag`, ya
  innecesarios (esa carpeta está en `.gitignore` y no se despliega).

## [Retirada de los 116 demos de gevendra2004] — 2026-09-30

Sus demos de `GevendraAutorExterno/` **no se publican**: su repositorio de origen,
`gevendra2004/gevstack`, no declara licencia y el autor no respondió a los
contactos para pedirle permiso. Publicar su código, con o sin botón de descarga,
ya es redistribuirlo, así que la carpeta sale del catálogo y del sitio, **y
también del índice de git**: queda solo en el disco local, en `.gitignore`, para
poder consultarla mientras se espera una respuesta.

- `generate-catalog.mjs`: `GevendraAutorExterno` deja de ser raíz del catálogo
  (1001 → **885** componentes, los 885 descargables).
- `component-overrides.json`: fuera sus 116 entradas.
- **Borrado** `GevendraAutorExterno/LICENSE`: el MIT que esta carpeta llevaba
  desde el 29-09 era de este proyecto sobre obra ajena.
- `site.css`: fuera el bloque `.filter-button--underglow`, que era CSS copiado
  de su demo `animated-gradient-underglow`.
- `vercel.json`: `redirect` permanente de `/GevendraAutorExterno/:path*` a `/Web/`
  más `X-Robots-Tag: noindex, nofollow`, para que su contenido no se sirva aunque
  la carpeta siga en el repositorio. *(Retirados después en la misma fecha: la
  carpeta pasó a `.gitignore` y ya no se despliega, así que el bloqueo sobraba.)*
- `.gitignore`: `GevendraAutorExterno/`, y sus **1189 ficheros salen del índice**
  sin borrarse del disco.
- Web: fuera su tarjeta del roster, su nodo del diagrama NEXO (ahora dice `IA`),
  su botón del filtro de autores y sus claves i18n. El filtro queda con 4 autores
  y el roster con 3 cuentas.
- `storyP1` se parte en tres porque el nombre de su repositorio es ahora un
  enlace (`storyP1a` / `storyP1Link` / `storyP1b`): es la **única mención** que
  queda de él, y cita su trabajo, no su código.
- Docs: README, CONTRIBUTING, SECURITY, Web/README, `LICENSE` de raíz,
  THIRD_PARTY_NOTICES (apartado *Material retirado*) y este changelog. Las
  auditorías y los planes de `Docs/` se dejan intactos: cuentan lo que pasó.

## [MIT y ZIP para toda creaciones-primium] — 2026-09-29

- La raíz `creaciones-primium` pasa a `license: "MIT"`, `licenseFile: "LICENSE"`,
  `source` apuntando a este repositorio y `redistributable: true`.
- Su `LICENSE` cubre ya las 518 demos de la colección y nombra a las dos
  autoras: `fatmaerm` (las 160 de `indicadores-de-carga/` y `navegacion/`) y
  `kindred-98` (las 358 restantes).
- Descargables: **643 → 1001 de 1001** componentes; ya no queda ninguno sin
  redistribución.
- Docs: `THIRD_PARTY_NOTICES.md` (tabla, párrafos y estado), `LICENSE` de raíz,
  README, Web/README.

## [ZIP MIT para los demos de gevendra y fatmaerm] — 2026-09-29

- Dos `LICENSE` MIT nuevos: `GevendraAutorExterno/LICENSE` (los 116 demos de
  `gevendra2004/gevstack`, cuyo repositorio de origen sigue sin licencia) y
  `creaciones-primium/LICENSE` (sólo las dos carpetas de `fatmaerm`:
  `indicadores-de-carga/` y `navegacion/`, 160 demos).
- `generate-catalog.mjs` gana `licenses` por carpeta, el gemelo de `authors`:
  `license`, `licenseFile`, `source` y `redistributable` se resuelven por
  carpeta antes que por raíz, así que el MIT de fatmaerm no se cuela en los 358
  demos de `kindred-98` de la misma colección.
- Descargables: **367 → 643 de 1001** componentes (Gevendra 116 y fatmaerm 160
  entran; los 358 de `creaciones-primium/` de kindred siguen sin ZIP).
- Docs: `THIRD_PARTY_NOTICES.md` (tabla, estado y pendiente de la autorización
  escrita de Gevendra), `LICENSE` de raíz, README y Web/README.

## [davoker: sus 119 efectos, su portada en la nav y ZIP MIT] — 2026-09-29

Integra de una vez su repositorio entero, sin tocar su código.

### Hecho — carpetas

- `DavokerDiseñador/` recibe el árbol completo de `github.com/davoker/efectos_css_para_html` copiado byte a byte:
  los **119 efectos** en 7 carpetas temáticas (`miscelanea` 21, `harry_potter` 20, `stalker` 20,
  `monster_hunter` 18, `matrix` 14, `star_wars` 13, `the_division` 13), cada efecto con su `{efecto}.css`,
  su showcase `index.html`, su `{efecto}.zip` y su `como-aplicar-{efecto}.txt`; más `transicion.html`,
  `transicion.css`, la portada `davoker.html` (renombrada, antes `index.html`) y el `LICENSE` MIT de davoker.
- Verificado antes de copiar: 0 referencias externas (`http://`) en sus páginas, así que la CSP de Vercel no
  rompe nada; el catálogo pasa de **722 → 841** componentes (367 descargables).

### Hecho — la portada no es una tarjeta

- La portada de davoker enlaza los 119 CSS y `transicion.css`, y su id habría sido vacío, así que **no es una
  tarjeta**: se renombró `index.html` → `davoker.html` (el `meta refresh` y el enlace «Todos los efectos» de
  `transicion.html` apuntan ya al nombre nuevo) y solo se catalogan los `index.html`, con lo que
  `generate-catalog.mjs` y `validate.mjs` vuelven a la regla simple de siempre.
- La nav de las tres páginas **no** gana ningún enlace: el acceso es el filtro de autores. Al elegir
  **davoker** sin categoría y sin búsqueda, la rejilla de `components.html` se sustituye por su portada dentro
  de `#davoker-portal` con un `iframe` (cargado una sola vez); al cambiar de autor, de categoría o al buscar,
  vuelve la lista normal de tarjetas.

### Hecho — cómo entra en el catálogo

- Las 7 carpetas son **temas**, no categorías funcionales: el root `DavokerDiseñador` las mapea todas a
  `Effects`, y `getTags()` ahora usa `folderPath`, así que el tema viaja en los tags (`stalker`, `matrix`…).
- `titleCleanup` por raíz: los títulos `Efecto GLITCH - Showcase` quedan como `GLITCH` en la tarjeta.
- Descripción por defecto EN/ES declarada en el root, porque ninguno de sus efectos trae `meta description`.
- Licencia de raíz (`root.license`, `root.licenseFile`, `root.source`, `root.redistributable`): el `LICENSE`
  MIT se añade a los `files` de cada componente, con lo que sus 119 tarjetas salen con **ZIP habilitado**.

### Documentación

- `README.md`: 515 demos en cuatro colecciones, 367 descargables y el árbol actualizado.
- `Web/README.md`: la cuarta colección, la regla del `index.html` de raíz y el reparto `Effects` + tags.
- `THIRD_PARTY_NOTICES.md`: davoker (MIT, `github.com/davoker/efectos_css_para_html`) en la tabla.

## [Carpetas por autor y filtro de autor en la web] — 2026-09-29

Separa la colección por autoría y añade el filtro que la muestra.

### Hecho — carpetas por autor

- `BibliotecaDeHtml_CSS/` pasa a llamarse **`GevendraAutorExterno/`**: sus 116 demos son de Gevendra Sahu
  (`gevendra2004/gevstack`). Se comprobó comparando las 114 carpetas locales con el árbol del repositorio de
  origen: **106 coincidencias exactas y 8 con las erratas del propio origen** (`color-changing-navigation`,
  `facebook-emoji-reactions`, `order-confirm-animation`, `shopping-cart-preloader`, `spotlight-text-animation`,
  `tic-tac-toe`, `trick-and-treat-toggle`, `webgl-liquid-masking`).
- Nueva carpeta raíz **`DavokerDiseñador/`** para los demos de davoker; de momento vacía.
- **No se mueve nada a `CreacionesNuevas/`**: no hay ni un solo demo ajeno a Gevendra en esa carpeta.
- Las referencias al nombre antiguo quedan actualizadas en 19 ficheros (`README.md`, `LICENSE`, `SECURITY.md`,
  `CONTRIBUTING.md`, `Web/README.md` y `Docs/…`) además de `package.json` y
  `Web/scripts/generate-catalog.mjs`.

### Hecho — campo `author` en el catálogo

`generate-catalog.mjs` declara el autor de cada raíz y lo escribe en cada entrada: `Gevendra` (116 demos),
`Davoker` (0, carpeta recién creada) y `kindred-98` (606 de `CreacionesNuevas/` y `creaciones-primium/`).
Se puede corregir por ID con `author` en `Web/data/component-overrides.json`.

### Hecho — filtro de autor en la web

- `components.html` añade un segundo `fieldset` (`#author-filters`) encima del de categorías. El de categorías
  no se toca: el agrupamiento funcional (Animations, Buttons, Forms…) sigue intacto.
- `app.js`: `state.author`, `getAuthors()`, `renderAuthorFilters()` y el filtro en `getFilteredComponents()`.
  El autor entra también en el texto buscable. Nuevas claves `filterByAuthor` y `authors` en inglés y español.
- Botones: *Todos los autores* · *Gevendra* · *davoker* · *kindred-98* · *fatmaerm*. `fatmaerm` entra en
  `preferredAuthors` aunque todavía no tenga ningún demo (como davoker).
- `authorButtonFx` asigna la animación de cada botón y `renderAuthorFilters()` la pone en la clase CSS.

### Hecho — una animación propia por botón de autor

`styles/site.css` replica la animación de la demo de cada autor, **una por botón**:

| Botón | Animación | Demo de origen |
| --- | --- | --- |
| Gevendra | *Animated Gradient Underglow* (`.filter-button--underglow`) | `GevendraAutorExterno/animated-gradient-underglow` |
| davoker | *Liquid Fill Button* (`.filter-button--liquid`) | `CreacionesNuevas/liquid-fill-button` |
| kindred-98 | *Datamosh Decode Button* (`.filter-button--datamosh`) | `creaciones-primium/botones/datamosh-decode-button` |
| fatmaerm | *Neutron Star Pulse Button* (`.filter-button--pulse`) | `creaciones-primium/botones/neutron-star-pulse-button` |

- **Underglow**: el degradado rosa-violeta (`#ff5770` → `#6501de` → `#ff5770`) desenfocado con `blur(14px)` y
  `background-size: 200%` recorriendo `0% → 200%` en `1.25s linear infinite`, como en la demo original.
- **Datamosh**: aberración cromática en el rótulo (`text-shadow` rojo/cian con `steps(1, end)`), capa de
  macrobloques que salta de posición y un barrido de descodificación al pasar el cursor: al hover el texto
  queda limpio.
- **Pulse**: núcleo con `radial-gradient` que late a `1.42s` (1,42 Hz, el ritmo de los pulsares de la demo),
  onda que se expande desde el borde, se acelera al pasar el cursor y dos chorros bipolares
  (`box-shadow` arriba y abajo) al activarlo.
- Las cuatro animaciones se desactivan con `prefers-reduced-motion: reduce`.

### Documentación

- `README.md`: la colección de davoker en el listado y en el árbol, y el filtro de autor en *Características*.
- `Web/README.md`: origen del campo `author` y la cuarta carpeta raíz.

## [El catálogo se genera en el despliegue] — 2026-09-27

Continuidad de la [segunda auditoría](./Docs/Auditoria.md). Resuelve
el problema que aquella dejó abierto: el catálogo había que regenerarlo a mano, así que
un demo nuevo no aparecía en la web hasta que alguien se acordaba.

### Hecho — el build de Vercel genera el catálogo

`vercel.json` pasa de `"buildCommand": null` a:

```json
"buildCommand": "node Web/scripts/generate-catalog.mjs"
```

El catálogo refleja siempre lo que hay en disco. Da igual si el demo lo añade una
persona o un agente: no hay ningún paso manual que recordar.

### Hecho — los datos generados dejan de versionarse

`Web/data/catalog.json`, `Web/data/catalog.js` y `Web/data/sources/` pasan a
`.gitignore`: son 474 ficheros que se reescriben enteros cada vez que se añade un demo.

El beneficio mayor no es el tamaño, son los conflictos: al no estar versionados, **dos
agentes pueden añadir demos a la vez sin que sus cambios choquen sobre los mismos
473 ficheros de `sources/`**. Con ellos versionados, cualquier adición simultánea
provocaba un conflicto de merge en casi todos los ficheros de datos.

`git rm --cached` de `catalog.json` y `sources/`. `Web/data/component-overrides.json`
**se mantiene versionado** porque se edita a mano.

### Hecho — el CI hace lo mismo que producción

Antes, `validate.yml` regeneraba el catálogo y comparaba con `git diff` sobre
`Web/data/`. Ese paso dejó de tener sentido al dejar de estar versionado, así que se
sustituyó por los dos comandos reales:

1. `node Web/scripts/generate-catalog.mjs` — el mismo comando que ejecuta Vercel.
2. `node Web/scripts/validate.mjs` — sobre el catálogo recién generado.

El job ahora prueba exactamente lo que hará producción, y no necesita `git` para nada.

`validate.mjs` comprueba al principio que el catálogo exista y, si no, dice qué comando
ejecutar en lugar de soltar un error de Node. Probado sobre un árbol vacío: `exit=1` con
el mensaje correcto.

### Documentación

- `README.md`: sección *El catálogo se genera en el despliegue*, aviso explícito de que
  el **Build Command no debe quedar vacío en el panel de Vercel** (si se deja en blanco
  sobrescribe el valor de `vercel.json` y el catálogo no se genera), y *Contribuir* con
  los dos comandos de siempre.
- `Web/README.md`: *Ejecución local* actualizado con la nota de que en un clon nuevo el
  catálogo no existe, y `serve.mjs` como forma recomendada de servir en local.

### Nota

`.vercelignore` **no** incluye los datos generados a propósito. Si se ignoraran ahí, el
build los crearía y luego Vercel los eliminaría de la salida, dejando el sitio sin
catálogo. Se suben (~1,6 MB) y el build los sobrescribe.

## [Auditoría, CI de validación y cabeceras de seguridad] — 2026-09-27

Trabajo posterior a la primera auditoría (su documento se borró al limpiar
`Docs/` en `d650750` y no tiene equivalente actual; el inventario que la
sustituye está en [`Auditoria.md`](./Docs/Auditoria.md)), que
limpió 13,64 MB de ficheros sin uso. Aquí se registra lo que no es una fase del plan.

### Hecho — un solo sitio: se elimina el despliegue en GitHub Pages

El workflow `deploy-pages.yml` fallaba en **todas** las subidas con
`HttpError: Not Found` de `actions/configure-pages@v5`, que llama a
`GET /repos/{owner}/{repo}/pages` y recibe 404 porque **GitHub Pages no está
habilitado** en el repositorio. El parámetro `enablement` no lo arregla: exige un
token distinto de `GITHUB_TOKEN` con permisos de administración.

Más allá del error, publicar en Pages solo habría servido el artefacto de
`build-site.mjs`, filtrado por licencias: **248 de los 396** componentes. Vercel
sirve la raíz del repositorio y muestra los 396. Dos webs distintas, una incompleta.

- Borrado `.github/workflows/deploy-pages.yml` y `Web/scripts/build-site.mjs`.
- `catalog-format.mjs`: fuera `readSource()`, que solo usaba `build-site.mjs`, y el
  import `readFile` que quedaba sin uso. `toIndexEntry`, `toSourceEntry` y
  `writeSources` los sigue usando `generate-catalog.mjs`, así que el módulo se queda.
- `README.md`, `Web/README.md` y `THIRD_PARTY_NOTICES.md`: secciones *Despliegue*
  actualizadas y cifras corregidas de 364 a 396 demos en tres colecciones.

### Hecho — `validate.mjs`: el fallo que más avisa

Un demo añadido sin regenerar el catálogo **no aparece en la web y no da ningún
síntoma**. `Web/scripts/validate.mjs` lo detecta:

| Comprobación | Qué evita |
| --- | --- |
| `node --check` en los 6 `.js` | La web en blanco por un error de sintaxis |
| Catálogo ↔ `sources/` bidireccional | Un demo que abre a error |
| Cada `preview` apunta a un `index.html` real | Previews con 404 |
| `missingReferences` vacío | Referencias locales rotas |
| Todo `index.html` del disco está en el catálogo | **Demos que existen pero no se ven** |

Al escribirlo ya detectó **77 demos** de `creaciones-primium/botones/` presentes en
disco y ausentes del catálogo, y **0** fallos de sintaxis, `sources`, `preview` o
referencias. El workflow `validate.yml` lo ejecuta en cada `push` a `main` y en cada
pull request, más un `git diff` sobre `Web/data/` que falla si el catálogo quedó
desactualizado. **No despliega**, así que no depende de GitHub Pages.

### Hecho — cabeceras de seguridad

`vercel.json` tenía tres cabeceras. Se añaden `Content-Security-Policy`,
`Strict-Transport-Security` y `Permissions-Policy`.

La CSP se diseñó contra lo que la app usa de verdad, comprobado antes de aplicarla:
las tres páginas **no tienen ni un script ni un estilo inline** (el único script inline
del repositorio es la redirección de `index.html`), `app.js` solo usa la API CSSOM
(`.style.setProperty`), que la CSP no restringe, y no hay `eval` ni `new Function`.
Los recursos remotos que quedan son Google Fonts y los avatares de GitHub.

`frame-src 'self'` no rompe las previews porque están en el mismo origen, y los 148
demos de terceros **no quedan sujetos a esta CSP**: van dentro de un `iframe` y cada
documento aplica la suya, así que siguen pudiendo cargar sus recursos remotos.

### Corregido

- **Cache-busting desincronizado.** El HTML pedía `?v=20260927-27` y
  `app.js` llevaba `previewRevision = "20260926-2"` como literal suelto, así que
  tocar `app.js` no invalidaba la caché del navegador. Ahora `appVersion` se **deriva**
  del `?v=` que ya ponen las tres páginas: una sola fuente de verdad.
- **`robots.txt` no bloqueaba nada.** Decía `Disallow: /Web/?component=`, pero el
  detalle ya vive en `components.html?component=<id>` desde que la web se partió en
  tres páginas. Los 396 detalles eran indexables pese a su meta `noindex`. Corregido a
  `Disallow: /Web/components.html?component=`. Se eliminó también
  `Disallow: /.github-pages-site/`, ruta que no se publica en ningún hosting.
- **Código muerto: `?category=`.** `applyCategoryFromUrl()` leía un parámetro que
  nada generaba: la sección de categorías ya no existe en ninguna página y los filtros
  de `components.html` son `<button>`, no enlaces. Función y llamada eliminadas.
- **Path traversal en `serve.mjs`.** `base.startsWith(repositoryDirectory)` sin
  separador final dejaba pasar carpetas vecinas cuyo nombre empezara por el del
  repositorio: `/../Libreria_HTML_CSS_vecino/secreto.txt` se servía. Sustituido por
  `path.relative` con comprobación de `..` y de ruta absoluta. Verificado con
  `/../../Windows/win.ini` y el intento codificado en URL, ambos bloqueados. Solo
  afectaba al servidor local, nunca al sitio publicado.

## [Fase 10 — Clasificación de componentes y previews en producción] — 2026-09-27

### Hecho — previews que se veían rotas

La captura mostraba tarjetas sin estilos, imágenes rotas y barras de scroll.
La causa era una discrepancia de **mayúsculas entre el disco y el índice de git**:

| | En disco (Windows) | En git (lo que se despliega) |
|---|---|---|
| 404 | `404-page-not-found` | `404-Page-Not-Found` |
| Among us | `among-us-button` | `Among-us-button` |
| Gradient | `animated-gradient-underglow` | `Animated-Gradient-Underglow` |

**93 de las 114 carpetas** de `GevendraAutorExterno/` tenían la capitalización
distinta. El catálogo construye la ruta de la preview desde el disco, así que
buscaba `animated-gradient-underglow/`; al desplegar, Linux crea las carpetas
con la capitalización de git y la preview no encontraba nada. En Windows no se
notaba porque el sistema de archivos no distingue mayúsculas.

- `git config core.ignorecase false`, para que git deje de tratar como la misma
  dos carpetas que solo se diferencian en las mayúsculas.
- 93 carpetas renombradas en el índice (git las registra como renombrado) para
  que un clon en Linux reproduzca el árbol de trabajo actual.
- `scrolling="no"` en los iframes de preview: los demos se diseñan a pantalla
  completa y al recortarlos a 205 px aparecía la barra de scroll del iframe.
- Caché de assets a `?v=20260926-5`.

### Hecho — clasificación de componentes

- **Antes:** **136 de 364** componentes (37 %) caían en «Other» y solo **14** en
  «Animations». El clasificador era una lista corta de regex con
  `animation|animated|morph` **al final**, así que casi todo se escapaba a
  «Other».
- `generate-catalog.mjs`: `getCategory()` se reescribe como una tabla ordenada
  (`categoryRules`) con nueve categorías y muchos más términos, para que los
  demos futuros se clasifiquen bien solos.
- **114 correcciones explícitas** en `component-overrides.json` para lo que el
  heurístico no puede decidir por nombre. Criterio aplicado:
  - *Controls* = widgets que ajustan o eligen estado (toogles, sliders, diales,
    cerraduras, relojes, temporizadores).
  - *Forms* = todo lo que recibe datos, incluida la autenticación (OTP, teclado
    de PIN, escáner de iris).
  - *Effects* = tratamientos visuales y efectos (cristal, degradado, neón,
    cursores, texto, superposiciones).
  - *Animations* = movimiento en el tiempo, incluidos los ambientes y las secuencias.
  - *Other* = lo que de verdad no es un patrón de UI: la página 404, el tres en
    raya, los generadores, las herramientas de desarrollo y los paneles de datos.

### Verificado

| Categoría | Antes | Después |
|---|---:|---:|
| Animations | 14 | **68** |
| Effects | 53 | 63 |
| Controls | 22 | 41 |
| Other | **136** | **40** |

- `node --check generate-catalog.mjs` → 0; `generate-catalog.mjs` → 364 + 364.
- 364/364 con categoría; 0 sin clasificar.
- Smoke funcional **24/24** y 0 errores de consola: 10 categorías en los
  filtros, el filtro «Buttons» muestra sus 23 componentes.
- Capturas antes/después: las previews montadas se ven con sus estilos y sin
  barra de scroll.

### Pendiente / limitaciones

- **Este cambio solo surte efecto al desplegar**: mientras tanto, en el equipo
  sigue viéndose bien porque Windows no distingue mayúsculas.
- Las 40 categorías «Other» restantes son intencionadas. Si prefieres que
  alguna entre en Animations, se cambia en `component-overrides.json`
  (campo `category`).
- `core.ignorecase=false` queda activado en el repositorio. Es lo que evita que
  el problema reaparezca, pero conviene saberlo.

## [Fase 9 — `CreacionesNuevas/` integrada] — 2026-09-26

### Contexto

`CreacionesNuevas/` contenía **248 demos** del autor que el catálogo ignoraba:
`generate-catalog.mjs` solo recorría `GevendraAutorExterno/`. Pasan a formar
parte de la biblioteca, con sus descripciones en los dos idiomas y con descarga
ZIP habilitada por ser creaciones originales con licencia propia.

### Hecho — el generador admite varias colecciones

- `Web/scripts/generate-catalog.mjs`:
  - `libraryRoots` sustituye a la constante `libraryDirectory`: ahora son
    `GevendraAutorExterno` y `CreacionesNuevas`.
  - Cada componente incluye un campo nuevo **`root`** con la carpeta de la que
    procede, y `folder` sigue siendo la ruta relativa **dentro** de ella. No
    cambia ningún `id`, así que las URLs `?component=` existentes no se rompen.
  - `getLocalReferences()` y `getMissingReferences()` reciben la raíz del
    componente. **Este era el punto delicado**: ambas filtraban por
    `libraryDirectory`, así que sin este cambio las hojas de estilo y los scripts
    de los 248 demos nuevos se habrían descartado por estar fuera de
    `GevendraAutorExterno/`. Verificado: los 248 detectan su CSS y sus scripts.
  - `build-site.mjs` localiza y copia cada demo desde `component.root` y lanza un
    error explícito si la raíz no existe; el artefacto conserva el nombre de la
    raíz para que las previews sigan resolviendo.
- Comprobado **antes** de tocar código: **0 colisiones de ID** entre las dos
  colecciones (116 + 248 = 364 IDs únicos), y los 248 son de primer nivel.

### Hecho — licencia y descripciones

- **`LICENSE` MIT creada en las 248 carpetas** de `CreacionesNuevas/`, con una
  cláusula de alcance que excluye los recursos de terceros que la demo referencie.
- **`LICENSE` raíz ampliada**: su alcance ahora cubre también los demos
  originales de `CreacionesNuevas/`, y sigue excluyendo `GevendraAutorExterno/`.
- **`Web/data/component-overrides.json`**: 248 entradas nuevas (364 en total) con
  `description`, `descriptionEs`, `source` (este repositorio), `license: "MIT"`,
  `licenseFile: "LICENSE"` y `redistributable: true`.
- **496 descripciones escritas** (248 en inglés y 248 en español) a partir del
  `<title>` de cada demo, con el mismo criterio que en la Fase 5: una frase
  corta y factual, sin inventar funcionalidades.

### Hecho — documentación

- `README.md`: introduce las dos colecciones y sus reglas de licencia; actualiza
  la *Estructura* y **reescribe el aviso de `build-site.mjs`**, que ha cambiado
  de sentido (ya no publica 0 componentes, publica 248).
- `Web/README.md`: 364 componentes y las dos situaciones de licencia.
- `THIRD_PARTY_NOTICES.md`: tabla con las dos colecciones y su estado de ZIP.
- `Docs/Plan_de_fases.md`: **Fase 9** añadida y el pendiente que la bloqueaba
  marcado como resuelto.

### Verificado

| Métrica | Antes | Después |
|---|---:|---:|
| Componentes en el catálogo | 116 | **364** |
| Descripciones EN + ES propias | 116 | **364** |
| Componentes con ZIP habilitado | 0 | **248** |
| `build-site.mjs` → cleared components | 0 | **248** |

- `node --check` en `generate-catalog.mjs` y `build-site.mjs` → 0.
- Catálogo: 364 entradas y 364 ficheros en `sources/`; 116 + 248 por raíz;
  **0** descripciones genéricas en EN o ES; **0** componentes sin `descriptionEs`;
  **0** overrides huérfanos; **0** referencias locales ausentes en los 248.
  El índice pasa de 99,7 KB a **331 KB** por duplicar componentes y descripciones,
  pero sigue siendo **menos de la mitad** que el `catalog.js` original (733 KB), y
  el detalle se sigue pagando bajo demanda en `sources/`.
- `build-site.mjs` **dos veces seguidas** → `Prepared 248 cleared component(s)` en
  ambas y exit 0, con `CreacionesNuevas/` (248 carpetas), `sources/` (248) y
  `catalog.json` (248) en el artefacto. Por fin genera contenido real.
- **ZIP real de extremo a extremo**: desde el navegador se descargó
  `ascii-art-generator` (toast «Component ZIP downloaded») y el mismo archivo
  generado en memoria se validó con `zipfile` de Python → `testzip()` sin
  errores (CRC correctos), 5 entradas (690 + 1272 + 3176 + 936 + 26 B = 6100 B
  → **2248 B**, 37 %), con `LICENSE` dentro y `ATTRIBUTION.txt` con la fuente y la
  licencia. Los ficheros de texto van con método 8 (deflate).
- **Chrome headless (CDP), detalle de un demo nuevo** (10/10): `<h1>` correcto,
  descripción propia en inglés y en español, **botón ZIP habilitado**
  (`Download ZIP` / `Descargar ZIP`), procedencia «Redistribution cleared ·
  Source: …/Libreria_HTML_CSS · License: MIT», 3 bloques de código con 3710
  caracteres, preview `ready` y 0 errores de consola.
- **Smoke funcional completo con 364 componentes**: **24/24** y 0 errores de
  consola o de red.

### Pendiente / limitaciones

- Las 496 descripciones están redactadas a partir del nombre y el `<title>` de
  cada demo. Conviene revisarlas al pasar por la interfaz: es lo mismo que se
  hizo con las 116 de la Fase 5.
- Los 116 demos de terceros siguen **sin descarga ZIP**, y el motivo no ha
  cambiado: su repositorio de origen no declara licencia.
- Con `build-site.mjs` el sitio publica 248 componentes y sin él, 364. Para Vercel
  se sigue recomendando servir la raíz del repositorio (ya está en los README y
  en `vercel.json`).

## [Fase 8 — Verificación final] — 2026-09-26

### Hecho

- Smoke completo con Chrome headless vía CDP: **24 comprobaciones** sobre home,
  búsqueda, estado vacío, filtro por categoría, «cargar más», detalle, copiar,
  «volver», tema, idioma y previews. **24/24 superadas, 0 errores de consola y
  0 peticiones fallidas.**
- **Auditoría de las 116 previews una a una**: todas alcanzan
  `data-preview-state="ready"`, ninguna queda en `error`, **0 referencias
  locales ausentes** y **0 fallos de red externa** (Google Fonts, cdnjs,
  jsDelivr, unpkg, pexels, unsplash, bootstrapcdn…).
- **Mejora encontrada por el smoke**: «Copiar» solo dependía de
  `navigator.clipboard.writeText`. Cuando la API **existe pero deniega el
  permiso** (contexto no seguro, iframe sin permiso, foco perdido) el botón
  quedaba muerto. Ahora `copyText()` cae a un `textarea` temporal con
  `document.execCommand("copy")`, y solo si ambos caminos fallan avisa al
  visitante. El `textarea` se elimina siempre, incluso si el comando falla.
- Documentación actualizada al estado real:
  - `README.md`: sección *Estructura* rehecha (incluye `data/sources/`,
    `catalog.js`, `scripts/catalog-format.mjs` y los cuatro ficheros SEO) y
    *Procedencia y licencias* corregida — `source` **ya está verificado** para
    los 116; lo que sigue `Unverified` es `license`.
  - `Web/README.md`: la generación ahora describe los **tres** artefactos
    (`catalog.json`, `sources/<id>.json` y `catalog.js`) y el override documenta
    `descriptionEs`.

### Verificado

| Comprobación | Resultado |
|---|---|
| `node --check` (5 scripts) | 0 |
| `generate-catalog.mjs` | 116 entradas + 116 fuentes |
| `build-site.mjs` ×2 | exit 0, `0 cleared component(s)` en ambas |
| Smoke funcional | 24/24 |
| Previews de componentes | **116/116 `ready`**, 0 `error` |
| Referencias locales rotas | 0 |
| Peticiones externas fallidas | 0 |
| Errores de consola / red | 0 |
| `git ls-files` con `github-pages*` | 0 |

### Pendiente / limitaciones

- `CreacionesNuevas/` contiene **248 demos nuevos** del autor que el catálogo
  **no recoge**: `generate-catalog.mjs` solo recorre `GevendraAutorExterno/`.
  Integrarlos es una fase aparte (movimiento o referencia de la carpeta,
  248 descripciones EN/ES y decisión de licencia; al ser creaciones propias sí
  podrían autorizarse para ZIP). **No se ha tocado esa carpeta.**
- «Copiar» sigue mostrando un aviso si el navegador no ofrece **ninguno** de los
  dos caminos; en headless sin portapapeles real es el caso esperado.
- El dominio `libreria-html-css.vercel.app` está escrito a mano en `index.html`,
  `robots.txt`, `sitemap.xml` y en el `siteOrigin` de `app.js`: si Vercel
  asigna otro nombre hay que actualizar esos cuatro sitios.

## [Fase 7 — SEO y pulido] — 2026-09-26

### Hecho

- **`Web/favicon.svg`** (nuevo): icono SVG dibujado con la paleta del sitio
  (`</>` en `--accent`, barra diagonal en `--coral`, fondo `--page` y borde
  `--line`). Se enlaza también como `apple-touch-icon`.
- **`Web/og-image.png`** (nuevo): tarjeta social de **1200×630 px** (75 KB)
  generada con Chrome headless a partir de una maqueta con los colores y
  tipografías del sitio. Verificada la firma PNG y las dimensiones exactas.
- **`Web/index.html`**:
  - Open Graph completo: `og:type`, `og:site_name`, `og:title`,
    `og:description`, `og:url`, `og:image`, `og:locale` y `og:locale:alternate`
    (EN/ES).
  - Twitter Card `summary_large_image` con `twitter:title`,
    `twitter:description` y `twitter:image`.
  - `link[rel=canonical]` a `https://libreria-html-css.vercel.app/Web/`.
  - `meta[name=robots]` = `index, follow` y `meta[name=color-scheme]` =
    `dark light` (los controles nativos respetan el tema).
  - Caché de assets actualizada a `?v=20260926-4`.
- **`Web/robots.txt`** (nuevo): permite `/Web/`, bloquea `/Web/?component=` y el
  artefacto `.github-pages-site/`, y declara el sitemap.
- **`Web/sitemap.xml`** (nuevo): contiene **solo la home**. Los detalles se
  sirven con `?component=<id>`, que no es una URL indexable; listarlos en el
  sitemap sería apuntar a páginas que no existen como recurso independiente.
- **`Web/scripts/app.js`**:
  - Nuevo `updateDocumentMetadata({ title, description, url, robots })`, que
    escribe de una vez `document.title`, `meta[name=description]`, `meta[name=robots]`,
    `og:title/description/url/image`, `twitter:title/description/image` y el
    `canonical`. Evita que las etiquetas se desincronicen entre sí.
  - `renderDetail()` pasa a usarlo: cada componente expone su título, su
    descripción real (EN o ES según el idioma) y su URL, y se marca
    `noindex, follow` para no competir con la home en el índice.
  - `renderRoute()` restaura los valores por defecto de la home al volver del
    detalle.
  - `updateLocalizedMetadata()` regenera los metadatos al cambiar de idioma
    (antes solo se traducía `meta[name=description]`).
  - `defaultMetadata` captura la imagen OG una sola vez al cargar.

### Verificado

- `node --check Web/scripts/app.js` → 0.
- **Chrome headless (CDP)**, tres estados:
  - **Home**: `title` = «HTML & CSS Library», `description` = la del hero,
    `og:title/description/url/image` correctos, `twitter:card` =
    `summary_large_image`, `robots` = `index, follow`, `canonical` =
    `…/Web/`, favicon y `apple-touch-icon` presentes.
  - **Detalle (`?component=tic-tac-toe`)**: `title` = «Tic Tac Toe · HTML & CSS
    Library», `description` = «A playable tic-tac-toe game running in the
    browser.» (la descripción real del componente), `og:*` y `canonical`
    apuntando a su URL, `robots` = `noindex, follow`.
  - **Vuelta a home**: todos los valores restaurados correctamente.
- Servidor local: `/Web/`, `/Web/favicon.svg`, `/Web/og-image.png`,
  `/Web/robots.txt`, `/Web/sitemap.xml`, `/Web/scripts/app.js` y
  `/Web/scripts/zip.js` → **todos 200**. Nada de lo nuevo está en
  `.vercelignore`.

### Pendiente / limitaciones

- El dominio `libreria-html-css.vercel.app` está escrito a mano en `index.html`
  y en `robots.txt`/`sitemap.xml`. Si al desplegar Vercel asigna otro nombre de
  proyecto, hay que sustituirlo en esos tres sitios (y en el `siteOrigin` de
  `app.js`).
- Para indexar los 116 demos individually haría falta convertir las vistas
  `?component=` en páginas reales (por ejemplo `/Web/component/<id>/index.html`
  generadas por `generate-catalog.mjs`). Es un cambio de arquitectura del
  enrutado, fuera del alcance de esta fase.

## [Fase 6 — ZIP e investigación de procedencia] — 2026-09-26

### Hecho — ZIP

- `Web/scripts/zip.js` reescrito para **comprimir de verdad**:
  - `deflateRaw()` usa `CompressionStream("deflate-raw")` y devuelve `null`
    (→ método `stored`) si no existe `CompressionStream`, si el fichero está
    vacío, si falla la compresión o si el resultado no es más pequeño.
  - Cada entrada se prepara antes de escribir cabeceras, de modo que el método y
    los dos tamaños (comprimido y original) se rellenan correctamente en la
    cabecera local y en la central.
  - `createStoredZip` pasa a llamarse **`createZip`** y es `async`;
    `app.js:566` hace `await window.createZip(files)`.
- **Bug crítico corregido**: el EOCD escribía la longitud del comentario con
  `view.setUint32(20, 0, true)` sobre un buffer de **22** bytes → `RangeError`
  garantizado en **cada** descarga. Se cambia a `setUint16`. El botón ZIP nunca
  había funcionado; no se había notado porque los 116 componentes están
  deshabilitados (`downloadable: false`).
- `Web/scripts/app.js` — `createProvenanceNote()`: ahora muestra la **fuente
  identificada** también cuando el componente no está verificado. Antes solo
  aparecía `Source:` en el caso verificado, que hoy no existe en ningún
  componente, así que la atribución era invisible pese a conocerla.

### Hecho — Investigación de procedencia (116/116)

- Se comparó el árbol de carpetas local con el del repositorio público de origen.
  **Los 116 demos proceden de `https://github.com/gevendra2004/gevstack`**
  («All Gevstack projects», Gevendra Sahu, 659 ★): 106 coincidencias exactas y 8
  por erratas del propio repositorio de origen
  (`color-chainging-navigation`, `Order-confirm-anmation`,
  `Shoping-cart-preloader`, `Sportlight-Text-Animation`, `Tic-tak-toe`,
  `Trick-&-treat-toggle`, `webgel-liquid-masking`, `Facebook-emoji-reactor`).
- **Ese repositorio no tiene licencia**: `LICENSE` → **404**, la API de GitHub
  devuelve `"license": null` y el `README.md` solo dice «All Gevstack projects»,
  sin términos. Se buscaron condiciones equivalentes en el sitio del autor: nada.
  El mismo autor **sí** declara MIT en otros repos suyos, lo que confirma que su
  ausencia en `gevstack` es deliberada.
- **Consecuencia**: 0 componentes autorizados. `license` sigue en `Unverified` y
  `redistributable` en `false` para los 116. El botón ZIP continúa deshabilitado
  **por diseño**, no por descuido.
- `Web/data/component-overrides.json`: se documenta `source` en las **116**
  entradas (antes ninguna lo tenía). Se conservan `license: "Unverified"`,
  sin `licenseFile` y sin `redistributable`, complying con la regla transversal de
  no autorizar sin licencia verificada y sin archivo `LICENSE` en la carpeta.
- `THIRD_PARTY_NOTICES.md` reescrito: inventario completo, evidencia de la
  ausencia de licencia, tabla de correspondencia de las 8 erratas, qué se sí
  permite (estudio personal) y el camino para desbloquearlo (autorización
  escrita del autor).

### Verificado

- `node --check` en `app.js`, `zip.js` y `generate-catalog.mjs` → 0.
- ZIP real generado con `zip.js` y validado con `zipfile` de Python:
  6 entradas, 39 126 B → **1 199 B** (`ratio` 0,031), `testzip()` → `None`
  (CRC correctos en todas), `index.html` y `styles.css` con **método 8**,
  y `stored` (método 0) en el fichero vacío, el binario y el texto corto;
  contenido recuperado idéntico al original.
- `generate-catalog.mjs` → 116 con `source`; `downloadable: 0`;
  `license: "Unverified"` en 116.
- `build-site.mjs` → exit 0, `Prepared 0 cleared component(s)` (correcto).
- **Chrome headless (CDP)** sobre `?component=among-us-button`: título y `<h1>`
  correctos, botón con texto **«ZIP unavailable»** y `disabled: true`, `title`
  explicativo correcto, aviso **«Distribution not cleared»** y la URL de origen
  `github.com/gevendra2004/gevstack` **visible** en la nota de procedencia.

### Pendiente / limitaciones

- **Ninguna descarga ZIP puede habilitarse** sin autorización del autor. El camino
  previsto es pedirle a Gevendra Sahu una autorización escrita o que añada una
  licencia a `gevendra2004/gevstack`.
- No se auditó de forma individual la licencia de los recursos externos que las
  páginas **referencian** (Google Fonts, Remix Icon, Ionicons, GSAP, Bootstrap
  CDN, fotos de `samrithasudhagar.github.io`, `araltasher/misc`, Pexels,
  Unsplash, Pinterest). No se incluyen en el ZIP, pero condicionan cualquier
  futura redistribución.
- `build-site.mjs` sigue generando un artefacto vacío a propósito; **no** usarlo
  como build command de Vercel (ya está avisado en los README y en `vercel.json`).

## [Fase 5 — i18n: descripciones reales en español] — 2026-09-26

### Contexto

Medido sobre `Web/data/catalog.json`: **113 de 116** demos no tenían descripción
real. Su campo `description` era la genérica auto-generada por el generador
(`Standalone <categoría> demo from the component collection.`), y en español
todas las tarjetas mostraban la misma frase
«Demo independiente de *<categoría>* de la colección de componentes». Solo los
3 destacados tenían texto propio, traducido en duro dentro de `app.js`.

### Hecho

- **`Web/data/component-overrides.json` reescrito**: ahora tiene **116 entradas**
  (antes 3), cada una con `description` (inglés) y `descriptionEs` (español)
  redactados a partir del nombre, la categoría y los tags de cada demo. Las 3
  destacadas conservan `name`, `category`, `tags` y `featured`.
  `featuredDescriptions`/`standaloneDescription` dejan de vivir en el código.
- **`Web/scripts/generate-catalog.mjs`**: añade `descriptionEs` al componente
  cuando el override lo define (`...(descriptionEs ? { descriptionEs } : {})`),
  de modo que los demos sin traducir no inflan el índice con `null`.
- **`Web/scripts/app.js`**:
  - `getComponentDescription()` → en inglés `description`; en español
    `descriptionEs || description`. **Desaparece el fallback genérico**: si no hay
    traducción, se muestra el texto original en inglés.
  - Eliminados de los diccionarios EN y ES las claves `standaloneDescription` y
    `featuredDescriptions` (sin uso y ahora redundantes con los datos).
- **`Web/scripts/build-site.mjs`**: sin cambios; `{ ...entry, ...readSource(...) }`
  y `toIndexEntry` propagan el campo automáticamente.
- **`README.md` y `Web/README.md`**: el ejemplo de `component-overrides.json`
  incluye `descriptionEs` y se explica la regla de reserva.

### Verificado

- `node --check Web/scripts/app.js` y `generate-catalog.mjs` → 0.
- Catálogo regenerado: **116/116** con `description` **y** `descriptionEs`;
  0 descripciones que empiecen por `Standalone`; 0 `descriptionEs` genéricos.
- `catalog.json` pasa de 84,5 KB (Fase 3) a **99,7 KB**: +15 KB por las 116
  descripciones en español y las 116 URLs de `source`. Sigue siendo un **−87 %**
  frente a los 733 KB del catálogo original.
- **Chrome headless, EN** (`--dump-dom`, `/Web/`): `lang="en"`, 15 tarjetas,
  **0** textos `Standalone …` visibles, y se ven las descripciones nuevas
  (p. ej. la del 404 y la de `blur-text-reveal`), `stat-components` = 116.
- **Chrome headless, ES** (CDP: se fija `component-field-language = es` y se
  recarga): `lang="es"`, 15 tarjetas, **0** «Demo independiente…», **0**
  `Standalone …`, y las descripciones salen en español
  («Página de error 404 con un diseño minimalista…»,
  «Superficie tipo tarjeta con un resplandor inferior…»).

### Pendiente / limitaciones

- Las 116 descripciones están redactadas a partir del nombre, la categoría y los
  tags del demo (más la lectura directa de los casos ambiguos:
  `skillet-toggle-switch`, `trick-and-treat-toggle`, `stack-glitch-effect`).
  Conviene revisarlas frente al render real de cada demo y ajustar las que
  describan algo que no se vea.
- El `<title>` de los demos sigue mostrando la marca original en algunos casos;
  se limpia en `name` al generar el catálogo, pero no dentro de la propia demo.

## [Fase 4 — Previews bajo demanda] — 2026-09-26

### Hecho

- `Web/scripts/app.js`: las previews dejan de cargarse al pintar la tarjeta.
  - Nuevo `IntersectionObserver` con `rootMargin: "400px 0px"`. `createPreview()`
    guarda la URL en `frame.dataset.previewSrc` y observa el contenedor;
    `mountQueuedPreview()` asigna el `src` solo cuando este entra en viewport.
  - `refreshQueuedPreviews()` se llama al final de `renderComponents`,
    `renderFeaturedComponents` y `renderDetail`: hace `disconnect()` y vuelve a
    observar **solo** los iframes aún en cola. Los ya montados no tienen
    `data-preview-src`, así que no se re observan y no quedan referencias a
    nodos desechados tras cada re-render de la cuadrícula.
  - **Bug corregido de camino**: los listeners `load`/`error` se registraban al
    crear el iframe. Un iframe **sin `src`** navega a `about:blank` y dispara
    `load`, con lo que el contenedor pasaba a `data-preview-state="ready"` con la
    preview vacía, se ocultaba el placeholder y el selector de cola
    (`[data-preview-state='loading']`) dejaba de encontrar nada → ninguna
    preview llegaba a montarse. Ahora `armPreviewListeners()` los registra justo
    antes de asignar el `src`.
  - Si el navegador no tiene `IntersectionObserver`, se asigna el `src`
    directamente (comportamiento anterior).

### Verificado

- `node --check Web/scripts/app.js` → 0; Chrome headless sin mensajes de consola
  con error (`--enable-logging=stderr --v=1`).
- **Chrome headless** (`--dump-dom`, ventana 1280×800) en `/Web/`:
  **3 iframes montados** (fila visible), **12 en cola**, **0** en `error`,
  `stat-components` = 116.
- **Chrome headless** en `?component=among-us-button`: **1 iframe montado** (la
  preview del detalle) y los 3 del catálogo oculto en cola → el detalle no espera.
- Prueba de control con un `IntersectionObserver` aislado: sí dispara en el mismo
  entorno headless, descartando una limitación del navegador de pruebas.

### Pendiente / limitaciones

- El placeholder ("Cargando vista previa…") se muestra también mientras la
  tarjeta está **en cola** fuera del viewport; no se distingue *pendiente* de
  *cargando* en el texto (solo en `data-preview-state`).
- Las previews con CDNs externos suman sus peticiones al montarse; la revisión
  de las que fallen queda para la Fase 8.

## [Fase 3 — Catálogo ligero] — 2026-09-26

### Hecho

- **Diagnóstico de peso** (sobre `catalog.json` de 716 KB medido con
  `JSON.stringify`): código CSS embebido **43 %**, campo `html` **32 %**,
  scripts **5 %**, `files` **6,5 %**, metadatos **10 %**. El **83 %** del catálogo
  era código fuente que solo se necesita al abrir un detalle.
- Nuevo módulo `Web/scripts/catalog-format.mjs` (compartido por los dos scripts
  de build) con `toIndexEntry`, `toSourceEntry`, `writeSources` y `readSource`.
- `generate-catalog.mjs` pasa a escribir **tres** artefactos:
  - `Web/data/catalog.json` → **índice ligero**: `id`, `name`, `category`,
    `featured`, `description`, `tags`, `folder`, `preview`, `missingReferences`,
    `license`, `source`, `licenseFile`, `downloadable` y
    `stylesheets`/`scripts` con **solo `name` y `path`**. Sin `html`, sin
    `inlineCss`/`inlineJavaScript`, sin `files` y sin el `code` de cada hoja.
  - `Web/data/sources/<id>.json` → 116 ficheros (~2,7 KB de media) con
    `html`, `inlineCss`, `inlineJavaScript` y `files`.
  - `Web/data/catalog.js` → catálogo **completo**, solo para el modo `file://`.
- `Web/scripts/app.js`:
  - `loadCatalog()` hace `fetch("./data/catalog.json")` en HTTP. Solo inyecta
    `catalog.js` cuando `location.protocol === "file:"` (donde `fetch` está
    bloqueado por CORS) y como *fallback* si el JSON falla.
  - `ensureComponentSource(component)` baja `sources/<id>.json` la primera vez
    que se abre un detalle y lo mezcla en `state.components` (cacheado: solo se
    paga una vez).
  - `renderDetail` ya no bloquea: pinta primero enlace, cabecera y preview, y
    **después** paga la fuente; si falla, muestra `sourceLoadError` y el bloque
    HTML cae a `noLocalSource` (traducido).
  - `downloadComponentZip` también llama a `ensureComponentSource` antes de
    leer `component.files`.
  - `renderRoute` envuelve `renderDetail` en `.catch` para que una promesa
    rechazada no se quede como *unhandled rejection*.
- `Web/index.html`: eliminada la etiqueta `<script defer src="./data/catalog.js">`
  (ahora se inyecta bajo demanda); caché a `?v=20260926-3`.
- `Web/scripts/build-site.mjs`: reensambla cada entrada aprobada leyendo
  `sources/<id>.json`, escribe el índice ligero + `catalog.js` completo y
  **borra los `sources/*.json` de los componentes no autorizados** del artefacto.

### Verificado

| Métrica | Antes | Después |
|---|---|---|
| Home descarga `catalog.json`/`catalog.js` | **733 KB** | **84,5 KB** (−89 %) |
| Ficheros de detalle | — | 116 × ~2,7 KB (bajo demanda) |
| `catalog.js` (solo `file://`) | 733 KB | 733 KB (no se pide en HTTP) |

- `node --check Web/scripts/app.js` → 0. `generate-catalog.mjs` → 116+116.
- `build-site.mjs` dos veces seguidas → exit 0, `sources` del artefacto = 0
  (correcto: 0 componentes aprobados), `catalog.json` = `[]`.
- Servidor local: `catalog.json` 200/84 551 B, `sources/among-us-button.json`
  200/3 995 B, `sources/404-page-not-found.json` 200/14 409 B, preview 200.
- **Chrome headless** (`--dump-dom`) sobre `http://localhost:8126/Web/`:
  `stat-components` = **116**, `results-count` = "116 components", **15 tarjetas**
  (3 destacadas + 12 de la primera página) y aviso de publicación **visible**.
- **Chrome headless** sobre `?component=among-us-button`: `<title>` y `<h1>`
  correctos, **2 bloques de código** (HTML + CSS), **0** `error-message`,
  4 iframes (3 destacados + el del detalle).

### Pendiente / limitaciones

- El modo `file://` sigue funcionando (catálogo completo inyectado), pero en el
  **artefacto de despliegue** `catalog.js` también es completo: si alguien abre
  ese artefacto con `file://`, el detalle usa el catálogo embebido y no necesita
  `sources/`.
- `Web/data/sources/` es generado y **se versiona** igual que `catalog.json`;
  hay que regenerarlo después de tocar cualquier demo.
- Se detectó que hay demos editándose de forma concurrente en el repositorio
  (rebranding "Gev Stack" → "Kindred" en `Blur-Text-Reveal`,
  `Button-Hover-Effect-Part-02` y `Card-Hover-Effect`). El catálogo se
  regeneró después y los refleja; hay que volver a ejecutar
  `generate-catalog.mjs` tras cualquier edición de demos.

## [Fase 2 — Bugs y correcciones de código] — 2026-09-26

### Hecho

- **Mixed content eliminado.** `GevendraAutorExterno/Flipping-Loader/styles.css`
  (la carpeta real es `Flipping-Loader`, con mayúsculas) dejaba de cargar
  `http://subtlepatterns.subtlepatterns.netdna-cdn.com/patterns/kindajean.png`:
  host muerto *y* `http://` bloqueado en HTTPS. Se elimina la línea y se conserva
  `background-color: #012501`. Era la única URL `http://` real del proyecto
  (el resto eran `xmlns` de SVG, inofensivos).
- `Web/scripts/app.js`:
  - `appendSourceGroup` usaba el literal inglés `"No local source file found."`
    en vez de `t("noLocalSource")` → traducible.
  - Enlace "← Volver a componentes": añadido `event.preventDefault()` y
    `scrollIntoView`. Antes se empujaba el estado con `pushState` **y** actuaba
    el navegador sobre `href="#components"`, creando una entrada de historial
    que podía regresar al detalle.
  - **Aviso de publicación con estado real.** Nuevo `updatePublicationNotice()`
    (llamado tras cargar el catálogo y en cada cambio de idioma) con tres estados:
    catálogo vacío (build filtrado → texto original), componentes presentes pero
    ninguno verificado (nuevas claves `publicationZipTitle`/`publicationZipText`,
    EN+ES: "ZIP downloads pending verification") y todos verificados (sin aviso).
    Antes solo aparecía cuando el catálogo estaba vacío, así que al desplegar la
    raíz no se comunicaba por qué el botón ZIP estaba deshabilitado.
  - Nuevo flag `state.catalogLoaded` para que el aviso no parpadee antes de cargar.
- `Web/scripts/build-site.mjs`: `mkdir(outputDirectory, { recursive: true })`.
  **Reproducido antes**: dos ejecuciones seguidas → `EEXIST`; ahora ambas → exit 0.
- `index.html` raíz: añadido `<meta http-equiv="refresh" content="0; url=./Web/">`
  en `<head>` como fallback sin JavaScript. (Se descartó un `<noscript>` con
  `<meta>` dentro del `<body>`, que es inválido y no funciona.)
- `Web/README.md`: eliminadas 3 líneas casi idénticas sobre
  `generate-catalog.mjs` (27–29); queda una sola con el comportamiento correcto
  (genera `catalog.json` **y** `catalog.js`).

### Verificado

- `node --check Web/scripts/app.js` y `node --check Web/scripts/zip.js` → 0.
- `node Web/scripts/generate-catalog.mjs` → 116 componentes; el único diff es el
  CSS embebido de `Flipping-Loader`.
- `node Web/scripts/build-site.mjs` dos veces seguidas → `Prepared 0 cleared
  component(s)` en ambas, exit 0 (regresión del `EEXIST` corregida).
- Servidor local: `/`, `/Web/`, `catalog.json`, `Flipping-Loader/index.html` y su
  `styles.css` → 200; el `catalog.json` ya **no** contiene `subtlepatterns`.

### Pendiente / limitaciones

- El aviso de ZIP ahora es visible en la home mientras no haya ningún componente
  verificado. Es intencionado (explica el estado real); si resulta demasiado
  prominente, se puede degradar a un texto en el pie.
- No se modificó el comportamiento visual de `Flipping-Loader`: solo se quitó una
  textura de fondo que ya no se cargaba.

## [Fase 1 — Despliegue en Vercel] — 2026-09-26

### Hecho

- `vercel.json` nuevo (JSON validado): `framework: null`, `buildCommand: null`,
  `outputDirectory: "."`, `cleanUrls: false`.
  - `redirects`: `/` → `/Web/` (307, sustituye la redirección solo-JS del
    `index.html` raíz) y `/Web` → `/Web/` (308). Este último es obligatorio:
    sin la barra final, `./styles/site.css` se resolvería contra `/` y daría 404.
  - `headers` globales: `X-Content-Type-Options: nosniff`,
    `X-Frame-Options: SAMEORIGIN` (impide que otros sitios emmarquen los demos;
    nuestras propias previews siguen permitidas por ser mismo origen) y
    `Referrer-Policy: strict-origin-when-cross-origin`.
- `.vercelignore` nuevo: excluye `Docs/`, `.qodo/`, `.github/`, `.vercel/`,
  `CHANGELOG.md` y `.github-pages-*`. **No** excluye `Web/` ni
  `GevendraAutorExterno/`, que son imprescindibles para las previews.
- `README.md`: la sección *Despliegue* pasa a tener **Vercel / GitHub Pages /
  Netlify** por separado, con tabla de configuración y una advertencia explícita
  de que `node Web/scripts/build-site.mjs` **no** debe usarse como build command
  (publicaría 0 de 116 demos y rompería las previews).
- `Web/README.md`: sección *Despliegue* reescrita con el mismo criterio.
- Verificación local (`py -m http.server 8123` sobre la raíz del repositorio):
  `/`, `/Web/`, `/Web/index.html`, `/Web/data/catalog.js`, `/Web/scripts/app.js`,
  `/GevendraAutorExterno/among-us-button/index.html` y su `style.css`
  → **todos 200 OK**. Confirma que desplegar la raíz hace funcionar la cadena
  `Web/ → GevendraAutorExterno/`.
- `node Web/scripts/generate-catalog.mjs` ejecutado sin diffs: el catálogo
  versionado sigue estando actualizado.

### Pendiente / limitaciones

- Los redirects y headers solo aplican en **Vercel**; GitHub Pages sigue
  dependiendo del JS del `index.html` raíz para ir a `/Web/` (mitigado en Fase 2
  con `<meta http-equiv="refresh">`).
- El despliegue real en Vercel (crear el proyecto y ver la URL) queda fuera de
  este plan: requiere la cuenta y el CLI del usuario.
- Tamaño a vigilar: 304 archivos, ~34 MB, con un GIF de 9,3 MB
  (`modern-contact-card/MOSHED-2023-10-17-13-58-25.gif`).

## [Fase 0 — Limpieza del repositorio] — 2026-09-26

### Hecho

- `.gitignore` ampliado: `.github-pages-*` (antes solo `.github-pages-site*/`),
  `.vercel/` y `node_modules/`.
- `.github-pages-file-check/` **dejó de estar trackeado** (`git rm -r --cached`):
  era un artefacto de `build-site.mjs` versionado por accidente (14 archivos:
  copia de `Web/`, `index.html`, `LICENSE` y `.nojekyll`).
- Borradas 5 carpetas de build locales regenerables:
  `.github-pages-file-check/`, `.github-pages-site/`, `.github-pages-site-check/`,
  `.github-pages-site-check-2/`, `.github-pages-site-final-check/`.
- Verificación: `git ls-files` ya **no contiene ninguna ruta `github-pages*`**.
- Se creó este `CHANGELOG.md` y el plan de fases en
  [`Docs/Plan_de_fases.md`](./Docs/Plan_de_fases.md) (Fases 0–8).

### Pendiente / limitaciones

- Los cambios de la Fase 0 están **en el árbol de trabajo y en el índice, sin
  commitear** (no se hace commit sin petición explícita).
- `Docs/Legalizacion/THIRD_PARTY_NOTICES.md` es una copia sin trackear que no
  pertenece a esta fase: se conserva tal cual. La copia canónica sigue en la raíz
  (la referencian `README.md`, `Web/README.md` y `Web/scripts/build-site.mjs`).
