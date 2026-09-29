# Aviso sobre código y recursos de terceros

## Estado de distribución

La `LICENSE` de la raíz se aplica al código original de la aplicación y a la documentación creados para este repositorio por `kindred-98`, **y también a los demos originales de `CreacionesNuevas/`**, cada uno de los cuales incluye además su propio archivo `LICENSE`. No concede derechos sobre los demos de terceros de `GevendraAutorExterno/` ni sobre recursos de terceros.

## Las colecciones

| Carpeta | Componentes | Autoría | Licencia | ZIP |
|---|---:|---|---|---|
| `CreacionesNuevas/` | **248** | `kindred-98`, creations originales | MIT (archivo `LICENSE` en cada carpeta) | **Habilitado** |
| `DavokerDiseñador/` | **119** | `davoker`, efectos de texto CSS | MIT (archivo `DavokerDiseñador/LICENSE`, de su repositorio) | **Habilitado** |
| `GevendraAutorExterno/` | **116** | Gevendra Sahu (`gevendra2004`) | **Ninguna declarada** | Deshabilitado |
| **Total** | **483** | | | 367 de 483 |

## Estado de distribución

Los 248 componentes de `CreacionesNuevas/` están autorizados: el catálogo los marca con `license: "MIT"`, `redistributable: true`, `licenseFile: "LICENSE"` y `source` apuntando a este repositorio. Sus descargas ZIP incluyen el `LICENSE` del componente y un `ATTRIBUTION.txt` generado en el momento de la descarga.

Los 119 efectos de `DavokerDiseñador/` proceden de `https://github.com/davoker/efectos_css_para_html`, de un miembro del equipo y con licencia **MIT** declarada en su `LICENSE`. Ese archivo vive en la raíz de la carpeta y el generador lo añade a cada ZIP, así que `license: "MIT"`, `licenseFile: "LICENSE"` y `source` salen verificados y la descarga está habilitada. `transicion.html`, `transicion.css` y la portada `davoker.html` (renombrada para no chocar con el `index.html` de la web) son piezas del mismo repositorio: la portada no es un componente del catálogo, se abre dentro de la rejilla al elegir a **davoker** en el filtro de autores.

Sobre los 116 componentes de `GevendraAutorExterno/`, ver la investigación completa que sigue.

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

El campo `source` de las 116 entradas de `Web/data/component-overrides.json` apunta ahora a ese repositorio. `license` sigue como `Unverified` en las 116, y **ningún** demo tiene `redistributable: true`.

### Por qué no se puede redistribuir

Comprobado el 26-09-2026 sobre `https://github.com/gevendra2004/gevstack`:

- `LICENSE` → **HTTP 404**. No existe archivo de licencia en la rama `main`.
- La API de GitHub responde `"license": null` para el repositorio.
- El `README.md` solo dice `All Gevstack projects`: **no hay** términos de uso, licencia ni permiso de redistribución.
- No se ha localizado ningún aviso de licencia equivalente en el sitio público del autor.

Un repositorio público no equivale a código con licencia. Sin declaración expresa, el código sigue bajo **copyright** y «todos los derechos reservados»: verlo no concede permiso para republicarlo, modificarlo ni ofrecerlo en descargas ZIP. El repositorio de origen declara licencia MIT en **otros** proyectos del mismo autor (`login-form`, `image-slider`, `simple-toggle-switch`, `to-do-app`, `mini-profile-card-2`, `analog-and-digital-clock`, `minimal-Portfolio-design`, `retro-style-landing-page`, `study-partner`), lo que confirma que el autor sí adjunta licencia cuando quiere concederla: **su ausencia en `gevstack` es deliberada**.

El ejemplo de reacciones de Facebook contiene además código y recursos que coinciden con el proyecto público [facebook-reactions-css](https://github.com/deividmarques/facebook-reactions-css), de Deivid Marques, que tampoco mostraba archivo de licencia en la página revisada el 26-09-2026.

### Lo que sí se permite

Ver un demo en el navegador, navegar por el sitio y copiar el código para **estudio personal** no exigen licencia. Lo que no está autorizado es la redistribución: republicar el ZIP, formar parte de un artefacto público o de otro producto, o cambiar la autoría.

Los archivos locales, como `Movie-Card-UI/pngwing.png`, y las imágenes, fuentes, iconos o bibliotecas remotas (Google Fonts, Remix Icon, Ionicons, GSAP, Bootstrap CDN, fotos de `samrithasudhagar.github.io`, `araltasher/misc`, Pinterest, Pexels, Unsplash) pueden tener condiciones propias y **no se han auditado de forma individual**. Corregir un enlace roto o reemplazar una referencia remota no concede permiso sobre el resto del componente.

## Consecuencias asumidas en el proyecto

- El botón **ZIP está deshabilitado en los 116 componentes de terceros** y **habilitado en los 248 propios**. No es un bug pendiente: es el estado correcto según los derechos de cada grupo.
- El sitio se despliega en **Vercel sirviendo la raíz del repositorio**, que muestra los 396 componentes y evita que las previews de `GevendraAutorExterno/` den 404. No existe un artefacto de publicación alternativo: el constructor que filtraba por licencias se eliminó junto con el despliegue en GitHub Pages, para que solo haya una copia del sitio y no se puedan publicar por error los componentes sin permiso de redistribución.
- La atribución de origen se muestra en el detalle de cada componente («Source: …»), tanto si está verificado como si no.

## Autorizar un componente

1. Identifica al autor original y la fuente del código y de cada recurso incluido.
2. Confirma que la licencia o el permiso **por escrito** permite redistribuirlo en este sitio y mediante descargas ZIP.
3. Guarda la licencia completa y los avisos de atribución requeridos dentro de la carpeta del componente.
4. Añade la fuente verificada, el identificador de licencia, la ruta relativa `licenseFile` y `redistributable: true` en `Web/data/component-overrides.json`.
5. Regenera el catálogo y confirma que `downloadable` sea `true` para ese componente.

En la práctica, con el autor identificado, el camino más corto es **pedirle a Gevendra Sahu una autorización escrita** (o que añada una licencia al repositorio) y anotarla aquí.

El constructor de despliegue publica solo los componentes que cumplen estas condiciones. No marques un componente como autorizado solo porque esté en este repositorio o porque exista la MIT en la raíz. Este documento es un inventario técnico, no asesoramiento legal.
