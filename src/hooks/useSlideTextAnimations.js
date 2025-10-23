import gsap from "gsap";
import { SplitText } from "gsap/all";

gsap.registerPlugin(SplitText);

export function useSlideTextAnimations(contentRef) {
  const processTextElements = () => {
    const el = contentRef.current;
    if (!el) return;

    const title = el.querySelector(".slide-title h1");
    const desc = el.querySelector(".slide-description p");
    if (title) splitChars(title);
    if (desc) splitLines(desc);
  };

  const splitChars = (element) => {
    if (!element || element.querySelectorAll(".char").length) return;
    const words = element.textContent.split(" ");
    element.innerHTML = words
      .map(
        (word) =>
          `<div class="word">${[...word]
            .map((c) => `<div class="char"><span>${c}</span></div>`)
            .join("")}</div>`
      )
      .join('<div class="word"><div class="char"><span> </span></div></div>');
  };

  const splitLines = (element) => {
    const split = new SplitText(element, { type: "lines", linesClass: "line" });
    split.lines.forEach((line) => {
      line.innerHTML = `<span>${line.textContent}</span>`;
    });
  };

  const animateIn = () => {
    const el = contentRef.current;
    const chars = el.querySelectorAll(".char span");
    const lines = el.querySelectorAll(".line span");
    gsap.fromTo(
      chars,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" }
    );
    gsap.fromTo(
      lines,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.2 }
    );
  };

  return { processTextElements, animateIn };
}

// const createCharacterElements = (element) => {
// if (!element) return;
// if (element.querySelectorAll(".char").length > 0) return;
// const words = element.textContent.split(" ");
// element.innerHTML = "";
// words.forEach((word, index) => {
//   const wordDiv = document.createElement("div");
//   wordDiv.className = "word";
//   [...word].forEach((char) => {
// const charDiv = document.createElement("div");
// charDiv.className = "char";
// charDiv.innerHTML = `<span>${char}</span>`;
// wordDiv.appendChild(charDiv);
//   });
//   element.appendChild(wordDiv);
//   if (index < words.length - 1) {
// const spaceChar = document.createElement("div");
// spaceChar.className = "word";
// spaceChar.innerHTML = '<div class="char"><span> </span></div>';
// element.appendChild(spaceChar);
//   }
// });
//   };
//   const createLineElements = (element) => {
// if (!element) return;
// new SplitText(element, { type: "lines", linesClass: "line" });
// element.querySelectorAll(".line").forEach((line) => {
//   line.innerHTML = `<span>${line.textContent}</span>`;
// });
//   };
// const processTextElements = (container) => {
// if (!container) return;
// const title = container.querySelector(".slide-title h1");
// if (title) createCharacterElements(title);
// container
// .querySelectorAll(".slide-description p")
// .forEach(createLineElements);
// };
