# ControlesAnimaciones — estado de la sesión y guía de continuación

Fecha de cierre de esta sesión: 28/09/2026
Carpeta de trabajo: `creaciones-primium/controles/`
Carpeta del encargo: `Docs/Prompt/prompt-para-nuevas-creaciones/controles.md`
Banco de pruebas: `Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs`

---

## 1. Resumen ejecutivo

| Dato | Valor |
|---|---|
| Objetivo del usuario | Crear 59 controles nuevos en `creaciones-primium/controles/` |
| Carpetas creadas | 59 (las 59 ya existen en disco, vacías si no tienen archivos) |
| Componentes terminados | **38** |
| Componentes pendientes | **21** |
| Verificación | Los 38 pasan `banco-de-pruebas` con estado `ok` y `err=0` |
| Revisión visual feita | 9 de 38 (los demás solo verificados por el banco) |
| Pendientes de reparación | 3 componentes con `<script src="script.js">` sin archivo |
| Commits de git | **Ninguno**. Todo está sin versionar en el working tree |

Antes de empezar esta sesión el repositorio **no tenía Node instalado** y la carpeta
`creaciones-primium/controles/` solo contenía `.gitkeep`. Se instaló Node 24.19.0 portátil y se
generó el catálogo de la web para poder ver los componentes (ver sección 8).

---

## 2. Reglas que manda el encargo (resumen operativo)

El archivo `Docs/Prompt/prompt-para-nuevas-creaciones/controles.md` es la autoridad. Lo
esencial, en versión compacta:

- **Presentación**: no existe esqueleto común. Cada componente elige **un** modelo de los 24 del
  apartado 3 del encargo, y **nunca tres seguidos** con el mismo modelo. El modelo es el marco de
  la página: se construye la escena alrededor del control, nunca un control pelado sobre gris.
- **Archivos**: `index.html` (obligatorio) + `styles.css` (obligatorio) + `script.js` **solo si
  hace falta JS**. Nada más dentro de la carpeta. Si no hay JS, no se crea **ni se referencia**.
- **Sin recursos externos**: nada de CDN, `<img>`, `url()` a archivo, webfonts (solo pilas del
  sistema), `fetch` ni módulos ES. Tiene que verse igual abierto con `file://`.
- **Metas**: `<!doctype html>`, `<html lang="en">`, charset, viewport, `<title>` en inglés, una
  sola `<meta name="description">` en inglés y justo debajo una `<meta name="description-es">` en
  español natural con acentos correctos, **sin entidades HTML y sin comillas dobles** dentro.
- **Interacción real**: ratón, teclado y táctil. Con teclado: flechas, `Home`/`End`,
  `PageUp`/`PageDown`, `Espacio`/`Enter`, y el valor anunciado con `aria-valuenow` (o
  `aria-valuetext` cuando hay unidades).
- **Semántica**: `<input type="range">` para deslizadores y knobs, `<input type="checkbox">` o
  `<button role="switch">` para conmutadores, `<input type="radio">` para radio, `<select>` para
  listas. Si el control es rotatorio o multivía y no encaja en un range, se usa
  `role="slider"` con `tabindex="0"`, `aria-valuemin/max/now`.
- **Movimiento**: solo `transform`, `opacity`, `filter`, `clip-path`, `color`. Nunca
  `width`/`height`/`top`/`left` en muchos elementos a la vez.
- **Obligatorio** `@media (prefers-reduced-motion:reduce)` dejando el control en un estado
  estático, terminado y bonito.
- **Calidad**: historia de color de 2-3 tonos, profundidad real (bisel, especular, sombra de
  contacto, luz de borde), microdetalle (marcas de escala, numeración, unidades) y movimiento con
  carácter físico: inercia, topes, rebotes. Nada de comentarios en el código, sin emojis, sin
  lorem ipsum, sin "coming soon". Visible UI en inglés.
- **No tocar archivos fuera de la carpeta propia. No ejecutar git.**

---

## 3. Lo que hay que arreglar primero (3 componentes)

Los tres referencian `script.js` en el `index.html` pero el archivo **no existe**. El banco los da
como `ok` porque sin interacción no se nota, pero el control está incompleto.

| slug | diagnóstico | arreglo |
|---|---|---|
| `calibrated-vertical-fader` | El CSS pinta el capuchón con `var(--v,.6)`, así que se queda clavado en el 60 % y no sigue al range. | Crear `script.js` que lea el range y escriba `--v` en el track (patrón idéntico al de `desk-console-fader`). |
| `cockpit-view-lever` | El CSS usa `var(--v)` **sin fallback**: la palanca no se coloca al cargar. | Crear `script.js` que sincronice `--v` con el range y con los `aria-valuenow`. |
| `toolbar-command-search` | El filtrado de la lista de resultados depende de JS; sin él el campo no filtra. | Crear `script.js` con el filtrado, o borrar la etiqueta `<script>` y rehacerlo en CSS si el concepto lo permite. |

Los otros 35 están completos: `index.html` + `styles.css` (+ `script.js` cuando toca), todos pasan
el banco, todos cumplen las reglas de archivo, metas, `prefers-reduced-motion`, sin recursos
externos y sin referencias rotas.

---

## 4. Los 38 componentes terminados

Columna "revisado": `sí` = miré las capturas del banco a 2500 ms y 7000 ms y ajusté lo que estaba
mal. `banco` = solo verificado automáticamente.

| # | slug | modelo de presentación | concepto | revisado |
|---|---|---|---|---|
| 1 | `desk-console-fader` | 1 tablero de mesa | fader | sí |
| 2 | `dial-torque-bench` | 2 banco de pruebas | dial rotatorio | sí |
| 3 | `remote-power-switch` | 3 mando a distancia | interruptor | sí |
| 4 | `tamper-seal-check` | 4 rótulo de envase | casilla | no |
| 5 | `settings-theme-radio` | 5 perfil de ajustes | botón de radio | sí |
| 6 | `toolbar-format-select` | 6 en un menú | lista desplegable | sí |
| 7 | `exploded-knob-anatomy` | 7 vista explotada | knob | no |
| 8 | `museum-pigment-picker` | 8 vitrina | selector de color | sí |
| 9 | `console-joystick-teleplot` | 9 en una consola | joystick | no |
| 10 | `hud-waveform-scrub` | 10 HUD de nave | corte de onda | sí |
| 11 | `mobile-date-picker-wheels` | 11 en un móvil | selector de fecha | no |
| 12 | `calibration-jog-wheel` | 12 calibrado | ajuste fino | no |
| 13 | `workshop-throttle-lever` | 13 taller | palanca | sí |
| 14 | `state-grid-checkboxes` | 14 rejilla de estados | casilla | no |
| 15 | `touchscreen-mode-segment` | 15 pantalla táctil | selector segmentado | no |
| 16 | `neon-mute-sign` | 16 en un cartel | botón de silencio | sí |
| 17 | `rack-eq-band-strip` | 17 cinta de transporte | ecualizador | sí |
| 18 | `cockpit-push-latch-button` | 18 mando de vuelo | botón de empuje | no |
| 19 | `clockface-progress-dial` | 19 dial de reloj | dial de progreso | no |
| 20 | `audio-crossfader-ring` | 20 botonera de audio | crossfader | no |
| 21 | `ladder-stepper-counter` | 21 escalera de valores | stepper | no |
| 22 | `card-time-field` | 22 dentro de una tarjeta | campo de tiempo | no |
| 23 | `swatch-grid-colorway` | 23 rejilla de muestras | selector de color | no |
| 24 | `thumbnail-flip-select` | 24 miniatura | lista desplegable | no |
| 25 | `desk-potentiometer-rotary` | 1 tablero de mesa | potenciómetro | no |
| 26 | `bench-range-slider` | 2 banco de pruebas | deslizador | no |
| 27 | `remote-volume-wheel` | 3 mando a distancia | volumen | no |
| 28 | `tri-state-seal-switch` | 4 rótulo de envase | toggle de tres estados | no |
| 29 | `settings-mode-switch` | 5 perfil de ajustes | interruptor con modos | no |
| 30 | `toolbar-command-search` | 6 en un menú | búsqueda con filtros | no |
| 31 | `hud-multifunction-combo` | 10 HUD de nave | mando multifunción | no |
| 32 | `mobile-symbol-picker` | 11 en un móvil | picker de símbolos | no |
| 33 | `calibrated-vertical-fader` | 12 calibrado | deslizador vertical | banco (roto, ver 3) |
| 34 | `cockpit-view-lever` | 18 mando de vuelo | palanca de vistas | banco (roto, ver 3) |
| 35 | `remote-nav-knob` | 3 mando a distancia | knob | no |
| 36 | `seal-fill-range-label` | 4 rótulo de envase | deslizador doble | no |
| 37 | `settings-cascade-checkbox` | 5 perfil de ajustes | casilla en cascada | no |
| 38 | `toolbar-clip-segment` | 6 en un menú | selector segmentado | no |

Comportamiento físico, uno por componente terminado:

1. `desk-console-fader` — el capuchón corre con muelle y se asienta en las 11 muescas; la escalera
   de LED sube con el valor y la aguja barre sola.
2. `dial-torque-bench` — aguja de 0 a 300°, muescas cada 30°, al soltar cae en la muesca más
   cercana rebotando contra el tope.
3. `remote-power-switch` — el capuchón de cromo se encaja entre RUN y STBY; al cortar, la pantalla
   se apaga y los pilotos mueren.
4. `tamper-seal-check` — la casilla es el precinto: al desmarcarla el cordón se rompe, la cera se
   agrieta con `clip-path` y cae el sello VOID.
5. `settings-theme-radio` — el grupo de radio repinta la tarjeta de vista previa con transición
   (system / light / dark / contrast).
6. `toolbar-format-select` — el `select` real cambia la escala del titular del lienzo y la ficha
   de la capa; el cursor sigue dibujando.
7. `exploded-knob-anatomy` — las cinco capas rotan a la vez y se separan en proyección; las cotas
   a, b y c se recalculan con el ángulo.
8. `museum-pigment-picker` — al elegir pigmento cambian la muestra, el foco y la placa a la vez; el
   mezclador custom tiñe la vitrina.
9. `console-joystick-teleplot` — el stick va con retardo elástico y cada coordenada se imprime en
   el log de telemetría.
10. `hud-waveform-scrub` — la línea de barrido recorre la onda, el cabezal recorta y las columnas
    de telemetría responden.
11. `mobile-date-picker-wheels` — las ruedas giran con inercia y enganchan; la marca de hoy se
    desplaza con ellas.
12. `calibration-jog-wheel` — creeps de uno en uno, el índice rojo se alinea con el vernier y
    Espacio lo aparca en el cero.
13. `workshop-throttle-lever` — recorrido con muescas y rebote duro en los dos topes; el muelle se
    estira con la palanca.
14. `state-grid-checkboxes` — seis muestras del mismo componente, cada una respirando por su cuenta.
15. `touchscreen-mode-segment` — el indicador de la píldora se desliza con muelle y el glyph de
    cada modo rota al activarse.
16. `neon-mute-sign` — el interruptor mata el tubo: el neón se apaga con parpadeo, el zumbido
    cesa y las bombillas del marco siguen persiguiendo.
17. `rack-eq-band-strip` — cuatro capuchones con peso, anillo LED que sube y baja con la mezcla y
    ventilador girando detrás de la rejilla.
18. `cockpit-push-latch-button` — la guarda bascula, el botón da un tirón y enclava, y la luz de
    aviso late mientras queda armado.
19. `clockface-progress-dial` — la aguja se gira por ángulo real alrededor de la esfera y persigue
    con easing; el segundero barre solo.
20. `audio-crossfader-ring` — el anillo LED se enciende de A a B con retardo escalonado por diodo,
    así que la luz va por detrás del capuchón.
21. `ladder-stepper-counter` — los tambores giran una celda por cifra con arrastre escalonado y
    golpean en el tope de 000 y de 999.
22. `card-time-field` — las cifras ruedan al cambiar hora o minutos dentro de la tarjeta.
23. `swatch-grid-colorway` — la muestra elegida repinta el objeto de vista previa con un barrido y
    escribe su hexadecimal.
24. `thumbnail-flip-select` — la miniatura elegida gira en 3D y crece al hueco protagonista.
25. `desk-potentiometer-rotary` — el puntero recorre la esfera graduada y el visor de la placa
    responde.
26. `bench-range-slider` — deslizador con regla de acero y sondas en los extremos, lectura en mm.
27. `remote-volume-wheel` — la rueda lateral gira con el arrastre y la escalera de LED sube.
28. `tri-state-seal-switch` — el selector gira entre SEALED, OPENED y BROKEN y cambia el gráfico.
29. `settings-mode-switch` — AUTO, MANUAL y OFF encajan y despliegan una subfila distinta.
30. `toolbar-command-search` — el texto filtra la lista en vivo y las coincidencias resaltan.
31. `hud-multifunction-combo` — girar, pulsar y mantener sobre el mando multifunción.
32. `mobile-symbol-picker` — los glifos geométricos saltan a la línea del compositor.
33. `calibrated-vertical-fader` — vertical que se engancha en las marcas de referencia (pendiente
    de sincronizar).
34. `cockpit-view-lever` — palanca de vistas con tres muescas (pendiente de sincronizar).
35. `remote-nav-knob` — el anillo de selección va saltando de elemento y ENTER pulsa.
36. `seal-fill-range-label` — el rango doble mueve la banda de líquido entre los dos límites.
37. `settings-cascade-checkbox` — la casilla maestra deja a los hijos en estado indeterminado.
38. `toolbar-clip-segment` — el indicador se desliza y el glifo de modo se deforma.

---

## 5. Los 21 componentes pendientes

Las carpetas ya existen y están vacías. Esta es la especificación de cada uno, con el modelo de
presentación asignado para que la rotación del catálogo siga siendo la del plan (ningún modelo se
repite tres veces seguidas en toda la lista de 59).

| # | slug | modelo | concepto y elemento semántico | nivel | qué tiene que hacer |
|---|---|---|---|---|---|
| 39 | `vitrine-safe-dial` | 8 vitrina | dial rotatorio, `role="slider"` | premium | Disco de caja fuerte como pieza de museo, con foco y placa: gira con inercia, pasa el moleteado y se para en seco contra un tope; la ventanita de cifras rueda. Negro de museo, latón y foco cálido. |
| 40 | `console-dual-range` | 9 en una consola | deslizador doble, dos `input type="range"` superpuestos con ARIA correcta | intermedio/premium | Dos manetas independientes con selección brillante entre ellas, y cada cambio impreso en el log de la consola. |
| 41 | `hud-sensor-gain-pot` | 10 HUD de nave | potenciómetro, `input type="range"` | premium | Potenciómetro de ganancia de sensor en el HUD con esfera graduada y columnas de telemetría (ganancia, suelo de ruido, umbral) que responden al girar. |
| 42 | `mobile-scroll-wheel-picker` | 11 en un móvil | rueda de scroll, listbox compuesto con `role="listbox"` y `aria-activedescendant`, o tres `select` | premium | Rueda estilo iOS con inercia y enganche, banda de selección sobre la fila central y el campo de arriba sincronizado. |
| 43 | `workshop-gear-radio` | 13 taller | botón de radio, `input type="radio"` | intermedio | Grupo que elige relación de engranaje: botones mecánicos que golpean al bajar, dibujo de engranaje que cambia y dentados y par torsional grabados. Fundición y naranja de seguridad. |
| 44 | `state-grid-switches` | 14 rejilla de estados | interruptor, `button role="switch"` | intermedio | El mismo interruptor en rejilla de estados: off, on, hover, focus, pressed y disabled, cada uno con su micro-movimiento. |
| 45 | `touchscreen-quantity-stepper` | 15 pantalla táctil | stepper, `input type="number"` más botones | intermedio | Stepper de cantidad en quiosco táctil: objetivos grandes, ripple al pulsar, la cifra rueda y el total se recalcula debajo. |
| 46 | `poster-press-glow` | 16 en un cartel | botón de empuje, `button aria-pressed` | intermedio | Botón como cartel luminoso: un anillo de bombillas lo persigue y al pulsarlo inunda el cartel de luz y estampa una palabra. |
| 47 | `rack-signal-trim-slider` | 17 cinta de transporte | deslizador, varios `input type="range"` | intermedio | Tira de rack con trims: escala de dB grabada, capuchón fino y valor en vivo; una fila seleccionada enciende su LED. |
| 48 | `clockface-time-dial` | 19 dial de reloj | campo de tiempo, `input type="time"` sincronizado con las agujas | premium | La hora se ajusta girando las agujas: hora y minutos arrastrables y operables con teclado, lectura digital debajo, segundero barriendo. Porcelana y agujas azuladas. |
| 49 | `audio-panel-volume-ring` | 20 botonera de audio | volumen, `input type="range"` | premium | Volumen rotatorio con anillo LED: al girar se llena el anillo, la matriz de botones se atenúa y el LED de pico parpadea arriba. |
| 50 | `ladder-frequency-value` | 21 escalera de valores | frecuencia, `input type="range"` | intermedio | Deslizador de frecuencia cuya etiqueta de Hz sube y baja por una escalera con enganche, y la curva de la banda mueve su pico. |
| 51 | `card-record-control` | 22 dentro de una tarjeta | grabación, `button aria-pressed` | intermedio | Control de grabación en una tarjeta de episodio: el botón se hunde, el punto late, el cronómetro corre y la onda crece. |
| 52 | `slider-style-swatch-grid` | 23 rejilla de muestras | deslizador, `input type="radio"` por acabado más un range principal | intermedio | Catálogo de acabados (cromo, latón, mate, neón): cada muestra es un mini deslizador y al elegir uno se reestiliza el grande con un barrido. |
| 53 | `thumbnail-waveform-scrubs` | 24 miniatura | corte de onda, `input type="range"` por miniatura | intermedio/premium | Mosaico de mini ondas: al pulsar una, la ficha gira en 3D y crece a un recorte interactivo. |
| 54 | `desk-panel-resize-handle` | 1 tablero de mesa | handle de redimensionado, `div role="separator"` con `aria-valuenow` | intermedio/premium | Borde de panel con tirador moleteado: al arrastrar el panel crece o encoge y las cotas y la lectura en mm se actualizan. |
| 55 | `bench-paternoster-loop` | 2 banco de pruebas | paternoster, bucle con ARIA live | premium | Paternoster de celdas en bucle infinito como selector de valor: corre sola y al elegir una celda frena con inercia hasta encajar en la ventana de lectura. |
| 56 | `exploded-momentary-key` | 7 vista explotada | momentary, `button` | premium | Tecla momentánea despiezada en émbolo, muelle, cúpula y contactos: al pulsar se compresa por capas y vuelve con sobreimpulso. Azul de plano, crema y cobre. |
| 57 | `exploded-crossfader-anatomy` | 7 vista explotada | crossfader, `input type="range"` | premium | Crossfader despiezado en capuchón, guía, raíl, contactos y bornes, con líneas de llamada y cotas que siguen al movimiento. |
| 58 | `vitrine-calendar-dial` | 8 vitrina | selector de fecha, anillos con `input type="range"` o `select` | premium | Calendario antiguo en vitrina: el anillo exterior cambia el mes, el interior el día, la ventanita grabada rueda y la placa se re-fecha. |
| 59 | `console-gear-lever` | 9 en una consola | palanca, `input type="range"` vertical | intermedio/premium | Palanca de cambio con muescas que golpea en cada posición e imprime la relación y el par en el log de la consola. |

---

## 6. Catálogo maestro de los 59

```
01 desk-console-fader          M1  ok      32 remote-nav-knob            M3  ok
02 dial-torque-bench           M2  ok      33 sealed-fill-range-label   M4  ok
03 remote-power-switch         M3  ok      34 settings-cascade-checkbox M5  ok
04 tamper-seal-check           M4  ok      35 toolbar-clip-segment      M6  ok
05 settings-theme-radio        M5  ok      36 hud-multifunction-combo   M10 ok
06 toolbar-format-select       M6  ok      37 mobile-symbol-picker      M11 ok
07 exploded-knob-anatomy       M7  ok      38 calibrated-vertical-fader M12 ROTO
08 museum-pigment-picker       M8  ok      39 vitrine-safe-dial         M8  PENDIENTE
09 console-joystick-teleplot   M9  ok      40 console-dual-range        M9  PENDIENTE
10 hud-waveform-scrub          M10 ok      41 hud-sensor-gain-pot       M10 PENDIENTE
11 mobile-date-picker-wheels   M11 ok      42 mobile-scroll-wheel-picker M11 PENDIENTE
12 calibration-jog-wheel       M12 ok      43 workshop-gear-radio       M13 PENDIENTE
13 workshop-throttle-lever     M13 ok      44 state-grid-switches       M14 PENDIENTE
14 state-grid-checkboxes       M14 ok      45 touchscreen-quantity-stepper M15 PENDIENTE
15 touchscreen-mode-segment    M15 ok      46 poster-press-glow         M16 PENDIENTE
16 neon-mute-sign              M16 ok      47 rack-signal-trim-slider   M17 PENDIENTE
17 rack-eq-band-strip          M17 ok      48 clockface-time-dial       M19 PENDIENTE
18 cockpit-push-latch-button   M18 ok      49 audio-panel-volume-ring   M20 PENDIENTE
19 clockface-progress-dial     M19 ok      50 ladder-frequency-value    M21 PENDIENTE
20 audio-crossfader-ring       M20 ok      51 card-record-control       M22 PENDIENTE
21 ladder-stepper-counter      M21 ok      52 slider-style-swatch-grid  M23 PENDIENTE
22 card-time-field             M22 ok      53 thumbnail-waveform-scrubs M24 PENDIENTE
23 swatch-grid-colorway        M23 ok      54 desk-panel-resize-handle  M1  PENDIENTE
24 thumbnail-flip-select       M24 ok      55 bench-paternoster-loop    M2  PENDIENTE
25 desk-potentiometer-rotary   M1  ok      56 exploded-momentary-key    M7  PENDIENTE
26 bench-range-slider          M2  ok      57 exploded-crossfader-anatomy M7 PENDIENTE
27 remote-volume-wheel         M3  ok      58 vitrine-calendar-dial     M8  PENDIENTE
28 tri-state-seal-switch       M4  ok      59 console-gear-lever        M9  PENDIENTE
29 settings-mode-switch        M5  ok
30 toolbar-command-search      M6  ok
31 (exploded-momentary-key)    M7  ver 56
32 (vitrine-safe-dial)         M8  ver 39
33 (console-dual-range)        M9  ver 40
34 (hud-multifunction-combo)   M10 ok
35 (mobile-symbol-picker)      M11 ok
36 (calibrated-vertical-fader) M12 roto
37 (workshop-gear-radio)       M13 ver 43
38 (state-grid-switches)       M14 ver 44
39 (touchscreen-quantity-stepper) M15 ver 45
40 (poster-press-glow)         M16 ver 46
41 (rack-signal-trim-slider)   M17 ver 47
42 cockpit-view-lever          M18 ok
```

---

## 7. Cómo trabajar a partir de aquí

### 7.1 Entorno

En esta máquina Node **no estaba instalado** y el instalador MSI pedía administrador. Se resolvió
con la ZIP oficial portable:

- Node 24.19.0 descomprimido en `C:\Users\<usuario>\.local\node`
- esa carpeta añadida al PATH de usuario del registro
- **En el equipo de casa hay que repetirlo o instalar Node 20+**: si `node` no está en el PATH,
  usar la ZIP portable de https://nodejs.org/dist/ y anteponer la carpeta al PATH en cada comando.

En PowerShell, al principio de cada comando:

```powershell
$env:Path = "$env:Path;$env:USERPROFILE\.local\node"
```

### 7.2 Verificación obligatoria de cada componente nuevo

```powershell
# 1. sintaxis del JS
node --check creaciones-primium/controles/<slug>/script.js

# 2. banco de pruebas: cada línea debe terminar en "ok"
node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs controles <slug> <slug2> ...

# 3. mirar las capturas que imprime (la última línea da la carpeta)
#    <slug>-2500.png y <slug>-7000.png
```

Estados posibles: `ok` (bien), `ERROR-JS` (error de JavaScript), `SIN-MOVIMIENTO` (no se detecta
movimiento), `SIN-REPORTE` (no llegó a imprimir el informe).

### 7.3 Captura a 380x700 opcional

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu `
  --hide-scrollbars --no-first-run --user-data-dir="$env:TEMP\opencode\m<slug>" `
  --window-size=380,700 --virtual-time-budget=3000 `
  --screenshot="$env:TEMP\opencode\<slug>-380.png" `
  "file:///C:/.../creaciones-primium/controles/<slug>/index.html"
```

Aviso: con `--window-size=380,700` Edge headless entrega un viewport de ~492 px y recorta la
imagen a 380, así que **parece desbordamiento horizontal sin serlo**. Para comprobarlo de verdad,
hay que montar la página en un `<iframe>` de 380 px exactos y comparar `scrollWidth` con
`clientWidth`.

---

## 8. Trampas descubiertas en esta sesión (léelas antes de seguir)

1. **El banco solo detecta movimiento geométrico.** La sonda compara las cajas de los elementos
   mediante `getBoundingClientRect`. Si el componente solo anima `color` u `opacity`, da
   `SIN-MOVIMIENTO` aunque se vea muy vivo. Hay que tener **siempre** algo trasladándose, rotando
   o barriendo con `transform` entre 1,2 s y 4,2 s, aunque no haya interacción.
2. **Una captura suelta no dice si algo está roto.** Edge headless con `--virtual-time-budget` sólo
   ejecuta unos 4 `requestAnimationFrame`, así que una imagen sale congelada en el frame 0. La
   sonda de movimiento del banco sí lo detecta, porque parchea rAF con `setTimeout`.
3. **Variable de color sin almohadilla = pintar nada.** En `museum-pigment-picker` los hex venían
   de `data-hex="1c4f8f"` (sin `#`); al poner `--pig: 1c4f8f` el `radial-gradient` quedaba
   inválido y la muestra salía blanca. Si una imagen "no sale", revisar variables de color.
4. **Elemento con `top` y `bottom` a la vez se estira.** En `rack-eq-band-strip` el capuchón del
   fader ocupaba todo el raíl. Para elementos que se mueven hay que fijar `height` y mover con
   `transform: translate3d()`.
5. **Transform en porcentaje no es lo que parece.** `translateX(100%)` es el 100 % del ancho del
   propio elemento, no del contenedor. Para mover según la posición se calcula en píxeles con
   `offsetWidth`/`offsetHeight` en JS y se escribe una variable `--travel` o `--pos`.
6. **Un range vertical necesita `writing-mode`.** `writing-mode: vertical-lr; direction: rtl;` en
   el input, con el pulgar transparente y un capuchón propio dibujado encima, sincronizado por JS.
7. **Las transiciones de propiedades prohibidas saltan a la vista.** No meter `background`,
   `box-shadow` o `text-shadow` en `transition`; usar capas `::before`/`::after` con `opacity` y
   `transform`.
8. **Custom properties sin `@property` no interpolan.** `transition: --x .3s` no hace nada; el
   cambio es un salto. Se acepta, pero conviene saberlo.
9. **`:has()` sí funciona** en Edge/Chromium actual, y es la forma limpia de reaccionar al estado
   de un input que está en otro nivel del DOM. Cuidado: `#input:checked ~ .hermano` solo vale si
   el input es hermano anterior.
10. **El `select` nativo no se puede estilizar** (su desplegable es del sistema). Se estila la
    caja y se rodea de una escena que aporte el movimiento.
11. **Delegar en subagentes funcionó a ratos**: doszygotes completos en un caso, parcial en otro,
    y en varios intentos devolvieron error de límite de tasa sin escribir nada. Cuando un subagente
    termine, **revisar siempre qué carpetas dejó escritas** antes de fiarse de su informe.

---

## 9. Auditoría automática que se puede repetir

Este bloque recorre `creaciones-primium/controles/` y avisa de lo que no cumple el encargo:
faltan de `index.html` o `styles.css`, archivos de más, metas que no son exactamente una de cada
tipo, falta de `prefers-reduced-motion`, comentarios en el CSS, recursos externos, entidades HTML
dentro de `description-es`, llaves CSS desbalanceadas, sintaxis inválida en `script.js` y
referencias `href`/`src` que apuntan a un archivo inexistente.

```powershell
$dirs = Get-ChildItem 'creaciones-primium\controles' -Directory | Sort-Object Name
$problems = @()
foreach ($d in $dirs) {
  $files = Get-ChildItem $d.FullName -File
  if ($files.Count -lt 2) { continue }
  $names = $files.Name
  if (-not ($names -contains 'index.html')) { $problems += "$($d.Name): sin index.html" }
  if (-not ($names -contains 'styles.css')) { $problems += "$($d.Name): sin styles.css" }
  foreach ($n in $names) { if ($n -notin @('index.html','styles.css','script.js')) { $problems += "$($d.Name): archivo extra $n" } }
  $h = Get-Content "$($d.FullName)\index.html" -Raw
  $c = Get-Content "$($d.FullName)\styles.css" -Raw
  if (([regex]::Matches($h,'<meta name="description"')).Count -ne 1) { $problems += "$($d.Name): description != 1" }
  if (([regex]::Matches($h,'description-es')).Count -ne 1) { $problems += "$($d.Name): description-es != 1" }
  if ($c -notmatch 'prefers-reduced-motion') { $problems += "$($d.Name): sin reduced-motion" }
  if ($c -match '/\*') { $problems += "$($d.Name): comentario en css" }
  if ($c -match '@import|jsdelivr|unpkg|googleapis') { $problems += "$($d.Name): css externo" }
  if ($h -match '@import|jsdelivr|unpkg|googleapis|<img|type="module"') { $problems += "$($d.Name): recurso externo" }
  if ($names -contains 'script.js') {
    node --check "$($d.FullName)\script.js" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { $problems += "$($d.Name): script.js con error de sintaxis" }
  }
  $des = [regex]::Match($h,'description-es" content="([^"]*)"').Groups[1].Value
  if ($des -match '&[a-z]+;') { $problems += "$($d.Name): entidad en description-es" }
  if (([regex]::Matches($c,'\{')).Count -ne ([regex]::Matches($c,'\}')).Count) { $problems += "$($d.Name): llaves desbalanceadas" }
  $refs = [regex]::Matches($h,'(?:href|src)="(?!#|https?:|data:)([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  foreach ($r in $refs) { if (-not (Test-Path (Join-Path $d.FullName $r))) { $problems += "$($d.Name): referencia rota $r" } }
}
if ($problems.Count -eq 0) { 'sin problemas' } else { $problems }
```

Estado actual de esa auditoría: **solo los 3 `script.js` faltantes de la sección 3**. Nada más.

---

## 10. Pasos finales cuando estén los 59

1. Repetir la auditoría de la sección 9 sobre los 59: cero problemas.
2. Pasar el banco a los 59 de una vez y confirmar que todas las líneas dicen `ok`.
3. Regenerar el catálogo de la web para que los controles nuevos aparezcan:

   ```powershell
   node Web/scripts/generate-catalog.mjs
   ```

   (El catálogo actual se generó al principio de la sesión, **antes** de crear estos controles, así
   que está desactualizado respecto a ellos.)
4. Si el usuario lo pide, commitear **solo** las rutas de `creaciones-primium/controles/`, nunca
   con `git add -A`, porque hay cambios de otras sesiones en el working tree.
5. Entregar el informe final que pide el apartado 11 del encargo: los 59 slugs, el modelo de
   presentación de cada uno, el estado de verificación y una línea con el comportamiento físico.
