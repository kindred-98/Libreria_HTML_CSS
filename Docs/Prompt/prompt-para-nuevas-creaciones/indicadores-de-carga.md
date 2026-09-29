# PROMPT: 100 INDICADORES DE CARGA en `creaciones-primium/indicadores-de-carga/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 indicadores**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/indicadores-de-carga/` y en el resto de carpetas
   de `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas
   ninguno. Ojo: ya hay muchos loaders en el repo (`aurora-wave-loader`, `quantum-spin-loader`,
   `orbital-dot-ring`, `tesseract`, `morphing-shape-animation`, `staircase-blocks-loader`, etc.), así que
   revisa con detalle y busca efectos que no existan ya.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que los 100 sean distintos.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + spinner gris centrado". Ese patrón queda
prohibido. Cada indicador elige **un** modelo de presentación del catálogo, distinto del de sus vecinos
(nunca tres seguidos con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. HMI INDUSTRIAL — panel de máquina con el indicador como lectura principal y etiquetas de estado.
2. PANTALLA DE ARRANQUE — secuencia de logo con barra de progreso y logo que se ensambla.
3. EN UNA TERMINAL — el indicador se imprime como caracteres que se escriben solos.
4. EN UN DIAL — el indicador dentro de un instrumento con aguja que barre.
5. EN UNA PANTALLA DE JUEGO — pantalla de carga con consejo y porcentaje, con pixel-art.
6. EN UN PANEL DE AVIÓN — con lecturas de combustible, altitud y banner de estado.
7. LAB-BENCH — el indicador con sondas y un osciloscopio al lado.
8. CONSOLA DE DISCO — Lectura de sectors, como en un disco duro de la era de los 90.
9. EN UNA MÁQUINA EXPENDEDORA - contador de modelos con rodillo de cinta y ticket saliendo.
10. EN UN ELEVADOR — indicador de planta con flecha y puertas.
11. EN UN RADIOGRAFÍO O TRÓMBO — barrido de rayos.
12. EN UN RELOJ — el indicador de carga como mecanismo de reloj, con agujas que se unen.
13. EN UN RECEPTOR DE RADIO — dial que busca la señal, con onda que entra.
14. EN UNA MÁQUINA DE VENTA - display de siete segmentos.
15. EN UN LIBRO - el indicador como pasar de página.
16. EN UNA CONSOLA DE VIDEOJUEGO — "loading" como nivel de jefe, con barra de vida.
17. EN UN MICROSCOPIO — el foco de la muestra mientras se prepara.
18. EN UNA NAVE ESPACIAL — secuencia de encendido, con el logo formándose por pieces.
19. EN UN TRANSPORTISTA — cinta transportadora con cajas apareciendo.
20. EN UNA VÍA DE TREN — el tren avanzando por el raíl, con postes.
21. EN UN TÚNEL DE LAVADO — el indicador como tambor girando con ropa.
22. EN UN ELEVADOR DE CRISTAL — ascensor en un pozo, con la cabina subiendo.
23. EN UN CONTADOR DE PÉRDIDAS — cuenta atrás mecánica.
24. EN UN SEMÁFORO — el indicador pasa de rojo a verde al completar.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/indicadores-de-carga/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si el indicador necesita JS. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, `<img>`, `url()` a archivo, webfonts
  (solo pilas del sistema), `fetch` ni módulos ES. Debe verse igual abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- **El bucle tiene que ser perfecto**: el indicador se repite sin salto. Si un elemento recorre un
  camino, vuelve exactamente al punto de partida, con la misma fase, y con un periodo divisor común
  entre todas las piezas para que nada parpadee. Sin parpadeos ni reinicios visibles.
- **Es un indicador de carga, no un adorno**: comunica progreso o espera. Si tiene porcentaje, el
  texto y la barra van juntos. Si es un sistema mecánico, tiene que parecer que está haciendo trabajo.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`, `background-position`, `offset-path`.
  Nunca `width`/`height`/`top`/`left` en muchos elementos a la vez. Objetivo 60fps en móvil también.
  Si hay partículas, reutiliza arrays tipados y no los reasignes por frame.
- Obligatorio `@media (prefers-reduced-motion:reduce)`: ahí **sí** tiene sentido detener el movimiento,
  y en ese caso se muestra un estado final y ordenado (no desaparece el indicador sin más).
- `aria-busy="true"` en el contenedor y un texto accesible con `role="status"`.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de tres puntitos parpadeando. Cada indicador tiene: historia de color (2-3 tonos armónicos),
profundidad real (bisel, brillo especular, sombra de contacto, luz de borde), microdetalle (marcas,
escala, numeración, unidades) y un movimiento con carácter físico: inercia donde toca, exactitud
mecánica donde toca, y nada de "plantilla de loader".

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Órbita y partículas · Anillo y arco · Barras segmentadas · Puntos y guiones · Onda y ecualizador ·
Rejilla de celdas · Texto y typewriter · Número que cuenta · Barrete rotatorio · Reloj y agujas ·
Máquina expendedora · Disco girando · Engranajes y correas · Cinta transportadora · Tren y raíl ·
Cápsula de aire · Burbujas · Líquido · Fuego y humo · Rayos y electricidad · Nieve · Hielo · Cristales ·
Chispas · Telaraña · Pulsos y ondas expansivas · Circuitos y trazas · Código binario · Matrices de
puntos · Triángulos y rombos · Asteriscos y estrellas · Globos y pompones · Eslabones · Tornillos ·
  Gotas - Petalos - Humo - Telescopio - Radar - Pantalla de nave estelar - Interfaz sci-fi.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs indicadores-de-carga <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada indicador (2500 ms y 7000 ms) con la herramienta de lectura, y
   comprueba que hay dos fases claramente distintas del bucle.
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
Informe con: los 100 slugs, el modelo de presentación de cada uno, el estado de verificación, el
periodo del bucle de cada uno y una línea describiendo la mecánica del indicador.
