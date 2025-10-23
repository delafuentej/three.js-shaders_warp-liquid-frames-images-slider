import { useRef } from "react";
import gsap from "gsap";

export function useSlideTransition({
  slides,
  shaderMaterialRef,
  texturesRef,
  contentRef,
  processTextElements,
}) {
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  const animateSlideTransition = (nextIndex) => {
    const shaderMat = shaderMaterialRef.current;
    const textures = texturesRef.current;
    if (!shaderMat || textures.length === 0) return;

    shaderMat.uniforms.uTexture1.value = textures[currentIndexRef.current];
    shaderMat.uniforms.uTexture2.value = textures[nextIndex];
    shaderMat.uniforms.uTexture1Size.value =
      textures[currentIndexRef.current].userData.size;
    shaderMat.uniforms.uTexture2Size.value = textures[nextIndex].userData.size;

    const content = contentRef.current;
    const chars = content.querySelectorAll(".char span");
    const lines = content.querySelectorAll(".line span");

    const tl = gsap.timeline({
      onStart: () => (isTransitioningRef.current = true),
      onComplete: () => {
        isTransitioningRef.current = false;
        currentIndexRef.current = nextIndex;
        shaderMat.uniforms.uProgress.value = 0;
        shaderMat.uniforms.uTexture1.value = textures[nextIndex];
        shaderMat.uniforms.uTexture1Size.value =
          textures[nextIndex].userData.size;

        // actualizar contenido -// update DOM text content to new slide (keep same structure)
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
        processTextElements(content);
        const inChars = content.querySelectorAll(".char span");
        const inLines = content.querySelectorAll(".line span");
        gsap.fromTo(
          inChars,
          { y: "100%" },
          { y: "0%", duration: 0.8, stagger: 0.02, ease: "power2.out" }
        );
        gsap.fromTo(
          inLines,
          { y: "100%" },
          {
            y: "0%",
            duration: 0.8,
            stagger: 0.02,
            ease: "power2.out",
            delay: 0.15,
          }
        );
      },
    });
    // shader progress animation (uniform)
    tl.to(
      shaderMat.uniforms.uProgress,
      {
        value: 1,
        duration: 2.5,
        ease: "power2.inOut",
      },
      0
    )
      .to(
        chars,
        { y: "-100%", duration: 0.8, stagger: 0.02, ease: "power2.in" },
        0
      )
      .to(
        lines,
        { y: "-100%", duration: 0.8, stagger: 0.02, ease: "power2.in" },
        0.05
      );
  };

  const handleSlideChange = () => {
    if (isTransitioningRef.current) return;
    const nextIndex = (currentIndexRef.current + 1) % slides.length;
    animateSlideTransition(nextIndex);
  };

  return { handleSlideChange };
}
