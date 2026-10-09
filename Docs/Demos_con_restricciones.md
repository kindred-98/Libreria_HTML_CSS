# Demos con restricciones de licencia

Lista generada por `Web/scripts/validar-licencias.mjs` a partir de
los `Web/data/sources/*.json` (license declarada) y `Web/data/catalog.json`
(downloadable calculado por generate-catalog.mjs), y de la seccion
'Las colecciones' de `Docs/THIRD_PARTY_NOTICES.md`.

No es asesoria legal: es un inventario para que la persona que mantiene
el repositorio revise que cada demo cuya licencia no sea la MIT del
resto del proyecto, o que no sea redistribuible, este en orden antes de
habilitar descargas o cualquier forma de monetizacion.

Hoy, con la coleccion actual:

- 0 componentes con una `license` distinta de MIT en `Web/data/sources/*.json`.
- Los 1018 componentes declaran MIT. Los 770 con `downloadable: false` no son restricciones de licencia: son tecnicas (LICENSE ausente en el demo, source unverified, missingReferences) y `npm run validar` ya las cuenta como aviso. No hace falta cambiar la licencia: hay que arreglar la fuente verificada o anadir el LICENSE que falta.
- Las unicas restricciones adicionales del proyecto son las de las 676 fotos de
  `creaciones-primium/galerias/`, que cargan desde Wikimedia
  Commons. La tabla de licencias CC detectadas esta documentada en la seccion
  "Fotografias de las galerias (Wikimedia Commons)" de
  `Docs/THIRD_PARTY_NOTICES.md`.

