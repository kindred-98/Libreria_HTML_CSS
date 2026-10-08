# Fase 1 aplicada — ganancias rápidas

**Fecha:** 2026-10-02 · **Auditoría de referencia:** [`Docs/02-auditorias/Auditoria.md`](../Auditoria.md)
(fecha 2026-10-02, commit revisado `39f4e8d`) · **Commit que la aplica:** `1a2e106`

La auditoría propone 11 puntos de ataque (§10). Se dividió en 6 fases; esta es la
primera. Cada fase deja aquí su constancia: qué se tocó, con qué comando se comprobó
y qué sigue abierto.

---

## 1. Qué se hizo

### C-1 — CRÍTICO · 577 KB de la portada de GitHub dentro de un ZIP redistribuible

| | |
|---|---|
| Fichero borrado | `CreacionesNuevas/url-qr-code-generator/vendor/recurso-84b7e44a.css` (576 817 B) |
| Referencia cambiada | `CreacionesNuevas/url-qr-code-generator/index.html:15` |
| Catálogo | `npm run catalogo` regenerado |

El fichero no era un CSS del componente: su contenido era el `<!DOCTYPE html>` de
`https://github.com`. Solo se usaba como **valor por defecto del `<input>`**, y
`collectComponentFiles()` (`Web/scripts/generate-catalog.mjs:259`) lo empaquetaba en el
ZIP que genera `app.js`. Al estar referenciado como valor, ni siquiera se cargaba como
hoja de estilos.

```diff
- <input type="url" id="qrUrl" placeholder="https://example.com" value="./vendor/recurso-84b7e44a.css">
+ <input type="url" id="qrUrl" placeholder="https://example.com" value="https://example.com">
```

La carpeta `vendor/` quedó vacía y se eliminó con ella. `Web/data/catalog.json` y
`Web/data/sources/` no están versionados, así que hubo que regenerarlos; el build de
Vercel los vuelve a crear en cada despliegue.

### M-2 — MEDIO · `.env` se servía en local

| | |
|---|---|
| Fichero | `Web/scripts/serve.mjs:86-92` |
| Antes | `const noServir = /^\.(?:git|github\|qodo\|vercel\|vscode\|idea)(?:\/\|$)/;` |
| Después | `const noServir = /^\./;` |

Una lista cerrada siempre se queda corta: `.env`, `.nvmrc`, `.editorconfig` y cualquier
otro punto inicial pasaban con `200`. Cualquier ruta que empiece por punto deja de
servirse; ningún recurso que el sitio necesite vive en un nombre así. Se actualizó
también el comentario de las líneas 86-89, que nombraba carpetas concretas.

**Nota de implementación:** el primer intento fue `/^\.(?:\/|$)/`, que **no funciona**:
exige que tras el punto venga una barra, así que `.gitignore` seguía devolviendo `200`.
La forma correcta es `/^\./`.

---

## 2. Qué no se hizo, y por qué

- **C-2 — correos personales publicados.** Descartada a petición del mantenedor: la
  dirección ya estaba publicada por él en otros sitios. Las citas en `Docs/` se
  retiraron el 2026-10-02; `SECURITY.md:22` sigue pendiente para la fase 1.5 y el
  correo sigue en el historial de commits, que esta fase no toca.
- **§2.1, H-1, H-2, H-3, M-1, M-3, §4, §6, §7, §8, C-3, C-4 y §9** no se tocan en esta
  fase: les corresponden las fases 2 a 6.

---

## 3. Verificación

```text
npm run validar
  info  1018 componentes · 1018 descargables · 0 sin redistribucion
  Todo correcto: 1018 componentes coherentes con el disco.
  ficheros html/js/css escaneados: 2688 · hosts externos: 9 · ok

npm run catalogo
  Generated 1018 component entries ... 1018 source files
```

Servidor local (`PORT=8123`, `node Web/scripts/serve.mjs`):

| Petición | Antes | Después |
|---|---|---|
| `/.gitignore` | 200 | **403** |
| `/.git/config` | 403 | 403 |
| `/.github/workflows/validate.yml` | 200 | **403** |
| `/.env` | 200 | **403** |
| `/.nvmrc` | 200 | **403** |
| `/.editorconfig` | 200 | **403** |
| `/README.md` | 200 | 200 |
| `/Web/components.html` | 200 | 200 |
| `/index.html` | 200 | 200 |
| `/CreacionesNuevas/url-qr-code-generator/index.html` | 200 | 200 |
| `/Docs/THIRD_PARTY_NOTICES.md` | 403 | 403 |

Búsqueda de referencias al fichero borrado:

```text
git grep recurso-84b7e44a
  -> solo Docs/02-auditorias/Auditoria.md, Docs/02-auditorias/Auditoria-2026-09-30.md y Docs/01-planes/Plan_de_fases.md
     (las propias auditorías, como evidencia del hallazgo)
```

---

## 4. Estado después de la fase

| Hallazgo | Estado |
|---|---|
| C-1 — CSS de GitHub | **cerrado** |
| M-2 — `.env` en local | **cerrado** |
| C-2 — correos | **descartado** por decisión del mantenedor |
| H-1, M-1, M-3 | abiertos → fase 2 |
| H-2, H-3, ZIPs y `.vercelignore` | abiertos → fase 3 |
| §2.1 y accesibilidad (§6) | abiertos → fase 4 |
| §4, §8, código muerto | abiertos → fase 5 |
| C-3, C-4, §9 | abiertos → fase 6 (requieren decisión) |

---

## 5. Siguiente: Fase 2 — seguridad

1. **H-1 (ALTO)** — portar `lstat()`/`realpath()` de `generate-catalog.mjs:209,213` a
   `serve.mjs`, que hoy hace `stat()`/`readFile()` (`:142-144`) y sigue el enlace
   simbólico. Un junction fuera de la raíz se sirve con `200`.
2. **M-1 (MEDIO)** — `esc()` en
   `creaciones-primium/navegacion/omnibox-jump-bar/script.js:43` escapa `& < >` pero no
   `"` ni `'`, y se usa dentro de atributos entrecomillados. Self-XSS, se arregla con
   dos caracteres.
3. **M-3 (MEDIO)** — `.github/workflows/validate.yml` usa `actions/checkout@v5` y
   `actions/setup-node@v5` **por tag** (se puede mover) y fija `node-version: 22`,
   cuando `package.json` promete `>=20`. Fijar por SHA, añadir
   `persist-credentials: false` y montar la matriz `[20, 22, 24]`.
