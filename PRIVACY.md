# Política de privacidad

**Última actualización: 2026-10-02**

Qué recoge esta web y qué no. Es una biblioteca estática de demos de HTML y
CSS: no hay cuentas, ni formularios de envío, ni pagos, ni publicidad, ni
analítica cargada por defecto.

## Lo que se guarda en tu navegador

La aplicación usa `localStorage` para tres cosas, todas locales a tu navegador
y que no se envían a ningún servidor:

| Clave | Qué guarda | Para qué |
|---|---|---|
| `component-field-theme` | «dark» o «light» | recordar el tema elegido |
| `component-field-language` | «es» o «en» | recordar el idioma elegido |
| `component-field-analytics-consent` | la decisión sobre estadísticas | si aceptaste o rechazaste Google Analytics |

Puedes borrarlas en cualquier momento desde la configuración de tu navegador,
y la decisión sobre estadísticas también desde el botón **«Cookies»** del pie
de cualquier página.

## Google Analytics (solo si lo aceptas)

- **Qué:** medición de visitas y páginas abiertas, con el ID de medición
  `G-3TRY9F4G0Z`.
- **Cuándo:** el script solo se carga si aceptas en el aviso. **Sin aceptación
  no se hace ninguna petición a Google ni se crea ninguna cookie** — la
  comprobación está en `Web/scripts/app.js`.
- **A dónde va:** `www.googletagmanager.com` (carga del script) y
  `www.google-analytics.com` / `region1.google-analytics.com` (recogida).
- **Cómo cambiar de opinión:** el botón «Cookies» del pie, que rechaza y borra
  la clave, o borrar `localStorage` desde tu navegador.

## Cookies

Este sitio **no crea cookies propias**. Las cookies de Google Analytics solo
aparecen si aceptas las estadísticas.

## Peticiones a otros dominios

Las fuentes tipográficas están en el repo (`Web/assets/fonts/`), no en un CDN.
Los únicos destinos externos son los que lista `node Web/scripts/validar-csp.mjs`
y que la cabecera CSP del despliegue permite:

- `upload.wikimedia.org` y `commons.wikimedia.org` — imágenes de Wikimedia
  Commons enlazadas desde los demos (hotlink, no copias): Wikimedia ve tu IP
  igual que en cualquier web que cargue una imagen suya.
- `github.com` y `avatars.githubusercontent.com` — imágenes de algunos demos.
- `api.qrserver.com` — un demo generador de códigos QR.
- `www.googletagmanager.com`, `www.google-analytics.com` y
  `region1.google-analytics.com` — solo con tu aceptación.

## Datos que no se recogen

No hay registro de usuarios, no se envía el contenido de lo que escribes en el
buscador, no hay redes publicitarias, no se compra ni se vende información
personal y no se hace fingerprinting del dispositivo.

## Quién aloja la web

La web es estática y se sirve desde Vercel (`libreria-html-css.vercel.app`), que
registra las peticiones con fines de operación y seguridad conforme a su propia
política. Este proyecto no tiene servidor propio ni base de datos.

## Contacto

Dudas sobre privacidad: el mismo canal privado que describe
[`SECURITY.md`](./SECURITY.md).

## Cambios

Si esta política cambia, el hecho queda registrado en [`CHANGELOG.md`](./CHANGELOG.md)
y la fecha de arriba se actualiza en el mismo commit.
