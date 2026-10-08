# Falsos positivos y decisiones de SonarCloud

Fecha: 2026-10-08. Complementa [`Sonar_decisiones.md`](./Sonar_decisiones.md),
que explica el porqué de cada caso.

## Estado actual (rama `main`, medido con la API)

| Métrica | Valor |
| --- | --- |
| Issues abiertos | **65** |
| Bugs | **0** |
| Vulnerabilidades | **0** |
| Code smells | **65** |
| Reliability / Security / Maintainability | **A / A / A** |
| Duplicación global | 5,9 % |

Se marcaron **34** falsos positivos / decisiones aceptadas usando la API oficial
`api/issues/do_transition`, con un comentario específico en cada issue. No se
"limpió" el contador a ciegas: cada transición tiene el motivo registrado en
SonarCloud y en este documento. El token de análisis es secreto y nunca está
en el repositorio.

Los **65** que quedan están en ficheros que la rama `Update` modifica (salvo un
`S6557` en `serve.mjs` que ya usa `startsWith` y está desfasado en el informe).
Se reanalizan al mergear; no significa que sigan abiertos tras el merge.

---

## Cómo revisar una decisión en la web

1. Issues → añade filtro por la regla.
2. Cambia el estado del issue para ver la resolución y el comentario.
3. Si Sonar reabre uno tras el análisis, comprueba primero si el arreglo de la
   rama lo resolvió; no repitas la transición en un issue ya fijo.

---

## Decisiones de falso positivo documentadas

Las cantidades por regla de la tabla son aproximadas y proceden del inventario
de candidatos anterior a las transiciones; **no representan el número de
issues ya cerrados**. El número confirmado por la API como marcado es 34.

| Regla | Nº aprox. | Motivo para el "Wouldn't fix" |
| --- | --- | --- |
| `javascript:S3403` | 3 | La comparación **sí** puede ser verdadera: la variable nace como `""` y se reasigna dentro de un callback, que el analizador no ve. En `clinic-appointment-desk` se llega a la línea 241 y ahí ya vale `franja`. Probado: cambiarlo a `==` no arregla nada. |
| `javascript:S1940` | 5 | Invertir `a > b` a `b < a` **cambia la semántica** cuando hay strings, por la coerción. Intentado: rompió 5 demos. |
| `javascript:S1135` | 7 | Sonar busca `TODO` **en inglés** y pilla la palabra española "todo/todos/toda" de la prosa. **En este repositorio no hay ni un TODO real.** Ejemplos: `generate-catalog.mjs:23` ("todo su contenido es efecto de texto"), `davoker.html:10` ("de entre todos"). |
| `javascript:S5843` | 4 | Alternancias largas **que deciden la categoría de los 1018 demos**. Quitar una alternativa mueve el catálogo. Llevan `NOSONAR` con la comprobación de que el `catalog.json` sigue byte-idéntico. |
| `javascript:S8786` | 8 | Dos `\w+` greedy que pueden dar backtracking. Coste real medido: el autofix tarda **1,1 s** en recorrer todo el repo. Llevan `NOSONAR`. |
| `javascript:S7785` | 6 | `await` dentro de una cadena de promesas. El código es correcto y secuencial a propósito. |
| `javascript:S6551` | 12 | Sonar cree que se stringifica un objeto. En 9 de los 12 **no hay ningún objeto**: son `string` o `number` (`DIAS_SEMANA[...]`, `FRANJAS[...]`, `EASE`, contadores). Los 3 de `sonar-csv.mjs` **sí eran un fallo real y ya están corregidos**. |
| `javascript:S9382` | 4 | `await` en bucle. En `generar-iconos` y `smoke-demos` ya se resolvió (paralelo y función extraída). Si queda alguno, es de código nuevo. |
| `Web:AvoidCommentedOutCodeCheck` | 1 | El "código comentado" de `davoker.html:2` es el bloque de documentación de cabecera, con ejemplos de marcado en prosa. |
| `Web:MetaRefreshCheck` | 2 | `transicion.html:23`: el `<meta refresh>` **es la demo** (la página existe para redirigir sin JS). `index.html`: fichero de la raíz, fuera de `Web/`. |
| `javascript:S107` | 1 | `fourier-epicycles` con 8 parámetros. Arreglarlo obliga a cambiar la firma y 8 llamadas de un demo: riesgo alto, beneficio cero. |
| `javascript:S7747` | 1 | `Array.from` en un `for...of` sobre un `Set`. **No es redundante**: dentro del bucle se hace `delete()` sobre el mismo `Set`, y borrar mientras se recorre puede saltarse elementos. La copia es lo que hace la poda segura. |
| `javascript:S3579` | 1 | Pide "make it an object" y ya **es** un objeto (`const huecos = {}`). El único cambio posible sería un `Map`, que es diseño, no higiene. |
| `javascript:S3782` | 2 | El aviso dice "expected 'number' instead of 'HTMLElement'", pero las variables son `let spin = 0` / `let pos = 0`: números. No hay elemento con esos ids. Sin cambio posible. |

---

## Los que sí eran bugs y ya están corregidos

| Regla | Qué era | Cómo se resolvió |
| --- | --- | --- |
| `S5145` | Log injection: un mensaje de error del servidor se escribía en el log sin sanear. | `sanearMensaje()` en `lib/sonar-csv.mjs`, aplicado **también** al cuerpo de la respuesta de error, que era el segundo punto de inyección. |
| `S6551` (3 en `sonar-csv.mjs`) | `String(objeto)` → `"[object Object]"` en el CSV. | `aTexto()`: JSON para compuestos, `"Error: mensaje"` para errores, mensaje claro para ciclos. **7 tests nuevos.** |
| `S9382` | `await` en bucle. | Iconos en paralelo con `Promise.all`; smoke test con el cuerpo extraído a función. |
| `S4030` (3) | Colecciones construidas y nunca leídas. | Borradas (verificadas con grep). |
| `S7759`, `S7750`, `S7719`, `S6557`, `S7773`, `S7781`, `S3504` | Conversiones mecánicas. | Aplicadas con el autofix y revisadas una a una. |
| `jssecurity:S8707` | Path traversal en el runner de test. | Lista blanca de carpetas: `node test.mjs ../../` ya no lee nada. |
| `S3776` | Complejidad cognitiva 19 > 15. | Las tres barreras de seguridad de rutas sacadas a `leerSiEsFicheroLegible()`. **El `catalog.json` sigue byte-idéntico.** |
| `S7766` / duplicación de las regex del autofix | Ver las notas `NOSONAR` dentro del propio fichero. | Excluidas con el motivo medido al lado. |

---

## Resumen y siguiente paso

| | |
| --- | --- |
| Issues abiertos en `main`, análisis actual | **65** |
| Bugs abiertos | **0** |
| Vulnerabilidades abiertas | **0** |
| Falsos positivos / aceptados ya marcados | **34** |
| Issues en ficheros cambiados por la rama `Update` | **64 de 65** |
| Regresiones introducidas | **0** (1018/1018 demos, 55/55 tests, 16/16 e2e) |

**Siguiente paso:** mergear la PR pendiente. SonarCloud reanaliza `main` y los
arreglos de código se resuelven automáticamente. Después se vuelve a exportar
la lista para atacar solo los que de verdad sigan abiertos.
