# Hallazgos sobre el trabajo en paralelo (2026-10-05)

## Que es este documento

Revision de los cambios que habia **sin commitear** en el arbol de trabajo el
2026-10-05, mientras otro agente trabajaba en sus propias incidencias. Ninguno de
esos cambios se ha commiteado aqui: este documento es solo el registro de lo que
se encontro, para que no se pierda cuando el otro agente termine.

**Es una foto de un estado transitorio.** Los cuatro puntos de abajo peuvent
estar ya corregidos: son hallazgos sobre ficheros que no estaban en `main`. Si
alguien los arregla, este documento se queda obsoleto y conviene borrarlo o
marcarlo como resuelto.

**Estado a 2026-10-06**: los puntos 1, 2 y 3 estan resueltos (cada uno lleva su
nota debajo). El punto 4 se arreglo en `090ca05` y **se volvio a romper** en
`d2f87b7`: sigue abierto.

## Los cuatro hallazgos

### 1. `.github/workflows/validate.yml` dejo de ser YAML valido (grave)

Al reescribir un bloque de comentarios, la indentation se perdio:
`cache: npm` paso de 10 a 6 espacios, con lo que dejo de ser hijo de `with:` y
paso a ser clave hermana suya.

```yaml
        with:
          node-version: ${{ matrix.node-version }}
# El lockfile es la unica forma de que el CI instale exactamente las
      # mismas versiones que se han probado en local. ...
      cache: npm
```

El parser lo rechaza:

```
yaml.parser.ParserError: while parsing a block collection
  in ".github/workflows/validate.yml", line 38, column 7
expected <block end>, but found '?'
  in ".github/workflows/validate.yml", line 56, column 7
```

Consecuencia: GitHub Actions no puede cargar el workflow, asi que **ninguna de
las validaciones del CI llega a correr en los pushes**. Es especialmente
molesto porque el trabajo en curso era, precisamente, Improvements de calidad
que dependen de esa validacion.

Arreglo: devolver `cache: npm` a los 10 espacios, dentro de `with:`.

**Resuelto en `090ca05`**: `cache: npm` vuelve a 10 espacios (linea 56 del
workflow) y el parser lo acepta.

### 2. `Web/components.html`: `allow-same-origin` en el sandbox del portal Davoker

Se anadio `allow-same-origin` al `sandbox` del iframe de `davoker.html`:

```
sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
```

`allow-scripts` y `allow-same-origin` juntos **neutralizan el sandbox**: la
pagina puede quitarse el atributo desde script y quedarse con acceso al origen
del padre. Es justo lo que `Web/scripts/validate.mjs` documenta como motivo del
sandbox:

> Todo `<iframe>` de las paginas del sitio lleva sandbox. Si no, el demo corre en
> el mismo origen y ve el `localStorage` (incluido el consentimiento de cookies).

`davoker.html` es material de un autor externo, asi que el riesgo no es teorico.

Arreglo: quitar `allow-same-origin`. Si hacia falta para el `postMessage`, el
cambio va en el otro sentido (abajo).

**Resuelto en `090ca05`**: el `sandbox` de `Web/components.html:95` quedo en
`allow-scripts allow-forms allow-popups allow-downloads`. No volver a
anadirlo: es lo que hace opaco el origen del iframe y lo que exige el arreglo
del punto 3.

### 3. El endurecimiento de `postMessage` quedo a medias

`DavokerDiseñador/transicion.html` paso de publicar con `"*"` a publicar con
`window.location.origin`. Correcto como narrowed de emisor, pero **el receptor
sigue sin comprobar `event.origin`** (`installDavokerTransitionBridge` en
`Web/scripts/app.js`), que es la parte que de verdad importaba: sin validar el
origen en el receptor, cualquier pagina puede seguir mandando el mensaje.

Ademas, el comentario que justifica el punto 2 dice *"ver el sandbox de
components.html, que incluye allow-same-origin"*: o sea, la seguridad se rebajo
para poder hacer un endurecimiento cosmetico. Al reves.

Arreglo: quitar `allow-same-origin` y anadir la comprobacion en el receptor.

```js
if (evento.origin !== window.location.origin) return;
```

**Resuelto en 2026-10-06, pero no como proponia el hallazgo.** Esa comprobacion
**ya estaba** (`fdd9b59`) y es exactamente lo que dejo el centrado del shell
muerto: con el `sandbox` sin `allow-same-origin` el origen del iframe es opaco y
`event.origin` llega **siempre como `"null"`**, asi que la linea devolvia siempre
y `transicion.html` nunca llegaba a centrar el iframe. Solo encajaba mientras
`28de356` tenia `allow-same-origin` puesto, que era el propio punto 2.

Lo que se hizo en `installDavokerTransitionBridge` (`Web/scripts/app.js`):

```js
if (evento.origin !== "null" && evento.origin !== window.location.origin) return;
if (evento.source !== elements.davokerFrame.contentWindow) return;
```

La autentica garantia es `evento.source`: el navegador comprueba que el mensaje
salga de la `contentWindow` del `#davoker-frame`, identidad que se mantiene
aunque el iframe navegue. El `origin` `"null"` se acepta porque es lo que
produce el sandbox, y `window.location.origin` (no `"null"`) sigue aceptandose
por si algun dia se quita el sandbox. Detalle en el CHANGELOG, entrada
«Centra el shell en la animacion de despedida al volver de un showcase».

### 4. `creaciones-primium/botones/wireframe-hud-lock-button/styles.css`: se perdio `top:50%`

```diff
 .tag{
   position:absolute;
   left:50%;
-  top:50%;
   transform:translate(-50%,-50%);
```

`position:absolute` sin `top` usa la posicion estatica del elemento, y entonces
`translate(-50%,-50%)` lo centra sobre *esa* y no sobre el contenedor. La etiqueta
queda desplazada. Es el error clasico de "SonarCloud lo marca como redundante":
lo parece por el `transform`, pero no lo es.

Arreglo: devolver `top:50%;`.

**Sigue abierto.** `090ca05` lo devolvio y `d2f87b7` lo volvio a quitar: en el
`.tag` de `styles.css:498` hay `position:absolute` y `left:50%` sin `top`, asi
que la etiqueta sigue descentrada.

## Lo que si estaba bien

El resto del trabajo en curso (unas 60 ficheros) esta correcto:

- Las correcciones de accesibilidad (`aria-label` en inputs sueltos, `label for`
  en `CreacionesNuevas/login-form-split`) son validas y arreglan violations
  reales de axe.
- Las limpiezas de `font-style:normal` colocado antes del atajo `font:` si eran
  redundantes: el atajo `font` resetea `font-style` a `normal` por su cuenta.
- `creaciones-primium/controles/cockpit-view-lever/styles.css`: el valor
  `#8f8straight` era un color CSS corrupto. Al ser invalido, el `radial-gradient`
  entero se descartaba en silencio y la rosa de los vientos se veia sin relleno.
  Buen hallazgo.
- Las limpiezas de codigo muerto en `waving-flag-cloth-sim`, `ligature-morph-button`
  y `spirograph-trace`: se comprobo que no dejan referencias colgando
  (`ahora()` y `ultimo` ya no se usan en `spirograph-trace`).

Sobre las ~60 ediciones de demos se paso un barrido de todas las declaraciones
CSS eliminadas buscando perdidas de layout (`top`, `left`, `width`, `height`,
`position`, `display`, ...). `top:50%` del punto 4 es la unica.