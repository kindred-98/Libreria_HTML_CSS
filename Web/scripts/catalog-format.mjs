import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Entrada de índice: todo lo que la lista necesita, sin el código fuente.
 * Los `stylesheets`/`scripts` conservan solo `name` y `path`; el código se
 * pide con `fetch` al abrir el detalle.
 *
 * Además se quedan fuera los campos que solo mira la vista de detalle
 * (`folder`, `source`, `license`, `licenseFile`, `stylesheets` y `scripts`):
 * suman 330 KB en el índice y viajan en `sources/<id>.json`, que el detalle
 * descarga igualmente antes de pintarlos. El índice baja de 1 MB a ~650 KB.
 */
export function toIndexEntry(component) {
  const {
    html,
    inlineCss,
    inlineJavaScript,
    files,
    folder,
    source,
    license,
    licenseFile,
    stylesheets,
    scripts,
    ...index
  } = component;
  return index;
}

/** Pago del detalle: HTML de la página, bloques inline, metadatos de la
 * carpeta y lista de archivos del ZIP. */
export function toSourceEntry(component) {
  return {
    folder: component.folder,
    source: component.source,
    license: component.license,
    licenseFile: component.licenseFile,
    stylesheets: component.stylesheets ?? [],
    scripts: component.scripts ?? [],
    html: component.html,
    inlineCss: component.inlineCss ?? [],
    inlineJavaScript: component.inlineJavaScript ?? [],
    files: component.files ?? [],
  };
}

export async function writeSources(sourcesDirectory, components, { removeOrphans = true } = {}) {
  await mkdir(sourcesDirectory, { recursive: true });
  const expected = new Set(components.map((component) => `${component.id}.json`));

  if (removeOrphans) {
    for (const name of await readdir(sourcesDirectory)) {
      if (name.endsWith(".json") && !expected.has(name)) {
        await unlink(path.join(sourcesDirectory, name));
      }
    }
  }

  for (const component of components) {
    await writeFile(
      path.join(sourcesDirectory, `${component.id}.json`),
      `${JSON.stringify(toSourceEntry(component))}\n`,
      "utf8",
    );
  }
}
