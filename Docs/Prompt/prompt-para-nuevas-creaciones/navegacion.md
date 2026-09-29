# PROMPT: 100 NAVEGACIONES en `creaciones-primium/navegacion/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 navegaciones**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/navegacion/` y en el resto de carpetas de
   `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que los 100 sean distintos.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + barra de enlaces en gris". Ese patrón queda
prohibido. Cada navegación elige **un** modelo de presentación del catálogo, distinto del de sus
vecinos (nunca tres seguidos con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. BARRA SUPERIOR — barra fija con desenfoque, que cambia al hacer scroll.
2. MENÚ LATERAL — panel que se despliega desde el borde, con indicadores de sección.
3. MENÚ A PANTALLA COMPLETA — overlay que ocupa toda la vista, con tipografía grande.
4. NAVEGACIÓN INFERIOR — barra fija abajo, con hasta cinco destinos (formato app).
5. BARRA LATERAL FIJA — rail con iconos, etiquetas que aparecen al pasar el cursor.
6. DOCK FLOTANTE — dock centrado abajo, con escala al pasar el cursor.
7. PANORÁMICA — navegación horizontal que se desplaza con el scroll, con indicador de progreso.
8. BREADCRUMB con indicación de ruta animada.
9. MIGA DE PAN — vertical, con pasos que se iluminan al llegar a ellos.
10. TABS — pestañas con indicador que se desliza, y con contenido que cambia.
11. SEGMENTED — control segmentado tipo iOS, con el deslizador del segmento activo.
12. DROPDOWN — menús desplegables con submenús en cascada, animando apertura con stagger.
13. MEGA MENÚ — panel ancho con varias columnas y una imagen que cambia.
14. MENÚ EN ANILLO — opciones dispuestas en círculo alrededor del cursor o del centro.
15. NAVEGACIÓN RADIAL — selector circular, como un dial o rueda de diafragma.
16. SELECTOR DE RUEDA - menú circular con sectores, como el dial de una lavadora.
17. ENCABEZADO STICKY — cabecera con altura que se reduce al hacer scroll.
18. INDICADOR DE PROGRESO — barra superior de lectura con los títulos de sección marcados.
19. NAVEGACIÓN DE PESTAÑAS VERTICALES — índice lateral fijo con el título rotado.
20. EN UNA CARCASA — navegación como dispositivo físico (mandos, teclas, cassette).
21. NAVEGACIÓN DE TALLER — conmutador rotativo de canales, como una radio.
22. BARRA DE BUSCAR — navegación como buscador de comandos, con atajos de teclado.
23. MENÚ ANIDADO — árbol de carpetas que se despliega y guarda el estado.
24. NAVEGACIÓN EN UNA VITRINA — menús como piezas expuestas, con placa y foco.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/navegacion/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si la navegación necesita JS. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, `<img>`, `url()` a archivo, webfonts
  (solo pilas del sistema), `fetch` ni módulos ES. Debe verse igual abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- **La navegación es de verdad**: enlaces `<a href="#...">` que llevan a secciones reales de la página,
  pestañas que cambian de panel, desplegables que abren y cierran. Nada de `<div>` disfrazado.
- **Contenido real**: cada sección tiene texto suficiente para que la navegación tenga sentido, con
  un titular y un párrafo o dos. La página tiene que poder recorrerse entera.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`, `height` de un solo indicador.
  Nunca `width`/`height`/`top`/`left` en muchos elementos a la vez. Objetivo 60fps.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje la navegación completamente funcional
  y estática.
- Accesible: es la parte más importante. Cada elemento navegable es `<a>` o `<button>`, con foco
  visible, orden de tabulación lógico, `aria-current` en la sección activa, `aria-expanded` en los
  desplegables, roles ARIA donde toque, y cierre con `Escape`.
- Responsive: se ve bien a 1200x800 y a 380x700. En móvil, el menú se adapta de verdad (no se
  superpone ni se corta). Sin scroll horizontal.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de lista de enlaces azulada. Cada navegación tiene: historia de color, profundidad real (sombra,
vidrio, luz de borde), microdetalle (indicador activo con tracking fino, marcas, contadores) y
movimiento con easing y escalonado. El indicador de sección activa tiene que desplazarse con
suavidad, no saltar.

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Barra superior · Lateral · Pantalla completa · Inferior de app · Rail de iconos · Dock · Panorámica ·
Breadcrumb · Miga de pan · Tabs · Segmented · Dropdown · Mega menú · Menú en anillo · Radial · Rueda ·
Sticky que encoge · Indicador de progreso · Pestañas verticales · Cascada · Anidado · Fondo
compartido · Menú contextual (clic derecho) · Menú de comando · Navegación por teclado (atajos) ·
Navegación por scroll · Historial de navegación · Buscador global · Historial lateral · Selector de
idioma · Selector de tema · Perfil de usuario desplegable · Carrito · Menú de cuenta · Navegación de
secciones con numeración · Menú con iconos y microcopy · Barra de herramientas · Menú flotante que
sigue al cursor.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs navegacion <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada navegación (2500 ms y 7000 ms) con la herramienta de lectura, y
   comprueba que el texto de las secciones no se corta ni se solapa en 380x700.
4. Cada `href`/`src` del `index.html` apunta a un archivo que existe en la misma carpeta, y los
   `href="#ancla"` apuntan a un `id` que existe en la misma página.

## 9. AUDITORÍA FINAL
Sobre los 100: sin errores de sintaxis, sin referencias rotas (incluidas las anclas internas), sin
archivos extra, sin recursos externos, con `prefers-reduced-motion` en todos, con exactamente una
meta `description` y una `description-es` por archivo, y llaves CSS balanceadas (ignora las que
estén dentro de `content:"..."`).

## 10. GIT
Al terminar, si el usuario lo pide: `node Web/scripts/generate-catalog.mjs` para el catálogo y un
commit **solo con las rutas de tu carpeta**, nunca con `git add -A` (hay cambios de otras sesiones en
el working tree).

## 11. ENTREGA
Informe con: los 100 slugs, el modelo de presentación de cada uno, el estado de verificación y una
línea describiendo el patrón de navegación y cómo se comporta con teclado.
