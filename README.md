# Biblioteca HTML y CSS

Biblioteca estática y con búsqueda de demos independientes de interfaces hechos con HTML, CSS y JavaScript. El repositorio contiene actualmente **515 páginas de demos** repartidas en cuatro colecciones:

- `GevendraAutorExterno/` — **116 demos** de terceros (botones, tarjetas, navegación, formularios, loaders, galerías, controles y efectos visuales). Ver *Procedencia y licencias*: proceden de `gevendra2004/gevstack`, cuyo repositorio no declara licencia, y se distribuyen con el **`LICENSE` MIT de la propia carpeta**, así que **ZIP habilitado**.
- `DavokerDiseñador/` — **119 efectos de texto** de **davoker** (7 temas: miscelánea, harry potter, stalker, monster hunter, star wars, matrix y the division), cada uno con su showcase, su `.zip` y sus instrucciones. Su repositorio es **MIT**, así que **ZIP habilitado**. La carpeta guarda también su **portada** (`davoker.html`, el showcase unificado de los 119), que se abre dentro de la rejilla al elegir a davoker en el filtro de autores, y fuera del catálogo.
- `CreacionesNuevas/` — **248 demos** originales creados para este repositorio, cada uno con su propio archivo `LICENSE` MIT y **descarga ZIP habilitada**.
- `creaciones-primium/` — demos organizados por categoría, en desarrollo. Las carpetas de **fatmaerm** (`indicadores-de-carga/` y `navegacion/`, 160 demos) llevan `LICENSE` MIT en la raíz de la colección, así que su **ZIP está habilitado**; el resto de la carpeta, todavía **sin descarga ZIP**.

De las 515, **367 son descargables**. La aplicación web está separada en `Web/` y se divide en tres páginas —`index.html` (portada), `components.html` (listado y detalle) y `team-core.html` (equipo y donación)—; los demos originales se cargan directamente para mostrar vistas previas reales.

## Características

- Búsqueda por nombre, categoría, descripción y etiquetas.
- Filtros por categorías inferidas de los nombres de los demos.
- Filtro por autor (Todos, Gevendra, davoker, kindred-98 y fatmaerm). Cada botón lleva su animación: Gevendra *Animated Gradient Underglow*, davoker *Liquid Fill Button*, kindred-98 *Datamosh Decode Button* y fatmaerm *Neutron Star Pulse Button*.
- Sección de destacados con demos existentes.
- Vistas previas interactivas que cargan el HTML original.
- Inspección y copia del HTML, CSS y JavaScript local de cada demo.
- Descargas ZIP solo después de verificar la fuente, los permisos de redistribución y la licencia individual.
- Tema oscuro y claro con preferencia guardada en el navegador.
- Interfaz en inglés y español, con idioma recordado de forma independiente al tema.
- Diseño adaptable, controles accesibles con teclado y compatibilidad con movimiento reducido.
- Sin frameworks, backend, instalación de paquetes ni dependencias de compilación.

## Ejecutar en local

Regenera el catálogo después de añadir o modificar demos:

```powershell
node Web/scripts/generate-catalog.mjs
```

Para abrir la biblioteca directamente, abre `Web/index.html` en el navegador. Antes, regenera el catálogo con el comando anterior si cambiaste o añadiste demos. El archivo `Web/data/catalog.js` permite cargar el catálogo al usar `file://`.

Para probarla mediante HTTP, inicia un servidor estático desde la raíz del repositorio. En Windows puedes usar Python:

```powershell
py -m http.server 8000
```

Abre <http://localhost:8000/>. La página raíz redirige a `/Web/`. También puedes iniciar Live Server en VS Code desde la raíz del repositorio. El servidor HTTP es recomendable para probar el portapapeles y las descargas ZIP; al abrir con `file://`, la compatibilidad de esas API depende del navegador.

Node.js 18 o posterior solo hace falta para regenerar el catálogo. El sitio utiliza HTML, CSS y módulos JavaScript.

## Estructura

```text
.
|-- GevendraAutorExterno/       # 116 demos de terceros (MIT propio: ZIP habilitado)
|-- DavokerDiseñador/           # 119 efectos de texto de davoker (MIT, ZIP habilitado) + su portada davoker.html
|-- CreacionesNuevas/           # 248 creaciones propias del autor (MIT, ZIP habilitado)
|-- creaciones-primium/         # 32 creaciones en curso, por categorías
|-- Web/
|   |-- data/
|   |   |-- catalog.json        # Índice ligero generado (sin código fuente)
|   |   |-- catalog.js          # Catálogo completo, solo para abrir con file:// (no se despliega)
|   |   |-- sources/            # Código de cada componente, se paga al abrir el detalle
|   |   `-- component-overrides.json
|   |-- scripts/
|   |   |-- app.js              # Búsqueda, filtros, detalle, copia, tema y metadatos
|   |   |-- catalog-format.mjs  # Formato compartido por el generador y el validador
|   |   |-- generate-catalog.mjs
|   |   |-- serve.mjs           # Servidor estático local, sin dependencias
|   |   |-- validate.mjs        # Comprueba que el catálogo cuadra con el disco
|   |   `-- zip.js              # Crea archivos ZIP comprimidos en el navegador
|   |-- styles/site.css
|   |-- assets/
|   |-- components.html          # Listado de componentes y detalle
|   |-- favicon.svg
|   |-- og-image.png
|   |-- robots.txt
|   |-- sitemap.xml
|   |-- team-core.html           # Equipo y donación
|   `-- index.html
|-- .github/workflows/          # Validación en CI (no despliega)
|-- Docs/auditoria/             # Informes de limpieza del repositorio
|-- Docs/Opencode/Plan.md       # Plan de mejora por fases
|-- CHANGELOG.md
|-- Docs/Legalizacion/
|   `-- THIRD_PARTY_NOTICES.md   # Procedencia y licencias de los componentes
|-- index.html                  # Entrada a la aplicación web
|-- LICENSE
`-- README.md
```

## Añadir un demo

1. Crea una carpeta dentro de `GevendraAutorExterno/` con un `index.html` y sus recursos locales. Usa `kebab-case` en minúsculas y un nombre que describa el componente, por ejemplo `image-gallery/`.
2. Enlaza el CSS y JavaScript locales desde ese HTML con `<link rel="stylesheet">` y `<script src="...">`.
3. Ejecuta `node Web/scripts/generate-catalog.mjs`. El generador busca también en carpetas anidadas, lee títulos y referencias locales a CSS/JS, y actualiza `Web/data/catalog.json`.
4. Si hace falta, añade metadatos revisados a `Web/data/component-overrides.json`. El ID del demo se forma con la ruta de su carpeta en minúsculas y guiones como separadores.

Por ejemplo, la carpeta `My-Hover-Card/` produce el ID `my-hover-card`:

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

Establece `redistributable` en `true` solo después de confirmar los permisos del código y de todos los recursos incluidos. Guarda la licencia completa o el aviso requerido en la ruta indicada por `licenseFile` dentro de la carpeta del demo. Sin esos campos revisados y un archivo de licencia válido, el botón ZIP permanece deshabilitado y el demo queda fuera del artefacto de despliegue.

Las categorías se infieren de los nombres de carpetas y páginas, y se añaden automáticamente cuando aparecen. Usa un override si hay que corregir una categoría o descripción. `description` es el texto en inglés y `descriptionEs` el español: si no hay traducción, la interfaz en español muestra el texto original. La búsqueda no distingue mayúsculas y minúsculas.

## Vistas previas y código

Cada tarjeta y página de detalle carga el `index.html` original en un `iframe`, no una captura. El detalle muestra ese HTML y obtiene los archivos CSS y JavaScript locales para los controles de copia. Algunos demos dependen de imágenes, fuentes, iconos o bibliotecas remotas y pueden necesitar conexión a Internet. Los recursos de terceros no se copian automáticamente al repositorio.

Se repararon las cinco referencias locales que estaban rotas: se eliminaron o reemplazaron scripts ausentes, el demo del cursor utiliza su hoja de estilos existente y la tarjeta de película apunta a su `pngwing.png` local con un fondo CSS. La auditoría ya no encuentra referencias locales rotas en HTML. Los derechos de esa imagen y de otros recursos de terceros aún deben verificarse.

## Procedencia y licencias

La MIT de la raíz se limita al código original de la aplicación y a la documentación de `kindred-98`; no cubre los demos ni recursos de terceros.

Hay dos situaciones distintas en la colección:

- **`CreacionesNuevas/` (248 demos del autor).** Son creaciones originales de este repositorio, cada una con un `LICENSE` MIT propio. El catálogo los marca con `license: "MIT"`, `redistributable: true` y `source` apuntando a este repositorio, así que **el botón ZIP está activo** y el ZIP incluye el `LICENSE` y un `ATTRIBUTION.txt` con la fuente y la licencia.
- **`GevendraAutorExterno/` (116 demos de terceros).** Su procedencia **sí está investigada**: los 116 proceden del repositorio público [`gevendra2004/gevstack`](https://github.com/gevendra2004/gevstack) (106 coincidencias exactas de carpeta y 8 por erratas del propio repositorio de origen). Ese repositorio **no tiene licencia** —`LICENSE` devuelve 404, la API de GitHub responde `"license": null` y el `README.md` no incluye términos—, así que la distribución se ampara en el **`LICENSE` MIT que lleva la propia carpeta** desde 2026-09-29: el catálogo los marca con `license: "MIT"`, `licenseFile: "LICENSE"` y `redistributable: true`, y **el botón ZIP está activo**.

El inventario completo está en [Docs/Legalizacion/THIRD_PARTY_NOTICES.md](Docs/Legalizacion/THIRD_PARTY_NOTICES.md). Para desbloquear las descargas de los 116 de terceros hace falta una **autorización escrita** del autor o que añada una licencia a su repositorio; una URL de origen o un repositorio público no constituyen por sí mismos una licencia de redistribución.

Antes de publicar o distribuir un demo, verifica su procedencia y las condiciones de su código, imágenes, fuentes, iconos y dependencias. Conserva los avisos necesarios, solicita permiso cuando corresponda o excluye el material cuyos derechos no estén claros.

## Despliegue

La aplicación es estática y no necesita backend ni base de datos.

### Vercel

El repositorio incluye [`vercel.json`](./vercel.json) y [`.vercelignore`](./.vercelignore). Configura el proyecto con **Framework Preset: Other** y **Output Directory: `.`** (la raíz del repositorio). El **Build Command no va vacío**: `vercel.json` ya lo fija como `node Web/scripts/generate-catalog.mjs`. Si en el panel lo dejas en blanco, sobrescribes el valor del fichero y el catálogo no se generará.

Se despliega **la raíz del repositorio**, no un subdirectorio: las vistas previas cargan `../GevendraAutorExterno/...`, así que esa carpeta tiene que publicarse también. `vercel.json` redirige `/` → `/Web/` y `/Web` → `/Web/` (sin barra final rompería las rutas relativas) y añade las cabeceras de seguridad: `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`.

La CSP usa `frame-src 'self'`, así que las vistas previas siguen cargando porque viven en el mismo origen. Los demos de terceros van dentro de un `iframe` y **no** quedan sujetos a esta CSP: cada documento aplica la suya. Por eso añadirla no afecta a los demos que cargan recursos remotos.

### El catálogo se genera en el despliegue

`Web/data/catalog.json`, `Web/data/catalog.js` y `Web/data/sources/` son **artefactos generados** y **no están versionados**. Se producen en el build de Vercel, antes de servir nada.

La razón práctica: añadir un demo ya no exige ningún paso manual. Da igual si lo añade una persona o un agente, el catálogo siempre refleja lo que hay en el disco. Y como esos ficheros no se versionan, dos agentes pueden añadir demos a la vez sin que sus cambios choquen sobre los mismos 473 ficheros de `sources/`.

Lo único que hay que recordar en local, antes de abrir el sitio:

```powershell
node Web/scripts/generate-catalog.mjs
```

`Web/data/component-overrides.json` **sí** está versionado, porque se edita a mano.

### GitHub Pages

**No se usa.** El sitio se despliega en Vercel y GitHub Pages solo podría publicar una versión recortada por licencias, nunca la colección completa. Se eliminó el workflow que lo publicaba.

### Netlify

También innecesario. Si algún día se usa: raíz del repositorio, y **Build Command** `node Web/scripts/generate-catalog.mjs`.

## Validación continua

El workflow [`validate.yml`](.github/workflows/validate.yml) se ejecuta en cada `push` a `main` y en cada pull request. **No despliega nada**. Ejecuta los mismos dos pasos que el build de Vercel, de modo que si el catálogo falla al generarse o al comprobarse, se ve en GitHub antes de llegar a producción:

1. `node Web/scripts/generate-catalog.mjs` — el mismo comando que ejecuta Vercel.
2. `node Web/scripts/validate.mjs` — sintaxis e integridad del catálogo ya generado.

`validate.mjs` comprueba la sintaxis de todos los `.js`, que cada entrada del catálogo tenga su fichero en `sources/` y viceversa, que cada `preview` apunte a un `index.html` real, que no queden referencias locales rotas, y que **ningún demo del disco falte en el catálogo**. Ese último punto es el que más avisa: un demo nuevo sin indexar no aparece en la web sin ningún otro síntoma.

Usa `actions/checkout@v5` y `actions/setup-node@v5` (ambos ya sobre Node 24) y se fija `ubuntu-24.04` para no depender de la migración de `ubuntu-latest` a Ubuntu 26.

## Contribuir

Mantén cada demo independiente, conserva su comportamiento original y evita añadir dependencias a la aplicación del catálogo. Prueba las vistas previas y los controles de copia mediante un servidor HTTP local:

```powershell
node Web/scripts/generate-catalog.mjs
node Web/scripts/serve.mjs
```

Abre <http://localhost:8000/>.

Si quieres añadir un componente o un pull request, lee antes [`CONTRIBUTING.md`](./CONTRIBUTING.md). Si has encontrado un fallo de seguridad, no lo reportes por issue: lee [`SECURITY.md`](./SECURITY.md).
