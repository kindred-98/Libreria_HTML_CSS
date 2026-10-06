/**
 * ESLint del repositorio (flat config).
 *
 * Que cubre y que no, y por que:
 *
 * - Solo se lintea `Web/scripts/`. Ahi vive la columna vertebral del
 *   proyecto: los scripts que generan el catalogo, sellan los assets,
 *   validan y construyen los ZIP. Son los unicos ficheros que se ejecutan en
 *   el CI y en el despliegue de Vercel.
 *
 * - NO se lintean `CreacionesNuevas/`, `creaciones-primium/` ni
 *   `DavokerDisenador/`: son 1018 demos independientes, cada uno pensado
 *   para copiarse y pegarse tal cual. Lintarlos daria miles de avisos que
 *   nadie va a leer y que ademas contradicen la regla 6 de CONTRIBUTING (cada
 *   componente no puede depender de nada compartido). Esos 1018 demos ya los
 *   analiza SonarQube, que es la herramienta adecuada para codigo que no es
 *   tuyo para reescribir.
 *
 * - Las reglas seeligieron para pillar errores de verdad, no estilo: aqui no
 *   se debate como formatear un objeto.
 *
 *   node --experimental-strip-types Web/scripts/x.mjs   (o `npx eslint .`)
 *   npm run lint
 *   npm run lint:fix
 */
import js from "@eslint/js";

export default [
  {
    // Lo que no se revisa. Los demos van aparte a proposito.
    ignores: [
      "node_modules/**",
      "tmp/**",
      "Web/data/**",
      "CreacionesNuevas/**",
      "creaciones-primium/**",
      "DavokerDiseñador/**",
      "GevendraAutorExterno/**",
      "Web/styles/**",
      "Web/index.html",
    ],
  },
  {
    files: ["Web/scripts/**/*.mjs", "Web/scripts/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // Globals de Node que usan estos scripts. Declararlos aqui evita
      // instalar el paquete `globals` solo para esto.
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        AbortController: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        fetch: "readonly",
        globalThis: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Un `undefined` comparado contra algo que no puede ser undefined suele
      // ser un typo (`==` en vez de `===`) o una condicion muerta. Es la clase
      // de bug que Sonar marca como S3403 pero que conviene cazar antes.
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "error",
      "no-implicit-globals": "error",
      // `ignoreRestSiblings`: el repositorio usa
      //   const { loQueNoQuiero, ...loQueSi } = objeto
      // para quedarse con una parte concreta. Los nombres descartados estan a
      // proposito y marcarlos como "sin usar" seria un falso positivo en
      // `catalog-format.mjs` y en cualquier sitio que haga lo mismo.
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      // Los scripts de este repo hacen I/O en el nivel superior a proposito
      // (son programas, no librerias). Solo se avisa, no se prohibe.
      "no-console": "off",
    },
  },
  {
    // Los tests declaran su propio harness: los assert vienen de node:assert
    // y los tests usan callbacks propias de node:test.
    files: ["Web/scripts/__tests__/**/*.mjs"],
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
];