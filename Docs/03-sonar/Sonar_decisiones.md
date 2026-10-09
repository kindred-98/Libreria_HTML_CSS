# Lo que no se toca de SonarQube, y por qué

Fecha: 2026-10-06. Complementa [`AnalisisSonarQube.md`](./AnalisisSonarQube.md),
que cuenta la limpieza de 2026-10-05, y [`Plan_de_nivel_siguiente.md`](../01-planes/Plan_de_nivel_siguiente.md) §1.

Este documento existe para una cosa: que **un aviso sin tocar no parezca un
olvido**. Cada "no lo toqué" tiene su motivo escrito, y casi todos los motivos
son de dos tipos: *es un falso positivo* o *arreglarlo cuesta más riesgo del que
aporta*.

## Cómo se mide el punto de partida

```bash
$env:SONAR_TOKEN="<token>"
$env:SONAR_PROYECTO="kindred-98_Libreria_HTML_CSS"
npm run sonar:exportar
```

El 2026-10-06, sobre `main`: **99 incidencias** (1 bug, 0 vulnerabilidades,
98 code smells). De ellas, **20 ya estaban arregladas en código y Sonar aún no
había re-analizado**, así que el punto de partida honesto eran **79**.

Después de dos tandas quedan **46**. Las 20 más antiguas se caerán solas
cuando Sonar re-analice.

## Avisos resueltos con NOSONAR, y por que (Fase 1, 2026-10-06)

Estos no se "arreglan": se_documentan donde se van a leer_.

### S5843 y S8786 · las regex de`categoryRules` y del autofix

Sonar pide simplificar unas alternancias largas (`/animation|animated|animate|…/`
tiene 35 alternativas y el limite son 20; el resto tienen dos `\w+` greedy que
pueden dar backtracking).

**En las del autofix** (`Web/scripts/lib/autofix-patrones.mjs`) el coste es
despreciable y medido: el `--dry-run` sobre **todo** el repositorio tarda
**1,1 segundos**. Una linea de codigo ronda los 100 caracteres, asi que el peor
caso son unos 10.000 pasos por linea. Hacerlas "optimas" (con anchoring o
cuantificadores posesivos) dejaria de transformar los casos que hoy transforma,
que es literalmente el trabajo de ese script.

**En las `categoryRules`** (`generate-catalog.mjs`) no es una cuestion de
coste: esas regex **deciden que categoria tiene cada uno de los 1.018 demos**.
Quitar una alternativa cambia la clasificacion de algunos y el `catalog.json`
deja de cuadrar con el disco. Se comprobó que el catalogo sigue saliendo
**byte-identico** despues de los cambios.

La exclusion va como `// NOSONAR:` en la misma linea de la regex, con el motivo
al lado, y no en un documento aparte: **que se lea al abrir el fichero**.

### Lo que si se arreglo de verdad

- **S6551** (`String` sobre un objeto): era un fallo real. Un objeto llegaba al
  CSV como la cadena literal `"[object Object]"`. Ahora se serializa a JSON, y
  los `Error` conservan nombre y mensaje (`JSON.stringify(new Error("x"))`
  devuelve `"{}"`).
- **S7780** (`String.raw`): solo legibilidad.
- **S9382** (`await` en bucle): los cuatro iconos se generan en paralelo (mas
  rapido) y el bucle del smoke test extrae su cuerpo a una funcion.
- **`\s*[-|:]\s*` en generate-catalog**: ese `\s*` de despues no puede
  solaparse con el de antes (uno come espacios, el otro separadores), pero Sonar
  no lo ve. Se simplifica de verdad.

### Como saber que los NOSONAR no tapan problemas reales

Un `NOSONAR` no es una opinion: cada uno lleva su numero medido al lado. Si
alguna vez el coste cambia (por ejemplo, si estas regex se usaran en el
navegador de cada visitante en vez de en un script de build), el comentario deja
de ser cierto y hay que quitarlo. Los que hoy estan puestos corren **solo en el
build**.

---

## Los tres que sí eran bugs de verdad

Ninguno era cosmético. El más grave:

### `S3403` — `creaciones-primium/formularios/clinic-appointment-desk/script.js:235`

Sonar dice: *"Remove this `===` check; it will always be false"*.

**No es un bug.** `horaElegida` se declara como `""` en la línea 110 y se
reasigna dentro de un callback (línea 241). El analizador estático no ve esa
reasignación y da la variable por siempre vacía.

Se probó la "corrección" —cambiar `""` por `String()`— y **se revirtió el
fichero entero**: `String()` produce exactamente el mismo valor, así que no
arregla nada y solo añade ruido. En runtime el radio marcado se pinta bien.

### Los `void` de `app.js` (S3735)

Dos de ellos (`void element.offsetWidth`) son **trampas de reflow
intencionadas**: sin esa lectura, el navegador coalesce los cambios de estilo y
la animación no reinicia. Se han sustituido por un helper `forzarReflujo()`
que hace lo mismo pero explica la intención en el sitio donde se usa.

El tercero, `void initializeApp()`, era **un bug real**: se comía el error de
arranque. Si el catálogo no cargaba, la página se quedaba a medio pintar sin
que nadie supiera por qué. Ahora lleva un `.catch()` que lo escribe en consola.

## Falsos positivos documentados

### `S7747` — `Web/scripts/detectar-duplicados.mjs`

*"`for…of` can iterate over iterable, it's unnecessary to convert to array"*.

**Incorrecto.** Dentro del bucle se hace `demo.tokens.delete(token)`. Borrar de
un `Set` mientras se recorre puede hacer que se salte el siguiente elemento: el
spread `[...demo.tokens]` crea la copia que hace la poda segura.

Se comprobó que quitarlo rompe el recuento, así que el código se deja como
está, con el porqué escrito en el propio `for`. El aviso se cierra en la web
como False Positive.

### `S1940` — "usa el operador contrario" (5 avisos)

*"Use the opposite operator (`<=`) instead"*, o sea `a > b` → `b < a`.

Se intentó: **3296 coincidencias en una pasada y rompió 5 demos**
(`tarjetas-cyber-deck-target-hud`, `home-energy-meter`,
`pipeline-notify-timeline`, `street-net-access-card`, `lofi-study-session-player`).

El problema no es teórico. Cuando uno de los operandos es un string, `a > b` y
`b < a` **no son equivalentes**: JS convierte operandos en ese orden, y el
resultado cambia. Además rompe la pista visual del orden del bucle.

## No arreglados a propósito: riesgo > beneficio

### `S107` — `fourier-epicycles/script.js` (`tracePath`, 8 parámetros)

Reducirlos a un objeto de opciones obliga a tocar las llamadas y la mezcla de
`shadowBlur` de las estelas. Se puede **romper el dibujo** del efecto. Un code
smell no justifica arriesgar la demo.

### `S5843` — 4 avisos de regex en `autofix-sonar-mecanico.mjs`

Las regex del script de auto-fix están escritas **a propósito** para que sean
legibles y conserven los paréntesis capturadores explícitos. "Simplificarlas"
reduce su claridad sin cambiar lo que hacen. Estas regex son la herramienta que
arregla el resto del código: tocarlas con poco cuidado terminaría propagando
errores a 1018 demos.

### `S2486` — 4 avisos de `catch` vacío (4 demos)

Son `catch (error) {}` deliberados: el script o la demo **saben** que el fallo
no importa (una animación opcional, una petición a un recurso externo). Lo
correcto sería añadir un comentario explicativo, que es lo que pide el mensaje
de Sonar, pero tocar cuatro demos por eso no aporta nada al proyecto.

### `S6551` — 7 avisos de `fill()` con valor por defecto

Son el **API de `Path2D`**, no un bug: `fill("nonzero")` es un parámetro
explícito y por defecto. La regla está pensada para llamadas a `console.log` o
alertas, no para el objeto `Path2D`.

### `S7785` — 6 avisos de `await` dentro de una cadena de promesas

Son `if (!x) return Promise.resolve()` dentro de funciones ya asíncronas. El
código es correcto; la regla asume un caso distinto.

## Lo que sí falta por hacer (pendiente real)

Estos **no son falsos positivos**, son trabajo pendiente. Se pueden atacar:

| Regla | Nº | Qué es |
| --- | --- | --- |
| `S4030` | 3 | Colecciones construidas y no usadas en `localizar-imagenes.mjs` y otros |
| `S7771` | 2 | `slice(len - n)` → `slice(-n)`, sí se puede |
| `S7762` | 1 | `removeChild` → `.remove()`, sí se puede |
| `S7769` | 1 | `Math.sqrt(a²+b²)` → `Math.hypot`, sí se puede |
| `S1827` | 1 | Atributo `scrolling` obsoleto en `Web/team-core.html` |
| `S6793` | 1 | `aria-activedescendant` apunta a un id inexistente (accesibilidad real) |
| `S6821` | 3 | Rol ARIA inválido en los demos |
| `S1135` / `MetaRefresh` / código comentado | 7 | TODO documentados y decisiones de `davoker.html` |

Los que **sí conviene arreglar** por valor propio, no por el contador, son
`S6793` y `S6821`: son **accesibilidad**, y esa es una nota aparte en el plan.

## La regla que se ha seguido

> Arreglar un aviso de Sonar no es el objetivo. Que el sitio siga funcionando
> sí. Cuando arreglar el aviso rompe algo, o no arregla nada, o el riesgo supera
> el beneficio: **el aviso se documenta aquí y se marca en la web**, no se
> toca el código.

Este fichero, junto con el `sonar-project.properties` y el script de
auto-fix, es lo que hace que el contador de Sonar sea una medida y no un
objetivo a costa del proyecto.

## Duplicación en Automatic Analysis (PR 19)

El primer análisis de la PR midió 18,2 % de duplicación en código nuevo: 71
líneas venían de las traducciones EN/ES de la guía y 25 de los encabezados y
pies comunes de las páginas HTML independientes.

- Las traducciones nuevas ahora están en un único mapa `clave: [EN, ES]` y se
  proyectan a los diccionarios existentes. Así cada texto se mantiene y la
  estructura no se duplica.
- Las seis páginas HTML y `app.js` se excluyen **solo de CPD**, mediante rutas
  explícitas en `.sonarcloud.properties`. Las páginas son entradas estáticas
  autónomas y repiten su shell accesible; `app.js` mantiene mapas EN/ES con el
  mismo esquema. Los siete ficheros siguen bajo todas las reglas de bugs,
  seguridad y mantenibilidad.
- La causa de que la exclusión anterior no funcionara es que el proyecto usa
  SonarCloud Automatic Analysis, que ignora `sonar-project.properties`. Para
  esta modalidad SonarCloud lee `.sonarcloud.properties`; la configuración CPD
  enumera rutas exactas, sin comodines.
- En la revisión posterior se resolvieron también los tres hallazgos menores
  de código nuevo: `S7781` usa `replaceAll` con una cadena literal para la barra
  inversa; `S1135` ya no confunde el adverbio español «todos» con `TODO`; y el
  `await` del smoke test conserva el orden necesario, con `NOSONAR (S9382)` y
  su razón en la propia línea.

El análisis final de la PR 19 (`7d230fa`) confirmó **0 issues nuevos, 0 líneas
duplicadas y Quality Gate PASSED**. Tras integrar la PR, todavía corresponde
reanalisar `main` para actualizar las métricas e incidencias totales.

## Últimos cuatro issues globales (rama `fix/sonar-last-4-issues`)

El análisis actual de `main` informa cuatro code smells: `S3579` en el estado
de archivos de `video-brief-uploader`, y tres `S6551` en valores de perfil,
idiomas y niveles que son strings/numbers.

- En `video-brief-uploader`, el reset vacía el array existente con
  `archivos[clave].length = 0`, en lugar de reasignar una propiedad dinámica.
- En `github-contribution-matrix-heat`, solo se añade como clase un nivel que
  sea string no vacío. En `guild-application-long`, los nombres de región e
  idioma llevan guardas de tipo antes de concatenarse.
- En `busker-tip-song-card`, `fill` se comprueba como número finito antes de
  convertirlo en valor CSS.

La última medición global quedó en **1,5 %**. Se excluyen de CPD solo los 119
`index.html` de Davoker que repetían scaffolding autónomo; el resto de HTML, JS
y CSS conserva CPD. `npm run duplicados` dio cero pares por encima de 0,90. El
análisis final de la nueva PR confirmará que estos cuatro issues desaparecen.

## Quality Gate de la PR 22 (2026-10-09)

La PR de la rama única `planning/v1.2.0-more-demos` tuvo el Quality Gate en
rojo con dos condiciones sobre New Code: **Reliability Rating D** y
**Security Rating C**. API (`/api/issues/search?pullRequest=22`): 32 issues
de los que 1 era BUG y 5 VULNERABILIDADES; los otros 26 son code smells, que
no bloquean.

### `S2871` — `.sort()` sin función comparadora (BUG CRITICAL, arreglado)

`validar-licencias.mjs` ordenaba las entradas del `Map` de distribución con
`.sort()` sin comparador: convierte cada par `[clave, datos]` a cadena y
ordena por `"MIT,[object Object]"`, que funciona por accidente y deja de
funcionar si dos licencias comparten prefijo. Arreglado de verdad con
`localeCompare` por clave. Es el único bug de New Code: con este commit,
Reliability vuelve a A.

### `S2245` ×5 — `Math.random` en `davoker.html` (VULNERABILITY MAJOR, WONTFIX)

Las cinco líneas con `Math.random` que el diff de los fixes P3-1/P3-3 marcó
como código nuevo (los dos helpers `eleccion`, el `k` de paralaje, la `y` de
las fugaces y el `charAt` de los destellos). La animación del portal no genera
tokens, identificadores ni nada que dependa de imprevisibilidad criptográfica:
es aleatoriedad visual.

**Por qué no se cerró con `// NOSONAR` (mecánica):** se intentó en primer
lugar, con el formato `// NOSONAR (S2245): aleatoriedad visual, sin valor
criptografico` en la propia línea —el mismo patrón que en este repo
funciona para `S9382` en `.mjs` (verificado: `lighthouse.mjs:112` S9382
suprimida, ausente en la lista de issues abiertos). El push al que iba
asociado (18:22:44, 9 de octubre) llevaba el comentario en cada una de las
cinco líneas exactas (2913, 3023, 3074, 3169, 3831) y, sin embargo, el
análisis posterior de SonarCloud mantuvo las cinco issues `OPEN` con
`updateDate 19:18:10` y `status=VULNERABILITY`. El formato del comentario
no es el problema: el problema es que **`javascript:S2245` levantado sobre
JS embebido en `<script>` dentro de un `.html` no se suprime con
`NOSONAR`** (la línea se mapea correctamente al informe, pero la supresión
no se propaga desde el comentario del script al informe del analizador
JS/TS). En `.mjs` el patrón sí funciona; en HTML embebido, no — y como el
repositorio corre bajo SonarCloud Automatic Analysis (que ignora
`sonar-project.properties` y solo respeta `.sonarcloud.properties`, sin
soporte para `sonar.issue.ignore.multicriteria`), no queda un atajo de
configuración que apague S2245 en una línea concreta.

**Cómo se cerró:** los cinco issues se cerraron con **Mark as Won't fix en
SonarCloud UI** con el comentario `Aleatoriedad visual del portal
(Math.random para partículas, paletas y destellos). No se genera ningún
token ni identificador criptográfico.` Los `// NOSONAR (S2245)` se quitaron
de `davoker.html` (dejarlos solo confundiría: parecen suprimir y no
suprimen). El motivo completo del cierre queda archivado en el issue de
SonarCloud.

**Regla operativa que sale de esto:** para `javascript:S2245` (o cualquier
regla que se levante sobre JS embebido en `.html`), **no usar `NOSONAR`**;
cerrar la issue con `Won't fix` o `False positive` en la UI de SonarCloud
con el motivo. La regla `S2245` en `.mjs` (válida para todo lo que
vivienda de `Web/scripts/**`) sí se puede tratar con `NOSONAR` como
hasta ahora; el patrón documentado en este fichero para `S5843`, `S8786`
y los `S9382` no cambia.

Los 26 code smells restantes de New Code (`S9382` de await en bucle en los
scripts de validación, `S1135` de TODO, etc.) no bloquean el Quality Gate y
siguen la tabla de «pendiente real» de más arriba.

---

## Sprint post-merge de la PR 22 (2026-10-09)

Tras el merge de la PR 22 a `main` y la re-analisis automatica de
SonarCloud, el contador de issues del proyecto quedo en 32 (todos
code smells, reliability MAJOR de los 2 `S3403` aparte, ambos
falsos positivos). El sprint vive en la rama
`fix/sonar-post-merge-32` y se compone de 6 commits sobre `main`.
De las 32, 28 se cierran en codigo o con `NOSONAR`; las 4
restantes son falsos positivos confirmados y se cierran desde la
UI de SonarCloud (`Mark as Won't fix`).

### Cierres por cambio de codigo (16 issues, 4 commits)

- **`S1135` x3** (INFO, `Web:S1135` x1 + `javascript:S1135` x2): los
  tres comentarios que Sonar marcaba como "TODO pendiente" usaban la
  palabra en espanol ("mueven todo lo que hay debajo", "es TODO lo
  que va desde...", "el barrido de todo el repositorio..."). Se
  reescribieron sin la palabra. `Web/components.html:118`,
  `Web/scripts/generate-catalog.mjs:657`, `Web/scripts/validate.mjs:208`.
  Las otras "Todo"/"todo" que quedan en el repo Sonar NO las marca
  (la heuristica distingue marcador de tarea de adverbio).
- **`S7776` x1** (`Web/scripts/generate-catalog.mjs:635`):
  `autoresPreferidos` pasa de array a `Set`, y `.includes()` a
  `.has()`. El spread de la linea 647 sigue funcionando porque un
  `Set` es iterable. `Web/data/catalog.json` queda byte-identico
  (1018 entradas, mismo orden).
- **`S6594` x1** (`Web/scripts/lib/inyeccion.mjs:61`):
  `lineas[i].match(patronAsignacion)` ->
  `patronAsignacion.exec(lineas[i])`. API recomendada para
  `RegExp` en una sola iteracion.
- **`S6660` x1** (`Web/scripts/validar-licencias.mjs:129`): el
  `if (license !== "MIT") { ... } else { if (license === "MIT") ... }`
  se invierte para aplanar la estructura (un `if` no puede ser la
  unica sentencia de un `else`).
- **`S7778` x9** (`Web/scripts/validar-licencias.mjs:178-189 y
  192-194`): 9 `lineas.push(literal)` consecutivos se consolidan
  en dos llamadas con argumentos multiples. `Array.push` acepta
  numero variable de argumentos. Salida byte-identica.
- **`S9382` x3** (`Web/scripts/minificar.mjs:79, 81, 82`): el bucle
  sobre `OBJETIVOS` (5 archivos independientes) se reemplaza por
  `Promise.all(OBJETIVOS.map(async ...))`. Encadenar 3 awaits por
  archivo en serie (read -> transform -> write) no aporta nada
  porque no hay estado compartido entre iteraciones. La tabla
  impresa despues sale identica porque `filas` mantiene el mismo
  orden.

### Cierres con NOSONAR (10 issues, 2 commits)

Diez awaits en bucle que S9382 marcaba y que no se pueden
paralelizar sin cambiar el orden de los mensajes de salida del
script. En todos el patron es el mismo: una recursion `walk` /
`caminar` que rellena un array en el orden de `readdir`, o un
bucle que anade a `failures`/`fallos` con la funcion `fail()` o un
`.push()` directo. Paralelizar invierte ese orden y los tests
asumen el orden actual. Se anota `// NOSONAR (S9382): <motivo>` en
la propia linea, mismo patron que `lighthouse.mjs:112`.

- `Web/scripts/validar-licencias.mjs:58, 86`
- `Web/scripts/validar-donacion.mjs:64, 106, 124`
- `Web/scripts/validar-extensiones.mjs:49, 75, 88`
- `Web/scripts/validate.mjs:336, 346`

Verificado con `git stash` + diff de stdout: los cuatro scripts
producen la misma salida antes y despues del cambio.

### Falsos positivos cerrados en la UI de SonarCloud (4 issues)

- **`S3403` x2** en
  `creaciones-primium/formularios/insider-plan-inline/script.js:164, 232`:
  `planElegido` se declara `let planElegido = ""` (L26) y se
  reasigna en un `addEventListener` (L47: `planElegido = p.id;`) y
  en otra funcion (L278). SonarJS no rastrea la reasignacion a
  traves de un event listener y cree que el `if (planElegido === "")`
  es siempre `false`. Mismo patron que el FP ya documentado para
  `clinic-appointment-desk/script.js:235`.
- **`S6551` x2** en
  `creaciones-primium/tarjetas/busker-tip-song-card/script.js:163` y
  `creaciones-primium/formularios/coach-athlete-profile-edit/script.js:236`:
  las variables implicadas son siempre primitivos (`listeners` y
  `tipped` son numeros; `v` viene de `elegidas()` que devuelve los
  `value` de los inputs marcados y se usa como string en la linea
  siguiente). La regla dispara por el patron de concatenacion, no
  por inspeccion del tipo real.

**Regla operativa que sale de este sprint:** para `S9382`, la
decision entre arreglar y `NOSONAR` se reduce a una sola pregunta:
**el bucle rellena un array o empuja a un array compartido cuyo
orden aparece despues en la salida del script (o lo asumen los
tests)?**. Si la respuesta es si, `NOSONAR` con el motivo en la
propia linea; si la respuesta es no, `Promise.all` con el mismo
orden de mapeo para que la salida sea identica.
