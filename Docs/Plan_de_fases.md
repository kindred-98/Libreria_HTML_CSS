# Plan de fases para aplicar la auditoría

Fecha: 2026-10-01. Complementa [`Auditoria.md`](./Auditoria.md), que es donde
está el detalle medido de cada hallazgo. Aquí solo está el **orden de ataque**,
con lo que bloquea y lo que no.

La auditoría es del 2026-09-30 y se comprobó el 2026-10-01 que **sigue entera**:
ningún punto se había arreglado. Las referencias `§n.m` apuntan al apartado
correspondiente de `Auditoria.md`.

---

## Reglas del juego

- Cada fase es un commit aparte, o una serie corta de commits. Nunca se mezclan
  fases en un mismo commit: así se puede revertir una sin deshacer las demás.
- Al final de cada fase: `npm run validar`. Tiene que seguir diciendo
  `Todo correcto: N componentes coherentes con el disco.`
- Las fases **0 a 7** no cambian el comportamiento del sitio para quien lo
  visita, salvo lo indicado. La fase 9 sí cambia el historial de git para todo el
  mundo, y por eso va sola y al final.
- Las decisiones que hay que tomar se toman **antes** de empezar la fase, no en
  medio. Están marcadas con **[DECIDIR]**.

---

## Fase 0 — Baseline

**Objetivo:** partir de un árbol limpio, con lo que ya está hecho anotado.

- Commit de los cambios pendientes: la tarjeta clicable en
  `Web/scripts/app.js` y `Web/styles/site.css` (ver
  [`Tarjetas_clicables.md`](./Tarjetas_clicables.md)).
- Registrar en `CHANGELOG.md` que el catálogo ya no es de 885 sino de **1018**
  componentes, y que `catalog.json` es un artefacto generado (gitignore) que
  Vercel construye en cada despliegue.

**Comprobación:** `git status` limpio después del commit.

---

## Fase 1 — Los cuatro fallos de seguridad (§3.2)

**Objetivo:** cerrar los cuatro fallos reales. Es la fase más importante y la que
menos discusión necesita: los cuatro están descritos con su arreglo en la
auditoría.

| Qué | Dónde | Arreglo |
|---|---|---|
| a) Lectura arbitraria de ficheros en el build | `Web/scripts/generate-catalog.mjs:200-210` | `lstat()` para descartar enlaces simbólicos, y comparar `realpath()` de la ruta contra `realpath()` de la raíz |
| b) `GET /%zz` tumba el servidor | `Web/scripts/serve.mjs:48` | Meter `decodeURIComponent` dentro del `try`; devolver `null` (403) si lanza |
| c) Sirve `.git/config` y escucha en todas las interfaces | `Web/scripts/serve.mjs:103` | `127.0.0.1` como host, solo `GET`/`HEAD` con 405 en el resto, y lista de rutas que no se sirven (`.git`, `.github`, `.qodo`, `.vercel`, `Docs`, ficheros de configuración) |
| d) El iframe de davoker sin `sandbox` | `Web/components.html:95` | Igualarlo a los otros dos: `sandbox="allow-scripts allow-forms allow-popups"` y `referrerpolicy="no-referrer"` |

**Y una red de seguridad para el futuro:** añadir a `Web/scripts/validate.mjs`
una comprobación que **falle** si algún `<iframe>` de `Web/*.html` no lleva
`sandbox`. Es la clase de cambio que parece inocua.

**Comprobación:**

- `GET /%zz` → 403, y el servidor sigue respondiendo después.
- `GET /.git/config` → 403 o 404, nunca 200.
- `GET` a un HTML → 405.
- Abrir `components.html`, entrar en el apartado de davoker y comprobar que su
  portal se carga con el sandbox puesto.
- `npm run validar`.

**Nota sobre el enlace simbólico:** en Windows `core.symlinks=false` convierte
los enlaces en ficheros de texto, así que ahí no se puede reproducir. El build
de Vercel es Linux, que es donde materia. Si se quiere probar de verdad, en
Linux o en un Codespaces.

---

## Fase 2 — Legal y licencias (§2.1, §2.2, §2.3)

**Objetivo:** dejar de distribuir material que no se puede redistribuir.

### 2.1 El CSS de 577 KB — sin decisión, se hace

- Borrar `CreacionesNuevas/url-qr-code-generator/vendor/recurso-84b7e44a.css`.
- Poner una URL neutra en `index.html:15` (el `value` por defecto del campo).
- Regenerar el catálogo: `npm run catalogo`.

El demo hace exactamente lo mismo que antes: ese fichero solo estaba como valor
por defecto del input.

### 2.2 Los 119 ZIP de Davoker — **[DECIDIR]**

- `git rm --cached` de los 119 `.zip` (siguen en disco, salen del índice).
- `*.zip` en `.gitignore` y en `.vercelignore`.
- Añadir a `.gitattributes` que `.zip` es binario (ver fase 4).

**La decisión:** el repo público deja de repartir esos 119 ZIP. Siguen en el
disco de quien mantiene el proyecto, donde se pueden seguir compartiendo a mano,
y el demo sigue abriéndose en la web. Si algún día se vuelven a subir, tienen
que llevar el `LICENSE` dentro, que es lo que su MIT exige.

### 2.3 El alcance del `LICENSE` raíz — **[DECIDIR]**

Reescribir el párrafo de alcance como inventario exacto:

- El código y la documentación de `Web/` y de la raíz → MIT.
- `CreacionesNuevas/` → su propio `LICENSE`.
- `creaciones-primium/` → su `LICENSE` raíz, que nombra a las dos autoras.
- `DavokerDiseñador/` → `DavokerDiseñador/LICENSE`, de su repositorio original.
- Las fuentes tipográficas → OFL.
- Fuera de todo eso: los recursos de terceros y el material retirado.

Hoy el texto dice que `GevendraAutorExterno/` *"is kept in the repository for
reference only"*, cosa que no es cierta (está en `.gitignore`), y no menciona en
ningún sitio `DavokerDiseñador/`, que sí está publicado y descargable.

**Comprobación:** abrir el ZIP de un componente y ver que no lleva el CSS de
577 KB; `npm run validar`.

---

## Fase 3 — Documentación que contradice al código (§6)

**Objetivo:** que las instrucciones digan lo que hay que hacer. Dieciocho filas
en la tabla del apartado §6; las que rompen algo si se siguen:

| Documento | Hay que cambiarlo a |
|---|---|
| `Web/README.md:84` | Sí hay `buildCommand`: está en `vercel.json:4`. Seguir la instrucción actual deja el sitio **sin catálogo** y todas las vistas previas en 404 |
| `Web/README.md:86`, `SECURITY.md:57` | Los demos se sirven del **mismo dominio**, así que heredan las cabeceras. Es justo por eso que `validar-csp.mjs` es necesario |
| `SECURITY.md:47`, `CONTRIBUTING.md:17` | `GevendraAutorExterno/` **no** está en el repositorio; está en `.gitignore` |
| `CONTRIBUTING.md:30` | En `creaciones-primium/`, la carpeta recomendada para demos nuevos, el ZIP hereda la licencia de la raíz de la colección; no hace falta `LICENSE` propio |
| `README.md:88`, `CONTRIBUTING.md:19`, `Web/README.md:53` | **[DECIDIR]** Tres documentos con dos instrucciones opuestas sobre dónde va un demo nuevo: hay que elegir una y unificar |
| `SECURITY.md:48` | No hay jQuery ni Ionicons en el repositorio |
| `README.md:45`, `Web/README.md:31` | Node **20**, no 18 (`package.json` exige `>=20` y el CI prueba 22) |
| `Web/robots.txt:4` | "los **1018** detalles", no 885 |
| `README.md:154` | "los mismos **1018** ficheros de `sources/`", no 473 |
| `README.md:174`, `Web/README.md:92` | **Tres** pasos, no dos: catálogo, validación y CSP |
| `.gitignore:44` | La ruta es `Docs/`, no `Docs/Legalizacion/` |
| `Web/README.md:1` | El proyecto es *Biblioteca HTML y CSS* |

**Y un detalle propio:** `CHANGELOG.md` enlaza a
`Docs/Opencode/Plan.md` y a `Docs/Legalizacion/THIRD_PARTY_NOTICES.md`, dos
rutas que ya no existen (`Docs/` solo tiene `Auditoria.md` y
`THIRD_PARTY_NOTICES.md`). Hay que reescribir esos enlaces.

**Comprobación:** `npm run validar`, y leerse los enlaces rotos del CHANGELOG.

---

## Fase 4 — Higiene de ficheros (§8)

**Objetivo:** que git haga lo que se espera de él.

**`.gitignore`** — faltaban:

- `*.zip` (llega en la fase 2, se anota aquí por si se hace aparte).
- `.idea/` y `*.iml`.
- Residuos de merge y editor: `*.swp`, `*~`, `*.orig`, `*.rej`.
- Otros gestores de paquetes: `yarn-error.log`, `pnpm-debug.log*`.
- Salidas de bundler: `dist/`, `build/`, `.next/`.
- Cobertura: `coverage/`, `lcov.info`.
- Y dejar de ignorar `.vscode/` **entera**: basta con `launch.json` y
  `*.code-workspace`, que son los que llevan rutas absolutas. Compartir
  extensiones y ajustes es justo lo que le sirve a un tercero.

**`.vercelignore`** — publica de más y de forma frágil:

- Excluir `LICENSE`, `README.md`, `package.json`, `Web/README.md`.
- Cambiar `Docs/**` por `Docs/*`: en semántica de gitignore **no se puede
  reincluir** un fichero si su carpeta madre está excluida, así que al primer
  `Docs/algo/` el aviso de licencias dejaría de publicarse sin que nadie se
  entere.
- Excluir `.git/` y `GevendraAutorExterno/`: el CLI de Vercel respeta
  `.vercelignore` y **no** `.gitignore`, así que un `vercel --prod` desde un
  clon local subiría el historial completo.

**`.gitattributes`** — hoy son 2 líneas (`* text=auto`). Hay que declarar los
binarios que hay: `.zip`, `.woff2`, `.jpg`. Git los detecta por olfateo de
contenido, y si un binario empieza por bytes que parecen texto los normaliza y
corrompe en el índice sin avisar.

**Comprobación:** `git check-ignore -v <fichero>` para cada regla nueva, y
`npm run validar`.

---

## Fase 5 — Ficheros estándar (§7)

**Objetivo:** que el repo tenga lo que un proyecto abierto se espera que tenga.

| Fichero | Para qué |
|---|---|
| `CODE_OF_CONDUCT.md` | Base de las reglas de la comunidad. El borrador anterior se descartó por errores de redacción |
| `.github/ISSUE_TEMPLATE/` | Hoy cada autor explica la procedencia a su manera y la mitad de los avisos de material de terceros son inservibles. `CONTRIBUTING.md:126` ya pide que se explique en un issue: hace falta darle forma |
| `.github/PULL_REQUEST_TEMPLATE.md` | Lo mismo para los PR |
| `.github/dependabot.yml` | No hay dependencias npm, pero sí acciones de GitHub ejecutables, y son la única superficie de suministro del proyecto |
| `.editorconfig` | Tres personas, tres sistemas operativos, y un árbol de trabajo que mezcla CRLF y LF |
| `.nvmrc` | `package.json` dice `>=20`; el fichero lo hace ejecutable |
| `.github/FUNDING.yml` | La donación no aparece en la página del repositorio |
| `PRIVACY.md` | Hay banner de consentimiento y analítica, y no hay política publicada |

---

## Fase 6 — Código muerto y accesibilidad (§5, §9)

**Objetivo:** limpieza que no cambia comportamiento.

- `Web/scripts/stamp-assets.mjs`: borrar `const eol = ...`, que se calcula y no
  se usa, y **corregir el comentario** del `writeFile` que habla de "conservar
  los finales de línea" y sugiere que `eol` cumple esa función (el `.replace()`
  ya los conserva).
- Fusionar las dos parejas de reglas CSS que se solapan en el mismo contexto:
  `.footer-meta` y `.team-hero`.
- Borrar el `.gitkeep` redundante de `creaciones-primium/tarjetas/`, que ya
  tiene 77 subcarpetas.
- **`Web/components.html` no tiene `<h1>`** y es la página con más tráfico:
  empieza en `<h2>`. Hay que añadirlo sin romper el diseño.
- `sitemap.xml`: añadir `lastmod`.

**No tocar:** los diez `script.js` idénticos byte a byte en
`creaciones-primium/navegacion/` (27 KB, y unificarlo no es trivial), ni los 248
`LICENSE` idénticos de `CreacionesNuevas/`, que son correctos porque `app.js` lo
mete dentro de cada ZIP.

**Comprobación:** `npm run validar`, y mirar `components.html` en las tres
anchuras.

---

## Fase 7 — CI (§10)

**Objetivo:** que el CI atrape lo que esta auditoría tuvo que mirar a mano.

- **Matriz de Node `[20, 22, 24]`** con `windows-latest`: hoy el workflow fija 22
  mientras `package.json` promete `>=20`, así que esa promesa no está verificada.
  Con Windows además se cubre justo lo que `.gitattributes` no cubre.
- **Cuatro comprobaciones nuevas en `validate.mjs`:**
  1. Que el `licenseFile` de cada componente exista de verdad.
  2. Que los demos lleven crédito de autoría (habría atrapado el §2.4).
  3. Que no entren ficheros de terceros en las carpetas de demo (habría atrapado
     el §2.1).
  4. Que todo `<iframe>` lleve `sandbox` (habría atrapado el §3.2d).
- Fijar las acciones a un SHA en vez de `@v5`: en un workflow que ejecuta
  código de PRs es mejor.

**Comprobación:** abrir un PR de prueba y ver que las cuatro comprobaciones
pasan, y que una falla si se le mete un fichero sospechoso.

---

## Fase 8 — Requiere decidir, aparte del resto

Ninguno de estos bloquea los demás, pero ninguno se hace sin hablarlo primero.

- **§2.4 — Crédito de autoría en los 1.018 demos.** Hoy **0 de 1.018** llevan
  `<meta name="author">`, `<link rel="license">` ni el nombre de la autora:
  quien copia un demo se lo lleva sin el crédito, que es justo lo que su MIT
  pide conservar. Dos caminos: (a) tocar los 1.018 ficheros con una cabecera de
  una línea, lo que ensucia el historial de todos los demos; o (b) generarlo en
  `generate-catalog.mjs` al montar `sources/`, lo que hace que el crédito solo
  viaje dentro del ZIP y no en el fichero suelto.
- **§3.3 — Abrir un demo en pestaña nueva lo carga en el origen del sitio y sin
  `sandbox`.** Ahí el demo ve el `localStorage`, incluido el consentimiento de
  cookies, así que un clic puede activar Google Analytics sin que nadie lo haya
  aceptado. No se cierra sin servir los demos en otro origen. Lo mínimo es
  documentarlo en `SECURITY.md`, que hoy solo menciona el `localStorage` y no
  esta consecuencia.
- **§3.4 — Endurecimiento opcional.** `Cross-Origin-Opener-Policy` y
  `Cross-Origin-Resource-Policy`, `Permissions-Policy` para `payment`/`usb`/
  `display-capture` (**no** `fullscreen`, que lo usan demos), vigilancia de los
  comodines de la CSP en `validar-csp.mjs`, tope de tamaño total del ZIP, y
  validación de esquema en las URL del catálogo.

---

## Fase 9 — El historial de git, sola y al final

**La única fase que afecta a todo el mundo.** Nada de esto se arregla borrando
ficheros: sigue en los commits antiguos.

| Qué | Dónde |
|---|---|
| `gevendra04@gmail.com`, correo de un tercero | Commits como `e83efa5` |
| Correo `bjr18325@educastur.es` de una contribuidora | Metadatos de 2 commits |
| ~1 700 líneas de notas internas | Recuperables desde `d650750` |
| Rutas absolutas con nombre de usuario | Varios ficheros ya borrados |

```
git filter-repo --path GevendraAutorExterno --path BibliotecaDeHtml_CSS --invert-paths
git filter-repo --path Docs --path-glob '!Docs/THIRD_PARTY_NOTICES.md' --invert-paths
```

Reescribir la historia cambia todos los hashes: los clones existentes tienen que
volver a clonarse y hace falta force-push. Con 67 commits y tres personas es
asumible, pero es una decisión del que mantiene el proyecto, no un cambio de
código, y **no se hace junto con ninguna otra fase**.

**Lo que sí se puede arreglar sin reescribir nada**, y conviene hacerlo antes:
`SECURITY.md:22` publica `angelecheniq@gmail.com`. En un repo público, una
dirección personal sin entidad detrás es la causa más típica de acoso. Lo
razonable es sustituirla por el canal privado de avisos de GitHub, que ya está
descrito en el mismo fichero.

---

## Orden resumido

| Fase | Qué | ¿Decisión? |
|---|---|---|
| 0 | Baseline: tarjeta clicable + CHANGELOG de 1018 | No |
| 1 | Los 4 fallos de seguridad + comprobación en CI | No |
| 2 | 577 KB, 119 ZIP, alcance del LICENSE | **Sí** |
| 3 | 18 filas de documentación falsa | Una |
| 4 | `.gitignore`, `.vercelignore`, `.gitattributes` | No |
| 5 | 8 ficheros estándar | No |
| 6 | Código muerto, `<h1>`, accesibilidad | No |
| 7 | Matriz de Node + 4 comprobaciones en CI | No |
| 8 | Crédito de autoría, pestaña nueva, endurecimiento | **Sí** |
| 9 | Historial de git (force-push) | **Sí** |
