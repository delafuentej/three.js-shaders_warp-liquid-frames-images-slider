import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { slides } from "../constants/index";
import { useThreeScene, useSlideTextAnimations } from "../hooks";
import warpVertexShader from "../shaders/warp/vertex.glsl";
import warpFragmentShader from "../shaders/warp/fragment.glsl";
import SlideContent from "./SlideContent";

gsap.registerPlugin(SplitText);
gsap.config({ nullTargetWarn: false });

export default function Slider() {
  //  const canvasRef = useRef(null);
  const contentRef = useRef(null);

  const { canvasRef, shaderMaterialRef, texturesRef } = useThreeScene(
    warpVertexShader,
    warpFragmentShader,
    slides
  );

  const { processTextElements, animateIn } = useSlideTextAnimations(contentRef);

  // const shaderMaterialRef = useRef(null);
  // const rendererRef = useRef(null);
  //const texturesRef = useRef([]);
  const isTransitioningRef = useRef(false);
  const currentIndexRef = useRef(0);

  // --- utilidades para split text (igual que tu script original) ---
  const createCharacterElements = (element) => {
    if (!element) return;
    if (element.querySelectorAll(".char").length > 0) return;

    const words = element.textContent.split(" ");
    element.innerHTML = "";

    words.forEach((word, index) => {
      const wordDiv = document.createElement("div");
      wordDiv.className = "word";

      [...word].forEach((char) => {
        const charDiv = document.createElement("div");
        charDiv.className = "char";
        charDiv.innerHTML = `<span>${char}</span>`;
        wordDiv.appendChild(charDiv);
      });

      element.appendChild(wordDiv);

      if (index < words.length - 1) {
        const spaceChar = document.createElement("div");
        spaceChar.className = "word";
        spaceChar.innerHTML = '<div class="char"><span> </span></div>';
        element.appendChild(spaceChar);
      }
    });
  };

  const createLineElements = (element) => {
    if (!element) return;
    new SplitText(element, { type: "lines", linesClass: "line" });
    element.querySelectorAll(".line").forEach((line) => {
      line.innerHTML = `<span>${line.textContent}</span>`;
    });
  };

  // const processTextElements = (container) => {
  // if (!container) return;
  // const title = container.querySelector(".slide-title h1");
  // if (title) createCharacterElements(title);

  // container
  // .querySelectorAll(".slide-description p")
  // .forEach(createLineElements);
  // };

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
      { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.2 }
    );
  };

  // --- inicialización de Three.js y carga de texturas ---
  // useEffect(() => {
  // const scene = new THREE.Scene();
  // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // const renderer = new THREE.WebGLRenderer({
  // canvas: canvasRef.current,
  // antialias: true,
  // });
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // rendererRef.current = renderer;

  // const loader = new THREE.TextureLoader();
  // const slideTextures = [];
  // const loadPromises = slides.map(
  // (s) =>
  // new Promise((resolve) => {
  // loader.load(s.image, (t) => {
  // t.minFilter = t.magFilter = THREE.LinearFilter;
  // t.userData = {
  // size: new THREE.Vector2(t.image.width, t.image.height),
  // };
  // resolve(t);
  // });
  // })
  // );

  // const shaderMaterial = new THREE.ShaderMaterial({
  // uniforms: {
  // uTexture1: { value: null },
  // uTexture2: { value: null },
  // uProgress: { value: 0.0 },
  // uResolution: {
  // value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  // },
  // uTexture1Size: { value: new THREE.Vector2(1, 1) },
  // uTexture2Size: { value: new THREE.Vector2(1, 1) },
  // },
  // vertexShader: warpVertexShader,
  // fragmentShader: warpFragmentShader,
  // transparent: true,
  // });
  // shaderMaterialRef.current = shaderMaterial;

  // scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

  // render loop (simple)
  // let mounted = true;
  // const render = () => {
  // if (!mounted) return;
  // requestAnimationFrame(render);
  // renderer.render(scene, camera);
  // };

  // Promise.all(loadPromises).then((loaded) => {
  // texturesRef.current = loaded;
  //   set initial textures
  // shaderMaterial.uniforms.uTexture1.value = texturesRef.current[0];
  // shaderMaterial.uniforms.uTexture2.value =
  // texturesRef.current[1 % texturesRef.current.length];
  // shaderMaterial.uniforms.uTexture1Size.value =
  // texturesRef.current[0].userData.size;
  // shaderMaterial.uniforms.uTexture2Size.value =
  // texturesRef.current[1 % texturesRef.current.length].userData.size;

  // render();
  // });

  // const handleResize = () => {
  // if (!rendererRef.current || !shaderMaterialRef.current) return;
  // rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  // shaderMaterialRef.current.uniforms.uResolution.value.set(
  // window.innerWidth,
  // window.innerHeight
  // );
  // };

  // window.addEventListener("resize", handleResize);

  // return () => {
  // mounted = false;
  // window.removeEventListener("resize", handleResize);
  // renderer.dispose();
  // };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // --- animación de transición entre slides ---
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
        // after transition, reset progress and set textures so next transition uses correct base
        shaderMat.uniforms.uProgress.value = 0;
        shaderMat.uniforms.uTexture1.value = textures[nextIndex];
        shaderMat.uniforms.uTexture1Size.value =
          textures[nextIndex].userData.size;

        // update DOM text content to new slide (keep same structure)
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

        // re-process and animate text in
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
      { value: 1, duration: 2.5, ease: "power2.inOut" },
      0
    );

    // text out animations
    tl.to(
      chars,
      { y: "-100%", duration: 0.8, stagger: 0.02, ease: "power2.in" },
      0
    );
    tl.to(
      lines,
      { y: "-100%", duration: 0.8, stagger: 0.02, ease: "power2.in" },
      0.05
    );
  };

  // --- click handler para avanzar slide ---
  const handleSlideChange = (e) => {
    // evita clicks cuando hay transición en curso
    if (isTransitioningRef.current) return;

    const nextIndex = (currentIndexRef.current + 1) % slides.length;
    animateSlideTransition(nextIndex);
  };

  // --- setup inicial del texto al cargar la página ---
  useEffect(() => {
    setupInitialSlide();
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
      <canvas ref={canvasRef} className="block w-full h-full" />

      <div ref={contentRef} className="slider-content">
        <SlideContent slide={slides[0]} />
      </div>
    </div>
  );
}

//
{
  /* <div className="slider relative w-screen h-screen text-white overflow-hidden"> */
}
{
  /* <canvas ref={canvasRef} className="block w-full h-full" /> */
}
{
  /* <div */
}
// ref={contentRef}
// className="slider-content absolute top-0 left-0 w-full h-full user-select-none z-10"
{
  /* > */
}
{
  /* <div className="slide-title"> */
}
{
  /* <h1>{slides[0].title}</h1> */
}
{
  /* </div> */
}
{
  /* <div className="slide-description"> */
}
{
  /* <p>{slides[0].description}</p> */
}
{
  /* <div className="slide-info"> */
}
{
  /* <p>Type. {slides[0].type}</p> */
}
{
  /* <p>Field. {slides[0].field}</p> */
}
{
  /* <p>Date. {slides[0].date}</p> */
}
{
  /* </div> */
}
{
  /* </div> */
}
{
  /* </div> */
}
{
  /* </div> */
}
// ;
