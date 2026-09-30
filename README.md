# Biblioteca HTML y CSS

Biblioteca estática y con búsqueda de demos independientes de interfaces hechos con HTML, CSS y JavaScript. El repositorio contiene actualmente **885 páginas de demos** repartidas en tres colecciones:

- `DavokerDiseñador/` — **119 efectos de texto** de **davoker** (7 temas: miscelánea, harry potter, stalker, monster hunter, star wars, matrix y the division), cada uno con su showcase, su `.zip` y sus instrucciones. Su repositorio es **MIT**, así que **ZIP habilitado**. La carpeta guarda también su **portada** (`davoker.html`, el showcase unificado de los 119), que se abre dentro de la rejilla al elegir a davoker en el filtro de autores, y fuera del catálogo.
- `CreacionesNuevas/` — **248 demos** originales creados para este repositorio, cada uno con su propio archivo `LICENSE` MIT y **descarga ZIP habilitada**.
- `creaciones-primium/` — **518 demos** organizados por categoría: 248 animaciones, botones, controles, efectos, formularios, tarjetas y otros de **kindred-98**, más **86 galerías** de fotografía y los **160** de **fatmaerm** repartidos entre `indicadores-de-carga/` y `navegacion/`. Toda la colección comparte el `LICENSE` MIT de la carpeta, que nombra a las dos autoras, así que el **ZIP está habilitado en todos**. Las 86 galerías (676 fotografías) muestran sus fotos desde Wikimedia Commons, con el autor y la licencia de cada imagen impresos en la propia página; el inventario completo está en [`THIRD_PARTY_NOTICES.md`](./Docs/THIRD_PARTY_NOTICES.md).

Los **885 son descargables**. La aplicación web está separada en `Web/` y se divide en tres páginas —`index.html` (portada), `components.html` (listado y detalle) y `team-core.html` (equipo y donación)—; los demos originales se cargan directamente para mostrar vistas previas reales.

> `GevendraAutorExterno/` **no forma parte del repositorio**: los 116 demos que provee un tercero quedan en el disco local para poder trabajar con ellos, pero están en `.gitignore`, **no se catalogan, no se publican y no se sirven**. Su material no tiene licencia declarada. Ver *Material retirado*.

## Características

- Búsqueda por nombre, categoría, descripción y etiquetas.
- Filtros por categorías inferidas de los nombres de los demos.
- Filtro por autor (Todos, davoker, kindred-98 y fatmaerm). Cada botón lleva su animación: davoker *Liquid Fill Button*, kindred-98 *Datamosh Decode Button* y fatmaerm *Neutron Star Pulse Button*.
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
|-- DavokerDiseñador/           # 119 efectos de texto de davoker (MIT, ZIP habilitado) + su portada davoker.html
|-- CreacionesNuevas/           # 248 creaciones propias del autor (MIT, ZIP habilitado)
|-- creaciones-primium/         # 518 creaciones en curso, por categorías (MIT, ZIP habilitado)
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
|   |-- components.html          # Listado de componentes y detalle
|   |-- favicon.svg
|   |-- og-image.png
|   |-- robots.txt
|   |-- sitemap.xml
|   |-- team-core.html           # Equipo y donación
|   `-- index.html
|-- .github/workflows/          # Validación en CI (no despliega)
|-- CHANGELOG.md
|-- Docs/
|   `-- THIRD_PARTY_NOTICES.md   # Procedencia y licencias de los componentes
|-- index.html                  # Entrada a la aplicación web
|-- LICENSE
`-- README.md
```

## Añadir un demo

1. Crea una carpeta dentro de `CreacionesNuevas/` con un `index.html` y sus recursos locales. Usa `kebab-case` en minúsculas y un nombre que describa el componente, por ejemplo `image-gallery/`.
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

Hay una situación distinta en la colección:

- **`CreacionesNuevas/` (248 demos del autor).** Son creaciones originales de este repositorio, cada una con un `LICENSE` MIT propio. El catálogo los marca con `license: "MIT"`, `redistributable: true` y `source` apuntando a este repositorio, así que **el botón ZIP está activo** y el ZIP incluye el `LICENSE` y un `ATTRIBUTION.txt` con la fuente y la licencia.

El inventario completo está en [Docs/THIRD_PARTY_NOTICES.md](Docs/THIRD_PARTY_NOTICES.md).

### Material retirado

`GevendraAutorExterno/` **no forma parte del repositorio**: los 116 demos de un tercero **quedaron fuera del catálogo, del sitio y de las descargas** el 2026-09-30, y además se sacaron del índice de git, así que la carpeta solo existe en el disco local y no se despliega. Los 116 proceden del repositorio público [`gevendra2004/gevstack`](https://github.com/gevendra2004/gevstack), que **no declara licencia** —`LICENSE` devuelve 404, la API de GitHub responde `"license": null` y el `README.md` no incluye términos— y el autor **no respondió** a los contactos hechos para pedirle permiso. Sin licencia no hay permiso de redistribución, ni siquiera sin botón de descarga, así que la opción correcta era no publicar su código: se retiraron también el `LICENSE` MIT que esta carpeta llegó a llevar y el CSS de sus demos que se había copiado a `Web/styles/site.css`. Volver a publicarlos exige su **autorización escrita** o que añada una licencia a su repositorio; cuando la haya, se quita la línea de `.gitignore`, se vuelve a añadir la raíz a `generate-catalog.mjs` y el catálogo recupera los 116 solo.

Antes de publicar o distribuir un demo, verifica su procedencia y las condiciones de su código, imágenes, fuentes, iconos y dependencias. Conserva los avisos necesarios, solicita permiso cuando corresponda o excluye el material cuyos derechos no estén claros.

## Despliegue

La aplicación es estática y no necesita backend ni base de datos.

### Vercel

El repositorio incluye [`vercel.json`](./vercel.json) y [`.vercelignore`](./.vercelignore). Configura el proyecto con **Framework Preset: Other** y **Output Directory: `.`** (la raíz del repositorio). El **Build Command no va vacío**: `vercel.json` ya lo fija como `node Web/scripts/generate-catalog.mjs`. Si en el panel lo dejas en blanco, sobrescribes el valor del fichero y el catálogo no se generará.

Se despliega **la raíz del repositorio**, no un subdirectorio: las vistas previas cargan `../CreacionesNuevas/...` y `../creaciones-primium/...`, así que esas carpetas tienen que publicarse también. `vercel.json` redirige `/` → `/Web/` y `/Web` → `/Web/` (sin barra final rompería las rutas relativas), y añade las cabeceras de seguridad: `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`. El `404.html` de la raíz lo sirve Vercel automáticamente en cualquier dirección que no exista.

La CSP usa `frame-src 'self'`, así que las vistas previas siguen cargando porque viven en el mismo origen. Los demos de terceros van dentro de un `iframe` y **sí** quedan sujetos a esta CSP: cada documento hereda las cabeceras del sitio, así que si la CSP no permite el host del que un demo saca sus imágenes o sus scripts, ese demo se ve roto en producción aunque en local vaya bien.

Por eso la CSP es deliberadamente corta. Los recursos que usaban los demos se bajaron a la carpeta `vendor/` de cada componente, así que solo quedan tres hosts externos: `upload.wikimedia.org` y `commons.wikimedia.org` para las fotos de las galerías, y `api.qrserver.com` para el único componente que genera códigos QR en el momento. `validar-csp.mjs` comprueba esto en cada despliegue: rastrea los recursos externos de los 885 demos, avisa si alguno no está permitido en la directiva que le toca y también si la CSP permite un host que ya no usa nadie.

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
