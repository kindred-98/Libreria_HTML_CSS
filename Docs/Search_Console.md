# Estado de Search Console (2026-10-06)

Registro de lo que se hizo para que el sitio se pueda encontrar y de lo que
queda pendiente. Los pasos que dependen de una cuenta del usuario van marcados
como **tú**, porque no se pueden hacer desde el repositorio.

## Qué se hizo desde el repo

- **Datos estructurados (JSON-LD)** en portada (`WebSite` + `SearchAction` +
  `SoftwareApplication`) y catálogo (`CollectionPage`). Los tres bloques
  validados como JSON.
- **`hreflang`** (`es`, `en`, `x-default`) en las cinco páginas: la traducción
  es de cliente (misma URL, distinto texto), así que las dos variantes apuntan a
  la misma dirección.
- **Títulos y descripciones distintos** por página (antes portada y catálogo
  compartían la misma `description`, y el SEO del catálogo se lo comía la de la
  portada).
- **`robots.txt` y `sitemap.xml` tambien en la raíz** (redirecciones 302 en
  `vercel.json`). Esto no era cosmético: **Google solo busca `robots.txt` en la
  raíz del dominio**, y el fichero vivía en `/Web/`. En la raíz daba 404, así
  que el buscador no veía ni el robots.txt ni la línea `Sitemap:` de dentro, y
  no podía descubrir el sitemap solo. Estar verificado en Search Console no
  bastaba sin esto.
- **Etiqueta de verificación** en la raíz y en la portada.
- **Las dos páginas legales** añadidas al `sitemap.xml`.

## Lo que hiciste tú

1. **Verificación por etiqueta HTML** (no por TXT: el DNS de `vercel.app` lo
   controla Vercel y no admite registros propios; ni por Google Analytics,
   porque el `gtag.js` solo se carga si el visitante acepta cookies y Google no
   lo vería).
2. **Envío del sitemap** en Search Console.

## Pendiente

- **Solicitar indexación** de las cinco páginas desde *Inspección de URLs*. Se
  intentó y **dio "has consumido la cuota"**. No es un problema: la cuota de
  inspección es diaria y **compartida entre todos los proyectos** de la misma
  cuenta de Google. Se puede volver a intentar mañana, pero **no hace falta**:
   el sitemap ya está enviado y es la vía oficial de descubrimiento. Pedirlo a
  mano solo acelera un poco el primer rastreo.
- **Los primeros datos** tardan 48-72 h desde que se verifica una propiedad
  nueva. Es normal ver relojes con "Se están procesando los datos".
- **El informe que hay que mirar** es **Páginas**: dice cuántas se han
  indexado de verdad, y no gasta cuota de inspección.

## Una limitación conocida del sitemap

Las etiquetas `<lastmod>` **no aparecen en producción**. No es un error: el
generador (`generar-sitemap.mjs`) las borra a propósito cuando git no puede
decirle cuándo se tocó cada fichero, y en el despliegue Vercel clona sin
historial. El script prefiere omitirlas antes que inventar una fecha falsa. El
buscador funciona igual, pero rastrea peor qué cambió entre rastreos.

Se puede arreglar haciendo que el generador use la fecha de última
modificación del fichero en disco cuando git no esté, pero eso daría una fecha
de build, no de contenido. Mejor solución: versionar el sitemap junto al código,
que es lo que ya se hace.

## Orden recomendado la próxima vez

1. Mergear la PR y esperar el despliegue.
2. Search Console → **Sitemaps** → enviar `sitemap.xml` (o la URL completa
   `https://libreria-html-css.vercel.app/Web/sitemap.xml`, que es lo
   inequívoco).
3. *Inspección de URLs* → solicitar indexación de las cinco (opcional, con la
   cuota del día).
4. A las 48-72 h, mirar el informe **Páginas** para ver cuántas se han
   indexado.