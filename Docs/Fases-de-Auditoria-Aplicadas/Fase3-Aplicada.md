# Fase 3 aplicada — ZIPs

**Fecha:** 2026-10-02 · **Auditoría de referencia:** [`Docs/Auditoria.md`](../Auditoria.md)
(fecha 2026-10-02, commit revisado `39f4e8d`) · **Base:** `1a2e106` + fases 1 y 2 ·
**Commits:** pendientes

Cierra H-2, H-3 y la parte de `.vercelignore` del §8. Deja constancia también de dos
cosas que la auditoría daba por hechas y **no se reproducen**, medidas aquí.

---

## 1. H-2 — MEDIO · `build-zips.mjs` se empaquetaba a sí mismo

### Qué estaba pasando

`collectComponentFiles()` (`Web/scripts/generate-catalog.mjs:259`) recoge **todo** lo
que hay en la carpeta del componente, y entre eso estaba el ZIP de salida
(`DavokerDiseñador/<cat>/<efecto>/<efecto>.zip`). Cada build empaquetaba el ZIP de la
build anterior dentro de la nueva:

```
antes:  119 de 119 ZIP contenían un .zip, hasta 4 niveles de anidamiento
        7,95 MB de los 10,4 MB eran ZIP dentro de ZIP
```

### Qué se hizo

| Fichero | Cambio |
|---|---|
| `Web/scripts/generate-catalog.mjs:273-278` | `if (entry.name.toLowerCase().endsWith(".zip")) continue;` en `collectComponentFiles()` |
| `.gitignore` | `*.zip` con comentario: los ZIP son salida de `build-zips.mjs`, no material de partida |
| git | `git rm -- '*.zip'` → **119 borrados** del índice y del disco |
| `package.json` | script `"zips": "node Web/scripts/build-zips.mjs --force"` |

El script ya existía y `vercel.json` ya lo ejecutaba en el build: lo que faltaba era
poder regenerarlos en local (se negaba a correr sin `--force` ni `VERCEL=1`) y dejar de
versionarlos. Sin el script, un clon nuevo no tendría ZIPs y el botón del portal
respondería 404 hasta que alguien descubriera el flag.

---

## 2. H-3 — MEDIO · licencia equivocada y `ATTRIBUTION` ausente

### Qué estaba pasando

`build-zips.mjs:172` añadía un `LICENSE` **en la raíz del ZIP** resuelto contra
`repositoryDirectory` (la raíz del repo), no contra la colección:

```js
const rutaLicense = sourceData.licenseFile ?? "../LICENSE";
const rutaFisicaLicense = path.join(repositoryDirectory, rutaLicense.replace(/^\.\.\//, ""));
zip.agregar("LICENSE", licenseBytes);   // -> el de kindred-98, 2 237 B
```

Además, `app.js:1226-1234` (`downloadComponentZip`) añade un `ATTRIBUTION.txt` que el
build no ponía: los dos caminos de descarga salían distintos, justo lo contrario de lo
que prometía el comentario de la cabecera del propio script.

### Qué se hizo

El `LICENSE` de la raíz se quitó, porque ya **no hace falta**: `generate-catalog.mjs`
mete el `licenseFile` de la colección en `files` (línea 326-336), y `downloadable`
exige que esté ahí (`:341-347`), o sea que todo componente descargable ya lleva su
licencia resuelta contra **la raíz de su colección**. Y se añadió el `ATTRIBUTION.txt`
con el mismo contenido y la misma ruta (`<id>/ATTRIBUTION.txt`) que `app.js`.

```diff
- const rutaLicense = sourceData.licenseFile ?? "../LICENSE";
- const rutaFisicaLicense = path.join(repositoryDirectory, rutaLicense.replace(/^\.\.\//, ""));
- const licenseBytes = await readFile(rutaFisicaLicense);
- zip.agregar("LICENSE", licenseBytes);
+ zip.agregar(`${componente.id}/ATTRIBUTION.txt`, [
+   `Fuente: ${sourceData.source ?? ""}`,
+   `Licencia: ${sourceData.license ?? ""}`,
+   `Archivo de licencia: ${sourceData.licenseFile ?? ""}`,
+   "",
+ ].join("\n"));
```

**Idioma del `ATTRIBUTION`:** `app.js` lo escribe con las cadenas del i18n según el
idioma activo (`en`: Source/License/License file; `es`: Fuente/Licencia/Archivo de
licencia). El build es una sola pasada y no sabe quién va a descargar, así que usa
español, que es el idioma por defecto de las páginas (`lang="es"`).

También se corrigió el `console.log` final, que decía «en Web/zips/» cuando
`rutaSalidaZip()` solo escribe en las carpetas de Davoker (comprobado: `Web/zips`
queda vacía).

---

## 3. `.vercelignore`

### Lo que sí se añadió

- `.git/` y `GevendraAutorExterno/` (esta no está en git, pero si alguien la tiene en
  disco al desplegar, no sube: su repo de origen no declara licencia).
- Un comentario documentando el par `Docs/**` + `!…` y cómo se verificó.

### Lo que NO se añadió, y por qué: `*.zip`

La auditoría (§8) pide `*.zip` en `.vercelignore`. **No se ha puesto:**

1. Ahora mismo no hay ningún `.zip` a la hora de subir (dejaron de versionarse en esta
   fase), así que la regla no excluiría nada.
2. Los ZIP los necesita el portal de Davoker (`davoker.html` enlaza
   `miscelanea/glitch/glitch.zip` relativo) y se generan **durante** el build con
   `build-zips.mjs`. Si Vercel aplicara el ignore también a los ficheros que produce el
   build, la descarga del portal se rompería en producción.

Sin forma de verificar aquí cómo trata Vercel al build, la regla solo puede ser a
ciegas → se deja fuera y se documenta.

### Lo que NO se reproducía: «`Docs/**` + `!Docs/THIRD_PARTY_NOTICES.md` es un bug»

El §8 afirma que no se puede reincluir un fichero si su carpeta madre está excluida y
que «al primer `Docs/algo/` el aviso de licencias dejaría de publicarse». **Medido en
un repo de prueba con `git check-ignore -v`:**

| Patrón | `Docs/THIRD_PARTY_NOTICES.md` | `Docs/otro/archivo.md` |
|---|---|---|
| `Docs/**` + `!Docs/THIRD_PARTY_NOTICES.md` (el actual) | **NO ignorado** ✓ | ignorado ✓ |
| `Docs/*` + `!Docs/THIRD_PARTY_NOTICES.md` | **NO ignorado** ✓ | ignorado ✓ |
| `Docs/` + `!Docs/THIRD_PARTY_NOTICES.md` | **ignorado** ✗ | ignorado ✓ |

`Docs/**` excluye los *hijos*, no la carpeta `Docs` en sí, así que git desciende y la
línea `!` se aplica. Lo que rompería la negación es excluir la carpeta madre (`Docs/`).
**El patrón actual se mantiene** y la comprobación queda escrita en el propio fichero
para que nadie lo «arregle» sin medir.

---

## 4. Verificación

```text
npm run catalogo   -> 1018 componentes · 1018 source files (ya sin .zip)
npm run zips       -> 119 ZIPs · 2 310 608 B (~2,2 MB)
npm run validar    -> 1018 componentes · 1018 descargables · 2688 ficheros · ok
node --check       -> build-zips.mjs y generate-catalog.mjs: sintaxis ok
```

| Comprobación | Resultado |
|---|---|
| ZIPs en disco / en el índice de git | 119 / **0** |
| ZIPs con un `.zip` dentro | **0** (antes 119) |
| Peso total de los 119 ZIP | **2,2 MB** (antes 10,4 MB; 7,95 MB eran anidamiento) |
| ZIPs sin `ATTRIBUTION.txt` | 0 |
| ZIPs sin `LICENSE` | 0 |
| `LICENSE` en la raíz del ZIP (el de kindred-98) | **0** (antes en los 119) |
| `LICENSE` dentro del ZIP de `glitch` | **1 085 B** = `DavokerDiseñador/LICENSE` (la raíz del repo es 2 237 B) |
| Contenido del ZIP de `glitch` | `miscelanea-glitch/{como-aplicar-glitch.txt, glitch.css, index.html, LICENSE, ATTRIBUTION.txt}` — idéntico a lo que genera `app.js` |
| `git status` | 119 borrados · 8 modificados · 1 nuevo · los ZIP regenerados, **ignorados** |

**Descarga del portal, servidor local** (`PORT=8125`):

```text
/DavokerDiseñador/miscelanea/glitch/glitch.zip  -> 200 (24 746 B) cabecera=PK
/Web/components.html                            -> 200
/Web/data/catalog.json                          -> 200
/Web/data/sources/miscelanea-glitch.json        -> 200
```

**Simulación de clon nuevo / CI:** se borraron los 119 ZIP del disco y se ejecutó
`npm run validar` → **pasa** (el catálogo ya no los lista, así que no hacen falta).
Después se regeneraron con `npm run zips`.

---

## 5. Estado después de la fase

| Hallazgo | Estado |
|---|---|
| H-2 — ZIP dentro de ZIP | **cerrado** |
| H-3 — licencia y `ATTRIBUTION` | **cerrado** |
| §8 `.vercelignore`: `.git/`, `GevendraAutorExterno/` | **cerrado** |
| §8 `.vercelignore`: `*.zip` | **no aplicado, con motivo documentado** (§3) |
| §8 `.vercelignore`: bug de `Docs/**` | **no reproducible, medido** (§3) |
| §8 `.gitignore`: `*.zip` | **cerrado** (el resto de patrones, fase 5) |
| §8 «`build-zips.mjs` no aparece en `package.json`» | **cerrado** |
| §7 «los 119 ZIP se despliegan» | **cerrado**: ya no se versionan, no suben |

---

## 6. Siguiente: Fase 4 — portal de Davoker y accesibilidad

1. **§2.1 (el principal)** — en el portal, con ninguna categoría desplegada solo se ve
   una tarjeta al azar y el botón «Descargar efecto (.zip)» está en 118 tarjetas con
   `display: none`. Falta que el visitante lo entienda: no es un bug de descarga.
2. **§6 accesibilidad** — `site.css:763` (`outline: 0` anula el foco visible del
   buscador), `<h1>` ausente en `components.html:75`, `<label>` sin texto (`:80`),
   `aria-live` en la rejilla que se reemplaza entera (`:93`), contraste de
   `.footer-meta` (3,50:1) y «Skip to content» sin traducir.
