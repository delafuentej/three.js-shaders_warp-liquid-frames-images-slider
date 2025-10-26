import { useEffect, useRef } from "react";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  TextureLoader,
  LinearFilter,
  Vector2,
  ShaderMaterial,
  Mesh,
  PlaneGeometry,
} from "three";

export function useThreeScene(vertexShader, fragmentShader, slides) {
  const canvasRef = useRef(null);
  const shaderMaterialRef = useRef(null);
  const rendererRef = useRef(null);
  const texturesRef = useRef([]);

  useEffect(() => {
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const loader = new TextureLoader();
    const loadPromises = slides.map(
      (s) =>
        new Promise((resolve) => {
          loader.load(s.image, (t) => {
            t.minFilter = t.magFilter = LinearFilter;
            t.userData = {
              size: new Vector2(t.image.width, t.image.height),
            };
            resolve(t);
          });
        })
    );

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

    const plane = new Mesh(new PlaneGeometry(2, 2), shaderMaterial);
    scene.add(plane);

    let mounted = true;
    const render = () => {
      if (!mounted) return;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    Promise.all(loadPromises).then((textures) => {
      texturesRef.current = textures;
      shaderMaterial.uniforms.uTexture1.value = textures[0];
      shaderMaterial.uniforms.uTexture2.value = textures[1 % textures.length];
      shaderMaterial.uniforms.uTexture1Size.value = textures[0].userData.size;
      shaderMaterial.uniforms.uTexture2Size.value =
        textures[1 % textures.length].userData.size;
      render();
    });

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener("resize", handleResize);
    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [vertexShader, fragmentShader, slides]);

  return { canvasRef, shaderMaterialRef, texturesRef };
}
