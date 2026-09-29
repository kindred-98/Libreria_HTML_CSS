const stretchBeginLetters = [...document.querySelectorAll('#stretchBegin path')];
const stretchEndLetters = [...document.querySelectorAll('#stretchEnd path')];
const messageBeginLetters = [...document.querySelectorAll('#messageBegin path')];
const messageEndLetters = [...document.querySelectorAll('#messageEnd path')];

gsap.set('.container', {
  autoAlpha: 1
});

// MorphSVGPlugin es un plugin de GSAP de pago. El demo lo pedia desde
// assets.codepen.io, que ya devuelve 403, asi que sin el plugin la interpolacion
// de rutas no se puede hacer. En vez de reventar la consola con un error y dejar
// el SVG a medias, se muestra directamente el estado final, que ya es el diseño
// bueno del texto estirado.
if (typeof MorphSVGPlugin === 'undefined') {
  stretchBeginLetters.forEach((letter, i) => gsap.set(letter, { attr: { d: stretchEndLetters[i].getAttribute('d') } }));
  messageBeginLetters.forEach((letter, i) => gsap.set(letter, { attr: { d: messageEndLetters[i].getAttribute('d') } }));
} else {
  const tl = gsap.timeline({defaults: {
      ease: 'back.inOut(2)',
      duration: 1,
      repeat: -1,
      yoyo: true,
    }});

  stretchBeginLetters.forEach((letter, i) => {
      tl.to(letter, {
          morphSVG: stretchEndLetters[i],
      })
      .to(messageBeginLetters[i], {
          morphSVG: messageEndLetters[i]
      }, '<');
  });
}
