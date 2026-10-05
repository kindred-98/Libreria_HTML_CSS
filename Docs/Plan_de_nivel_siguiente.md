# Plan de nivel siguiente: del 80 al 97

Fecha: 2026-10-06. Complementa [`Plan_de_fases.md`](./Plan_de_fases.md) (fases 0-7,
ya cerradas) y [`Auditoria.md`](./Auditoria.md).

Este documento **no repite lo hecho**: saca el proyecto del "código bien
auditado" al "producto listo para el mercado". Las notas de partida no son una
opinión: están medidas y cada una lleva su comando detrás.

---

## 1. Punto de partida (medido el 2026-10-06)

| Área | Nota hoy | Evidencia |
| --- | --- | --- |
| Calidad de código | **88** | `npm run validar` en verde · 1018/1018 demos · 0 duplicados · 2702 ficheros escaneados |
| Seguridad | **92** | CSP/HSTS completos · 9 avisos de CodeQL cerrados · **token de SonarCloud aún vivo** · sin auditoría de dependencias programada |
| Rendimiento | **82** | Escritorio **99/100/100** · Móvil **72-86** · TBT de portada 810-1250 ms · CLS ya en 0 |
| Accesibilidad | **85** | 0 *serious/critical* en 12 pasadas · quedan 4 reglas moderadas/minor · sin medir en viewport móvil |
| **Producto / mercado** | **68** | Ver §1.4 |
| **Global** | **80** | Media ponderada |

### 1.1 SonarCloud, tal y como está hoy

Consultado con la API el 2026-10-06 contra la rama principal:

| Métrica | Valor |
| --- | --- |
| Incidencias abiertas | **99** |
| · BUG | **1** (`javascript:S3403` en `creaciones-primium/formularios/clinic-appointment-desk/script.js:235`) |
| · VULNERABILITY | **0** |
| · CODE_SMELL | **98** |
| Severidades | 4 CRITICAL · 47 MAJOR · 44 MINOR · 4 INFO |
| **Quality Gate** | **`NONE` — no está configurado** |

Tres conclusiones incómodas:

1. **El gate no existe.** `api/qualitygates/project_status` devuelve `NONE`.
   Hoy nada bloquea nada: el "todo en A" que crees tener es una expectativa,
   no una configuración. Es el primer hueco que hay que cerrar.
2. **No estás en 0.** Estás en 99. Los 5 commits pendientes de la PR actual
   se llevan ~20 (S7759×8, S7750×4, S7719×3, S5869×3, S6557×2) y el bug
   S3403 sigue ahí: quedarán **~79**.
3. **Los 4 CRITICAL son de los tuyos, no de los demos**: `S3504` (`var` en
   vez de `let/const`) ×2 en un `script.js` y `S3735` (operador `void`) ×2
   en `Web/scripts/app.js:445` y `app.js:1046`.

### 1.2 Rendimiento, medido hoy (Lighthouse, preset móvil con throttling)

| Página | Rend. | Acces. | BP | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| portada | **72-78** | 100 | 100 | 100 | 2,5 s | **810-1250 ms** | 0,021 |
| componentes | **86** | 95 | 100 | 100 | 2,4 s | 300 ms | **0,006** |
| team core | 92-98 | 100 | 100 | 100 | 2,4 s | 10 ms | 0,056 |

Escritorio: **99 / 100 / 100** en las tres. El techo está en móvil, y el
culpable es un solo archivo: `Web/scripts/app.js` (80,6 KB) parseándose en
una única tarea. El segundo es `Web/data/catalog.json` (**707 KB**).

### 1.3 Accesibilidad, lo que queda

Del `npm run validar:a11y` de hoy (24 reglas, 12 pasadas):

| Regla | Severidad | Nodos | Dónde |
| --- | --- | --- | --- |
| `aria-allowed-role` | minor | 33 | `article[role="link"]` en las tarjetas |
| `heading-order` | moderate | 8 | `h3` en la tarjeta sin un `h2` previo |
| `landmark-unique` | moderate | 4 | `#main-content` sin `aria-label` propio |
| `color-contrast` | serious | 2 | **dentro de iframes** (contenido de los demos) |

Y de Lighthouse en móvil: *touch targets* sin tamaño suficiente, nombres
accesibles que no casan con la etiqueta visible, y el árbol de accesibilidad
mal formado. **Nada de esto se está midiendo hoy en viewport móvil.**

### 1.4 Producto y mercado: el desglose del 68

| Bloque | Estado | Falta |
| --- | --- | --- |
| Legal | ⚠️ Parcial | Existe `PRIVACY.md` en la raíz, pero **no hay ninguna página de privacidad en el sitio** y el pie solo enlaza "Cookies". Sin aviso legal ni política de cookies completa. |
| Medición | ⚠️ Parcial | GA4 instalado (`G-3TRY9F4G0Z`) con consentimiento correcto, pero **cero eventos de producto**: no sabes si alguien abre un detalle o descarga un ZIP. |
| SEO | ⚠️ Parcial | Títulos y `description` casi idénticos entre páginas. **Cero JSON-LD**. Sin `hreflang`. |
| Instalabilidad | ❌ | Sin `manifest.json` ni iconos dedicados: no se puede "añadir a pantalla de inicio" como app. |
| Tests | ❌ | **Cero tests.** Hay 10 validadores que son aserciones excelentes, pero nada que falle si se rompe la lógica de `app.js`. |
| Calidad de proceso | ⚠️ Parcial | Sin linter ni formateador. CI fuerte (17 pasos, 3 versiones de Node) pero sin **presupuestos** que impidan retroceder. |
| Release | ❌ | Sin tag ni release. `gh release create` sigue esperando en `Fase7.md`. |
| Soporte | ⚠️ Parcial | Hay `SECURITY.md`, `CONTRIBUTING.md` y templates de issue, pero no hay dónde pedir ayuda desde la propia web. |

---

## 2. Reglas del juego (invariantes)

Todo lo que viene después se somete a estas cinco reglas. Si alguna fase las
rompe, se corrige antes de pasar a la siguiente.

1. **SonarCloud vuelve a 0 y se queda en 0.** Cada fase termina con
   `npm run sonar:exportar` → 0 abiertas, y con el Quality Gate en **A**.
2. **Los 10 validadores siguen en verde.** Antes de cada commit:
   `validar` · `validar:layout` · `validar:a11y` · `validar:encabezados` ·
   `validar:html` · `validar:enlaces` · `validar:demos` · `duplicados` ·
   `validar:lighthouse` · `enlaces:externos`.
3. **CHANGELOG antes del commit.** Sin acentos, con la fecha.
4. **Un asunto por PR.** Nada de mezclar un refactor de app.js con una
   página legal: si un PR falla, se sabe por qué en 30 segundos.
5. **Todo cambio que pueda subir una nota tiene que poder medirse antes y
   después.** Si no hay número, no se mergea.

---

## 3. Notas proyectadas al final del plan

| Área | Hoy | Objetivo | Lo que lo mueve |
| --- | --- | --- | --- |
| Calidad de código | 88 | **97** | Fase 0 (lint+tipos+tests) y Fase 1 (Sonar 0 + gate A) |
| Seguridad | 92 | **99** | Fase 1 (token a Actions), Fase 4a (legal), Fase 0 (`npm audit` en CI) |
| Rendimiento | 82 | **96** | Fase 3 (presupuestos en CI) |
| Accesibilidad | 85 | **98** | Fase 2 (0 axe en 2 viewports) |
| **Producto / mercado** | **68** | **100** | Fases 4a, 4b y 6 |
| **Global** | **80** | **97** | |

---

## 4. Las fases

---

### Fase 0 · Cimientos de ingeniería

**Objetivo:** que el código se autoverifique solo, para que las fases
posteriores no sean una apostada.

**Por qué primero:** sin linter ni tests, cada cambio de las fases 2-4 es una
posible regresión silenciosa. Esta fase es la que hace sostenible el resto.

#### Tareas

1. **ESLint con flat config**, con alcance **solo `Web/scripts/`**.
   - `eslint.config.js` con `js.configs.recommended` y un puñado de reglas
     adicionales (`no-implicit-globals`, `no-undeclared-variables`).
   - **No se lintea `CreacionesNuevas/`, `creaciones-primium/` ni
     `DavokerDiseñador/`**: son 1018 demos independientes que ya pasan por
     Sonar. Lintearlos produciría 10.000 avisos que nadie va a leer.
   - `npm run lint` y `npm run lint:fix`.
2. **Prettier acotado al mismo alcance** (`Web/scripts/**`). Un solo commit
   de formato, aislado, para que Sonar lo vea como un lote de "código nuevo"
   y no se lleve por delante las métricas de duplicación de todo el repo.
3. **Comprobación de tipos con TypeScript en modo estricto sobre JS**
   (`tsc --noEmit --allowJs --checkJs`), con `tsconfig.json` limitado a
   `Web/scripts/**/*.mjs`. Estos son los ficheros que generan el catálogo,
   sellan assets y validan: son la columna vertebral y hoy no tienen ningún
   tipo de red. **No se migra a TypeScript**: se documenta con JSDoc
   (`@type`, `@param`) y ya está.
4. **Tests con `node:test`** (nativo, **cero dependencias nuevas**):
   - `Web/scripts/__tests__/` con tests unitarios de las funciones puras.
     Habrá que exportar algunas (`huellaDe`, `toIndexEntry`, los patrones del
     autofix): refactor mínimo y sin cambiar comportamiento.
   - Casos que sí valen la pena: `stamp-assets` (la huella cambia solo si
     cambia el contenido), `generate-catalog` (1018 entradas, sin `folder`,
     esquema válido), `autofix-sonar-mecanico` (**idempotente**: aplicarlo
     dos veces no cambia nada) y `sonar:exportar` (el saneado de CR/LF).
5. **Tests e2e con Playwright** (ya instalado) sobre las 3 páginas:
   carga, cambio de idioma, cambio de tema, filtro por categoría, apertura
   de un detalle, descarga de un ZIP, consentimiento de cookies y el portal
   de Davoker. `npm test`.
6. **Tipos de esquema**: `ajv` (única dependencia nueva aceptada) o un
   validador manual para que `catalog.json` tenga contrato. Hoy un cambio
   silencioso en `generate-catalog.mjs` rompería el sitio entero sin que
   nada se quejara.
7. **CI**: añadir al workflow `validate.yml` los pasos `lint`, `typecheck`,
   `test` y `npm audit --audit-level=high` (ya existe un paso de
   vulnerabilidades, se sube a `high` y se documenta).

#### Hecho cuando

```bash
npm run lint          # 0 errores
npm run typecheck     # 0 errores
npm test              # todos en verde
npm run validar       # sigue en verde
```

Y en `sonar-project.properties` aparece `sonar.tests=__tests__` para que
Sonar cuente los tests como tests y no les aplique las reglas de código
principal (si no, los tests nuevos suben la cuenta de *code smells*).

#### Impacto en notas
- Calidad de código: 88 → **92**
- Seguridad: 92 → 93 (`npm audit` en CI)

#### Protección de Sonar
Alcance acotado a `Web/scripts/` y `sonar.tests` declarado **antes** de
escribir el primer test.

---

### Fase 1 · SonarCloud a 0 de verdad, con Quality Gate configurado

**Objetivo:** 99 → 0, gate en A, y que sea **imposible que vuelva a subir**.

#### Tareas

1. **Configurar el Quality Gate** (hoy `NONE`). En SonarCloud:
   *My Organization → Quality Gates → Create* con los 4 criterios de **A**:
   - *Condition on New Code*: 0 bugs, 0 vulnerabilities, 0 security hotspots,
     duplicación < 3%, mantenibilidad < 5 min, cobertura de código nuevo ≥ 80%.
   - *Condition on Overall Code*: 0 bugs, 0 vulnerabilities.
   - Asignarlo al proyecto `kindred-98_Libreria_HTML_CSS`.
2. **Quemar los 99.** Se clasifican en tres cubos:
   - **Auto-arreglables** (los que siguen en `Web/scripts/autofix-sonar-mecanico.mjs`):
     S7759, S7750, S7719, S6557, S5869, S7771, S7762, S7760, S7754, S7751,
     S7747, S7740, S7718 → ejecutar el script con `--rule`, validar, commit.
   - **Arreglos manuales de verdad** (los que no se pueden tocar a ciegas):
     - `S3403` (el único BUG) en `clinic-appointment-desk/script.js:235`
     - `S3504` `var` → `let/const` (×2, los CRITICAL)
     - `S3735` `void` → `void 0` o eliminación (×2 en `app.js`)
     - `S6551` (×7), `S7785` (×6), `S2486` (×4), `S5843` (×4),
       `S4030` (×3), `S1128`/`S1481`/`S1871`/`S1854` (×2 cada uno)
   - **Won't Fix justificados** (reglas que chocan con el diseño del repo):
     `S1940` (invertir operandos rompe la coerción y ya rompió 5 demos),
     `Web:MetaRefreshCheck` (el redirect de `/` lo exige la raíz del sitio),
     `Web:S6821`/`Web:S1135` (los avisos de *todo* dentro de los demos),
     `S1135` (los `TODO` documentados). Cada uno con comentario en el
     panel, y la lista reflejada en `Docs/AnalisisSonarQube.md`.
3. **Mover el token de SonarCloud de personal a secreto de GitHub.**
   Workflow nuevo `sonar.yml` con `SonarSource/sonarcloud-github-action`
   sobre `main` y sobre cada PR, usando `SONARCLOUD_TOKEN` en
   *Repository secrets*. **Entonces se revoca el token personal**
   (`https://sonarcloud.io/account/security` → `export-issues` → Revoke).
   Con esto desaparece el único riesgo de seguridad abierto que queda.
4. **Badge de calidad** en `README.md` (Quality Gate + relabilidad +
   seguridad + mantenibilidad) y en el pie del sitio, para que el "todo en A"
   sea visible y no solo interno.

#### Hecho cuando

```bash
npm run sonar:exportar   # 0 abiertas
```
*Quality Gate: A* en el badge, y el workflow `sonar.yml` en verde en un PR.

#### Impacto en notas
- Calidad de código: 92 → **96**
- Seguridad: 93 → **97** (token revocado)

#### Protección de Sonar
**Esta fase es la protección.** El paso de SonarCloud en CI con gate A
convierte cualquier regresión en un PR bloqueado.

---

### Fase 2 · Accesibilidad a 98

**Objetivo:** 0 violaciones de axe **incluidas las moderadas**, en las 3
páginas × 2 viewports, y Lighthouse a11y ≥ 98 en móvil.

#### Tareas

1. **`article[role="link"]` (33 nodos).** axe rechaza `role="link"` sobre
   `<article>`. El patrón correcto en `createComponentCard`
   (`Web/scripts/app.js:~820`) es el de "card linkable": el `<article>` se
   queda como contenedor y el enlace se mete como hermano superpuesto
   (`<a class="card-link">` con `::after` a todo el área), o se envuelve el
   contenido en un `<a>`. Mantiene el foco visible y arregla también el
   aviso de Lighthouse de *accessible names*.
2. **`heading-order` (8 nodos).** La tarjeta pinta un `h3` cuando el último
   encabezado es el `h1` de la página. Solución: añadir un `h2`
   visualmente oculto por vista ("Componentes") antes de la rejilla, o
   bajar la tarjeta a `h2` y el resto de la página en consecuencia.
3. **`landmark-unique` (4 nodos).** `#main-content` necesita un
   `aria-label` distinto en cada página: *"Catálogo de componentes"*,
   *"Portada"*, *"Equipo y donaciones"*.
4. **Medir también en móvil.** `Web/scripts/validar-a11y.mjs` pasa hoy a
   ancho fijo. Añadir un segundo viewport (412×915) y tratar los 4
   `color-contrast` **de dentro de los iframes**: o se arreglan los demos
   concretos, o se documentan como fuera de alcance con su lista
   explícita (hoy se filtran en silencio, lo cual es peor).
5. **Touch targets**: subir a 44×44 px los controles del filtro, la
   paginación y el botón de idioma en móvil.
6. **Contraste**: revisar los tokens de color de `Web/styles/site.css`
   con la regla AA (4,5:1 en texto normal) — hay al menos un `#5d6774`
   sobre `#101311` que se queda corto en tamaños pequeños.
7. **Auditoría manual con lector de pantalla** (VoiceOver en iOS, NVDA en
   Windows) sobre las 3 páginas. Esto no lo sustituye ninguna herramienta:
   es lo que separa un 85 de un 98.

#### Hecho cuando

```bash
npm run validar:a11y     # 0 serious, 0 critical, 0 moderate
npm run validar:lighthouse  # accessibility >= 98
```

#### Impacto en notas
- Accesibilidad: 85 → **98**

#### Protección de Sonar
El cambio de `role` en las tarjetas es refactor de HTML generado: revisar
que no se dispare `S6850`/`S6840` (reglas Web) en el PR.

---

### Fase 3 · Rendimiento a 96, con presupuestos que impiden retroceder

**Objetivo:** Lighthouse móvil ≥ 90 en las 3 páginas (objetivo real: 95),
LCP < 1,8 s, TBT < 200 ms, y que **una regresión de 5 puntos rompa el CI**.

#### Tareas

1. **Matar el TBT de la portada (810-1250 ms → < 200 ms).**
   - Partir `Web/scripts/app.js` (80,6 KB) con importaciones dinámicas:
     el buscador, la i18n, la descarga de ZIPs y la vista de detalle se
     cargan con `import()` **cuando se usan**, no en el arranque.
   - Retrasar todo lo que no sea primer pintado a `requestIdleCallback`
     (el portal de Davoker ya lo hace bien con `data-src`, es el patrón a
     seguir).
   - Medir con `bootup-time` y `mainthread-work-breakdown` de Lighthouse
     antes/después, no a ojo.
2. **Atacar `catalog.json` (707 KB).**
   - Dividirlo: `catalog-index.json` (id, name, category, author, preview,
     thumbnail) para el listado, y el detalle bajo demanda. El mecanismo
     ya existe y funciona: `data/sources/{id}.json` se carga al abrir un
     componente (`ensureComponentSource`). Hay que aplicar la misma idea al
     listado.
   - Objetivo: **< 150 KB** para el primer pintado.
3. **LCP (2,4-2,7 s → < 1,8 s).** Identificar el elemento LCP con
   `lcp-lazy-loaded` y `lcp-elements` de Lighthouse; si es la imagen de
   portada, `fetchpriority="high"` + `preload`; si es el título, quitarle
   trabajo al hilo principal en el arranque.
4. **Presupuestos de performance en CI.** Añadir
   `npm run validar:lighthouse:movil` (el preset móvil, hoy no se ejecuta)
   con umbrales y **salida 1 si se pasa**. Ya hay `validar:lighthouse` con
   umbral 80 en escritorio; se sube a 95 y se añade la rama móvil con 90.
5. **Test de regresión de CLS.** El script que midió 0,254 → 0,0065 se
   convierte en `npm run validar:cls`: si alguien vuelve a romper el pie,
   el CI lo dice.
6. **Caché**: verificar con `curl -I` que el HTML lleva
   `max-age=60, stale-while-revalidate` y los assets `immutable`. Ya está
   en `vercel.json`; lo que falta es que alguien lo compruebe en CI.
7. **Prueba en gama baja.** Medir en un dispositivo real o con el
   *CPU throttling* al 4× sobre 3G lenta. Lo que se ve ahí es lo que verá
   "todo el mundo".

#### Hecho cuando

```bash
npm run validar:lighthouse          # >= 95 en las 3 (escritorio)
npm run validar:lighthouse:movil    # >= 90 en las 3 (móvil)
npm run validar:cls                 # CLS < 0.05 en las 3
```

#### Impacto en notas
- Rendimiento: 82 → **96**

#### Protección de Sonar
El reparto de `app.js` en módulos toca mucho código → es el PR con más
riesgo de meter *code smells*. Se hace **en su propio PR**, y se pasa el
autofix antes de subirlo.

---

### Fase 4a · Producto: legal y cumplimiento ("para todo el mundo")

**Objetivo:** que alguien de cualquier país pueda entrar, entender qué se
recoge y tener a quién escribir. Es el bloque que más pesa en el 68.

#### Tareas

1. **Página de privacidad en el sitio.** `Web/privacidad.html`, en ES y EN
   (mecanismo `data-i18n` ya existente), generada a partir de `PRIVACY.md`
   o con su contenido replicado y enlazado. **Enlazarla desde el pie** de
   las 3 páginas, al lado de "Cookies".
2. **Aviso legal** (`Web/aviso-legal.html`): titularidad, licencia MIT de
   los demos, propiedad intelectual de los efectos de Davoker y de las
   imágenes de Wikimedia (que ya se declaran en `THIRD_PARTY_NOTICES.md`).
3. **Política de cookies completa**: detalle de las 3 claves de
   `localStorage` y de las cookies de Google Analytics, con el ID de
   medición, la vida de cada una y cómo revocarla.
4. **Revisión del banner de consentimiento.** Existe y funciona, pero hay
   que verificar los tres puntos que mira un auditor europeo:
   - "Solo lo necesario" tiene el **mismo peso visual** que "Aceptar"
     (sin *dark patterns*).
   - El rechazo es tan fácil como la aceptación y queda guardado.
   - Nada se carga antes del consentimiento (hoy cierto: hay test).
   - Hay un enlace directo a la política de cookies desde el banner.
5. **Contacto y soporte visible en la web**: email o enlace a GitHub
   Discussions/Issues desde el pie. Hoy `SECURITY.md` existe pero no se
   llega desde la interfaz.
6. **Declaración de accesibilidad**: `Web/accesibilidad.html` con el nivel
   alcanzado (WCAG 2.2 AA), la fecha de la última auditoría y cómo
   reportar un problema. Es lo que pide la norma y además es un argumento
   de venta.

#### Hecho cuando

Los 5 documentos accesibles desde el pie de las 3 páginas, en ES y EN, y
`validar:enlaces` en verde con las 5 nuevas anclas.

#### Impacto en notas
- Producto/mercado: 68 → **82**
- Seguridad: 97 → **98** (consentimiento auditado)

---

### Fase 4b · Producto: descubrimiento, medición y confianza

**Objetivo:** que el producto se encuentre, se entienda, se mida y se
instale. Es el bloque que lleva el 82 al 100.

#### Tareas

1. **SEO técnico**
   - **JSON-LD** en las 3 páginas: `WebSite` + `SearchAction` (el buscador
     del catálogo), `SoftwareApplication` (nombre, versión, licencia,
     sistema operativo "web") y `BreadcrumbList`.
   - **`hreflang`** `es` / `en` con el alternativo correcto (la i18n es
     *client-side*, así que apuntar al mismo URL con `hreflang` es lo
     correcto).
   - **Títulos y descripciones distintos por página.** Hoy `index.html` y
     `components.html` comparten la misma `description`; el SEO de
     *componentes* se está comiendo la de la portada.
   - Verificar `sitemap.xml` con `lastmod` real y presentarlo en Search
     Console.
2. **Medición de producto (esto es lo que convierte una web en un
   producto).** GA4 ya está y ya pide consentimiento; falta decirle qué
   eventos importan:
   - `view_item` — abrir el detalle de un componente.
   - `download` — descarga de un ZIP (hay una función clara:
     `downloadComponentZip`).
   - `search` — búsqueda con término (nunca el contenido, solo si hay
     resultado).
   - `select_content` — cambiar de categoría o autor.
   - `share` — copiar enlace de un detalle.
   - **Core Web Vitals en vivo**: librería `web-vitals` → los LCP/CLS/TBT
     reales de los visitantes, no los simulados.
   - Con eso se monta un embudo en GA4: *entró → buscó → abrió detalle →
     descargó*. Sin eso no se puede saber si el producto funciona.
3. **Instalabilidad (PWA ligera)**
   - `Web/manifest.json` con nombre, colores, iconos 192/512 y
     `start_url: "./"`.
   - Iconos dedicados hoy no hay: solo `favicon.svg` repetido como
     *apple-touch-icon*. Hace falta generar PNG reales.
   - **Service worker: opcional y con cuidado.** Un SW mal versionado en un
     sitio que despliega a cada PR sirve CSS viejo para siempre. Si se
     hace, solo para `site.css`/`app.js` con *cache-first + revalidación*
     y limpieza en `activate`. **Recomendación: no en la primera entrega.**
4. **Experiencia de primera visita**
   - Estado vacío con "por dónde empezar" (hoy hay `noComponentsHint`, pero
     no hay recorrido de entrada).
   - Página de **"Cómo usar un componente"** en el sitio: hoy las
     instrucciones solo existen dentro de cada showcase y en
     `CONTRIBUTING.md`, que está pensado para contribuyores, no para
     visitantes.
5. **Confianza visible**
   - Badges en el `README.md`: Lighthouse, Quality Gate de Sonar, licencia
     MIT, versión de la release, CI.
   - Release **v1.0.0** con notas de versión: `gh release create v1.0.0`
     (comando ya preparado en `Fase7.md`).
   - Contador de componentes y fecha de actualización en la portada
     (hay `footer-year` y `resultsCount`, hay que hilarlos).
6. **Idiomas**: las 132 claves EN/ES están balanceadas. Mantenerlo con un
   test que falle si aparece una clave en un idioma y no en el otro.

#### Hecho cuando

- Rich Results Test de Google sin errores en las 3 páginas.
- El embudo de GA4 recibe los 5 eventos (comprobado en *DebugView*).
- `manifest.json` válido y la web instalable desde Chrome y Safari iOS.
- Release `v1.0.0` publicada con changelog.

#### Impacto en notas
- Producto/mercado: 82 → **100**
- Calidad de código: 96 → **97** (test de i18n y de esquema)

---

### Fase 5 · Robustez: que nada se rompa sin que se note

**Objetivo:** convertir los validadores en una red de verdad, con
presupuestos y contratos.

#### Tareas

1. **Presupuestos en CI como verificaciones con salida**, no como
   informes: Lighthouse (escritorio ≥ 95, móvil ≥ 90), CLS < 0,05,
   peso de `catalog-index.json` < 150 KB, número máximo de
   *code smells* abiertos (0).
2. **Contratos**: test de esquema para `catalog.json`, test de que las 132
   claves i18n existen en los dos idiomas, test de que cada demo del
   catálogo tiene su `index.html` en disco y viceversa (parte de eso ya
   hace `validar`, hay que exponerlo como test).
3. **Fallbacks comprobados**: si `catalog.json` falla, se carga
   `catalog.js` (`loadFullCatalogScript`). Hoy existe el código; **no
   existe el test** que lo ejercite.
4. **Monitorización**: comprobación de uptime en un workflow de GitHub
   Actions contra la URL de producción (diaria), y
   `window.onerror`/`unhandledrejection` → evento de GA para ver los
   errores reales de los visitantes.
5. **Dependencias**: `dependabot.yml` ya existe. Añadir el paso de
   `npm audit --audit-level=high` al CI (Fase 0) y revisar el informe
   mensual.

#### Hecho cuando

Todos los presupuestos son pasos del CI que **fallan** (no solo informan).

#### Impacto en notas
- Calidad de código: 97 → **97** (consolidación)
- Rendimiento: 96 → **96** (blindaje)

---

### Fase 6 · Lanzamiento y operación

**Objetivo:** salir al mercado sin sorpresas y con la capacidad de seguir
subiendo.

#### Tareas

1. **QA en matriz real**, no simulada:

   | Dispositivo | Navegador |
   | --- | --- |
   | iPhone | Safari iOS (el más problemático: ya se le dedicaron 3 commits) |
   | iPad | Safari iPadOS |
   | Android gama media | Chrome |
   | Android gama baja | Chrome con datos ahorrados |
   | Windows | Chrome, Firefox, Edge |
   | macOS | Safari, Chrome |

   Checklist por dispositivo: carga, scroll de la rejilla, detalle,
   descarga de ZIP, cambio de tema/idioma, portal de Davoker, banner de
   cookies, instalación en pantalla de inicio.

2. **Revisión legal interna** de los 5 documentos de la Fase 4a.
3. **Release `v1.0.0`** + tag + notas en GitHub + entrada en CHANGELOG.
4. **Publicación**: README con badges, anuncio, y el badge de Quality Gate
   en el pie del sitio.
5. **Operación**: qué se mira cada semana (GA4 embudo, CWV reales, Sonar,
   uptime) y qué se hace si algo baja.

#### Hecho cuando

- La checklist de matriz está completada y firmada.
- `gh release create v1.0.0` ejecutado.
- Los 5 indicadores semanales tienen dueño y frecuencia.

#### Impacto en notas
- Producto/mercado: se sostiene en **100**
- **Global: 97**

---

## 5. Cuadro de mando

Esto es lo que se mira y con qué comando. Cada fila es un paso del CI
menos el último, que es manual.

| Qué | Cómo se mide | Dónde |
| --- | --- | --- |
| Calidad de código | `npm run lint && npm run typecheck && npm test` | CI (Node 20/22/24) |
| SonarCloud | `npm run sonar:exportar` → 0 · Quality Gate A | `sonar.yml` |
| Seguridad | `npm audit --audit-level=high` + CodeQL + token revocado | CI + GitHub Security |
| Layout | `npm run validar:layout` (5 páginas × 23 anchos) | CI |
| Accesibilidad | `npm run validar:a11y` (2 viewports) | CI |
| Rendimiento escritorio | `npm run validar:lighthouse` ≥ 95 | CI |
| Rendimiento móvil | `npm run validar:lighthouse:movil` ≥ 90 | CI (nuevo) |
| CLS | `npm run validar:cls` < 0,05 | CI (nuevo) |
| Demos | `npm run validar:demos` (1018/1018) | CI |
| Producto | embudo GA4: entró → buscó → detalle → descarga | GA4 (semanal) |
| Disponibilidad | health check diario contra producción | Actions (nuevo) |

---

## 6. Matriz impacto / esfuerzo

| Fase | Impacto en notas | Esfuerzo | Riesgo | ¿Bloquea a las demás? |
| --- | --- | --- | --- | --- |
| **1 · Sonar 0 + gate A** | Alto | Medio | Bajo | **Sí** (sin gate no hay red) |
| **4a · Legal** | **Muy alto** | Bajo | Bajo | No |
| **4b · Medición + SEO + release** | **Muy alto** | Medio | Bajo | No |
| **0 · Herramientas y tests** | Alto | Medio-alto | Bajo | **Sí** (habilita el resto) |
| **2 · Accesibilidad** | Medio | Medio | Medio | No |
| **3 · Rendimiento** | Alto | **Alto** | **Alto** | No |
| **5 · Robustez** | Medio | Medio | Bajo | No |
| **6 · Lanzamiento** | Medio | Bajo | Bajo | **Sí** (es el final) |

**Orden recomendado:** 1 → 4a → 0 → 4b → 2 → 5 → 3 → 6.

**¿Por qué ese orden y no el del documento?** Porque es el orden de mayor
retorno por hora invertida y de menor riesgo acumulado:

- La **Fase 1** va primera porque es la única que *protege* todo lo demás:
  sin gate, cualquier fase siguiente puede romper algo y que nadie lo note.
- La **4a** va segunda porque es de las más baratas y de las que más
  mueven el 68 (basta con enlazar desde el pie lo que ya existe).
- La **0** va después porque necesita un hueco de concentración y porque,
  con el gate ya puesto, sus refactors están vigilarados.
- La **3** va la última de las técnicas a propósito: es la de mayor riesgo
  (romper `app.js`) y se hace cuando ya existe red de tests.
- La **6** cierra.

---

## 7. Qué significa "Producto / mercado = 100"

Definición operativa. Si las 20 casillas están marcadas, la nota es 100.

**Legal y cumplimiento (5)**
- [ ] Política de privacidad accesible desde el pie de las 3 páginas, en ES y EN
- [ ] Aviso legal con titularidad y licencias
- [ ] Política de cookies completa
- [ ] Banner de consentimiento sin *dark patterns*, rechazo recordado
- [ ] Declaración de accesibilidad WCAG 2.2 AA

**Descubrimiento (5)**
- [ ] JSON-LD válido (`WebSite`, `SearchAction`, `SoftwareApplication`)
- [ ] `hreflang` es/en
- [ ] Título y descripción distintos por página
- [ ] Sitemap presentado en Search Console
- [ ] Página "cómo usar un componente" en el sitio

**Medición (4)**
- [ ] GA4 con los 5 eventos de producto activos
- [ ] Embudo visible en GA4
- [ ] Core Web Vitals reales (no simulados) llegando a GA
- [ ] Errores de JS de los visitantes visibles

**Confianza y distribución (4)**
- [ ] Release `v1.0.0` publicada con notas
- [ ] Badges en README (CI, Lighthouse, Quality Gate, licencia)
- [ ] Soporte/contacto visible desde la web
- [ ] Manifest de aplicaciones e instalable en Chrome y Safari iOS

**Funcionamiento global (2)**
- [ ] Lighthouse ≥ 95 escritorio y ≥ 90 móvil en las 3 páginas
- [ ] QA en matriz de 6 dispositivos completado

---

## 8. Qué no hace falta (para no dispersarse)

Cosas que parecen obligatorias y no lo son, o que empeorarían la nota:

- **No migrar a React/Next/Vite.** El sitio es HTML/CSS/JS sin build en el
  navegador y eso es una *virtud* (cero JS de terceros, Lighthouse 99 en
  escritorio). Meter un bundler añadiría 200 KB y un paso de compilación
  para arreglar un TBT que se arregla partiendo `app.js`.
- **No servir 1018 demos con *server-side rendering*.** No hay servidor.
- **No añadir un service worker en la primera entrega.** El riesgo de
  servir assets viejos supera el beneficio de offline.
- **No lintear los 1018 demos.** Ya los analiza Sonar; ESLint sobre ellos
  son miles de avisos inservibles.
- **No reescribir los demos.** Solo los que tengan un BUG concreto.
- **No perseguir 100 en Lighthouse móvil con throttling extremo.** El
  preset móvil simula una red que no corresponde a la real; el objetivo es
  90 y medir además en dispositivo real.

---

## 9. Cómo se protege SonarCloud en cada fase

Regla transversal: **ninguna fase termina con el contador subido.**

| Fase | Riesgo concreto para Sonar | Mitigación |
| --- | --- | --- |
| 0 | Los tests nuevos entran como código principal y suman *smells* | `sonar.tests=__tests__` **antes** de escribir el primer test |
| 0 | Prettier reescribe el repo entero y Sonar ve 500 K líneas de "código nuevo" | Prettier acotado a `Web/scripts/**`, en un commit aislado |
| 1 | Al arreglar en lote, un `replace` rompe un demo | `--dry-run` del autofix + `validar:demos` antes de cada commit |
| 2 | Cambiar `role` en las tarjetas dispara reglas Web | Mirar las reglas Web en el PR antes de mergear |
| 3 | Repartir `app.js` en módulos dispara `S3735`, `S1128`, `S1481` | PR dedicado + autofix + `npm run sonar:exportar` antes de subir |
| 4a/4b | Los HTML nuevos pueden traer `Web:` smells | `validar:html` + revisar el PR de SonarCloud |
| 5 | El badge se pone rojo sin que nadie lo mire | El paso `sonar.yml` es **requerido** en `main` |

Y el cierre obligatorio de cada fase:

```bash
npm run sonar:exportar     # -> 0 incidencias abiertas
```

---

## 10. Resumen en una línea por fase

| Fase | Qué consigue | Nota que sube |
| --- | --- | --- |
| **1** | Quality Gate A configurado (hoy `NONE`) y 99 → 0; token revocado | Calidad 92, Seguridad 97 |
| **4a** | 5 documentos legales en el sitio y enlazados desde el pie | Producto 82 |
| **0** | Lint, tipos y tests: el código se autoverifica | Calidad 92 |
| **4b** | JSON-LD, GA4 con embudo, release v1.0.0, instalable | Producto **100** |
| **2** | 0 violaciones de axe en 2 viewports + auditoría manual | Accesibilidad **98** |
| **5** | Presupuestos que **fallan** el CI, no solo informan | Consolida |
| **3** | Móvil ≥ 90, TBT < 200 ms, CLS blindado con test | Rendimiento **96** |
| **6** | QA en matriz de 6 dispositivos + operación semanal | Global **97** |
