# Aviso sobre código y recursos de terceros

## Estado de distribución

La `LICENSE` de la raíz se aplica al código original de la aplicación y a la documentación creados para este repositorio por `kindred-98`, **y también a los demos originales de `CreacionesNuevas/`**, cada uno de los cuales incluye además su propio archivo `LICENSE`. No concede derechos sobre los demos de `creaciones-primium/`: esa colección lleva su **propio archivo `LICENSE` (MIT)** en la raíz, que nombra a sus dos autoras y es el que se inyecta en cada ZIP. Tampoco concede derechos sobre los demos de `GevendraAutorExterno/`, que son de un tercero y **no se publican**: ver *Material retirado*. Tampoco concede derechos sobre recursos de terceros.

## Las colecciones

| Carpeta | Componentes | Autoría | Licencia | ZIP |
|---|---:|---|---|---|
| `CreacionesNuevas/` | **248** | `kindred-98`, creations originales | MIT (archivo `LICENSE` en cada carpeta) | **Habilitado** |
| `DavokerDiseñador/` | **119** | `davoker`, efectos de texto CSS | MIT (archivo `DavokerDiseñador/LICENSE`, de su repositorio) | **Habilitado** |
| `creaciones-primium/` | **518** | `kindred-98` y `fatmaerm` (`indicadores-de-carga/`, `navegacion/`) | MIT (archivo `creaciones-primium/LICENSE`) | **Habilitado** |
| **Total** | **885** | | | 885 de 885 |

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

## Material retirado: `GevendraAutorExterno/` (116 demos)

La carpeta sigue en el repositorio, pero **quedó fuera del catálogo, del sitio y de las descargas el 2026-09-30**. Este apartado queda como constancia de qué era, de dónde venía y por qué no se publica.

**Qué era.** 116 páginas de demo (114 carpetas; `cursors/` aporta tres componentes anidados) que procederían del repositorio público [`gevendra2004/gevstack`](https://github.com/gevendra2004/gevstack) («All Gevstack projects», autor Gevendra Sahu). La atribución se obtuvo comparando el árbol de carpetas local con el del repositorio: **106** coinciden de forma exacta con el nombre de la carpeta de origen y **8** difieren por erratas del propio repositorio (`color-chainging-navigation`, `Order-confirm-anmation`, `Shoping-cart-preloader`, `Sportlight-Text-Animation`, `Tic-tak-toe`, `Trick-&-treat-toggle`, `webgel-liquid-masking`, `Facebook-emoji-reactor`). Un demo, `facebook-emoji-reactions`, coincide además con el proyecto público [facebook-reactions-css](https://github.com/deividmarques/facebook-reactions-css) de Deivid Marques, que tampoco mostraba archivo de licencia.

**Por qué no se publica.** Comprobado el 26-09-2026 y revisado de nuevo el 30-09-2026 sobre ese repositorio: `LICENSE` → **HTTP 404**, la API de GitHub responde `"license": null` y el `README.md` solo dice `All Gevstack projects`, sin términos de uso ni permiso de redistribución. El mismo autor **sí** adjunta licencia MIT en otros proyectos suyos (`login-form`, `image-slider`, `simple-toggle-switch`, `to-do-app`, `minimal-Portfolio-design`, `study-partner`…), lo que confirma que su ausencia en `gevstack` es deliberada. Un repositorio público no equivale a código con licencia: sin declaración expresa el código sigue bajo **copyright** y «todos los derechos reservados». Se le escribió por varios canales pidiendo **autorización escrita** y no hubo respuesta.

**Qué se hizo.** Publicar su código, con o sin botón de descarga, ya es copiarlo y comunicarlo al público, así que la opción correcta era no alojarlo:

- Se quitó la carpeta de `libraryRoots` en `Web/scripts/generate-catalog.mjs`, así que sus 116 demos ya no entran en el catálogo, ni en la rejilla, ni en el filtro de autores, ni en los ZIP.
- Se borraron sus 116 entradas de `Web/data/component-overrides.json`.
- Se borró el `LICENSE` MIT que esta carpeta había llegado a llevar: era este proyecto otorgando licencia sobre obra ajena.
- Se borró de `Web/styles/site.css` el bloque `.filter-button--underglow`, que era CSS copiado de su demo `animated-gradient-underglow`.
- `vercel.json` redirige `/GevendraAutorExterno` y `/GevendraAutorExterno/...` para que su contenido no se sirva aunque la carpeta siga en el repositorio, y le añade `X-Robots-Tag: noindex, nofollow`.
- De la web desaparecieron su tarjeta en el roster, su nodo en el diagrama y su botón de autor. **Única mención que queda**: el párrafo de *cómo nació* lo cita con un enlace a su repositorio, porque es de donde llegó la idea.

**Lo que sí se permite** (con su material, y con cualquier obra sin licencia): ver un demo en el navegador, navegar por el sitio y copiar el código para **estudio personal**. Lo que no está autorizado es la redistribución: republicar el ZIP, formar parte de un artefacto público o de otro producto, o cambiar la autoría.

**Para volver a publicarlo** hace falta una de estas dos cosas: su **autorización escrita**, o que añada una licencia a su repositorio. Nada de lo que este repositorio declare por su cuenta sustituye a lo anterior.

## Consecuencias asumidas en el proyecto

- El botón **ZIP está habilitado en los 885 componentes**: los 248 de `CreacionesNuevas/`, los 119 de `DavokerDiseñador/` y los 518 de `creaciones-primium/`. Ninguno queda sin redistribución.
- El sitio se despliega en **Vercel sirviendo la raíz del repositorio**, que muestra los 885 componentes y evita que las previews den 404. `vercel.json` bloquea `/GevendraAutorExterno/...` con una redirección permanente, de modo que el material retirado no se sirve aunque la carpeta siga en el repositorio. No existe un artefacto de publicación alternativo: el constructor que filtraba por licencias se eliminó junto con el despliegue en GitHub Pages, para que solo haya una copia del sitio y no se puedan publicar por error los componentes sin permiso de redistribución.
- La atribución de origen se muestra en el detalle de cada componente («Source: …»), tanto si está verificado como si no.

## Autorizar un componente

1. Identifica al autor original y la fuente del código y de cada recurso incluido.
2. Confirma que la licencia o el permiso **por escrito** permite redistribuirlo en este sitio y mediante descargas ZIP.
3. Guarda la licencia completa y los avisos de atribución requeridos dentro de la carpeta del componente.
4. Añade la fuente verificada, el identificador de licencia, la ruta relativa `licenseFile` y `redistributable: true` en `Web/data/component-overrides.json`.
5. Regenera el catálogo y confirma que `downloadable` sea `true` para ese componente.

El `LICENSE` MIT que `GevendraAutorExterno/` llevó entre el 29 y el 30 de septiembre de 2026 se ha borrado: este proyecto no puede conceder licencia sobre material de terceros. Sigue pendiente su autorización **por escrito** (o que añada una licencia a su repositorio) para volver a catalogarlo; mientras tanto, ver *Material retirado*.

El constructor de despliegue publica solo los componentes que cumplen estas condiciones. No marques un componente como autorizado solo porque esté en este repositorio o porque exista la MIT en la raíz. Este documento es un inventario técnico, no asesoramiento legal.
