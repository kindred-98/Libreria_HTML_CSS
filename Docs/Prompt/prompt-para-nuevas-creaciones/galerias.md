# PROMPT: 86 GALERÍAS en `creaciones-primium/galerias/`

Crea componentes hasta que esta carpeta tenga **86 galerías**. Si ya hay N, crea 86 - N.

Las imágenes se sirven **por URL externa**, como en el componente de referencia
`GevendraAutorExterno/rounded-image-gallery` (que usa `<img src="https://images.pexels.com/...">`).

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/galerias/`, en el resto de carpetas de
   `creaciones-primium/` y en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. **NO inventes URLs de imagen.** Usa el manifiesto ya recopilado y verificado:
   `Docs/Prompt/prompt-para-nuevas-creaciones/imagenes-galerias.json`
   Tiene 40 temas y 12 imágenes por tema. Estructura:

   ```json
   { "temas": { "montana": [ { "u": "https://upload.wikimedia.org/...", "w": 960,
                              "t": "titulo", "a": "autor", "l": "licencia" } ] } }
   ```

   Toma **un solo tema por galería** y usa de 7 a 10 imágenes de ese tema. Copia la URL tal cual.
3. Así se asigna cada pieza para que no haya repeticiones: en tu tarea te llegue el tema y la
   dirección de arte de cada slug. No los cambies por tu cuenta.
4. Para re-generar el manifiesto: `node Docs/Prompt/prompt-para-nuevas-creaciones/recopilar-imagenes.mjs`

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** Prohibido el patrón "título + rejilla de fotos centrado en gris".

El sitio web muestra cada componente dentro de un **iframe real**, así que lo que el visitante ve
es literalmente el interior de tu carpeta. Por eso:

1. **Familia** (una de las 28 de abajo): define el comportamiento y la estructura.
2. **Escena propia dentro de la familia**: dentro de tu familia, inventas una composición
   distinta. Dos piezas de la misma familia **no pueden** compartir composición: ni el mismo
   número de bloques, ni la misma jerarquía, ni el mismo comportamiento al interactuar.
3. **Firma visual propia**: cada pieza tiene su familia de paleta, su técnica de fondo, su
   densidad y su tratamiento tipográfico, distintos de los de las demás. A tamaño de tarjeta,
   el ojo compara color y composición, no la interacción: eso es lo que te hace ver 86 piezas
   distintas y no una fotocopia.

La **coherencia** no vive en el layout, vive en la casa de estilo: misma tipografía, mismo ritmo
de espaciado, mismo trato del HUD, misma calidad de movimiento, y siempre una galería real y
navegable con teclado.

## 3. CATÁLOGO DE FAMILIAS (28). Se reparten entre las 86 piezas
**Rejilla y flujo**
1. REJILLA — mosaico que se reorganiza al filtrar
2. FILTRADO — la barra de filtros manda y el contenido se recoloca
3. LISTA + PREVIA — columna de miniaturas con vista grande al lado
4. ENCIMA — una grande con miniaturas superpuestas
5. MURAL ANCHO — a sangre completa, secciones al hacer scroll

**Desplazamiento**
6. CARRUSEL — un panel deslizante con flechas, puntos y arrastre
7. DIAPOSITIVAS — una imagen cada vez, con transición de página
8. TIRA — franja horizontal con anclas laterales
9. MARQUESA — cinta infinita que se pausa al pasar el cursor
10. PANORÁMICA — vistas con paralaje al hacer scroll

**Volumen 3D**
11. CUBO 3D — una imagen por cara de un cubo
12. ESFERA — imágenes sobre una esfera que gira
13. CUBO DE ESPEJOS — pila en perspectiva con la central al frente
14. APILADO — abanico de tarjetas que se despliegan
15. VISTA EXPLOTADA — capas separadas en profundidad

**Recorrido guiado**
16. LIBRO — pasar de página
17. LÍNEA DE TIEMPO — cronología vertical con fecha
18. MAPA — zonas sensibles sobre un plano
19. DIAGRAMA — imágenes unidas por líneas
20. ÁLBUM DESPLEGABLE — crece a pantalla completa

**Escena y contexto**
21. VITRINA — vitrina de museo con foco y placa
22. ESCENOGRÁFICO — escenario con iluminación
23. MESA DE LUZ — mesa de estudio con atrezo
24. HUD — telemetría y retículo alrededor
25. EN UN MÓVIL — dentro del marco de un teléfono
26. CINTA DE PELÍCULA — filmstrip con espirales
27. TABLERO — matriz de miniaturas con estados
28. BUSCADOR DE COLECCIÓN — buscar primero, navegar después

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/galerias/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si la galería necesita JS. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets: **las imágenes no se descargan**,
van por URL.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. Sin **ninguna otra** petición externa: ni CDN, ni webfonts, ni `fetch`, ni
  módulos ES. La **única** excepción son los `<img>` del manifiesto.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- **Etiquetas de imagen**: `<img src="..." alt="título real de la foto" loading="lazy" decoding="async">`.
  El `alt` describe la foto, no dice "imagen de galería".
- **Degradación elegante**: cada `<img>` va sobre un fondo generado con CSS (degradado de la
  paleta propia + `aspect-ratio`). Si una URL falla, se ve una pieza худamente compuesta en
  lugar de un icono roto. Nada de alt vacío.
- **Créditos**: el manifiesto trae autor y licencia, y muchas imágenes son CC BY o CC BY-SA, que
  **exigen atribución**. Añade un pie o una línea de créditos discreta con los autores y la
  licencia, o el nombre del tema y un enlace a la ficha de Commons.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`. Nunca `width`/`height`/`top`/`left`
  en muchos elementos a la vez. Objetivo 60fps.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje la galería estática y navegable.
- Accesible: navegación con teclado (flechas, `Home`/`End`, `Escape` para cerrar el visor), foco
  visible, y el visor es un diálogo con `role="dialog"` y `aria-modal`.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Cada pieza tiene: historia de color propia, profundidad real (sombra de contacto, luz de borde,
reflejo), microdetalle (números, nombres, marcos, marcas de página) y transiciones con calidad:
nada de saltos ni parpadeo. Y las fotos deben ir **recortadas con intención** (`object-fit`,
`object-position`), no estiradas ni recortadas por el centro a la fuerza.

## 7. VERIFICACIÓN (obligatoria)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs galerias <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4 `requestAnimationFrame`,
   así que una captura a pelo sale congelada en el frame 0. No deduzcas "está roto" de una imagen.
3. Mira las dos capturas (2500 ms y 7000 ms) con la herramienta de lectura.
4. **Comprueba que las imágenes cargan**: en las capturas se ven fotos, no huecos. Si sale un hueco,
   cambia esa URL por otra del mismo tema del manifiesto. Ojo: desde esta máquina Wikimedia
   limita mucho las peticiones y puede dar 429 en las capturas aunque la URL esté perfecta; si
   ves un hueco, reintenta la captura antes de cambiar la URL.
5. Cada `href`/`src` apunta a algo real: los `href="#ancla"` a un `id` existente, y los `src` de
   `<img>` a una URL del manifiesto.

## 8. AUDITORÍA FINAL
Sobre las 86: sin errores de sintaxis, sin referencias rotas, sin archivos extra, sin recursos
externos fuera de los `<img>`, con `prefers-reduced-motion` en todos, con exactamente una meta
`description` y una `description-es` por archivo, y llaves CSS balanceadas (ignora las que estén
dentro de `content:"..."`).

## 9. GIT
Al terminar, si el usuario lo pide: `node Web/scripts/generate-catalog.mjs` y un commit **solo con
las rutas de tu carpeta**, nunca con `git add -A` (hay cambios de otras sesiones en el working tree).

## 10. ENTREGA
Informe con: los 86 slugs, familia, tema y firma de color de cada uno, el estado de verificación y
una línea describiendo la navegación de cada galería.
