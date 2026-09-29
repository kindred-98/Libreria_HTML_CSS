# Cómo contribuir

Gracias por querer añadir algo. Esta guía recoge las convenciones del repositorio para que una contribución se integre sin fricción.

Si has encontrado un fallo de seguridad, no lo reportes aquí: lee [`SECURITY.md`](./SECURITY.md).

## Las tres colecciones

No todas las carpetas son iguales. Cuál eliges determina si el componente puede descargarse.

| Carpeta | Qué contiene | ZIP |
| --- | --- | --- |
| `CreacionesNuevas/` | Creaciones del autor, con `LICENSE` MIT propia | **Habilitado** |
| `creaciones-primium/` | Creaciones en curso, agrupadas por categoría (`botones/`, `animaciones/`, …) | Deshabilitado mientras no lleven `LICENSE` |
| `GevendraAutorExterno/` | Demos de terceros, sin licencia de redistribución | Deshabilitado, y no se tocan |

**Al añadir un componente, la opción correcta es `creaciones-primium/`**, dentro de la categoría que le toque. `CreacionesNuevas/` es el archivo histórico de lo ya publicado.

## Reglas para un componente nuevo

**1. Carpeta en `kebab-case`, todo en minúsculas.** El nombre de la carpeta *es* el identificador del componente: `animated-dial-button/` produce el id `animated-dial-button`. Usa un nombre funcional, sin marcas personales.

```text
creaciones-primium/botones/animated-dial-button/
├── index.html
├── styles.css
├── script.js      # solo si lo necesita
└── LICENSE        # opcional; sin él el ZIP queda deshabilitado
```

**2. Un `index.html` por componente.** Es lo que el generador busca. Los recursos van en la misma carpeta o en subcarpetas (`assets/`, `images/`).

**3. Enlaza los ficheros locales con rutas relativas.** Nada de rutas absolutas ni de `file://`:

```html
<link rel="stylesheet" href="styles.css">
<script src="script.js" defer></script>
```

**4. Cuida las mayúsculas y minúsculas del nombre de carpeta.** Este es el error que más problemas ha causado. El catálogo construye la ruta de la vista previa a partir del nombre en disco, así que si `Mi-Boton/` está en el repositorio como `Mi-Boton` y en el catálogo como `mi-boton`, la vista previa da 404 en Linux y **no se nota en Windows**, porque el sistema de archivos no distingue mayúsculas. Escribe siempre en minúsculas y comprueba con `git ls-files` que coincide.

**5. Sin dependencias.** El proyecto no tiene `dependencies` ni `devDependencies`, y no debe empezar a tenerlas. Todo el JavaScript es vanilla y vive en la carpeta del componente o en `Web/scripts/`.

**6. Cada componente es independiente.** Se abre directamente en el navegador, con su HTML, CSS y JavaScript. No puede depender de nada externo salvo una fuente o una biblioteca vía CDN, y en ese caso con la versión **fijada** (`@5.5.2`), nunca `@5` a secas.

## Después de añadir el componente

```powershell
node Web/scripts/generate-catalog.mjs
```

Ese es el paso obligatorio. Genera `Web/data/catalog.json` y `Web/data/sources/`, y el sitio recoge el componente automáticamente. También funciona con `npm run catalogo`.

**No hagas commit de los datos generados.** `Web/data/catalog.json`, `Web/data/catalog.js` y `Web/data/sources/` están en `.gitignore` porque los produce el build de Vercel. Si los subes, crearás conflictos con cualquier otra contribución.

Comprueba que todo cuadra:

```powershell
node Web/scripts/validate.mjs
```

Este script falla si un componente del disco no está en el catálogo, si un `sources/*.json` sobra o falta, si un `preview` apunta a un fichero inexistente, o si hay referencias locales rotas. Es lo mismo que corre en CI, así que si pasa en local, pasará en GitHub.

Y míralo en el navegador:

```powershell
node Web/scripts/serve.mjs
```

Abre <http://localhost:8000/>. La página inicial redirige a `/Web/`, y el listado está en `/Web/components.html`.

## Metadatos revisados

Las categorías se infieren del nombre de la carpeta, y normalmente acierta. Cuando falle, o cuando quieras añadir una descripción, edita `Web/data/component-overrides.json`. **Este fichero sí se versiona**, porque se escribe a mano.

El identificador es la ruta de la carpeta en minúsculas, con guiones como separadores. Las carpetas anidadas también cuentan: `creaciones-primium/botones/animated-dial-button` da el id `botones-animated-dial-button`.

```json
{
  "botones-animated-dial-button": {
    "description": "A rotary dial that rotates smoothly to a chosen value.",
    "descriptionEs": "Un dial rotativo que gira con suavidad hasta el valor elegido.",
    "tags": ["button", "dial", "control"],
    "source": "https://github.com/kindred-98/Libreria_HTML_CSS",
    "license": "MIT",
    "licenseFile": "LICENSE",
    "redistributable": true
  }
}
```

| Campo | Para qué sirve |
| --- | --- |
| `description` | Texto de la tarjeta en inglés. Obligatorio si quieres que se vea bien |
| `descriptionEs` | Traducción al español. Si falta, la interfaz muestra el inglés |
| `category` | Corrige la categoría inferida |
| `tags` | Alimenta la búsqueda |
| `featured` | `true` lo muestra en la sección de destacados |
| `source` | De dónde viene. **Obligatorio** para habilitar la descarga |
| `license` | Tipo de licencia. **Obligatorio** para habilitar la descarga |
| `licenseFile` | Ruta del fichero de licencia dentro de la carpeta |
| `redistributable` | `true` solo si has comprobado los derechos |

## Sobre las licencias

Esto es lo que más responsabilidad implica, así que léelo con calma.

`redistributable: true` habilita el botón de descarga ZIP, y con él el proyecto redistribuye ese componente como si fuera propio. El botón **no** aparece salvo que se cumplan las cuatro condiciones a la vez: `redistributable` a `true`, `source` y `license` distintos de `Unverified`, y que el fichero `licenseFile` exista dentro de la carpeta.

La MIT de la raíz cubre el código de la aplicación, **no** los componentes de terceros ni sus imágenes, fuentes o iconos.

Si el componente es tuyo, añade un `LICENSE` dentro de su carpeta. El texto que usa el proyecto empieza así:

```text
# MIT License

Scope: This license covers the original code in this folder, created for this
repository by kindred-98. It does not cover third-party assets, fonts, images or
remote resources that the demo references.
```

Ese párrafo de alcance es importante: deja claro que la licencia no se extiende a lo que el componente referencia desde fuera.

Si has copiado o adaptado el trabajo de otra persona, **no** marques `redistributable: true`. Basta con dejar `source` apuntando al trabajo original y explicarlo en el issue del PR. Un repo público no es permiso de redistribución.

El inventario completo está en [`Docs/Legalizacion/THIRD_PARTY_NOTICES.md`](./Docs/Legalizacion/THIRD_PARTY_NOTICES.md).

## Commits

Mensajes en **español**, en minúsculas, en imperativo y describiendo el efecto, no el detalle mecánico:

```text
fase 12: mejora 10 animaciones y limpia recursos sin uso
fase 11: separa la web en tres paginas y renueva el hero
arregla las previews: mayusculas de carpetas y barras de scroll
nueva animacion: aurora borealis
```

No hace falta que cada commit sea una fase del plan. Lo habitual es agrupar el trabajo coherente en un commit.

## Pull requests

- Un componente por PR, o un grupo muy relacionado. Los PR gigantes son imposibles de revisar
- El PR debe pasar `validate.mjs`, que es lo que corre en CI
- Explica en la descripción qué hace el componente y de dónde sale. Si el trabajo es de otra persona, dilo y enlaza la fuente
- Si has tocado `Web/scripts/`, `vercel.json` o las cabeceras de seguridad, dilo explícitamente: son los ficheros que afectan a toda la web
- Si cambias la dirección de donaciones de la web, avisa antes por issue. Es el único dato tuyo que está en producción

La decisión de integrar o no es siempre de quien mantiene el repositorio. No hay acceso de escritura para terceros, y la protección de rama de `main` impide fusionar un PR sin pasar el CI.

## Estructura del repositorio

```text
.
|-- GevendraAutorExterno/       # demos de terceros, no se modifican
|-- CreacionesNuevas/           # creaciones propias ya publicadas
|-- creaciones-primium/         # creaciones en curso, por categoría
|-- Web/                        # la aplicación
|   |-- data/                   # component-overrides.json se versiona; el resto se genera
|   |-- scripts/                # app.js, zip.js y los scripts de Node
|   `-- styles/site.css
|-- .github/workflows/          # validación en CI, no despliega
`-- Docs/
```

## Documentación

- [`README.md`](./README.md) — descripción, despliegue y estructura
- [`Web/README.md`](./Web/README.md) — cómo funciona la aplicación por dentro
- [`CHANGELOG.md`](./CHANGELOG.md) — registro de cambios
- [`Docs/Opencode/Plan.md`](./Docs/Opencode/Plan.md) — plan de mejora por fases
- [`Docs/auditoria/`](./Docs/auditoria/) — informes de limpieza del repositorio
