import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import { slides } from "../constants/index";
import {
  useThreeScene,
  useSlideTextAnimations,
  useSlideTransition,
} from "../hooks";
import warpVertexShader from "../shaders/warp/vertex.glsl";
import warpFragmentShader from "../shaders/warp/fragment.glsl";
import SlideContent from "./SlideContent";

export default function Slider() {
  //  const canvasRef = useRef(null);
  const contentRef = useRef(null);

  const { canvasRef, shaderMaterialRef, texturesRef } = useThreeScene(
    warpVertexShader,
    warpFragmentShader,
    slides
  );

  const { processTextElements, animateIn } = useSlideTextAnimations(contentRef);

  const { handleSlideChange } = useSlideTransition({
    slides,
    shaderMaterialRef,
    texturesRef,
    contentRef,
    processTextElements,
  });

  const setupInitialSlide = () => {
    const content = contentRef.current;
    processTextElements(content);

    const chars = content.querySelectorAll(".char span");
    const lines = content.querySelectorAll(".line span");

    gsap.fromTo(
      chars,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" }
    );
    gsap.fromTo(
      lines,
      { y: "100%" },
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" }
    );
  };

  // --- setup inicial del texto al cargar la página ---
  useEffect(() => {
    setupInitialSlide();
    animateIn();
    // attach click listener al documento (igual que tu script original)
    document.addEventListener("click", handleSlideChange);

    return () => {
      document.removeEventListener("click", handleSlideChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- JSX: la estructura replica tu HTML original ---
  return (
    <div className="slider">
      <canvas ref={canvasRef} className="slider-canvas" />

      <div ref={contentRef} className="slider-content">
        <SlideContent slide={slides[0]} />
      </div>
    </div>
  );
}
