/**
 * Analiza la accesibilidad de las paginas del sitio con axe-core.
 *
 * Por que existe: `validate.mjs` y `validar-csp.mjs` son estaticas y
 * `validar-layout.mjs` solo mide anchos. Ninguna mira si un texto se puede leer,
 * si un boton tiene nombre accesible o si el contraste llega a 4,5:1. Esas
 * cosas no se ven en el codigo y tardan en descubrirse: se descubren cuando
 * alguien no puede usar la pagina, que es lo peor momento.
 *
 * Que hace: abre `index.html`, `components.html` y `team-core.html` en un
 * navegador de verdad y las analiza en las cuatro combinaciones que existen —
 * espanol e ingles, tema claro y oscuro — porque el contraste depende del tema
 * y los nombres accesibles del idioma. Son 12 pasadas.
 *
 *   node Web/scripts/validar-a11y.mjs
 *   npm run validar:a11y
 *
 * Corte: `serious` y `critical` son un fallo y sacan exit 1. `moderate` y
 * `minor` solo se informan, porque con ellos el ruido seria tal que la gente
 * dejaria de mirar el resultado, y un aviso que nadie lee vale menos que
 * ninguno.
 *
 * Ademas comprueba que al tabular hay un `:focus-visible` visible en botones y
 * enlaces: que al enfocar algo cambie el contorno o la sombra. Sin eso, solo
 * con el tabulador no se sabe donde esta el foco, que es la forma mas basica de
 * navegar sin raton.
 *
 * Alcance: las paginas del sitio. Lo que pasa dentro de los iframes de vista
 * previa de `components.html` es un demo, y eso es otra fase y otro tamano. Esas
 * incidencias se listan como aviso (con el prefijo `vista previa:`) para que no
 * se escondan, pero no cortan: si cortaran, el CI dependeria de que el catalogo
 * no ruede un demo nuevo con un fallo.
 *
 * En el CI hace falta el navegador: `npx playwright install --with-deps chromium`.
 */
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { puertoLibre, arrancarServidor } from "./lib/servidor.mjs";

// Solo las paginas del sitio. Los 1.018 demos no entran: cada uno es un
// experimento de CSS con sus propias reglas, y medirlos con las mismas
// reglas que la portada daria cientos de fallos que nadie sabria priorizar.
// Eso es trabajo aparte, y aqui se declara tal cual.
const PAGINAS = [
  { ruta: "/Web/index.html", nombre: "portada" },
  { ruta: "/Web/components.html", nombre: "componentes" },
  { ruta: "/Web/team-core.html", nombre: "team core" },
];

const IDIOMAS = ["es", "en"];
const TEMAS = ["light", "dark"];

// Lo que corta y lo que solo se informa. Es la frontera que fija el plan y no
// se toca sin decidirlo: bajar `serious` a "solo informe" convertiria este
// script en un adorno.
const CORTAN = new Set(["serious", "critical"]);
const INFORMAN = new Set(["moderate", "minor"]);

// Cuanto se tabula antes de dar por bueno el foco. El orden de tabulacion de la
// portada pasa por el conmutador de idioma, el de tema, la navegacion, el
// carrusel y el pie: con 40 se cubre sobrado.
const TABULACIONES = 40;

const fallos = [];
const avisos = [];
const notas = [];

function nombreCorto(texto) {
  return (texto ?? "").replace(/\s+/g, " ").trim().slice(0, 90);
}

const puerto = await puertoLibre();
const ORIGEN = `http://127.0.0.1:${puerto}`;
const servidor = await arrancarServidor(puerto);
const navegador = await chromium.launch();

let totalReglas = 0;
let pasadas = 0;

try {
  for (const pagina of PAGINAS) {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
    const pestana = await contexto.newPage();
    // Un recurso que no carga (una foto, un avatar) no debe tumbar el analisis:
    // lo que se mide es la pagina, no si Wikimedia esta caido.
    pestana.on("pageerror", () => {});

    for (const idioma of IDIOMAS) {
      for (const tema of TEMAS) {
        await pestana.goto(`${ORIGEN}${pagina.ruta}`, { waitUntil: "load" });

        const temaReal = await pestana.evaluate((deseado) => {
          if (document.documentElement.dataset.theme !== deseado) {
            document.querySelector("#theme-toggle")?.click();
          }
          return document.documentElement.dataset.theme;
        }, tema);
        if (temaReal !== tema) {
          fallos.push(`${pagina.nombre}: no se pudo pasar al tema ${tema} (queda en ${temaReal})`);
        }

        await pestana.click(`[data-language="${idioma}"]`);
        await pestana
          .waitForFunction((esperado) => document.documentElement.lang === esperado, idioma, { timeout: 3000 })
          .catch(() => {});
        const idiomaReal = await pestana.evaluate(() => document.documentElement.lang);
        if (idiomaReal !== idioma) {
          fallos.push(`${pagina.nombre}: no se pudo pasar a ${idioma} (queda en ${idiomaReal})`);
        }
        // El i18n reescribe etiquetas al hacer clic: hay que dejar que acabe
        // antes de congelar el estado con axe.
        await new Promise((resolve) => setTimeout(resolve, 150));

        pasadas += 1;
        const analisis = await new AxeBuilder({ page: pestana })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
          .analyze();

        for (const violacion of analisis.violations) {
          totalReglas += 1;
          const contextoPasada = `${pagina.nombre} · ${idioma} · ${tema}`;

          // Un target con mas de un tramo es un nodo dentro de un iframe: las
          // vistas previas de `components.html` cargan demos, y el alcance de
          // esta fase son las paginas del sitio, no los 1.018 demos. Se
          // informan igualmente para que no se escondan, pero no cortan: si
          // cortaran, el CI dependria de que el catalogo no ruede un demo
          // nuevo con un fallo, algo que no controla este repositorio.
          const grupos = [
            { prefijo: "", nodos: violacion.nodes.filter((n) => (n.target?.length ?? 1) <= 1) },
            { prefijo: "vista previa: ", nodos: violacion.nodes.filter((n) => (n.target?.length ?? 1) > 1) },
          ];

          for (const grupo of grupos) {
            if (!grupo.nodos.length) continue;
            // El selector primero: sin el, saber que la proporcion es 3,9 no
            // dice que elemento hay que tocar, que es lo unico que sirve.
            const detalle =
              `${violacion.id} (${violacion.impact}) — ${violacion.help} ` +
              `en ${grupo.nodos.length} nodo(s): ` +
              grupo.nodos
                .slice(0, 6)
                .map((n) => `${(n.target ?? []).join(" ")} → ${nombreCorto(n.failureSummary)}`)
                .join(" · ");

            const esPropio = grupo.prefijo === "";
            if (esPropio && CORTAN.has(violacion.impact)) fallos.push(`${contextoPasada}: ${detalle}`);
            else avisos.push({ regla: violacion.id, impacto: violacion.impact, ayuda: violacion.help, contexto: contextoPasada, detalle: grupo.prefijo + detalle });
          }
        }
      }
    }

    // El foco se comprueba una vez por pagina, no en las cuatro combinaciones:
    // depende del orden de tabulacion, que es el mismo en todas.
    await pestana.goto(`${ORIGEN}${pagina.ruta}`, { waitUntil: "load" });
    const foco = await comprobarFoco(pestana);
    if (!foco.boton) fallos.push(`${pagina.nombre}: ningun boton visible cambia al recibir el foco (:focus-visible)`);
    if (!foco.enlace) fallos.push(`${pagina.nombre}: ningun enlace visible cambia al recibir el foco (:focus-visible)`);
    if (foco.boton || foco.enlace) {
      notas.push(
        `${pagina.nombre}: :focus-visible ok (boton ${foco.boton ?? "—"}, enlace ${foco.enlace ?? "—"}); ` +
        `enfocados ${foco.enfocados} de ${foco.candidatos} elementos`,
      );
    }

    await contexto.close();
  }
} finally {
  await navegador.close();
  servidor.kill();
}

/**
 * Tabula por la pagina y, en cada paso, mira si el elemento enfocado cambia de
 * aspecto respecto a cuando no lo estaba. No basta con encontrar la regla
 * `:focus-visible` en el CSS: puede existir y no aplicar a ninguno de los
 * botones que hay, o aplicar con `outline: none`.
 */
async function comprobarFoco(pestana) {
  const base = await pestana.evaluate(() => {
    const visibles = [...document.querySelectorAll("button, a[href]")].filter((el) => {
      const caja = el.getBoundingClientRect();
      const estilo = getComputedStyle(el);
      return (
        caja.width > 0 &&
        caja.height > 0 &&
        estilo.display !== "none" &&
        estilo.visibility !== "hidden" &&
        !el.disabled
      );
    });
    visibles.forEach((el, i) => { el.dataset.probeFoco = String(i); });
    const leer = (el) => {
      const s = getComputedStyle(el);
      return JSON.stringify({
        outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
        sombra: s.boxShadow,
        fondo: s.backgroundColor,
        borde: s.borderTopColor,
        texto: s.textDecorationLine,
      });
    };
    const muestra = {};
    for (const el of visibles.slice(0, 8)) {
      muestra[el.dataset.probeFoco] = {
        etiqueta: `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).trim().split(/\s+/)[0] : ""}`,
        texto: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40),
        estilo: leer(el),
        tipo: el.tagName === "A" ? "enlace" : "boton",
      };
    }
    return { total: visibles.length, muestra };
  });

  const vistos = { boton: null, enlace: null };
  let enfocados = 0;

  for (let paso = 0; paso < Math.min(TABULACIONES, base.total + 5); paso++) {
    await pestana.keyboard.press("Tab");
    const actual = await pestana.evaluate((muestras) => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const clave = el.dataset.probeFoco ?? null;
      if (clave === null || !(clave in muestras)) return null;
      const s = getComputedStyle(el);
      return {
        clave,
        tipo: muestras[clave].tipo,
        etiqueta: muestras[clave].etiqueta,
        texto: muestras[clave].texto,
        antes: muestras[clave].estilo,
        ahora: JSON.stringify({
          outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
          sombra: s.boxShadow,
          fondo: s.backgroundColor,
          borde: s.borderTopColor,
          texto: s.textDecorationLine,
        }),
      };
    }, base.muestra);
    if (!actual) continue;
    enfocados += 1;

    if (actual.antes === actual.ahora) continue;
    const cambia = JSON.parse(actual.ahora);
    const contornoVisible = !cambia.outline.startsWith("none") && !/\b0px\b/.test(cambia.outline);
    const seVe =
      contornoVisible ||
      cambia.sombra !== "none" ||
      cambia.texto !== JSON.parse(actual.antes).texto;
    if (!seVe) continue;
    if (!vistos[actual.tipo]) vistos[actual.tipo] = `${actual.etiqueta} (${actual.texto || "sin texto"})`;
    if (vistos.boton && vistos.enlace) break;
  }

  return { boton: vistos.boton, enlace: vistos.enlace, enfocados, candidatos: base.total };
}

console.log(`info  ${PAGINAS.length} paginas x ${IDIOMAS.length} idiomas x ${TEMAS.length} temas = ${pasadas} pasadas de axe`);

// Los avisos se agrupan por regla: doce pasadas repiten los mismos `moderate`
// una y otra vez, y sin agrupar el log no se puede leer. Se muestra ademas el
// primer nodo de la primera pasada, que es el que hay que mirar.
if (avisos.length) {
  const porRegla = new Map();
  for (const aviso of avisos) {
    const clave = `${aviso.regla} (${aviso.impacto})`;
    const entrada = porRegla.get(clave) ?? { veces: 0, ayuda: aviso.ayuda, ejemplo: aviso.detalle };
    entrada.veces += 1;
    porRegla.set(clave, entrada);
  }
  console.log(`\ninfo  ${avisos.length} incidencia(s) no bloqueantes, agrupadas:`);
  for (const [clave, datos] of porRegla) {
    console.log(`  - ${clave} x${datos.veces}: ${datos.ayuda}`);
    console.log(`      ${datos.ejemplo}`);
  }
}

for (const nota of notas) console.log(`info  ${nota}`);

if (fallos.length) {
  console.error(`\n${fallos.length} violacion(es) grave(s) o no resueltas:\n`);
  for (const fallo of fallos) console.error(`  x ${fallo}`);
  console.error(`\nArregla el codigo de Web/ y vuelve a tirar esto. Los niveles serious y critical`);
  console.error(`cortan; moderate y minor solo se informan.`);
  process.exit(1);
}

console.log(`\nSin violaciones serious ni critical en ${pasadas} pasadas (${totalReglas} reglas avisadas).`);
