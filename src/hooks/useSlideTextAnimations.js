import gsap from "gsap";
import { SplitText } from "gsap/all";

gsap.registerPlugin(SplitText);

export function useSlideTextAnimations(contentRef) {
  /**
   * Divide los textos de título, descripción e información
   * en caracteres o líneas según el caso.
   */
  const processTextElements = () => {
    const container = contentRef.current;
    if (!container) return;

    const titleEl = container.querySelector(".slide-title h1");
    const descEl = container.querySelector(".slide-description p");
    const infoEls = container.querySelectorAll(".slide-info p");

    if (titleEl) splitIntoChars(titleEl);
    if (descEl) splitIntoLines(descEl);
    if (infoEls.length > 0) infoEls.forEach(splitIntoLines);
  };

  /**
   * Divide un texto en caracteres envueltos en elementos <span>
   * permitiendo animaciones por letra.
   */
  const splitIntoChars = (element) => {
    // Evitar reprocesar si ya fue dividido
    if (!element || element.querySelector(".char")) return;

    const words = element.textContent.trim().split(" ");
    const html = words
      .map((word) => {
        const chars = [...word]
          .map((char) => `<div class="char"><span>${char}</span></div>`)
          .join("");
        return `<div class="word">${chars}</div>`;
      })
      .join('<div class="word"><div class="char"><span> </span></div></div>');

    element.innerHTML = html;
  };

  /**
   * Divide un párrafo en líneas para animarlas independientemente.
   */
  const splitIntoLines = (element) => {
    const split = new SplitText(element, { type: "lines", linesClass: "line" });
    split.lines.forEach((line) => {
      line.innerHTML = `<span>${line.textContent}</span>`;
    });
  };

  /**
   * Anima la entrada del texto dividido en caracteres y líneas.
   */
  const animateIn = () => {
    const container = contentRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".char span");
    const lines = container.querySelectorAll(".line span");

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(
      chars,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.8, stagger: 0.025 }
    ).fromTo(
      lines,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.8, stagger: 0.025 },
      "-=0.6" // solapamos animaciones
    );
  };

  return { processTextElements, animateIn };
}
