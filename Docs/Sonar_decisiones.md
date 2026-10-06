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