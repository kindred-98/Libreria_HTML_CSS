# Fase 6 aplicada — decisiones (C-4, §9, §8) y cierre

**Fecha:** 2026-10-02 · **Auditoría de referencia:** [`Docs/02-auditorias/Auditoria.md`](../Auditoria.md)
(fecha 2026-10-02, commit revisado `39f4e8d`) · **Base:** `1a2e106` + fases 1–5 ·
**Commit que la aplica:** `1379921`

Cierra las decisiones que se dejaron abiertas (C-4 y §9), los nueve ficheros
estándar de §8, el hallazgo legal C-3 y comprueba §7 midiendo en vez de creer.

---

## 1. C-4 — crédito de autoría: **solo dentro del ZIP**

**Decisión del mantenedor:** no tocar los 1 018 HTML; el crédito viaja en el ZIP,
que es lo que se redistribuye.

**Qué se hizo:** `ATTRIBUTION.txt` —que ya iba en cada ZIP— lleva ahora la línea de
`Copyright (c) …` **leída del `LICENSE` que ya forma parte del propio paquete**,
no de una constante inventada. Si ese fichero no trae ninguna línea que empiece
por `copyright`, no se añade nada y el atribución queda como antes.

- `Web/scripts/build-zips.mjs`: `lineaCopyright()` + `esLicenciaDe()`, y la línea
  se añade al atribución de los 119 ZIP de Davoker.
- `Web/scripts/app.js` (`downloadComponentZip`): mismo contenido para los 899 que
  se generan en el navegador. Los dos caminos de descarga quedan idénticos, que
  era justo lo que prometía el comentario de `build-zips.mjs`.

### Verificación

| Qué | Resultado |
|---|---|
| Los 119 ZIP regenerados con `--force` | **119/119** con `ATTRIBUTION.txt` y con copyright (`Copyright (c) 2026 davoker`) |
| Descarga desde el navegador, Playwright, una por colección | **3/3** con copyright **idéntico al de su `LICENSE`**: `kindred-98` (CreacionesNuevas), `fatmaerm` (creaciones-primium), `davoker` (DavokerDiseñador) |
| Prueba | `%LOCALAPPDATA%\Temp\opencode\test-c4.mjs` → `Todo correcto` |

Ejemplo real de lo que sale en el ZIP:

```text
Fuente: https://github.com/davoker/efectos_css_para_html
Licencia: MIT
Archivo de licencia: LICENSE
Copyright (c) 2026 davoker
```

---

## 2. C-3 — `LICENSE` describía un fichero que no existe

`LICENSE:8-10` decía que «la raíz `CreacionesNuevas/LICENSE` es la que se inyecta
en cada ZIP». Medido: **esa ruta nunca existió**; los 248 demos tienen su `LICENSE`
en su propia carpeta (y `creaciones-primium/` el de la colección). Redactado para
decir lo que hace el código:

> Each demo's download ZIP carries that folder's file; there is no
> `CreacionesNuevas/LICENSE` at the root of the collection.

El otro punto de C-3 («los ZIP se generan en el despliegue cuando están
commiteados») ya no aplica: desde la fase 3 **no se versionan** y sí se generan
en el build.

---

## 3. §7 — Rendimiento: medido, no supuesto

| Hallazgo | Qué se midió |
|---|---|
| **ALTO** 577 KB de GitHub (C-1) | resuelto en fase 1 |
| **MEDIO** 119 ZIP versionados que se despliegan | ya no se versionan (fase 3) y `.vercelignore` deja claro por qué `*.zip` no se excluye |
| **MEDIO** `catalog.json` 707 KB pedido **dos veces** (`crossorigin` en el preload y no en el `fetch`) | **no reproducible**: Chromium con CDP, recarga limpia de cada página, **1 sola petición** a `data/catalog.json` por página (initiator `parser`, respuesta desde red) y la rejilla se pinta con ella — el `fetch` de `app.js:1200` reutiliza la respuesta del preload. Páginas probadas: `components.html` (9 artículos y recuento visibles), `index.html`, `team-core.html`. Prueba: `Temp\opencode\test-catalog-cache.mjs`. |
| **BAJO** `Web/data/catalog.js` (22,9 MB) | ya estaba en `.gitignore` **y** en `.vercelignore`; `git ls-files` confirma que no está trackeado |

---

## 4. §8 — los 9 ficheros estándar

Creados todos, con los datos que pedía cada uno:

| Fichero | Contenido |
|---|---|
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 en español; canal de denuncias = **avisos privados de GitHub**, no un correo público (coherente con C-2) |
| `PRIVACY.md` | política real y verificada: 3 claves de `localStorage`, GA4 `G-3TRY9F4G0Z` **solo tras consentimiento**, los 9 hosts que lista `validar-csp.mjs`, fuentes locales, y lo que no se recoge |
| `.editorconfig` | UTF-8, 2 espacios, final de línea, sin basura final; **sin `end_of_line`** porque el repo normaliza a LF pero en disco es CRLF (`core.autocrlf=true`) y forzar LF convertiría media biblioteca |
| `.nvmrc` | `20` (lo que exige `package.json` y lo primero de la matriz de CI) |
| `.github/CODEOWNERS` | `* @kindred-98` + revisión obligatoria de `vercel.json`, `.github/` y `Web/scripts/` |
| `.github/PULL_REQUEST_TEMPLATE.md` | checklist: `validar`, `validar:layout`, vista previa, procedencia del material |
| `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, `config.yml` | plantillas + enlace al canal privado de seguridad |
| `.github/dependabot.yml` | `npm` y `github-actions`, semanales, límite 5 PR |
| `.github/FUNDING.yml` | `github: [kindred-98]` (decisión: GitHub Sponsors) |

Enlaces añadidos: `README.md` (párrafo final de Contribuir + árbol actualizado)
y `CONTRIBUTING.md` (cabecera + lista de Documentación).

---

## 5. §9 — el historial: **no se reescribe**

**Decisión del mantenedor:** no reescribir historia ni force-push en ninguna de
las tres ramas. Consecuencias conocidas y aceptadas:

- Los 9 793 líneas borrados en `d650750` (9 308 bajo `Docs/`), incluidos los
  prompts de generación, siguen recuperables con `git show d650750^:<ruta>`.
- Los 5 documentos de trabajo de `Docs/` siguen en la historia y en el árbol
  actual; al clonarlos se vuelven a tener. `Docs/**` sí está en `.vercelignore`,
  así que **no se despliegan**.
- Si algún día se decide lo contrario, el procedimiento es `git filter-repo` en
  las tres ramas y force-push en una sesión aparte, sin ningún otro cambio
  mezclado.

---

## 6. Confirmadas como descartadas o no reproducibles

| Hallazgo | Motivo |
|---|---|
| **C-2** (`SECURITY.md:22`) | decisión del mantenedor: «que se vea mi correo no me importa» |
| `.gitignore:44` (`Docs/Legalizacion/`) | la ruta no existe en el fichero (fase 5) |
| `.footer-meta` «declarado dos veces» | 4 bloques, 4 conjuntos de propiedades distintas (fase 5) |
| `catalog.json` doble petición | 1 petición medida (§7 de esta fase) |
| `.vercelignore` «bug de semántica gitignore» | medido con `git check-ignore -v`: `Docs/**` + `!Docs/…` funciona (fase 3) |

---

## 7. Verificación

```text
npm run validar          -> 1018 componentes · 1018 descargables · 2688 ficheros · 9 hosts, CSP ok
npm run validar:layout   -> 5 páginas x 23 anchos = 115 medidas, ninguna se sale
node build-zips --force  -> 119 ZIP, 119/119 con ATTRIBUTION.txt + copyright
test-c4.mjs (Playwright) -> 3/3 descargas con copyright = el de su LICENSE
test-fase4.mjs           -> 12/12 (accesibilidad y portal de Davoker, sin regresiones)
test-catalog-cache.mjs   -> 1 petición a catalog.json por página
```

En `1379921` (las seis fases en un solo commit): **120 borrados**, **24 modificados**,
**17 añadidos** — los 11 ficheros que componen los 9 estándar de §8
(`.github/ISSUE_TEMPLATE/` es un directorio con 3) más los 6 documentos de esta
carpeta.

---

## 8. Estado final de la auditoría

Todas las filas de §2.1, §3, §4, §6, §7 y §8 están aplicadas o documentadas como
no reproducibles; §5 queda con C-1, C-3 y C-4 cerrados y C-2 descartada por
decisión; §9 queda cerrada por decisión de no actuar. **No queda ningún hallazgo
abierto.** La única fila sin cerrar del todo es la de §2.2 en
[`Fase4-Aplicada.md`](./Fase4-Aplicada.md), a la espera del navegador que reportó el
fallo, pero su causa era la de §2.1 y ya no depende del navegador.

[`CHANGELOG.md`](../../../CHANGELOG.md) lleva una entrada de cierre con las seis
fases; si prefieres una entrada por fase, se parte en seis (el contenido ya está
escrito en estos ficheros).

Los `git add` / `git commit` de las fases 1–6 ya están hechos: `1a2e106` (fase 1) y
`1379921` (fases 2–6).
