Quiero que trabajes sobre mi repositorio existente:

https://github.com/kindred-98/Libreria_HTML_CSS

El proyecto es una biblioteca personal de componentes HTML/CSS. Ya existe una carpeta `GevendraAutorExterno` que contiene numerosos componentes independientes, efectos, botones, animaciones, cards, navbars, loaders, etc.

Quiero convertir este repositorio en una **web moderna, profesional, responsive e interactiva que funcione como una biblioteca/galería de componentes HTML y CSS**.

IMPORTANTE:

* Antes de modificar cualquier archivo, analiza completamente la estructura actual del proyecto.
* No elimines componentes existentes.
* No sobrescribas código de componentes existentes salvo que sea estrictamente necesario.
* Respeta los componentes actuales y su funcionamiento.
* Reutiliza el código existente siempre que sea posible.
* No inventes componentes que ya existan en el repositorio.
* No hagas cambios innecesarios.
* Quiero código limpio, mantenible y fácil de entender.
* Evita dependencias innecesarias.
* La primera versión debe utilizar principalmente HTML, CSS y JavaScript vanilla.
* No quiero React, Next.js, Tailwind, backend ni base de datos en esta primera versión.
* Si consideras que alguna dependencia es realmente necesaria, explica primero por qué.
* La web debe poder ejecutarse fácilmente en local desde VS Code.
* La interfaz debe estar en inglés porque quiero utilizar el proyecto como portfolio.
* El código debe utilizar nombres de variables, clases y funciones claros y coherentes.
* No quiero una solución improvisada: quiero una arquitectura preparada para seguir ampliando la biblioteca.

==================================================
FASE 0 — ANALIZAR EL PROYECTO
=============================

Antes de programar:

1. Analiza el repositorio.
2. Identifica:

   * estructura de carpetas
   * componentes existentes
   * archivos HTML
   * archivos CSS
   * archivos JavaScript
   * imágenes/assets
   * README
   * cualquier configuración existente
3. Determina cómo están organizados actualmente los componentes.
4. Identifica posibles categorías de componentes.
5. Detecta duplicaciones o problemas estructurales importantes.
6. Propón una arquitectura para la nueva web sin destruir la estructura actual.

Después de analizarlo, continúa con la implementación.

==================================================
FASE 1 — ARQUITECTURA
=====================

Construye una estructura clara para la web de la biblioteca.

La web debería tener aproximadamente esta arquitectura:

* Home
* Component Library
* Component Detail
* Search
* Categories

La estructura puede adaptarse a lo que encuentres en el repositorio.

Quiero separar claramente:

1. Los componentes originales de la biblioteca.
2. El código de la aplicación que muestra y organiza esos componentes.

No mezcles innecesariamente la lógica de la biblioteca con la interfaz de la web.

La arquitectura debe permitir que posteriormente pueda añadir nuevos componentes sin tener que reescribir toda la aplicación.

==================================================
FASE 2 — DISEÑO DE LA WEB
=========================

Crea una interfaz moderna y profesional.

Inspiración conceptual:

* documentación de librerías frontend
* galerías de componentes
* developer tools
* documentación técnica moderna

Pero NO copies el diseño exacto de ninguna web.

Quiero una identidad visual propia.

Características:

* diseño limpio
* moderno
* profesional
* orientado a desarrolladores
* responsive
* buena jerarquía visual
* animaciones sutiles
* buen uso del espacio
* excelente experiencia en desktop
* adaptación correcta a móvil

Preferencia visual:

* dark mode como diseño principal
* posibilidad de light mode
* tonos oscuros
* detalles azules
* buena legibilidad
* bordes y sombras sutiles
* efectos hover elegantes

No abuses de las animaciones.

La interfaz debe parecer una herramienta real para desarrolladores, no una landing page genérica.

==================================================
FASE 3 — HOME
=============

Construye una página principal.

Debe incluir:

HEADER / NAVBAR

* logo/nombre de la biblioteca
* Home
* Components
* Categories
* GitHub
* botón para cambiar Dark/Light mode

HERO

Título:

"HTML & CSS Library"

Subtítulo explicando que es una colección de componentes, efectos y experimentos HTML/CSS reutilizables.

Incluir botones como:

* Explore Components
* View on GitHub

También puede mostrar estadísticas de la biblioteca:

* número de components
* categorías
* etc.

Estas estadísticas deberían calcularse dinámicamente cuando sea posible.

SECCIÓN DE COMPONENTES DESTACADOS

Mostrar algunos componentes existentes de la biblioteca.

Cada componente debe aparecer como una card con:

* preview
* nombre
* categoría
* descripción corta
* botón View Component

SECCIÓN DE CATEGORÍAS

Mostrar las categorías disponibles.

Por ejemplo:

* Buttons
* Cards
* Navigation
* Animations
* Loaders
* Forms
* Effects
* Other

Pero las categorías deben adaptarse a los componentes que realmente existan.

FOOTER

Debe incluir:

* nombre del proyecto
* GitHub
* información básica
* año
* tecnologías utilizadas

==================================================
FASE 4 — COMPONENT LIBRARY
==========================

Crear una página donde se puedan explorar todos los componentes.

Debe existir:

BUSCADOR

El usuario debe poder escribir:

button
card
navbar
animation
etc.

y filtrar los componentes.

FILTROS

Permitir filtrar por categoría.

Por ejemplo:

All
Buttons
Cards
Navigation
Animations
Loaders
Forms
Effects

Los filtros deben funcionar mediante JavaScript.

GRID

Mostrar los componentes en un grid responsive.

Cada card debe incluir:

* nombre
* categoría
* preview
* descripción
* View Component
* posiblemente Copy Code

Debe existir un estado cuando no haya resultados:

"No components found"

==================================================
FASE 5 — COMPONENT DETAIL
=========================

Cada componente debe tener una página o vista de detalle.

Debe mostrar:

1. Nombre del componente.
2. Categoría.
3. Descripción.
4. Preview completamente funcional.
5. Código HTML.
6. Código CSS.
7. Si existe JavaScript, también mostrar JavaScript.
8. Botones para copiar cada bloque de código.

Ejemplo:

HTML

[Copy]

```html
...
```

CSS

[Copy]

```css
...
```

JavaScript

[Copy]

```javascript
...
```

El botón Copy debe copiar realmente el contenido al clipboard.

Después de copiar:

"Copied!"

o una indicación visual equivalente.

==================================================
FASE 6 — PREVIEWS
=================

Esta parte es MUY IMPORTANTE.

Los previews deben utilizar los componentes reales existentes en el repositorio.

No quiero simples imágenes simulando los componentes.

Siempre que sea posible:

* cargar HTML real
* cargar CSS real
* cargar JavaScript real
* mostrar el componente funcionando

Si existen dificultades técnicas para cargar directamente determinados componentes, crea una solución limpia y aislada para renderizarlos.

No modifiques el componente original únicamente para conseguir que aparezca en el preview si puedes evitarlo.

==================================================
FASE 7 — SISTEMA DE DATOS
=========================

Necesito una forma organizada de registrar los componentes.

Puedes utilizar un archivo JavaScript/JSON similar conceptualmente a:

components.js

Cada componente podría tener:

* id
* name
* category
* description
* path
* html
* css
* javascript
* tags

Pero primero analiza cómo están estructurados realmente los componentes actuales.

El objetivo es que añadir un nuevo componente sea sencillo.

Idealmente, para añadir un nuevo componente debería bastar con:

1. Crear su carpeta.
2. Añadir su información al registro.
3. La web debería mostrarlo automáticamente.

Si puedes automatizar todavía más este proceso sin introducir backend, hazlo.

==================================================
FASE 8 — SEARCH
===============

Implementar búsqueda en tiempo real.

Debe buscar por:

* nombre
* categoría
* tags
* descripción

Debe ignorar mayúsculas/minúsculas.

Ejemplo:

Buscar:

"button"

debería encontrar:

* Among Us Button
* Button Hover Effect
* Button Hover Sketch Effect

etc.

==================================================
FASE 9 — DARK / LIGHT MODE
==========================

Implementar Dark Mode y Light Mode.

Debe:

* cambiar toda la interfaz
* utilizar CSS variables
* mantener buena accesibilidad
* recordar la preferencia del usuario utilizando localStorage

No dupliques estilos innecesariamente.

Utiliza variables como:

--bg-primary
--bg-secondary
--text-primary
--text-secondary
--accent
--border
etc.

==================================================
FASE 10 — RESPONSIVE
====================

La web debe funcionar correctamente en:

* Desktop
* Laptop
* Tablet
* Mobile

Presta especial atención a:

* navbar
* sidebar/filtros
* cards
* código
* previews
* botones
* tipografía

No quiero scroll horizontal accidental.

==================================================
FASE 11 — UX Y ACCESIBILIDAD
============================

Implementa buenas prácticas:

* HTML semántico
* botones reales para acciones
* labels cuando corresponda
* navegación mediante teclado
* focus visible
* contraste adecuado
* alt text en imágenes
* aria-label cuando sea necesario

No utilices elementos `div` como botones cuando exista un `<button>` apropiado.

==================================================
FASE 12 — ANIMACIONES
=====================

Añadir animaciones sutiles:

* hover de cards
* aparición de elementos
* botones
* cambio de tema
* navegación

Utilizar principalmente CSS.

Evitar animaciones excesivas.

Respetar:

`prefers-reduced-motion`

para usuarios que prefieran reducir las animaciones.

==================================================
FASE 13 — PERFORMANCE
=====================

La página debe ser ligera.

Evita:

* librerías innecesarias
* JavaScript excesivo
* imágenes enormes
* animaciones pesadas
* código duplicado

Carga únicamente lo necesario.

==================================================
FASE 14 — CALIDAD DEL CÓDIGO
============================

Quiero:

* nombres descriptivos
* funciones pequeñas
* separación de responsabilidades
* comentarios únicamente cuando aporten valor
* evitar código duplicado
* evitar variables globales innecesarias
* estructura fácil de mantener

No hagas una solución gigantesca en un único archivo.

==================================================
FASE 15 — README
================

Actualiza el README del proyecto.

Debe explicar:

* qué es el proyecto
* características
* estructura
* tecnologías
* cómo ejecutarlo
* cómo añadir nuevos componentes
* cómo funciona el sistema de categorías
* cómo funciona la búsqueda
* cómo funcionan los previews
* cómo contribuir

Añade ejemplos cuando sea útil.

==================================================
FASE 16 — TESTING
=================

Antes de terminar:

Comprueba:

* que la página arranca
* que no existen errores JavaScript
* que todos los enlaces funcionan
* que la búsqueda funciona
* que los filtros funcionan
* que Dark/Light mode funciona
* que localStorage funciona
* que Copy Code funciona
* que los previews funcionan
* que no se rompe en móvil
* que los componentes originales siguen funcionando

Si existen herramientas de validación/linting disponibles, utilízalas.

==================================================
FASE 17 — DEPLOY
================

Deja el proyecto preparado para desplegarlo como sitio estático.

La opción preferida será:

* GitHub Pages
* Netlify
* Vercel

No añadas backend.

Indica en el README cómo desplegarlo.

==================================================
REGLAS IMPORTANTES DURANTE TODO EL PROCESO
==========================================

1. NO elimines componentes existentes.

2. NO reemplaces toda la arquitectura del repositorio sin analizarla primero.

3. NO conviertas el proyecto a React/Next/Tailwind salvo que sea absolutamente necesario.

4. Prioriza HTML + CSS + JavaScript vanilla.

5. Reutiliza código existente.

6. Mantén los componentes originales independientes.

7. La aplicación de la biblioteca debe estar separada de los componentes.

8. No copies código de terceros sin respetar sus licencias.

9. Comprueba el LICENSE existente antes de reutilizar código externo.

10. Si encuentras componentes cuya licencia o procedencia no esté clara, no asumas que pueden redistribuirse libremente. Señálalo.

11. No inventes información sobre los componentes.

12. No añadas dependencias simplemente porque faciliten una tarea que puede hacerse con JavaScript/CSS vanilla.

13. Si tienes que tomar una decisión arquitectónica importante, elige la solución más sencilla y mantenible.

14. Mantén compatibilidad con navegadores modernos.

15. No dejes código experimental o muerto en producción.

==================================================
FORMA DE TRABAJAR
=================

Quiero que trabajes de forma incremental.

PRIMERO:

Analiza el repositorio completo.

Después explícame brevemente:

* qué has encontrado
* qué arquitectura propones
* qué archivos vas a crear/modificar
* por qué
* posibles problemas que hayas detectado

DESPUÉS:

Implementa la Fase 1.

Comprueba que funciona.

Después continúa con la siguiente fase.

No quiero que hagas una implementación gigantesca sin comprobar cada parte.

Después de cada fase:

1. implementa
2. revisa
3. prueba
4. corrige errores
5. continúa

Al finalizar, dame un resumen de:

* archivos creados
* archivos modificados
* funcionalidades implementadas
* comandos para ejecutar el proyecto
* posibles problemas pendientes
* cómo añadir un nuevo componente
* cómo desplegarlo

OBJETIVO FINAL:

Quiero terminar con una web que parezca una **biblioteca real de componentes frontend**, donde un desarrollador pueda entrar, buscar un componente HTML/CSS, verlo funcionando, consultar su código y copiarlo.

Debe ser suficientemente profesional para utilizarla como proyecto de portfolio.

No quiero solamente una landing page bonita.

Quiero una herramienta funcional.
