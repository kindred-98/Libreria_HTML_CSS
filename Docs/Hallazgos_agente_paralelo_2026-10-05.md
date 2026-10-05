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