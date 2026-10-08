const catalogPath = "./data/catalog.json";
const fullCatalogPath = "./data/catalog.js";
// Una sola version para todo. Las tres paginas cargan este mismo script con
// "?v=<version>", asi que se lee de ahi en vez de repetirla aqui: cambiar el
// HTML invalida a la vez la cache de la app y la de las vistas previas.
const appVersion = new URL(
  document.querySelector('script[src*="/scripts/app.js"]')?.src ?? "./scripts/app.js",
  document.baseURI,
).searchParams.get("v") ?? "dev";
const previewRevision = appVersion;
// Tres filas de tres tarjetas. La rejilla de .component-grid ya es de tres
// columnas, asi que nueve cartas cierran filas completas sin huecos.
const pageSize = 9;
// Los destacados van a cuatro columnas, asi que la pagina se mide en multiplos
// de cuatro para no dejar una fila a medias cuando haya mas de una pagina.
// Destacados: una sola fila que va pasando sola. Avanza una tarjeta cada
// featuredStepMs y se para al pasar el ratón o al llevar el foco.
const featuredStepMs = 4000;
const featuredTransitionMs = 500;
// Tarjetas repetidas al final del track. En llegar a la primera repetida la
// vista es exactamente la del principio, asi que el bucle se reinicia sin que
// se note el salto.
const featuredClones = 4;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let featuredTimer = null;
// Cuantas páginas numeradas se dibujan a cada lado de la actual antes de
// colapsar el resto en puntos suspensivos.
const pageWindow = 1;

// Ejecuta una tarea cuando el navegador tenga un rato libre, sin bloquear lo
// que ya se esta viendo.
//
// `requestIdleCallback` es lo que hay para esto, pero no existe en todos los
// navegadores (y en pruebas automatizadas puede no disparar nunca), asi que el
// `timeout` es el garantia: la tarea se ejecuta **a los 1200 ms como tarde**,
// ocupe o no el hilo principal. Ese techo importa: sin el, en un movil lento
// el carrusel podria no aparecer nunca.
//
// @param {() => void} tarea Lo que se quiere aplazar.
// @param {number} [esperaMs] Tope de espera en milisegundos.
// @returns {void}
function aplazar(tarea, esperaMs = 1200) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(tarea, { timeout: esperaMs });
  } else {
    window.setTimeout(tarea, 200);
  }
}

// Google Analytics 4. El ID de medicion va aqui y en ningun otro sitio, y solo
// se manda algo si tiene el formato G-XXXXXXXXXX: con cualquier otro valor el
// codigo descarta el envio y no se pide nada a Google. El ID real esta en
// Analytics > Administracion > Flujos de datos > ID de medicion.
const analyticsId = "G-3TRY9F4G0Z";
// Hosts que necesita el CSP de vercel.json. El primero es el script de gtag y
// los otros dos los endpoints de recogida (el pixel y el beacon). Se declaran
// aqui para que el validador del CSP los vea y avise si alguno se queda fuera.
const analyticsEndpoints = {
  tag: "https://www.googletagmanager.com/gtag/js",
  collect: "https://www.google-analytics.com/g/collect",
  collectRegional: "https://region1.google-analytics.com/g/collect",
};
const consentStorageKey = "component-field-analytics-consent";
const translations = {
  en: {
    categories: {
      All: "All", Animations: "Animations", Buttons: "Buttons", Cards: "Cards", Controls: "Controls",
      Effects: "Effects", Forms: "Forms", Galleries: "Galleries", Loaders: "Loaders", Navigation: "Navigation", Other: "Other",
    },
    authors: {
      Davoker: "Davoker", "kindred-98": "kindred-98", fatmaerm: "fatmaerm",
    },
    skipToContent: "Skip to content",
    brandHome: "HTML and CSS Library home",
    mainNavigation: "Main navigation",
    languageLabel: "Language",
    navHome: "Home",
    navComponents: "Components",
    navGitHub: "GitHub",
    navTeamCore: "Team Core",
    marqueeLabel: "Featured strip",
    pageComponents: "Components",
    pageTeamCore: "Team Core",
    pagePrivacy: "Privacy",
    pageLegal: "Legal",
    // Nombre accesible de cada <main>. Sin esto las paginas tienen un
    // landmark igual (`main`) y axe lo marca (landmark-unique): quien recorre
    // la pagina con un lector de pantalla no puede saber en cual esta.
    portadaMain: "Home",
    componentsMain: "Component catalogue",
    teamMain: "Team and donations",
    privacyMain: "Privacy policy",
    legalMain: "Legal notice and accessibility",
    // Encabezado oculto que precede a las tarjetas del catalogo: las tarjetas
    // llevan un h3 y el encabezado anterior era el h1 de la pagina, salto que
    // axe marca como heading-order.
    resultsHeading: "Results",
    teamCoreEyebrow: "TEAM CORE",
    teamCoreTitle: "The people behind the library",
    teamCoreLead: "Three programming students and one repository that lit the fuse.",
    pcbChipLabel: "NEXO",
    storyEyebrow: "HOW IT STARTED",
    storyNote: "Where the idea came from, told properly.",
    // El parrafo va partido en tres trozos porque el nombre del repositorio de
    // origen es un enlace: applyStaticTranslations() escribe con textContent, y
    // el <a> se queda en el HTML con su href fijo. El texto del enlace si se
    // traduce (data-i18n="storyP1Link" va en el propio <a>).
    storyP1a: "It started at 10 in the morning, in an analysis and programming course on Java. We had an HTML and CSS practice session, and our teacher showed us how far you can push those two languages, using a few examples from ",
    storyP1Link: "https://github.com/gevendra2004/gevstack",
    storyP1b: ". What was in there looked far too good to just look at.",
    storyP2: "davoker started practising on his computer. Twenty minutes later, he called me to show me what he had built: it was something else. So I asked him: why don't we set up a library? Building components is his thing, and that is where he stands out: obsessive about every detail, with ideas nobody else comes up with.",
    storyP3: "fatmaerm saw it from the start: he told us there are already plenty of HTML and CSS libraries, but for anyone just beginning that is not the same thing. I'm in: it is real practice, and it settles the foundations of both languages.",
    storyP4: "davoker signed up with one sentence: \"I'm in, this thing is fascinating.\" And just like that, almost without noticing, a library started.",
    fromVenezuela: "Venezuela",
    fromAlgeria: "Algeria",
    fromSpain: "Spain",
    teamNoteClassmate: "Classmate from the course",
    teamRosterEyebrow: "THE ROSTER",
    teamRosterTitle: "Who maintains it",
    teamRosterNote: "Three accounts, one library.",
    roleFounder: "Founder & Lead Developer",
    roleCoreContributor: "Core Contributor",
    roleMaintainer: "Maintainer & Designer",
    teamViewProfile: "View profile ↗",
    donationsEyebrow: "DONATIONS",
    donationsTitle: "Support the library",
    donationsNote: "Every demo stays free and open source.",
    donationsText: "If this library saves you time, a small contribution keeps the demos maintained, documented, and free for everyone.",
    donateNow: "Donate",
    donationsNetwork: "Network: BNB Smart Chain (BEP20)",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
    switchTheme: "Switch theme",
    light: "Light",
    dark: "Dark",
    heroTitleFirst: "HTML & CSS",
    heroTitleSecond: "Library",
    heroEyebrow: "One demo, one file. Read it, and if you like it, it's yours, free.",
    heroDescription: "Browse the original demos: each one ships with its source code, ready to copy and adapt. Interface components and effects in HTML and CSS, animations, navigation, forms, and loading states.",
    exploreComponents: "Explore components",
    viewGitHub: "View on GitHub",
    librarySummary: "Library summary",
    collectionIndex: "COLLECTION INDEX",
    heroAsideLineOne: "Small pieces.",
    heroAsideLineTwo: "Useful details.",
    experiments: "experiments",
    categoriesLabel: "categories",
    selectedComponents: "SELECTED COMPONENTS",
    featuredTitle: "A few to explore",
    featuredNote: "Real demos from the collection, selected for a quick first look.",
    featuredPrev: "Go back",
    featuredNext: "Advance",
    collectionEyebrow: "THE COLLECTION",
    browseComponents: "Browse components",
    libraryNote: "Search the details. Open a demo. Make it yours.",
    searchPlaceholder: "Search buttons, cards, effects...",
    searchLabel: "Search components",
    loadingCollection: "Loading collection...",
    filterByCategory: "Filter by category",
    filterByAuthor: "Filter by author",
    noComponents: "No components found",
    noComponentsHint: "Try another search or choose a different category.",
    previousPage: "Previous page",
    nextPage: "Next page",
    goToPage: "Go to page {page}",
    pageOf: "Page {current} of {total}.",
    footerDonate: "Donate USDT through BNB Smart Chain (BEP20)",
    footerDonateAddress: "0xa8f0230135b4f6a959358be3e8e8531f3551fa81",
    walletAddress: "Wallet address",
    copyWalletAddress: "Copy the wallet address to the clipboard",
    footerBuilt: "Open source code library, open to contributions.\nGot a creative idea? OPEN A PR.",
    component: "component",
    components: "components",
    authorDavoker: "Davoker design - {count}",
    authorFatmaerm: "Fatmaerm component - {count}",
    authorKindred: "Kindred component - {count}",
    defaultCount: "{count} components by kindred and fatma",
    davokerHint: "119 more components available in davoker's section.",
    searchOffPlaceholder: "Search is off in davoker's section",
    viewComponent: "View component",
    liveDemo: "Live demo",
    copied: "Copied!",
    copy: "Copy",
    copiedToClipboard: "{label} copied to clipboard",
    clipboardUnavailable: "Clipboard access is unavailable in this browser",
    noLocalSource: "No local source file found.",
    originalComponentPreview: "Original component · interactive preview",
    openOriginal: "Open original ↗",
    openInNewTab: "Open in new tab ↗",
      livePreviewTitle: "{name} live preview",
      sourceLabel: "Source",
      licenseLabel: "License",
      licenseFileLabel: "License file",
    downloadZip: "Download ZIP",
    zipUnavailable: "ZIP unavailable",
    downloadZipTitle: "Download this component and its local assets",
    zipPermissionTitle: "Source, redistribution permission, and a component license file must be verified first",
    preparingZip: "Preparing ZIP...",
    zipDownloaded: "Component ZIP downloaded",
    zipFailed: "Could not create ZIP: {message}",
    attributionRecorded: "Redistribution cleared.",
    attributionPending: "Distribution not cleared.",
    attributionText: "Source: {source}. License: {license}.",
    attributionPendingText: "ZIP downloads stay disabled until the source, redistribution permission, and a license file for this component are verified.",
    missingFiles: "This original demo references missing local files: {files}. Its preview may be incomplete; the source files have not been changed.",
    backToComponents: "← Back to components",
    sourceCode: "Source code",
    htmlSource: "HTML · index.html",
    javascriptSource: "JavaScript",
    inlineSource: "{label} · inline {number}",
    localFileSource: "{label} · {name}",
    sourceLoadError: "Some source files could not be loaded. Open the original demo to inspect them. {message}",
    libraryTitle: "HTML & CSS Library",
    catalogUnavailable: "Catalog unavailable",
    catalogLoadError: "Could not load the component catalog. Run the site from a local web server and regenerate it if needed. {message}",
    themeNotSaved: "Theme preference will not be saved in this browser",
    languageNotSaved: "Language preference will not be saved in this browser",
    consentLabel: "Cookie notice",
    consentText: "We use Google Analytics to know how many people visit and which pages they open. It only loads if you accept. You can change your mind from the footer.",
    consentAccept: "Accept",
    consentReject: "Only necessary",
    consentAccepted: "Thank you. Analytics enabled",
    consentRejected: "Analytics disabled. You can change this from the footer",
    cookies: "Cookies",
    // Paginas de texto largo (Web/privacidad.html y Web/legal.html). Van en el
    // mismo diccionario que el resto para que el conmutador de idioma las
    // traduzca igual que a la portada, sin logica extra.
    privacyLink: "Privacy",
    legalLink: "Legal",
    privacyTitle: "Privacy",
    privacyUpdated: "Last updated: 2026-10-02",
    privacyIntro: "What this site collects and what it does not. It is a static library of HTML and CSS demos: no accounts, no submission forms, no payments, no advertising and no analytics loaded by default.",
    privacyTocLabel: "Index",
    privacyTocTitle: "On this page",
    privacyTocLocal: "What is stored in your browser",
    privacyTocAnalytics: "Google Analytics",
    privacyTocCookies: "Cookies",
    privacyTocThird: "Requests to other domains",
    privacyTocNone: "Data that is not collected",
    privacyTocHost: "Who hosts the site",
    privacyTocContact: "Contact",
    privacyLocalTitle: "What is stored in your browser",
    privacyLocalIntro: "The application uses localStorage for three things, all of them local to your browser and never sent to any server:",
    privacyColKey: "Key",
    privacyColWhat: "What it stores",
    privacyColWhy: "Why",
    privacyRowTheme: "remember the theme you picked",
    privacyRowLanguage: "remember the language you picked",
    privacyRowConsentValue: "your decision about statistics",
    privacyRowConsentWhy: "whether you accepted or rejected Google Analytics",
    privacyLocalOutro: "You can delete them at any time from your browser settings, and the statistics decision also from the Cookies button in the footer of any page.",
    privacyAnalyticsTitle: "Google Analytics",
    privacyAnalyticsIntro: "It is used to measure visits and pages opened, with the measurement ID G-3TRY9F4G0Z.",
    privacyAnalyticsWhen: "When: the script only loads if you accept in the notice. Without your acceptance there is no request to Google and no cookie is created.",
    privacyAnalyticsWhere: "Where it goes: www.googletagmanager.com (script load) and www.google-analytics.com / region1.google-analytics.com (collection).",
    privacyAnalyticsChange: "How to change your mind: the Cookies button in the footer, which rejects and deletes the key, or clearing localStorage from your browser.",
    privacyCookiesTitle: "Cookies",
    privacyCookiesText: "This site does not create its own cookies. Google Analytics cookies only appear if you accept the statistics.",
    privacyThirdTitle: "Requests to other domains",
    privacyThirdIntro: "The typefaces are in the repository, not on a CDN. The only external destinations are:",
    privacyNoneTitle: "Data that is not collected",
    privacyNoneText: "There is no user registration, what you type in the search box is never sent, there are no advertising networks, no information is bought or sold, and no device fingerprinting is done.",
    privacyHostTitle: "Who hosts the site",
    privacyHostText: "The site is static and is served from Vercel (libreria-html-css.vercel.app), which logs requests for operational and security purposes under its own policy. This project has no server of its own and no database.",
    privacyContactTitle: "Contact",
    privacyContactText: "Privacy questions: open an issue on GitHub. For security reports, use the private channel described in SECURITY.md.",
    privacyChanges: "If this policy changes, the change is recorded in the repository CHANGELOG and the date above is updated in the same commit.",
    legalTitle: "Legal",
    legalUpdated: "Last updated: 2026-10-06",
    legalTocLabel: "Index",
    legalTocTitle: "On this page",
    legalTocOwner: "Ownership",
    legalTocLicenses: "Licenses",
    legalTocThirdParty: "Third-party material",
    legalTocWarranty: "No warranty",
    legalTocA11y: "Accessibility",
    legalTocContact: "Contact",
    legalOwnerTitle: "Ownership",
    legalOwnerText: "This site is an open source project published on GitHub. The components have their own authorship: each demo folder declares its author and its license in the repository itself.",
    legalLicensesTitle: "Licenses",
    legalColWhat: "What",
    legalColLicense: "License",
    legalRowSite: "The site and its scripts",
    legalRowMit: "MIT",
    legalRowDemos: "The downloadable components",
    legalRowEachOwn: "MIT, with its author declared in the ZIP",
    legalRowDavoker: "davoker's effects",
    legalRowDavokerLicense: "MIT from the original author",
    legalLicenseNote: "You may copy, modify and use the components in your projects, including for commercial purposes. No permission needs to be requested and no attribution beyond what each ZIP already carries.",
    legalThirdTitle: "Third-party material",
    legalThirdText: "Some demos link images from Wikimedia Commons under their original licenses, and some material is listed in the repository's THIRD_PARTY_NOTICES.md file. Content removed for having no declared license is listed in the README and is not part of the catalogue.",
    legalWarrantyTitle: "No warranty",
    legalWarrantyText: "The components are provided as is, as interface experiments. Use them with judgement: they are demonstrations of a technique, not audited production code.",
    legalA11yTitle: "Accessibility",
    legalA11yIntro: "This site works towards WCAG 2.2 level AA. Specifically:",
    legalA11yAuto: "The automated checks (axe-core over the three pages, in both languages and both themes) detect no serious or critical violations.",
    legalA11yMotion: "Animations respect the prefers-reduced-motion system setting.",
    legalA11yKeyboard: "Everything can be used without a mouse: there is a skip link to the content, visible focus on every control, and the language and theme controls are real buttons.",
    legalA11yZoom: "The content reads correctly at 200% zoom.",
    legalA11yPartial: "Some moderate and minor findings are still being fixed; this statement is updated when that count reaches zero.",
    legalA11yReport: "If you find a barrier this statement does not cover, report it on GitHub Issues: it gets fixed and noted here.",
    legalContactTitle: "Contact",
    legalContactText: "Legal or licensing questions: CONTRIBUTING.md or a GitHub issue. Security reports go through the private channel described in SECURITY.md.",
  },
  es: {
    categories: {
      All: "Todas", Animations: "Animaciones", Buttons: "Botones", Cards: "Tarjetas", Controls: "Controles",
      Effects: "Efectos", Forms: "Formularios", Galleries: "Galerías", Loaders: "Indicadores de carga", Navigation: "Navegación", Other: "Otros",
    },
    authors: {
      Davoker: "Davoker", "kindred-98": "kindred-98", fatmaerm: "fatmaerm",
    },
    skipToContent: "Saltar al contenido",
    brandHome: "Inicio de la biblioteca HTML y CSS",
    mainNavigation: "Navegación principal",
    languageLabel: "Idioma",
    navHome: "Inicio",
    navComponents: "Componentes",
    navGitHub: "GitHub",
    navTeamCore: "Team Core",
    marqueeLabel: "Cinta destacada",
    pageComponents: "Componentes",
    pageTeamCore: "Núcleo del equipo",
    pagePrivacy: "Privacidad",
    pageLegal: "Legal",
    portadaMain: "Portada",
    componentsMain: "Catálogo de componentes",
    teamMain: "Equipo y donaciones",
    privacyMain: "Política de privacidad",
    legalMain: "Aviso legal y accesibilidad",
    resultsHeading: "Resultados",
    teamCoreEyebrow: "NÚCLEO DEL EQUIPO",
    teamCoreTitle: "Quién está detrás de la biblioteca",
    teamCoreLead: "Tres estudiantes de programación y un repositorio que encendió la mecha.",
    pcbChipLabel: "NEXO",
    storyEyebrow: "CÓMO NACIÓ",
    storyNote: "De dónde salió la idea, contado como fue.",
    // El parrafo va partido en tres trozos porque el nombre del repositorio de
    // origen es un enlace: applyStaticTranslations() escribe con textContent, y
    // el <a> se queda en el HTML con su href fijo. El texto del enlace si se
    // traduce (data-i18n="storyP1Link" va en el propio <a>).
    storyP1a: "Todo empezó a las 10 de la mañana, en una clase de análisis y programación en Java. Teníamos práctica de HTML y CSS y la profesora nos mostró hasta dónde se puede llegar con esos dos lenguajes, enseñándonos algunos ejemplos del ",
    storyP1Link: "https://github.com/gevendra2004/gevstack",
    storyP1b: ". Lo que había dentro nos pareció demasiado bueno como para quedarnos solo mirándolo.",
    storyP2: "davoker empezó a practicar en su ordenador. A los veinte minutos, me llamó para enseñarme lo que había hecho: era una chulada. Le dije: ¿por qué no montábamos una biblioteca? Crear componentes es lo suyo, y en eso se distingue: maniático con cada detalle y con ideas que no se le ocurren a nadie más.",
    storyP3: "fatmaerm lo vio claro desde el principio: nos dijo que ya existían un montón de bibliotecas de HTML y CSS, pero para quien está empezando eso no vale igual. Me apunto sirve para practicar de verdad y para asentar la base de los dos lenguajes.",
    storyP4: "davoker se apuntó con una frase: \u00abMe apunto, esta mierda me fascina\u00bb. Y así, casi sin querer, empezó una biblioteca.",
    fromVenezuela: "Venezuela",
    fromAlgeria: "Argelia",
    fromSpain: "España",
    teamNoteClassmate: "Compañero del curso",
    teamRosterEyebrow: "LA PLANTILLA",
    teamRosterTitle: "Quién lo mantiene",
    teamRosterNote: "Tres cuentas, una biblioteca.",
    roleFounder: "Fundador y desarrollador principal",
    roleCoreContributor: "Contribuidor del núcleo",
    roleMaintainer: "Mantenedor y diseñador",
    teamViewProfile: "Ver perfil ↗",
    donationsEyebrow: "DONACIONES",
    donationsTitle: "Apoya la biblioteca",
    donationsNote: "Cada demo se mantiene gratis y de código abierto.",
    donationsText: "Si esta biblioteca te ahorra tiempo, una pequeña aportación mantiene los demos actualizados, documentados y disponibles para todos.",
    donateNow: "Donar",
    donationsNetwork: "Red: BNB Smart Chain (BEP20)",
    switchToLight: "Cambiar al tema claro",
    switchToDark: "Cambiar al tema oscuro",
    switchTheme: "Cambiar tema",
    light: "Claro",
    dark: "Oscuro",
    heroTitleFirst: "Biblioteca",
    heroTitleSecond: "HTML y CSS",
    heroEyebrow: "Una demo, un archivo. Léelo y si te gusta es tuyo totalmente gratis.",
    heroDescription: "Explora los demos originales: cada uno trae su código fuente listo para copiar y adaptar. Componentes y efectos de interfaz en HTML y CSS, animaciones, navegación, formularios y estados de carga.",
    exploreComponents: "Explorar componentes",
    viewGitHub: "Ver en GitHub",
    librarySummary: "Resumen de la biblioteca",
    collectionIndex: "ÍNDICE DE LA COLECCIÓN",
    heroAsideLineOne: "Pequeñas piezas.",
    heroAsideLineTwo: "Detalles útiles.",
    experiments: "experimentos",
    categoriesLabel: "categorías",
    selectedComponents: "COMPONENTES DESTACADOS",
    featuredTitle: "Algunos para explorar",
    featuredNote: "Demos reales de la colección para empezar a explorar.",
    featuredPrev: "Retroceder",
    featuredNext: "Avanzar",
    collectionEyebrow: "LA COLECCIÓN",
    browseComponents: "Explorar componentes",
    libraryNote: "Busca detalles. Abre un demo. Hazlo tuyo.",
    searchPlaceholder: "Buscar botones, tarjetas, efectos...",
    searchLabel: "Buscar componentes",
    loadingCollection: "Cargando colección...",
    filterByCategory: "Filtrar por categoría",
    filterByAuthor: "Filtrar por autor",
    noComponents: "No se encontraron componentes",
    noComponentsHint: "Prueba otra búsqueda o elige una categoría diferente.",
    previousPage: "Página anterior",
    nextPage: "Página siguiente",
    goToPage: "Ir a la página {page}",
    pageOf: "Página {current} de {total}.",
    footerDonate: "Puedes donar USDT a través de BNB Smart Chain (BEP20)",
    footerDonateAddress: "0xa8f0230135b4f6a959358be3e8e8531f3551fa81",
    walletAddress: "Dirección de la cartera",
    copyWalletAddress: "Copiar la dirección de la cartera al portapapeles",
    footerBuilt: "Librería de código abierto, abierta a contribuciones.\nSi tiene una idea creativa de nuevo componente, HAS UNA PR.",
    component: "componente",
    components: "componentes",
    authorDavoker: "Diseños de davoker - {count}",
    authorFatmaerm: "Componente de fatmaerm - {count}",
    authorKindred: "Componente de kindred - {count}",
    defaultCount: "{count} componentes de kindred y fatma",
    davokerHint: "119 componentes más disponibles en el apartado de davoker.",
    searchOffPlaceholder: "Buscador desactivado en el apartado de davoker",
    viewComponent: "Ver componente",
    liveDemo: "Demo en vivo",
    copied: "¡Copiado!",
    copy: "Copiar",
    copiedToClipboard: "{label} copiado al portapapeles",
    clipboardUnavailable: "El portapapeles no está disponible en este navegador",
    noLocalSource: "No se encontró un archivo fuente local.",
    originalComponentPreview: "Componente original · vista previa interactiva",
    openOriginal: "Abrir demo original ↗",
    openInNewTab: "Abrir en otra pestaña ↗",
      livePreviewTitle: "Vista previa de {name}",
      sourceLabel: "Fuente",
      licenseLabel: "Licencia",
      licenseFileLabel: "Archivo de licencia",
    downloadZip: "Descargar ZIP",
    zipUnavailable: "ZIP no disponible",
    downloadZipTitle: "Descargar este componente y sus recursos locales",
    zipPermissionTitle: "Primero hay que verificar la fuente, el permiso de redistribución y la licencia del componente",
    preparingZip: "Preparando ZIP...",
    zipDownloaded: "ZIP del componente descargado",
    zipFailed: "No se pudo crear el ZIP: {message}",
    attributionRecorded: "Redistribución autorizada.",
    attributionPending: "Distribución no autorizada.",
    attributionText: "Fuente: {source}. Licencia: {license}.",
    attributionPendingText: "La descarga ZIP seguirá deshabilitada hasta verificar la fuente, el permiso de redistribución y la licencia de este componente.",
    missingFiles: "Este demo original hace referencia a archivos locales que faltan: {files}. La vista previa podría estar incompleta; no se modificaron los archivos fuente.",
    backToComponents: "← Volver a los componentes",
    sourceCode: "Código fuente",
    htmlSource: "HTML · index.html",
    javascriptSource: "JavaScript",
    inlineSource: "{label} · integrado {number}",
    localFileSource: "{label} · {name}",
    sourceLoadError: "No se pudieron cargar algunos archivos fuente. Abre el demo original para consultarlos. {message}",
    libraryTitle: "Biblioteca HTML y CSS",
    catalogUnavailable: "Catálogo no disponible",
    catalogLoadError: "No se pudo cargar el catálogo. Abre el sitio desde un servidor local y, si hace falta, vuelve a generarlo. {message}",
    themeNotSaved: "No se pudo guardar el tema en este navegador",
    languageNotSaved: "No se pudo guardar el idioma en este navegador",
    consentLabel: "Aviso de cookies",
    consentText: "Usamos Google Analytics para saber cuánta gente entra y qué páginas abre. Solo se carga si lo aceptas. Puedes cambiar de opinión desde el pie.",
    consentAccept: "Aceptar",
    consentReject: "Solo lo necesario",
    consentAccepted: "Gracias. Estadísticas activadas",
    consentRejected: "Estadísticas desactivadas. Puedes cambiarlo desde el pie",
    cookies: "Cookies",
    privacyLink: "Privacidad",
    legalLink: "Legal",
    privacyTitle: "Privacidad",
    privacyUpdated: "Última actualización: 2026-10-02",
    privacyIntro: "Qué recoge esta web y qué no. Es una biblioteca estática de demos de HTML y CSS: no hay cuentas, ni formularios de envío, ni pagos, ni publicidad, ni analítica cargada por defecto.",
    privacyTocLabel: "Índice",
    privacyTocTitle: "En esta página",
    privacyTocLocal: "Lo que se guarda en tu navegador",
    privacyTocAnalytics: "Google Analytics",
    privacyTocCookies: "Cookies",
    privacyTocThird: "Peticiones a otros dominios",
    privacyTocNone: "Datos que no se recogen",
    privacyTocHost: "Quién aloja la web",
    privacyTocContact: "Contacto",
    privacyLocalTitle: "Lo que se guarda en tu navegador",
    privacyLocalIntro: "La aplicación usa localStorage para tres cosas, todas locales a tu navegador y que no se envían a ningún servidor:",
    privacyColKey: "Clave",
    privacyColWhat: "Qué guarda",
    privacyColWhy: "Para qué",
    privacyRowTheme: "recordar el tema elegido",
    privacyRowLanguage: "recordar el idioma elegido",
    privacyRowConsentValue: "tu decisión sobre estadísticas",
    privacyRowConsentWhy: "si aceptaste o rechazaste Google Analytics",
    privacyLocalOutro: "Puedes borrarlas en cualquier momento desde la configuración de tu navegador, y la decisión sobre estadísticas también desde el botón Cookies del pie de cualquier página.",
    privacyAnalyticsTitle: "Google Analytics",
    privacyAnalyticsIntro: "Se usa para medir visitas y páginas abiertas, con el ID de medición G-3TRY9F4G0Z.",
    privacyAnalyticsWhen: "Cuándo: el script solo se carga si aceptas en el aviso. Sin aceptación no se hace ninguna petición a Google ni se crea ninguna cookie.",
    privacyAnalyticsWhere: "A dónde va: www.googletagmanager.com (carga del script) y www.google-analytics.com / region1.google-analytics.com (recogida).",
    privacyAnalyticsChange: "Cómo cambiar de opinión: el botón Cookies del pie, que rechaza y borra la clave, o borrar localStorage desde tu navegador.",
    privacyCookiesTitle: "Cookies",
    privacyCookiesText: "Este sitio no crea cookies propias. Las cookies de Google Analytics solo aparecen si aceptas las estadísticas.",
    privacyThirdTitle: "Peticiones a otros dominios",
    privacyThirdIntro: "Las fuentes tipográficas están en el repositorio, no en un CDN. Los únicos destinos externos son:",
    privacyNoneTitle: "Datos que no se recogen",
    privacyNoneText: "No hay registro de usuarios, no se envía el contenido de lo que escribes en el buscador, no hay redes publicitarias, no se compra ni se vende información personal y no se hace fingerprinting del dispositivo.",
    privacyHostTitle: "Quién aloja la web",
    privacyHostText: "La web es estática y se sirve desde Vercel (libreria-html-css.vercel.app), que registra las peticiones con fines de operación y seguridad conforme a su propia política. Este proyecto no tiene servidor propio ni base de datos.",
    privacyContactTitle: "Contacto",
    privacyContactText: "Dudas sobre privacidad: abre una incidencia en GitHub. Para avisos de seguridad, la vía privada es la que describe SECURITY.md.",
    privacyChanges: "Si esta política cambia, el hecho queda registrado en el CHANGELOG del repositorio y la fecha de arriba se actualiza en el mismo commit.",
    legalTitle: "Legal",
    legalUpdated: "Última actualización: 2026-10-06",
    legalTocLabel: "Índice",
    legalTocTitle: "En esta página",
    legalTocOwner: "Titularidad",
    legalTocLicenses: "Licencias",
    legalTocThirdParty: "Material de terceros",
    legalTocWarranty: "Sin garantía",
    legalTocA11y: "Accesibilidad",
    legalTocContact: "Contacto",
    legalOwnerTitle: "Titularidad",
    legalOwnerText: "Este sitio es un proyecto de código abierto publicado en GitHub. Los componentes tienen autoría propia: cada carpeta de demos declara su autor y su licencia en el propio repositorio.",
    legalLicensesTitle: "Licencias",
    legalColWhat: "Qué",
    legalColLicense: "Licencia",
    legalRowSite: "El sitio y sus scripts",
    legalRowMit: "MIT",
    legalRowDemos: "Los componentes descargables",
    legalRowEachOwn: "MIT, con su autor declarado en el ZIP",
    legalRowDavoker: "Los efectos de davoker",
    legalRowDavokerLicense: "MIT del autor de origen",
    legalLicenseNote: "Puedes copiar, modificar y usar los componentes en tus proyectos, incluso con fines comerciales. No hace falta pedir permiso ni atribuir más allá de lo que ya lleva cada ZIP.",
    legalThirdTitle: "Material de terceros",
    legalThirdText: "Algunas demos enlazan imágenes de Wikimedia Commons bajo sus licencias originales, y hay material citado en el fichero THIRD_PARTY_NOTICES.md del repositorio. El contenido retirado por no tener licencia declarada se lista en el README y no forma parte del catálogo.",
    legalWarrantyTitle: "Sin garantía",
    legalWarrantyText: "Los componentes se ofrecen tal cual, como experimentos de interfaz. Úsalos con criterio: son demostraciones de una técnica, no código de producción auditado.",
    legalA11yTitle: "Accesibilidad",
    legalA11yIntro: "Este sitio trabaja por alcanzar el nivel WCAG 2.2 AA. Concretamente:",
    legalA11yAuto: "Las comprobaciones automáticas (axe-core sobre las tres páginas, en los dos idiomas y los dos temas) no detectan violaciones serious ni critical.",
    legalA11yMotion: "Las animaciones respetan la preferencia prefers-reduced-motion del sistema.",
    legalA11yKeyboard: "Todo se puede usar sin ratón: hay enlace de salto al contenido, foco visible en todos los controles y los controles de idioma y tema son botones reales.",
    legalA11yZoom: "El contenido se lee correctamente con zoom al 200 %.",
    legalA11yPartial: "Todavía quedan avisos moderate y minor en curso de corrección, y la declaración se actualiza cuando ese recuento llegue a cero.",
    legalA11yReport: "Si encuentras una barrera que esta declaración no recoge, cuéntalo en GitHub Issues: se trata y se anota aquí.",
    legalContactTitle: "Contacto",
    legalContactText: "Cuestiones legales o de licencia: CONTRIBUTING.md o una incidencia en GitHub. Avisos de seguridad por la vía privada que describe SECURITY.md.",
  },
};

// Las claves de esta página guardan las dos traducciones juntas. Así el par
// EN/ES no se convierte en dos bloques idénticos para CPD ni puede desalinearse.
const howToTranslations = {
  pageHowTo: ["How to", "Cómo usar"],
  howToLink: ["How to", "Cómo usar"],
  howToMain: ["How to use a component", "Cómo usar un componente"],
  howToTitle: ["How to use a component", "Cómo usar un componente"],
  howToUpdated: ["No dependencies, no build step, no accounts.", "Sin dependencias, sin compilación, sin cuentas."],
  howToIntro: [
    "Every component in this library is a standalone file with its HTML, CSS and JavaScript. Copy it into your project and it works. There is nothing to install, no account to create and nothing to compile.",
    "Cada componente de esta biblioteca es un fichero independiente con su HTML, su CSS y su JavaScript. Se copia en tu proyecto y funciona. No hay que instalar nada, ni registrarte, ni pasar nada por un compilador.",
  ],
  howToTocLabel: ["Index", "Índice"],
  howToTocTitle: ["On this page", "En esta página"],
  howToTocChoose: ["Choose one", "Elegir uno"],
  howToTocSee: ["See it working", "Verlo funcionando"],
  howToTocCopy: ["Copy the code", "Copiar el código"],
  howToTocZip: ["Download the ZIP", "Descargar el ZIP"],
  howToTocLicense: ["License", "Licencia"],
  howToTocIssues: ["If something breaks", "Si algo falla"],
  howToChooseTitle: ["Choose one", "Elegir uno"],
  howToChooseText: [
    "Go to Components and search by name, category or description. You can also filter by author. There are 1018 components.",
    "Ve a Componentes y busca por nombre, categoría o descripción. También puedes filtrar por autor. Hay 1018 componentes.",
  ],
  howToChooseLink: ["Components", "Componentes"],
  howToSeeTitle: ["See it working", "Verlo funcionando"],
  howToSeeText: [
    "When you open a component you see it live in its own box. The preview is the real component loaded in an iframe, not a screenshot: what you see is what is there.",
    "Al abrir un componente, lo ves en vivo en su propia caja. La vista previa es el componente real cargado en un iframe, no una captura ni una maqueta: lo que ves es lo que hay.",
  ],
  howToCopyTitle: ["Copy the code", "Copiar el código"],
  howToCopyText: [
    "Under the preview you find the source code in separate blocks: HTML, CSS and JavaScript, each with its own copy button. Copy the block you need and paste it into your file.",
    "Bajo la vista previa tienes el código fuente, en bloques separados: HTML, CSS y JavaScript, cada uno con su botón de copia. Copia el bloque que necesites y pégalo en tu fichero.",
  ],
  howToCopyNote: [
    "Every component is standalone on purpose: it depends on nothing external, so you can take a single block without dragging the rest along.",
    "Cada componente es autónomo a propósito: no depende de nada externo, así que puedes llevarte un solo bloque sin arrastrar el resto.",
  ],
  howToZipTitle: ["Download the ZIP", "Descargar el ZIP"],
  howToZipText: [
    "If you would rather have the whole component in a folder, use the ZIP button. Inside you get:",
    "Si prefieres tener el componente entero en una carpeta, usa el botón ZIP. Dentro viene:",
  ],
  howToZipFiles: ["The component code.", "El código del componente."],
  howToZipLicense: ["Its LICENSE, with the authorship.", "Su LICENSE, con la autoría."],
  howToZipAttribution: [
    "An ATTRIBUTION.txt with the source and the terms of use.",
    "Un ATTRIBUTION.txt con la fuente y las condiciones de uso.",
  ],
  howToZipNote: [
    "The ZIP button only enables once the provenance and license of the material have been checked. If you see it greyed out, it is not verified yet and cannot be distributed.",
    "El botón ZIP se habilita solo cuando se ha comprobado la procedencia del material y su licencia. Si ves el botón en gris, es que todavía no está verificado y no se puede distribuir.",
  ],
  howToLicenseTitle: ["License", "Licencia"],
  howToLicenseText: [
    "Everything you download is MIT: you may use it, modify it and use it commercially, without asking permission. No attribution is needed beyond what the ZIP already carries.",
    "Todo lo que descargas es MIT: puedes usarlo, modificarlo y usarlo con fines comerciales, sin pedir permiso. No hace falta atribuir más allá de lo que ya lleva el propio ZIP.",
  ],
  howToIssuesTitle: ["If something breaks", "Si algo falla"],
  howToIssuesText: [
    "A component is a demonstration of a technique, not audited production code. If something does not work in your project, check first:",
    "Un componente es una demostración de una técnica, no código de producción auditado. Si algo no funciona en tu proyecto, mira primero:",
  ],
  howToIssuesCase: [
    "Are you opening the file over file://? Use a local server (npm run servidor from the repository root).",
    "¿Estás abriendo el fichero por file://? Usa un servidor local (npm run servidor en la raíz del repositorio).",
  ],
  howToIssuesFont: [
    "Is the font it uses still available? Components using the repository fonts work offline.",
    "¿La fuente que usa sigue disponible? Los componentes que usan tipografías del repositorio funcionan sin conexión.",
  ],
  howToIssuesReport: [
    "Still broken? Report it on GitHub with the component name.",
    "¿Sigue fallando? Cuéntalo en GitHub con el nombre del componente.",
  ],
};

for (const [key, [english, spanish]] of Object.entries(howToTranslations)) {
  translations.en[key] = english;
  translations.es[key] = spanish;
}

const state = {
  components: [],
  language: "en",
  category: "All",
  // null = ningun chip de autor marcado: se listan los de kindred-98 y los de
  // fatmaerm. Lo de davoker no entra aqui, vive aparte en su propio portal.
  author: null,
  query: "",
  currentPage: 1,
  featuredIndex: 0,
  featuredCount: 0,
  toastTimer: null,
};

const elements = {
  catalogView: document.querySelector("#catalog-view"),
  detailView: document.querySelector("#component-detail"),
  featuredGrid: document.querySelector("#featured-grid"),
  search: document.querySelector("#component-search"),
  filters: document.querySelector("#category-filters"),
  authorFilters: document.querySelector("#author-filters"),
  grid: document.querySelector("#component-grid"),
  davokerPortal: document.querySelector("#davoker-portal"),
  davokerFrame: document.querySelector("#davoker-frame"),
  resultsCount: document.querySelector("#results-count"),
  emptyState: document.querySelector("#empty-state"),
  pagination: document.querySelector("#pagination"),
  pagePrev: document.querySelector("#page-prev"),
  pageNext: document.querySelector("#page-next"),
  paginationPages: document.querySelector("#pagination-pages"),
  paginationStatus: document.querySelector("#pagination-status"),
  featuredCarousel: document.querySelector("#featured-carousel"),
  featuredPrev: document.querySelector("#featured-prev"),
  featuredNext: document.querySelector("#featured-next"),
  toast: document.querySelector("#toast"),
  themeToggle: document.querySelector("#theme-toggle"),
  languageButtons: [...document.querySelectorAll(".language-button")],
};

function t(key, values = {}) {
  const dictionary = translations[state.language] ?? translations.en;
  const template = dictionary[key] ?? translations.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function getCategoryLabel(category) {
  return translations[state.language]?.categories[category] ?? category;
}

function getAuthorLabel(author) {
  return translations[state.language]?.authors?.[author] ?? author;
}

// Maquina de escribir (CSS Typewriter Line). El original lleva el numero de
// caracteres y el ancho finales metidos a mano en el CSS (steps(26) y 26ch), asi
// que con otro texto se corta. Aqui los dos valores se miden del texto real, que
// cambia con el idioma y con la fuente que termine cargando.
const typewriterCycleMs = 20000;
const typewriterMsPerChar = 65;
let typewriterKeyframes = null;

function applyTypewriterMetrics() {
  const elements = [...document.querySelectorAll("[data-typewriter]")];
  if (!elements.length) return;
  const longest = Math.max(...elements.map((el) => [...el.textContent.trim()].length));
  if (!longest) return;

  // El keyframe no puede usar var() en sus topes, y el ciclo es fijo, asi que los
  // porcentajes se calculan aqui y se inyectan en una regla propia. El ciclo es
  // escribir, quedarse quieto, borrar y volver a empezar; escribir y borrar ocupan
  // el mismo tiempo, asi que la espera es lo que sobra del ciclo.
  if (!typewriterKeyframes) {
    typewriterKeyframes = document.createElement("style");
    // Ojo: este atributo no puede ser data-typewriter, o el propio <style> entra
    // en el querySelectorAll de arriba y se cuenta como un tecleo mas.
    typewriterKeyframes.dataset.generated = "typewriter-cycle";
    document.head.append(typewriterKeyframes);
  }
  const typeMs = Math.min(longest * typewriterMsPerChar, (typewriterCycleMs - 600) / 2);
  const holdMs = Math.max(400, typewriterCycleMs - 2 * typeMs - 200);
  const pct = (ms) => `${((ms / typewriterCycleMs) * 100).toFixed(2)}%`;
  typewriterKeyframes.textContent = `@keyframes type-cycle {
  0% { width: 0; }
  ${pct(typeMs)} { width: var(--type-width); }
  ${pct(typeMs + holdMs)} { width: var(--type-width); }
  ${pct(typeMs + holdMs + typeMs)} { width: 0; }
  100% { width: 0; }
}`;

  // Primero **todas** las escrituras y despues **todas** las lecturas. Leer
  // `scrollWidth` obliga al navegador a recalcular el layout de golpe, asi que
  // si se lee justo despues de escribir tres propiedades de estilo (que es lo
  // que hacia antes) se fuerza un recalculo por cada elemento y la pagina
  // entera se recalcula varias veces seguidas. Medido: eran 75 ms de CPU solo
  // aqui. Separar las fases lo deja en una sola pasada.
  const pendientes = [];
  for (const element of elements) {
    const chars = [...element.textContent.trim()].length;
    if (!chars) continue;
    element.style.setProperty("--type-chars", String(chars));
    element.style.setProperty("--type-cycle", `${typewriterCycleMs}ms`);
    pendientes.push(element);
  }
  for (const element of pendientes) {
    // +3px: el caret va como borde y el box-sizing es border-box.
    element.style.setProperty("--type-width", `${element.scrollWidth + 3}px`);
  }
}

// Reinicia la animacion: quitar y volver a poner la propiedad obliga al motor a
// recalcularla, porque si solo se cambia el texto se veria el cambio en seco.
// `forzarReflujo` lee una propiedad de geometria sin usarla. El navegador
// tiene que recalcular el layout al leerla, y eso es justo lo que dispara el
// reinicio de la animacion. Con `void` delante era lo mismo, pero `void`
// marca un uso inutilizado y Sonar lo senala (S3735); un helper con nombre
// documenta la intencion en el sitio donde se usa.
function forzarReflujo(elemento) {
  return elemento.offsetWidth;
}

function restartTypewriter() {
  for (const element of document.querySelectorAll("[data-typewriter]")) {
    element.style.animation = "none";
    forzarReflujo(element);
    element.style.removeProperty("animation");
  }
}

function getComponentDescription(component) {
  if (state.language === "en") return component.description;
  return component.descriptionEs || component.description;
}

// El nombre en espanol vive en el catalogo (nameEs, de names-es.json). Si no
// hay traduccion, el nombre original ya es español o es un nombre propio.
function getComponentName(component) {
  if (state.language === "en") return component.name;
  return component.nameEs || component.name;
}

// La cinta necesita texto real y, sobre todo, que se clone hasta tapar dos veces
// el ancho de la ventana: el bucle usa translateX(-50%), asi que si la mitad no
// llega a cubrir la pantalla aparece un hueco al final del recorrido.
function getMarqueeItems() {
  return state.language === "es"
    ? [
      "HTML + CSS sin dependencias",
      "Sin paso de compilación",
      "Lee el código original de cada demo",
      "Copia y adapta los patrones a tu proyecto",
      "Abierto a contribuciones PR",
    ]
    : [
      "Standalone HTML + CSS",
      "No build step",
      "Read the original source of every demo",
      "Copy and adapt the patterns into your project",
      "Open to PR contributions",
    ];
}

// Velocidad de la cinta en pixeles por segundo. El bucle es translateX(-50%), o
// sea que en cada ciclo recorre la MITAD del ancho del track, y el track ademas
// se clona segun el ancho de la pantalla. Por eso la duracion se calcula aqui en
// vez de fijarse en CSS: si no, en pantallas anchas correria mas rapido.
// Sube este numero para ir mas rapido, bajalo para ir mas lento.
const marqueeSpeed = 40;

function renderMarquee() {
  const track = document.querySelector(".skew-marquee-track");
  if (!track) return;
  const phrase = `${getMarqueeItems().join("  ·  ")}  ·`;
  // Se mide un item suelto para calcular cuantos hacen falta.
  const probe = createElement("span", "skew-marquee-item", phrase);
  track.replaceChildren(probe);
  const itemWidth = probe.getBoundingClientRect().width;
  if (!itemWidth) {
    track.replaceChildren();
    return;
  }
  const needed = Math.max(2, Math.ceil((window.innerWidth * 1.2) / itemWidth));
  const half = Array.from({ length: needed }, () => createElement("span", "skew-marquee-item", phrase));
  const secondHalf = half.map((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });
  track.replaceChildren(...half, ...secondHalf);
  const trackWidth = track.getBoundingClientRect().width;
  // -50% por ciclo: el recorrido real es la mitad del track.
  if (trackWidth) track.style.animationDuration = `${((trackWidth / 2) / marqueeSpeed).toFixed(1)}s`;
}

function initializeMarquee() {
    if (!document.querySelector(".skew-marquee")) return;
    renderMarquee();
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(renderMarquee, 180);
    });
}

function initializeCopyAddress() {
  for (const button of document.querySelectorAll("[data-copy-address]")) {
    // El icono va inyectado aqui y no en el HTML para no repetirlo en las tres
    // paginas. Traza con currentcolor, asi que hereda el color del boton.
    const icon = document.createElement("span");
    icon.className = "footer-address-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" '
      + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">'
      + '<rect x="8" y="8" width="14" height="14" rx="2" ry="2"/>'
      + '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
      + "</svg>";
    button.append(icon);

    button.addEventListener("click", async () => {
      // Se copia la direccion del diccionario y no la del HTML, para que siga
      // siendo la correcta despues de cambiar de idioma.
      try {
        await copyText(t("footerDonateAddress"));
        button.classList.add("is-copied");
        showToast(t("copiedToClipboard", { label: t("walletAddress") }));
        window.setTimeout(() => button.classList.remove("is-copied"), 1400);
      } catch {
        showToast(t("clipboardUnavailable"));
      }
    });
  }
}

function initializeDonationLink() {
  // El boton Donar no lleva a ninguna pagina externa: la "cuenta de donacion" es la
  // direccion de la cartera, asi que al pulsarlo se copia y se avisa con el toast.
  // preventDefault evita que el href="#" suba al principio con el ancla vacia.
  for (const link of document.querySelectorAll("[data-donation-link]")) {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await copyText(t("footerDonateAddress"));
        link.classList.add("is-copied");
        showToast(t("copiedToClipboard", { label: t("walletAddress") }));
        window.setTimeout(() => link.classList.remove("is-copied"), 1400);
      } catch {
        showToast(t("clipboardUnavailable"));
      }
    });
  }
}


function applyStaticTranslations() {
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }
  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }
  for (const element of document.querySelectorAll("[data-i18n-title]")) {
    element.title = t(element.dataset.i18nTitle);
  }
  document.documentElement.lang = state.language;
  if (elements.detailView?.hidden) updateLocalizedMetadata();
  for (const button of elements.languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
  }
  // El bucle de placeholders de arriba reescribe el del buscador, asi que el
  // aviso de "buscador apagado" se vuelve a aplicar aqui mismo.
  syncSearchAvailability();
  applyTypewriterMetrics();
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getCategories() {
  return [...new Set(state.components.map((component) => component.category))].sort((first, second) => first.localeCompare(second));
}

// Autores fijos: davoker, kindred-98 y fatmaerm salen siempre, aunque un autor
// llegue sin ningun demo en el catalogo. No hay chip de "todos los autores":
// ese papel lo hace el estado sin autor marcado (state.author = null).
const preferredAuthors = ["Davoker", "kindred-98", "fatmaerm"];

// Autor que queda fuera del listado general: el suyo solo se ve entrando en su
// apartado, que es su propia web embebida en la rejilla.
const defaultHiddenAuthor = "Davoker";

// Animacion propia de cada boton de autor (styles/site.css).
const authorButtonFx = {
  Davoker: "filter-button--liquid",
  "kindred-98": "filter-button--datamosh",
  fatmaerm: "filter-button--pulse",
};

// Cada autor pide su propia frase en el recuento, asi que cuando el filtro de
// autor esta activo no se usa "N componentes" sino esta etiqueta.
const authorSummaryKey = {
  Davoker: "authorDavoker",
  fatmaerm: "authorFatmaerm",
  "kindred-98": "authorKindred",
};

function getAuthors() {
  const present = new Set(state.components.map((component) => component.author).filter(Boolean));
  const extras = [...present]
    .filter((author) => !preferredAuthors.includes(author))
    .sort((first, second) => first.localeCompare(second));
  return [...preferredAuthors, ...extras];
}

function getFilteredComponents() {
  const query = normalizeText(state.query);
  return state.components.filter((component) => {
    const matchesCategory = state.category === "All" || component.category === state.category;
    // Sin autor marcado se listan todos menos los de davoker: su material no
    // tiene demo en vivo en la rejilla, se ve dentro de su portal.
    const matchesAuthor = state.author == null
      ? component.author !== defaultHiddenAuthor
      : component.author === state.author;
    const searchableText = normalizeText([
      component.name,
      component.nameEs,
      component.category,
      component.author,
      component.description,
      ...(component.tags ?? []),
    ].join(" "));
    return matchesCategory && matchesAuthor && (!query || searchableText.includes(query));
  });
}

function renderFilters() {
  if (!elements.filters) return;
  elements.filters.replaceChildren();
  for (const category of ["All", ...getCategories()]) {
    const button = createElement("button", "filter-button", getCategoryLabel(category));
    button.type = "button";
    button.setAttribute("aria-pressed", String(state.category === category));
    button.addEventListener("click", () => {
      state.category = category;
      // Cualquier categoria saca del apartado de davoker: su portal solo se ve
      // sin categoria activa, y al salir se vuelve al listado general.
      if (state.author === "Davoker") {
        state.author = null;
        syncSearchAvailability();
      }
state.currentPage = 1;
    renderFilters();
    renderAuthorFilters();
    renderComponents();
    // Que se filtra y por que: con esto se sabe que categorias miran la gente
    // y cuales se quedan vacias. El nombre de la categoria va tal cual (no es
    // dato personal, es un filtro de la propia interfaz).
    trackAnalyticsEvent("filtro_categoria", { categoria: category });
  });
    elements.filters.append(button);
  }
}

// Cada boton de autor lleva su animacion: davoker la de Liquid Fill Button,
// kindred-98 la de Datamosh Decode y fatmaerm la de Neutron Star Pulse.
function renderAuthorFilters() {
  if (!elements.authorFilters) return;
  elements.authorFilters.replaceChildren();
  for (const author of getAuthors()) {
    const fx = authorButtonFx[author];
    const button = createElement("button", fx ? `filter-button ${fx}` : "filter-button", getAuthorLabel(author));
    button.type = "button";
    button.setAttribute("aria-pressed", String(state.author === author));
    button.addEventListener("click", () => {
      // El chip ya marcado se desmarca y se vuelve al listado general.
      state.author = state.author === author ? null : author;
      // El apartado de davoker siempre empieza en "Todas": el resto de
      // categorias y el buscador quedan para salir de el.
      if (state.author === "Davoker") state.category = "All";
      state.currentPage = 1;
      syncSearchAvailability();
      renderFilters();
      renderAuthorFilters();
      renderComponents();
      // Entrar al apartado de davoker carga su portal entero (218 KB): es el
      // paso mas caro del sitio, asi que se mide aparte para saber si vale la
      // pena mantenerlo cargado de golpe.
      trackAnalyticsEvent("filtro_autor", { autor: state.author ?? "ninguno" });
    });
    elements.authorFilters.append(button);
  }
}

const previewObserver = typeof IntersectionObserver === "function"
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) mountQueuedPreview(entry.target);
      }
    }, { rootMargin: "400px 0px" })
  : null;

// Red de seguridad para el texto del overlay. El iframe ya no depende de este
// evento para verse (esta siempre en `opacity: 1`, lo oculta el `::after`
// opaco), asi que esto solo evita que se quede escrito el "Loading preview..."
// si en algun motor el `load` no llegara a saltar. El primer evento que llegue
// gana y cancela el temporizador.
const PREVIEW_FALLBACK_MS = 2500;

function armPreviewListeners(frame, preview) {
  let cerrado = false;
  const resolver = (estado) => {
    if (cerrado) return;
    cerrado = true;
    clearTimeout(fallback);
    preview.dataset.previewState = estado;
  };
  frame.addEventListener("load", () => resolver("ready"), { once: true });
  frame.addEventListener("error", () => resolver("error"), { once: true });
  const fallback = setTimeout(() => resolver("ready"), PREVIEW_FALLBACK_MS);
}

function mountQueuedPreview(container) {
  // Lo observado es la caja `.live-preview`. Si por lo que sea llegara la
  // tarjeta entera (que es su padre), se baja a la caja: montar el iframe en
  // el `<article>` lo pondria fuera de la caja de altura fija y romperia el
  // diseño de la tarjeta.
  const preview = container?.classList?.contains("live-preview")
    ? container
    : container?.querySelector?.(".live-preview");
  if (!preview) return;
  previewObserver?.unobserve(preview);
  if (preview.dataset.previewMounted === "true") return;
  montarPreview(preview);
}

function refreshQueuedPreviews() {
  if (!previewObserver) return;
  previewObserver.disconnect();
  // Ahora lo pendiente es la **caja** (`.live-preview`), no el iframe: el
  // iframe no existe todavia, se crea al montar. Antes se observaba
  // `frame.parentElement` porque el iframe ya estaba dentro de la caja; con el
  // iframe pendiente, observar su padre observaba el `<article>` entero y el
  // montaje se hacia en la tarjeta en vez de en la caja.
  const pending = document.querySelectorAll(
    ".live-preview[data-preview-state='loading']:not([data-preview-mounted])",
  );
  for (const preview of pending) previewObserver.observe(preview);
}

// Prepara una vista previa: el contenedor (con su alto fijo de 205 px en CSS)
// y, **dentro, el iframe**. El iframe se crea ahora, pero no se inserta hasta
// que la tarjeta se acerca a la pantalla.
//
// Por que no se inserta de inmediato: insertar 33 `<iframe>` de golpe (el
// carrusel de la portada) dispara un layout y un pintado completos que
// bloquean el hilo principal. Medido: son 137 ms de CPU, que es practicamente
// todo el TBT de la portada en movil. Crear los nodos no cuesta nada (3 ms);
// lo caro es meterlos en el DOM de una vez.
//
// Y no produce ningun salto: `.card-preview` tiene `height: 205px` fijo y el
// iframe es `height: 100%`, asi que la caja reserva el sitio desde el primer
// pintado y el CLS se queda en 0.
//
// Sin `IntersectionObserver` (navegadores antiguos) se inserta de inmediato,
// que es el comportamiento de siempre.
function createPreview(component, className) {
  const preview = createElement("div", className);
  preview.classList.add("live-preview");
  preview.dataset.previewState = "loading";
  const previewUrl = new URL(component.preview, document.baseURI);
  previewUrl.searchParams.set("previewRevision", previewRevision);
  preview.dataset.previewUrl = previewUrl.href;
  preview.dataset.previewName = getComponentName(component);

  if (previewObserver) {
    previewObserver.observe(preview);
  } else {
    // Sin `IntersectionObserver` no hay forma de saber cuando hay que montar
    // nada, asi que se monta ya: es exactamente el comportamiento de antes.
    montarPreview(preview);
  }
  return preview;
}

// Crea e inserta el iframe de una vista previa. Se llama al llegar la tarjeta
// a la zona de observacion.
function montarPreview(preview) {
  if (preview.dataset.previewMounted === "true") return;
  preview.dataset.previewMounted = "true";
  const frame = document.createElement("iframe");
  frame.title = t("livePreviewTitle", { name: preview.dataset.previewName ?? "" });
  // Sin `loading = "lazy"`: la carga perezosa la decide el `previewObserver`,
  // que ya sabe cuando toca, y poner las dos cosas anade una segunda
  // condicion de red sin ganar nada.
  frame.referrerPolicy = "no-referrer";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("sandbox", "allow-scripts allow-forms allow-popups");
  preview.append(frame);
  const url = preview.dataset.previewUrl;
  if (!url) return;
  // Los escuchas se arman **antes** de asignar el `src`: si la respuesta
  // llegara antes que el `load`, el estado se quedaria en "loading" para
  // siempre. El temporizador de seguridad sigue poniendo "ready" pase lo que
  // pase, para que la vista previa no se quede con el texto de "cargando".
armPreviewListeners(frame, preview);
  frame.src = url;
}

function componentDetailUrl(componentId) {
  return `./components.html?component=${encodeURIComponent(componentId)}`;
}

function navigateToComponent(component, event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.history.pushState({}, "", componentDetailUrl(component.id));
  renderRoute();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function createComponentCard(component, index) {
  const article = createElement("article", "component-card");
  // El `<article>` se queda como article: sin `role="link"`, que axe rechaza
  // (`aria-allowed-role`: un article no admite el rol de enlace) y ademas
  // duplicaba el punto de tabulacion, porque la tarjeta era tabbable Y dentro
  // tenia su propio `<a>`. El enlace real es el de "Ver componente": su
  // pseudo-elemento se estira sobre toda la tarjeta (`.card-link::after` en
  // site.css), asi que sigue siendo clicable entera, con el teclado resuelto
  // por el navegador y sin manejadores de Enter/Espacio a mano.
  article.append(createPreview(component, "card-preview"));

  const previewLabel = createElement("span", "card-preview-label", t("liveDemo"));
  article.querySelector(".card-preview").append(previewLabel);

  const content = createElement("div", "card-content");
  const top = createElement("div", "component-card-top");
  top.append(
    createElement("span", "component-category", getCategoryLabel(component.category)),
    createElement("span", "component-number", String(index + 1).padStart(3, "0")),
  );
  const heading = createElement("h3", "", getComponentName(component));
  const description = createElement("p", "", getComponentDescription(component));
  const link = createElement("a", "card-link", t("viewComponent"));
  link.href = componentDetailUrl(component.id);
  // El nombre accesible del enlace lleva el nombre del componente. Tiene que
  // *contener* el texto visible ("Ver componente") y no sustituirlo, que es lo
  // que pide la regla de "label in name": si el texto que se ve y el que se
  // anuncia no coinciden, quien usa lector de pantalla oye algo que no ve.
  link.setAttribute("aria-label", `${t("viewComponent")}: ${getComponentName(component)}`);
  // Sin esto el enlace recarga la pagina y al volver se pierde la pagina del
  // paginador en la que estabas. Con pushState el detalle se abre en el sitio y
  // el estado se conserva. Se deja el href para que el clic con el boton
  // central y "abrir en pestana nueva" sigan funcionando.
  link.addEventListener("click", (event) => {
    navigateToComponent(component, event);
  });
  const arrow = createElement("span", "", "→");
  arrow.setAttribute("aria-hidden", "true");
  link.append(arrow);
  content.append(top, heading, description, link);
  article.append(content);

  return article;
}

// Que numeros de pagina se dibujan. Con muchas paginas no caben todos los
// numeros en una linea, asi que se dejan los extremos, una ventana a cada lado
// de la actual y puntos suspensivos en los saltos.
const pageGap = "gap";
const pageGapLabel = "\u2026";

function getPageItems(totalPages, currentPage) {
  if (totalPages <= 1) return [1];
  const pages = new Set([1, totalPages, currentPage]);
  for (let offset = 1; offset <= pageWindow; offset += 1) {
    if (currentPage - offset > 1) pages.add(currentPage - offset);
    if (currentPage + offset < totalPages) pages.add(currentPage + offset);
  }
  const sorted = [...pages].sort((first, second) => first - second);
  const items = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) items.push(pageGap);
    items.push(page);
    previous = page;
  }
  return items;
}

function createPaginationButton(label, { isCurrent = false, isGap = false } = {}) {
  const item = createElement("li", "pagination-item");
  if (isGap) {
    const gap = createElement("span", "pagination-gap", label);
    gap.setAttribute("aria-hidden", "true");
    item.append(gap);
    return item;
  }
  const button = createElement("button", "pagination-page", label);
  button.type = "button";
  if (isCurrent) {
    button.setAttribute("aria-current", "page");
    button.classList.add("is-current");
  } else {
    button.setAttribute("aria-label", t("goToPage", { page: label }));
  }
  button.dataset.page = label;
  item.append(button);
  return item;
}

function renderPagination({ container, pagesList, status, previous, next, totalPages, currentPage, size }) {
  if (!container || !pagesList || !status) return;
  // Con una sola pagina no hay nada que recorrer: el paginador se oculta entero.
  if (totalPages <= 1) {
    container.hidden = true;
    pagesList.replaceChildren();
    status.textContent = "";
    return;
  }
  container.hidden = false;
  const items = getPageItems(totalPages, currentPage);
  pagesList.replaceChildren(
    ...items.map((item) => createPaginationButton(item === pageGap ? pageGapLabel : String(item), {
      isCurrent: item === currentPage,
      isGap: item === pageGap,
    })),
  );
  if (previous) previous.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= totalPages;
  status.textContent = t("pageOf", { current: currentPage, total: totalPages, size });
}

// Al cambiar de pagina la rejilla se repinta entera, asi que el scroll se
// devuelve a su principio: si no, al pulsar siguiente la vista se queda a media
// altura de la pagina anterior y no se ve que ha cambiado nada.
function scrollToGrid(grid) {
  if (!grid) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  grid.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}

// Mientras se esta en el apartado de davoker no hay nada que buscar en la
// rejilla: su material no se cataloga ahi. El buscador se apaga, se vacia y
// cambia el placeholder para que se note, y se enciende en cuanto se sale.
function syncSearchAvailability() {
  if (!elements.search) return;
  const off = state.author === "Davoker";
  if (off) {
    state.query = "";
    elements.search.value = "";
  }
  elements.search.disabled = off;
  elements.search.placeholder = t(off ? "searchOffPlaceholder" : "searchPlaceholder");
}

// El recuento del listado puede llevar una segunda linea de ayuda (el aviso de
// davoker), asi que se escribe con nodos y no con un textContent plano.
function setResultsCount(lines) {
  if (!elements.resultsCount) return;
  elements.resultsCount.replaceChildren();
  lines.forEach((line, index) => {
    if (index > 0) elements.resultsCount.append(document.createElement("br"));
    elements.resultsCount.append(document.createTextNode(line));
  });
}

function renderComponents() {
  if (!elements.grid) return;
  const filteredComponents = getFilteredComponents();
  // Con el autor davoker elegido la rejilla se sustituye por su portada
  // (davoker.html) dentro del mismo hueco: la cabecera, el buscador apagado y
  // los filtros siguen siendo nuestros. Al marcar una categoria, desmarcarlo o
  // elegir otro autor, vuelve la lista normal de tarjetas.
  const showDavokerPortal = state.author === "Davoker"
    && !state.query
    && Boolean(elements.davokerPortal && elements.davokerFrame);
  if (showDavokerPortal) {
    // El iframe se carga una sola vez, al primer acceso: asi no descarga sus
    // 218 KB mientras el visitante sigue en las tarjetas.
    if (!elements.davokerFrame.getAttribute("src")) {
      elements.davokerFrame.src = elements.davokerFrame.dataset.src;
    }
    elements.davokerPortal.hidden = false;
    elements.grid.hidden = true;
    elements.emptyState.hidden = true;
    elements.pagination.hidden = true;
    elements.resultsCount.textContent = t("authorDavoker", { count: filteredComponents.length });
    return;
  }
  if (elements.davokerPortal) elements.davokerPortal.hidden = true;
  elements.grid.hidden = false;
  const totalPages = Math.max(1, Math.ceil(filteredComponents.length / pageSize));
  // Si el filtro deja menos paginas que la actual, se recorta en vez de dejar
  // la rejilla vacia.
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const start = (state.currentPage - 1) * pageSize;
  const visibleComponents = filteredComponents.slice(start, start + pageSize);
  elements.grid.replaceChildren(...visibleComponents.map((component, index) => createComponentCard(component, start + index)));
  const count = filteredComponents.length;
  const countLabel = count === 1 ? t("component") : t("components");
  if (state.author == null) {
    // Listado general: lo nuestro y lo de fatmaerm, con el aviso de davoker
    // debajo para que se sepa que sus demos estan en su propio apartado.
    setResultsCount([t("defaultCount", { count }), t("davokerHint")]);
  } else {
    const summaryKey = authorSummaryKey[state.author];
    setResultsCount([summaryKey ? t(summaryKey, { count }) : `${count} ${countLabel}`]);
  }
  elements.emptyState.hidden = filteredComponents.length > 0;
  renderPagination({
    container: elements.pagination,
    pagesList: elements.paginationPages,
    status: elements.paginationStatus,
    previous: elements.pagePrev,
    next: elements.pageNext,
    totalPages,
    currentPage: state.currentPage,
    size: pageSize,
  });
  refreshQueuedPreviews();
}

function getFeaturedComponents() {
  // El orden de los destacados lo fija featuredOrder en component-overrides.json:
  // es el unico sitio desde el que se reordenan. Sin numero (o con uno repetido)
  // se desempata por nombre para que la fila no cambie entre visitas.
  return state.components
    .filter((component) => component.featured)
    .sort(
      (first, second) =>
        (first.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (second.featuredOrder ?? Number.MAX_SAFE_INTEGER)
        || getComponentName(first).localeCompare(getComponentName(second)),
    );
}

// Cuantas tarjetas caben en la fila: lo decide --featured-visible en site.css,
// que bajan las media queries.
function getFeaturedVisible() {
  if (!elements.featuredGrid) return featuredClones;
  const value = Number.parseFloat(getComputedStyle(elements.featuredGrid).getPropertyValue("--featured-visible"));
  return Number.isFinite(value) && value > 0 ? value : featuredClones;
}

// Mueve el track hasta la tarjeta numero index. Sin animacion el cambio es
// inmediato y se fuerza un reflow: si no, el navegador funde el salto con el
// movimiento siguiente en una sola transicion larga.
function positionFeatured(index, animate) {
  const track = elements.featuredGrid;
  const card = track?.firstElementChild;
  if (!card) return;
  state.featuredIndex = index;
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = card.getBoundingClientRect().width + gap;
  track.style.transition = animate ? `transform ${featuredTransitionMs}ms ease` : "none";
  track.style.transform = `translateX(${-index * step}px)`;
  if (!animate) forzarReflujo(track);
}

function stopFeaturedCarousel() {
  if (featuredTimer !== null) {
    window.clearInterval(featuredTimer);
    featuredTimer = null;
  }
}

function startFeaturedCarousel() {
  stopFeaturedCarousel();
  if (reducedMotion.matches) return;
  if (!elements.featuredGrid?.firstElementChild) return;
  if (state.featuredCount <= getFeaturedVisible()) return;
  featuredTimer = window.setInterval(() => stepFeatured(1), featuredStepMs);
}

// Las tarjetas repetidas solo se muestran si la fila de verdad se mueve: si
// caben todas (pantallas estrechas con pocos destacados) estarian duplicadas.
function syncFeaturedState() {
  const moving = state.featuredCount > getFeaturedVisible();
  for (const card of elements.featuredGrid?.children ?? []) {
    if (card.dataset.featuredClone) card.hidden = !moving;
  }
  if (moving) startFeaturedCarousel();
  else stopFeaturedCarousel();
}

function stepFeatured(delta) {
  if (!elements.featuredGrid?.firstElementChild) return;
  if (state.featuredCount <= getFeaturedVisible()) return;
  // La ultima posicion del track es la de las repetidas, que se ve igual que la
  // primera: sirve de puente para dar la vuelta en los dos sentidos.
  const maxIndex = state.featuredCount;
  let target = state.featuredIndex + delta;
  if (target > maxIndex) {
    positionFeatured(0, false);
    target = 1;
  } else if (target < 0) {
    positionFeatured(maxIndex, false);
    target = maxIndex - 1;
  }
  positionFeatured(target, true);
}

function renderFeaturedComponents() {
  if (!elements.featuredGrid) return;
  stopFeaturedCarousel();
  const featuredComponents = getFeaturedComponents();
  state.featuredCount = featuredComponents.length;
  state.featuredIndex = 0;
  const section = elements.featuredGrid.closest(".featured-section");
  if (section) section.hidden = featuredComponents.length === 0;
  if (!featuredComponents.length) {
    elements.featuredGrid.replaceChildren();
    return;
  }
  const cards = featuredComponents.map((component, index) => createComponentCard(component, index));
// Las repetidas se construyen enteras, no con cloneNode: cloneNode no copia
// los manejadores del enlace y el clic recargaria la pagina.
const clones = featuredComponents.slice(0, featuredClones).map((component, index) => {
    const card = createComponentCard(component, index);
    card.dataset.featuredClone = "true";
    // Las repetidas son, por definicion, un duplicado de tarjetas que ya estan
    // mas adelante en el DOM. Para quien va con lector de pantalla son ruido: se
    // oye el mismo componente dos veces al recorrer la portada, y ademas sus
    // encabezados rompen la jerarquia (varias h3 seguidas sin h2 que las
    // enclose). Se esconden de la tecnologia asistiva con `inert`, que en una
    // sola linea hace las dos cosas que hacen falta: marca el subarbol como no
    // anunciado (`aria-hidden` implicito) **y** saca sus enlaces del recorrido
    // del teclado. Con `aria-hidden` a secas, axe marcaria `aria-hidden-focus`,
    // porque un contenedor oculto que contiene algo enfocable es un fallo.
    // Se pueden seguir viendo y clicando con el raton.
    card.inert = true;
    return card;
  });
  elements.featuredGrid.replaceChildren(...cards, ...clones);
  positionFeatured(0, false);
  syncFeaturedState();
  refreshQueuedPreviews();
}

function createCodeBlock(label, code) {
  const block = createElement("section", "code-block");
  const header = createElement("div", "code-block-header");
  const title = createElement("span", "code-label", label);
  const copyButton = createElement("button", "copy-button", t("copy"));
  copyButton.type = "button";
  copyButton.addEventListener("click", async () => {
    try {
      await copyText(code);
      copyButton.textContent = t("copied");
      showToast(t("copiedToClipboard", { label }));
      window.setTimeout(() => {
        copyButton.textContent = t("copy");
      }, 1400);
    } catch {
      showToast(t("clipboardUnavailable"));
    }
  });
  header.append(title, copyButton);
  const pre = document.createElement("pre");
  const codeElement = document.createElement("code");
  codeElement.textContent = code || t("noLocalSource");
  pre.append(codeElement);
  block.append(header, pre);
  return block;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Sin permiso o sin foco: se intenta el respaldo de abajo.
    }
  }
  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  const copied = document.execCommand("copy");
  helper.remove();
  if (!copied) throw new Error("Clipboard access is unavailable");
}

async function loadSourceFiles(files) {
  return Promise.all(files.map(async (file) => {
    if (typeof file.code === "string") return { name: file.name, code: file.code };
    const response = await fetch(new URL(file.path, document.baseURI));
    if (!response.ok) throw new Error(`Could not load ${file.name}`);
    return { name: file.name, code: await response.text() };
  }));
}

function appendSourceGroup(container, heading, files, inlineBlocks = []) {
  container.append(createElement("h3", "visually-hidden", heading));
  let blockIndex = 0;
  for (const file of files) {
    container.append(createCodeBlock(t("localFileSource", { label: heading, name: file.name }), file.code));
    blockIndex += 1;
  }
  for (const [index, code] of inlineBlocks.entries()) {
    container.append(createCodeBlock(t("inlineSource", { label: heading, number: index + 1 }), code));
    blockIndex += 1;
  }
  if (blockIndex === 0) {
    container.append(createCodeBlock(heading, t("noLocalSource")));
  }
}

function loadFullCatalogScript() {
  return new Promise((resolve, reject) => {
    if (Array.isArray(window.COMPONENT_CATALOG)) {
      resolve(window.COMPONENT_CATALOG);
      return;
    }
    const script = document.createElement("script");
    script.src = fullCatalogPath;
    script.addEventListener("load", () => resolve(window.COMPONENT_CATALOG), { once: true });
    script.addEventListener("error", () => reject(new Error(`Could not load ${fullCatalogPath}`)), { once: true });
    document.head.append(script);
  });
}

async function loadCatalog() {
  if (window.location.protocol === "file:") {
    const fullCatalog = await loadFullCatalogScript();
    if (!Array.isArray(fullCatalog)) throw new Error("The full catalog is unavailable.");
    return fullCatalog;
  }

  try {
    const response = await fetch(catalogPath);
    if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
    return await response.json();
  } catch (error) {
    const fallback = await loadFullCatalogScript().catch(() => null);
    if (Array.isArray(fallback)) return fallback;
    throw error;
  }
}

async function ensureComponentSource(component) {
  if (typeof component.html === "string") return component;
  const response = await fetch(
    new URL(`./data/sources/${encodeURIComponent(component.id)}.json`, document.baseURI),
  );
  if (!response.ok) throw new Error(`Source request failed (${response.status})`);
  Object.assign(component, await response.json());
  return component;
}

async function downloadComponentZip(component) {
  await ensureComponentSource(component);
  const files = await Promise.all(component.files.map(async (file) => {
    const response = await fetch(new URL(file.path, document.baseURI));
    if (!response.ok) throw new Error(`Could not load ${file.name}`);
    return {
      name: file.archivePath,
      bytes: new Uint8Array(await response.arrayBuffer()),
    };
  }));
  const attribution = [
    `${t("sourceLabel")}: ${component.source}`,
    `${t("licenseLabel")}: ${component.license}`,
    `${t("licenseFileLabel")}: ${component.licenseFile}`,
  ];
  // C-4: el credito de autoria viaja dentro del ZIP. No se inventa un autor:
  // se lee la linea de copyright del LICENSE que ya forma parte del paquete,
  // y si no la trae no se anade nada. Tiene que calzar con lo que genera
  // build-zips.mjs para los 119 de davoker (los dos caminos de descarga).
  const licenseFile = files.find((file) => file.name === component.licenseFile
    || file.name.endsWith(`/${component.licenseFile}`));
  if (licenseFile) {
    // `[ \t]*` y no `\s*`: con la bandera `m`, `\s` puede atravesar saltos
    // de linea antes de encontrar `copyright`, lo que provoca backtracking
    // superlineal sobre el texto entero de la licencia (S8786). Solo queremos
    // el espacio horizontal al principio de la linea; los saltos entre lineas
    // los recorre `m` por si mismos.
    const copyright = /^[ \t]*(copyright[^\r\n]*)$/im.exec(
      new TextDecoder().decode(licenseFile.bytes),
    );
    if (copyright) attribution.push(copyright[1].trim());
  }
  files.push({
    name: `${component.id}/ATTRIBUTION.txt`,
    bytes: new TextEncoder().encode(`${attribution.join("\n")}\n`),
  });

  const archive = await window.createZip(files);
  const archiveUrl = URL.createObjectURL(archive);
  const downloadLink = createElement("a");
  downloadLink.href = archiveUrl;
  downloadLink.download = `${component.id}.zip`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(archiveUrl), 1000);
}

// El índice del catálogo ya no trae `folder` (viaja en sources/<id>.json para
// aligerar la descarga), pero la ruta de la preview lo lleva dentro: de ahí se
// reconstruye sin volver a pedir nada.
function componentFolder(component) {
  if (component.folder) return component.folder;
  const prefix = `../${component.root}/`;
  const preview = component.preview ?? "";
  return preview.startsWith(prefix)
    ? preview.slice(prefix.length).replace(/\/index\.html$/, "")
    : preview;
}

function createDetailHeading(component) {
  const heading = createElement("div", "detail-heading");
  const copy = createElement("div");
  copy.append(
    createElement("p", "detail-kicker", `${getCategoryLabel(component.category)} / ${componentFolder(component)}`),
    createElement("h1", "", getComponentName(component)),
    createElement("p", "detail-description", getComponentDescription(component)),
  );
  const actions = createElement("div", "detail-actions");
  const originalLink = createElement("a", "button button-secondary", t("openOriginal"));
  const originalUrl = new URL(component.preview, document.baseURI);
  originalUrl.searchParams.set("previewRevision", previewRevision);
  originalLink.href = originalUrl.href;
  originalLink.target = "_blank";
  originalLink.rel = "noreferrer";
  const zipButton = createElement("button", "button button-secondary download-button", component.downloadable ? t("downloadZip") : t("zipUnavailable"));
  zipButton.type = "button";
  zipButton.disabled = !component.downloadable;
  zipButton.title = component.downloadable
    ? t("downloadZipTitle")
    : t("zipPermissionTitle");
  zipButton.setAttribute("aria-label", zipButton.title);
  if (component.downloadable) {
    zipButton.addEventListener("click", async () => {
      zipButton.disabled = true;
      zipButton.textContent = t("preparingZip");
      try {
        await downloadComponentZip(component);
        showToast(t("zipDownloaded"));
        // Evento del embudo: sin esto no se sabe si la biblioteca se usa o solo
        // se mira. Es la accion de valor del sitio (descargar un componente).
        trackAnalyticsEvent("descarga_zip", {
          id: component.id,
          categoria: component.category,
          autor: component.author,
        });
      } catch (error) {
        showToast(t("zipFailed", { message: error.message }));
      } finally {
        zipButton.disabled = false;
        zipButton.textContent = t("downloadZip");
      }
    });
  }
  actions.append(originalLink, zipButton);
  heading.append(copy, actions);
  return heading;
}

function createProvenanceNote(component) {
  const isVerified = component.downloadable === true;
  const note = createElement("p", "provenance-note");
  note.append(createElement("strong", "", isVerified ? t("attributionRecorded") : t("attributionPending")));
  if (isVerified) {
    note.append(document.createTextNode(` ${t("attributionText", { source: component.source, license: component.license })}`));
    return note;
  }
  if (component.source && component.source !== "Unverified") {
    note.append(document.createElement("br"));
    note.append(document.createTextNode(`${t("sourceLabel")}: ${component.source}`));
  }
  if (component.license && component.license !== "Unverified") {
    note.append(document.createElement("br"));
    note.append(document.createTextNode(`${t("licenseLabel")}: ${component.license}`));
  }
  note.append(document.createElement("br"));
  note.append(document.createTextNode(t("attributionPendingText")));
  return note;
}

function createMissingReferencesNote(component) {
  const missingReferences = component.missingReferences ?? [];
  if (!missingReferences.length) return null;
  const references = missingReferences.join(", ");
  return createElement(
    "p",
    "error-message",
    t("missingFiles", { files: references }),
  );
}

const siteOrigin = "https://libreria-html-css.vercel.app";
const componentsPath = "/Web/components.html";
// Cada pagina declara su propia canonical, asi que esa es la ruta de la pagina actual.
const sitePath = new URL(
  document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? document.baseURI,
  document.baseURI,
).pathname;
const defaultMetadata = {
  description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
  image: `${siteOrigin}/Web/og-image.jpg`,
};

function setMetaContent(selector, content) {
  const element = document.querySelector(selector);
  if (element && content) element.setAttribute("content", content);
}

function updateDocumentMetadata({ title, description, url, robots = "index, follow" }) {
  if (title) document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[name="robots"]', robots);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', url);
  setMetaContent('meta[property="og:image"]', defaultMetadata.image);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  setMetaContent('meta[name="twitter:image"]', defaultMetadata.image);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", url);
}

function updateLocalizedMetadata() {
  updateDocumentMetadata({
    title: document.body.dataset.pageTitle
      ? `${t(document.body.dataset.pageTitle)} · ${t("libraryTitle")}`
      : t("libraryTitle"),
    description: t("heroDescription"),
    url: `${siteOrigin}${sitePath}`,
  });
}

async function renderDetail(component) {
  elements.catalogView.hidden = true;
  elements.detailView.hidden = false;
  elements.detailView.replaceChildren();
  updateDocumentMetadata({
    title: `${getComponentName(component)} · ${t("libraryTitle")}`,
    description: getComponentDescription(component),
    url: `${siteOrigin}${componentsPath}?component=${encodeURIComponent(component.id)}`,
    robots: "noindex, follow",
  });
  trackAnalyticsEvent("ver_componente", { id: component.id, categoria: component.category });

  // El detalle vive en components.html; si se abre desde otra pagina, "volver"
  // tiene que llevar ahi en vez de a un ancla que no existe.
  const backLink = createElement("a", "detail-back", t("backToComponents"));
  if (elements.catalogView.querySelector("#components")) {
    backLink.href = "#components";
    backLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.pushState({}, "", `${window.location.pathname}#components`);
      renderRoute();
      document.querySelector("#components")?.scrollIntoView({ behavior: "smooth" });
    });
  } else {
    backLink.href = "./components.html";
  }

  const previewPanel = createElement("section", "preview-panel");
  const previewHeader = createElement("div", "preview-panel-header");
  previewHeader.append(
    createElement("span", "", t("originalComponentPreview")),
  );
  const previewLink = createElement("a", "preview-open-link", t("openInNewTab"));
  const previewUrl = new URL(component.preview, document.baseURI);
  previewUrl.searchParams.set("previewRevision", previewRevision);
  previewLink.href = previewUrl.href;
  previewLink.target = "_blank";
  previewLink.rel = "noreferrer";
  previewHeader.append(previewLink);
  previewPanel.append(previewHeader, createPreview(component, ""));

  elements.detailView.append(backLink, createDetailHeading(component));
  const missingReferencesNote = createMissingReferencesNote(component);
  if (missingReferencesNote) elements.detailView.append(missingReferencesNote);
  elements.detailView.append(previewPanel);
  refreshQueuedPreviews();

  let sourceError = null;
  try {
    await ensureComponentSource(component);
  } catch (error) {
    sourceError = error;
  }

  const sourceSection = createElement("section", "source-section");
  sourceSection.append(createElement("h2", "", t("sourceCode")));
  if (sourceError) {
    sourceSection.append(createElement("p", "error-message", t("sourceLoadError", { message: sourceError.message })));
  }
  sourceSection.append(createCodeBlock(t("htmlSource"), component.html));
  elements.detailView.append(sourceSection, createProvenanceNote(component));

  try {
    const [stylesheets, scripts] = await Promise.all([
      loadSourceFiles(component.stylesheets ?? []),
      loadSourceFiles(component.scripts ?? []),
    ]);
    appendSourceGroup(sourceSection, "CSS", stylesheets, component.inlineCss ?? []);
    if (scripts.length || component.inlineJavaScript?.length) {
      appendSourceGroup(sourceSection, t("javascriptSource"), scripts, component.inlineJavaScript ?? []);
    }
  } catch (error) {
    const message = createElement("p", "error-message", t("sourceLoadError", { message: error.message }));
    sourceSection.append(message);
  }
}

function renderRoute() {
  const componentId = new URLSearchParams(window.location.search).get("component");
  const component = state.components.find((entry) => entry.id === componentId);
  if (component) {
    renderDetail(component).catch((error) => {
      showToast(t("sourceLoadError", { message: error.message }));
    });
    return;
  }

  if (elements.detailView) elements.detailView.hidden = true;
  elements.catalogView.hidden = false;
  updateLocalizedMetadata();
  renderComponents();
}

function updateThemeControls() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  elements.themeToggle.setAttribute("aria-label", t(nextTheme === "light" ? "switchToLight" : "switchToDark"));
  elements.themeToggle.title = t("switchTheme");
  elements.themeToggle.querySelector(".theme-label").textContent = t(nextTheme);
  elements.themeToggle.querySelector(".theme-icon").textContent = nextTheme === "light" ? "☼" : "◐";
}

function applyLanguage(language, rerender = true) {
  const changed = language === "es" ? "es" : "en";
  const isNewLanguage = changed !== state.language;
  state.language = changed;
  applyStaticTranslations();
  updateThemeControls();
  try {
    localStorage.setItem("component-field-language", state.language);
  } catch {
    if (rerender) showToast(t("languageNotSaved"));
  }
  if (isNewLanguage) restartTypewriter();
  if (rerender && state.components.length > 0) {
    renderMarquee();
    renderFeaturedComponents();
    renderFilters();
    renderAuthorFilters();
    renderRoute();
  }
}

function initializeLanguage() {
  // Por defecto espanol: es el idioma del proyecto. Quien quiera ingles lo cambia
  // con el boton de idioma y la eleccion queda guardada en localStorage.
  let savedLanguage = "es";
  try {
    savedLanguage = localStorage.getItem("component-field-language") ?? "es";
  } catch {
    savedLanguage = "es";
  }
  applyLanguage(savedLanguage, false);
  for (const button of elements.languageButtons) {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.language);
      trackAnalyticsEvent("cambio_idioma", { idioma: button.dataset.language });
    });
  }
}

// --- Google Analytics ------------------------------------------------------
// Nada de esto se ejecuta hasta que hay un ID de medicion real y alguien ha
// aceptado: el banner pregunta primero y el script de gtag se pide despues, de
// modo que sin aceptacion no sale ni una peticion a Google ni una cookie.

function readAnalyticsConsent() {
  try {
    return localStorage.getItem(consentStorageKey);
  } catch {
    return null;
  }
}

function writeAnalyticsConsent(decision) {
  try {
    localStorage.setItem(consentStorageKey, decision);
  } catch {
    // Sin localStorage la eleccion no se recuerda, pero la pagina actual ya
    // abide por ella: es mejor que bloquear la decision.
  }
}

function hasAnalyticsId() {
  // Un ID de medicion de GA4 son las letras G, un guion y de cuatro a diez
  // caracteres en mayusculas y digitos. El valor de ejemplo ("PENDIENTE", sin
  // la G) no lo cumple, asi que con el no se pide el script ni se pone ninguna
  // cookie. Se exige mayusculas porque los IDs que emite Google las traen.
  return /^G-[A-Z0-9]{4,10}$/.test(analyticsId);
}

// En local no se manda nada a Google: cada recarga desde localhost contaria
// como una visita real y ensuciaria las estadisticas. En produccion el
// hostname es el dominio de Vercel, asi que la pregunta solo corta cuando la
// web se abre en el servidor del propio repositorio.
function isLocalPreview() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function loadAnalytics() {
  // El ID de ejemplo y las pruebas en local se quedan fuera a proposito: sin
  // esto, revisar la web en localhost seria contar visitas falsas.
  if (!hasAnalyticsId() || isLocalPreview() || typeof window.gtag === "function") return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${analyticsEndpoints.tag}?id=${encodeURIComponent(analyticsId)}`;
  document.head.append(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // anonymize_ip trunca la IP antes de guardarla. La web no publica datos
  // publicitarios: eso se declara aqui en vez de en la configuracion de GA.
  window.gtag("config", analyticsId, { anonymize_ip: true });
}

function trackAnalyticsEvent(name, parameters) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, parameters ?? {});
}

function openConsentBanner() {
  const banner = createElement("div", "consent-banner");
  banner.dataset.consentBanner = "";
  banner.dataset.i18nAriaLabel = "consentLabel";
  banner.setAttribute("role", "region");

  const text = createElement("p", "consent-text");
  text.dataset.i18n = "consentText";
  const actions = createElement("div", "consent-actions");
  const reject = createElement("button", "button button-secondary");
  reject.type = "button";
  reject.dataset.consent = "deny";
  reject.dataset.i18n = "consentReject";
  // Acepta lleva button-primary y no .button a secas: .button no fija
  // background, asi que el navegador pone el gris por defecto de los controles
  // (rgb(107, 107, 107)) sobre el --surface-raised del aviso, y eso da
  // 2,21:1 con el texto heredado. El primario usa --accent sobre --accent-ink,
  // que pasa AA en los dos temas.
  const accept = createElement("button", "button button-primary");
  accept.type = "button";
  accept.dataset.consent = "grant";
  accept.dataset.i18n = "consentAccept";
  actions.append(reject, accept);
  banner.append(text, actions);
  document.body.append(banner);

  for (const button of banner.querySelectorAll("[data-consent]")) {
    button.addEventListener("click", () => {
      const decision = button.dataset.consent === "grant" ? "grant" : "deny";
      writeAnalyticsConsent(decision);
      banner.remove();
      if (decision === "grant") {
        loadAnalytics();
        showToast(t("consentAccepted"));
      } else {
        showToast(t("consentRejected"));
      }
    });
  }
  // El banner se pinta ya traducido: los textos se rellenan con el idioma
  // activo en vez de esperar al siguiente applyLanguage.
  applyStaticTranslations();
  return banner;
}

function initializeAnalytics() {
  const decision = readAnalyticsConsent();
  if (decision === "grant") {
    loadAnalytics();
  } else if (decision !== "deny") {
    // Sin respuesta todavia: se pregunta. Un "deny" no vuelve a preguntar.
    openConsentBanner();
  }
  // El boton del pie reabre el aviso para poder cambiar de idea, que es lo que
  // pide el consentimiento: se puede retirar cuando se quiera.
  for (const button of document.querySelectorAll("[data-cookie-preferences]")) {
    button.addEventListener("click", () => {
      try {
        localStorage.removeItem(consentStorageKey);
      } catch {
        // da igual: el banner se abre igualmente.
      }
      openConsentBanner();
    });
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  updateThemeControls();
  try {
    localStorage.setItem("component-field-theme", theme);
  } catch {
    showToast(t("themeNotSaved"));
  }
}

function initializeTheme() {
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("component-field-theme") ?? "dark";
  } catch {
    savedTheme = "dark";
  }
  applyTheme(savedTheme === "light" ? "light" : "dark");
  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function initializeNavigation() {
  // El menu ya no usa anclas: cada entrada lleva a otra pagina (./components.html,
  // ./team-core.html), asi que no hace falta interceptar clics. Lo que si hace
  // falta es popstate, porque el enlace "volver" del detalle hace pushState y al
  // pulsar atras hay que volver a pintar el catalogo.
  window.addEventListener("popstate", renderRoute);
  window.addEventListener("hashchange", () => {
    if (!new URLSearchParams(window.location.search).has("component")) renderRoute();
  });
}

// El scroll se hace al cambiar de pagina, no al pinchar el numero: asi el
// contacto con la flecha del teclado no mueve la pagina debajo del dedo.
function goToPage(page, grid) {
  const totalPages = Math.max(1, Math.ceil(getFilteredComponents().length / pageSize));
  const target = Math.min(Math.max(page, 1), totalPages);
  if (target === state.currentPage) return;
  state.currentPage = target;
  renderComponents();
  scrollToGrid(grid);
}

function initializePagination() {
  elements.pagePrev?.addEventListener("click", () => goToPage(state.currentPage - 1, elements.grid));
  elements.pageNext?.addEventListener("click", () => goToPage(state.currentPage + 1, elements.grid));
  elements.paginationPages?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (button) goToPage(Number(button.dataset.page), elements.grid);
  });
}

// El carrusel de destacados: se para al interactuar y se vuelve a lanzar al
// soltar, y las flechas avanzan o retroceden una tarjeta.
function initializeFeaturedCarousel() {
  if (!elements.featuredCarousel) return;
  for (const type of ["pointerenter", "focusin"]) {
    elements.featuredCarousel.addEventListener(type, stopFeaturedCarousel);
  }
  elements.featuredCarousel.addEventListener("pointerleave", startFeaturedCarousel);
  elements.featuredCarousel.addEventListener("focusout", (event) => {
    if (!elements.featuredCarousel.contains(event.relatedTarget)) startFeaturedCarousel();
  });
  elements.featuredPrev?.addEventListener("click", () => stepFeatured(-1));
  elements.featuredNext?.addEventListener("click", () => stepFeatured(1));

  reducedMotion.addEventListener?.("change", syncFeaturedState);

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!elements.featuredGrid?.firstElementChild) return;
      positionFeatured(Math.min(state.featuredIndex, state.featuredCount), false);
      syncFeaturedState();
    }, 150);
  });
}

function initializeSearch() {
  if (!elements.search) return;
  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    state.currentPage = 1;
    renderComponents();
    // El primer paso del embudo: se busca algo. Se manda **la longitud** de la
    // busqueda y no el texto: el texto es lo que la persona escribe y puede ser
    // cualquier cosa, mandarlo seria espiar sin aviso ni una palabra util.
    // Con la longitud se sabe si la gente busca ("a") o solo teclea.
    if (state.query.length === 1) trackAnalyticsEvent("busqueda_iniciada");
  });
  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
    if (event.key === "/" && !typing && !elements.search.disabled) {
      event.preventDefault();
      elements.search.focus();
    }
    if (event.key === "Escape" && document.activeElement === elements.search) {
      elements.search.value = "";
      state.query = "";
      state.currentPage = 1;
      renderComponents();
    }
    // Las flechas cambian de pagina solo si no se esta escribiendo y la rejilla
    // tiene mas de una. Con el foco dentro del paginador las flechas las
    // gestiona el propio navegador sobre los botones.
    if (typing) return;
    if (elements.pagination?.hidden) return;
    if (event.key === "ArrowLeft" && document.activeElement !== elements.search) {
      goToPage(state.currentPage - 1, elements.grid);
    }
    if (event.key === "ArrowRight" && document.activeElement !== elements.search) {
      goToPage(state.currentPage + 1, elements.grid);
    }
  });
}

async function initializeApp() {
  initializeLanguage();
  initializeAnalytics();
  initializeTheme();
  initializeNavigation();
  initializeSearch();
  initializePagination();
  initializeFeaturedCarousel();
  initializeMarquee();
    initializeCopyAddress();
    initializeDonationLink();

  document.querySelector("#footer-year").textContent = String(new Date().getFullYear());

  // El ancho medido depende de la fuente; si DM Mono llegase tarde, el texto
  // mediria mas de lo que se calculo y la maquina de escribir lo cortaria.
  document.fonts?.ready.then(() => {
    applyTypewriterMetrics();
    restartTypewriter();
  }).catch(() => {});

  try {
    state.components = await loadCatalog();
    const statComponents = document.querySelector("#stat-components");
    const statCategories = document.querySelector("#stat-categories");
    if (statComponents) statComponents.textContent = String(state.components.length);
    if (statCategories) statCategories.textContent = String(getCategories().length);
    renderMarquee();
    // El carrusel de destacados construye 33 tarjetas (29 + 4 repetidas), cada
    // una con su iframe. Medido en CPU movil: son 129 ms, y con la lentitud
    // simulada de Lighthouse x4 son ~500 ms de hilo principal bloqueado, que es
    // justo el TBT de la portada.
    //
    // No hace falta para el primer pintado: el carrusel esta **debajo** del
    // hero, que es lo que se ve primero. Se aplaza a un momento en el que el
    // navegador esta ocioso, con `requestIdleCallback` y un tope de tiempo
    // (`timeout`) para no depender de que llegue a estar libre: si esta
    // ocupado, se dibuja a los 1200 ms y no antes. El LCP no se ve afectado
    // porque el elemento que lo produce (el hero) ya esta pintado cuando esto
    // corre.
    //
    // El cambio de idioma **no** se aplaza: para entonces la pagina ya esta
    // repintada y quien cambia el idioma esta mirando justo esa seccion.
    aplazar(() => renderFeaturedComponents());
    renderFilters();
    renderAuthorFilters();
    renderRoute();
  } catch (error) {
    if (elements.resultsCount) elements.resultsCount.textContent = t("catalogUnavailable");
    if (elements.grid) {
      elements.grid.replaceChildren(createElement("p", "error-message", t("catalogLoadError", { message: error.message })));
    }
  }
}

function installDavokerTransitionBridge() {
  // Al pulsar "Todos los efectos" se abre transicion.html DENTRO del iframe del
  // portal, y su escena tematica se pinta en el rectangulo del iframe. Si el
  // visitante esta scrolleado mas abajo, el iframe se sale de la pantalla y la
  // animacion se ve cortada, asi que al avisar (que es al pulsarla, no al
  // terminar) el iframe se centra en la ventana. Sin recorrido de sobra, que
  // aqui es el caso normal porque el portal se ve a 90vh con su propio scroll.
  window.addEventListener("message", (evento) => {
    // Lo primero es de quien viene el mensaje. Sin esto, cualquier pagina
    // abierta en otra pestana (o cualquier sitio que embeba este) podria
    // mandar un "davoker-transicion" y mover el scroll del portal.
    //
    // El filtro de origen no puede ir solo: el iframe del portal lleva
    // `sandbox` sin `allow-same-origin`, asi que su documento tiene origen
    // opaco y `evento.origin` es siempre "null", nunca el de esta pagina.
    // Por eso se admite tambien "null" —que es lo que trae cualquier
    // documento con origen opaco, el del portal entre ellos— y el que
    // autentica de verdad es la ventana: `contentWindow` es el WindowProxy
    // del iframe, que no cambia al navegar (davoker.html -> transicion.html
    // -> davoker.html), y solo esa ventana puede mandar este mensaje.
    if (evento.origin !== "null" && evento.origin !== window.location.origin) return;
    if (!evento.data || typeof evento.data !== "object") return;
    if (evento.data.type !== "davoker-transicion") return;
    if (!elements.davokerFrame) return;
    if (evento.source !== elements.davokerFrame.contentWindow) return;
    const marco = elements.davokerFrame.getBoundingClientRect();
    const objetivo = marco.top + window.scrollY - (window.innerHeight - marco.height) / 2;
    // `auto` y no `smooth`: si no, el scroll todavia recorreria el camino
    // mientras la escena ya ha empezado a dispararse.
    window.scrollTo({ top: Math.max(0, objetivo), behavior: "auto" });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  installDavokerTransitionBridge();
  // Antes era `void initializeApp()`, que ademas de marcarse como uso
  // inutilizado (S3735) se comia el error si el arranque fallaba (por ejemplo
  // si el catalogo no llegara): la pagina se quedaba a medio pintar y sin que
  // nadie supiera por que. Aqui el fallo se ve en consola.
  initializeApp().catch((error) => {
    console.error("No se pudo iniciar la aplicacion:", error);
  });
}, { once: true });
