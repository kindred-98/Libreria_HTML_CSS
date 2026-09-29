# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

**Documentación relacionada**: [README](./README.md) · plan de fases ([`Docs/Opencode/Plan.md`](./Docs/Opencode/Plan.md)) · [Web/README.md](./Web/README.md) · [THIRD_PARTY_NOTICES.md](./Docs/Legalizacion/THIRD_PARTY_NOTICES.md).

Cada fase terminada se registra aquí con su fecha. Las fases están definidas en
[`Docs/Opencode/Plan.md`](./Docs/Opencode/Plan.md).

## [Retirada de los 116 demos de gevendra2004] — 2026-09-30

Sus demos de `GevendraAutorExterno/` **no se publican**: su repositorio de origen,
`gevendra2004/gevstack`, no declara licencia y el autor no respondió a los
contactos para pedirle permiso. Publicar su código, con o sin botón de descarga,
ya es redistribuirlo, así que la carpeta sale del catálogo y del sitio. **Queda en
el repositorio** para poder consultarla en local.

- `generate-catalog.mjs`: `GevendraAutorExterno` deja de ser raíz del catálogo
  (1001 → **885** componentes, los 885 descargables).
- `component-overrides.json`: fuera sus 116 entradas.
- **Borrado** `GevendraAutorExterno/LICENSE`: el MIT que esta carpeta llevaba
  desde el 29-09 era de este proyecto sobre obra ajena.
- `site.css`: fuera el bloque `.filter-button--underglow`, que era CSS copiado
  de su demo `animated-gradient-underglow`.
- `vercel.json`: `redirect` permanente de `/GevendraAutorExterno/:path*` a `/Web/`
  más `X-Robots-Tag: noindex, nofollow`, para que su contenido no se sirva aunque
  la carpeta siga en el repositorio.
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

Continuidad de la [segunda auditoría](./Docs/auditoria/segunda-auditoria.md). Resuelve
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

Trabajo posterior a la [primera auditoría](./Docs/auditoria/primera-auditoria.md), que
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
- `Docs/Opencode/Plan.md`: **Fase 9** añadida y el pendiente que la bloqueaba
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
  [`Docs/Opencode/Plan.md`](./Docs/Opencode/Plan.md) (Fases 0–8).

### Pendiente / limitaciones

- Los cambios de la Fase 0 están **en el árbol de trabajo y en el índice, sin
  commitear** (no se hace commit sin petición explícita).
- `Docs/Legalizacion/THIRD_PARTY_NOTICES.md` es una copia sin trackear que no
  pertenece a esta fase: se conserva tal cual. La copia canónica sigue en la raíz
  (la referencian `README.md`, `Web/README.md` y `Web/scripts/build-site.mjs`).
