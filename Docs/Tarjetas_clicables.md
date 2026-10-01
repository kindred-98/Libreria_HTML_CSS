# Tarjetas clicables: abrir el detalle desde cualquier punto

Fecha: 2026-10-01. Fase 0 del [`Plan_de_fases.md`](./Plan_de_fases.md).

## Qué se pedía

Hasta ahora el detalle de un componente solo se abría desde el botón
**View component** / **Ver componente** de la tarjeta. Quería que el click en
cualquier parte de la tarjeta abriera también el detalle.

## Qué cambió

Dos ficheros, sin tocar el catálogo ni el resto de la lógica:

| Fichero | Cambio |
|---|---|
| `Web/scripts/app.js` | Función auxiliar `navigateToComponent` (línea 779) y la tarjeta ahora escucha el click (línea 826) y el teclado (línea 830) |
| `Web/styles/site.css` | `.component-card` con `cursor: pointer` (línea 1183) y `.component-card:focus-visible` (línea 1186) |

## Cómo funciona

Antes, la navegación vivía dentro del manejador de click del enlace. Ahora está
sacada a `navigateToComponent(component, event)`, que es la misma para los dos
caminos:

```js
function navigateToComponent(component, event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.history.pushState({}, "", componentDetailUrl(component.id));
  renderRoute();
  window.scrollTo({ top: 0, behavior: "auto" });
}
```

Las guardas de la segunda línea son las mismas que tenía el enlace: solo click
izquierdo simple, sin modificadores. Así el `pushState` no se dispara dos veces
ni se pisa con un cmd+click.

La tarjeta entera, además:

- Lleva `role="link"` y `tabindex="0"`, para que el lector de pantalla y la
  navegación con teclado la traten como lo que es ahora: un enlace.
- Lleva `aria-label` con el nombre del componente, porque sin texto visible que
  lo identifique una tarjeta-enlace no se entiende al navegar por foco.
- Escucha el click y **se salta** cualquier `a` o `button` que haya dentro
  (`event.target.closest("a, button")`), para no navegar dos veces.
- Escucha `Enter` y `Espacio` cuando el foco está en la propia tarjeta.

### Por qué el enlace sigue teniendo su propio manejador

El enlace no se ha tocado: `href`, manejador de click y todo. Hace dos cosas
diferentes:

- Click simple → navega dentro del sitio con `pushState` (sin recargar, para no
  perder la página del paginador en la que estabas).
- Click central, cmd+click, ctrl+click, `shift+click` → se salta el manejador y
  el navegador abre en pestaña nueva como siempre, gracias al `href`.

Si se hubiera quitado el `href`, ese comportamiento se perdía.

### Por qué la vista previa no intercepta el click

El `iframe` de la vista previa tiene `pointer-events: none` en
`site.css` (`.card-preview iframe`), así que el click pasa de largo y llega a
la tarjeta. El demo de dentro no recibe el ratón.

## Verificación

- Click en el preview, en el título, en la descripción, en los márgenes → abre
  el detalle.
- Click en **View component** → abre el detalle una sola vez (no se navega dos).
- Click central sobre **View component** → pestaña nueva con el detalle.
- `Tab` hasta la tarjeta, `Enter` → abre el detalle; el foco se ve con el
  `outline` de `:focus-visible`.
- En los destacados del carrusel funciona igual, incluidas las tarjetas
  repetidas al final del track (se construyen enteras con `createComponentCard`,
  no con `cloneNode`, así que los manejadores están).
- Flechas del carrusel, autoplay y los botones de filtro siguen sin disparar la
  navegación.

## Pendiente relacionado

Nada de esto está en producción hasta que se despliegue. Los assets de
`/Web/scripts/*` y `/Web/styles/*` se sirven con `Cache-Control: immutable` de un
año, pero eso no afecta aquí: `stamp-assets.mjs` reemplaza el `?v=` de cada
etiqueta por la huella de contenido del fichero en cada build, así que el
despliegue los invalida solo.

`npm run validar` pasa tras el cambio.
