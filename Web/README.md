# Aplicación web Component/Field

Catálogo estático y sin dependencias para los demos independientes de `../CreacionesNuevas/`, `../creaciones-primium/` y `../DavokerDiseñador/`. Los demos originales permanecen separados; la aplicación los indexa sin reescribir su HTML, CSS ni JavaScript.

## Ejecución local

`data/catalog.json`, `data/catalog.js` y `data/sources/` son **artefactos generados y no están versionados**. En un clon nuevo no existen, así que hay que generarlos antes de abrir el sitio:

```powershell
node Web/scripts/generate-catalog.mjs
```

En Vercel este paso ocurre solo en cada despliegue. En local es el único paso que hay que recordar.

Sirve la raíz del repositorio por HTTP con el script incluido, que no acepta rutas que salgan de la raíz:

```powershell
node Web/scripts/serve.mjs
```

O, si prefieres Python:

```powershell
py -m http.server 8000
```

Abre <http://localhost:8000/>. La página raíz redirige a `/Web/`. También puedes iniciar Live Server en VS Code desde la raíz.

Para abrirla sin servidor, regenera el catálogo y abre `Web/index.html` directamente. `data/catalog.js` contiene el índice y las fuentes locales que necesita esa modalidad. Usa HTTP para probar el portapapeles y las descargas ZIP, ya que su disponibilidad bajo `file://` depende del navegador.

El generador requiere Node.js 18 o posterior. La aplicación usa HTML, CSS, módulos JavaScript y API del navegador; no requiere instalar paquetes ni ejecutar un paso de compilación.

## Funcionamiento

- `scripts/generate-catalog.mjs` busca cada `index.html`, incluidos los demos anidados, lee el título y las referencias locales a CSS/JavaScript, y genera tres artefactos: `data/catalog.json` (índice ligero, sin código), `data/sources/<id>.json` (el código de cada componente, que la web pide solo al abrir su detalle) y `data/catalog.js` (catálogo completo para el modo `file://`).
- `data/component-overrides.json` permite añadir nombres, categorías, autores (`author`), descripciones, descripciones en español, etiquetas, destacados, fuentes y licencias revisados para cada ID. `license` mantiene el valor predeterminado `Unverified`; no marques una licencia como verificada sin comprobarla.
- `scripts/app.js` muestra la búsqueda, los filtros por categoría y por autor, las vistas previas reales, los controles para copiar el código y los botones ZIP sujetos a la verificación de derechos.
- La web se reparte en tres páginas que comparten `scripts/app.js`: `index.html` (hero, destacados y categorías), `components.html` (la colección con buscador y filtros, además del detalle de cada componente) y `team-core.html` (equipo y donaciones). Cada una declara su propia canonical; el detalle vive en `components.html?component=<id>`.
- `scripts/zip.js` crea archivos ZIP en el navegador sin paquetes externos.
- `scripts/serve.mjs` sirve el repositorio por HTTP para probar en local: `node Web/scripts/serve.mjs` y abre <http://localhost:8000/>. No acepta rutas que salgan de la raíz del repositorio.
- `scripts/validate.mjs` comprueba que el catálogo cuadre con los demos del disco. No despliega; sale con código 1 si algo no cuadra.
- `styles/site.css` contiene el tema y el diseño adaptable de la aplicación.
- La interfaz ofrece inglés y español; guarda el idioma en `localStorage` con la clave `component-field-language`, separada de `component-field-theme`.
- Las vistas previas cargan el `index.html` original en un `iframe`. El detalle muestra ese HTML y lee los archivos CSS y JavaScript locales para poder copiarlos.

El catálogo local detecta las páginas de demos de cuatro colecciones: los de `CreacionesNuevas/` (creaciones del autor, con `LICENSE` MIT propia y **ZIP habilitado**), los 116 de `GevendraAutorExterno/` (terceros, trazados a `gevendra2004/gevstack`, con `LICENSE` MIT en la carpeta y **ZIP habilitado**), los 119 efectos de texto de `DavokerDiseñador/` (davoker, **MIT** en `DavokerDiseñador/LICENSE`, **ZIP habilitado**) y los 518 de `creaciones-primium/` (en desarrollo, con `LICENSE` MIT en la raíz de la colección y **ZIP habilitado**; `fatmaerm` es la autora de `indicadores-de-carga/` y `navegacion/`). Las categorías se infieren de los nombres de carpetas y páginas, y el **autor** (`author`) viene de la carpeta raíz: `Gevendra` para `GevendraAutorExterno/`, `Davoker` para `DavokerDiseñador/` y `kindred-98` para las dos colecciones propias, salvo las dos carpetas de `fatmaerm` de `creaciones-primium/`, que cambian de autor por carpeta (igual que su licencia). Solo se catalogan los `index.html`: la portada de davoker (su showcase unificado con los 119 efectos y `transicion.*`, renombrada `davoker.html`) **no es una tarjeta**, y se abre dentro de la propia rejilla de `components.html` al elegir a **davoker** en el filtro de autores. Sus 7 carpetas son temas, no categorías: todas entran como `Effects` y el tema (`stalker`, `matrix`…) viaja en los tags. Las referencias locales faltantes se muestran en el detalle. Consulta [`../Docs/THIRD_PARTY_NOTICES.md`](../Docs/THIRD_PARTY_NOTICES.md).

## Añadir un componente

1. Crea una carpeta independiente dentro de `CreacionesNuevas/` con un `index.html` y los recursos locales necesarios. Usa `kebab-case` en minúsculas y un nombre que describa el componente.
2. Enlaza el CSS y JavaScript locales mediante etiquetas `<link rel="stylesheet">` y `<script src="...">`.
3. Regenera el catálogo con `node Web/scripts/generate-catalog.mjs`.
4. Escribe el `<title>` con el nombre funcional del componente, sin añadir marcas como `GevStack`.
5. Si hace falta, añade metadatos a `data/component-overrides.json` con el ID generado. El ID usa la ruta de la carpeta en minúsculas y convierte los separadores en guiones.

Por ejemplo, una carpeta llamada `My-Hover-Card` produce el ID `my-hover-card`:

```json
{
  "my-hover-card": {
    "category": "Cards",
    "description": "A short, accurate summary of the demo.",
    "descriptionEs": "Resumen corto y preciso del demo en español.",
    "tags": ["card", "hover"],
    "source": "https://example.com/original-source",
    "license": "MIT",
    "licenseFile": "LICENSE",
    "redistributable": true
  }
}
```

Introduce una fuente y licencia solo después de verificar los derechos de redistribución del código y de todos los recursos incluidos. Guarda la licencia completa o el aviso dentro de la carpeta del componente, define `licenseFile` con su ruta relativa y establece `redistributable` en `true`. Si no se cumplen esas condiciones, el ZIP seguirá deshabilitado y el constructor excluirá el componente. La MIT de la raíz no autoriza contenido de terceros.

`description` es el texto en inglés de la tarjeta y `descriptionEs` el español. Si falta la traducción, la interfaz en español muestra el texto original en inglés.

## Despliegue

La app es estática: **no necesita backend ni base de datos**.

**Vercel:** usa la raíz del repositorio con `vercel.json` (framework `Other`, sin build command, output `.`). Vercel construye solo; no hay script de build. `vercel.json` redirige `/` → `/Web/`, fija `cleanUrls: false` porque las páginas llevan `.html` explícito, y añade `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`.

La CSP usa `frame-src 'self'`, compatible con las vistas previas porque están en el mismo origen. Los demos de terceros se cargan dentro de un `iframe` y quedan fuera de esta CSP: cada documento aplica la suya, así que siguen pudiendo usar sus recursos remotos.

**GitHub Pages:** no se usa. Solo podría publicar la versión filtrada por licencias (los 248 componentes con `redistributable: true`), nunca los 396 que muestra Vercel. El workflow que lo publicaba se eliminó.

**Netlify:** innecesario. Si algún día se usa, publica la raíz sin build command.

**CI:** el workflow [`../.github/workflows/validate.yml`](../.github/workflows/validate.yml) no despliega. Ejecuta los mismos dos pasos que el build de Vercel: generar el catálogo con `scripts/generate-catalog.mjs` y comprobarlo con `scripts/validate.mjs`.
