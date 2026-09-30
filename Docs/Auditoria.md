# Auditoría de seguridad, higiene y código muerto

Fecha: 2026-09-30. Alcance: el repositorio entero (3 205 ficheros versionados,
1 018 demos, el sitio en `Web/`, la documentación y el historial de git).

Este documento es un inventario de lo que se encontró, con lo verificado y lo
que no. Sirve para dos cosas: dejar constancia de lo que ya está comprobado
como correcto, y dejar por escrito lo que queda pendiente de decidir, porque
varias cosas **no se arreglan con un commit**.

Los hallazgos del historial (`## 4`) no se pueden arreglar borrando ficheros: lo
que se borró sigue en los commits antiguos. Reconstruir eso es una decisión de
la persona que mantiene el proyecto, no un cambio de código.

---

## 1. Resumen

| Área | Resultado |
|---|---|
| Secretos activos (claves, tokens, `.env`) | **Ninguno**, ni en el árbol ni en los 67 commits |
| Datos personales en el árbol | **Ninguno** (rutas absolutas, IPs internas, correos reales) |
| Datos personales en el historial | **Sí**, ver `## 4` |
| Material de terceros sin licencia | **Sí**, ver `## 2.1` |
| Códigos de autenticación explotables en el sitio | **Ninguno**, ver `## 3.1` |
| Fallos reales de seguridad | **Cuatro**, ver `## 3.2` |
| Código muerto | **Una línea**, ver `## 5` |
| Documentación que contradice al código | **Sí**, ver `## 6` |
| Ficheros estándar que faltan | **`CODE_OF_CONDUCT.md`, plantillas de issue y PR, Dependabot, `.editorconfig`**, ver `## 7` |

Lo que se lleva bien y conviene no perder de vista: la máquina de licencias del
generador es correcta y está verificada contra el disco (1 018 de 1 018 con
licencia declarada y su fichero presente), `validate.mjs` y `validar-csp.mjs`
funcionan y pasan, el proyecto **no tiene ni una dependencia de npm**, el CI usa
`on: pull_request` (la variante que no expone secretos) con
`permissions: contents: read`, y la defensa contra el material sin licencia de
terceros está bien pensada y documentada.

---

## 2. Legal y licencias: qué hay que proteger

### 2.1 577 KB de la portada de GitHub dentro de un demo

**Verificado.** `CreacionesNuevas/url-qr-code-generator/vendor/recurso-84b7e44a.css`
son 576 817 bytes. No es un CSS: es una copia literal de `https://github.com`
guardada con otra extensión. Los primeros bytes son `<!DOCTYPE html>` y su
`<title>` es *"GitHub · Change is constant. GitHub keeps you ahead. · GitHub"*.
Incluye los logotipos de clientes de GitHub y octicons, que son obra de marca
registrada.

Lo único que hacia era estar escrito como valor por defecto del campo de URL del
demo (`index.html:15`):

```html
<input type="url" id="qrUrl" value="./vendor/recurso-84b7e44a.css">
```

Es decir, restos de una descarga fallida, no un recurso del demo.

Por qué importa:

- Va dentro del **ZIP descargable** de ese componente, así que se redistribuye
  activamente.
- No aparece en `Docs/THIRD_PARTY_NOTICES.md`, que es el inventario de código y
  recursos de terceros.
- La MIT de la carpeta excluye expresamente los recursos de terceros, así que el
  proyecto **no puede redistribuir ese fichero**.

**Arreglo:** borrar el fichero y poner una URL neutra en el `value` del input. El
demo sigue haciendo exactamente lo mismo.

### 2.2 Los 119 ZIP de `DavokerDiseñador/` sin el aviso de copyright

**Verificado.** Hay 119 ficheros `.zip` versionados, uno por demo, unos 6 KB cada
uno. Inspeccionado `harry_potter/arena/arena.zip`:

```
arena.css  (3226 B)
index.html (10627 B)
como-aplicar-arena.txt (1760 B)
```

No hay `LICENSE` dentro. La MIT exige explícitamente que el aviso de copyright
"*shall be included in all copies*", y tanto el `LICENSE` raíz como
`Docs/THIRD_PARTY_NOTICES.md` declaran que esa licencia se añade a cada ZIP. Para
los que genera el navegador es verdad (`generate-catalog.mjs` mete el
`licenseFile` en `files[]`); para estos 119 que ya estaban construidos, no.

Agravante: son binarios dentro de un repo de 3 205 ficheros, y `.gitattributes`
(2 líneas: `* text=auto`) no declara nada `binary`, así que git los detecta por
olfateo de contenido. Hoy no se corrompen, pero es frágil.

**Arreglo:** sacar los 119 del índice de git y añadirlos a `.gitignore` y
`.vercelignore`. Se quedan en el disco de quien mantiene el proyecto, que es
donde se pueden seguir repartiendo, pero el repo público deja de distribuir
copias sin licencia. Si se vuelven a subir, que lleven el `LICENSE` dentro.

### 2.3 `LICENSE` raíz con una cláusula de alcance que ya no es cierta

**Verificado.** El párrafo de alcance dice, entre otras cosas, que
`GevendraAutorExterno/` *"is kept in the repository for reference only"*. Esa
carpeta está en `.gitignore` y **no está en el repositorio**; el propio README lo
dice en dos sitios. Al mismo tiempo, el párrafo **no menciona
`DavokerDiseñador/`**: 119 demos publicados y descargables de otra autora, cuya
única licencia es `DavokerDiseñador/LICENSE`, y sobre los que la licencia raíz no
dice absolutamente nada.

Quien clone el repo, lea el `LICENSE` y redistribuya material de Davoker se
encuentra con que el texto legal guarda silencio.

**Arreglo:** reescribir el alcance como inventario exacto: el código y la
documentación de `Web/` y de la raíz; las tres colecciones con su licencia
propia; las fuentes bajo OFL; y fuera de todo eso, los recursos de terceros y el
material retirado.

### 2.4 Cero atribución dentro de los ficheros de los demos

**Verificado.** En los 1 018 `index.html` de los demos:

| Comprobación | Resultado |
|---|---|
| `<meta name="author">` en `CreacionesNuevas/*/index.html` | 0 de 248 |
| `<link rel="license">` en `CreacionesNuevas/*/index.html` | 0 de 248 |
| Ficheros de `DavokerDiseñador/` que citan a `davoker` | 3 de 360, y los 3 son la portada, no demos |

La atribución sí existe en la web: el detalle de cada componente muestra
*"Source: …"*, alimentado por `Web/data/sources/<id>.json`. Pero **quien copia un
demo se lleva el HTML, el CSS y el JS, y nada más**: ni el aviso de licencia ni
el nombre de la autora. La MIT lo pide en cada copia, así que esto es un
incumplimiento en los 1 018 casos, y además es la queja típica de esta clase de
proyecto (*"usó tu demo y no aparece tu nombre"*).

**Arreglo:** un comentario de cabecera de una línea en cada demo con autor,
licencia y origen, y un `<link rel="license">` en el `<head>`. Se puede
automatizar en `generate-catalog.mjs` al generar `sources/`, aunque entonces el
crédito solo viajaría dentro del ZIP y no en el fichero suelto: para eso hay que
tocar los 1 018 ficheros. Es un cambio grande y mecánico; mejor decidirlo antes de
hacerlo, porque ensucia el historial de todos los demos.

### 2.5 `Docs/THIRD_PARTY_NOTICES.md` afirma controles que no existen

**Verificado.** El documento dice que `vercel.json` *"redirige
`/GevendraAutorExterno`"* y que añade `X-Robots-Tag: noindex, nofollow` a esos
recursos, y que *"el constructor de despliegue publica solo los componentes que
cumplen estas condiciones"*. En `vercel.json` hay dos redirecciones (a `/Web/`),
ningún `X-Robots-Tag` y `outputDirectory` es `"."`: no hay filtrado alguno.

Hoy no hay fuga porque la carpeta ya no está en el repo. Pero si alguien la
reintrodujera siguiendo las instrucciones del propio documento, **no habría
ninguna red de seguridad**, y el documento afirma lo contrario.

**Arreglo:** quitar esas afirmaciones o añadir los controles que describen. Lo
segundo es mejor, porque el control sirve: una redirección a un 404 o un
`X-Robots-Tag` en el despliegue.

### 2.6 Recursos de terceros sin inventariar

**Verificado.**

- `api.qrserver.com`: lo usa el generador de QR
  (`CreacionesNuevas/url-qr-code-generator/script.js`) y está permitido en la CSP.
  El servicio recibe la URL que el visitante teclea. No aparece en
  `THIRD_PARTY_NOTICES.md`.
- `Web/og-image.jpg` (139 KB, la tarjeta que se publica en redes) y
  `Web/favicon.svg` no tienen procedencia registrada en el aviso de terceros.

**Arreglo:** un apartado corto en `Docs/THIRD_PARTY_NOTICES.md` para `og-image`,
`favicon` y `api.qrserver.com`, diciendo de dónde salen y qué datos viajan.

### 2.7 Donaciones: dirección pública y sin gobernanza

**Verificado.** `0xa8f0…fa81` (USDT en BNB Smart Chain) está escrito en las tres
páginas y en `app.js`. `SECURITY.md` la llama *"pública por diseño"*, sin
mencionar que toda transacción queda en un registro público y permanente. No hay
`FUNDING.yml`, así que la vía de donación tampoco aparece en la página del
repositorio, y ningún documento explica qué entidad está detrás del proyecto ni
su política fiscal.

**Arreglo:** un `FUNDING.yml`, una nota de gobernanza en el README y una línea
en el pie avisando de que la transacción es irreversible. La dirección en sí no
es un problema: es pública por diseño y no debe tratarse como secreto.

---

## 3. Seguridad

### 3.1 Lo que ya está bien, y conviene saber por qué

- **Cero XSS.** El único `innerHTML` de todo el código propio (`app.js:528`) es
  una constante SVG sin interpolación. No hay `insertAdjacentHTML`, `outerHTML`,
  `document.write`, `eval`, `new Function` ni `setTimeout` con cadena. Todo el
  contenido del catálogo se pinta con `textContent` a través del helper
  `createElement`, lo que neutraliza por construcción `component.name`,
  `description`, `preview` y los mensajes de error.
- **`?component=` no es un vector.** `renderRoute` resuelve el parámetro con
  igualdad estricta contra el catálogo; si no existe, no se inyecta nada en el
  DOM ni en la URL. `updateDocumentMetadata` escribe con `setAttribute` y
  `document.title`.
- **Sin redirecciones abiertas.** No hay `location.href` con dato externo ni
  `window.open`.
- **El `sandbox` de las vistas previas es correcto** y en los detalles que
  importan: sin `allow-same-origin` (origen opaco: el demo no toca el DOM, ni el
  `localStorage`, ni las cookies), sin `allow-top-navigation`, y sin
  `allow-popups-to-escape-sandbox`. La app no registra ningún `postMessage`, así
  que un demo no puede inyectar mensajes. Como el origen es opaco, `connect-src
  'self'` tampoco casa, y el demo no puede leer `catalog.json` a través del
  sitio: defensa en profundidad real.
- **Consentimiento de cookies bien implementado.** `initializeAnalytics` es la
  única puerta, y `loadAnalytics` tiene tres guardas antes de crear el `<script>`:
  formato de ID válido, no-`localhost` y `window.gtag` sin definir. Nada sale a
  Google antes de aceptar, y la decisión se puede cambiar desde el pie.
- **Zip slip cerrado** en `zip.js:28-34`: normaliza `\` a `/` antes de comprobar y
  rechaza segmentos `..` y rutas absolutas, sobre la ruta normalizada y no sobre
  subcadenas. Y como el script solo *crea* el ZIP y nunca extrae, no hay zip bomb.
- **Cero dependencias de npm.** Ni `dependencies`, ni lockfile, ni
  `node_modules`. `validate.mjs` pasa `node --check` a todos los `.js` del
  proyecto.
- **CSP con las cinco directivas que se suelen olvidar**: `default-src`,
  `object-src`, `base-uri`, `form-action` y `frame-ancestors`. Y
  correctamente **sin** `X-XSS-Protection`, que está obsoleta desde 2018.
- **`validar-csp.mjs` es un control de regresión real**: falla si un demo carga un
  host que la CSP no permite **y** si la CSP permite un host que ya no usa nadie.

### 3.2 Los cuatro fallos reales

**a) Lectura arbitraria de ficheros en el build, a través de enlaces simbólicos.**

`generate-catalog.mjs:200-210` comprobaba la contención de la ruta con
`path.resolve` + `startsWith`, que es una comprobación **léxica**: normaliza los
`..` pero no resuelve enlaces simbólicos. Después usaba `stat()` y `readFile()`,
que **sí** los siguen.

El código de cada demo se publica en `Web/data/sources/<id>.json`, y ese JSON se
sirve en la web. Basta un pull request con un enlace simbólico dentro de un demo
para que el build copie el contenido de cualquier fichero legible por el proceso
que lo ejecuta. En Vercel, el entorno del build incluye el token de despliegue, y
ese token acabaría en un fichero público.

Aquí no se pudo reproducir: crear enlaces simbólicos en Windows requiere el modo
desarrollador o permisos de administrador. El fallo se verificó leyendo el
código.

*Arreglo:* `lstat()` para descartar que sea un enlace simbólico (un demo no
necesita enlaces), y comparar la ruta ya resuelta con `realpath()` contra la raíz
también resuelta, porque el repositorio entero puede estar detrás de un enlace
(`/var` en macOS) y en ese caso las dos rutas nunca comparten prefijo. Nota: en
Windows, un clon puede convertir los enlaces simbólicos en ficheros de texto
(`core.symlinks=false`), así que el build de Vercel, que es Linux, es donde
materia.

**b) `serve.mjs` se muere con una URL malformada.**

`resolveRequest` llamaba a `decodeURIComponent` fuera del `try` del manejador, y
esa función lanza `URIError` con un `%` malformado. Reproducido: un solo
`GET /%zz` deja el servidor sin responder y las conexiones posteriores fallan.

*Arreglo:* capturar el error y devolver `null` (que el manejador traduce a 403).

**c) `serve.mjs` servía el repositorio entero y escuchaba en todas las
interfaces.**

Verificado: `/.git/config` respondía **200** (y `.git/config` puede llevar
credenciales si el remoto se clonó con un token en la URL), `/.github/…` también,
`POST` a un HTML devolvía 200 con el fichero, y `server.listen(port)` sin `host`
escucha en `::`, o sea en todas las interfaces. La contención de rutas sí estaba
bien puesta (el traversal devolvía 403 correctamente), pero faltaba decidir
*qué* se sirve.

El riesgo real es el uso típico: `npm run servidor` con el puerto publicado en un
Codespaces o un contenedor, y cualquier persona de la red leyendo el historial
completo de git.

*Arreglo:*_METHODOS_ y solo `GET`/`HEAD` con 405 en el resto; `127.0.0.1` como
host; y una lista de carpetas que no se sirven (`.git`, `.github`, `.qodo`,
`.vercel`, `Docs`, y los ficheros de configuración).

**d) El iframe del portal de davoker era el único sin `sandbox`.**

`Web/components.html:95` montaba `#davoker-frame` sin `sandbox` ni
`referrerpolicy`. Los otros dos iframes del proyecto (las vistas previas en
`app.js:761` y la escena de Team Core en `team-core.html:178`) sí los tienen. Sin
`sandbox`, ese iframe corre **en el origen del sitio**: mismo `localStorage`,
mismo `document.cookie`, mismo DOM.

Hoy el material es de una colaboradora de confianza y no hace nada sospechoso,
así que no es un exploit activo. El riesgo es de cadena de suministro: cualquier
revisión futura que añada un `<script>` externo o un `innerHTML` con dato de URL
convierte un problema local en XSS de origen completo, con acceso al
`localStorage` del sitio y capacidad de reescribir la vista.

*Arreglo:* igualarlo al resto. Se comprobó que `davoker.html` no necesita
`allow-same-origin`. Y conviene añadir a `validate.mjs` una comprobación que
falle si algún `<iframe>` de `Web/*.html` no lleva `sandbox`, porque es la clase
de cambio que parece inocua.

### 3.3 Lo que se ha asumido a conciencia

**Abrir un demo en pestaña nueva lo carga en el origen del sitio y sin
`sandbox`.** Ahí el demo tiene acceso completo al `localStorage`, incluido el
valor del consentimiento de cookies: un solo clic en "Abrir demo original" puede
activar Google Analytics para ese visitante sin que haya aceptado. También puede
navegar la pestaña a un sitio externo mientras la barra de direcciones sigue
mostrando el dominio del proyecto.

Es el punto más conocido del diseño y no se puede cerrar sin servir los demos en
otro origen. Lo que sí se puede es **documentarlo** en `SECURITY.md`, que ahora
solo menciona el acceso a `localStorage` y no esta consecuencia. El botón de
"Cookies" del pie permite revertir la decisión.

### 3.4 Endurecimiento opcional

- **Faltan `Cross-Origin-Opener-Policy: same-origin` y
  `Cross-Origin-Resource-Policy: same-origin`.** La primera aísla el grupo de
  contextos de navegación y, junto al `allow-popups` de los sandboxes, cierra el
  *reverse-tabnabbing*. La segunda impide que un tercero use `catalog.json`
  como recurso caliente. Conviene comprobar que el generador de QR y las
  galerías siguen viendo sus imágenes remotas: la CSP ya las permite y son
  peticiones de esos mismos documentos.
- **`Permissions-Policy`** cubre cámara, micrófono y geolocalización. Se pueden
  cerrar `payment`, `usb` y `display-capture`. **No** tocar `fullscreen`: hay
  demos que lo usan.
- **Los comodines de la CSP no los vigila el validador.** `validar-csp.mjs:294`
  solo comprueba los hosts sin `*`, así que `https://*.githubusercontent.com`
  entra sin revisión. Hoy cubre lo que hace falta, pero nada impide que mañana se
  añada `https://*.example.com` sin que nadie se entere.
- **El ZIP no tiene tope de tamaño total.** Se limita el número de entradas y el
  tamaño de cada una, pero no la suma. Hoy el componente mayor pesa 580 KB, así
  que es inocuo; un PR con un vídeo de 200 MB cuelgaría la pestaña sin aviso.
- **Validación de esquema en las URL del catálogo.** `new URL("javascript:…")`
  devuelve una URL válida, y hoy no es explotable por dos accidentes
  independientes (el `preview` lo genera el build, y `frame-src 'self'` lo
  bloquea). Son dos accidentes apilados, no un control.

---

## 4. El historial: qué se puede arreglar y qué no

Nada de esto se arregla borrando ficheros. Está en los commits antiguos y solo se
limpia reescribiendo la historia.

| Qué | Dónde | Nota |
|---|---|---|
| `gevendra04@gmail.com`, correo de un tercero | `BibliotecaDeHtml_CSS/…` y `GevendraAutorExterno/…` en commits como `e83efa5` | El material ya no está en el repo. Sigue siendo el correo de una persona que no dio permiso para que se publicara |
| Correo `bjr18325@educastur.es` de una contribuidora | Metadatos de 2 commits | El proyecto ya usa `noreply` en 11 commits; lo coherente es que use el mismo |
| ~1 700 líneas de notas internas | `Docs/Prompt/…`, `Docs/auditoria/…`, `Docs/Opencode/Plan.md`, `Docs/trabajo_a_medio/…` | Borrados en `d650750`, recuperables |
| Rutas absolutas con nombre de usuario | `Docs/trabajo_a_medio/formularios-79-traspaso.md`, `Docs/auditoria/tercera-auditoria-tarjetas.md` | `C:\Users\mañana\`, `C:\Users\angel\`. **En el árbol actual no hay ninguna** |

**Cómo se limpiaría** (decisión de quien mantiene el proyecto, con force-push y
aviso a quien colabore):

```
git filter-repo --path GevendraAutorExterno --path BibliotecaDeHtml_CSS --invert-paths
git filter-repo --path Docs --path-glob '!Docs/THIRD_PARTY_NOTICES.md' --invert-paths
```

Reescribir la historia cambia todos los hash, así que los clones existentes
tienen que volver a clonarse. Con 67 commits y tres personas, es asumible.

**Lo que sí se puede arreglar sin reescribir:** `SECURITY.md` publica
`angelecheniq@gmail.com`, y el propio párrafo reconoce que es un problema y lo
deja sin resolver. En un repositorio público, una dirección personal sin
entidad detrás es la causa más típica de acoso moderado. Lo razonable es
sustituirla por el canal privado de avisos de GitHub, que ya está descrito en el
mismo archivo.

---

## 5. Código muerto

Se revisaron las dos hojas de estilo, los ocho scripts del sitio, los 3 163
ficheros de los demos y los 641 ficheros JavaScript del repositorio, con dos
métodos distintos por categoría para descartar falsos positivos.

| Categoría | Analizado | Huérfano |
|---|---:|---:|
| Selectores CSS | 393 con clase, id o atributo | **0** |
| Variables CSS (`--x`) | 19 | **0** |
| `@keyframes` | 14 | **0** |
| Funciones y constantes de `app.js` y `zip.js` | todas | **0** |
| Claves de traducción | 134 en cada idioma | **0** |
| Ficheros y recursos no referenciados | 20 comprobados | **0** |
| Demos en disco fuera del catálogo / entradas sin carpeta | 1 018 | **0 / 0** |
| Referencias rotas dentro de demos | 1 018 | **0** |
| Ficheros JS con error de sintaxis | 641 | **0** |

**La única línea muerta** del repositorio está en `Web/scripts/stamp-assets.mjs`:
`const eol = original.includes("\r\n") ? "\r\n" : "\n"` se calcula y no se usa,
porque el `writeFile` escribe `salida`, que viene de un `.replace()` y ya
conserva los finales de línea. El comentario que acompaña al `writeFile` habla de
"conservar los finales de línea" y sugiere que `eol` cumple esa función, así que
al borrarlo conviene corregir el comentario.

Dos pares de reglas CSS se solapan en el mismo contexto y se pueden fusionar sin
cambio de comportamiento (`.footer-meta` y `.team-hero`), y hay un `.gitkeep`
redundante en `creaciones-primium/tarjetas/`, que ya tiene 77 subcarpetas.

**Diez `script.js` idénticos byte a byte** en `creaciones-primium/navegacion/`
(26,9 KB en total). Puede ser un motor compartido copiado, que es razonable en
demos independientes, o un *copy-paste* accidental. Cada `index.html` lo
referencia por su ruta y el catálogo lo lista en `files[]`, así que unificarlo
no es trivial. Como el ahorro es de 27 KB, la recomendación es **no tocarlo**.

Los 248 ficheros `LICENSE` de `CreacionesNuevas/` también son idénticos entre
sí, y eso es lo correcto: cada demo necesita el suyo porque `app.js` lo mete
dentro del ZIP descargable.

---

## 6. Documentación que contradice al código

Este es el apartado que más cuesta a quien quiere contribuir, porque las
instrucciones están repartidas y en algunos casos **son lo contrario de lo que
hay que hacer**.

| Documento | Afirmación | Realidad |
|---|---|---|
| `Web/README.md:84` | *"Vercel construye solo; no hay script de build"* | `vercel.json:4` tiene `buildCommand`. Seguir esta instrucción deja el sitio **sin catálogo**, y todas las vistas previas dan 404 |
| `Web/README.md:86`, `SECURITY.md:57` | Los demos *"quedan fuera de esta CSP; cada documento aplica la suya"* | Los demos se sirven del **mismo dominio**, así que heredan las cabeceras. Es justo lo que hace que `validar-csp.mjs` sea necesario. Si alguien relaja la CSP creyendo esto, se rompen los demos o se abre demasiado |
| `SECURITY.md:47` | `GevendraAutorExterno/` *"sigue en el repositorio"* | No está: está en `.gitignore` |
| `CONTRIBUTING.md:17` | `GevendraAutorExterno/` *"sigue en el repositorio"* | Igual. Cuatro documentos lo dan por presente y uno lo desmiente |
| `CONTRIBUTING.md:30` | `LICENSE` de la carpeta *"opcional; sin él el ZIP queda deshabilitado"* | En `creaciones-primium/`, la que se recomienda para demos nuevos, el ZIP hereda la licencia de la raíz de la colección. Seguirlo al pie de la letra deja el PR sin descarga y sin explicación |
| `README.md:88`, `CONTRIBUTING.md:19`, `Web/README.md:53` | Dónde va un demo nuevo | Tres documentos, dos instrucciones opuestas |
| `Docs/THIRD_PARTY_NOTICES.md:87,97,110` | Redirecciones y filtrado en el despliegue que no existen | Ver `## 2.5` |
| `SECURITY.md:48` | *"Vulnerabilidades en jQuery, Ionicons…"* | No hay ninguno de los dos en el repositorio |
| `CONTRIBUTING.md:151` | *"La protección de rama de `main` impide fusionar sin pasar el CI"* | No es verificable desde el repo. Si no está activada, la afirmación es falsa |
| `README.md:45`, `Web/README.md:31` | Node 18 | `package.json` exige `>=20` y el CI prueba 22 |
| `Web/robots.txt:4` | *"los 885 detalles"* | Son 1 018 |
| `README.md:154` | *"los mismos 473 ficheros de `sources/`"* | Son 1 018 |
| `README.md:174`, `Web/README.md:92` | *"los mismos dos pasos"* | Tres: catálogo, validación y CSP |
| `.gitignore:44` | Aviso de terceros en `Docs/Legalizacion/` | La ruta es `Docs/` |
| `Web/README.md:1` | *"Aplicación web Component/Field"* | El proyecto es *Biblioteca HTML y CSS* |
| `Docs/THIRD_PARTY_NOTICES.md:22` | 78 galerías en HTML, 8 en JS | Medido sobre las 86 carpetas: **78 en HTML, 8 solo en JS, 0 sin atribución**. El documento acertaba |

Las cifras de cabecera del `README.md` sí son exactas: 119, 248 y 651 demos, y el
desglose por categorías cuadra con `generate-catalog.mjs`.

---

## 7. Qué debe mostrarse

**Debe seguir visible**, porque es lo que hace falta para contribuir y auditar:
`README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `CHANGELOG.md`,
`Docs/THIRD_PARTY_NOTICES.md`, el código de `Web/`, los demos, `vercel.json` y el
workflow de CI. El CI **no despliega**, y eso es intencionado: garantiza que solo
haya una copia del sitio y que nadie publique por error material sin
redistribución.

**Faltan los ficheros estándar de un proyecto abierto:**

| Falta | Para qué |
|---|---|
| `CODE_OF_CONDUCT.md` | Es la base de las reglas de la comunidad. El borrador que se empezó tenía errores de redacción y se descartó |
| `.github/ISSUE_TEMPLATE/` | Sin formulario, cada autor explica la procedencia a su manera y la mitad de los avisos de material de terceros son inservibles. `CONTRIBUTING.md:126` pide precisamente que se explique en un issue que nadie tiene estructura para escribir |
| `.github/PULL_REQUEST_TEMPLATE.md` | Lo mismo para los PR |
| `.github/dependabot.yml` | No hay dependencias npm, pero sí acciones de GitHub ejecutables, y son la única superficie de suministro del proyecto |
| `.editorconfig` | Tres personas, tres sistemas operativos y un repo que mezcla CRLF y LF en el árbol de trabajo |
| `.nvmrc` | `package.json` dice `>=20`; el fichero lo hace ejecutable |
| `FUNDING.yml` | La donación no aparece en la página del repositorio |
| `PRIVACY.md` | Hay banner de consentimiento y analítica, y no hay política publicada |

---

## 8. Higiene del repositorio

**`.gitignore`**: estaba bien pensado, con los secretos, artefactos generados y
las dos decisiones de política justificadas por escrito (`.qodo/` y
`GevendraAutorExterno/`). Faltaban: los 119 `*.zip`, `.idea/` y `*.iml`, los
residuos de merge y editor (`*.swp`, `*~`, `*.orig`, `*.rej`), otros gestores de
paquetes (`yarn-error.log`, `pnpm-debug.log*`), y las carpetas que genera cualquier
bundler (`dist/`, `build/`, `.next/`) o cualquier cobertura (`coverage/`,
`lcov.info`). Además ignoraba `.vscode/` **entera**, lo que impide compartir
extensiones recomendadas y ajustes del proyecto, que es justo lo que aportaría
un tercero: basta con ignorar `launch.json` y `*.code-workspace`, que es lo que
contiene rutas absolutas.

**`.vercelignore`**: publica de más. `LICENSE`, `README.md`, `package.json` y
`Web/README.md` no sirven al sitio, aunque `CHANGELOG.md` y `CONTRIBUTING.md` sí
están excluidos, y la inconsistencia se nota. Además el patrón `Docs/**` con la
reinclusión de `THIRD_PARTY_NOTICES.md` es frágil: en semántica de gitignore no
se puede reincluir un fichero si su carpeta padre está excluida, así que al
primer `Docs/algo/` el aviso de licencias dejaría de publicarse sin que nadie se
entere. Con `Docs/*` en lugar de `Docs/**` el aviso sobrevive. Y conviene excluir
`.git/` y `GevendraAutorExterno/`: el CLI de Vercel respeta `.vercelignore`, no
`.gitignore`, así que un `vercel --prod` desde un clon local subiría el historial
completo.

**`.gitattributes`**: 2 líneas. El índice de git ya guarda LF puro, y
`core.autocrlf=true` explica los CRLF del árbol de trabajo, así que **no hay
corrupción**. El problema es que delega en la configuración de cada máquina y
no declara los binarios: 119 ZIP, 4 woff2 y el JPEG de la tarjeta social se
detectan por olfateo de contenido. Si un binario empieza por bytes que parecen
texto, git lo normaliza y lo corrompe en el índice sin avisar.

**Tamaño**: 64,6 MB de `.git`, 3 205 ficheros versionados, 20,5 MB de demos más
el sitio. Nada patológico. Los 63 MB incluyen los 119 ZIP y el historial.

**`Docs/` está limpio**: un solo fichero, el aviso de terceros. Las notas
internas se borraron en `d650750` (siguen en el historial, ver `## 4`).

---

## 9. Accesibilidad y SEO

| Comprobación | Resultado |
|---|---|
| `<html>` sin `lang` en los demos | 0 de 1 018 |
| `<img>` sin `alt` en los demos | 0 de 677 |
| `Web/components.html` sin `<h1>` | **Sí**, y es la página con más tráfico: empieza en `<h2>` |
| Saltos en la jerarquía de encabezados | 7 demos, todos `h1` → `h3` en galerías |
| Demos sin ningún `<h1>` | 429 de 1 018 |
| Demos con más de un `<h1>` | 14 |
| `canonical` de las tres páginas | Correctos, y el dominio `vercel.app` es el real |
| `404.html` | Correcto: `noindex`, sin canonical, bilingüe |
| `sitemap.xml` | Correcto; le falta `lastmod` |

Lo de los 429 demos sin `<h1>` no es crítico dentro de la web, porque el `h1` de la
página de detalle es el de la colección y el demo va en un `iframe` con título
propio. **Sí** lo es para quien abra el fichero suelto, que es el caso de uso
principal de una librería.

El `og:locale:alternate` de las tres páginas no lo respalda ningún
`<link rel="alternate" hreflang>`, y la traducción es solo de cliente: conviene
o poner `hreflang` real o retirar la promesa.

---

## 10. CI

Lo que hace bien: `permissions: contents: read` (correcto para un repo que acepta
PRs de terceros), `concurrency` con cancelación, `ubuntu-24.04` fijado en vez de
`ubuntu-latest`, tres pasos que **fallan si fallan**, y `on: pull_request` en vez
de `pull_request_target`, que es la variante que no expone secretos. No hay
workflow que despliegue, y es lo correcto.

Lo que no cubre, y es donde más se ganaría:

- Que el `licenseFile` de cada componente exista de verdad (lo comprueba el
  generador al construir, pero nada lo re-verifica)
- Que los demos lleven crédito de autoría (habría atrapado el `## 2.4`)
- Que no entren ficheros de terceros en las carpetas de demo (habría atrapado el
  `## 2.1`)
- Que los iframes lleven `sandbox` (habría atrapado el `## 3.2d`)

**Y una matriz de versiones de Node no existe**: el workflow fija 22, mientras
`package.json` promete `>=20`, así que esa promesa no está verificada. Con
`[20, 22, 24]` y `windows-latest` el coste es marginal y convertiría `engines` en
algo respaldado, además de detectar justo lo que `.gitattributes` no cubre.

Las acciones están fijadas a `@v5` en vez de a un SHA. Aceptable, pero un SHA fijo
es mejor en un workflow que ejecuta código de PRs.

---

## 11. Plan, por orden de prioridad

### Lo que bloquea (decisión de quien mantiene el proyecto)

1. Borrar `Creaciones-primium/…/vendor/recurso-84b7e44a.css` y poner una URL
   neutra en el input del demo → `## 2.1`
2. Sacar los 119 ZIP de Davoker del índice y protegerlos con `*.zip` → `## 2.2`
3. Reescribir el alcance del `LICENSE` raíz → `## 2.3`
4. Quitar el correo personal de `SECURITY.md` → `## 4`
5. Decidir si se reescribe la historia → `## 4`

### Arreglo mecánico, sin decidir nada

6. El enlace simbólico del build, el `serve.mjs`, el `sandbox` del portal →
   `## 3.2`
7. Las afirmaciones falsas de la documentación → `## 6`
8. `.gitattributes`, `.gitignore`, `.vercelignore` → `## 8`
9. `robots.txt`, el `<h1>` que falta, la línea muerta → `## 5` y `## 9`
10. `THIRD_PARTY_NOTICES.md`: `og-image`, `favicon`, `api.qrserver.com`, y quitar
    los controles de despliegue que no existen → `## 2.5` y `## 2.6`
11. Los ficheros estándar que faltan → `## 7`
12. Matriz de Node en el CI, y las cuatro comprobaciones que faltan en
    `validate.mjs` → `## 10`

### Requiere decidir

13. El crédito de autoría en los 1 018 demos: tocarlos todos o generarlo
    → `## 2.4`
14. Servir los demos en otro origen, o solo documentar el punto conocido
    → `## 3.3`
15. Si se reconstruyen los ZIP de Davoker con el `LICENSE` dentro, o se dejan de
    repartir
16. `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy`, y el tope de
    tamaño del ZIP → `## 3.4`
