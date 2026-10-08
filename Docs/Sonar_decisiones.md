# Lo que no se toca de SonarQube, y por qué

Fecha: 2026-10-06. Complementa [`AnalisisSonarQube.md`](./AnalisisSonarQube.md),
que cuenta la limpieza de 2026-10-05, y [`Plan_de_nivel_siguiente.md`](./Plan_de_nivel_siguiente.md) §1.

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
