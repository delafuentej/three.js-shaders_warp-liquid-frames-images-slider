import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { slides } from "../constants";
import warpVertexShader from "../shaders/warp/vertex.glsl";
import warpFragmentShader from "../shaders/warp/fragment.glsl";

gsap.registerPlugin(SplitText);
gsap.config({ nullTargetWarn: false });

export default function Slider() {
  const canvasRef = useRef(null);
  const sliderRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slideTextures = useRef([]);
  const shaderMaterial = useRef();
  const renderer = useRef();

  const processTextElements = (container) => {
    const title = container.querySelector(".slide-title h1");
    if (title && title.textContent) {
      const words = title.textContent.split(" ");
      title.innerHTML = "";
      words.forEach((word, i) => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word";
        [...word].forEach((char) => {
          const charDiv = document.createElement("div");
          charDiv.className = "char";
          charDiv.innerHTML = `<span>${char}</span>`;
          wordDiv.appendChild(charDiv);
        });
        title.appendChild(wordDiv);
        if (i < words.length - 1) {
          const spaceDiv = document.createElement("div");
          spaceDiv.className = "word";
          spaceDiv.innerHTML = '<div class="char"><span> </span></div>';
          title.appendChild(spaceDiv);
        }
      });
    }

    container.querySelectorAll(".slide-description p").forEach((p) => {
      new SplitText(p, { type: "lines", linesClass: "line" });
      p.querySelectorAll(".line").forEach((line) => {
        line.innerHTML = `<span>${line.textContent}</span>`;
      });
    });
  };

  const animateTextIn = (container) => {
    const chars = container.querySelectorAll(".char span");
    const lines = container.querySelectorAll(".line span");

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

  const createSlideContent = (slide) => (
    <div className="slider-content">
      <div className="slide-title">
        <h1>{slide.title}</h1>
      </div>
      <div className="slide-description">
        <p>{slide.description}</p>
        <div className="slide-info">
          <p>Type. {slide.type}</p>
          <p>Field. {slide.field}</p>
          <p>Date. {slide.date}</p>
        </div>
      </div>
    </div>
  );

  const handleSlideChange = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextIndex = (currentSlide + 1) % slides.length;

    shaderMaterial.current.uniforms.uTexture1.value =
      slideTextures.current[currentSlide];
    shaderMaterial.current.uniforms.uTexture2.value =
      slideTextures.current[nextIndex];
    shaderMaterial.current.uniforms.uTexture1Size.value =
      slideTextures.current[currentSlide].userData.size;
    shaderMaterial.current.uniforms.uTexture2Size.value =
      slideTextures.current[nextIndex].userData.size;

    const currentContent = sliderRef.current.querySelector(".slider-content");
    const timeline = gsap.timeline();

    timeline
      .to([...currentContent.querySelectorAll(".char span")], {
        y: "-100%",
        duration: 0.6,
        stagger: 0.025,
        ease: "power2.inOut",
      })
      .to(
        [...currentContent.querySelectorAll(".line span")],
        { y: "-100%", duration: 0.6, stagger: 0.025, ease: "power2.inOut" },
        0.1
      )
      .call(() => {
        currentContent.remove();

        const newSlideContent = createSlideContent(slides[nextIndex]);
        sliderRef.current.appendChild(newSlideContent);
        processTextElements(newSlideContent);
        gsap.set(newSlideContent.querySelectorAll("span"), { y: "100%" });

        animateTextIn(newSlideContent);
        setCurrentSlide(nextIndex);
        setIsTransitioning(false);
      });

    // Animate shader
    gsap.fromTo(
      shaderMaterial.current.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 2.5,
        ease: "power2.inOut",
        onComplete: () => {
          shaderMaterial.current.uniforms.uProgress.value = 0;
          shaderMaterial.current.uniforms.uTexture1.value =
            slideTextures.current[nextIndex];
          shaderMaterial.current.uniforms.uTexture1Size.value =
            slideTextures.current[nextIndex].userData.size;
        },
      }
    );
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.current.setSize(window.innerWidth, window.innerHeight);

    shaderMaterial.current = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: null },
        uTexture2: { value: null },
        uProgress: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture1Size: { value: new THREE.Vector2(1, 1) },
        uTexture2Size: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: warpVertexShader,
      fragmentShader: warpFragmentShader,
    });

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      shaderMaterial.current
    );
    scene.add(plane);

    const loader = new THREE.TextureLoader();
    slides.forEach((slide, i) => {
      loader.load(slide.image, (texture) => {
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.userData = {
          size: new THREE.Vector2(texture.image.width, texture.image.height),
        };
        slideTextures.current[i] = texture;

        if (i === 1) {
          shaderMaterial.current.uniforms.uTexture1.value =
            slideTextures.current[0];
          shaderMaterial.current.uniforms.uTexture2.value =
            slideTextures.current[1];
        }
      });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.current.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.current.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("click", handleSlideChange);

    // process initial slide
    const content = sliderRef.current.querySelector(".slider-content");
    processTextElements(content);
    animateTextIn(content);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleSlideChange);
    };
  }, []);

  return (
    <div className="slider" ref={sliderRef}>
      <canvas ref={canvasRef}></canvas>
      {createSlideContent(slides[currentSlide])}
    </div>
  );
}
