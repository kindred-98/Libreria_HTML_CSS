# Plan de mejoras por fases: Libreria_HTML_CSS

Documento para **OpenCode**. Cada fase es independiente y se aplica en una sesión distinta.

**Cómo se usa:** abre una sesión nueva y escribe:
> Lee `PLAN-MEJORAS-OPENCODE.md`. Aplica SOLO la Fase N. Respeta las reglas generales y para en los puntos marcados con STOP.

## Línea base (auditoría del 2026-10-02)

Sirve para comparar cuando se vuelva a auditar.

| Dato | Valor |
|---|---|
| Demos | 1.018 (kindred-98: 606, fatmaerm: 293, Davoker: 119) |
| Categorías | Effects 198, Navigation 160, Loaders 96, Galleries 95, Controls 89, Buttons 89, Cards 89, Animations 87, Forms 79, **Other 36** |
| Archivos con imágenes de Wikimedia enlazadas en remoto | 98 (658 referencias a `upload.wikimedia.org`) |
| Vulnerabilidades `npm audit` | 0 |
| Secretos, binarios, `eval`, scripts remotos | 0 |
| Demos con salto de encabezados h1 → h3 | 7 (galerías) |
| Demos con dependencia de un tercero (`api.qrserver.com`) | 1 (`url-qr-code-generator`) |
| Bug conocido | `markdown-preview-live`: regex `[sS]` en vez de `[\s\S]` |
| Dirección de donación (USDT BEP20) duplicada | 3 HTML en `Web/` + `Web/scripts/app.js` |
| Puntuación global | 82 / 100 |

---

## Reglas generales (valen para TODAS las fases)

1. **Una rama por fase:** `mejora/fase-N-<tema>`, creada desde `main` actualizado. **Nunca hagas push a `main`.** Abre un PR; si no puedes, deja la rama lista y avisa.
2. **Comprobación base.** Ejecútala antes de empezar y antes de cerrar la fase:
   ```bash
   npm ci
   node Web/scripts/generate-catalog.mjs
   npm run validar
   node Web/scripts/stamp-assets.mjs --force
   node Web/scripts/build-zips.mjs --force
   git status
   ```
   El catálogo, los ZIP y los sellos son artefactos de build. Si `git status` muestra ficheros versionados modificados por esos comandos y la fase no los tocaba, descarta esos cambios (`git checkout -- <ruta>`) y no los incluyas en el commit.
3. **Alcance estricto.** Haz solo lo que pide la fase. No renombres ni borres demos, no toques los `LICENSE` de los demos, no reformatees archivos que no cambias.
4. **Dependencias.** La web no tiene dependencias de runtime ni debe tenerlas. Solo se añaden `devDependencies` cuando la fase lo dice. Si añades una, fija la versión exacta, deja actualizado `package-lock.json` y corrige la frase de `CONTRIBUTING.md` que dice que el proyecto no usa dependencias.
5. **No inventes datos verificables.** SHAs de acciones, versiones, hashes y URLs de licencias se obtienen de la fuente (`gh api`, `git ls-remote`, `npm view`). Si no puedes verificarlos, **para y pregunta**.
6. **Estilo del repo.** Comentarios en español que expliquen el porqué, no el qué. Commits en español con el formato `tipo(fase-N): resumen`.
7. **Nunca añadas `allow-same-origin` al `sandbox` de un iframe.** Junto con `allow-scripts` anula el aislamiento de los demos.
8. **Cuándo parar y avisar:** un validador falla por una causa que no entiendes; un cambio exige tocar más de 50 archivos fuera de lo previsto; la fase se contradice con el estado real del repo.
9. **Seguridad de la sesión:** no pegues tokens ni secretos en logs o commits, no ejecutes `curl | sh`, no instales nada global.
10. **Informe final de la fase** (en la descripción del PR): archivos cambiados, comandos ejecutados con su resultado, desviaciones respecto al plan y cualquier cosa pendiente.

---

## Fase 0: ajustes de GitHub y Vercel (SOLO Ángel, no es para OpenCode)

Es lo que decide de verdad si alguien puede meter código sin tu permiso. Son unos 30 minutos.

- [ ] 2FA activado en GitHub (mejor con passkey o llave de seguridad) y en Vercel.
- [ ] Ruleset sobre `main` (Settings → Rules → Rulesets): exigir pull request, exigir el check **Validar**, bloquear force-push y borrado de la rama, exigir revisión de CODEOWNERS.
- [ ] Settings → Code security: activar **Secret scanning** con **Push protection**, **Dependabot alerts** y **Private vulnerability reporting**.
- [ ] Settings → Actions → General: exigir aprobación para PRs de colaboradores nuevos y de forks, y dejar los permisos por defecto del token en solo lectura.
- [ ] Settings → Collaborators: quitar a quien no necesite escritura.
- [ ] Vercel → Environment Variables: borrar las que no se usen; confirmar que los previews de forks no reciben secretos.
- [ ] Revisar `Docs/` (es público en GitHub aunque Vercel no lo despliegue): quitar lo que no quieras publicar.

---

## Fase 1: endurecimiento de cabeceras, wallet, CI y SECURITY

**Objetivo:** que un demo abierto directamente no corra en el origen del sitio, que cambiar la wallet rompa el CI, y vigilar dependencias y código con análisis automático.

### 1.1 Cabecera `sandbox` para las rutas de demos

Hoy los demos están aislados solo cuando se ven dentro del iframe de la web. Si alguien abre `/CreacionesNuevas/<demo>/index.html` directamente, corre en el origen del sitio.

En `vercel.json`, **después** del bloque global de cabeceras (el primero con `Content-Security-Policy`; no cambies su orden, porque `validar-csp.mjs` usa el primer bloque que encuentra), añade un bloque con estos `source`, reutilizando los patrones `\\.html` que ya existen en el archivo:
- `/CreacionesNuevas/(.*\\.html)`
- `/creaciones-primium/(.*\\.html)`
- `/DavokerDise%C3%B1ador/(.*\\.html)`
- `/DavokerDiseñador/(.*\\.html)`

Cabecera `Content-Security-Policy` con **la misma política global completa más** `; sandbox allow-scripts allow-forms allow-popups allow-downloads`. Se repite la política completa porque Vercel puede sustituir la cabecera en lugar de añadir otra, y así funciona en ambos casos.

Cambia `Web/scripts/validar-csp.mjs` para que además compruebe que la política de este segundo bloque sea exactamente la global más la directiva `sandbox`, y que falle si divergen.

**Verificación (obligatoria, en el preview del PR):**
```bash
curl -sI <preview>/CreacionesNuevas/<cualquier-demo>/index.html | grep -i content-security-policy   # debe incluir "sandbox"
curl -sI <preview>/Web/index.html | grep -i content-security-policy                                  # NO debe incluir "sandbox"
```
Abre también `components.html` en el preview y confirma que las vistas previas siguen funcionando. Pega los resultados en el informe. Si algo se rompe, para.

### 1.2 Test de la dirección de donación

En `Web/scripts/validate.mjs`:
- Define una constante con la dirección esperada (cópiala de `Web/index.html`, no la teclees a mano).
- Extrae todas las cadenas `0x[a-fA-F0-9]{40}` de `Web/*.html` y `Web/scripts/app.js`.
- **Falla** si alguna es distinta de la constante, o si falta en alguno de los tres HTML.
- Ese archivo ya está protegido por CODEOWNERS (`/Web/scripts/`), así que cambiar la constante exige tu revisión.

### 1.3 `npm audit` en el CI

En `.github/workflows/validate.yml`, justo después de `npm ci`, añade un paso `npm audit --audit-level=high`. Respeta el estilo del archivo: comentario explicando el porqué.

### 1.4 CodeQL

Crea `.github/workflows/codeql.yml`: se ejecuta en push a `main`, en PRs y semanalmente; lenguaje `javascript-typescript`; permisos `contents: read` y `security-events: write`. **Fija las acciones por SHA** (resuélvelo con `gh api repos/github/codeql-action/commits/<tag>` o `git ls-remote`), con el tag legible en un comentario, igual que `validate.yml`.
Con ~1.000 demos CodeQL puede generar muchos avisos informativos (`innerHTML` y similares). **No los corrijas en esta fase**: cuéntalos por tipo en el informe.

### 1.5 `SECURITY.md` sin correo personal

**STOP:** haz esto solo si Ángel confirma que activó el reporte privado de vulnerabilidades (Fase 0). Después:
- `grep -rn "angelecheniq" .` en todo el repo (excluye `.git`) y sustituye en `SECURITY.md` el párrafo "Alternativa por correo" por un enlace a `https://github.com/kindred-98/Libreria_HTML_CSS/security/advisories/new`.
- Si el correo aparece en otros ficheros, lista cada aparición en el informe y no los cambies sin avisar.
- Nota para el informe: el correo seguirá en el historial de git. Eso no se arregla con esta fase.

### Criterios de aceptación
- [ ] `curl -I` en el preview cumple lo indicado en 1.1.
- [ ] Cambiar un carácter de la wallet en cualquiera de los 4 sitios hace fallar `node Web/scripts/validate.mjs` (prueba hecha y revertida).
- [ ] El workflow nuevo y el paso de audit pasan en el PR.
- [ ] `npm run validar` pasa completo.

---

## Fase 2: bugs concretos (markdown y QR)

### 2.1 `markdown-preview-live`

Archivo: `CreacionesNuevas/markdown-preview-live/script.js`.
- Cambia `` /```([sS]*?)```/g `` por `` /```([\s\S]*?)```/g ``.
- **No cambies el orden:** el escape de `&`, `<` y `>` debe seguir siendo lo primero. Es lo que evita el XSS en un demo que usa `innerHTML`. Añade un comentario que lo explique.
- Prueba con Playwright o un script de Node con jsdom (sin commitear dependencias nuevas):
  - Entrada con un bloque ``` de varias líneas → se renderiza `<pre><code>`.
  - Entrada `<img src=x onerror=alert(1)>` → se muestra como texto, sin elemento `img`.
- Pega ambos resultados en el informe.

### 2.2 `url-qr-code-generator` sin servicio externo

Hoy manda la URL del usuario a `api.qrserver.com`.
- Elige una librería MIT pequeña y sin dependencias; la candidata es `qrcode-generator`. Resuelve la versión con `npm view qrcode-generator version`, descárgala con `npm pack` y copia solo el archivo de la librería a `CreacionesNuevas/url-qr-code-generator/vendor/` junto con su licencia (`LICENSE-qrcode-generator`).
- Reescribe `script.js` para generar el QR en local (data URL en el `<img>`; el CSP ya permite `img-src data:`). El botón de descarga debe seguir funcionando. Maneja el error de URL demasiado larga con un mensaje en `qrHint`.
- Añade `<script src="vendor/...">` en `index.html` antes de `script.js`.
- Añade la librería y su licencia a `Docs/THIRD_PARTY_NOTICES.md` (ese archivo sí se publica; respeta su formato).
- Comprueba que el ZIP del demo incluye `vendor/` y la licencia, y que `missingReferences` del componente en `catalog.json` queda vacío.
- Si `validar-csp` avisa de que `api.qrserver.com` ya no lo usa nadie, quítalo de `img-src` **en los dos bloques CSP** de `vercel.json` (el global y el de demos de la Fase 1).

### Criterios de aceptación
- [ ] `grep -rn "qrserver" --include=*.js --include=*.html --include=*.css .` no devuelve nada fuera de `Docs/`.
- [ ] El QR se genera sin conexión (prueba con Playwright en modo offline).
- [ ] `npm run validar` pasa.

---

## Fase 3: test de humo de los 1.018 demos

**Objetivo:** saber qué está roto de verdad, con datos. Esta fase **no arregla demos**: solo mide.

### 3.1 Script `Web/scripts/smoke-demos.mjs` y `npm run validar:demos`

- Levanta el servidor local existente (`Web/scripts/serve.mjs`; léelo antes para ver su puerto y argumentos).
- Para cada entrada de `Web/data/catalog.json`, abre una página de Playwright que contenga un iframe con **el mismo sandbox que producción** (`allow-scripts allow-forms allow-popups`, sin `allow-same-origin`) apuntando al demo. Esto reproduce lo que verá el visitante, incluidos los demos que fallan por usar `localStorage` dentro del sandbox.
- Concurrencia de 6 páginas. Espera `load` más 1 segundo.
- Registra por demo: errores de consola, excepciones (`pageerror`), peticiones fallidas, respuestas HTTP ≥ 400 a recursos propios, y **peticiones a hosts externos**.
- Las peticiones externas se **abortan** con `page.route` y se anotan aparte (como "externo"), para que el resultado no dependa de la red.
- Salida: `Web/data/smoke-report.json` (en `.gitignore`) y un resumen por consola con totales por categoría de error.

### 3.2 Línea base

Crea `Web/data/smoke-baseline.json` (este sí se versiona) con los fallos actuales: `id`, tipo de fallo y mensaje. El comando pasa si no hay fallos **nuevos** respecto a la línea base, y falla si aparece alguno. Una entrada de la línea base que ya no falla debe hacer que el script avise para borrarla.

### 3.3 CI

Añade el paso al job de Node 24, tras `validar:layout`. Mide el tiempo de ejecución: si supera 10 minutos, añade el modo `--muestra 60` (muestra determinista más los demos tocados en el PR) para los PRs y deja la ejecución completa para `push` a `main` y `workflow_dispatch`.

### Criterios de aceptación
- [ ] `npm run validar:demos` termina y produce el informe.
- [ ] La línea base está creada y el comando pasa con ella.
- [ ] El informe del PR incluye: total de demos, cuántos fallan, desglose por tipo de fallo, y la lista de demos con peticiones externas (alimenta la Fase 5).

---

## Fase 4: arreglar lo que detectó el humo

**Entrada:** `Web/data/smoke-baseline.json`.

**STOP:** si hay más de 100 demos en la línea base, para y entrega la lista priorizada a Ángel antes de arreglar nada.

Orden de prioridad:
1. Recursos propios que dan 404 (referencias rotas).
2. Excepciones de JavaScript.
3. Errores de consola.

Reglas:
- Arregla lo mínimo necesario en cada demo. No rediseñes ni reformatees.
- Si el fallo viene del sandbox (por ejemplo `localStorage` o `sessionStorage` lanzando `SecurityError`), envuelve el acceso en `try/catch` con un valor de reserva en memoria. **No toques el `sandbox`** (regla 7).
- Agrupa los commits por categoría. Cada demo arreglado se elimina de la línea base en el mismo commit.
- Un demo que no se pueda arreglar sin rehacerlo se deja en la línea base con un campo `motivo` que lo explique.

### Criterios de aceptación
- [ ] La línea base queda vacía, o cada entrada restante tiene `motivo`.
- [ ] `npm run validar:demos` y `npm run validar` pasan.

---

## Fase 5: imágenes de Wikimedia en local

**Objetivo:** que los demos funcionen sin depender de Wikimedia ni informarle de cada visita.

### 5.1 Inventario
Script `Web/scripts/localizar-imagenes.mjs` con modo `--dry-run`. Debe sacar el número de URLs únicas, el tamaño estimado (cabecera `Content-Length` con `HEAD`), la distribución por demo y las referencias que **no** son una URL literal (por ejemplo construidas en JS).

**STOP:** presenta el inventario a Ángel. Si el total estimado supera los **40 MB**, no continúes sin su decisión (crecimiento del repo y del despliegue).

### 5.2 Descarga
- Guarda cada imagen en `<demo>/img/<sha256-12>.<ext>` **dentro de cada demo** (un demo = una carpeta autónoma que se descarga en su ZIP; no uses una carpeta compartida).
- Reescribe las referencias en html, css y js a rutas relativas.
- Usa la variante `thumb` que ya referencia cada demo. No recomprimas ni cambies las imágenes.
- Cumple la política de Wikimedia: `User-Agent` identificable (`Libreria_HTML_CSS-asset-fetcher/1.0 (https://github.com/kindred-98/Libreria_HTML_CSS)`), máximo 2 peticiones por segundo, reintentos con espera creciente ante un 429.

### 5.3 Atribución y licencia
- Para cada imagen consulta la API de Commons (`action=query&prop=imageinfo&iiprop=extmetadata|url`) y obtén autor, nombre corto de licencia y URL de la licencia.
- Escribe un `CREDITS.md` en cada demo con archivo, autor, licencia y enlace a la página de origen, y asegúrate de que viaje dentro del ZIP (revisa cómo lo arma `Web/scripts/app.js` y `build-zips.mjs`).
- Si una imagen no tiene una licencia libre clara, **no la descargues**: déjala enlazada y anótala en el informe.

### 5.4 CSP
Cuando `validar-csp` indique que ya no se usan `upload.wikimedia.org` ni `commons.wikimedia.org` en `img-src`, quítalos **de los dos bloques CSP**.

### Criterios de aceptación
- [ ] `npm run validar:demos` muestra 0 peticiones externas a Wikimedia.
- [ ] Ningún demo con imágenes localizadas queda sin `CREDITS.md`.
- [ ] El informe incluye el tamaño añadido al repo, las imágenes no descargadas y su motivo.
- [ ] `npm run validar` pasa.

---

## Fase 6: accesibilidad

### 6.1 axe-core en las páginas del sitio
- `devDependency` nueva: `@axe-core/playwright` (versión exacta, lockfile actualizado, `CONTRIBUTING.md` corregido).
- Script `Web/scripts/validar-a11y.mjs` y `npm run validar:a11y`: analiza `index.html`, `components.html` y `team-core.html`, en español e inglés, en tema claro y oscuro. **Falla** con violaciones `serious` o `critical`; las `moderate` y `minor` solo se informan.
- Corrige lo que salga en el código del sitio (`Web/`). Comprueba también que existe un `:focus-visible` visible en botones y enlaces.
- Añádelo al job de Node 24 del CI.

### 6.2 Los 7 demos con salto de encabezados
Escribe un script que detecte los saltos h1 → h3 en los demos, lista los 7 ids y corrígelos cambiando el nivel del encabezado. Si el CSS usa selectores `h3`, actualízalos para que el aspecto visual no cambie.

### 6.3 `prefers-reduced-motion`
- Script idempotente `Web/scripts/add-reduced-motion.mjs`, con marcador `/* reduced-motion (Fase 6) */`.
- Solo toca demos cuyo CSS contenga `@keyframes`, `animation` o `transition`, y que no contengan ya `prefers-reduced-motion`.
- **Excluye la categoría Loaders**: la animación de un indicador de carga es información esencial.
- Bloque que se añade (al final de `styles.css`, o dentro del último `<style>` si el demo lo lleva inline):
  ```css
  /* reduced-motion (Fase 6) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- Los demos que animen solo con JavaScript (`requestAnimationFrame`, `canvas`, `setInterval`) **no se tocan**: cuéntalos en el informe como trabajo futuro.
- **STOP tras el piloto:** aplícalo primero a 20 demos (10 efectos y 10 animaciones), ejecuta `npm run validar:demos` y presenta el diff a Ángel. Solo con su visto bueno, aplica al resto.
- Añade la regla a `CONTRIBUTING.md` y un aviso (no un fallo) en `validate.mjs` para los demos nuevos que no lo tengan.

### Criterios de aceptación
- [ ] `npm run validar:a11y` pasa sin violaciones `serious` ni `critical`.
- [ ] 0 saltos de encabezado en los demos.
- [ ] El informe da el número de demos modificados, de excluidos y de los que animan solo con JS.
- [ ] `npm run validar:demos` no introduce fallos nuevos.

---

## Fase 7: contenido y calidad del CI

### 7.1 Los 36 demos de la categoría "Other"
Lee `Web/data/component-overrides.json` para ver su estructura. Reclasifica cada demo en una categoría existente usando el campo `category` del override; **no renombres carpetas**. Si alguno no encaja, déjalo en "Other". Pon la tabla `id → categoría nueva` en el informe.

### 7.2 Duplicados (solo informe)
Script que calcule un hash del contenido normalizado (html, css y js sin espacios ni comentarios) y una similitud por tokens (≥ 0,9). Lista los pares en el informe. **No borres nada.**

### 7.3 Calidad del CI
- `devDependency` `html-validate` aplicado a `Web/*.html` y `404.html` (solo páginas del sitio, no los demos).
- `Web/scripts/validar-enlaces.mjs`: comprueba que los enlaces relativos y las anclas de las páginas del sitio apuntan a archivos que existen. Va al CI.
- Un workflow semanal aparte, `schedule` y `continue-on-error`, que compruebe los enlaces externos del sitio y del README. No bloquea PRs.

### 7.4 `sitemap.xml`
Añade `<lastmod>` a las tres URLs, calculado en el build con `git log -1 --format=%cs -- <archivo>`. Si git no tiene historial disponible (clon superficial en Vercel), omite la etiqueta en lugar de inventar la fecha.

### 7.5 Versión y release
Añade una cabecera `[1.0.0]` con la fecha al `CHANGELOG.md`. **No crees el tag ni la release:** deja en el informe el comando `gh release create` para que lo ejecute Ángel.

### 7.6 (Opcional) Lighthouse CI
Sobre las 3 páginas del sitio, con umbrales mínimos: accesibilidad, buenas prácticas y SEO ≥ 95; rendimiento ≥ 80. Solo si el CI sigue por debajo de los 15 minutos totales.

### Criterios de aceptación
- [ ] "Other" tiene como máximo los demos que no encajan en ninguna categoría, y cada uno está justificado.
- [ ] `html-validate` y la comprobación de enlaces pasan.
- [ ] `npm run validar` pasa.

---

## Registro de avance

| Fase | Quién | Estado | PR |
|---|---|---|---|
| 0. GitHub y Vercel | Ángel | ☐ | n/a |
| 1. Cabeceras, wallet, CI, SECURITY | OpenCode | ☐ | |
| 2. Bugs (markdown, QR) | OpenCode | ☐ | |
| 3. Test de humo | OpenCode | ☐ | |
| 4. Arreglos del humo | OpenCode | ☐ | |
| 5. Imágenes de Wikimedia | OpenCode | ☐ | |
| 6. Accesibilidad | OpenCode | ☐ | |
| 7. Contenido y calidad | OpenCode | ☐ | |

## Estado esperado al terminar (para la re-auditoría)

- Los demos abiertos directamente llevan `sandbox` en su CSP.
- Cambiar la wallet en cualquier sitio rompe el CI.
- `npm run validar:demos`: 0 fallos y 0 peticiones externas.
- `npm run validar:a11y`: 0 violaciones graves.
- 0 referencias a `api.qrserver.com`, `upload.wikimedia.org` y `commons.wikimedia.org` como recursos cargados.
- `Other` reducida al mínimo justificado.
- `main` protegida, 2FA activo, CodeQL y secret scanning activos.
