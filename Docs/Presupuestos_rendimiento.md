# Presupuestos de rendimiento, y por qué el móvil mide 84

Fecha: 2026-10-06. Complementa [`Sesion_2026-10-05_06.md`](./Sesion_2026-10-05_06.md)
§7 (lo que queda de la Fase 3).

Este documento recoge **qué se midió**, **qué NO se hizo aunque sonara
obvio**, y el plan de dos pasos para que la mejora de hoy no se pueda
revertir en silencio.

---

## 1. Lo que hay hoy en móvil

Medido con el preset móvil de Lighthouse (CPU ×4 y red estrangulada), **dos
pasadas por página** porque la variacion entre ejecuciones es real:

| Página | Pasadas | Peor caso |
| --- | --- | --- |
| portada | 87 / 84 | **84** |
| componentes | 96 / 96 | 96 |
| team core | 97 / 97 | 97 |
| privacidad | 99 / 99 | 99 |
| legal | 99 / 99 | 99 |

Una medición suelta daría un número, y con la variacion que tiene este preset
no serviría para decidir nada. Por eso dos pasadas y se mira el **peor caso**.

**El número que manda es el 84 de la portada.** Las otras cuatro van 96-100.

En escritorio, las mismas cinco páginas dan **99-100** en las cuatro
categorías: el escritorio está resuelto y el móvil es lo que queda.

---

## 2. Lo que se midio y resulto que NO era el problema

### `catalog.json` no es el cuello de botella

Se veian 707 KB y la conclusión obvia era partirlo en un índice ligero
más un detalle bajo demanda. **Medido antes de hacerlo, la idea se cayó sola:**

| | Medido |
| --- | --- |
| Transferido | **155 KB** (los 707 KB van comprimidos) |
| Tiempo de red | **73 ms** |
| `parseHTML` de toda la página | 62 ms |
| Puntuación actual de `componentes` | **96**, TBT 100-150 ms |

Partirlo habría significado escribir código nuevo, tocar el generador de
catálogo y el validador que comprueba que el catálogo cuadra con el disco, para
ganar unos 30 ms en una página que ya está en 96. **Eso no es una mejora, es
riesgo.**

### Dónde está el coste de verdad (perfil de CPU con CDP `Profiler`)

| Función | CPU real | Con la lentitud ×4 |
| --- | --- | --- |
| `renderFeaturedComponents` (portada) | 137 ms | ~500 ms |
| `applyTypewriterMetrics` (portada) | 71 ms | ~280 ms |
| `renderMarquee` (componentes) | 47 ms | ~190 ms |
| `renderComponents` (componentes) | 32 ms | ~130 ms |

Las auditorías agregadas de Lighthouse dicen *cuánto* se gasta pero no *en
qué*; el perfil de CPU sí. Con el perfil, las dos funciones de la portada
eran casi todo el coste, y las dos están arregladas.

---

## 3. Lo que ya se arregló

1. **El carrusel de destacados** construye **33 tarjetas** (29 + 4 repetidas)
   cada una con su iframe, en el arranque. Se aplaza con
   `requestIdleCallback` y un techo de 1200 ms, para que no dependa de que el
   navegador llegue a estar libre. No toca el LCP porque el carrusel está
   **debajo** del hero.
2. **La máquina de escribir** leía `scrollWidth` (que fuerza un recálculo de
   layout) después de escribir tres estilos, por cada elemento. Ahora escribe
   todas las propiedades de todos los elementos y después las lee todas.

Efecto: **portada de 77 a 84-87**, con el TBT de 970 ms a 460-510 ms.

---

## 4. Lo que NO se tocó, y por qué

### El ancho de la máquina de escribir mide mal, pero arreglarlo es visual

Al medir salió esto: el código calcula el ancho con
`element.scrollWidth + 3` sobre un elemento **que se está animando**. El
resultado es **214 px**, mientras que el texto real mide del orden de **490 px**.

Es decir: mide el ancho animado en ese instante, no el del texto completo. La
fuente **sí** es monoespaciada (donde `1ch` es el ancho exacto de un carácter),
así que la solución sería poner `--type-width: <n>ch` en CSS y **no medir nada
en JavaScript**: cero coste y más exacto que ahora.

**No se ha hecho** porque cambia el ancho de la animación. Es un cambio
**visual** y la comprobación sería "mira si sigue pareciendo una máquina de
escribir", que no es una comprobación automática. Ganar 70 ms no compensa
arriesgar que el efecto se vea mal en la portada, que es lo primero que ve
cualquiera.

Queda anotado aquí para hacerlo con calma y con ojos encima.

### El `header` repetido, y el resto de exclusiones

Nada de esto afecta al rendimiento móvil; está en
[`Sonar_decisiones.md`](./Sonar_decisiones.md).

---

## 5. Paso 1 — el presupuesto en 80 (hecho)

### Qué es

Un paso nuevo de CI, `npm run validar:lighthouse:movil`, que mide las cinco
páginas con el **preset móvil** y falla si alguna baja de **80**.

`validar-lighthouse` ya existía, pero medía con el preset **desktop**, que va
sobrado (99-100) y **no ve** lo que sufre alguien con un teléfono. Sin
medirlo, una regresión en móvil se cuela sin que nadie se entere.

### Por qué 80 y no 85

**Un presupuesto va por debajo del valor actual, nunca por encima.** Con la
portada en 84 y fluctuando ±3-5 puntos, un umbral de 85 fallaría en la mitad
de las ejecuciones.

El 80 deja:

- **4 puntos** de margen sobre el peor valor visto (84): la variación normal
  no lo dispara.
- **7 puntos** por debajo de donde debería llegar la portada (91): dos
  regresiones de 3-4 puntos seguidas tampoco lo disparan.
- Sigue saltando si alguien mete una regresión **de verdad**.

### Por qué NO bloquea todavía

Va con `continue-on-error: true` en el workflow: **informa y avisa, no
bloquea**.

Motivo: un umbral fluctuante que falla de vez en cuando enseña a ignorar el
CI, y eso es peor que no medir nada. El día que el CI se pone rojo un martes
por un ±3, nadie vuelve a mirarlo.

---

## 6. Paso 2 — subir el umbral y hacerlo obligatorio

Cuando se cumpla **lo siguiente**:

- La portada esté de forma estable por encima de 90 en móvil (hoy: 84-87).
- Haya **dos o tres semanas seguidas** sin una sola ejecución en rojo.

### Qué se hace, en este orden

| Momento | Acción | Por qué |
| --- | --- | --- |
| La portada llegue a **90** estável | Subir el presupuesto de 80 a **85** | Margen de 5 puntos sobre un valor ya alto |
| Dos semanas en verde con 85 | Subir de 85 a **88** | follows the leader |
| Dos semanas en verde con 88 | **Quitar `continue-on-error`** y subir a **90** | Ya es una red fiable: salta solo ante regresiones reales |
| Dos semanas obligatorias en verde | Subir a **92** | El techo razonable sin dwell |

El presupuesto se sube **de uno en uno**, con tiempo entre medias. Subirlo de
 golpe a 95 sin que nada lo respalde es exactamente el error de ponerlo en 85
ayer.

### Cómo se sabe que toca subirlo

El propio script lo dice al terminar, y el workflow deja el paso en el log:

```
Las 5 paginas por encima de 80. El presupuesto se sube cuando el margen
sea holgado (ver Docs/Presupuestos_rendimiento.md).
```

Se sube cuando el **peor caso** de la portada en dos pasadas seguidas quede
por encima del umbral **más dos puntos**. Es un criterio objetivo, no una
sensación.

### Por qué este esquema y no "un presupuesto alto desde el principio"

Un presupuesto es una **red contra la regresión**, no una meta. Si empieza
alto, nunca salta. Si empieza demasiado bajo, salta siempre y nadie lo lee.
El valor útil es el que:

1. Está **por debajo** de donde estás, con margen para el ruido.
2. **Sube** cuando el trabajo lo justifica.
3. **Termina bloqueando**, porque una red que avisa y no frena es un informe,
   no una red.

---

## 7. Cómo reproducir las mediciones

```bash
npm run validar:lighthouse          # escritorio (obligatorio en el CI)
npm run validar:lighthouse:movil    # movil, presupuesto 80 (informativo)
```

Las dos levantan el sitio con `serve.mjs` sobre un puerto libre y abren
Chromium, así que no hay nada que configurar ni despliegue de por medio.