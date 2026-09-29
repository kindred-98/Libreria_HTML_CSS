# PROMPT: 100 TARJETAS en `creaciones-primium/tarjetas/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 tarjetas**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/tarjetas/` y en el resto de carpetas de
   `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que las 100 sean distintas
   entre sí y no se te escape ninguna.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + tarjeta centrada en gris". Ese patrón queda
prohibido. Cada tarjeta elige **un** modelo de presentación del catálogo, distinto del de sus vecinas
(nunca tres seguidas con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. MOSAICO — rejilla tipo masonry con filtros por categoría que reorganizan con Animated Flip.
2. REVISTA — portada + columnas editoriales, con paginación y un artículo destacado.
3. PRICING — tira horizontal de planes con el recomendado destacado y un conmutador mensual/anual.
4. PERFIL — cabecera con avatar, estado y estadísticas, y una zona de acciones.
5. PRODUCTO — vista 360º, galería de miniaturas, ficha técnica y selector de variantes.
6. CLIMA — tarjeta de tiempo con mapa, previsión horaria deslizable y alerta de precipitación.
7. TIMELINE — tarjeta de commits/actividad con línea temporal y estados por evento.
8. MÉTRICAS — panel con sparklines, deltas y micrográficos, todo animándose al entrar.
9. BENTO — rejilla de bloques de distinto tamaño que se reorganizan al cambiar de viewport.
10. POST — tarjeta de red social con avatar, multimedia y contador de reacciones en vivo.
11. JUEGO — carta de personaje con estadísticas, rareza y animación de habilidad.
12. FICHA — ficha de producto de ecommerce con stock, envíos y reseñas.
13. NOTA — nota adhesiva o pizarra con texto, checklist y pinza arrastrable.
14. TARJETA DE VUELO — boarding pass / pase con código de barras y datos escaneables.
15. CRÉDITO — tarjeta de presentación personal con foto grande y datos de contacto.
16. RECETA — tarjeta de receta con ingredientes escalables e instrucciones paso a paso.
17. CANCIÓN — tarjeta de reproductor con forma de onda, portada y letras sincronizadas.
18. ARTÍCULO — tarjeta de blog con portada, tiempo de lectura y contenido desplegable.
19. MAPA — tarjeta con mapa estático, marcadores animados y ficha al pasar el cursor.
20. CÁMARA — tarjeta de dispositivo con visor en vivo y controles de exposición.
21. CRIPTOMONEDA — tarjeta de activo con sparkline, variación y orden de mercado.
22. LECTOR — tarjeta de libro con páginas que pasan y marcador de posición.
23. SALA — tarjeta de cine/obra con butacas, aforo y sesión seleccionada.
24. TARJETA GIRATORIA - la tarjeta gira al pasar el cursor y revela el reverso con arrastre.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/tarjetas/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si el efecto necesita JS. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, `<img>`, `url()` a archivo, webfonts
  (solo pilas del sistema), `fetch` ni módulos ES. Debe verse igual abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`. Nunca `width`/`height`/`top`/`left`
  en muchos elementos a la vez. Objetivo 60fps. Reutiliza nodos o arrays tipados para partículas.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje la tarjeta en un estado estático,
  **terminado** y bonito (no a medio dibujar ni en blanco).
- Accesible: lo interactivo es `<button>` o `<a>` real, con `aria-label` cuando solo lleva icono,
  foco visible y recorrido con teclado.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de tarjeta blanca centrada sobre fondo gris. Cada componente tiene: historia de color
(2-3 tonos armónicos), profundidad real (sombra interna, brillo especular, sombra de contacto, luz
de borde), microdetalle (bisel de 1px, marcas, tipografía grabada, anotaciones técnicas pequeñas)
y movimiento con easing, escalonado y carácter físico.

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Perfil y credenciales · Producto y e-commerce · Pricing y planes · Artículo y lectura · Post social ·
Métrica y analítica · Clima y entorno · Juego y personaje · Receta y comida · Reproductor de música ·
Ruta y viaje · Vuelo y pase · Cine y evento · Libro y lectura · Tablero kanban · Contacto y directorio ·
Tarjeta de presentación · Resumen de cuenta · Notificación · Fragilidad / glassmorphism · Neón ·
Cyberpunk / HUD · Papel y textura · Minimalismo editorial · Bento modular · Reverso 3D · Mapa · Crypto.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs tarjetas <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada tarjeta (2500 ms y 7000 ms) con la herramienta de lectura:
   tiene que verse bien, centrada, y las dos imágenes tienen que diferir.
4. Cada `href`/`src` del `index.html` apunta a un archivo que existe en la misma carpeta.

## 9. AUDITORÍA FINAL
Sobre los 100: sin errores de sintaxis, sin referencias rotas, sin archivos extra, sin recursos
externos, con `prefers-reduced-motion` en todos, con exactamente una meta `description` y una
`description-es` por archivo, y llaves CSS balanceadas (ignora las que estén dentro de `content:"..."`).

## 10. GIT
Al terminar, si el usuario lo pide: `node Web/scripts/generate-catalog.mjs` para el catálogo y un
commit **solo con las rutas de tu carpeta**, nunca con `git add -A` (hay cambios de otras sesiones en
el working tree).

## 11. ENTREGA
Informe con: los 100 slugs, el modelo de presentación de cada uno, el estado de verificación y una
línea describiendo el efecto de cada tarjeta.
