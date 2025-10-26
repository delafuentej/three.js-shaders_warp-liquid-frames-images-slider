import { useRef } from "react";

export function useSlideTextAnimations(contentRef) {
  const gsapRef = useRef(null);
  const SplitTextRef = useRef(null);

  // Divide los textos en caracteres
  const splitIntoChars = (element) => {
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

  // Divide en líneas (requiere SplitText)
  const splitIntoLines = (element) => {
    const SplitText = SplitTextRef.current;
    if (!SplitText || !element) return;

    const split = new SplitText(element, { type: "lines", linesClass: "line" });
    split.lines.forEach((line) => {
      line.innerHTML = `<span>${line.textContent}</span>`;
    });
  };

  // Procesa todos los elementos de texto
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

  // Anima la entrada de texto
  const animateIn = async () => {
    if (!contentRef.current) return;

    // Lazy load GSAP y SplitText solo si no se han cargado
    if (!gsapRef.current || !SplitTextRef.current) {
      const gsapModule = await import("gsap");
      gsapRef.current = gsapModule.gsap;
      SplitTextRef.current = (await import("gsap/SplitText")).default;
      gsapRef.current.registerPlugin(SplitTextRef.current);
    }

    const gsap = gsapRef.current;
    const container = contentRef.current;
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
      "-=0.6"
    );
  };

  return { processTextElements, animateIn };
}
