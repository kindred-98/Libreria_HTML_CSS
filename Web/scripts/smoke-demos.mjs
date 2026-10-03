/**
 * Test de humo de los demos: mide que esta roto de verdad. **No arregla nada.**
 *
 * Por que existe: `validate.mjs`, `validar-csp.mjs` y `validar-layout.mjs`
 * miran ficheros, cabeceras y el layout del sitio, y ninguno de los tres abre
 * ni un demo. Un demo puede tirar una excepcion, pedir un recurso que no existe
 * o chocar con el `localStorage` del sandbox y todas las validaciones siguen
 * en verde. Unico modo de saberlo: abrirlos.
 *
 * Que hace: levanta `serve.mjs` y, para cada entrada del catalogo, abre
 * `404.html` como wrapper —tiene que ser una pagina de ESTE origen para que el
 * `frame-ancestors 'self'` del demo deje montar el iframe, y es la unica que
 * no pinta nada: su guion es sincrono y no vuelve a ejecutarse— y dentro
 * monta **un iframe que replica el sandbox de produccion**
 * (`allow-scripts allow-forms allow-popups`, sin `allow-same-origin`, tal y
 * como lo escribe `app.js`) apuntando al demo. Eso es exactamente lo que vera
 * el visitante, incluidos los demos que revientan porque usan `localStorage`
 * dentro de un origen opaco.
 *
 *   node Web/scripts/smoke-demos.mjs                    compara con la linea base
 *   node Web/scripts/smoke-demos.mjs --linea-base       (re)escribe la linea base
 *
 * Registra cuatro tipos de fallo por demo — `consola`, `excepcion`, `fallida`
 * y `http400` — mas `timeout` si la pagina no llega a `load`. Los hosts
 * externos NO son un fallo: se anotan aparte en `externos`, y de paso se
 * **abortan** con `page.route` para que el resultado no dependa de la red ni
 * de lo que este sirviendo Wikimedia hoy.
 *
 * Salidas:
 *   Web/data/smoke-report.json      informe completo (en .gitignore)
 *   Web/data/smoke-baseline.json    linea base (SI se versiona)
 *
 * Aviso sobre intermitencia: algun demo revienta solo unas veces (el caso
 * conocido es `botones-cavitation-bubble-button`, cuyo bucle de render
 * depende del frame en el que arranca). Si aparece un fallo nuevo que no se
 * reproduce al repetir el comando, no toques el codigo: vuelve a lanzarlo. La
 * linea base se creo incluyendolo, de modo que mientras este ahi pasa siempre.
 *
 * En el CI hace falta el navegador: `npx playwright install --with-deps chromium`.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "..", "..");
const catalogFile = path.join(repositoryDirectory, "Web", "data", "catalog.json");
const reportFile = path.join(repositoryDirectory, "Web", "data", "smoke-report.json");
const baselineFile = path.join(repositoryDirectory, "Web", "data", "smoke-baseline.json");

const CONCURRENCIA = 6;
// load + 1 segundo: el segundo es para los demos que arrancan con un timeout
// o una animacion de entrada y que en `load` todavia no han dicho nada.
const ESPERA_TRAS_LOAD = 1000;
const TIMEOUT_PAGINA = 30000;
const guardarLineaBase = process.argv.includes("--linea-base");

// Puerto libre, en vez de uno fijo: en local casi siempre hay ya un servidor
// de desarrollo levantado, y si este tropezara con el suyo la comprobacion
// fallaria por un motivo que no tiene que ver con los demos.
async function puertoLibre() {
  const fijado = Number(process.env.PORT ?? 0);
  if (fijado) return fijado;
  return new Promise((resolve, reject) => {
    const sonda = net.createServer();
    sonda.on("error", reject);
    sonda.listen(0, "127.0.0.1", () => {
      const { port } = sonda.address();
      sonda.close(() => resolve(port));
    });
  });
}

function arrancarServidor(puerto) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, [path.join(scriptDirectory, "serve.mjs")], {
      env: { ...process.env, PORT: String(puerto) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let salida = "";
    let arrancado = false;
    const listo = () => {
      if (arrancado) return;
      arrancado = true;
      resolve(proceso);
    };
    proceso.stdout.on("data", (trozo) => {
      salida += trozo;
      if (salida.includes("Sirviendo el repositorio")) listo();
    });
    proceso.stderr.on("data", (trozo) => { salida += trozo; });
    proceso.on("error", reject);
    proceso.on("exit", (codigo) => {
      if (!arrancado) {
        reject(new Error(`serve.mjs no arranco en el puerto ${puerto} (codigo ${codigo}):\n${salida.trim()}`));
      }
    });
    setTimeout(() => {
      if (!arrancado) reject(new Error(`serve.mjs no arranco en 15 s en el puerto ${puerto}:\n${salida.trim()}`));
    }, 15000).unref();
  });
}

function esperar(milisegundos) {
  return new Promise((resolve) => setTimeout(resolve, milisegundos));
}

// host normalizado, para poder comparar y para que el informe no se llene de
// URL con tokens de cache distintos en cada pasada.
function hostDe(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

/**
 * El wrapper: reemplaza el cuerpo de la pagina del sitio por un iframe con el
 * mismo sandbox que `app.js` y resuelve cuando ese iframe carga (o a los 30 s,
 * que un iframe que no llega tiene que contar como timeout y no colgar el run).
 */
const MONTAR_IFRAME = (src) =>
  new Promise((resolver) => {
    document.body.innerHTML =
      `<iframe id="smoke" src="${src}" sandbox="allow-scripts allow-forms allow-popups" ` +
      `style="width:100%;height:600px;border:0"></iframe>`;
    const marco = document.getElementById("smoke");
    let hecho = false;
    const fin = () => { if (!hecho) { hecho = true; resolver(true); } };
    marco.addEventListener("load", fin);
    setTimeout(fin, 30000);
  });

const catalogo = JSON.parse(await readFile(catalogFile, "utf8"));
const cola = catalogo
  .map((entrada) => ({
    id: entrada.id,
    // `preview` es relativo a /Web/, que es como lo consume app.js: hay que
    // resolverlo contra ese directorio y no contra la raiz (`../X` contra `/`
    // se queda en `/`, pero contra `/Web/` baja a `/X`, que es donde vive el
    // demo). Se conserva la query (`?previewRevision=...`): la trae el catalogo.
    url: (() => {
      const ruta = new URL(entrada.preview, "http://127.0.0.1/Web/");
      return ruta.pathname + ruta.search;
    })(),
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

if (!cola.length) {
  console.error("x el catalogo no tiene ninguna entrada: ejecuta `npm run catalogo`.");
  process.exit(1);
}

const puerto = await puertoLibre();
const ORIGEN = `http://127.0.0.1:${puerto}`;
const servidor = await arrancarServidor(puerto);
const navegador = await chromium.launch();

/** id -> { fallos: Map<clave, {tipo,mensaje}>, externos: Map<host, veces> } */
const resultados = new Map();

function resultadoDe(id) {
  if (!resultados.has(id)) resultados.set(id, { fallos: new Map(), externos: new Map() });
  return resultados.get(id);
}

function anotarFallo(id, tipo, mensaje) {
  const registro = resultadoDe(id);
  // Se deduplica por el mensaje ya normalizado: la causa se anota una vez,
  // aunque el motor repita el mismo error con milisegundos o coordenadas
  // distintas. En el informe se guarda el texto original, que es el util para
  // leerlo; la normalizacion se vuelve a aplicar al comparar.
  const clave = `${tipo}\u0000${normalizarMensaje(tipo, mensaje)}`;
  if (!registro.fallos.has(clave)) registro.fallos.set(clave, { tipo, mensaje });
}

/**
 * Devuelve la parte del mensaje que es estable entre ejecuciones, sin la que
 * depende del momento en el que se ha abierto el navegador. Sin esto la
 * comparacion con la linea base se vuelve ruido puro y el CI parpadea.
 */
function normalizarMensaje(tipo, mensaje) {
  // El puerto es libre y distinto en cada arranque.
  let texto = mensaje.split(ORIGEN).join("<origen>");
  // `?previewRevision=...` lo pone el catalogo y cambia con cada
  // `npm run catalogo`; ademas es solo cacheo, no diagnostico.
  texto = texto.replace(/(https?:\/\/[^\s?]+)\?[^\s]*/g, "$1");
  if (tipo === "consola" || tipo === "excepcion") {
    // El motor escribe valores de runtime dentro del mensaje (coordenadas
    // SVG, milisegundos, numeros de posicion) y si es largo lo elide ademas
    // por el medio, de modo que la cola cambia en cada frame: solo se queda la
    // causa, que es lo unico que sirve para decir "esto es lo de siempre" o
    // "esto es algo nuevo".
    texto = texto.replace(/\d+/g, "#").slice(0, 40);
  }
  return texto;
}

function anotarExterno(id, host) {
  const registro = resultadoDe(id);
  registro.externos.set(host, (registro.externos.get(host) ?? 0) + 1);
}

try {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 640 } });

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCIA, cola.length) }, async () => {
      const pestana = await contexto.newPage();
      let idActual = null;

      // Todo lo que sale de este origen se corta antes de tocar la red: el
      // resultado tiene que ser el mismo con el wifi caido.
      await pestana.route("**/*", (route) => {
        const url = route.request().url();
        if (url.startsWith(ORIGEN) || url.startsWith("data:") || url.startsWith("about:")) {
          return route.continue();
        }
        if (idActual) anotarExterno(idActual, hostDe(url));
        return route.abort();
      });

      pestana.on("console", (mensaje) => {
        if (!idActual || mensaje.type() !== "error") return;
        const texto = mensaje.text();
        // "Failed to load resource" es el mismo evento que ya cubren `fallida`
        // y `http400`: contarlo aqui duplicaria cada 404 en dos categorias.
        if (texto.startsWith("Failed to load resource")) return;
        anotarFallo(idActual, "consola", texto);
      });

      pestana.on("pageerror", (error) => {
        if (!idActual) return;
        anotarFallo(idActual, "excepcion", String(error.message ?? error));
      });

      pestana.on("requestfailed", (peticion) => {
        if (!idActual) return;
        const url = peticion.url();
        // Las externas se abortan nosotros: no son un fallo del demo, son la
        // política de "externo". Solo cuenta lo que deberia salir de este origen.
        if (!url.startsWith(ORIGEN)) return;
        anotarFallo(idActual, "fallida", `${peticion.method()} ${url} -> ${peticion.failure()?.errorText ?? "?"}`);
      });

      pestana.on("response", (respuesta) => {
        if (!idActual) return;
        const url = respuesta.url();
        if (!url.startsWith(ORIGEN)) return;
        if (respuesta.status() < 400) return;
        anotarFallo(idActual, "http400", `${respuesta.request().method()} ${url} -> ${respuesta.status()}`);
      });

      while (cola.length) {
        const demo = cola.shift();
        // El demo vive en la raiz (`/CreacionesNuevas/...`), no bajo /Web/: la
        // ruta del catalogo ya es absoluta desde la raiz.
        const destino = `${ORIGEN}${demo.url}`;
        try {
          // El wrapper se abre con `idActual` todavia a null: lo que haga
          // 404.html en su propio arranque (su guion inline) no es culpa del
          // demo, y anotarlo aqui ensuciaria las mil entradas por igual.
          await pestana.goto(`${ORIGEN}/404.html`, { waitUntil: "domcontentloaded", timeout: TIMEOUT_PAGINA });
          idActual = demo.id;
          await pestana.evaluate(MONTAR_IFRAME, destino);
          await esperar(ESPERA_TRAS_LOAD);
          // Desmontar el iframe CON el demo aun atribuido hace que las
          // peticiones que queden en vuelo se anoten contra el, en vez de
          // colarse en el siguiente.
          await pestana.evaluate(() => { document.body.innerHTML = ""; });
          await esperar(50);
        } catch (error) {
          anotarFallo(demo.id, "timeout", String(error.message ?? error).split("\n")[0]);
        } finally {
          idActual = null;
        }
      }
      await pestana.close();
    }),
  );

  await contexto.close();
} finally {
  await navegador.close();
  servidor.kill();
}

// --- Informe ----------------------------------------------------------------

const total = catalogo.length;
const lineas = [];
let conFallos = 0;
const porTipo = {};
const demosConExternos = [];
const hostsExternos = new Map();

for (const entrada of catalogo) {
  const registro = resultados.get(entrada.id) ?? { fallos: new Map(), externos: new Map() };
  const fallos = [...registro.fallos.values()].sort((a, b) =>
    a.tipo.localeCompare(b.tipo) || a.mensaje.localeCompare(b.mensaje),
  );
  const externos = [...registro.externos.keys()].sort((a, b) => a.localeCompare(b));
  if (fallos.length) conFallos += 1;
  for (const fallo of fallos) porTipo[fallo.tipo] = (porTipo[fallo.tipo] ?? 0) + 1;
  if (externos.length) {
    demosConExternos.push({ id: entrada.id, externos });
    for (const [host, veces] of registro.externos) hostsExternos.set(host, (hostsExternos.get(host) ?? 0) + veces);
  }
  if (fallos.length || externos.length) lineas.push({ id: entrada.id, fallos, externos });
}

const informe = {
  generado: new Date().toISOString(),
  origen: ORIGEN,
  total,
  conFallos,
  sinFallos: total - conFallos,
  porTipo,
  externos: {
    demos: demosConExternos.length,
    hosts: Object.fromEntries([...hostsExternos].sort((a, b) => b[1] - a[1])),
    detalle: demosConExternos,
  },
  demos: lineas,
};

await mkdir(path.dirname(reportFile), { recursive: true });
await writeFile(reportFile, `${JSON.stringify(informe, null, 2)}\n`, "utf8");

// --- Linea base -------------------------------------------------------------
// Clave triple id+tipo+mensaje: el mismo mensaje en otro demo es otro fallo,
// y el mismo mensaje con otra redaccion es un fallo nuevo que hay que ver.
// El mensaje se normaliza aqui y no al anotarlo, para que la linea base guarde
// el texto original y el informe siga siendo legible.
const claveDe = (fallo) => `${fallo.id}\u0000${fallo.tipo}\u0000${normalizarMensaje(fallo.tipo, fallo.mensaje)}`;
const actuales = catalogo.flatMap((entrada) => {
  const registro = resultados.get(entrada.id);
  if (!registro) return [];
  return [...registro.fallos.values()].map((fallo) => ({ id: entrada.id, ...fallo }));
});

if (guardarLineaBase) {
  const lineaBase = actuales
    .sort((a, b) => claveDe(a).localeCompare(claveDe(b)))
    .map(({ id, tipo, mensaje }) => ({ id, tipo, mensaje }));
  await writeFile(baselineFile, `${JSON.stringify(lineaBase, null, 2)}\n`, "utf8");
  console.log(`\nLinea base escrita: ${path.relative(repositoryDirectory, baselineFile)} (${lineaBase.length} fallos)`);
} else {
  let lineaBase;
  try {
    lineaBase = JSON.parse(await readFile(baselineFile, "utf8"));
  } catch {
    console.error(`\nx no existe ${path.relative(repositoryDirectory, baselineFile)}.`);
    console.error("  Crela con:  node Web/scripts/smoke-demos.mjs --linea-base");
    process.exit(1);
  }

  const conocidos = new Set(lineaBase.map(claveDe));
  const vistos = new Set(actuales.map(claveDe));
  const nuevos = actuales.filter((fallo) => !conocidos.has(claveDe(fallo)));
  const obsoletos = lineaBase.filter((fallo) => !vistos.has(claveDe(fallo)));

  if (nuevos.length) {
    console.error(`\nx ${nuevos.length} fallo(s) NUEVO(s) respecto a la linea base:\n`);
    for (const fallo of nuevos) console.error(`  x [${fallo.tipo}] ${fallo.id}: ${fallo.mensaje}`);
  }
  if (obsoletos.length) {
    console.log(`\naviso: ${obsoletos.length} entrada(s) de la linea base no han saltado esta vez.`);
    console.log("       Si al repetir el comando tampoco saltan, borralas de la linea base:");
    for (const fallo of obsoletos) console.log(`  - [${fallo.tipo}] ${fallo.id}: ${fallo.mensaje}`);
  }
  if (nuevos.length) process.exit(1);
}

// --- Resumen ----------------------------------------------------------------

const tipos = Object.entries(porTipo)
  .sort((a, b) => b[1] - a[1])
  .map(([tipo, cuenta]) => `${tipo}=${cuenta}`)
  .join(" · ");

console.log(`\ninfo  ${total} demos · ${conFallos} con fallos · ${total - conFallos} sin ninguno`);
if (tipos) console.log(`info  por tipo: ${tipos}`);
console.log(
  `info  demos con peticiones externas: ${demosConExternos.length}` +
    ` (hosts: ${Object.keys(informe.externos.hosts).join(", ") || "ninguno"})`,
);
console.log(`info  informe: ${path.relative(repositoryDirectory, reportFile)}`);
