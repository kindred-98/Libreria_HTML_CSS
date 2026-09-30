import { readdir, readFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toIndexEntry, writeSources } from "./catalog-format.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
// Cada raiz declara su autor: es el dato del filtro de autores de la web.
// DavokerDiseñador agrupa los 119 efectos de texto de davoker. Su portada,
// DavokerDiseñador/davoker.html, no es un componente: solo se catalogan los
// index.html, y la abre el filtro de autores dentro de la rejilla.
// GevendraAutorExterno/ sigue en el repositorio, pero queda FUERA de esta lista:
// sus 116 demos son de un tercero que no declara licencia y no respondio a los
// contactos, asi que no se catalogan, no se publican y no se sirven. Ver
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
    titleCleanup: (title) => title.replace(/^Efecto\s+/i, "").replace(/\s*[-|:]\s*Showcase$/i, "").trim(),
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
      "indicadores-de-carga": { license: "MIT", licenseFile: "LICENSE", source: "https://github.com/kindred-98/Libreria_HTML_CSS", redistributable: true },
      navegacion: { license: "MIT", licenseFile: "LICENSE", source: "https://github.com/kindred-98/Libreria_HTML_CSS", redistributable: true },
      tarjetas: { license: "MIT", licenseFile: "LICENSE", source: "https://github.com/kindred-98/Libreria_HTML_CSS", redistributable: true },
    },
  },
];
const catalogFile = path.join(repositoryDirectory, "Web", "data", "catalog.json");
const catalogScriptFile = path.join(repositoryDirectory, "Web", "data", "catalog.js");
const sourcesDirectory = path.join(repositoryDirectory, "Web", "data", "sources");
const overridesFile = path.join(repositoryDirectory, "Web", "data", "component-overrides.json");

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
  const match = tag.match(new RegExp(String.raw`\b${attribute}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function cleanText(value) {
  return value
    .replace(/<[^<>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function removeBrandSuffix(value) {
  const suffixes = [" - gevstack", " - gev stack", " | gevstack", " | gev stack", ": gevstack", ": gev stack", " gevstack", " gev stack"];
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

const categoryRules = [
  ["Loaders", /loader|loading|preloader|skeleton|spinner|shimmer|placeholder|progress/],
  ["Forms", /form|input|email|login|log-in|signin|sign-in|signup|sign-up|dropzone|upload|subscribe|subscription|contact|reservation|reserve|booking|otp|captcha|validation|checklist/],
  ["Navigation", /navbar|nav-|navigation|breadcrumb|pagination|tab-|tabs|menu|footer|header|sidebar|side-bar|dock|command-palette|scroll-spy|mega-menu|marquee|ticker|breadcrumb/],
  ["Galleries", /gallery|carousel|slider|photo|image-grid|image-gallery|lightbox|thumbnail/],
  ["Buttons", /button|btn|submit|fab|chip|badge|pill|tag|stepper/],
  ["Cards", /card|pricing|tier|testimonial|profile|product|movie|stat-card/],
  ["Controls", /toggle|switch|range|slider|knob|dial|rotary|volume|checkbox|radio|slider|picker|selector|select|lever|gauge|meter|clock|timer|calendar|lock|safe|compass|joystick|scrub/],
  ["Effects", /gradient|glow|blur|shadow|glass|glassmorphic|frost|neumorph|hover|reveal|glitch|mask|liquid|neon|chrome|metaball|particle|3d|cube|depth|reflect|holograph|prism|caustic|aurora|plasma|vapor|steam|smoke|frost/],
  ["Animations", /animation|animated|animate|morph|spin|float|drift|pulse|flicker|bounce|shake|orbit|fall|rise|swing|flip|unfold|confetti|firework|rain|meteor|snow|trail|draw|scribble|typewriter|blink|cascade|tumble|twist|ripple|wave|parallax|countdown|boot|reveal-text/],
];

function getCategory(value) {
  const name = value.toLowerCase();
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

async function getLocalReferences(html, pageDirectory, rootDirectory, tagName, referenceAttribute, includeTag) {
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

    try {
      if ((await stat(resolvedPath)).isFile()) {
        const relativePath = path.relative(repositoryDirectory, resolvedPath).split(path.sep).join("/");
        references.push({
          name: path.basename(resolvedPath),
          path: `../${relativePath}${referenceSuffix}`,
          code: await readFile(resolvedPath, "utf8"),
        });
      }
    } catch {
      // Ignore optional references that do not exist in the local checkout.
    }
  }

  return [...new Map(references.map((reference) => [reference.path, reference])).values()];
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
  const folderCategory = root.categories?.[folderPath.split("/")[0]];
  const category = override.category ?? folderCategory ?? getCategory(`${directoryName} ${name}`);
  // Algunas carpetas cambian de autor sin cambiar de raiz (las de fatmaerm).
  const folderAuthor = root.authors?.[folderPath.split("/")[0]];
  // ...y otras cambian de licencia (otra vez las de fatmaerm).
  const folderLicense = root.licenses?.[folderPath.split("/")[0]] ?? {};
  const descriptionMatch = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i);
  const descriptionType = category === "Other" ? "HTML and CSS" : category.toLowerCase();
  const description = override.description ?? (descriptionMatch
    ? readAttribute(descriptionMatch[0], "content")
    : root.description ?? `Standalone ${descriptionType} demo from the component collection.`);
  const descriptionEsMatch = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description[-:]es["'])[^>]*>/i)
    ?? html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*\bhreflang\s*=\s*["']es["'][^>]*>/i)
    ?? html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*\blang\s*=\s*["']es["'][^>]*>/i);
  const descriptionEs = override.descriptionEs ?? (descriptionEsMatch
    ? readAttribute(descriptionEsMatch[0], "content")
    : root.descriptionEs ?? null);
  const previewPath = path.relative(repositoryDirectory, pagePath).split(path.sep).join("/");
  const missingReferences = await getMissingReferences(html, pageDirectory, root.directory);
  const files = await collectComponentFiles(pageDirectory, id);
  const license = override.license ?? folderLicense.license ?? root.license ?? "Unverified";
  const source = override.source ?? folderLicense.source ?? root.source ?? "Unverified";
  const rawLicenseFile = String(override.licenseFile ?? folderLicense.licenseFile ?? root.licenseFile ?? "").replaceAll("\\", "/");
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
  const redistributable = (override.redistributable ?? folderLicense.redistributable ?? root.redistributable) === true;
  const downloadable = redistributable
    && source !== "Unverified"
    && license !== "Unverified"
    && includesLicenseFile
    && missingReferences.length === 0;

  return {
    id,
    name,
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
    stylesheets: await getLocalReferences(
      html,
      pageDirectory,
      root.directory,
      "link",
      "href",
      (tag) => /\brel\s*=\s*["'][^"']*\bstylesheet\b/i.test(tag),
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

const pages = (await Promise.all(
  libraryRoots.map(async (root) => ({
    root,
    files: (await findHtmlPages(root.directory)).sort((first, second) => first.localeCompare(second)),
  })),
)).flatMap(({ root, files }) => files.map((page) => ({ root, page })));
const components = await Promise.all(pages.map(({ root, page }) => createComponent(root, page)));
const duplicateIds = components.filter((component, index) => components.findIndex((entry) => entry.id === component.id) !== index);

if (duplicateIds.length) {
  throw new Error(`Duplicate component IDs: ${duplicateIds.map((component) => component.id).join(", ")}`);
}

await mkdir(path.dirname(catalogFile), { recursive: true });
await writeFile(catalogFile, `${JSON.stringify(components.map(toIndexEntry), null, 2)}\n`, "utf8");
await writeFile(
  catalogScriptFile,
  `window.COMPONENT_CATALOG = ${JSON.stringify(components)};\n`,
  "utf8",
);
await writeSources(sourcesDirectory, components);
console.log(
  `Generated ${components.length} component entries at ${path.relative(repositoryDirectory, catalogFile)} `
  + `and ${components.length} source files at ${path.relative(repositoryDirectory, sourcesDirectory)}.`,
);
