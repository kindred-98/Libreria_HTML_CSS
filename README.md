<div align="center">

# Biblioteca HTML y CSS

**1 018 demos independientes** de interfaz, en HTML y CSS sin dependencias.
Copia, pega y adapta.

[![CI](https://github.com/kindred-98/Libreria_HTML_CSS/actions/workflows/validate.yml/badge.svg)](https://github.com/kindred-98/Libreria_HTML_CSS/actions/workflows/validate.yml)
[![CodeQL](https://github.com/kindred-98/Libreria_HTML_CSS/actions/workflows/codeql.yml/badge.svg)](https://github.com/kindred-98/Libreria_HTML_CSS/actions/workflows/codeql.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=kindred-98_Libreria_HTML_CSS&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kindred-98_Libreria_HTML_CSS)
[![Licencia](https://img.shields.io/badge/licencia-MIT-d4f779?style=flat-square&labelColor=1b231c)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-5FA04E?style=flat-square&labelColor=1b231c)](./package.json)

[**Ver la biblioteca**](https://libreria-html-css.vercel.app/) · [Privacidad](./Web/privacidad.html) · [Aviso legal](./Web/legal.html)

</div>

---

## Qué es

Una colección de **1 018 demos** de interfaz web, repartidos en tres
colecciones, con buscador, filtros, vistas previas reales y **descarga del
código fuente en ZIP**. Cada demo es un componente autónomo pensado para
copiarse tal cual: no hay framework, ni paso de compilación, ni
dependencias que instalar para usarlo.

| Colección | Qué contiene | ZIP |
| --- | --- | --- |
| [`CreacionesNuevas/`](./CreacionesNuevas/) | **248** creaciones originales del autor, cada una con su `LICENSE` MIT propio | Sí |
| [`creaciones-primium/`](./creaciones-primium/) | **651** creaciones en curso por categorías (de **kindred-98** y **fatmaerm**) | Sí |
| [`DavokerDiseñador/`](./DavokerDiseñador/) | **119** efectos de texto de **davoker**, cada uno con su showcase y su `.zip` | Sí |

**Los 1 018 son descargables.**

> `GevendraAutorExterno/` **no forma parte del repositorio**. Está en
> `.gitignore`, no está en el disco y sus 116 demos no se catalogan ni se
> sirven: su material no declara licencia. Ver [Material retirado](#material-retirado).

---

## Características

- **Búsqueda** por nombre, categoría, descripción y etiquetas, sin distinguir
  mayúsculas.
- **Filtros** por categoría (inferidas del nombre del demo) y por autor. Cada
  botón lleva su propia animación: davoker *Liquid Fill*, kindred-98
  *Datamosh*, fatmaerm *Neutron Star*.
- **Vistas previas reales**: cada tarjeta carga el `index.html` original en un
  `iframe`. No son capturas.
- **Código fuente a la vista**: el detalle trae el HTML, el CSS y el JavaScript
  de cada demo, con botones de copia.
- **Descarga en ZIP** solo tras verificar la fuente, los permisos de
  redistribución y la licencia individual de cada pieza.
- **Tema oscuro y claro**, con la preferencia recordada en el navegador.
- **Interfaz en español e inglés**, con el idiomaindependiente independiente del tema.
- **Accesible**: navegación por teclado, foco visible, `prefers-reduced-motion`
  respetado y **0 violaciones serious ni critical** en axe-core.
- **Instalable**: se puede añadir a la pantalla de inicio como aplicación.
- **Sin frameworks, sin backend, sin paso de compilación.**

---

## Dependencias

### En producción: ninguna

El sitio es HTML, CSS y JavaScript a pelo. **No hay `node_modules` en
producción, ni framework, ni bundler.** Todo lo que se descarga el visitante
son los ficheros del repositorio.

Esto es deliberado: el sitio carga sin build, funciona sin JavaScript en las
páginas de texto, y su `Lighthouse` de escritorio está en **99-100**.

### De desarrollo (9 paquetes, todos `devDependencies`)

Se usan **solo** para generar el catálogo, validar y medir. No se despliegan.

| Paquete | Para qué |
| --- | --- |
| [`playwright`](https://playwright.dev) | Abrir Chromium en los validadores de layout, accesibilidad, Lighthouse y los tests e2e |
| [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/%40axe-core/playwright) | Motor de accesibilidad |
| [`lighthouse`](https://developer.chrome.com/docs/lighthouse/overview) | Medición de rendimiento y SEO |
| [`html-validate`](https://html-validate.org) | Validar el HTML de las páginas del sitio |
| [`chrome-launcher`](https://github.com/GoogleChrome/chrome-launcher) | Arrancar el Chromium que usa Lighthouse |
| [`eslint`](https://eslint.org) | Lint del código de Node |
| [`prettier`](https://prettier.io) | Formato del código de Node |
| [`typescript`](https://www.typescriptlang.org) | Solo para `tsc --checkJs`: tipos sobre JavaScript |
| `@types/node` | Tipos de Node para el anterior |

**Instalar:**

```bash
npm install
npx playwright install chromium   # solo si vas a medir o a correr los e2e
```

**Requisitos:** Node.js **20 o superior** (lo declara `engines`).

---

## Empezar

### Ver la biblioteca

```bash
npm install
npm run catalogo     # genera Web/data/catalog.json y sources/
npm run servidor     # sirve el repositorio en http://localhost:8000
```

Abre <http://localhost:8000/>. La raíz redirige a `/Web/`.

### Usar un componente

1. Busca en la biblioteca o ve a [`components.html`](./Web/components.html).
2. Abre el detalle: verás la demo en vivo y su código fuente.
3. Copia el HTML, el CSS o el JavaScript, o descarga el **ZIP** con todo.

No hace falta instalar nada para usar un componente: es copiar y pegar.

### Los comandos disponibles

```bash
# Generar y servir
npm run catalogo          # regenera el catálogo desde el disco
npm run catalogo:watch    # lo anterior, pero se repite solo al guardar
npm run servidor          # servidor estático local, sin dependencias
npm run sitemap           # regenera sitemap.xml con las fechas de git
npm run iconos            # regenera los iconos PNG de la PWA
npm run sellar            # sella el ?v= de los assets (lo hace el despliegue)
npm run zips              # reconstruye los ZIP de Davoker

# Comprobar
npm test                  # 48 tests unitarios
npm run test:e2e          # 15 tests de extremo a extremo
npm run lint              # ESLint sobre Web/scripts/
npm run lint:fix          # lo anterior, corregiendo
npm run format:check      # Prettier
npm run format            # Prettier, escribiendo
npm run typecheck         # tsc --checkJs, con presupuesto

# Los validadores del sitio (lo que corre el CI)
npm run validar           # catálogo coherente con el disco + CSP
npm run validar:csp       # la CSP cubre los hosts externos de los demos
npm run validar:layout    # que ninguna página se salga de lado (23 anchos)
npm run validar:a11y      # axe-core en 5 páginas, 2 idiomas y 2 temas
npm run validar:encabezados # que los demos no salten de nivel de encabezado
npm run validar:html      # HTML válido de las páginas del sitio
npm run validar:enlaces   # enlaces y anclas internas
npm run validar:demos     # abre los 1 018 demos y los mide
npm run validar:lighthouse # rendimiento y SEO de las 5 páginas
npm run duplicados        # detecta demos demasiado parecidos
npm run enlaces:externos  # comprueba que los enlaces externos siguen vivos

# SonarQube
npm run sonar:exportar    # descarga las incidencias a tmp/sonar/
```

---

## Estructura

```text
.
|-- CreacionesNuevas/           # 248 creaciones propias del autor (MIT, ZIP)
|-- creaciones-primium/         # 651 creaciones en curso, por categorías (MIT, ZIP)
|-- DavokerDiseñador/           # 119 efectos de texto de davoker + su portada
|-- Web/
|   |-- index.html              # Portada
|   |-- components.html         # Listado y detalle de componentes
|   |-- team-core.html          # Equipo y donación
|   |-- privacidad.html         # Política de privacidad
|   |-- legal.html              # Aviso legal y declaración de accesibilidad
|   |-- manifest.webmanifest    # Para instalarla como aplicación
|   |-- styles/site.css         # Estilos del sitio
|   |-- scripts/
|   |   |-- app.js              # Búsqueda, filtros, detalle, tema e i18n
|   |   |-- lib/                # Utilidades puras con sus tests
|   |   |-- generate-catalog.mjs # Genera el catálogo desde el disco
|   |   |-- validar-*.mjs       # Los validadores que corre el CI
|   |   `-- ...
|   `-- data/                   # GENERADO en el despliegue, no versionado
|-- .github/                    # CI, plantillas de incidencias, Dependabot
|-- Docs/                       # Auditorías, planes, notas de sesión y decisiones
|-- CHANGELOG.md                # Qué cambió en cada commit
|-- CONTRIBUTING.md             # Cómo añadir un componente
|-- CODE_OF_CONDUCT.md          # Convivencia y canal de denuncias
|-- SECURITY.md                 # Cómo reportar un fallo de seguridad
|-- PRIVACY.md                  # Qué datos se recogen (fuente de la página del sitio)
`-- LICENSE
```

### El catálogo se genera en el despliegue

`Web/data/catalog.json`, `Web/data/catalog.js` y `Web/data/sources/` son
**artefactos generados** y **no están versionados**. Se producen en el build,
antes de servir nada.

La razón práctica: añadir un demo no exige ningún paso manual y dos personas
(o dos agentes) pueden trabajar a la vez sin que sus cambios choquen sobre los
mismos 1 018 ficheros de `sources/`. Lo único que hay que recordar en local
antes de abrir el sitio es `npm run catalogo`.

`Web/data/component-overrides.json` **sí** está versionado: se edita a mano.

---

## Añadir un demo

1. Crea una carpeta dentro de `creaciones-primium/` con un `index.html` y sus
   recursos. Nombre en `kebab-case` y descriptivo, por ejemplo `image-gallery/`.
2. Enlaza el CSS y el JavaScript locales desde ese HTML.
3. Ejecuta `npm run catalogo`.
4. Si hace falta, añade metadatos revisados a
   `Web/data/component-overrides.json`:

```json
{
  "my-hover-card": {
    "category": "Cards",
    "description": "A concise, accurate description of the demo.",
    "descriptionEs": "Descripción concisa y precisa del demo.",
    "tags": ["card", "hover"],
    "source": "https://example.com/original-source",
    "license": "MIT",
    "licenseFile": "LICENSE",
    "redistributable": true
  }
}
```

Pon `redistributable: true` **solo** después de confirmar los permisos del
código y de todos los recursos incluidos. Sin eso y sin un archivo de licencia
válido en la carpeta, el botón ZIP permanece deshabilitado.

Las categorías se infieren de los nombres y se añaden solas. El ID del demo
sale de su ruta en minúsculas con guiones.

---

## Validación continua

El workflow [`validate.yml`](./.github/workflows/validate.yml) corre en cada
`push` a `main` y en cada pull request. **No despliega nada**: reproduce lo
que hace Vercel y lo comprueba, para que si el catálogo, el sellado o los ZIP
fallan, se vea en GitHub antes de llegar a producción.

Roda sobre la matriz de Node `[20, 22, 24]` en `ubuntu-24.04`, con
`fail-fast: false`, y las acciones **fijadas por SHA** (un tag se puede mover
por quien tenga escritura).

| Comprobación | Qué mide |
| --- | --- |
| `npm audit --audit-level=high` | Vulnerabilidades de dependencias |
| `format:check`, `lint`, `typecheck`, `test` | Estilo, errores, tipos y 48 tests |
| `validar` | Que el catálogo cuadre con el disco, y la CSP |
| `validar:layout` | 5 páginas × 23 anchos, con navegador real |
| `validar:a11y` | axe-core: 5 páginas × 2 idiomas × 2 temas |
| `validar:lighthouse` | Rendimiento y SEO de las 5 páginas |
| `validar:demos` | Abre los **1 018 demos** con el sandbox de producción |

`validate.mjs` comprueba, entre otras cosas, que **ningún demo del disco falte
en el catálogo**: un demo nuevo sin indexar no aparecería en la web sin ningún
otro síntoma.

---

## Despliegue

Es estático y no necesita backend. El repositorio incluye
[`vercel.json`](./vercel.json) y [`.vercelignore`](./.vercelignore).

- **Framework Preset:** `Other`
- **Output Directory:** `.` (la raíz del repositorio, no un subdirectorio: las
  vistas previas cargan `../CreacionesNuevas/...`).
- **Build Command:** el de `vercel.json`. **No lo dejes en blanco** en el
  panel, o sobrescribes el valor del fichero.

Se despliega la **raíz** porque las vistas previas necesitan las carpetas de
demos. `vercel.json` redirige `/` → `/Web/`, sirve `/robots.txt` y
`/sitemap.xml` desde la raíz (es donde los busca Google) y añade las cabeceras
de seguridad: `Content-Security-Policy`, `Strict-Transport-Security`,
`Permissions-Policy`, `X-Content-Type-Options`, `X-Frame-Options` y
`Referrer-Policy`.

**GitHub Pages no se usa** (solo podría publicar una versión recortada por
licencias) y **Netlify** tampoco hace falta.

---

## Licencias y procedencia

La MIT de la raíz cubre el **código de la aplicación y la documentación**, no
los demos ni los recursos de terceros. Cada colección lleva sus propios
términos, y cada ZIP incluye su `LICENSE` y un `ATTRIBUTION.txt`.

- **`CreacionesNuevas/`**: creaciones originales, `LICENSE` MIT propio cada una.
- **`creaciones-primium/`**: comparten el `LICENSE` MIT de la carpeta, que nombra
  a las dos autoras.
- **`DavokerDiseñador/`**: MIT del autor de origen.

Las **86 galerías** (676 fotografías) enlazan imágenes de Wikimedia Commons con
el autor y la licencia impresos en la propia página. El inventario completo
está en [`Docs/THIRD_PARTY_NOTICES.md`](./Docs/THIRD_PARTY_NOTICES.md).

Antes de publicar un demo, verifica la procedencia y las condiciones de su
código, imágenes, fuentes, iconos y dependencias.

### Material retirado

`GevendraAutorExterno/` **no forma parte del repositorio**: está en
`.gitignore` y no está en el disco de un clon nuevo. Sus 116 demos proceden de
[`gevendra2004/gevstack`](https://github.com/gevendra2004/gevstack), que **no
declara licencia** y cuyo autor no respondió a los contactos hechos para pedir
permiso. Sin licencia no hay permiso de redistribución, así que se retiraron
también de `git`, del catálogo y del despliegue. Volver a publicarlos exige su
**autorización escrita** o que añada una licencia a su repositorio.

---

## Documentación

| Documento | Qué contiene |
| --- | --- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Cómo añadir un componente y abrir un PR |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | Convivencia y canal de denuncias |
| [`SECURITY.md`](./SECURITY.md) | Cómo reportar un fallo de seguridad (**no por issue**) |
| [`PRIVACY.md`](./PRIVACY.md) | Fuente de la política de privacidad del sitio |
| [`CHANGELOG.md`](./CHANGELOG.md) | Qué cambió en cada commit |
| [`Docs/Plan_de_nivel_siguiente.md`](./Docs/Plan_de_nivel_siguiente.md) | Plan por fases para llevar el proyecto al 97 |
| [`Docs/Sesion_2026-10-05_06.md`](./Docs/Sesion_2026-10-05_06.md) | Cierre de las fases 0, 1, 2, 4a y 4b, con lo que queda |
| [`Docs/Sonar_decisiones.md`](./Docs/Sonar_decisiones.md) | Qué se **no** corrigió de SonarQube, y por qué |
| [`Docs/Search_Console.md`](./Docs/Search_Console.md) | Estado del descubrimiento en buscadores |
| [`Docs/AnalisisSonarQube.md`](./Docs/AnalisisSonarQube.md) | Análisis del quality gate y limpieza de SonarQube |
| [`Docs/THIRD_PARTY_NOTICES.md`](./Docs/THIRD_PARTY_NOTICES.md) | Procedencia y licencias de cada componente |

En el sitio: [Privacidad](https://libreria-html-css.vercel.app/Web/privacidad.html)
· [Aviso legal y accesibilidad](https://libreria-html-css.vercel.app/Web/legal.html)

---

## Contribuir

Lee antes [`CONTRIBUTING.md`](./CONTRIBUTING.md): explica las tres
colecciones, cuándo usar cuál y la convención de los demos. Participar implica
aceptar el [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

Si has encontrado un **fallo de seguridad**, no lo reportes por issue: lee
[`SECURITY.md`](./SECURITY.md).

---

<div align="center">

**1018 demos** · MIT · sin dependencias en producción

Hecho con HTML, CSS y JavaScript a pelo.

</div>