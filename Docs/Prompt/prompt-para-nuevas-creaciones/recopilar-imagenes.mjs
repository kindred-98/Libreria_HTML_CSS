/**
 * Recopila imagenes thematicas de Wikimedia Commons para las galerias.
 *
 *   node Docs/Prompt/prompt-para-nuevas-creaciones/recopilar-imagenes.mjs
 *
 * Escribe imagenes-galerias.json con, por tema, imagenes de 960 px servidas por
 * upload.wikimedia.org (URL estable y permitida para hotlink), con autor y licencia.
 *
 * Notas de operacion, aprendidas a la fuerza:
 *  - La API de Commons y el CDN de imagenes limitan a ~4 peticiones seguidas (429).
 *    Por eso aqui NO se verifica una por una: las URLs las genera la propia API y son
 *    deterministas. Solo se lanza una MUESTRA de 3 por tema, en rafagas de 4, para
 *    detectar errores sistematicos.
 *  - Entre busqueda y busqueda hay 2,5 s de espera, y backoff exponencial ante un 429.
 *
 * Por que Commons: se puede enlazar en caliente, las URLs no caducan, aguantan trafico
 * y la licencia es libre, asi que cada imagen se puede creditar con su autor.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UA = "LibreriaHtmlCSS-Galerias/1.0 (biblioteca educativa de componentes; script local)";

const THEMES = {
  "montana": "mountain landscape sunrise",
  "montana-niebla": "mountain fog clouds",
  "playa": "beach coastline aerial",
  "oceano": "ocean waves sea",
  "cascada": "waterfall",
  "bosque": "forest trees",
  "bosque-niebla": "forest fog mist",
  "desierto": "desert dunes sand",
  "lago": "lake reflection",
  "canion": "canyon rock formation",
  "glaciar": "glacier ice",
  "aurora": "aurora borealis",
  "cielo-estrellado": "night sky stars milky way",
  "nebulosa": "nebula galaxy space",
  "ciudad-noche": "city skyline night lights",
  "ciudad-neon": "neon street night",
  "japon-ciudad": "tokyo street night",
  "calle-nocturna": "street photography night",
  "arquitectura-moderna": "modern architecture building",
  "escalera": "staircase architecture",
  "puente": "bridge architecture",
  "ciudad-aerea": "aerial view city rooftops",
  "catedral": "cathedral interior",
  "mercado": "market street stall",
  "cafeteria": "cafe interior",
  "comida": "food cuisine table",
  "postre": "dessert cake",
  "cafe": "coffee cup",
  "fruta": "fruit colorful",
  "flor": "flower macro",
  "primavera": "cherry blossom",
  "otono": "autumn leaves",
  "invierno": "winter snow landscape",
  "gato": "cat portrait",
  "perro": "dog portrait",
  "ave": "bird",
  "mariposa": "butterfly",
  "buceo": "coral reef underwater",
  "ukiyo-e": "ukiyo-e woodblock print",
  "estadio": "stadium crowd concert",
};

const WANT = 12;
const SAMPLE = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanUrl = (u) => u.split("?")[0].replace("//thumb.wikimedia.org/", "//upload.wikimedia.org/");
const text = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function api(params, tries = 6) {
  const url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" + params;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
    if (res.status === 429) { await sleep(2500 * (i + 1)); continue; }
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  throw new Error("API 429 persistente");
}

function candidate(page) {
  const ii = page?.imageinfo?.[0];
  if (!ii?.thumburl) return null;
  if (ii.width < 1100 || ii.height < 700) return null;
  const ratio = ii.width / ii.height;
  if (ratio < 0.6 || ratio > 2.2) return null;
  const license = text(ii.extmetadata?.LicenseShortName?.value);
  if (/fair use|non-?free/i.test(license)) return null;
  return {
    u: cleanUrl(ii.thumburl),
    w: Number(ii.thumburl.match(/(\d+)px-/)?.[1] ?? 960),
    t: (text(ii.extmetadata?.ObjectName?.value) || text(page.title).replace(/^File:/, "")).slice(0, 70),
    a: text(ii.extmetadata?.Artist?.value).slice(0, 60) || "Wikimedia Commons",
    l: license || "Wikimedia Commons",
  };
}

async function headOk(u) {
  try {
    const res = await fetch(u, { headers: { "user-agent": UA, range: "bytes=0-256" } });
    return res.status === 200 || res.status === 206;
  } catch {
    return false;
  }
}

const out = {};
let flojos = 0;
const n = Object.keys(THEMES).length;
let i = 0;
for (const [theme, terms] of Object.entries(THEMES)) {
  i++;
  let pages = [];
  try {
    const data = await api("&generator=search&gsrnamespace=6&gsrlimit=40"
      + "&gsrsearch=" + encodeURIComponent("filetype:bitmap " + terms)
      + "&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=960");
    pages = data?.query?.pages ?? [];
  } catch (e) {
    console.log(`${theme.padEnd(20)} busqueda fallo: ${e.message}`);
  }
  const cands = [];
  const seen = new Set();
  for (const p of pages) {
    const c = candidate(p);
    if (!c || seen.has(c.u)) continue;
    seen.add(c.u);
    cands.push(c);
  }
  const keep = cands.slice(0, WANT);

  const sample = keep.slice(0, SAMPLE);
  const results = [];
  for (const c of sample) { results.push(await headOk(c.u)); await sleep(700); }
  const live = results.filter(Boolean).length;
  for (let k = 0; k < sample.length; k++) sample[k].v = results[k];

  out[theme] = keep;
  if (keep.length < 6 || live === 0) flojos++;
  console.log(`${theme.padEnd(20)} ${String(keep.length).padStart(2)} candidatos | muestra ${live}/${sample.length} vivas | ${i}/${n} ${terms}`);
  await sleep(2500);
}

const file = path.join(HERE, "imagenes-galerias.json");
const total = Object.values(out).reduce((n2, a) => n2 + a.length, 0);
await writeFile(file, JSON.stringify({
  generado: new Date().toISOString().slice(0, 10),
  origen: "Wikimedia Commons via upload.wikimedia.org",
  nota: "Imagenes servidas por URL (hotlink). Verificadas solo en muestra por el limite de peticiones del CDN.",
  temas: out,
}, null, 1), "utf8");

console.log(`\n${total} imagenes en ${Object.keys(out).length} temas -> ${file}`);
if (flojos) console.log(`${flojos} temas flojos: revisa sus terminos de busqueda`);
