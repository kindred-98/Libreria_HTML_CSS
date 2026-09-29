# PROMPT: 80 NAVEGACIONES en `creaciones-primium/navegacion/`

Tu lote está **cerrado y asignado**: no eliges slug, ni patrón, ni universo. Están en el reparto.

## 1. TU ASIGNACIÓN
1. Lee `Docs/Prompt/prompt-para-nuevas-creaciones/reparto-navegacion.json`. El array `lotes` tiene 8
   universos de 10 filas cada uno; las filas del universo que te toca son las tuyas. Cada fila trae:
   - `n`: el slug de la carpeta. No lo cambias.
   - `universo`: una de las 28 líneas del catálogo de abajo.
   - `mecanica`: dónde vive el menú y cómo se comporta. La respetas al pie de la letra.
   - `paleta`: los 2-3 tonos que te tocan. Ninguna otra pieza usa esa combinación.
   - `densidad`: `compacta` (el mecanismo y poco más), `media` (mecanismo + reflejo o detalle),
     `amplia` (mecanismo + escena alrededor).
   - `firma`: el detalle visual propio de tu pieza. Nadie más lo tiene.
   - `titulo`: el `<title>` en inglés va en humano.
2. Crea exactamente esas 10 carpetas en `creaciones-primium/navegacion/<n>/` con `index.html` +
   `styles.css` + `script.js` (este último solo si la navegación necesita JS; muchas se resuelven con
   `:target`, `:checked` o `<details>`, y eso está bien).
3. Cuando termines, `node Docs/Prompt/prompt-para-nuevas-creaciones/cumplir-reparto.mjs` tiene que
   dar `ok` en las dos categorías. Si da `FALTAN` o `COLISION`, arregla lo tuyo y vuelve a lanzarlo.

## 2. LA REGLA QUE CAMBIA
La navegación **diegética**: el menú no es una barra de enlaces encima de la página, es una pieza
del mundo en el que vive la página. Un menú dentro de un mapa es un mapa; dentro de un telar, un telar.

- El mecanismo tiene que **contar la posición**: cuando estás en la sección 3 de 6, el mundo lo
  muestra. No vale un simple resaltado de texto, tiene que haber un cambio en el propio mecanismo.
- El mecanismo **se mueve de verdad** al cambiar de sección: se desplaza, se despliega, gira, se
  tensa, se ilumina. Y con movimiento con easing, no con saltos.
- La sección activa se marca con `aria-current` y **también** con un cambio visual en el mecanismo.
- El menú tiene que ser navegable entera sin rueda del ratón y con `Tab` desde el principio.
- La página se recorre entera: la navegación se prueba bajando a secciones distintas.

## 3. LOS 8 UNIVERSOS (10 piezas cada uno)
1. **MAPA Y RUTA** — el menú es un territorio: líneas, caminos, islas, cauces, constelaciones.
2. **TEJIDO** — el menú es tejido o tela: cortina, celosía, trenza, vitral, mosaico, papel.
3. **ORGANISMO** — el menú es un ser vivo que crece o late: raíces, venas, alas, micelio.
4. **MAQUINA** — el menú es un aparato: consola, teletipo, tubos, clavijas, tambor.
5. **JUEGO** — el menú es un juego de mesa: tablero, cartas, fichas, dados, dominós.
6. **RELATO** — el menú es un libro, un guion, un álbum, un bunch de entradas.
7. **CIUDAD** — el menú es una calle o un edificio: acera, toldos, andén, escaleras, farolas.
8. **ABSTRACTO** — el menú es geometría pura: líneas, órbitas, cadenas, celdas, curvas.

Dentro de tu universo, tu composición es tuya: nada de repetir bloque, número de destinos ni
comportamiento de tus otras nueve.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/navegacion/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si la navegación necesita JS.

Nada más. Sin README, sin package.json, sin carpeta de assets, sin imágenes.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, nada de `<img>`, nada de `url()` a
  archivo, nada de webfonts (solo pilas del sistema), nada de `fetch` ni módulos ES. Debe verse igual
  abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- **La navegación es de verdad**: cada destino es un `<a href="#ancla">` a un `id` que existe en la
  misma página, o un `<button>` que cambia de panel. Nada de `<div>` disfrazado de enlace.
- **Contenido real**: cada sección tiene titular y uno o dos párrafos, con texto de verdad escrito
  para la pieza, suficiente para que la navegación tenga a qué ir. Nada de lorem ipsum, nada de
  "coming soon", nada de relleno.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color` y el `height`/`width` de **un
  solo** indicador. Nunca muchos elementos a la vez. Objetivo 60fps.
- Obligatorio `@media (prefers-reduced-motion:reduce)`: la navegación sigue siendo completamente
  funcional, pero sin movimiento.
- **Accesibilidad, es lo más importante de esta pieza**: cada elemento navegable es `<a>` o
  `<button>`, con foco visible en todo momento, orden de tabulación lógico, `aria-current` en la
  sección activa, `aria-expanded` en lo que despliega, roles donde toque, y cierre con `Escape`.
- Responsive: se ve bien a 1200x800 y a 380x700. En móvil el menú se adapta de verdad, no se
  superpone ni se corta. Sin scroll horizontal.
- Sin emojis, sin comentarios en el código.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de lista de enlaces azulada. Cada navegación tiene: historia de color propia, profundidad real
(sombra, vidrio, luz de borde), microdetalle (marcas, contadores, numeración) y movimiento con
easing. El indicador de sección activa se desplaza con suavidad, no salta. Y el mecanismo tiene que
contar la historia de su mundo, no limitarse a esconder y mostrar.

## 7. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs navegacion <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo sale congelada en el frame 0. Nunca deduzcas
   "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada navegación (2500 ms y 7000 ms) y comprueba que el texto de las
   secciones no se corta ni se solapa en 380x700.
4. Cada `href`/`src` del `index.html` apunta a un archivo que existe en la misma carpeta, y cada
   `href="#ancla"` a un `id` que existe en la misma página.

## 8. AUDITORÍA FINAL
Sobre tus 10: sin errores de sintaxis, sin referencias rotas (incluidas las anclas internas), sin
archivos extra, sin recursos externos, con `prefers-reduced-motion` en todos, con exactamente una
meta `description` y una `description-es` por archivo, y llaves CSS balanceadas (ignora las que
estén dentro de `content:"..."`).

## 9. GIT
Al terminar, si el usuario lo pide: `node Web/scripts/generate-catalog.mjs` y un commit **solo con
las rutas de tu carpeta**, nunca con `git add -A` (hay cambios de otras sesiones en el working tree).

## 10. ENTREGA
Informe con: los 10 slugs, el patrón de cada uno, su paleta, el estado de la verificación del banco y
una línea describiendo cómo se comporta con teclado.
