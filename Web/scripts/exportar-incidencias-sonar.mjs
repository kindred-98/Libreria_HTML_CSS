/**
 * Descarga todas las incidencias del proyecto de SonarQube Cloud a CSV y JSON.
 *
 * Por que existe: SonarQube for IDE solo analiza los archivos que tienes
 * abiertos, asi que dentro de VS Code no hay forma de ver el listado completo
 * del proyecto. La web de SonarQube si lo tiene, pero para trabajar con el
 * informe (contar, agrupar por regla, priorizar) viene bien tenerlo en disco.
 *
 * Que hace: pagina `api/issues/search` y `api/hotspots/search` de SonarQube
 * Cloud, escribe un CSV plano por cada uno y un `resumen.md` con los recuentos
 * por severidad, tipo, regla y archivo. No modifica nada del repositorio: todo
 * va a `tmp/sonar/`, que esta en el `.gitignore`.
 *
 *   $env:SONAR_TOKEN="<token de sonarcloud.io>"
 *   $env:SONAR_PROYECTO="kindred-98_Libreria_HTML_CSS"
 *   node Web/scripts/exportar-incidencias-sonar.mjs
 *   npm run sonar:exportar
 *
 * El token se lee de `SONAR_TOKEN` para que no acabe en ningun archivo. Si no
 * esta, el script dice como crearlo en lugar de pedirlo por pantalla.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_POR_DEFECTO = "https://sonarcloud.io";
const TAMANO_PAGINA = 500;

const token = process.env.SONAR_TOKEN?.trim();
const proyecto = process.env.SONAR_PROYECTO?.trim();
const base = (process.env.SONAR_URL?.trim() || BASE_POR_DEFECTO).replace(/\/+$/, "");

if (!token || !proyecto) {
  console.error("Faltan SONAR_TOKEN y/o SONAR_PROYECTO.");
  console.error("");
  console.error("En PowerShell, para la sesion actual:");
  console.error('  $env:SONAR_TOKEN="<token>"');
  console.error('  $env:SONAR_PROYECTO="kindred-98_Libreria_HTML_CSS"');
  console.error("");
  console.error("El token se crea en sonarcloud.io: My Account > Security >");
  console.error("Generate Tokens. No hace falta que lo pegues aqui ni en ningun");
  console.error("archivo: el script solo lo lee de la variable de entorno.");
  process.exit(1);
}

const directorioScript = path.dirname(fileURLToPath(import.meta.url));
const directorioSalida = path.resolve(directorioScript, "../../tmp/sonar");

const cabeceras = {
  Authorization: `Basic ${Buffer.from(`${token}:`).toString("base64")}`,
  Accept: "application/json",
};

async function pedir(ruta, parametros) {
  const url = new URL(`${base}${ruta}`);
  for (const [clave, valor] of Object.entries(parametros)) {
    url.searchParams.set(clave, valor);
  }
  const respuesta = await fetch(url, { headers: cabeceras });
  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`${respuesta.status} ${respuesta.statusText} en ${url.pathname}: ${detalle.slice(0, 300)}`);
  }
  return respuesta.json();
}

async function paginar(ruta, parametros) {
  const elementos = [];
  let pagina = 1;
  for (;;) {
    const cuerpo = await pedir(ruta, { ...parametros, p: String(pagina), ps: String(TAMANO_PAGINA) });
    const lote = cuerpo.issues ?? cuerpo.hotspots ?? cuerpo.components ?? [];
    elementos.push(...lote);
    const total = cuerpo.paging?.total ?? cuerpo.hotspots?.length ?? elementos.length;
    if (lote.length === 0 || elementos.length >= total || lote.length < TAMANO_PAGINA) break;
    pagina += 1;
    process.stdout.write(`  pagina ${pagina} (${elementos.length}/${total})\n`);
  }
  return elementos;
}

function celda(valor) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /["\n\r;]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

function csv(cabecerasCsv, filas) {
  return [cabecerasCsv.join(","), ...filas.map((fila) => fila.map(celda).join(","))].join("\n") + "\n";
}

function contar(objetos, llave) {
  const mapa = new Map();
  for (const objeto of objetos) {
    const valor = objeto[llave] ?? "(sin dato)";
    mapa.set(valor, (mapa.get(valor) ?? 0) + 1);
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function tabla(recuentos, limite = 30) {
  if (recuentos.length === 0) return "_Sin datos._\n";
  return recuentos
    .slice(0, limite)
    .map(([clave, total]) => `| ${clave} | ${total} |`)
    .join("\n");
}

console.log(`Proyecto: ${proyecto}`);
console.log(`Servidor: ${base}`);
console.log("Incidencias...");
const incidencias = await paginar("/api/issues/search", {
  componentKeys: proyecto,
  // Sin este filtro la API tambien devuelve las incidencias ya cerradas, que
  // inflan el recuento y hacen que aparezcan avisos sobre codigo que ya no
  // existe. Es lo que se ve en el panel de Issues de la web.
  issueStatuses: "OPEN,CONFIRMED",
  additionalFields: "_all",
});
console.log(`  ${incidencias.length} incidencias`);

console.log("Security hotspots...");
let hotspots = [];
try {
  hotspots = await paginar("/api/hotspots/search", { projectKey: proyecto });
} catch (error) {
  console.warn(`  no se pudieron leer los hotspots (${error.message}). Suele pasar si la cuenta no es de pago.`);
}
console.log(`  ${hotspots.length} hotspots`);

const lineasIncidencias = incidencias.map((issue) => [
  issue.key,
  issue.severity,
  issue.type,
  issue.rule,
  issue.status,
  issue.component?.replace(`${proyecto}:`, ""),
  issue.line ?? issue.textRange?.startLine ?? "",
  issue.effort ?? "",
  issue.message,
]);

const lineasHotspots = hotspots.map((hotspot) => [
  hotspot.vulnerabilityProbability,
  hotspot.securityCategory,
  hotspot.ruleKey ?? hotspot.rule,
  hotspot.status,
  hotspot.component,
  hotspot.line ?? "",
  hotspot.message,
]);

await mkdir(directorioSalida, { recursive: true });

const resumen = [
  `# Incidencias de ${proyecto}`,
  "",
  `Generado el ${new Date().toISOString()} contra ${base}.`,
  "",
  `- Incidencias: ${incidencias.length}`,
  `- Security hotspots: ${hotspots.length}`,
  `- Degradaciones (deuda tecnica): ${incidencias.filter((i) => i.type === "CODE_SMELL").length}`,
  "",
  "## Por severidad",
  "",
  "| Severidad | Total |",
  "| --- | --- |",
  tabla(contar(incidencias, "severity")),
  "",
  "## Por tipo",
  "",
  "| Tipo | Total |",
  "| --- | --- |",
  tabla(contar(incidencias, "type")),
  "",
  "## Reglas con mas incidencias",
  "",
  "| Regla | Total |",
  "| --- | --- |",
  tabla(contar(incidencias, "rule")),
  "",
  "## Archivos con mas incidencias",
  "",
  "| Archivo | Total |",
  "| --- | --- |",
  tabla(contar(incidencias.map((issue) => ({ archivo: issue.component?.replace(`${proyecto}:`, "") })), "archivo"), 40),
  "",
].join("\n");

await writeFile(path.join(directorioSalida, "incidencias.csv"), csv(
  ["clave", "severidad", "tipo", "regla", "estado", "archivo", "linea", "esfuerzo", "mensaje"],
  lineasIncidencias,
), "utf8");

await writeFile(path.join(directorioSalida, "incidencias.json"), JSON.stringify(incidencias, null, 2), "utf8");
await writeFile(path.join(directorioSalida, "resumen.md"), resumen, "utf8");

if (hotspots.length > 0) {
  await writeFile(path.join(directorioSalida, "hotspots.csv"), csv(
    ["probabilidad", "categoria", "regla", "estado", "archivo", "linea", "mensaje"],
    lineasHotspots,
  ), "utf8");
}

console.log("");
console.log(`Escrito en ${directorioSalida}`);
console.log("  resumen.md, incidencias.csv, incidencias.json" + (hotspots.length ? ", hotspots.csv" : ""));