# Fase 2 aplicada — seguridad

**Fecha:** 2026-10-02 · **Auditoría de referencia:** [`Docs/Auditoria.md`](../Auditoria.md)
(fecha 2026-10-02, commit revisado `39f4e8d`) · **Base:** `1a2e106` (fase 1) ·
**Commit que la aplica:** `1379921`

Cierra los tres hallazgos de seguridad que no toca la fase 1: H-1, M-1 y M-3.
[`Fase1-Aplicada.md`](./Fase1-Aplicada.md) dejó constancia de C-1 y M-2.

---

## 1. H-1 — ALTO · `serve.mjs` seguía enlaces simbólicos

**Antes:** `resolveRequest()` contenía la ruta de forma lexical (`path.relative`) y
después un `stat()` normal seguía al enlace y leía lo que hubiera detrás. Un junction dentro
del repo apuntando a `~/.ssh/id_rsa` se servía con `200`.

**Después:** `Web/scripts/serve.mjs` añade `rutaServible()`, con dos comprobaciones que
no se solapan:

1. **`lstat()` no sigue el enlace.** Si el fichero (o su `index.html`, si era una
   carpeta) es un enlace simbólico o un junction, se devuelve `undefined` y la
   petición responde `403`. No se mira siquiera dónde apunta: este repo no tiene
   ningún enlace versionado (`git ls-files -s` → 0 entradas con modo `120000`), y un
   demo no necesita ninguno.
2. **`realpath()` contra `realpath(raíz)`.** La contención de `resolveRequest()` no ve
   los enlaces de los directorios padres: si `Web` fuera un enlace a `/etc`, la ruta
   pedida sería legítima y aun así saldría del repositorio. La raíz se resuelve **una
   sola vez al arrancar** (`repositoryRealDirectory`), no en cada petición.

Los dos casos siguen distinguiéndose como antes: un fichero inexistente hace que
`lstat()` lance y el `catch` responda **404**, mientras que un enlace o una ruta fuera
de la raíz responde **403**. El import de `stat()` se quitó porque ya no se usa.

`generate-catalog.mjs:208-214` ya hacía exactamente esto; la corrección es la misma
idea aplicada al servidor.

---

## 2. M-1 — MEDIO · `esc()` no escapaba comillas

**Antes:** `creaciones-primium/navegacion/omnibox-jump-bar/script.js:43` escapaba
`& < >`. El resultado se mete en `body.innerHTML`, y en `renderIdle()` va dentro de un
atributo entrecomillado:

```js
html += '<li><button type="button" data-q="' + esc(h) + '">' + esc(h) + '</button></li>';
```

Con comillas sin escapar, quien escribe en el buscador cerraba el atributo y añadía el
suyo (`onmouseover`). Al requerir `<` y `>` escapados no se podía abrir una etiqueta
nueva, así que era **self-XSS**: solo lo dispara quien teclea.

**Después:** la misma función añade `"` → `&quot;` y `'` → `&#39;`, con `&` primero
(sino se escaparía dos veces lo que generan las demás). Comprobado con los cuatro casos
de la sección de verificación.

---

## 3. M-3 — MEDIO · CI con acciones por tag y una sola versión de Node

**Antes:** `actions/checkout@v5` y `actions/setup-node@v5` (un tag se puede mover) y
`node-version: 22` fija, cuando `package.json` declara `"node": ">=20"`.

**Después:** `.github/workflows/validate.yml`

| Qué | Cómo |
|---|---|
| Acciones fijadas por SHA | `checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09` · `setup-node@a0853c24544627f65ddf259abe73b1d18a591444` |
| Versión legible | comentario `# v7.0.1` / `# v7.0.0` junto a cada SHA |
| Credenciales | `persist-credentials: false`: ningún paso escribe en el repo |
| Matriz | `node-version: [20, 22, 24]` con `fail-fast: false` y nombre de job `Validar (Node X)` |
| Chromium | solo en la pata de Node 24 (`if: matrix.node-version == 24`) |

Los dos SHA se obtuvieron de `GET /repos/actions/<accion>/git/ref/tags/v5`, no de
memoria: ambos `v5` son etiquetas ligeras que apuntan a un commit, y `v5` de
`setup-node` coincide con `v5.0.0`. Fijar por SHA es exactamente lo que pide el
hallazgo; subir a `v7` (la última mayor de ambas) queda fuera de alcance, para no
mezclar un salto de versión con un cambio de política.

**Actualizado en `28157d2`:** Dependabot abrió `#1` y `#2`, y se fusionaron los dos.
El workflow sigue fijado por SHA, ahora con `checkout@3d3c42e… # v7.0.1` y
`setup-node@8207627… # v7.0.0`. La política no cambió: se revisa el SHA, no se toca
el ancla. El CI pasó con las dos (`Validar sitio` #54, Success, 59 s).

**Por qué Chromium solo en una pata:** lo que varía con la versión de Node es la
comprobación estática; el navegador que mide el layout es el mismo. Sin el `if`, cada
push descargaría ~170 MB tres veces. La matriz sigue verificando lo que `package.json`
promete en las tres versiones.

---

## 4. Verificación

```text
python -c "yaml.safe_load(...)"        -> YAML ok
node --check Web/scripts/serve.mjs     -> sintaxis ok
node --check .../omnibox-jump-bar/script.js -> sintaxis ok
npm run validar                        -> 1018 componentes · 1018 descargables
                                          2688 ficheros · 9 hosts · ok
```

Servidor local (`PORT=8124`), con un **junction** `Web/__prueba_junction` apuntando a
una carpeta fuera del repositorio:

| Petición | Esperado | Obtenido | Cubre |
|---|---|---|---|
| `/Web/__prueba_junction/secreto.txt` | 403 | **403** | H-1 |
| `/README.md` | 200 | 200 | no rompe lo normal |
| `/Web/index.html` | 200 | 200 | idem |
| `/Web/components.html` | 200 | 200 | idem |
| `/` | 200 | 200 | idem |
| `/CreacionesNuevas/url-qr-code-generator/index.html` | 200 | 200 | idem |
| `/.gitignore` | 403 | 403 | M-2 (fase 1) |
| `/.github/workflows/validate.yml` | 403 | 403 | M-2 (fase 1) |
| `/Docs/THIRD_PARTY_NOTICES.md` | 403 | 403 | documentación interna |
| `/no-existe-xyz.html` | 404 | 404 | 403 y 404 siguen siendo distintos |

El junction se creó con `New-Item -ItemType Junction` y se **borró al terminar**; no
queda nada en el repo (`git status` limpio de él).

Prueba de `esc()` sobre los casos reales:

```text
"><img src=x onerror=alert(1)>   -> &quot;&gt;&lt;img src=x onerror=alert(1)&gt;
' onmouseover='alert(1)          -> &#39; onmouseover=&#39;alert(1)
normal & <b>texto</b>            -> normal &amp; &lt;b&gt;texto&lt;/b&gt;
ya &amp; escapado                 -> ya &amp;amp; escapado

atributo: <button data-q="&quot;&gt;&lt;img src=x onerror=alert(1)&gt;">x</button>
ok: el atributo no se puede cerrar desde fuera
```

**No ejecutado en local:** `npm run validar:layout`, porque no hay navegador de
Playwright instalado en esta máquina (~170 MB). Lo ejecuta el CI en el push, y los
cambios de esta fase no tocan nada que mida (CSS ni geometría).

---

## 5. Estado después de la fase

| Hallazgo | Estado |
|---|---|
| H-1 — enlaces simbólicos en `serve.mjs` | **cerrado** |
| M-1 — `esc()` sin comillas | **cerrado** |
| M-3 — CI por tag y Node fijo | **cerrado** |
| C-1, M-2 (fase 1) | cerrados |
| C-2 | descartado por decisión del mantenedor |

---

## 6. Siguiente: Fase 3 — ZIPs

1. **H-2 (MEDIO)** — `build-zips.mjs` se empaqueta a sí mismo: los 119 ZIP de Davoker
   contienen un `.zip` anidado (hasta 4 niveles, 7,95 MB de los 10,4 MB). Hay que
   excluir `*.zip` en `collectComponentFiles()` (`generate-catalog.mjs:259`) y sacar
   los 119 ya versionados de git.
2. **H-3 (MEDIO)** — `build-zips.mjs:172` resuelve `sourceData.licenseFile` contra la
   raíz del repo en vez de contra la colección, así que cada ZIP de Davoker lleva el
   `LICENSE` de kindred-98; y omite el `ATTRIBUTION.txt` que `app.js` sí genera.
3. **`.vercelignore`** — `*.zip` (los 10,4 MB se despliegan hoy), `.git/`,
   `GevendraAutorExterno/`, y el bug de semántica de `Docs/**` seguido de
   `!Docs/THIRD_PARTY_NOTICES.md`: no se puede reincluir un fichero si su carpeta
   madre está excluida.
