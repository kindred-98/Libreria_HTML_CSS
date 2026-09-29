# PROMPT: 80 INDICADORES DE CARGA en `creaciones-primium/indicadores-de-carga/`

Tu lote está **cerrado y asignado**: no eliges slug, ni mecánica, ni universo. Están en el reparto.

## 1. TU ASIGNACIÓN
1. Lee `Docs/Prompt/prompt-para-nuevas-creaciones/reparto-indicadores.json`. El array `lotes` tiene 8
   universos de 10 filas cada uno; las filas del universo que te toca son las tuyas. Cada fila trae:
   - `n`: el slug de la carpeta. No lo cambias.
   - `universo`: una de las 28 líneas del catálogo de abajo.
   - `mecanica`: qué hace el objeto. La respetas al pie de la letra.
   - `paleta`: los 2-3 tonos que te tocan. Ninguna otra pieza usa esa combinación.
   - `densidad`: `compacta` (un solo gesto), `media` (gesto + reflejo o sombra propia),
     `amplia` (gesto + entorno que también se mueve).
   - `firma`: el detalle visual propio de tu pieza. Nadie más lo tiene.
   - `titulo`: el `<title>` en inglés va en mayúsculas/custom, en humano.
2. Crea exactamente esas 10 carpetas en `creaciones-primium/indicadores-de-carga/<n>/` con
   `index.html` + `styles.css` + `script.js` (este último solo si de verdad lo necesitas).
3. Cuando termines, `node Docs/Prompt/prompt-para-nuevas-creaciones/cumplir-reparto.mjs` tiene que
   dar `ok` en las dos categorías. Si da `FALTAN` o `COLISION`, arregla lo tuyo y vuelve a lanzarlo.

## 2. LA REGLA QUE CAMBIA
Aquí ya no hay paneles con lecturas. La pieza es **una escena mínima donde algo físico hace un trabajo
y se nota que trabaja**.

- **Pantalla vacía**: nada de marco, ni barra de título, ni HUD, ni rejilla de fondo, ni placa, ni
  etiquetas decorativas. El fondo es la paleta, con textura o degradado, y ya.
- **Un solo objeto protagonista**: ocupa entre el 70% y el 90% del alto, centrado. Si metes más de
  un elemento protagonista, la pieza pierde.
- **El objeto tiene masa**: inercia donde toque, peso, roce, rebote, tensión de superficie, polvo que
  sale despedido, chispas que caen con su propia curva. Nada de elementos flotando con opacidad plana.
- **El bucle es perfecto**: cada elemento vuelve **exactamente** al punto de partida, con la misma
  fase, y el periodo es un divisor común de todas las piezas del lote. Sin parpadeos, sin reinicios
  visibles, sin cortes en el punto de unión.
- **Texto solo si informa**: porcentaje, fase o unidad en microtipografía discreta (10-11px,
  mayúsculas, tracking amplio). Nada de títulos ni subtítulos. El texto y la forma van juntos: si
  marcas 62%, la forma tiene que representar ese 62%.
- Se ve bien en 1200x800 y en 380x700, sin scroll horizontal y sin nada cortado.

## 3. LOS 8 UNIVERSOS (10 piezas cada uno)
1. **MATERIA** — el material cambiando de estado: calor, frío, presión, magnetismo, fluidez.
2. **ORGANISMO** — un proceso vivo: crecer, dividirse, secretar, contraerse.
3. **OFICIO** — una herramienta trabajando con trabajo humano: golpe, tiro, vuelta, corte.
4. **CIENCIA** — un instrumento de laboratorio midiendo o procesando.
5. **COSMOS** — vehículos y señales en el espacio: encendido, acoplamiento, escucha.
6. **AGUA** — el agua buscando la forma: sube, gira, cae, se rompe.
7. **TIERRA Y CLIMA** — fuerza geológica o atmosférica moviendo terreno y aire.
8. **ABSTRACTO** — una figura matemática o geométrica que se dibuja o se repite.

Dentro de tu universo, tu composición es tuya: nada de repetir bloque, número de piezas ni
comportamiento de tus otras nueve. A tamaño de tarjeta el ojo compara **color y composición**, no la
interacción: eso es lo que hace que diez piezas del mismo universo no parezcan la misma dos veces.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/indicadores-de-carga/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si la pieza lo necesita. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets, sin imágenes.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, nada de `<img>`, nada de `url()` a
  archivo, nada de webfonts (solo pilas del sistema), nada de `fetch` ni módulos ES. Debe verse igual
  abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo. Las dos descripciones describen tu
  mecánica concreta, no la categoría.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`, `background-position`.
  Nunca animes `width`/`height`/`top`/`left` en muchos elementos a la vez. Objetivo 60fps también en
  móvil. Si hay partículas, reutiliza arrays tipados y no los reasignes por frame; o mejor, hazlas con
  elementos y `transform`.
- Obligatorio `@media (prefers-reduced-motion:reduce)`: ahí **sí** tiene sentido parar, y en ese caso
  se muestra un estado final y ordenado (por ejemplo, el objeto terminado y quieto), no un hueco.
- `aria-busy="true"` en el contenedor y un texto accesible con `role="status"`.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de plantilla de loader. Cada pieza tiene: historia de color propia (2-3 tonos armónicos, la
`paleta` del reparto), profundidad real (bisel, brillo especular, sombra de contacto, luz de borde),
un microdetalle real (marcas, escala, numeración, unidades) y un movimiento con carácter físico.
Se nota que **algo está trabajando**, no que algo gira.

## 7. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs indicadores-de-carga <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo sale congelada en el frame 0. Nunca deduzcas
   "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada pieza (2500 ms y 7000 ms) y comprueba que son dos fases claramente
   distintas del bucle, y que el objeto se parece a lo que dice tu `mecanica`.
4. Cada `href`/`src` del `index.html` apunta a un archivo que existe en la misma carpeta.

## 8. AUDITORÍA FINAL
Sobre tus 10: sin errores de sintaxis, sin referencias rotas, sin archivos extra, sin recursos
externos, con `prefers-reduced-motion` en todos, con exactamente una meta `description` y una
`description-es` por archivo, y llaves CSS balanceadas (ignora las que estén dentro de `content:"..."`).

## 9. GIT
Al terminar, si el usuario lo pide: `node Web/scripts/generate-catalog.mjs` y un commit **solo con
las rutas de tu carpeta**, nunca con `git add -A` (hay cambios de otras sesiones en el working tree).

## 10. ENTREGA
Informe con: los 10 slugs, la mecánica de cada uno, su paleta, el periodo del bucle, el estado de la
verificación del banco, y una línea describiendo cómo se nota que el objeto está trabajando.
