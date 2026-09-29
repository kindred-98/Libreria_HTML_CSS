const heading = document.querySelector(".heading");

// Antes esto usaba SplitText desde assets.codepen.io, pero ese CDN ya devuelve
// 403 y dejaba el titulo sin animar. El plugin solo envolvia cada letra en un
// <div>, que es justo lo que estiliza .heading > div, asi que se hace aqui.
const headingText = heading.textContent.trim();
heading.replaceChildren(...[...headingText].map((character) => {
  const chunk = document.createElement("div");
  // espacio duro, si no el navegador lo colapsa y las letras se juntan
  chunk.textContent = character === " " ? "\u00a0" : character;
  return chunk;
}));

const headingChars = [...heading.children];

gsap.from(headingChars, {
  filter: "blur(0.15em)",
  stagger: {
    from: "left",
    each: .1 },

  duration: i => 1.25 + i * .75,
  ease: "power2.inOut" });


gsap.from(headingChars, {
  xPercent: i => (i + 1) * 20,
  opacity: 0,
  stagger: {
    from: "left",
    each: .1 },

  duration: i => 1 + i * .85,
  ease: "power2.out" },
"<");
