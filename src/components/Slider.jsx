import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { slides } from "../constants/index";
import warpVertexShader from "../shaders/warp/vertex.glsl";
import warpFragmentShader from "../shaders/warp/fragment.glsl";

export default function Slider() {
  const canvasRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const texturesRef = useRef([]);
  const materialRef = useRef();
  const rendererRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const animatingRef = useRef(false); // previene múltiples clicks mientras anima

  useEffect(() => {
    // --- Setup escena ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sceneRef.current = scene;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // --- ShaderMaterial ---
    const shaderMaterial = new THREE.ShaderMaterial({
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
    materialRef.current = shaderMaterial;

    // --- Plano full screen ---
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    scene.add(plane);

    // --- Loader de texturas ---
    const loader = new THREE.TextureLoader();
    const loadTexture = (url) =>
      new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

    Promise.all(slides.map((s) => loadTexture(s.image)))
      .then((textures) => {
        textures.forEach((tex) => {
          tex.minFilter = tex.magFilter = THREE.LinearFilter;
          tex.userData = new THREE.Vector2(tex.image.width, tex.image.height);
        });
        texturesRef.current = textures;

        if (textures.length > 0) {
          shaderMaterial.uniforms.uTexture1.value = textures[0];
          shaderMaterial.uniforms.uTexture1Size.value = textures[0].userData;
        }
        if (textures.length > 1) {
          shaderMaterial.uniforms.uTexture2.value = textures[1];
          shaderMaterial.uniforms.uTexture2Size.value = textures[1].userData;
        }

        // Render inicial
        renderer.render(scene, camera);
      })
      .catch(console.error);

    // --- Resize ---
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
      renderer.render(scene, camera);
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("resize", handleResize);
      plane.geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // === Cambiar slide ===
  const nextSlide = () => {
    if (animatingRef.current) return;
    const material = materialRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!material || texturesRef.current.length < 2) return;

    animatingRef.current = true;

    const next = (current + 1) % slides.length;
    const textures = texturesRef.current;

    material.uniforms.uTexture1.value = textures[current];
    material.uniforms.uTexture2.value = textures[next];

    gsap.fromTo(
      material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          rendererRef.current.render(scene, camera);
        },
        onComplete: () => {
          setCurrent(next);
          material.uniforms.uProgress.value = 0;
          material.uniforms.uTexture1.value = textures[next];
          animatingRef.current = false;
          rendererRef.current.render(scene, camera);
        },
      }
    );
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden text-white cursor-pointer"
      onClick={nextSlide}
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-[7vw] font-bold uppercase mb-8">
          {slides[current].title}
        </h1>
        <p className="w-2/3 text-lg mb-6">{slides[current].description}</p>
        <div className="text-sm uppercase tracking-wide space-y-1">
          <p>Type. {slides[current].type}</p>
          <p>Field. {slides[current].field}</p>
          <p>Date. {slides[current].date}</p>
        </div>
      </div>
    </div>
  );
}
