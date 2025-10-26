import { useRef } from "react";

export function useSlideTransition({
  slides,
  shaderMaterialRef,
  texturesRef,
  contentRef,
  processTextElements,
}) {
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  let gsap;
  let SplitText;

  // 🔹 Lazy load GSAP & SplitText
  const loadGsap = async () => {
    if (!gsap || !SplitText) {
      const gsapModule = await import("gsap");
      gsap = gsapModule.gsap;
      SplitText = (await import("gsap/SplitText")).default;
      gsap.registerPlugin(SplitText);
    }
  };

  // 🔹 Animación de salida del texto actual
  const fadeTextOut = (content) => {
    const chars = content.querySelectorAll(".char span");
    const lines = content.querySelectorAll(".line span");

    const tl = gsap.timeline();
    tl.to(chars, {
      y: "-100%",
      duration: 0.8,
      stagger: 0.02,
      ease: "power2.in",
    })
      .to(
        lines,
        { y: "-100%", duration: 0.8, stagger: 0.02, ease: "power2.in" },
        0.05
      )
      .to(
        ".slide-info",
        {
          opacity: 0,
          visibility: "hidden",
          duration: 0.5,
          y: -20,
          ease: "power2.in",
        },
        0
      );
    return tl;
  };

  // 🔹 Animación de entrada del nuevo texto
  const fadeTextIn = (content) => {
    const inChars = content.querySelectorAll(".char span");
    const inLines = content.querySelectorAll(".line span");

    const tl = gsap.timeline();
    tl.fromTo(
      inChars,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.02, ease: "power2.out" }
    )
      .fromTo(
        inLines,
        { y: "100%" },
        { y: "0%", duration: 0.8, stagger: 0.02, ease: "power2.out" },
        0
      )
      .to(
        ".slide-info",
        {
          opacity: 1,
          visibility: "visible",
          duration: 1,
          y: 0,
          ease: "power2.out",
        },
        0.1
      );
    return tl;
  };

  // 🔹 Transición principal del slide
  const animateSlideTransition = async (nextIndex) => {
    await loadGsap();

    const shaderMat = shaderMaterialRef.current;
    const textures = texturesRef.current;
    const content = contentRef.current;
    if (!shaderMat || textures.length === 0 || !content) return;

    // Aseguramos que el texto inicial esté procesado
    processTextElements(content);

    shaderMat.uniforms.uTexture1.value = textures[currentIndexRef.current];
    shaderMat.uniforms.uTexture2.value = textures[nextIndex];
    shaderMat.uniforms.uTexture1Size.value =
      textures[currentIndexRef.current].userData.size;
    shaderMat.uniforms.uTexture2Size.value = textures[nextIndex].userData.size;

    const tl = gsap.timeline({
      onStart: () => (isTransitioningRef.current = true),
      onComplete: () => {
        isTransitioningRef.current = false;
        currentIndexRef.current = nextIndex;
        shaderMat.uniforms.uProgress.value = 0;
        shaderMat.uniforms.uTexture1.value = textures[nextIndex];
        shaderMat.uniforms.uTexture1Size.value =
          textures[nextIndex].userData.size;

        // Actualizar contenido textual
        const titleEl = content.querySelector(".slide-title h1");
        const descEl = content.querySelector(".slide-description p");
        const infoEls = content.querySelectorAll(".slide-info p");

        titleEl.textContent = slides[nextIndex].title;
        descEl.textContent = slides[nextIndex].description;
        if (infoEls[0])
          infoEls[0].textContent = `Type. ${slides[nextIndex].type}`;
        if (infoEls[1])
          infoEls[1].textContent = `Field. ${slides[nextIndex].field}`;
        if (infoEls[2])
          infoEls[2].textContent = `Date. ${slides[nextIndex].date}`;

        // Reprocesar texto entrante
        processTextElements(content);
        fadeTextIn(content);
      },
    });

    // 🔹 Combinar fade out + shader transition
    tl.add(fadeTextOut(content), 0).to(
      shaderMat.uniforms.uProgress,
      { value: 1, duration: 2.5, ease: "power2.inOut" },
      0
    );
  };

  // 🔹 Controlador de cambio de slide
  const handleSlideChange = () => {
    if (isTransitioningRef.current) return;
    const nextIndex = (currentIndexRef.current + 1) % slides.length;
    animateSlideTransition(nextIndex);
  };

  return { handleSlideChange };
}
