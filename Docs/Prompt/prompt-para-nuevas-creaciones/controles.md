# PROMPT: 100 CONTROLES en `creaciones-primium/controles/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 controles**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/controles/` y en el resto de carpetas de
   `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que los 100 sean distintos.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + control centrado en gris". Ese patrón queda
prohibido. Cada control elige **un** modelo de presentación del catálogo, distinto del de sus vecinos
(nunca tres seguidos con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. TABLERO DE MESA — un panel con diales, palancas y LEDs, y el control protagonista en el centro.
2. BANCO DE PRUEBAS — el control sobre una mesa de laboratorio con sondas, reglas y readouts.
3. MANDO A DISTANCIA — el control dentro de un mando con LEDs, vibración y pantalla pequeña.
4. RÓTULO DE ENVASO — el control etiquetado como si fuera el cierre de un envase, se lee y se gira.
5. PERFIL DE AJUSTES — el control dentro de una página de ajustes, junto a sus hermanos, y se nota al
   cambiar de sección.
6. EN UN MENÚ — el control vive en una barra de herramientas flotante.
7. VISTA EXPLOTADA — el control se abre en capas con líneas de llamada y medidas.
8. VITRINA — el control expuesto en una vitrina con foco y placa, como pieza de museo.
9. EN UNA CONSOLA — el control se maneja con un joystick y sus valores salen por consola.
10. HUD DE NAVE — el control integrado en un panel de instrumentos con telemetría.
11. EN UN MÓVIL — el control dentro del marco de un teléfono, en una app concreta.
12. CALIBRADO — el control junto a un patrón de calibración y marcas de referencia.
13. TALLER — vista de taller con despiece y cotas del mecanismo.
14. REJILLA DE ESTADOS - varios controles identicos en distintos estados a la vez.
15. PANTALLA TÁCTIL — el control sobre un plano que se ve en horizontal.
16. EN UN CARTEL — el control como elemento de un cartel o rótulo de neón.
17. CINTA DE TRANSPORTE — controles alineados como en una mesa de audio.
18. MANDO DE VUELO — perillas, palancas y botones de cabina con palanca de control real.
19. DIAL DE RELOJ — el control centrado como esfera de reloj con marcas.
20. BOTONERA DE AUDIO - el control dentro de una botonera, con un anillo LED de nivel.
21. ESCALERA DE VALORES — el control con un valor numérico que sube y baja como en un contador.
22. DENTRO DE UNA TARJETA — el control incrustado en una tarjeta de producto o de perfil.
23. REJILLA DE MUESTRAS — controles repetidos en una cuadrícula de catálogo, como muestras de color.
24. MINIATURA — el control en miniatura dentro de un mosaico, y al pulsarlo se amplía con Flip.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/controles/<slug-kebab-case-en-ingles>/`
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
- **Interacción real**: los controles responden a ratón, teclado y táctil. Con teclado se mueven con
  flechas, `Home`/`End`, `PageUp`/`PageDown` y `Espacio`/`Enter`, y el valor se anuncia con `aria-valuenow`.
- El control usa el elemento semántico que le toca: `<input type="range">` para un deslizador,
  `<input type="checkbox">` o `<button role="switch">` para un conmutador, `<select>` para una lista.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`. Nunca `width`/`height`/`top`/`left`
  en muchos elementos a la vez. Objetivo 60fps.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje el control en un estado estático,
  terminado y bonito.
- Accesible: foco visible en todo momento, contraste suficiente, y `aria-label` cuando solo hay icono.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de control plano sobre gris. Cada componente tiene: historia de color (2-3 tonos armónicos),
profundidad real (bisel, brillo especular, sombra de contacto, luz de borde), microdetalle (marcas de
escala, numeración, unidades, marcas grabadas) y movimiento con easing, escalonado y carácter físico:
un dial que se mueve tiene que tener inercia y detenerse en un tope, no deslizarse.

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Deslizador · Dial rotatorio · Interruptor · Casilla · Botón de radio · Lista desplegable · Selector de
color · Selector de fecha · Campo de tiempo · Deslizador doble (rango) · Deslizador vertical · Control
radial (knob) · Palanca · Botón de empuje · Botón de momentary (con retorno) · Rueda de scroll ·
Control de volumen · Slider de frecuencia (ecualizador) · Corte de notas (waveform) · Mando de
multifunción · Potenciómetro · Joystick · Palanca de vistas · Handle de redimensionado · Picker de
emoji (sin usarlos en la UI) · Campo de búsqueda con filtros · Selector segmentado · Stepper
(más/menos) · Toggle de tres estados · Interruptor con Modes · Botón de silencio · Fader · Crossfader ·
Control deRecording · Paternoster · Dial de progreso · Cursillo de ajuste fino.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs controles <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada control (2500 ms y 7000 ms) con la herramienta de lectura, y prueba
   además los estados: por defecto, enfocado, activo y deshabilitado.
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
línea describiendo el comportamiento físico del control.
