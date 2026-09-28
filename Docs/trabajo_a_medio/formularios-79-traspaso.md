# Traspaso de sesión — 79 formularios en `creaciones-primium/formularios/`

**Fecha:** 28 de septiembre de 2026
**Objetivo de la tarea:** crear **79 formularios** en `creaciones-primium/formularios/`, cada uno
en su carpeta con `index.html` + `styles.css` (+ `script.js`), con calidad visual alta y
validación real. Fuente de requisitos: `Docs/Prompt/prompt-para-nuevas-creaciones/formularios.md`.

---

## 1. Estado actual: 26 de 79 listos y verificados

| Métrica | Valor |
|---|---|
| Formularios completos y verificados `ok` | **26** |
| Carpetas vacías o a medias (pendientes de rehacer) | **3** |
| Formularios sin empezar | **50** || Total carpetas creadas | 29 |
| Fallos de sintaxis JS | 0 |
| Fallos del banco de pruebas | 0 en los 26 |
| Problemas de auditoría de reglas | 0 en los 26 |

Los 26 están **verificados de verdad**: `node --check` correcto, banco de pruebas en `ok`,
capturas revisadas a 2500 ms y 7000 ms, y auditoría de reglas limpia.

---

## 2. Información crítica del entorno (NO está en el PATH)

**Node no está en el PATH.** Si ejecutas `node` a secas falla con "no se reconoce como
término o cmdlet". Usa siempre la ruta absoluta:

```powershell
& "C:\Users\mañana\.local\node\node.exe" --version   # v24.19.0
```

**Los comandos de verificación deben llevar `workdir` en la raíz del repo**
(`C:\Users\mañana\Documents\GitHub\Libreria_HTML_CSS`) o una ruta absoluta al script.
El banco de pruebas resuelve el repo a partir de su propia ubicación, así que si lo
invocas con ruta relativa sin `workdir` falla con `MODULE_NOT_FOUND`.

Edge sí existe en la ruta que espera el banco:
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`

---

## 3. Archivos de apoyo creados (fuera del repo, en temporal)

Estos tres archivos son el contexto de trabajo. **Viven en la carpeta temporal**, no en el
repositorio, para no violar la regla de "no tocar archivos fuera de tu carpeta". Si la
sesión nueva no los encuentra, vuelve a crear el que falte con el contenido descrito abajo.

| Archivo | Para qué sirve |
|---|---|
| `C:\Users\MAANA~1\AppData\Local\Temp\opencode\plan-79.md` | **Lista maestra de los 79 formularios**: slug, concepto, modelo de presentación, paleta de 3 tonos y flujo. La tabla completa está en la sección 7 de este documento. |
| `C:\Users\MAANA~1\AppData\Local\Temp\opencode\especificacion-formularios.md` | **Especificación común** con todas las reglas duras: cabecera obligatoria, prohibición de recursos externos, validación con tres estados, movimiento, reduced-motion, accesibilidad, responsive, barra de calidad, estilo de escritura y verificación. Léela entera antes de crear nada. |
| `C:\Users\MAANA~1\AppData\Local\Temp\opencode\auditar.mjs` | **Script de auditoría** que revisa los 79 al final. Comprueba: carpeta, archivos exactos, cabecera, una `description` y una `description-es` por archivo y en orden, entidades, recursos externos, `prefers-reduced-motion`, `role="alert"`, labels, comentarios, emojis, llaves CSS balanceadas y referencias `href`/`src` rotas. Ejecutar con `& "C:\Users\mañana\.local\node\node.exe" "C:\Users\MAANA~1\AppData\Local\Temp\opencode\auditar.mjs"` desde cualquier sitio. |

El script de auditoría imprime una tabla `slug` + lista de problemas. Cuando los 79 estén,
debe imprimir `sin problemas`.

---

## 4. Cómo se verificó (procedimiento probado y funcionando)

Desde `C:\Users\mañana\Documents\GitHub\Libreria_HTML_CSS`:

```powershell
# 1) Sintaxis de un script
& "C:\Users\mañana\.local\node\node.exe" --check "creaciones-primium\formularios\<slug>\script.js"

# 2) Banco de pruebas (acepta varios slugs a la vez, mucho más rápido)
& "C:\Users\mañana\.local\node\node.exe" "Docs\Prompt\prompt-para-nuevas-creaciones\banco-de-pruebas.mjs" formularios slug1 slug2 slug3
```

La ruta relativa del banco solo funciona si ejecutas con `workdir` en la raíz del repo.
Si lo invocas sin `workdir`, falla con `MODULE_NOT_FOUND`. Para ir a lo seguro, usa la
ruta absoluta al script:

```powershell
& "C:\Users\mañana\.local\node\node.exe" "C:\Users\mañana\Documents\GitHub\Libreria_HTML_CSS\Docs\Prompt\prompt-para-nuevas-creaciones\banco-de-pruebas.mjs" formularios slug1 slug2 slug3
```

**Estados posibles y qué hacer:**

| Estado | Significado | Solución |
|---|---|---|
| `ok` | Correcto | Nada |
| `SIN-MOVIMIENTO` | El DOM no cambia entre 1200 ms y 4200 ms | Falta una animación **infinita** de `transform` u `opacity` visible desde el inicio. Añade una mancha de luz, un barrido de brillo o un anillo que late. |
| `ERROR-JS` | Error de JavaScript | El número tras `err=` es la cuenta de errores; mira el `RPT B`. Suele ser un elemento null por un id mal escrito. |
| `SIN-REPORTE` | No se inyectó la sonda | El HTML no tiene `</body>` o el script falla antes del `load`. |

**Aviso importante del propio banco:** Edge headless con `--virtual-time-budget` ejecuta
solo unos 4 `requestAnimationFrame`, así que una captura suelta sale congelada en el frame 0.
Nunca deduzcas "está roto" de una sola imagen: usa la sonda de movimiento. Yo lo comprobé
con dos formularios sonda y tanto CSS puro como JS con rAF dan `ok`.

Las capturas quedan en `C:\Users\MAANA~1\AppData\Local\Temp\opencode\banco\shots\<slug>-2500.png`
y `<slug>-7000.png`. Límpialas si quieres forzar capturas nuevas.

---

## 5. Referencia de calidad: `account-signup-wizard`

Este formulario lo escribí yo a mano y es **el patrón de calidad** para todo lo demás.
Léelo antes de crear los que faltan: `index.html`, `styles.css` y `script.js`.

Enseña específicamente:
- Cabecera HTML canónica con las dos metas y acentos reales.
- Profundidad visual: sombra de contacto, brillo especular con `::after` y barrido, luz de
  borde con `inset`, malla de fondo con `mask-image`.
- Tres estados de campo (`neutro` / `error` / `ok`) con icono dibujado en CSS, nunca un carácter.
- Aria sincronizado: `aria-invalid` y `aria-describedby` se reescriben en cada `pintar()`.
- Patrón de descriptores `CAMPOS` + `pintar` + `validarPanel` + `mostrarResumen`.
- Medidor de fuerza de contraseña en vivo con lista de reglas.
- OTP de seis casillas con pegado que reparte, flechas y backspace entre casillas.
- Animación infinita de auroras + barrido de brillo (garantiza `ok` en el banco).
- Entradas con `animation ... both` y delays escalonados, con estado visible como base.

**Patrón de animación infinita que garantiza `ok`** (copia este, funciona siempre):

```css
.barrido::after { animation: barrido 9s var(--ease) infinite 1.2s; }
@keyframes barrido {
  0% { transform: translateX(-100%); }
  22%, 100% { transform: translateX(100%); }
}
```

---

## 6. Los 26 formularios ya hechos y verificados

| # | slug | Modelo | Paleta | Flujo en una línea |
|---|---|---|---|---|
| 1 | `account-signup-wizard` | Wizard | violeta / rosa | Tres pasos: cuenta, seguridad y código de correo, con progreso pegado y botón de volver. **Referencia de calidad.** |
| 2 | `member-login-console` | Terminal | verde fosforescente | Tres líneas de consola con historial, prompt `>` y validación al salir el campo. |
| 3 | `password-recovery-journey` | Conversación | turquesa | Chat de cuatro mensajes: correo, envío de enlace, nueva clave y confirmación. |
| 4 | `two-factor-code-entry` | OTP | lima / naranja | Seis casillas autocompletadas, pegado resincronizado y cuenta atrás de reenvío. |
| 5 | `profile-identity-editor` | Perfil | coral | Avatar, nombre, biografía e intereses con vista previa de tarjeta en vivo. |
| 6 | `shipping-address-ledger` | Dos columnas | papel / tierra | Libro mayor con etiquetas a la izquierda, código postal validado y atajos Alt+1..4. |
| 7 | `credit-card-glass` | Tarjeta de banco | cobalto / oro | Tarjeta que rota en 3D, número agrupado con validación Luhn, caducidad y CVV. |
| 8 | `bizum-mobile-pay` | Fila única | verde azulado | Barra compacta con teléfono, alias e importe, con confirmación al enviar. |
| 9 | `sepa-debit-mandate` | Mesa | azul tinta / rojo sello | Rejilla editable con IBAN desglosado, firmante y periodicidad, total al pie. |
| 10 | `invoice-tax-details` | Una columna | ocre / marfil | Columna larga con NIF, razón social, régimen y resumen lateral que se actualiza. |
| 11 | `crypto-wallet-checkout` | Encabezado pegado | violeta / cian | Barra fija con red, comisión y slippage, y copia de la dirección de cartera. |
| 12 | `subscription-plan-picker` | Suscripción | púrpura | Un campo de correo y planes que se despliegan al enfocar con ahorro anual. |
| 13 | `plan-cancellation-flow` | Conversación | rojo | Chat de motivos: razón, retención con descuento y confirmación final. |
| 14 | `product-review-stars` | Encuesta | dorado | Valoración con estrellas, barras animadas y campo de reseña. |
| 15 | `product-feedback-drawer` | Hoja lateral | menta | Panel lateral con deslizador de satisfacción, categorías y notas. |
| 16 | `quick-buy-drawer` | Tarjeta de producto | naranja | La tarjeta se despliega y revela cantidad, talón y envío exprés. |
| 17 | `coupon-redeem-strip` | Fila única | rosa chillón | Tira de cupón con código enmascarado y descuento aplicado en vivo. |
| 18 | `cart-multistep-flow` | Multipaso de compra | esmeralda | Carrito, envío y pago se recomponen al avanzar con animación. |
| 19 | `order-split-delivery` | Fórmula de reparto | naranja tierra | Cantidad por artículo con barras animadas, excedente y total calculado. |
| 20 | `restaurant-table-reservation` | Reserva | bermellón | Calendario, comensales y resumen lateral que crece en vivo. |
| 21 | `rental-property-availability` | Mapa | oliva | Formulario flotando sobre plano de calles con filtros y ficha del inmueble. |
| 22 | `classified-listing-ad` | Dos columnas | azul / mostaza | Título, categoría, precio y fotos con etiquetas a la izquierda y publicar. |
| 23 | `support-ticket-desk` | Ticket de incidencia | azul cielo | Severidad, entorno, pasos para reproducir y vista previa con número. |
| 24 | `bug-report-attachment` | Carga de archivos | violeta claro | Zona de arrastre con miniaturas, progreso por archivo y reintento. |
| 25 | `contact-support-desk` | Modal | índigo | Botón que abre modal con foco atrapado, dos temas de contacto y Escape. |
| 26 | `event-registration-desk` | Horario | naranja claro | Agenda con huecos seleccionables, tipo de entrada y resumen de asistencia. |

Nota: `sepa-debit-mandate` se creó con un nombre mal escrito (`sepa-de-bit-mandate`) durante
el trabajo. **Ya lo renombré y está correcto.** No vuelvas a crear esa carpeta duplicada.

---

## 7. Lo que falta

### 7.1 Carpetas que existen pero están a medias (3) — rehacer o completar

| slug | Qué falta | Nota |
|---|---|---|
| `course-enrollment-flow` | `styles.css` y `script.js` | Tiene un `index.html` de 16088 bytes. Léelo: si el diseño y la estructura están bien, solo hay que escribir el CSS y el JS que le falta y ajustar referencias. |
| `job-application-portal` | todo | Carpeta **vacía**. Crear desde cero. |
| `scholarship-application` | todo | Carpeta **vacía**. Crear desde cero. |

### 7.2 Los 53 formularios que no existen todavía

Con su modelo de presentación, paleta y flujo. Están en el orden en que conviene crearlos.

| # | slug | Modelo | Paleta | Flujo en una línea |
|---|---|---|---|---|
| 27 | `job-application-portal` | Una columna | #221a12 / #e09f3e / #fdf6ec | Columna larga con experiencia, carta, enlace a portfolio y anclas. |
| 28 | `scholarship-application` | Conversación | #1b2b1f / #7ac74f / #eef7e9 | Chat que pregunta estudios, nota media, ingresos y documentos. |
| 29 | `feedback-nps-survey` | Encuesta | #0f1f1c / #2dd4bf / #e9fbf8 | Escala de 0 a 10 con barras de resultados y motivo, luego pregunta abierta. |
| 30 | `donation-amount-picker` | Fórmula de reparto | #0d1b1a / #35d0a5 / #e6fff7 | Importe, recurrencia y reparto entre causas con barra animada. |
| 31 | `survey-rating-matrix` | Mesa | #1a1626 / #b388ff / #f3efff | Matriz de celdas con valoración por fila y columna. |
| 32 | `csv-data-import` | Carga de archivos | #101a10 / #66bb6a / #eef7ee | Arrastre de CSV, vista previa de columnas detectadas y mapeo de campos. |
| 33 | `printable-application-form` | Formulario imprimible | #faf7f0 / #1f2933 / #b23a48 | Hoja A4 con zonas de tinta, sin cromo y con contadores de caracteres. |
| 34 | `digital-signature-pad` | Firma digital | #14161d / #9d7bff / #f2efff | Pad de firma en canvas, firmante, fecha y resumen del documento. |
| 35 | `consent-preference-center` | Preferencias | #101a17 / #4ade80 / #edfdf3 | Filas de ajustes para comunicaciones, cookies y terceros con resumen de cambios. |
| 36 | `accessibility-settings` | Preferencias | #0f1720 / #38bdf8 / #eaf4ff | Contraste, tamaño, subrayado y densidad que cambian el formulario en vivo. |
| 37 | `dark-mode-switcher` | Modal | #0a0a0f / #f59e0b / #f5f5f7 | Modal de tema con franja del día, temperatura de color y modo automático. |
| 38 | `onboarding-tour-form` | Stepper radial | #1a1030 / #a78bfa / #f3eeff | Circunferencia de cinco pasos con tooltips y resumen final. |
| 39 | `password-strength-tuner` | Una columna | #22140a / #ff8a3d / #fff1e6 | Medidor de robustez con reglas y sugerencias que cambian al teclear. |
| 40 | `newsletter-signup-banner` | Newsletter | #12082b / #7f5af0 / #f3efff | Un campo, un botón y celebración al suscribirse. |
| 41 | `waiting-list-invite` | Fila única | #0a1a17 / #2dd4bf / #e6fffb | Barra compacta con correo y posición en la cola que sube al unirse. |
| 42 | `multistep-checkout-cards` | Multipaso de compra | #101a3d / #4f7cff / #eef2ff | Tres pestañas de pago, resumen lateral y validación por paso. |
| 43 | `express-pay-sheet` | Hoja lateral | #141414 / #e8e8e6 / #f5f5f7 | Hoja inferior con tarjeta guardada, biometría y confirmación. |
| 44 | `bank-transfer-proof` | Ticket de incidencia | #101a10 / #4caf50 / #eef7ee | Ficha de transferencia con referencia, concepto y adjuntar justificante. |
| 45 | `instalment-plan-picker` | Suscripción | #0f1a2e / #3b82f6 / #eef4ff | Campo único y planes de meses que se despliegan con total calculado. |
| 46 | `gift-card-redeem` | OTP | #1a0f1f / #d946ef / #fceeff | Código de regalo en casillas y saldo aplicado al carrito. |
| 47 | `referral-code-invite` | Encuesta | #1b1608 / #eab308 / #fffbeb | Pregunta cómo nos conociste con barras y campo de código de referido. |
| 48 | `feature-request-board` | Mesa | #101c14 / #34d399 / #eefbf4 | Tabla de ideas con voto por celda, prioridad y filtro. |
| 49 | `complaint-escalation-form` | Ticket de incidencia | #2a0f14 / #fb7185 / #fff0f2 | Escalado con nivel, funciones afectadas y resumen imprimible. |
| 50 | `live-chat-support-box` | Conversación | #0a1424 / #60a5fa / #eef4ff | Conversación en vivo con bandeja, tiempo de espera y envío con atajos. |
| 51 | `store-visit-booking` | Mapa | #1a1a0a / #ca8a04 / #fdfaef | Formulario sobre plano para concertar visita con horario y teléfono. |
| 52 | `delivery-tracking-update` | Encabezado pegado | #101418 / #94a3b8 / #f1f5f9 | Barra fija de estado, nueva dirección y franja de entrega estimada. |
| 53 | `package-redirect-form` | Una columna | #1a1810 / #a3a380 / #faf8f0 | Reenvío a punto de recogida con selección de operador y horarios. |
| 54 | `address-autocomplete-search` | Fila única | #0f1414 / #2dd4bf / #eafffb | Barra de dirección con sugerencias filtradas y elección de tarjeta. |
| 55 | `shipping-label-preferences` | Dos columnas | #1c1c22 / #a1a1aa / #fafafa | Preferencias de etiqueta con atajos de teclado y vista previa del formato. |
| 56 | `returns-request-form` | Ticket de recibo | #241c10 / #b45309 / #fdf6ec | Ticket de devolución con motivo, artículo y estado del reembolso. |
| 57 | `warranty-registration` | Mesa | #101d1a / #2dd4bf / #eafffa | Rejilla para registrar varios productos en garantía con fecha de compra. |
| 58 | `appointment-clock-picker` | Horario | #131a26 / #38bdf8 / #eef6ff | Reloj de 30 minutos con huecos, profesional y motivo de la cita. |
| 59 | `flight-checkin-console` | Terminal | #0b1420 / #22d3ee / #e6fbff | Consola de facturación con código de reserva, plazas y equipaje. |
| 60 | `seat-selection-grid` | Mesa | #0d1220 / #f472b6 / #fdeaf4 | Malla de asientos numerada con cabina, salida y total. |
| 61 | `train-ticket-timetable` | Horario | #1a1a1a / #facc15 / #fafafa | Origen y destino con rejilla de horas y clases de plaza. |
| 62 | `hotel-guest-details` | Una columna | #0f1f1a / #34d399 / #ecfdf5 | Datos de huéspedes, fechas y preferencias con resumen de la estancia. |
| 63 | `car-rental-booking` | Mapa | #171a22 / #64748b / #eef1f6 | Plano de callejero con punto de recogida, combustible y seguro. |
| 64 | `classified-vehicle-ad` | Dos columnas | #201410 / #ef4444 / #fdf0ef | Anuncio de vehículo con kilometraje, año y precio con negociación. |
| 65 | `freelance-project-brief` | Encuesta | #101a2e / #60a5fa / #eff4ff | Brief por bloques con prioridad, presupuesto y plazos. |
| 66 | `volunteer-signup-grid` | Mesa | #101a10 / #a3e635 / #f7fee7 | Rejilla de turnos de voluntariado con horas y capacidades. |
| 67 | `wedding-rsvp-form` | Ticket de recibo | #1f1410 / #e11d48 / #fff1f2 | Confirmación con invitados, mesa, menú y elección a la carta. |
| 68 | `newsletter-preferences-center` | Preferencias | #14101f / #a78bfa / #f5f3ff | Preferencias de suscripción por temas y frecuencia del resumen. |
| 69 | `early-access-waitlist` | Modal | #0d1b1a / #2dd4bf / #eafffb | Modal de espera con referido, posición y progreso. |
| 70 | `bug-repro-steps-form` | Conversación | #1a1014 / #fb923c / #fff3e8 | Chat guiado de reproducción: dispositivo, pasos y resultado esperado. |
| 71 | `maintenance-request-form` | Hoja lateral | #1a1a1a / #facc15 / #fafafa | Hoja lateral para aviso de mantenimiento con urgencia y fotos. |
| 72 | `quote-request-estimator` | Fórmula de reparto | #101418 / #38bdf8 / #eef6ff | Reparto de partidas, totales y presupuesto descargable simulado. |
| 73 | `price-calculator-builder` | Mesa | #1a1010 / #f87171 / #fff0f0 | Tabla de servicios con cantidades que recalculan el precio al instante. |
| 74 | `dietary-preferences-form` | Dos columnas | #12180f / #84cc16 / #f7fee7 | Alergias, dieta y programa con etiquetas a la izquierda y avisos. |
| 75 | `team-invite-form` | Modal | #101a2e / #8b5cf6 / #f3eeff | Modal para invitar a un compañero con rol, permisos y caducidad. |
| 76 | `api-key-request-form` | Terminal | #0a0a0a / #22c55e / #eafff1 | Consola para solicitar clave con ámbitos y fecha de caducidad. |
| 77 | `accessibility-audit-report` | Horario | #1a1a1a / #f97316 / #fdf4ec | Registro de auditoría con puntuación, hallazgos y prioridad. |
| 78 | `print-address-label` | Formulario imprimible | #f7f7f5 / #111111 / #c2410c | Etiquetas de dirección en hoja imprimible con tamaño y vista previa. |

Cuenta: 3 a medias + 50 sin empezar + 26 hechos = **79**. La tabla 7.2 va del 27 al 78 de mi
plan original porque `course-enrollment-flow` ocupa el 27 del plan y ya está creada a medias.
Al terminar deben existir **79 carpetas** en total.

---

## 8. Reglas de rotación de modelos (para no repetir presentación)

El requisito del prompt original es: **ningún modelo de presentación puede repetirse tres
veces seguidas**. La secuencia de 79 está construida para que el máximo de repetición sea
dos. Al añadir los que faltan, mantén la variedad: si el anterior ya usa ENCABEZADO
PEGADO, no pongas otro ENCABEZADO PEGADO seguido.

Modelos ya usados y disponibles (los 30 del catálogo):
CONVERSACIÓN, UNA COLUMNA, DOS COLUMNAS, ENCABEZADO PEGADO, MODAL, HOJA LATERAL,
TARJETA DE BANCO, WIZARD, FILA ÚNICA, MAPA, TERMINAL, MESA, ENCUESTA, CARGA DE ARCHIVOS,
OTP, MULTIPASO DE COMPRA, SUSCRIPCIÓN, PERFIL, INFORME DE INCIDENCIA, TARJETA DE PRODUCTO,
DATOS BANCARIOS, RESERVA, FÓRMULA DE REPARTO, NEWSLETTER, FIRMA DIGITAL, FORMULARIO IMPRIMIBLE,
PREFERENCIAS, STEPPER RADIAL, TICKET DE RECIBO, HORARIO.

---

## 9. Cómo continuar (plan de trabajo recomendado)

1. Lee la especificación completa en
   `C:\Users\MAANA~1\AppData\Local\Temp\opencode\especificacion-formularios.md`.
2. Lee `account-signup-wizard` para el nivel de calidad.
3. Crea los formularios en **lotes de 4 a 7**, verificando cada lote antes de pasar al
   siguiente. Un lote = un subagente, con la especificación, su tabla de formularios y la
   orden de verificación.
4. Cada lote debe acabar con: `node --check` en todos, banco de pruebas en todos (`ok`), y
   revisión de las capturas de 2500 ms.
5. Cuando falten pocos, ejecuta la auditoría final:
   `& "C:\Users\mañana\.local\node\node.exe" "C:\Users\MAANA~1\AppData\Local\Temp\opencode\auditar.mjs"`
6. No hagas commit ni `git add` salvo que el usuario lo pida expresamente. El working tree
   tiene cambios de otras sesiones: nunca uses `git add -A`.
7. Si el usuario lo pide al final, regenera el catálogo con
   `node Web/scripts/generate-catalog.mjs` (usando la ruta absoluta de node).

---

## 10. Errores que Cometí en esta sesión (para no repetirlos)

- **Los subagentes se cancelaron a mitad** porque los lancé dos a la vez con un prompt
  enorme y el usuario interrumpió. Crearon 26 formularios pero sin verificar, y dejaron
  3 carpetas a medias y una con el nombre mal escrito. **Lanza un subagente por vez y
  verifica tú mismo lo que devuelven.**
- **PowerShell 5.1 añade BOM** con `Set-Content -Encoding UTF8`. Si reescribes un archivo
  con acentos por ese método, quita el BOM con `.NET`:
  `$utf8NoBom = New-Object System.Text.UTF8Encoding($false); [System.IO.File]::WriteAllText($f, $txt, $utf8NoBom)`
  Mejor aún: usa la herramienta de edición en vez de PowerShell para archivos con acentos.
- **La PowerShell de este entorno muestra `?` en lugar de los acentos** al imprimir texto
  UTF-8. No es un fallo del archivo. Verifica con la herramienta de lectura o con `grep`.
- **`&` en PowerShell** es el call operator, obligatorio para rutas con espacios:
  `& "C:\ruta\con\espacios\node.exe" args`.
- **No confundas `&gt;` con una entidad prohibida.** Es HTML válido y necesario para
  mostrar `>`. La prohibición de entidades es para las metas `description-es` y para los
  acentos (`&aacute;` y compañía). El `&middot;` (separador «·») también es legítimo.
