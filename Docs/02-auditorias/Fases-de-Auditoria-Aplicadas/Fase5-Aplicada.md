# Fase 5 aplicada — documentación e higiene (§4 y §8)

**Fecha:** 2026-10-02 · **Auditoría de referencia:** [`Docs/02-auditorias/Auditoria.md`](../Auditoria.md)
(fecha 2026-10-02, commit revisado `39f4e8d`) · **Base:** `1a2e106` + fases 1–4 ·
**Commit que la aplica:** `1379921`

Cierra las **16 filas de documentación** de §4, cinco puntos de §8 y el código muerto
asociado. Deja dos filas **no reproducibles** y una decisión pendiente (los ficheros
estándar).

---

## 1. §4 — Documentación que contradice al código

| Fichero:línea | Decía | Ahora dice |
|---|---|---|
| `README.md:142` | el build es solo `generate-catalog.mjs` | los **3 comandos** de `vercel.json:4` (catálogo + sellado + ZIP) y qué se pierde si se deja el campo vacío |
| `README.md:148` | «solo quedan tres hosts externos» | **nueve**, enumerados con sus directivas y sus usos (los que imprime `validar-csp.mjs`) |
| `README.md:11` y `:132` | los 116 de Gevendra «quedan en el disco local» | la carpeta **no está ni en git ni en el disco de un clon nuevo** |
| `CONTRIBUTING.md:165` | `Docs/` tiene «solo THIRD_PARTY_NOTICES.md» | el aviso + documentos de trabajo, y se enlaza `Docs/02-auditorias/Fases-de-Auditoria-Aplicadas/` |
| `SECURITY.md:36-44` | el alcance son 4 scripts y no cita a Davoker | los **10 ficheros de `Web/scripts/`**, los **119 demos de `DavokerDiseñador/`** y el build (catálogo, sellado y ZIP) |
| `SECURITY.md:55` | `sandbox="allow-scripts allow-forms allow-popups"` | añade **`allow-downloads`** y explica que es lo que hace funcionar la descarga dentro del iframe |
| `Web/README.md:88` | GitHub Pages publicaría «los 396 que muestra Vercel» | los **1 018**; el constructor que filtraba por licencias ya no existe |
| `Web/robots.txt:4` | «los 885 detalles» | **1 018** |
| `README.md:154` | «los mismos 473 ficheros de `sources/`» | **1 018** |
| `README.md:45`, `Web/README.md:31` | Node **18** | Node **20** (lo que declara `package.json`), y qué usa Chromium |
| `SECURITY.md:47`, `CONTRIBUTING.md:17` | Gevendra «sigue en el repositorio» | está en `.gitignore`, fuera de `libraryRoots` y **no hay nada que redigir** |
| `SECURITY.md:48` | «vulnerabilidades en jQuery, Ionicons» | **0 coincidencias** en el repo; solo aplicaría si algún día se añade |
| `Web/README.md:84` | «sin build command; no hay script de build» | el `buildCommand` completo |
| `Docs/THIRD_PARTY_NOTICES.md:87` | `vercel.json` redirige `/GevendraAutorExterno/...` y le pone `X-Robots-Tag` | **no hay tal redirección ni cabecera** (las dos redirecciones son `/` y `/Web`) |
| `Docs/THIRD_PARTY_NOTICES.md:97` | `vercel.json` bloquea la carpeta con redirección permanente | no sube porque **no está en git** |
| `Docs/THIRD_PARTY_NOTICES.md:110` | «el constructor de despliegue publica solo los que cumplen las condiciones» | **no hay constructor que filtre**: el sitio publica los 1 018 y la única puerta es el ZIP (`downloadable`) |
| `Web/README.md:1` | «Aplicación web Component/Field» | **Biblioteca HTML y CSS — aplicación web** |

### Fila no reproducible

- **`.gitignore:44` — «el aviso está en `Docs/Legalizacion/`»**: esa ruta no aparece en
  `.gitignore` (ni en ningún fichero del repo fuera de `CHANGELOG.md` y `Docs/`, donde
  se cita como historia). No se tocó nada.

### Filas de la misma clase encontradas al pasar (no estaban en la tabla)

| Fichero | Decía | Ahora |
|---|---|---|
| `README.md` (CI) | «los mismos dos pasos que el build de Vercel» | los **7 pasos** reales del workflow |
| `Web/README.md:86` | los demos en el iframe «quedan fuera de esta CSP» | **sí** quedan sujetos (contradecía el README raíz, que lo explica bien) |
| `.gitignore:5` | «los mismos 473 ficheros» | 1 018 |
| `Web/scripts/generate-catalog.mjs:12` | «GevendraAutorExterno/ sigue en el repositorio» | en `.gitignore` y fuera de un clon nuevo |
| `README.md` (árbol) | faltaban `build-zips.mjs`, `stamp-assets.mjs`, `validar-csp.mjs` y `validar-layout.mjs` | están, con su función |

`CHANGELOG.md` **no se toca**: es un registro de lo que pasó en cada fecha.

---

## 2. §8 — Higiene

### Aplicado

| Punto | Qué |
|---|---|
| **`.gitattributes`** | Añadidos 12 tipos binarios (`*.zip`, `*.woff2`, `*.woff`, `*.ttf`, `*.otf`, `*.jpg`, `*.jpeg`, `*.png`, `*.gif`, `*.webp`, `*.ico`, `*.pdf`): con solo `* text=auto` git puede intentar normalizarlos. Comprobado antes: **no existe ninguna carpeta `dist/`, `build/`, `coverage/` ni `.idea/`** en el árbol, así que las reglas nuevas no excluyen contenido real. |
| **`.gitignore`** | Editor (`*.swp`, `*.swo`, `*~`, `*.orig`, `*.rej`, `.idea/`, `*.iml`), artefactos (`dist/`, `build/`, `coverage/`, `yarn-error.log`, `pnpm-debug.log*`) y `Web/zips/` (salida por si `rutaSalidaZip` se desvía). |
| **CI ejecuta los 3 comandos de Vercel** | Dos pasos nuevos en `validate.yml`: `stamp-assets.mjs --force` (falla si un HTML apunta a un asset que no existe) y `build-zips.mjs --force` (falla si un ZIP no se puede generar). Eran los únicos comandos del `buildCommand` que **nunca** se habían probado fuera de producción. |
| **Código muerto** | `stamp-assets.mjs`: borrado `const eol` (declarado, **0 usos**; `String.replace` ya conserva los CRLF). `creaciones-primium/tarjetas/.gitkeep` borrado: la carpeta tiene 71 subcarpetas. |
| **`build-zips.mjs` invisible** | Ya aparece en el árbol del `README.md`, en un punto nuevo de `Web/README.md` y en el alcance de `SECURITY.md`. |

### No reproducible

- **«`.footer-meta` declarado dos veces»**: hay cuatro bloques y **ninguno repite
  propiedades** — `:396` (tipografía, en un grupo), `:1716` (posición en la rejilla del
  pie), `:1779` (flex + color + cuerpo) y `:2303` (media query). Borrar uno rompería el
  pie. No se tocó.

---

## 3. Pendiente: los 9 ficheros estándar (§8) — **requieren decisión**

No se ha creado ninguno, porque ninguno es mecánico del todo:

| Fichero | Qué falta decidir |
|---|---|
| `FUNDING.yml` | plataforma y usuario de donación (no hay ninguno declarado) |
| `CODE_OF_CONDUCT.md` | **canal de denuncia**: no puede ser un correo público (C-2) |
| `PRIVACY.md` | es una declaración propia sobre analítica, cookies y `localStorage`; la tiene que firmar quien mantiene |
| `.github/dependabot.yml` | abriría PRs automáticas de `npm` y `github-actions` |
| `.editorconfig`, `.nvmrc`, `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/` | se pueden crear sin más, pero conviene confirmarlo para no sembrar el repo de plantillas que nadie va a usar |

---

## 4. Verificación

```text
npm run validar          -> 1018 componentes · 1018 descargables · 2688 ficheros · CSP ok (9 hosts)
npm run validar:layout   -> 5 páginas x 23 anchos = 115 medidas, ninguna se sale
node Web/scripts/stamp-assets.mjs --force
                         -> Sellados 10 recursos en 3 HTML (probado con respaldo y restauración:
                            los tres HTML vuelven a ?v=20260930-5, marcador del repositorio)
node --check             -> stamp-assets.mjs y generate-catalog.mjs: sintaxis ok
```

Al cerrar las seis fases todo fue al commit `1379921`: **120 borrados** (119 ZIP +
`tarjetas/.gitkeep`), **24 modificados**, **17 añadidos**.

---

## 5. Siguiente: Fase 6 — decisiones

1. **C-4** — crédito de autoría en los 1 018 demos: 1 018 ficheros tocados o solo el
   contenido del ZIP.
2. **§9** — reescribir el historial en las tres ramas con `filter-repo` y force-push.
3. **Los 9 ficheros estándar** de §3 arriba.
4. C-2 (el correo de `SECURITY.md:22`) sigue **descartado** por decisión del mantenedor.
