import { useEffect, useRef } from "react";

// Lazy load de Three.js
const loadThree = async () => await import("three");

export function useThreeScene(vertexShader, fragmentShader, slides) {
  const canvasRef = useRef(null);
  const shaderMaterialRef = useRef(null);
  const rendererRef = useRef(null);
  const texturesRef = useRef([]);

  useEffect(() => {
    let mounted = true;
    let renderer;
    let resizeListener;

    const initThree = async () => {
      // Lazy load Three.js
      const THREE = await loadThree();
      const {
        Scene,
        OrthographicCamera,
        WebGLRenderer,
        TextureLoader,
        LinearFilter,
        Vector2,
        ShaderMaterial,
        Mesh,
        PlaneGeometry,
        LinearMipMapLinearFilter,
      } = THREE;

      if (!mounted || !canvasRef.current) return;

      // Escena, cámara y renderer
      const scene = new Scene();
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer = new WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current = renderer;

      // Shader material
      const shaderMaterial = new ShaderMaterial({
        uniforms: {
          uTexture1: { value: null },
          uTexture2: { value: null },
          uProgress: { value: 0.0 },
          uResolution: {
            value: new Vector2(window.innerWidth, window.innerHeight),
          },
          uTexture1Size: { value: new Vector2(1, 1) },
          uTexture2Size: { value: new Vector2(1, 1) },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
      });
      shaderMaterialRef.current = shaderMaterial;

      // Mesh
      const plane = new Mesh(new PlaneGeometry(2, 2), shaderMaterial);
      scene.add(plane);

      // Lazy load de texturas
      const loadTextures = async () => {
        const loader = new TextureLoader();
        const textures = await Promise.all(
          slides.map(
            (s) =>
              new Promise((resolve) => {
                loader.load(s.image, (t) => {
                  t.generateMipmaps = true; // activar mipmaps
                  t.minFilter = LinearMipMapLinearFilter;
                  t.magFilter = LinearFilter;
                  t.userData = {
                    size: new Vector2(t.image.width, t.image.height),
                  };
                  resolve(t);
                });
              })
          )
        );

        if (!mounted) return;

        texturesRef.current = textures;
        shaderMaterial.uniforms.uTexture1.value = textures[0];
        shaderMaterial.uniforms.uTexture2.value = textures[1 % textures.length];
        shaderMaterial.uniforms.uTexture1Size.value = textures[0].userData.size;
        shaderMaterial.uniforms.uTexture2Size.value =
          textures[1 % textures.length].userData.size;
      };

      // IntersectionObserver para cargar texturas solo cuando el canvas está visible
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadTextures();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      if (canvasRef.current) observer.observe(canvasRef.current);

      // Render loop
      const render = () => {
        if (!mounted) return;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      };
      render();

      // Resize
      resizeListener = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        shaderMaterial.uniforms.uResolution.value.set(
          window.innerWidth,
          window.innerHeight
        );
      };
      window.addEventListener("resize", resizeListener);
    };

    initThree();

    // Cleanup
    return () => {
      mounted = false;
      if (renderer) renderer.dispose();
      if (resizeListener) window.removeEventListener("resize", resizeListener);
    };
  }, [vertexShader, fragmentShader, slides]);

  return { canvasRef, shaderMaterialRef, texturesRef };
}
