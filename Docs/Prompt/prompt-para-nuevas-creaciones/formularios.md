# PROMPT: 100 FORMULARIOS en `creaciones-primium/formularios/`

Crea componentes hasta que esta carpeta tenga **exactamente 100 formularios**. Si ya hay N, crea 100 - N.

---

## 1. ANTES DE EMPEZAR
1. Lista los slugs que ya existen en `creaciones-primium/formularios/` y en el resto de carpetas de
   `creaciones-primium/`, y también en `CreacionesNuevas/` y `GevendraAutorExterno/`. No repitas ninguno.
2. Anota los slugs que vas a crear en una lista y mantenla al día, para que los 100 sean distintos.

## 2. REGLA DE ORO: LA PRESENTACIÓN ES PARTE DEL DISEÑO
**No existe esqueleto común.** No construyas "titulo + recuadro centrado + cuatro campos en fila".
Ese patrón queda prohibido. Cada formulario elige **un** modelo de presentación del catálogo, distinto
del de sus vecinos (nunca tres seguidos con el mismo modelo). Dentro de tu modelo, inventa libremente.

## 3. CATÁLOGO DE MODELOS DE PRESENTACIÓN (rota entre ellos)
1. CONVERSACIÓN — el formulario se revela paso a paso, una pregunta por pantalla (tipo chat).
2. UNA COLUMNA — formulario largo clásico con grup secciones y anclas laterales.
3. DOS COLUMNAS - etiquetas a la izquierda, campos a la derecha, con atajos de teclado.
4. ENCABEZADO PEGADO — barra de progreso fija arriba y el contenido se desplaza debajo.
5. MODAL — aparece sobre un fondo desenfocado, con foco atrapado y cierre con Escape.
6. HOJA LATERAL — panel que entra desde el borde, arrastrable y redimensionable.
7. TARJETA DE BANCO — formulario de pago con tarjeta que rota en 3D al pasar el cursor.
8. WIZARD — pasos con indicador, validaciones por paso y possibility de volver atrás.
9. FILA ÚNICA — todo en una barra horizontal compacta, como una barra de direcciones o de búsqueda.
10. MAPA — formulario flotando sobre un mapa, con dirección y horarios.
11. TERMINAL — cada campo es una línea de consola, con autocompletado yvalidación en vivo.
12. MESA — rejilla de celdas editables tipo hoja de cálculo, con navegación por teclado.
13. ENCUESTA — una pregunta por bloque, con barras de resultado que se animan al responder.
14. CARGA DE ARCHIVOS — zona de arrastre con miniaturas, progreso y reintento.
15. CÓDIGO QR / OTP — seis casillas que se llenan solas y se resincronizan al pegar.
16. MULTIPASO DE COMPRA - seleccionas productos y la vista se recompone con Animated Flip.
17. SUSCRIPCIÓN — campo único con planes sugeridos que se despliegan al enfocar.
18. PERFIL — editor de datos personales con avatar y vista previa en vivo.
19. INFORME DE INCIDENCIA — formulario largo con severidad, adjuntos y vista previa del ticket.
20. FORMULARIO DENTRO DE UNA TARJETA DE PRODUCTO — compra rápida que se despliega desde la tarjeta.
21. DATOS BANCARIOS — validaciones con unmask, caducidad y CVV, y microcopy de seguridad.
22. RESERVA — calendario más selects, con resumen lateral que se actualiza en vivo.
23. FÓRMULA DE REPARTO — cantidades por artículo con total calculado y barra animada.
24. NEWSLETTER — un campo, un botón y un estado de éxito que celebra la subscripción.

## 4. CONVENCIÓN DE ARCHIVOS
Una carpeta por componente: `creaciones-primium/formularios/<slug-kebab-case-en-ingles>/`
- `index.html` obligatorio
- `styles.css` obligatorio
- `script.js` **opcional**: solo si el efecto necesita JS. Si es puro CSS, no lo crees ni lo referencies.

Nada más. Sin README, sin package.json, sin carpeta de assets.

## 5. REGLAS DURAS
- Solo HTML, CSS y JS. **Sin recursos externos**: nada de CDN, `<img>`, `url()` a archivo, webfonts
  (solo pilas del sistema), `fetch` ni módulos ES. Debe verse igual abierto con `file://`.
- `index.html` necesita: `<!doctype html>`, `<html lang="en">`, `meta charset`, viewport,
  `<title>` en inglés, `<meta name="description" content="...">` en inglés y, **justo debajo**,
  `<meta name="description-es" content="...">` en español natural con acentos correctos, sin
  entidades HTML y sin comillas dobles dentro del atributo.
- **Cada control es el elemento real**: `<input>`, `<select>`, `<textarea>`, `<label for>`, `<fieldset>`.
- **Validación de verdad**: cada campo tiene su estado por defecto, error y correcto, con mensaje,
  icono y `aria-invalid`/`aria-describedby` sincronizados. La validación se dispara al salir el foco
  y al enviar, no solo al escribir.
- Sin emojis, sin lorem ipsum, sin "coming soon", sin texto de relleno, **sin comentarios en el código**.
- Anima solo `transform`, `opacity`, `filter`, `clip-path`, `color`. Nunca `width`/`height`/`top`/`left`
  en muchos elementos a la vez. Objetivo 60fps.
- Obligatorio `@media (prefers-reduced-motion:reduce)` que deje el formulario en un estado estático
   y funcional (no ocultes los mensajes de error).
- Accesible: se recorre entero con teclado, foco visible en cada control, foco atrapado si hay modal,
  cierre con Escape, y `role="alert"` en los errores que aparecen.
- Responsive: se ve bien a 1200x800 y a 380x700. Sin scroll horizontal, nada cortado.
- No toques archivos fuera de tu carpeta. No ejecutes comandos de git.

## 6. BARRA DE CALIDAD
Nada de formulario blanco sobre gris. Cada componente tiene: historia de color (2-3 tonos armónicos),
profundidad real (sombra interna, brillo especular, sombra de contacto, luz de borde), microdetalle
(bisel de 1px, marcas, tipografía grabada, microcopy de ayuda) y movimiento con easing y escalonado.

## 7. CONCEPTOS (extrae 100 distintos de estas familias, 2-4 por familia)
Alta de usuario · Inicio de sesión · Recuperación de contraseña · Verificación en dos pasos · Perfil y
datos personales · Dirección y envío · Pago con tarjeta · Pago alternatives (bizum,_SEPA, cripto) ·
Facturación y datos fiscales · Suscripción y planes · Cancelación y baja · Opinion con valoración ·
Sugerencias · Ticket de incidencia ·-feedback de producto · Contacto y soporte · Registro de evento ·
Matrícula o inscripción · Solicitud de trabajo
Alquiler y reserva · Venta de clasificados · Encuesta · Donación o propina · Cupón y descuento ·
Multipaso de onboarding · Preferencias y consentimiento · Accesibilidad (alto contraste, tamaño) ·
Modo oscuro · Formulario en un panel lateral · Formulario imprimible · Firma digital · Importación por CSV.

## 8. VERIFICACIÓN (obligatoria, no te la saltes)
1. `node --check <carpeta>/<slug>/script.js` en cada `script.js` que crees.
2. Movimiento y errores, con el banco del repo:
   `node Docs/Prompt/prompt-para-nuevas-creaciones/banco-de-pruebas.mjs formularios <slug>`
   Debe salir `ok`: nada de `ERROR-JS`, `SIN-MOVIMIENTO` ni `SIN-REPORTE`.
   **AVISO IMPORTANTE:** Edge headless con `--virtual-time-budget` ejecuta solo unos 4
   `requestAnimationFrame`, así que una captura a pelo siempre sale congelada en el frame 0.
   Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento del banco.
3. Mira las dos capturas de cada formulario (2500 ms y 7000 ms) con la herramienta de lectura, y
   además prueba en frío los tres estados: por defecto, con error y correcto.
4. Cada `href`/`src` del `index.html` apunta a un archivo que existe en la misma carpeta.

## 9. AUDITORÍA FINAL
Sobre los 100: sin errores de sintaxis, sin referencias rotas, sin archivos extra, sin recursos
externos, con `prefers-reduced-motion` en todos, con exactamente una meta `description` y una
`description-es` por archivo, y llaves CSS balanceadas (ignora las que estén dentro de `content:"..."`).

## 10. GIT
Al terminar, si el usuario lo pide: `node Web/scripts/generate-catalog.mjs` para el catálogo y un
commit **solo con las rutas de tu carpeta**, nunca con `git add -A` (hay cambios de otras sesiones en
el working tree).

## 11. ENTREGA
Informe con: los 100 slugs, el modelo de presentación de cada uno, el estado de verificación y una
línea describiendo el flujo del formulario.
