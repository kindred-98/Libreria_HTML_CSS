# Política de seguridad

Este repositorio es público y acepta pull requests. Es razonable asumir que alguien intentará encontrar problemas. Esta política explica cómo notificarlos para que puedas corregirlos antes de que sean públicos.

## Versiones con soporte

| Versión | Recibe avisos de seguridad |
| --- | --- |
| `main` | Sí |
| Versiones anteriores | No |

El proyecto no publica releases numeradas: todo el desarrollo ocurre en `main`, así que `main` es lo único mantenido.

## Cómo reportar un problema

**Vía preferida: el reporte privado de GitHub.** No expone nada.

1. Ve a **Security** en la barra superior del repositorio.
2. Activa **Advanced Security → Private vulnerability reporting** si no lo está.
3. Usa **Report a vulnerability** para enviar el reporte.

**Alternativa por correo:** `angelecheniq@gmail.com`. Ten en cuenta que esa dirección ya es pública en el historial de commits, así que aparecerá en spam. Si prefieres, cambia la de este fichero por una dirección dedicada antes de publicar.

**No abras un issue público** para reportar un fallo de seguridad. Un issue es visible para todo el mundo de inmediato, y alguien podría copiar el fallo antes de que haya un arreglo.

## Qué incluir en el reporte

- Qué componente afectado y en qué condiciones se manifiesta
- Pasos para reproducirlo, idealmente los mínimos
- Qué esperabas y qué ocurrió
- Navegador y sistema operativo, si aplica
- Si lo explotaste más allá de lo necesario, dilo: ayuda a priorizar

## Alcance

**Está en el alcance:**

- `Web/scripts/app.js`, `Web/scripts/zip.js` y `Web/styles/site.css`
- `Web/scripts/generate-catalog.mjs`, `validate.mjs`, `serve.mjs` y `catalog-format.mjs`
- `vercel.json`, `.vercelignore` y `.github/workflows/validate.yml`
- Las páginas: `index.html` raíz, `Web/index.html`, `Web/components.html` y `Web/team-core.html`
- Cualquier componente de `CreacionesNuevas/` o `creaciones-primium/`
- La generación del catálogo: un `id` malicioso, una ruta que escape del repositorio, o una referencia que permita leer ficheros de fuera

**Queda fuera del alcance:**

- El contenido de los componentes de `GevendraAutorExterno/`, que son de terceros y ya estaban publicados en su repositorio de origen. Se incluyen sin modificarlos. Un problema dentro de uno de ellos se reporta a quien lo haya creado
- Vulnerabilidades en jQuery, Ionicons o cualquier biblioteca cargada desde un CDN externo. Se reportan a sus mantenedores
- Los enlaces a terceros. El sitio no aloja ni redirige a ellos

## Diseño de seguridad relevante

Para que se entienda qué está protegido y qué no:

- **Las vistas previas van en `iframe` con `sandbox="allow-scripts allow-forms allow-popups"`, sin `allow-same-origin`.** Un componente no puede acceder al DOM de la aplicación, ni a sus `localStorage` ni a sus cookies
- **Salvedad:** el enlace "abrir en nueva pestaña" de cada detalle carga el componente **en el origen del sitio y sin `sandbox`**. Ahí el componente sí tiene acceso completo a `localStorage`. Es un punto conocido y aceptado
- **`Content-Security-Policy` en `vercel.json`**, con `frame-src 'self'`. No restringe a los componentes de terceros, porque cada documento dentro de un `iframe` aplica la suya
- **El proyecto no tiene dependencias de npm**, ni backend, ni base de datos. No hay superficie de ataque convencional
- **`serve.mjs`** es un servidor de desarrollo local. Valida que la ruta no salga de la raíz del repositorio
- **La dirección de donaciones es pública por diseño** y aparece en las tres páginas y en `app.js`. No es un secreto y no debe tratarse como tal

## Pull requests

- El workflow `validate.yml` se ejecuta en cada pull request. Como hace `on: pull_request`, ejecuta código del propio PR en un runner sin secretos y con `permissions: contents: read`. Es el comportamiento estándar y aceptado
- **La revisión la hace la persona que mantiene el repositorio.** No existe acceso de escritura para terceros
- Un PR que cambie `Web/scripts/app.js`, `vercel.json` o la **dirección de donaciones** merece un vistazo especialmente cuidadoso. Un cambio de dirección parece legítimo, pero cambia a dónde va el dinero de la gente que dona

## Respuesta

| Plazo | Objetivo |
| --- | --- |
| Confirmación de recepción | 72 horas |
| Valoración de gravedad | 7 días |
| Corrección o mitigación | Según gravedad, priorizado por impacto |

Este es un proyecto mantenido sin ánimo de lucro. Las correcciones urgentes se priorizan por impacto sobre los visitantes. No hay programa de recompensas.

## Divulgación

- Se da tiempo para corregir antes de publicar detalles
- Se agradece que no se difunda el fallo hasta que haya un arreglo desplegado
- Una vez corregido y desplegado, se publica en `CHANGELOG.md` Creditando al reporter de forma discreta si lo desea
- Nadie es marcado como responsable del fallo. Todo el mérito del aviso es de quien lo encontró
