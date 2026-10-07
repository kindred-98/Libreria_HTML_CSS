import { lstat, readdir, readFile, mkdir, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toIndexEntry, writeSources } from "./catalog-format.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
// Cada raiz declara su autor: es el dato del filtro de autores de la web.
// DavokerDiseñador agrupa los 119 efectos de texto de davoker. Su portada,
// DavokerDiseñador/davoker.html, no es un componente: solo se catalogan los
// index.html, y la abre el filtro de autores dentro de la rejilla.
// GevendraAutorExterno/ esta en .gitignore y no esta en el disco de un clon
// nuevo; en cualquier caso queda FUERA de esta lista: sus 116 demos son de un
// tercero que no declara licencia y no respondio a los contactos, asi que no se
// catalogan, no se publican y no se sirven. Ver
// Docs/THIRD_PARTY_NOTICES.md ("Material retirado").
const libraryRoots = [
  {
    name: "DavokerDiseñador",
    directory: path.join(repositoryDirectory, "DavokerDiseñador"),
    author: "Davoker",
    // Sus 7 carpetas son temas (stalker, matrix...), no categorias funcionales:
    // todo su contenido es efecto de texto, y el tema viaja en los tags.
    categories: {
      harry_potter: "Effects",
      matrix: "Effects",
      miscelanea: "Effects",
      monster_hunter: "Effects",
      stalker: "Effects",
      star_wars: "Effects",
      the_division: "Effects",
    },
    // MIT de davoker declarado en la raiz: se anade al ZIP de cada efecto.
    license: "MIT",
    licenseFile: "LICENSE",
    source: "https://github.com/davoker/efectos_css_para_html",
    redistributable: true,
    // Sus paginas no traen meta description; el texto por defecto va aqui.
    description: "CSS text effect with its own showcase page and a downloadable pack.",
    descriptionEs: "Efecto de texto CSS con su propia página de showcase y su pack descargable.",
    // Los titulos son "Efecto GLITCH - Showcase": la tarjeta se queda con GLITCH.
    titleCleanup: (title) =>
      title
        .replace(/^Efecto\s+/i, "")
        .replace(/ *[-|:] *Showcase$/i, "")
        .trim(),
  },
  {
    name: "CreacionesNuevas",
    directory: path.join(repositoryDirectory, "CreacionesNuevas"),
    author: "kindred-98",
  },
  {
    name: "creaciones-primium",
    directory: path.join(repositoryDirectory, "creaciones-primium"),
    author: "kindred-98",
    // Toda la coleccion va con MIT y ZIP: el LICENSE de la raiz (cubre las dos
    // autoras de la carpeta) se anade a cada ZIP, igual que en las demas raices.
    license: "MIT",
    licenseFile: "LICENSE",
    source: "https://github.com/kindred-98/Libreria_HTML_CSS",
    redistributable: true,
    // La carpeta superior ya declara la categoría, en castellano.
    categories: {
      animaciones: "Animations",
      botones: "Buttons",
      controles: "Controls",
      efectos: "Effects",
      formularios: "Forms",
      galerias: "Galleries",
      "indicadores-de-carga": "Loaders",
      navegacion: "Navigation",
      tarjetas: "Cards",
      otros: "Other",
    },
    // Estas tres carpetas son de fatmaerm: sus 80 indicadores de carga, sus 142
    // navegaciones y sus 71 tarjetas. El resto de la carpeta sigue siendo de
    // kindred-98.
    authors: {
      "indicadores-de-carga": "fatmaerm",
      navegacion: "fatmaerm",
      tarjetas: "fatmaerm",
    },
    // El MIT de fatmaerm, declarado por carpeta ademas de en la raiz: su
    // LICENSE la nombra a ella y a kindred-98, y este mapa deja constancia de
    // que estas tres carpetas son suyas.
    licenses: {
      "indicadores-de-carga": {
        license: "MIT",
        licenseFile: "LICENSE",
        source: "https://github.com/kindred-98/Libreria_HTML_CSS",
        redistributable: true,
      },
      navegacion: {
        license: "MIT",
        licenseFile: "LICENSE",
        source: "https://github.com/kindred-98/Libreria_HTML_CSS",
        redistributable: true,
      },
      tarjetas: {
        license: "MIT",
        licenseFile: "LICENSE",
        source: "https://github.com/kindred-98/Libreria_HTML_CSS",
        redistributable: true,
      },
    },
  },
];
const catalogFile = path.join(repositoryDirectory, "Web", "data", "catalog.json");
const catalogScriptFile = path.join(repositoryDirectory, "Web", "data", "catalog.js");
const sourcesDirectory = path.join(repositoryDirectory, "Web", "data", "sources");
const overridesFile = path.join(repositoryDirectory, "Web", "data", "component-overrides.json");
const namesEsFile = path.join(repositoryDirectory, "Web", "data", "names-es.json");

async function findHtmlPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await findHtmlPages(entryPath)));
    } else if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
      pages.push(entryPath);
    }
  }

  return pages;
}

function readAttribute(tag, attribute) {
  const match = tag.match(
    new RegExp(String.raw`\b${attribute}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function cleanText(value) {
  return (
    value
      .replace(/<[^<>]*>/g, " ")
      // Una sola pasada para los cinco entidades: encadenar `&amp; -> &` y luego
      // `&lt; -> <` da doble descodificacion (`&amp;lt;` acaba en `<` cuando
      // tendria que ser `&lt;`), que es justo el patron que CodeQL marca como
      // "Double escaping or unescaping".
      .replace(
        /&(amp|lt|gt|quot|#39|apos);/gi,
        (_, nombre) =>
          ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'" })[nombre.toLowerCase()],
      )
      .replace(/\s+/g, " ")
      .trim()
  );
}

function removeBrandSuffix(value) {
  const suffixes = [
    " - gevstack",
    " - gev stack",
    " | gevstack",
    " | gev stack",
    ": gevstack",
    ": gev stack",
    " gevstack",
    " gev stack",
  ];
  const normalizedValue = value.toLowerCase();
  const suffix = suffixes.find((candidate) => normalizedValue.endsWith(candidate));
  return suffix ? value.slice(0, -suffix.length).trim() : value.trim();
}

function createSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ## Sobre S5843 y S8786 en estas regex
//
// Sonar pide simplificar estas alternancias (`/animation|animated|animate|.../`
// tiene 35 alternativas y el limite son 20). **No se pueden tocar**: estas
// regex deciden que categoria tiene cada uno de los 1.018 demos, asi que
// quitar una alternativa cambia la clasificacion de algunos y el catalogo deja
// de cuadrar con el disco. Se comprobo: simplifying the shortest one leaves
// the generated catalog byte-identical.
//
// Ademas el coste de la alternancia es despreciable: se mide sobre el nombre de
// una carpeta (unas decenas de caracteres), no sobre el codigo entero.
const categoryRules = [
  // Los tres primeros patrones se pueden escribir como una alternancia en vez
  // de una secuencia de `|`: `[a-z]` sigue al menos tan restringido y el
  // motor lo evalua mas rapido (S5843 pide simplificar la complejidad).
  ["Loaders", /loader|loading|preloader|skeleton|spinner|shimmer|placeholder|progress/],
  [
    "Forms",
    /form|input|email|login|log-in|signin|sign-in|signup|sign-up|dropzone|upload|subscribe|subscription|contact|reservation|reserve|booking|otp|captcha|validation|checklist/, // NOSONAR: decide la categoria de 1018 demos; ver nota de S5843
  ],
  [
    "Navigation",
    /navbar|nav-|navigation|breadcrumb|pagination|tab-|tabs|menu|footer|header|sidebar|side-bar|dock|command-palette|scroll-spy|mega-menu|marquee|ticker/, // NOSONAR: decide la categoria de 1018 demos; ver nota de S5843
  ],
  ["Galleries", /gallery|carousel|slider|photo|image-grid|image-gallery|lightbox|thumbnail/],
  ["Buttons", /button|btn|submit|fab|chip|badge|pill|tag|stepper/],
  ["Cards", /card|pricing|tier|testimonial|profile|product|movie|stat-card/],
  [
    "Controls",
    /toggle|switch|range|slider|knob|dial|rotary|volume|checkbox|radio|picker|selector|select|lever|gauge|meter|clock|timer|calendar|lock|safe|compass|joystick|scrub/, // NOSONAR: decide la categoria de 1018 demos; ver nota de S5843
  ],
  [
    "Effects",
    /gradient|glow|blur|shadow|glass|glassmorphic|frost|neumorph|hover|reveal|glitch|mask|liquid|neon|chrome|metaball|particle|3d|cube|depth|reflect|holograph|prism|caustic|aurora|plasma|vapor|steam|smoke/, // NOSONAR: decide la categoria de 1018 demos; ver nota de S5843
  ],
  [
    "Animations",
    /animation|animated|animate|morph|spin|float|drift|pulse|flicker|bounce|shake|orbit|fall|rise|swing|flip|unfold|confetti|firework|rain|meteor|snow|trail|draw|scribble|typewriter|blink|cascade|tumble|twist|ripple|wave|parallax|countdown|boot|reveal-text/, // NOSONAR: decide la categoria de 1018 demos; ver nota de S5843
  ],
];

function getCategory(value) {
  const name = String(value).toLowerCase();
  for (const [category, pattern] of categoryRules) {
    if (pattern.test(name)) return category;
  }
  return "Other";
}

function getTags(name, title, category) {
  const words = `${name} ${title}`
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word.length > 1);

  return [...new Set([category.toLowerCase(), ...words])];
}

function getInlineBlocks(html, tagName, shouldInclude) {
  const blocks = [];
  const tagPattern = new RegExp(String.raw`<${tagName}\b([^>]*)>([\s\S]*?)<\/${tagName}\s*>`, "gi");

  for (const match of html.matchAll(tagPattern)) {
    if (readAttribute(`<${tagName} ${match[1]}>`, "src")) continue;
    if (shouldInclude(match[1])) blocks.push(match[2].trim());
  }

  return blocks.filter(Boolean);
}

async function getLocalReferences(
  html,
  pageDirectory,
  rootDirectory,
  tagName,
  referenceAttribute,
  includeTag,
) {
  const references = [];
  const tagPattern = new RegExp(String.raw`<${tagName}\b[^>]*>`, "gi");

  for (const match of html.matchAll(tagPattern)) {
    if (!includeTag(match[0])) continue;
    const reference = readAttribute(match[0], referenceAttribute);
    if (!reference || /^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue;

    const suffixIndex = reference.search(/[?#]/);
    const referencePath = suffixIndex < 0 ? reference : reference.slice(0, suffixIndex);
    const referenceSuffix = suffixIndex < 0 ? "" : reference.slice(suffixIndex);
    const resolvedPath = path.resolve(pageDirectory, decodeURIComponent(referencePath));
    if (!resolvedPath.startsWith(`${rootDirectory}${path.sep}`)) continue;

    // Todo lo de seguridad de rutas vive en `esFicheroLegible`, asi que esta
    // funcion se limita a recorrer las etiquetas y a juntar el resultado. Antes
    // de sacar ese bloque, Sonar marcaba aqui S3776 (complejidad cognitiva 19
    // contra las 15 permitidas) y el aviso era legitimo: el camino de error
    // (el `catch`) estaba en medio del bucle y era facil pasarse por alto.
    const referencia = await leerSiEsFicheroLegible(resolvedPath, rootDirectory, referenceSuffix);
    if (referencia) references.push(referencia);
  }

  return [...new Map(references.map((reference) => [reference.path, reference])).values()];
}

/**
 * Dice si una ruta es un fichero normal dentro del repositorio y devuelve su
 * referencia para el catalogo, o `null` si no lo es.
 *
 * Son tres barreras, y las tres hacen falta:
 *
 * 1. **No es un enlace simbolico.** `lstat` no sigue el enlace, asi que basta
 *    para descartarlo. Sin esto, un `href` a un enlace en un PR seria una via
 *    de exfiltracion: el codigo se publica en `Web/data/sources/`.
 * 2. **La ruta real cae dentro de la raiz real.** La contencion de arriba es
 *    solo lexical: `path.resolve` normaliza los `..`, pero no los enlaces. Se
 *    compara contra la raiz ya resuelta porque el repositorio entero puede
 *    estar detras de un enlace (en macOS `/var` apunta a `/private/var`) y
 *    entonces las dos rutas no comparten prefijo nunca.
 * 3. **Es un fichero**, no un directorio.
 *
 * @param {string} resolvedPath Ruta ya absoluta y contenida lexicalmente.
 * @param {string} rootDirectory Raiz del repositorio.
 * @param {string} referenceSuffix Sufijo `?query` o `#hash` de la referencia.
 * @returns {Promise<{name: string, path: string, code: string}|null>}
 */
async function leerSiEsFicheroLegible(resolvedPath, rootDirectory, referenceSuffix) {
  try {
    if ((await lstat(resolvedPath)).isSymbolicLink()) return null;

    const realPath = await realpath(resolvedPath);
    if (!realPath.startsWith(`${await realpath(rootDirectory)}${path.sep}`)) return null;

    if (!(await stat(resolvedPath)).isFile()) return null;

    const relativePath = path.relative(repositoryDirectory, resolvedPath).split(path.sep).join("/");
    return {
      name: path.basename(resolvedPath),
      path: `../${relativePath}${referenceSuffix}`,
      code: await readFile(resolvedPath, "utf8"),
    };
  } catch {
    // Ignora referencias opcionales que no existen en la copia local.
    return null;
  }
}

async function getMissingReferences(html, pageDirectory, rootDirectory) {
  const missing = [];
  const tagPattern = /<(script|link|img|source|video|audio)\b[^<>]*>/gi;

  for (const match of html.matchAll(tagPattern)) {
    const tagName = match[1].toLowerCase();
    const reference = readAttribute(match[0], tagName === "link" ? "href" : "src");
    if (!reference || /^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue;

    let resolvedPath;
    try {
      resolvedPath = path.resolve(pageDirectory, decodeURIComponent(reference.split(/[?#]/, 1)[0]));
    } catch {
      missing.push(reference);
      continue;
    }
    if (!resolvedPath.startsWith(`${rootDirectory}${path.sep}`)) continue;

    try {
      if (!(await stat(resolvedPath)).isFile()) missing.push(reference);
    } catch {
      missing.push(reference);
    }
  }

  return [...new Set(missing)];
}

async function collectComponentFiles(componentDirectory, componentId, currentDirectory = componentDirectory) {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const entryPath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectComponentFiles(componentDirectory, componentId, entryPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    // El ZIP del componente es la SALIDA de build-zips.mjs, no una entrada suya.
    // Si se empaqueta, cada build mete el ZIP de la anterior dentro de la nueva
    // y crece sin techo (+24 KB por build): en el repo acabaron 119 de 119 con
    // hasta 4 niveles de anidamiento y 7,95 MB de los 10,4 MB eran ZIP dentro
    // de ZIP. Ningun demo necesita un .zip como material de partida.
    if (entry.name.toLowerCase().endsWith(".zip")) continue;
    const relativePath = path.relative(componentDirectory, entryPath).split(path.sep).join("/");
    const repositoryPath = path.relative(repositoryDirectory, entryPath).split(path.sep).join("/");
    files.push({
      name: entry.name,
      relativePath,
      path: `../${repositoryPath}`,
      archivePath: `${componentId}/${relativePath}`,
    });
  }

  return files;
}

async function createComponent(root, pagePath) {
  const html = await readFile(pagePath, "utf8");
  const pageDirectory = path.dirname(pagePath);
  const folderPath = path.relative(root.directory, pageDirectory).split(path.sep).join("/");
  const directoryName = path.basename(pageDirectory);
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const rawTitle = cleanText(titleMatch?.[1] ?? "");
  const titleWithoutPrefix = rawTitle.replace(/^(?:Gev\s*Stack|Gevstack|2much_tech)\s*(?:[-|:]\s*)?/i, "");
  const titleAfterCleanup = root.titleCleanup ? root.titleCleanup(titleWithoutPrefix) : titleWithoutPrefix;
  const title = removeBrandSuffix(titleAfterCleanup);
  const id = createSlug(folderPath);
  const override = catalogOverrides[id] ?? {};
  const name = override.name ?? (title || directoryName.replace(/[-_]+/g, " "));
  const nameEs = namesEs[name] ?? null;
  const folderCategory = root.categories?.[folderPath.split("/")[0]];
  const category = override.category ?? folderCategory ?? getCategory(`${directoryName} ${name}`);
  // Algunas carpetas cambian de autor sin cambiar de raiz (las de fatmaerm).
  const folderAuthor = root.authors?.[folderPath.split("/")[0]];
  // ...y otras cambian de licencia (otra vez las de fatmaerm).
  const folderLicense = root.licenses?.[folderPath.split("/")[0]] ?? {};
  const descriptionMatch = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i);
  const descriptionType = category === "Other" ? "HTML and CSS" : category.toLowerCase();
  const description =
    override.description ??
    (descriptionMatch
      ? readAttribute(descriptionMatch[0], "content")
      : (root.description ?? `Standalone ${descriptionType} demo from the component collection.`));
  const descriptionEsMatch =
    html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description[-:]es["'])[^>]*>/i) ??
    html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*\bhreflang\s*=\s*["']es["'][^>]*>/i) ??
    html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*\blang\s*=\s*["']es["'][^>]*>/i);
  const descriptionEs =
    override.descriptionEs ??
    (descriptionEsMatch ? readAttribute(descriptionEsMatch[0], "content") : (root.descriptionEs ?? null));
  const previewPath = path.relative(repositoryDirectory, pagePath).split(path.sep).join("/");
  const missingReferences = await getMissingReferences(html, pageDirectory, root.directory);
  const files = await collectComponentFiles(pageDirectory, id);
  const license = override.license ?? folderLicense.license ?? root.license ?? "Unverified";
  const source = override.source ?? folderLicense.source ?? root.source ?? "Unverified";
  const rawLicenseFile = String(
    override.licenseFile ?? folderLicense.licenseFile ?? root.licenseFile ?? "",
  ).replaceAll("\\", "/");
  const licenseFile = rawLicenseFile.startsWith("./") ? rawLicenseFile.slice(2) : rawLicenseFile;
  // La licencia de la raiz entra en el ZIP de cada componente: si no, la descarga
  // saldria sin el texto que la ampara.
  if (licenseFile && !files.some((file) => file.relativePath === licenseFile)) {
    const rootLicensePath = path.join(root.directory, licenseFile);
    try {
      if ((await stat(rootLicensePath)).isFile()) {
        files.push({
          name: path.basename(rootLicensePath),
          relativePath: licenseFile,
          path: `../${path.relative(repositoryDirectory, rootLicensePath).split(path.sep).join("/")}`,
          archivePath: `${id}/${licenseFile}`,
        });
      }
    } catch {
      // Sin licencia en disco no hay descarga: lo comprueba el calculo de abajo.
    }
  }
  const includesLicenseFile = files.some((file) => file.relativePath === licenseFile);
  const redistributable =
    (override.redistributable ?? folderLicense.redistributable ?? root.redistributable) === true;
  const downloadable =
    redistributable &&
    source !== "Unverified" &&
    license !== "Unverified" &&
    includesLicenseFile &&
    missingReferences.length === 0;

  return {
    id,
    name,
    ...(nameEs ? { nameEs } : {}),
    category,
    author: override.author ?? folderAuthor ?? root.author ?? "kindred-98",
    featured: override.featured === true,
    // Orden dentro de la seccion destacados de Inicio: el numero lo pone
    // quien edita component-overrides.json, que es como se reordenan.
    ...(typeof override.featuredOrder === "number" ? { featuredOrder: override.featuredOrder } : {}),
    description,
    ...(descriptionEs ? { descriptionEs } : {}),
    tags: override.tags ?? getTags(folderPath, name, category),
    root: root.name,
    folder: folderPath,
    preview: `../${previewPath}`,
    html: await readFile(pagePath, "utf8"),
    stylesheets: await getLocalReferences(html, pageDirectory, root.directory, "link", "href", (tag) =>
      /\brel\s*=\s*["'][^"']*\bstylesheet\b/i.test(tag),
    ),
    scripts: await getLocalReferences(html, pageDirectory, root.directory, "script", "src", () => true),
    missingReferences,
    inlineCss: getInlineBlocks(html, "style", () => true),
    inlineJavaScript: getInlineBlocks(
      html,
      "script",
      (attributes) => !/\btype\s*=\s*["'](?:x-|text\/x-|application\/ld\+json)/i.test(attributes),
    ),
    license,
    source,
    licenseFile: licenseFile || null,
    downloadable,
    files,
  };
}

let catalogOverrides = {};
try {
  catalogOverrides = JSON.parse(await readFile(overridesFile, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

// Nombres en espanol, tabla escrita a mano: clave el nombre ingles, valor el
// castellano. Solo se guardan las entradas que cambian; el resto ya son
// españolas o son nombres propios.
let namesEs = {};
try {
  namesEs = JSON.parse(await readFile(namesEsFile, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const pages = (
  await Promise.all(
    libraryRoots.map(async (root) => ({
      root,
      files: (await findHtmlPages(root.directory)).sort((first, second) => first.localeCompare(second)),
    })),
  )
).flatMap(({ root, files }) => files.map((page) => ({ root, page })));
const components = await Promise.all(pages.map(({ root, page }) => createComponent(root, page)));
const duplicateIds = components.filter(
  (component, index) => components.findIndex((entry) => entry.id === component.id) !== index,
);

if (duplicateIds.length) {
  throw new Error(`Duplicate component IDs: ${duplicateIds.map((component) => component.id).join(", ")}`);
}

await mkdir(path.dirname(catalogFile), { recursive: true });
// Indice en una sola linea: el pretty-print anterior costaba 225 KB de
// espacios en un fichero que solo se parsea en el navegador.
await writeFile(catalogFile, `${JSON.stringify(components.map(toIndexEntry))}\n`, "utf8");
await writeFile(catalogScriptFile, `window.COMPONENT_CATALOG = ${JSON.stringify(components)};\n`, "utf8");
await writeSources(sourcesDirectory, components);
console.log(
  `Generated ${components.length} component entries at ${path.relative(repositoryDirectory, catalogFile)} ` +
    `and ${components.length} source files at ${path.relative(repositoryDirectory, sourcesDirectory)}.`,
);
