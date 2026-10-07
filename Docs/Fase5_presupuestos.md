# Fase 5: presupuestos que bloqueen

Fecha: 2026-10-06. Complementa [`Sesion_2026-10-05_06.md`](./Sesion_2026-10-05_06.md)
y [`Presupuestos_rendimiento.md`](./Presupuestos_rendimiento.md).

La idea de la fase: **lo que se midió una vez, se mide siempre**. Ahora mismo el
CI avisa de muchas cosas, pero casi ninguna **corta**: si alguien rompe el
rendimiento, la accesibilidad o el peso del catálogo, el CI lo dice y sigue
adelante. Esta fase convierte las medidas en puertas.

Cada punto tiene su **criterio de terminado**, para que se sepa cuándo está
hecho sin tener que preguntar.

---

## Punto A · Subir el presupuesto móvil de 80 a 85

**Estado: hecho.**

### Qué era

`Web/scripts/validar-lighthouse-movil.mjs` con `UMBRAL = 80`. Se puso en 80
porque el peor valor medido era 84 y un umbral por encima del valor actual
falla desde el primer día.

### Por qué se sube ahora

La Fase 3 lo arregló. Medido **después**:

| Página | Antes | Ahora |
| --- | --- | --- |
| portada | 84-87 | **97** |
| componentes | 96 | **93-97** |
| team core | 97 | 97 |
| privacidad | 99 | 99 |
| legal | 99 | 99-100 |

El peor caso pasó de 84 a 93. Un presupuesto en 80 ya no protege nada: hay 13
puntos de margen, y una regresión de 5 no lo dispara.

### Qué se cambió

`UMBRAL = 80` → `UMBRAL = 85`, y el texto del script y del CHANGELOG
actualizados con la razón.

### Hecho cuando

`npm run validar:lighthouse:movil` sale en verde y `npm run validar:lighthouse`
(escritorio) sigue sin bajar de 95.

---

## Punto B · Que el presupuesto móvil **bloquee** en vez de solo avisar

**Estado: hecho (con una condición).**

### Qué era

En el workflow, el paso de móvil iba con `continue-on-error: true`: informaba
y no cortaba. Motivo: un umbral fluctuante que falla de vez en cuando
enseña a ignorar el CI, y eso es peor que no medir.

### Por qué ahora sí

Porque el margen es grande. La portada va 93-97 y el presupuesto está en 85:
**ocho puntos de margen** sobre el peor valor visto. Con la variación del
preset (±3-5), un fallo real por ruido es improbable.

### Qué se cambió

Se quita `continue-on-error: true`. El paso pasa a ser un check normal, y su
fallo ya bloquea el merge.

### Hecho cuando

Una ejecución del workflow en `main` termina sin `continue-on-error` en ese
paso y con el check en verde.

**Si alguna vez se pone rojo por un ±3 y no hay regresión real**, el arreglo
no es bajar el presupuesto a escondidas: es subir el umbral **a conciencia**,
subiendo antes el de la vista previa para que el cambio quede en el
historial.

---

## Punto C · Presupuesto de CLS (< 0,05)

**Estado: pendiente.**

### Qué es

CLS (Cumulative Layout Shift) mide **cuánto salta el contenido mientras se
carga**. Ya se mide en los dos Lighthouse, y hoy está en **0,006-0,016**, muy
por debajo de 0,1 (el umbral de "bueno" de Google).

### Por qué un presupuesto y no basta con mirarlo

El CLS ya se rompió una vez sin que nadie se enterara: el pie de la página
saltaba de `y=481` a `y=4081` al rellenar la rejilla (0,29 de CLS), y solo se
descubrió al medir el móvil. Un presupuesto lo convierte en un fallo de CI en
lugar de un dato de un informe.

### Qué habría que hacer

1. Un script `validar-cls.mjs` que abra las 5 páginas con Chromium, mida el
   CLS con un `PerformanceObserver` de `layout-shift` y falle si alguna pasa
   de **0,05**.
   - Umbral 0,05 y no 0,1: el margen es real (estamos en 0,016) pero deja
     sitio para que una imagen tarda.
2. Un paso en el CI, en el job de Node 24 (donde ya está Chromium).
3. Documentar el valor actual en el CHANGELOG como línea base.

### Hecho cuando

`npm run validar:cls` existe, las 5 páginas dan 0,006-0,016, y el CI falla si
alguna se pasa de 0,05.

### Ojo con un detalle técnico

Medir CLS con Playwright requiere esperar a que la página se estabilice. La
medición hecha a mano para el arreglo del pie (el CLS de 0,29) salía de un
`PerformanceObserver` con `buffered: true`, que recoge los desplazamientos ya
ocurridos. Si se mide demasiado pronto se leen 0 y el presupuesto no sirve
para nada.

---

## Punto D · Presupuesto del tamaño del catálogo

**Estado: pendiente.**

### Qué es

`Web/data/catalog.json` pesa **707 KB en disco** y transfiere **155 KB** ya
comprimido, en 73 ms. Es el segundo recurso más pesado de la página, después
de `app.js`.

### Por qué vigilarlo aunque hoy no duela

Medido: **no es un cuello de botella ahora** (la página de componentes puntúa
93-97 con 155 KB). El riesgo es de crecimiento: si cada demo nuevo añade
descripciones largas, el catálogo crece sin que nadie se entere. Con 1018
componentes, un aumento del 50% serían 230 KB transferidos y unos 110 ms más.

Un presupuesto de **150 KB transferidos** (comprimido) avisa del problema
**antes** de que se note en el Lighthouse, que es más reactivo pero ya llega
tarde.

### Qué habría que hacer

1. Un script `validar-peso-catalogo.mjs` que mida el `catalog.json` **gzip**
   (que es lo que viaja) y falle si pasa de **150 KB**.
   - Hay que medirlo comprimido de verdad, no el tamaño en disco: son
     707 KB contra 155 KB, y el presupuesto que importa es el segundo.
2. Un paso en el CI, rápido, que puede ir en el job de Node 20 (no necesita
   navegador).
3. Si alguna vez salta, la respuesta documentada es la que ya está analizada
   en `Presupuestos_rendimiento.md`: dividir el catálogo en índice y detalle.
   **No se hace hoy** porque no aporta nada medible.

### Hecho cuando

`npm run validar:peso` falla si el catálogo comprimido pasa de 150 KB.

---

## Punto E · Uptime diario

**Estado: pendiente.**

### Qué es

Un workflow programado (cron) una vez al día que hace un `GET` a
`https://libreria-html-css.vercel.app/` y a las 5 páginas, y falla si alguna
responde distinto de 200 o tarda más de un umbral.

### Por qué

Todo lo demás mide **calidad**; esto mide **disponibilidad**. Hoy, si Vercel
se cae, no hay ninguna señal: los validadores solo corren cuando alguien
commitea, y si nadie commitea nadie se entera.

Es el único punto de esta fase que **no depende del código**: depende de que
la web esté viva.

### Qué habría que hacer

1. `.github/workflows/uptime.yml` con `on: schedule: cron` (una vez al día)
   y `workflow_dispatch` para probarlo a mano.
2. Peticiones con `curl --fail --silent --show-error` y `--max-time` a las 5
   páginas.
3. Que notifique si falla (GitHub avisa por correo con los fallos del
   workflow programado).

### Hecho cuando

El workflow está en `.github/workflows/`, corre a diario y se ha probado a
mano con `workflow_dispatch`.

---

## Lo que esta fase NO va a hacer

- **No poner el presupuesto de móvil en 90** de golpe. El plan de subida
  está en `Presupuestos_rendimiento.md` §6: de uno en uno, con tiempo entre
  medias.
- **No añadir un presupuesto por cada métrica de Lighthouse.** Rendimiento,
  CLS y peso del catálogo cubren lo que se ha rompido de verdad. Un
  presupuesto para cada métrica acaba siendo un presupuesto que nadie lee.
- **No tocar los 1018 demos.** Nada de esta fase los mira; el `validar:demos`
  que ya existe se encarga.

---

## Resumen

| Punto | Qué | Estado | Effort |
| --- | --- | --- | --- |
| A | Presupuesto móvil 80 → 85 | **hecho** | 10 min |
| B | Que el presupuesto móvil bloquee | **hecho** | 5 min |
| C | Presupuesto de CLS < 0,05 | pendiente | 20 min |
| D | Presupuesto del catálogo comprimido < 150 KB | pendiente | 20 min |
| E | Uptime diario | pendiente | 30 min |