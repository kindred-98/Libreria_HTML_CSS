# Fase 4 aplicada — portal de Davoker y accesibilidad

**Fecha:** 2026-10-02 · **Auditoría de referencia:** [`Docs/02-auditorias/Auditoria.md`](../Auditoria.md)
(fecha 2026-10-02, commit revisado `39f4e8d`) · **Base:** `1a2e106` + fases 1, 2 y 3 ·
**Commit que la aplica:** `1379921`

Cierra el hallazgo **principal** (§2.1) y los **seis** de accesibilidad (§6).

---

## 1. §2.1 — El botón «Descargar efecto (.zip)» que «no funciona»

### Qué estaba pasando

No era un fallo de descarga (los tres caminos se midieron y funcionan en Chromium,
§2.2): era que **el botón no estaba donde el visitante lo buscaba**. La portada
`DavokerDiseñador/davoker.html` oculta las tarjetas con dos reglas CSS (`:640-651`):

```css
/* ninguna categoría abierta: solo la muestra aleatoria */
body:not(:has(.grupo[open])) .galeria .tarjeta:not(.sorteada) { display: none; }
```

Medido en navegador antes del cambio:

```
grupos abiertos: []      tarjetas visibles: 12 (de 119)      botones visibles: 12
```

Los 119 botones existen en el DOM, pero **107 están en tarjetas con `display: none`**.
El índice lateral (que es donde se despliega una categoría) no decía que hubiera que
hacerlo, así que la lectura del visitante era «el botón no hace nada».

### Qué se hizo

Añadir la instrucción donde se mira, **sin tocar la regla CSS** (el sorteo de 12 es una
decisión de diseño del autor, documentada en `davoker.html:640-642` y `:2807-2811`;
cambiarla equivaldría a enseñar las 119 a la vez):

| Fichero | Cambio |
|---|---|
| `DavokerDiseñador/davoker.html` (`header.intro`) | Nuevo `<p class="intro-aviso">`: **«Si solo ves unas cuantas tarjetas, es normal: … sortea 12 de los 119 efectos. Despliega una carpeta del índice … el botón "Descargar efecto (.zip)"»** |
| `DavokerDiseñador/davoker.html` (`aside.indice`) | Nuevo `<p class="indice-nota">Abre una carpeta para ver sus efectos y el botón de descarga.</p>`, justo bajo «Efectos / 119 disponibles» |
| `DavokerDiseñador/davoker.html` (CSS) | `.intro-aviso` (caja con borde izquierdo azul) y `.indice-nota`, con sus variantes en `html[data-tema="claro"]` |

En móvil (`max-width: 860px`) `.layout` pasa a columna y el índice va **encima** del
contenido (`davoker.html:580-581`), así que las dos notas se leen antes que la rejilla.

**Contraste de los textos nuevos:** `#9fb0c3` sobre `#12161c` = **8,19:1**; en tema
claro `#3d4756` sobre `#f7f9fc` = **8,91:1**. (`.indice-nota` usa `#9fb0c3` a oscuras
—8,78:1 sobre `#0b0d10`— y `#3d4756` a claras; `#5d6774` daba 3,39:1 y no sirve.)

---

## 2. §6 — Los seis hallazgos de accesibilidad

| Sev | Ubicación | Qué se hizo |
|---|---|---|
| **ALTO** | `Web/styles/site.css:763` | **Quitado `outline: 0`** de `.search-box input`. Empataba en especificidad con `input:focus-visible` (`0,1,1` los dos) y ganaba por orden: el buscador no tenía anillo de foco al tabular. Queda explicado en un comentario para que nadie lo vuelva a poner. |
| MEDIO | `Web/components.html:80-84` | Al `<input id="component-search">` se le añade `data-i18n-aria-label="searchLabel"`: su nombre accesible era **«/»** (el texto del `<kbd>` que hay dentro del `<label>`). Ahora es «Buscar componentes» / «Search components». |
| MEDIO | `Web/components.html:93` | **Quitado `aria-live="polite"`** del `#component-grid`, que se reemplaza entero en cada cambio: el lector de pantalla reanunciaba las 9 tarjetas además del recuento. El anuncio lo sigue haciendo `#results-count` (`:85`), que sí se actualiza solo. |
| MEDIO | `Web/styles/site.css:1783` | `.footer-meta`: `var(--quiet)` → **`var(--muted)`**. Medido: **3,50:1 → 5,49:1** en tema claro (AA pide 4,5:1); en oscuro 4,52:1 → **7,66:1**. |
| BAJO | `index.html:37`, `components.html:37`, `team-core.html:41` | «Skip to content» con `data-i18n="skipToContent"` y claves en los dos idiomas. El idioma por defecto es **español** (`app.js:1502`), así que se veía en inglés en páginas `lang="es"`: ahora «Saltar al contenido». |
| — | `Web/components.html:75` | `<h2 id="library-title">` → **`<h1>`**, como `index.html:72` y `team-core.html:78`, que ya tenían `<h1>`. Los selectores `.section-heading h2` (`site.css:721` y `:2127`) pasan a `.section-heading h1, .section-heading h2` para que el tamaño no cambie. |

Claves nuevas en `Web/scripts/app.js`: `skipToContent` y `searchLabel`, en los
diccionarios `en` y `es`.

---

## 3. Verificación

Se montó el navegador en local (`npm install` + `npx playwright install chromium`;
`package-lock.json` **no cambia**) para poder medir en vez de suponer. Prueba en
`%LOCALAPPDATA%\Temp\opencode\test-fase4.mjs`, 12 comprobaciones, todas en verde:

```text
ok  components.html: un solo <h1>
ok  buscador con nombre accesible "Buscar componentes"
ok  rejilla sin aria-live (solo lo anuncia el recuento)
ok  skip-link traducido: "Saltar al contenido"
ok  foco visible en el buscador: solid 2px rgb(145, 184, 255)
ok  tema dark:  .footer-meta 7,66:1 (rgb(160, 170, 157) sobre rgb(17, 21, 17))
ok  tema light: .footer-meta 5,49:1 (rgb(89, 101, 88) sobre rgb(242, 243, 237))
ok  portada: la nota explica el sorteo de 12/119
ok  índice: la nota invita a abrir una carpeta
ok  portada sin categoría abierta: 12 tarjetas, 12 botones visibles
ok  categoría abierta: 21 tarjetas, 21 botones visibles
ok  botón de descarga: 200 miscelanea/glitch/glitch.zip (application/octet-stream)
```

Además:

```text
npm run validar        -> 1018 componentes · 2688 ficheros · CSP ok
npm run validar:layout -> 5 páginas x 23 anchos = 115 medidas, ninguna se sale
```

Detalle de la prueba de contraste: `body` lleva `transition: background-color 180ms`
(`site.css:114`), así que al cambiar de tema hay que esperar a que termine antes de
medir, o `getComputedStyle` devuelve el color anterior a medias.

---

## 4. Estado después de la fase

| Hallazgo | Estado |
|---|---|
| §2.1 el botón del portal no se encuentra | **cerrado** (instrucción visible en escritorio y móvil) |
| §6 `outline: 0` del buscador | **cerrado** |
| §6 nombre accesible del `<label>` | **cerrado** |
| §6 `aria-live` de la rejilla | **cerrado** |
| §6 contraste de `.footer-meta` | **cerrado**, medido en los dos temas |
| §6 «Skip to content» sin traducir | **cerrado** |
| §6 falta de `<h1>` | **cerrado** |
| §2.2 «falta saber en qué navegador se prueba» | **pendiente de quien reportó el fallo**; la causa de todas formas era la de §2.1 y ya no depende del navegador |

---

## 5. Siguiente: Fase 5 — documentación y higiene (§4, §8)

- **§4**: las 16 filas de documentación que contradicen al código.
- **§8**: `.gitattributes` (ningún binario declarado), resto de patrones de
  `.gitignore`, ficheros estándar que faltan, y `build-zips.mjs`/`stamp-assets.mjs`
  fuera de los documentos.
- Código muerto: `stamp-assets.mjs:74` (`eol` sin usar), `.gitkeep` de
  `creaciones-primium/tarjetas/`, `.footer-meta` duplicado.

Quedan aparte, por ser **decisiones**: C-4 (crédito en los 1 018 demos) y §9
(reescribir el historial) — Fase 6.
