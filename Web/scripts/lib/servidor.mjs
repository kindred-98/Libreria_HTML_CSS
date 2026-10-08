/**
 * Arranca `serve.mjs` en un puerto libre.
 *
 * Por que existe: `validar-a11y.mjs`, `validar-lighthouse.mjs`,
 * `validar-layout.mjs` y `smoke-demos.mjs` usan el mismo servidor local. Antes
 * layout y smoke duplicaban el arranque que ya compartian a11y y Lighthouse;
 * estas funciones lo mantienen en un unico modulo.
 *
 * Que hace:
 *
 *   puertoLibre()            -> un puerto sin usar en 127.0.0.1, o el que
 *                               fije la variable PORT.
 *   arrancarServidor(puerto) -> el proceso de `serve.mjs`, ya escuchando.
 *                               Rechaza si no arranca en 15 s o si muere
 *                               antes de anunciar que esta listo.
 *
 *   import { puertoLibre, arrancarServidor } from "./lib/servidor.mjs";
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const servePath = path.join(scriptDirectory, "..", "serve.mjs");

export async function puertoLibre() {
  const fijado = Number(process.env.PORT ?? 0);
  if (fijado) return fijado;
  return new Promise((resolve, reject) => {
    const sonda = net.createServer();
    sonda.on("error", reject);
    sonda.listen(0, "127.0.0.1", () => {
      const direccion = sonda.address();
      // `address()` devuelve `string | AddressInfo | null`: solo tiene puerto
      // cuando el servidor esta escuchando enTCP, que es lo que se acaba de
      // pedir. El caso `null` no puede ocurrir aqui.
      const puerto = typeof direccion === "object" && direccion !== null ? direccion.port : 0;
      sonda.close(() => resolve(puerto));
    });
  });
}

export function arrancarServidor(puerto) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, [servePath], {
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
    proceso.stderr.on("data", (trozo) => {
      salida += trozo;
    });
    proceso.on("error", reject);
    proceso.on("exit", (codigo) => {
      if (!arrancado) {
        reject(
          new Error(`serve.mjs no arranco en el puerto ${puerto} (codigo ${codigo}):\n${salida.trim()}`),
        );
      }
    });
    setTimeout(() => {
      if (!arrancado)
        reject(new Error(`serve.mjs no arranco en 15 s en el puerto ${puerto}:\n${salida.trim()}`));
    }, 15000).unref();
  });
}
