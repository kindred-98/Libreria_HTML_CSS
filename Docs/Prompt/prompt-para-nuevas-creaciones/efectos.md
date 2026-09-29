# PROMPT: 100 EFECTOS en `creaciones-primium/efectos/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 efectos**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/efectos/` y en el resto de carpetas de
   `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que los 100 sean distintos.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + recuadro de ejemplo en gris". Ese patrón queda
prohibido. Cada efecto elige **un** modelo de presentación del catálogo, distinto del de sus vecinos
(nunca tres seguidos con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. MESA DE PRUEBAS — el sujeto effector sobre una superficie, con luz de estudio y su sombra.
2. ANTES / DESPUÉS — dos copias del sujeto, una sin efecto y otra con efecto, con un separador arrastrable.
3. LIENZO EN BLANCO — el sujeto solo, grande, con mucho aire, como una lámina de portfolio.
4. EN UNA TARJETA — el efecto aplicado al contenido real de una tarjeta (texto, foto, botón).
5. ESCENA — el sujeto dentro de un entorno ilustrado hecho con CSS/SVG.
6. TIRA DE MUESTRAS — el mismo efecto en tres o cuatro variantes de material a la vez.
7. DIAGRAMA — el efecto anotado, con llamadas, cotas y una línea de tiempo.
8. VITRINA — el sujeto bajo un foco, con reflejos y sombra de contacto marcadas.
9. FILMSTRIP — cinco o seis fotogramas del efecto en distintas fases, numerados.
10. A CUADROS — el sujeto dentro de un panel con barras de desplazamiento y zoom, como un editor.
11. EN UN CARTEL — el efecto aplicado a un texto grande, como póster o rótulo.
12. HUD — el efecto con telemetría alrededor y un retículo que lo sigue.
13. TERMINAL — el efecto descrito con líneas de log que se imprimen mientras ocurre.
14. REJILLA DE VARIANTES — ocho casos del mismo efecto, cada uno con un parámetro distinto.
15. PANEL LATERAL — el sujeto en grande y, al lado, sus controles para tocar los parámetros.
16. TARJETA VOLANTE — el sujeto se presenta como si levitara sobre un pedestal.
17. DENTRO DE UNA ESCENA DE JUEGO — el efecto como habilidad o poder.
18. CONSOLA DE MEZCLA — el efecto con wet/dry y parámetros visibles.
19. EN UNA FOTOGRAFÍA — el efecto aplicado a una composición de CSS que hace de foto.
20. MAPA DE CALOR — el efecto representado con su propia rejilla de intensidad.
21. POSTER DIVIDIDO — mitad con el efecto, mitad sin él, con corte inclinado.
22. CROMOSCOPIO - el efecto replicado en un anillo radial de reflejos.
23. A ESCALA — el efecto mostrado en tamaños diminutos, normal y gigante, uno al lado del otro.
24. EN MOVIMIENTO — el efecto aplicado a un elemento que se desplaza por la pantalla.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/efectos/<slug-kebab-case-en-ingles>/`
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
- **El efecto debe verse solo**: tiene que funcionar sin que nadie pase el cursor ni haga clic.
  La interacción puede añadir más, nunca ser lo único que se ve. Y debe tener un bucle continuo.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`, `background-position`, `mask`,
  `backdrop-filter`, `mix-blend-mode`. Nunca `width`/`height`/`top`/`left` en muchos elementos a la
  vez. Objetivo 60fps. Reutiliza nodos o arrays tipados para partículas.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje el sujeto en un estado estático,
  terminado y bonito.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de degradado morado sobre gris. Cada efecto tiene: historia de color (2-3 tonos armónicos),
profundidad real (sombra, brillo especular, sombra de contacto, luz de borde), microdetalle y
movimiento con easing, escalonado y carácter físico. Si el efecto es "deformación", la deformación
tiene que ser coherente con lo que deforma, no un scale() cualquiera.

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Hover y focus · Reveal y entrada · Salida y despedidas · Deformación (bend, twist, skew) · Paralaje ·
Morph entre formas · Desintegración y reensamblaje · Cristal y vidrio · Líquido y ondas · Fuego y humo ·
Electricidad y chispas · Partículas y polvo · Niebla y bruma · Ruido y grano · Barrido de luz ·
Split de texto · Revelado por máscara · Escalado 3D y rotación · Sombra proyectada · Brillo y bloom ·
Distorsión cromática · Aberración y glitch · Trazo de línea · Morph SVG entre iconos · Cromo y metal ·
Bruma y saturación · Ondulaciones de superficie · Campo magnético · Caos y turbulencia · Rastro y estela ·
Temblor y vibración · Oleaje · Cromatismo · Tinte y duotono.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs efectos <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco. Si ves dos
   capturas idénticas, primero comprueba que no sea solo eso.
3. Mira las dos capturas de cada efecto (2500 ms y 7000 ms) con la herramienta de lectura: el sujeto
   tiene que verse claro y las dos imágenes tienen que diferir.
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
línea describiendo el efecto y sobre qué sujeto actúa.
