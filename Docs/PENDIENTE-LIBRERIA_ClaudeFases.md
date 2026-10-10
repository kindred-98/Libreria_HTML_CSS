# PENDIENTE-LIBRERIA: lo que le falta a Libreria_HTML_CSS

Repo: `kindred-98/Libreria_HTML_CSS` · Web: https://libreria-html-css.vercel.app/Web/
Estado de partida (2026-10-10): publicada, 1.018 demos, 81 tests unitarios, `npm audit` 0, sin dependencias de runtime, demos aisladas con sandbox, CSP y donación validadas en CI.

Lo que sigue **no son fallos**: es lo que separa una colección bien hecha de una librería que la gente adopta. Está ordenado por impacto. Cada bloque tiene tareas con **qué hacer** y **criterio de aceptación**.

---

## 0. Reglas de trabajo (para quien ejecute el plan, humano o agente)

1. Una rama y una PR por bloque. Nada directo a `main`.
2. Antes de cada commit deben pasar: `npm run validar`, `npm test`, `npm run test:e2e`, `npm run validar:demos`, `npm run lint`, `npm run format:check`, `npm run typecheck`.
3. No se editan a mano los archivos generados (`Web/data/catalog.json`, `Web/data/sources/*`, ZIP, sitemap). Se regeneran con los scripts del repo.
4. No se añaden dependencias de **runtime** al sitio. Los paquetes que se publiquen (npm, React) viven en carpetas y `package.json` propios; el sitio sigue sin depender de ellos.
5. No se debilitan tests, validadores ni presupuestos para que algo pase.
6. Cada PR incluye cifras reales antes/después cuando mida algo. No se afirman mejoras sin medirlas.
7. Los cambios de diseño visible se marcan "requiere revisión humana".
8. Los 3 autores (Davoker, kindred-98, fatmaerm) siguen acreditados en cada componente. Ninguna tarea cambia autorías ni licencias.

---

## 1. Documentación por componente (impacto: alto)

**Hoy:** cada componente tiene título, descripción corta y demo. No tiene página de referencia.

**Qué hacer:**
1. Definir una plantilla de ficha en `Web/` (se genera en build desde `catalog.json`) con: nombre, autor, licencia, categoría, demo en vivo, pestañas HTML / CSS / JS con botón **Copiar**, peso (KB), dependencias (ninguna / fuentes / imágenes externas) y atribución de imágenes si las usa.
2. Añadir a cada fuente un bloque opcional de documentación (`docs.md` o campos en el catálogo) con: cuándo usarlo, cómo personalizarlo (variables CSS, colores, tamaños), accesibilidad (teclado, `prefers-reduced-motion`, roles ARIA) y límites conocidos.
3. Empezar por los **100 componentes más visitados o más completos** (elegirlos con un criterio escrito en `Docs/`), no por los 1.018.
4. Que la ficha tenga URL propia y estable (`/Web/componente/<id>`) para poder enlazarla y para el sitemap.

**Aceptación:** 100 fichas generadas en build; `npm run validar:enlaces` y `validar:a11y` pasan sobre ellas; Lighthouse SEO sigue en 100; el copiar funciona en teclado y móvil (test e2e).

---

## 2. Paquete npm y CDN (impacto: alto)

**Hoy:** se usa abriendo la web y descargando un ZIP. No hay `npm install` ni enlace de CDN.

**Qué hacer:**
1. Decidir el nombre del paquete (con scope propio, por ejemplo `@kindred-98/...`) y comprobar que está libre en npm antes de nada.
2. Crear `packages/core/` con su propio `package.json`: `exports` por componente (`.../boton-neon/style.css`, `.../boton-neon/index.js`), `files` restringido solo a los archivos permitidos por `Web/scripts/lib/extensiones.mjs`, `sideEffects` correcto y `license` coherente con `Docs/THIRD_PARTY_NOTICES.md`.
3. Excluir del paquete las galerías que cargan fotos de Wikimedia Commons, o incluirlas con su atribución completa, y dejarlo escrito en el README del paquete. No publicar nunca imágenes sin licencia clara.
4. Versionado semántico, etiquetas de Git y GitHub Releases reales (`v1.1.0`, etc.), con `CHANGELOG.md` automático desde commits.
5. Publicar con **provenance** (`npm publish --provenance`) desde GitHub Actions, usando token de automatización con 2FA. Sin tokens en el repo.
6. Servir el mismo contenido por CDN a través de las etiquetas de GitHub (jsDelivr) y documentar la URL con versión fija. Añadir ese host a la CSP solo si el propio sitio lo usa.
7. Un script de CI que compruebe que el paquete publicado contiene exactamente lo que dice `files`, sin archivos sueltos (`npm pack --dry-run` + comparación).

**Aceptación:** `npm install <paquete>` funciona en un proyecto de prueba; importar un componente por subruta funciona; `npm pack --dry-run` no lista nada fuera de la lista blanca; la release lleva provenance visible en npm.

---

## 3. Versiones en React (impacto: alto, coste: alto)

**Hoy:** no hay equivalentes para frameworks, y es lo que la mayoría busca.

**Qué hacer:**
1. Piloto con **10 componentes** de categorías distintas (botón, tarjeta, formulario, indicador de carga, efecto, navegación…). Si el piloto no convence, parar ahí.
2. Paquete separado (`packages/react/`) con TypeScript y tipos exportados. Sin `dangerouslySetInnerHTML`; todo con elementos y `textContent`, igual que exige `validate.mjs` en las demos.
3. Cada componente React reutiliza el **mismo CSS** que la demo original, para que no haya dos versiones que se desincronicen. Documentar cómo se garantiza (importar el CSS del paquete core).
4. Tests con Playwright por componente (render, teclado, `prefers-reduced-motion`).
5. Solo después del piloto, ampliar a 50-100 componentes, empezando por los más usados.
6. Valorar Vue/Svelte solo si hay peticiones reales en issues.

**Aceptación:** 10 componentes publicados con tipos y tests; un proyecto de ejemplo en `examples/react/` que los usa; `npm run typecheck` sin errores en el paquete.

---

## 4. Comunidad y contribuciones externas (impacto: alto)

**Hoy:** hay `CONTRIBUTING.md` y `CODE_OF_CONDUCT.md`, y el post invita a abrir issues y PR. No he visto contribuciones externas.

**Qué hacer:**
1. Plantillas de issue en `.github/ISSUE_TEMPLATE/` (bug en un componente, propuesta de componente, mejora de documentación) y plantilla de PR con la lista de comprobaciones (`validar`, `validar:demos`, licencia y autoría).
2. En `CONTRIBUTING.md`, una sección **"Cómo añadir un componente en 10 minutos"** con la estructura exacta de carpeta, el LICENSE requerido y los comandos a ejecutar.
3. Etiquetar 10-15 issues como `good first issue` y `help wanted` (por ejemplo: documentar un componente, añadir `prefers-reduced-motion` a uno concreto, traducir una ficha).
4. Activar GitHub Discussions para ideas y dudas.
5. Un workflow que, en cada PR de un componente nuevo, ejecute `validar:demos` y comente el resultado con claridad para el que contribuye.
6. Reconocer a los que contribuyen en el README o en una página de créditos.

**Aceptación:** una persona ajena al proyecto puede añadir un componente siguiendo solo `CONTRIBUTING.md` y que el CI le diga qué falla sin leer el código del repo.

---

## 5. Calidad por demo, no solo por página (impacto: medio)

**Hoy:** `validar:a11y`, Lighthouse y CLS miden las páginas del sitio. Las 1.018 demos se comprueban con `smoke-demos.mjs` (carga, aislamiento, sin errores), pero no con accesibilidad ni presupuestos de peso propios.

**Qué hacer:**
1. Ejecutar axe (ya está `@axe-core/playwright`) sobre **cada demo** en un job aparte, con una lista de excepciones documentada. No debe bloquear al principio: primero generar el informe en `Docs/` y medir cuántas fallan.
2. Comprobar `prefers-reduced-motion` en las demos animadas (ya existe `add-reduced-motion.mjs`; falta un validador que lo exija).
3. Presupuesto de peso por demo (KB de HTML+CSS+JS+imágenes propias) con un máximo razonable y una lista de las más pesadas.
4. Subir la exigencia de forma gradual: primero informe, luego aviso, luego fallo, y solo para las categorías que ya estén limpias.

**Aceptación:** informe de accesibilidad por demo en `Docs/`; validador de `prefers-reduced-motion` en CI; presupuesto de peso por demo documentado.

---

## 6. Cohesión visual y de uso (impacto: medio)

**Hoy:** son demos sueltas de tres autores, sin variables de diseño comunes. Eso es una galería, no un sistema.

**Qué hacer:**
1. No forzar un sistema único sobre las 1.018. Definir un conjunto **opcional** de variables CSS (`--lib-color-primario`, `--lib-radio`, `--lib-espaciado`…) y adaptar los 100 componentes documentados del bloque 1 para que las acepten con valores por defecto iguales a los actuales.
2. Guía en `Docs/` de cómo tematizar un componente (claro/oscuro, color de marca).
3. Etiquetas de categoría y de estilo consistentes en el catálogo para que el filtro sea útil (hoy hay "Otros", que suele esconder cosas).

**Aceptación:** los componentes adaptados se ven idénticos con los valores por defecto (comparación visual en e2e) y cambian al sobrescribir las variables.

---

## 7. Verificaciones que solo puede hacer el responsable del proyecto

Esto no se delega a un agente: requiere acceso a GitHub, Vercel o a la web real.

- [ ] **CSP en producción:** `curl -sI https://libreria-html-css.vercel.app/Web/components.html | grep -i content-security-policy` debe mostrar la política de `/Web/` sin `'unsafe-inline'` en `script-src`. Si sale la general, corregir el orden o el patrón en `vercel.json`.
- [ ] **CI y SonarCloud en verde en `main`** (no solo en las PR).
- [ ] **PageSpeed Insights sobre producción** (móvil y escritorio). Guardar las cifras reales en `Docs/` antes de citarlas en ningún sitio.
- [ ] **Protección de `main`**, secret scanning y private vulnerability reporting activos en GitHub.
- [ ] **Revisión de los 54 `NOSONAR` y los 5 WONTFIX** (`Docs/03-sonar/Sonar_decisiones`): confirmar que cada uno sigue justificado.
- [ ] **Mensaje contradictorio de `validar:licencias`** ("248 redistribuibles / 770 con downloadable=false") frente a las 1.018 descargables del catálogo. Corregir el texto del validador o el dato.
- [ ] **`style-src 'unsafe-inline'`** sigue en la CSP de `/Web/`. Reducirlo si es viable; si no, dejar escrito por qué.
- [ ] **Si algún día se cobra por la biblioteca:** revisar con una persona la licencia de cada demo y las CC BY-SA de las 676 fotos de Wikimedia Commons.

---

## Orden recomendado

1. Bloque 7 (verificaciones): una tarde y quita riesgo.
2. Bloque 4 (comunidad) y bloque 1 (documentación): son baratos y hacen que la gente que llega se quede.
3. Bloque 2 (npm y CDN): es lo que más abre la puerta a que la usen en proyectos reales.
4. Bloque 5 (calidad por demo) en paralelo y en modo informe.
5. Bloque 3 (React) solo cuando el 2 esté publicado y haya señales de uso.
6. Bloque 6 (cohesión) cuando los 100 componentes documentados estén listos.

## Definición de terminado

- [ ] Fichas de referencia para 100 componentes, con copiar y accesibles.
- [ ] Paquete npm publicado con provenance y subrutas por componente.
- [ ] 10 componentes en React con tipos y tests (o decisión escrita de no continuar tras el piloto).
- [ ] Plantillas de issue/PR, guía de contribución probada con una persona externa y 10+ `good first issue`.
- [ ] Informe de accesibilidad por demo y validador de `prefers-reduced-motion` en CI.
- [ ] Todas las casillas del bloque 7 marcadas.

---

## 8. Fases de aplicación (cómo ejecutarlo paso a paso)

Tamaños relativos: **S** = una sesión de trabajo, **M** = varias sesiones, **L** = varias semanas de trabajo repartido. No son estimaciones en horas: dependen de cuánto tiempo le dediques y de lo que descubra cada fase.

Regla general: **no empieces una fase hasta cumplir su condición de entrada**, y no pases a la siguiente sin cumplir su salida.

### Fase 0: línea base y verificaciones (S)
- **Entra cuando:** ya (el sitio está publicado).
- **Qué se hace:** bloque 7 completo. Guardar en `Docs/` las cifras reales de PageSpeed (móvil y escritorio), el estado del CI y el Quality Gate de Sonar. Etiquetar el commit actual como `v1.0.0`.
- **PRs:** una sola, solo documentación (`docs/linea-base`).
- **Sale cuando:** todas las casillas del bloque 7 están marcadas y hay una línea base escrita con la que comparar después.
- **Por qué primero:** sin esas cifras no puedes demostrar que las fases siguientes mejoran algo.

### Fase 1: que quien llegue se quede (M)
- **Entra cuando:** Fase 0 terminada.
- **Qué se hace:** bloque 4 (plantillas, guía de contribución, `good first issue`, Discussions) y bloque 1 en dos pasos: primero **10 fichas piloto**, y solo si funcionan, hasta **100**.
- **PRs:** `comunidad/plantillas`, `docs/ficha-piloto`, `docs/fichas-100`.
- **Sale cuando:** una persona ajena puede añadir un componente solo con `CONTRIBUTING.md`, y las 100 fichas pasan `validar:enlaces`, `validar:a11y` y Lighthouse SEO 100.
- **Mira los comentarios del post de LinkedIn:** si piden algo concreto, mueve esa petición a esta fase.

### Fase 2: distribución (M)
- **Entra cuando:** Fase 1 terminada (para que haya fichas a las que enlazar desde el paquete).
- **Qué se hace:** bloque 2 completo. Primero comprobar que el nombre del paquete está libre en npm, luego `packages/core/`, luego publicación con provenance, luego CDN.
- **PRs:** `npm/estructura-paquete`, `npm/ci-publicacion`, `npm/cdn-docs`.
- **Sale cuando:** `npm install` funciona en un proyecto de prueba y `npm pack --dry-run` no lista nada fuera de la lista blanca.
- **Cuidado:** si dudas sobre las licencias de las fotos de Commons, deja las galerías fuera del primer paquete.

### Fase 3: calidad por demo, en modo informe (M)
- **Entra cuando:** Fase 1 terminada. Puede ir **en paralelo** con la Fase 2.
- **Qué se hace:** bloque 5. Axe sobre cada demo y validador de `prefers-reduced-motion`, **sin bloquear el CI todavía**.
- **PRs:** `calidad/informe-a11y`, `calidad/reduced-motion`, `calidad/presupuesto-peso`.
- **Sale cuando:** hay un informe en `Docs/` con cuántas demos fallan y por qué, y los validadores están en CI como aviso.
- **Endurecer después:** pasar a fallo solo las categorías que ya estén limpias.

### Fase 4: React, primero un piloto (L)
- **Entra cuando:** Fase 2 terminada **y** hay alguna señal de uso (descargas del paquete, issues o comentarios pidiéndolo). Si no la hay, no empieces.
- **Qué se hace:** bloque 3. Solo 10 componentes. Al terminar, decidir por escrito si se continúa.
- **PRs:** una por componente o por pequeño grupo, nunca los 10 de golpe.
- **Sale cuando:** 10 componentes con tipos y tests, un ejemplo en `examples/react/` y una nota de decisión en `Docs/` (continuar o parar).

### Fase 5: cohesión (M)
- **Entra cuando:** Fase 1 terminada (necesita los 100 componentes ya documentados).
- **Qué se hace:** bloque 6. Variables CSS opcionales en esos 100 y guía de temas.
- **Sale cuando:** los componentes se ven idénticos con los valores por defecto (comparación visual en e2e) y cambian al sobrescribir las variables.

### Resumen visual

```
Fase 0 ──► Fase 1 ──┬──► Fase 2 ──► Fase 4 (solo con señales de uso)
                    ├──► Fase 3 (paralelo, en modo informe)
                    └──► Fase 5
```

## 9. Cómo dárselo a OpenCode

Pon este archivo en la raíz del repo (o en `Docs/`) y usa una instrucción por fase. Plantilla:

```
Lee PENDIENTE-LIBRERIA.md completo, especialmente la sección 0 (reglas).
Ejecuta SOLO la Fase N. No hagas tareas de otras fases.
- Una rama y una PR por cada bloque o PR indicada en la fase.
- Antes de cada commit ejecuta los comandos de la regla 2 y dime el resultado.
- Si algo del plan no encaja con lo que ves en el repo, para y explícamelo en vez de improvisar.
- Al terminar, resume: qué cambió, qué mediste (antes/después) y qué queda sin cumplir de la condición de salida.
```

Ejemplo para la primera: sustituye `N` por `0` y deja que él te pase las cifras; las casillas que necesiten tu acceso a GitHub o Vercel las haces tú.

**No le pidas varias fases a la vez.** Cuanto más grande es el encargo, más probable es que se salte reglas o rompa algo que luego cuesta localizar.
