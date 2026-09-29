# Aviso sobre código y recursos de terceros

## Estado de distribución

La `LICENSE` de la raíz se aplica al código original de la aplicación y a la documentación creados para este repositorio por `kindred-98`, **y también a los demos originales de `CreacionesNuevas/`**, cada uno de los cuales incluye además su propio archivo `LICENSE`. No concede derechos sobre los demos de `GevendraAutorExterno/` ni sobre los de `creaciones-primium/`: esos dos grupos llevan su **propio archivo `LICENSE` (MIT)** en la carpeta de la colección, que es el que se inyecta en cada ZIP. Tampoco concede derechos sobre recursos de terceros.

## Las colecciones

| Carpeta | Componentes | Autoría | Licencia | ZIP |
|---|---:|---|---|---|
| `CreacionesNuevas/` | **248** | `kindred-98`, creations originales | MIT (archivo `LICENSE` en cada carpeta) | **Habilitado** |
| `DavokerDiseñador/` | **119** | `davoker`, efectos de texto CSS | MIT (archivo `DavokerDiseñador/LICENSE`, de su repositorio) | **Habilitado** |
| `GevendraAutorExterno/` | **116** | Gevendra Sahu (`gevendra2004`) | MIT (archivo `GevendraAutorExterno/LICENSE`) | **Habilitado** |
| `creaciones-primium/` | **518** | `kindred-98` y `fatmaerm` (`indicadores-de-carga/`, `navegacion/`) | MIT (archivo `creaciones-primium/LICENSE`) | **Habilitado** |
| **Total** | **1001** | | | 1001 de 1001 |

## Fotografías de las galerías (Wikimedia Commons)

Las **86 carpetas de `creaciones-primium/galerias/`** (676 fotografías en total) cargan sus fotos desde `upload.wikimedia.org`. Son **recursos de terceros**: la MIT del `LICENSE` de `creaciones-primium/` cubre el código de esos demos y **no** cubre las imágenes, como ya advierte su propia letra. Quienes retratan cada foto conservan sus derechos.

**Cómo se acredita.** Cada galería lleva la atribución dentro de la propia página, en dos formas:

- 78 galerías la imprimen en el HTML, en un pie o bloque de créditos dentro de la página (clases `credits`, `colophon`, `foot__list`, `page__credit`, etcétera): autor por autor y licencia por licencia.
- Las 8 restantes (`bloom-finder`, `bridge-overlay`, `cathedral-board`, `fogwood-filter`, `lake-phone`, `nebula-preview`, `neoncity-film`, `stadium-grid`) guardan los mismos datos en su `script.js` y los pintan al abrir la ficha.

Ambas formas citan el nombre del autor **y** la licencia de cada archivo, más un enlace a la colección de origen en `commons.wikimedia.org`.

**Licencias encontradas** (recuento sobre las 86 galerías, HTML y JS):

| Licencia | Menciones | Texto oficial |
|---|---:|---|
| CC BY-SA 3.0 | 366 | <https://creativecommons.org/licenses/by-sa/3.0/> |
| CC BY-SA 4.0 | 348 | <https://creativecommons.org/licenses/by-sa/4.0/> |
| Public domain | 242 | Dominio público: sin condiciones de atribución |
| CC BY 2.0 | 119 | <https://creativecommons.org/licenses/by/2.0/> |
| CC0 | 113 | <https://creativecommons.org/publicdomain/zero/1.0/> |
| CC BY-SA 2.0 | 109 | <https://creativecommons.org/licenses/by-sa/2.0/> |
| CC BY 4.0 | 40 | <https://creativecommons.org/licenses/by/4.0/> |
| CC BY-SA 2.5 | 39 | <https://creativecommons.org/licenses/by-sa/2.5/> |
| CC BY 3.0 | 37 | <https://creativecommons.org/licenses/by/3.0/> |
| CC BY 2.5 | 21 | <https://creativecommons.org/licenses/by/2.5/> |
| CC BY / CC BY-SA (sin versión) | 49 | Ver la versión de cada archivo en su ficha de Commons |
| GFDL 1.2 | 14 | <https://www.gnu.org/licenses/old-licenses/fdl-1.2.html> |

Los textos de arriba son los que rigen el uso de cada foto; este documento los enlaza porque los créditos dentro de los demos citan la licencia por su nombre pero no enlazan al texto.

**Qué sí y qué no se redistribuye.** Las galerías **no llevan las fotos dentro de su ZIP**: las 86 carpetas contienen solo `index.html`, `script.js` y `styles.css`. Las imágenes se piden a Wikimedia en el momento de verlas, así que la descarga se lleva el código que las referencia y nada más. Al no distribuir copias de las fotos, las condiciones de las licencias CC se cumplen con la atribución que cada página muestra.

**Enlaces en las galerías.** Todas apuntan a `commons.wikimedia.org` para ver la colección de origen y a `upload.wikimedia.org` para servir la imagen. Servir la foto desde Wikimedia es carga remota (*hotlink*): quien la ve la recibe de los servidores de Wikimedia, no de este repositorio, y no se guarda copia en el sitio ni en los ZIP.

## Estado de distribución

Los 248 componentes de `CreacionesNuevas/` están autorizados: el catálogo los marca con `license: "MIT"`, `redistributable: true`, `licenseFile: "LICENSE"` y `source` apuntando a este repositorio. Sus descargas ZIP incluyen el `LICENSE` del componente y un `ATTRIBUTION.txt` generado en el momento de la descarga.

Los 119 efectos de `DavokerDiseñador/` proceden de `https://github.com/davoker/efectos_css_para_html`, de un miembro del equipo y con licencia **MIT** declarada en su `LICENSE`. Ese archivo vive en la raíz de la carpeta y el generador lo añade a cada ZIP, así que `license: "MIT"`, `licenseFile: "LICENSE"` y `source` salen verificados y la descarga está habilitada. `transicion.html`, `transicion.css` y la portada `davoker.html` (renombrada para no chocar con el `index.html` de la web) son piezas del mismo repositorio: la portada no es un componente del catálogo, se abre dentro de la rejilla al elegir a **davoker** en el filtro de autores.

Los 518 componentes de `creaciones-primium/` se crearon para este repositorio: 160 de `fatmaerm` (las carpetas `indicadores-de-carga/` y `navegacion/`) y 358 de `kindred-98`. Todos comparten el **MIT** del `LICENSE` de la raíz de la colección, que nombra a las dos autoras, y el generador lo inyecta en cada ZIP, así que `license: "MIT"`, `licenseFile: "LICENSE"`, `source` y `redistributable: true` salen verificados en los 518.

Sobre los 116 componentes de `GevendraAutorExterno/`, ver la investigación completa que sigue: su repositorio de origen sigue sin declarar licencia, y desde 2026-09-29 la distribución se ampara en el `LICENSE` MIT que lleva la propia carpeta.

## Resultado de la investigación de procedencia (2026-09-26)

Se investigó el origen de las **116 páginas de demo** (114 carpetas; `cursors/` aporta tres componentes anidados).

| Origen | Componentes | Licencia | Veredicto |
|---|---:|---|---|
| `github.com/gevendra2004/gevstack` | **116 / 116** | **Ninguna declarada** | No autorizable |
| `github.com/deividmarques/facebook-reactions-css` | 0 (recurso embebido en `facebook-emoji-reactions`) | Sin archivo de licencia | No autorizable |

**Todos y cada uno de los 116 demos proceden del mismo repositorio público**, `https://github.com/gevendra2004/gevstack` («All Gevstack projects», autor Gevendra Sahu, 659 estrellas). La atribución se obtuvo comparando el árbol de carpetas local con el del repositorio:

- **106** coinciden de forma exacta con el nombre de la carpeta de origen.
- **8** difieren por erratas en el repositorio de origen, y se han identificado por correspondencia:
  `color-changing-navigation` ← `color-chainging-navigation`,
  `order-confirm-animation` ← `Order-confirm-anmation`,
  `shopping-cart-preloader` ← `Shoping-cart-preloader`,
  `spotlight-text-animation` ← `Sportlight-Text-Animation`,
  `tic-tac-toe` ← `Tic-tak-toe`,
  `trick-and-treat-toggle` ← `Trick-&-treat-toggle`,
  `webgl-liquid-masking` ← `webgel-liquid-masking`,
  `facebook-emoji-reactions` ← `Facebook-emoji-reactor`.

El campo `source` de las 116 entradas de `Web/data/component-overrides.json` apunta ahora a ese repositorio. La licencia (`license: "MIT"`) y `redistributable: true` no vienen de la fuente, sino del `LICENSE` que lleva la propia carpeta desde el 29-09-2026.

### Por qué el repositorio de origen no autoriza nada

Comprobado el 26-09-2026 sobre `https://github.com/gevendra2004/gevstack`:

- `LICENSE` → **HTTP 404**. No existe archivo de licencia en la rama `main`.
- La API de GitHub responde `"license": null` para el repositorio.
- El `README.md` solo dice `All Gevstack projects`: **no hay** términos de uso, licencia ni permiso de redistribución.
- No se ha localizado ningún aviso de licencia equivalente en el sitio público del autor.

Un repositorio público no equivale a código con licencia. Sin declaración expresa, el código sigue bajo **copyright** y «todos los derechos reservados»: verlo no concede permiso para republicarlo, modificarlo ni ofrecerlo en descargas ZIP. El repositorio de origen declara licencia MIT en **otros** proyectos del mismo autor (`login-form`, `image-slider`, `simple-toggle-switch`, `to-do-app`, `mini-profile-card-2`, `analog-and-digital-clock`, `minimal-Portfolio-design`, `retro-style-landing-page`, `study-partner`), lo que confirma que el autor sí adjunta licencia cuando quiere concederla: **su ausencia en `gevstack` es deliberada**.

El ejemplo de reacciones de Facebook contiene además código y recursos que coinciden con el proyecto público [facebook-reactions-css](https://github.com/deividmarques/facebook-reactions-css), de Deivid Marques, que tampoco mostraba archivo de licencia en la página revisada el 26-09-2026.

**Estado actual**: desde el 29-09-2026 la distribución de estos 116 demos en este repositorio se ampara en el `LICENSE` MIT que lleva `GevendraAutorExterno/`, con `license: "MIT"`, `licenseFile: "LICENSE"` y `redistributable: true` en el catálogo. La investigación de arriba sigue en pie porque es la fuente la que no declara nada; ver *Autorizar un componente*.

### Lo que sí se permite

Ver un demo en el navegador, navegar por el sitio y copiar el código para **estudio personal** no exigen licencia. Lo que no está autorizado es la redistribución: republicar el ZIP, formar parte de un artefacto público o de otro producto, o cambiar la autoría.

Los archivos locales, como `Movie-Card-UI/pngwing.png`, y las imágenes, fuentes, iconos o bibliotecas remotas (Google Fonts, Remix Icon, Ionicons, GSAP, Bootstrap CDN, fotos de `samrithasudhagar.github.io`, `araltasher/misc`, Pinterest, Pexels, Unsplash) pueden tener condiciones propias y **no se han auditado de forma individual**. Corregir un enlace roto o reemplazar una referencia remota no concede permiso sobre el resto del componente.

## Consecuencias asumidas en el proyecto

- El botón **ZIP está habilitado en los 1001 componentes**: los 248 de `CreacionesNuevas/`, los 119 de `DavokerDiseñador/`, los 116 de `GevendraAutorExterno/` y los 518 de `creaciones-primium/`. Ninguno queda sin redistribución.
- El sitio se despliega en **Vercel sirviendo la raíz del repositorio**, que muestra los 396 componentes y evita que las previews de `GevendraAutorExterno/` den 404. No existe un artefacto de publicación alternativo: el constructor que filtraba por licencias se eliminó junto con el despliegue en GitHub Pages, para que solo haya una copia del sitio y no se puedan publicar por error los componentes sin permiso de redistribución.
- La atribución de origen se muestra en el detalle de cada componente («Source: …»), tanto si está verificado como si no.

## Autorizar un componente

1. Identifica al autor original y la fuente del código y de cada recurso incluido.
2. Confirma que la licencia o el permiso **por escrito** permite redistribuirlo en este sitio y mediante descargas ZIP.
3. Guarda la licencia completa y los avisos de atribución requeridos dentro de la carpeta del componente.
4. Añade la fuente verificada, el identificador de licencia, la ruta relativa `licenseFile` y `redistributable: true` en `Web/data/component-overrides.json`.
5. Regenera el catálogo y confirma que `downloadable` sea `true` para ese componente.

Sigue pendiente conseguir la autorización **por escrito** de Gevendra Sahu (o que añada una licencia a su repositorio): el `LICENSE` MIT de `GevendraAutorExterno/` recoge el estado de distribución actual, pero la fuente no declara licencia.

El constructor de despliegue publica solo los componentes que cumplen estas condiciones. No marques un componente como autorizado solo porque esté en este repositorio o porque exista la MIT en la raíz. Este documento es un inventario técnico, no asesoramiento legal.
