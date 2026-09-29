# PROMPT: 100 CREACIONES en `creaciones-primium/otros/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 creaciones**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/otros/` y en el resto de carpetas de
   `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que los 100 sean distintos.
3. Esta carpeta es la de "lo que no encaja en ninguna otra". Úsala para lo que no sea botón, tarjeta,
   formulario, control, efecto, galería, navegación ni indicador de carga. Si dudas de la categoría,
   va aquí. Reparte entre: widgets, utilidades, generadores, visualizadores, herramientas,
   experimental, audio, datos, accesibilidad, tiempo y clima, arte generativo, y bromas pulidas.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + recuadro centrado en gris". Ese patrón queda
prohibido. Cada creación elige **un** modelo de presentación del catálogo, distinto del de sus vecinos
(nunca tres seguidos con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. BANCO DE TRABAJO — la pieza sobre una mesa, con herramientas alrededor.
2. VITRINA — expuesta como objeto, con foco y placa.
3. CONSOLA — todo pasa por una terminal, con salida imprimiéndose.
4. HUD — con telemetría alrededor y un retículo.
5. VISTA EXPLOTADA — por capas, con líneas de llamada y cotas.
6. MESA DE LUZ — sujeto bajo foco de estudio, con sombra y fondo que cae.
7. DIAGRAMA - anotado, con flujo y conexiones entre las piezas.
8. FILMSTRIP — fases del proceso en fotogramas numerados.
9. REJILLA DE PRUEBAS — ocho variantes del mismo principio con parámetros distintos.
10. TABLERO DE CONTROL — con Interruptores y lecturas.
11. A CUADROS — el sujeto dentro de un panel con barras de desplazamiento.
12. EN UN MÓVIL — dentro del marco de un teléfono.
13. EN UN CARTEL — tipografía protagonista y el sujeto detrás.
14. SOBRE FONDO — a sangre completa, con el sujeto integrado en la escena.
15. EN UN ARMARIO — cajones y puertas que se abren.
16. FOTOGRAFÍA — la composición completa como si fuera una foto de estudio.
17. MAPA — con nodos y conexiones.
18. LÍNEA DE TIEMPO — el proceso cronológicamente, con marcas.
19. MANUAL DE INSTRUCCIONES - impreso junto al objeto, como en un mueble expositor.
20. EN UN LABORATORIO — con soporte, cables y sondas.
21. IMPRESO — la creación sobre papel: una hoja, una ficha, un plano.
22. ESCAPARATE — expuesto tras un cristal, con reflejos.
23. DENTRO DE UNA ESCENA — integrado en un entorno.
24. PANORÁMICA — la creación a lo largo de una banda, con paralaje al hacer scroll.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/otros/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si la creación necesita JS. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, `<img>`, `url()` a archivo, webfonts
  (solo pilas del sistema), `fetch` ni módulos ES. Debe verse igual abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- **Nada de ejecutables ni de malware**: sin bloqueo de red, sin miners, sin biométricos, sin captura
  de pantalla, sin micrófono, sin geolocalización real. Todo se simula con datos falsos y locales.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`. Nunca `width`/`height`/`top`/`left`
  en muchos elementos a la vez. Objetivo 60fps. Reutiliza arrays tipados; no reasignes en cada frame.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje la creación en un estado estático y
  terminado.
- Accesible: controles con elemento semántico, foco visible, operables con teclado, y con
  `role`/`aria` donde toque.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de recuadro gris con un texto dentro. Cada creación tiene: historia de color (2-3 tonos armónicos),
profundidad real (bisel, brillo especular, sombra de contacto, luz de borde), microdetalle (marcas,
escala, numeración, anotaciones) y movimiento con easing, escalonado y carácter físico.

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Generadores de color (paletas, degradados, contraste) · Generadores de nombres · Generadores de
patrones · Generadores de avatar · Generadores de textura · Arte generativo (fractales, quads, ruido,
fluido) · Visualizadores de audio (espectro, forma de onda, sonificación) · Relojes y temporizadores ·
Calculadoras y conversores · Calendario y agenda · Meteo simulado · Mapa de calor · Reloj mundial ·
Cronómetro y cuenta atrás · Codificador de color · Reloj de arena · Abecedario y tipografía ·
Fisiometría · Juego de la vida · Rule 30 y autómatas · Dijkstra visual · Ordenamiento visual ·
Expresiones regulares · Validadores · Listas de tareas · Notas adhesivas · Tablero kanban ·
  Calendario perpetuo - Calculadora de impuestos - Presupuesto personal - Diario - Resumen de lectura -
Marcapáginas · Contador de palabras · Temporizador pomodoro · Semaforos · Brújula · Calculadora de
calorías · Simulador de física · Niveles de agua · Semaforización · Accesibilidad: contraste, texto
legible, tipografía variable · Tema claro/oscuro.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs otros <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada creación (2500 ms y 7000 ms) con la herramienta de lectura: tiene que
   verse clara, bien compuesta, y las dos imágenes tienen que diferir.
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
línea describiendo qué hace y por qué está en "otros".
