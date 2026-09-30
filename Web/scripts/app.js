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
const featuredPageSize = 8;
// Cuantas páginas numeradas se dibujan a cada lado de la actual antes de
// colapsar el resto en puntos suspensivos.
const pageWindow = 1;
const translations = {
  en: {
    categories: {
      All: "All", Animations: "Animations", Buttons: "Buttons", Cards: "Cards", Controls: "Controls",
      Effects: "Effects", Forms: "Forms", Galleries: "Galleries", Loaders: "Loaders", Navigation: "Navigation", Other: "Other",
    },
    authors: {
      All: "All authors", Davoker: "Davoker", "kindred-98": "kindred-98", fatmaerm: "fatmaerm",
    },
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
    collectionEyebrow: "THE COLLECTION",
    browseComponents: "Browse components",
    libraryNote: "Search the details. Open a demo. Make it yours.",
    searchPlaceholder: "Search buttons, cards, effects...",
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
  },
  es: {
    categories: {
      All: "Todas", Animations: "Animaciones", Buttons: "Botones", Cards: "Tarjetas", Controls: "Controles",
      Effects: "Efectos", Forms: "Formularios", Galleries: "Galerías", Loaders: "Indicadores de carga", Navigation: "Navegación", Other: "Otros",
    },
    authors: {
      All: "Todos los autores", Davoker: "Davoker", "kindred-98": "kindred-98", fatmaerm: "fatmaerm",
    },
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
    collectionEyebrow: "LA COLECCIÓN",
    browseComponents: "Explorar componentes",
    libraryNote: "Busca detalles. Abre un demo. Hazlo tuyo.",
    searchPlaceholder: "Buscar botones, tarjetas, efectos...",
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
  },
};

const state = {
  components: [],
  language: "en",
  category: "All",
  author: "All",
  query: "",
  currentPage: 1,
  featuredPage: 1,
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
  featuredPagination: document.querySelector("#featured-pagination"),
  featuredPagePrev: document.querySelector("#featured-page-prev"),
  featuredPageNext: document.querySelector("#featured-page-next"),
  featuredPaginationPages: document.querySelector("#featured-pagination-pages"),
  featuredPaginationStatus: document.querySelector("#featured-pagination-status"),
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

  for (const element of elements) {
    const chars = [...element.textContent.trim()].length;
    if (!chars) continue;
    element.style.setProperty("--type-chars", String(chars));
    element.style.setProperty("--type-cycle", `${typewriterCycleMs}ms`);
    // +3px: el caret va como borde y el box-sizing es border-box.
    element.style.setProperty("--type-width", `${element.scrollWidth + 3}px`);
  }
}

// Reinicia la animacion: quitar y volver a poner la propiedad obliga al motor a
// recalcularla, porque si solo se cambia el texto se veria el cambio en seco.
function restartTypewriter() {
  for (const element of document.querySelectorAll("[data-typewriter]")) {
    element.style.animation = "none";
    void element.offsetWidth;
    element.style.removeProperty("animation");
  }
}

function getComponentDescription(component) {
  if (state.language === "en") return component.description;
  return component.descriptionEs || component.description;
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
// llegue sin ningun demo en el catalogo.
const preferredAuthors = ["All", "Davoker", "kindred-98", "fatmaerm"];

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
    const matchesAuthor = state.author === "All" || component.author === state.author;
    const searchableText = normalizeText([
      component.name,
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
      state.currentPage = 1;
      renderFilters();
      renderComponents();
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
      state.author = author;
      state.currentPage = 1;
      renderAuthorFilters();
      renderComponents();
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

function armPreviewListeners(frame, preview) {
  frame.addEventListener("load", () => {
    preview.dataset.previewState = "ready";
  }, { once: true });
  frame.addEventListener("error", () => {
    preview.dataset.previewState = "error";
  }, { once: true });
}

function mountQueuedPreview(container) {
  previewObserver?.unobserve(container);
  const frame = container.querySelector("iframe[data-preview-src]");
  if (!frame) return;
  const src = frame.dataset.previewSrc;
  delete frame.dataset.previewSrc;
  armPreviewListeners(frame, container);
  frame.src = src;
}

function refreshQueuedPreviews() {
  if (!previewObserver) return;
  previewObserver.disconnect();
  const pending = document.querySelectorAll(
    ".live-preview[data-preview-state='loading'] iframe[data-preview-src]",
  );
  for (const frame of pending) previewObserver.observe(frame.parentElement);
}

function createPreview(component, className) {
  const preview = createElement("div", className);
  preview.classList.add("live-preview");
  preview.dataset.previewState = "loading";
  const frame = document.createElement("iframe");
  frame.title = t("livePreviewTitle", { name: component.name });
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("sandbox", "allow-scripts allow-forms allow-popups");
  preview.append(frame);
  const previewUrl = new URL(component.preview, document.baseURI);
  previewUrl.searchParams.set("previewRevision", previewRevision);
  if (previewObserver) {
    frame.dataset.previewSrc = previewUrl.href;
    previewObserver.observe(preview);
  } else {
    armPreviewListeners(frame, preview);
    frame.src = previewUrl.href;
  }
  return preview;
}

function componentDetailUrl(componentId) {
  return `./components.html?component=${encodeURIComponent(componentId)}`;
}

function createComponentCard(component, index) {
  const article = createElement("article", "component-card");
  article.append(createPreview(component, "card-preview"));

  const previewLabel = createElement("span", "card-preview-label", t("liveDemo"));
  article.querySelector(".card-preview").append(previewLabel);

  const content = createElement("div", "card-content");
  const top = createElement("div", "component-card-top");
  top.append(
    createElement("span", "component-category", getCategoryLabel(component.category)),
    createElement("span", "component-number", String(index + 1).padStart(3, "0")),
  );
  const heading = createElement("h3", "", component.name);
  const description = createElement("p", "", getComponentDescription(component));
  const link = createElement("a", "card-link", t("viewComponent"));
  link.href = componentDetailUrl(component.id);
  // Sin esto el enlace recarga la pagina y al volver se pierde la pagina del
  // paginador en la que estabas. Con pushState el detalle se abre en el sitio y
  // el estado se conserva. Se deja el href para que el clic con el boton
  // central y "abrir en pestana nueva" sigan funcionando.
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState({}, "", componentDetailUrl(component.id));
    renderRoute();
    window.scrollTo({ top: 0, behavior: "auto" });
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

function renderComponents() {
  if (!elements.grid) return;
  const filteredComponents = getFilteredComponents();
  // Con el autor davoker elegido, sin categoria ni busqueda, la rejilla se
  // sustituye por su portada (davoker.html) dentro del mismo hueco: la cabecera,
  // el buscador y los filtros siguen siendo nuestros. En cuanto cambias de
  // autor, de categoria o buscas algo, vuelve la lista normal de tarjetas.
  const showDavokerPortal = state.author === "Davoker"
    && state.category === "All"
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
  const summaryKey = authorSummaryKey[state.author];
  const countLabel = filteredComponents.length === 1 ? t("component") : t("components");
  elements.resultsCount.textContent = summaryKey
    ? t(summaryKey, { count: filteredComponents.length })
    : `${filteredComponents.length} ${countLabel}`;
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

function renderFeaturedComponents() {
  if (!elements.featuredGrid) return;
  // El catalogo viene ordenado por carpeta, asi que sin ordenar los destacados
  // salen en un orden que no encaja con como se eligen. Por nombre queda
  // Bicycle, Liquid Fill Button, Neural Synapse Network, Photo Gallery.
  const featuredComponents = state.components
    .filter((component) => component.featured)
    .sort((first, second) => first.name.localeCompare(second.name));
  const totalPages = Math.max(1, Math.ceil(featuredComponents.length / featuredPageSize));
  if (state.featuredPage > totalPages) state.featuredPage = totalPages;
  const start = (state.featuredPage - 1) * featuredPageSize;
  const visible = featuredComponents.slice(start, start + featuredPageSize);
  elements.featuredGrid.replaceChildren(...visible.map((component, index) => createComponentCard(component, start + index)));
  elements.featuredGrid.closest(".featured-section").hidden = featuredComponents.length === 0;
  renderPagination({
    container: elements.featuredPagination,
    pagesList: elements.featuredPaginationPages,
    status: elements.featuredPaginationStatus,
    previous: elements.featuredPagePrev,
    next: elements.featuredPageNext,
    totalPages,
    currentPage: state.featuredPage,
    size: featuredPageSize,
  });
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
  ].join("\n");
  files.push({
    name: `${component.id}/ATTRIBUTION.txt`,
    bytes: new TextEncoder().encode(`${attribution}\n`),
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

function createDetailHeading(component) {
  const heading = createElement("div", "detail-heading");
  const copy = createElement("div");
  copy.append(
    createElement("p", "detail-kicker", `${getCategoryLabel(component.category)} / ${component.folder}`),
    createElement("h1", "", component.name),
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
  image: `${siteOrigin}/Web/og-image.png`,
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
    title: `${component.name} · ${t("libraryTitle")}`,
    description: getComponentDescription(component),
    url: `${siteOrigin}${componentsPath}?component=${encodeURIComponent(component.id)}`,
    robots: "noindex, follow",
  });

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
  let savedLanguage = "en";
  try {
    savedLanguage = localStorage.getItem("component-field-language") ?? "en";
  } catch {
    savedLanguage = "en";
  }
  applyLanguage(savedLanguage, false);
  for (const button of elements.languageButtons) {
    button.addEventListener("click", () => applyLanguage(button.dataset.language));
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

function goToFeaturedPage(page) {
  const featured = state.components.filter((component) => component.featured);
  const totalPages = Math.max(1, Math.ceil(featured.length / featuredPageSize));
  const target = Math.min(Math.max(page, 1), totalPages);
  if (target === state.featuredPage) return;
  state.featuredPage = target;
  renderFeaturedComponents();
  scrollToGrid(elements.featuredGrid);
}

function initializePagination() {
  elements.pagePrev?.addEventListener("click", () => goToPage(state.currentPage - 1, elements.grid));
  elements.pageNext?.addEventListener("click", () => goToPage(state.currentPage + 1, elements.grid));
  elements.paginationPages?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (button) goToPage(Number(button.dataset.page), elements.grid);
  });
  elements.featuredPagePrev?.addEventListener("click", () => goToFeaturedPage(state.featuredPage - 1));
  elements.featuredPageNext?.addEventListener("click", () => goToFeaturedPage(state.featuredPage + 1));
  elements.featuredPaginationPages?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (button) goToFeaturedPage(Number(button.dataset.page));
  });
}

function initializeSearch() {
  if (!elements.search) return;
  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    state.currentPage = 1;
    renderComponents();
  });
  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
    if (event.key === "/" && !typing) {
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
  initializeTheme();
  initializeNavigation();
  initializeSearch();
  initializePagination();
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
    renderFeaturedComponents();
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

window.addEventListener("DOMContentLoaded", () => {
  void initializeApp();
}, { once: true });
