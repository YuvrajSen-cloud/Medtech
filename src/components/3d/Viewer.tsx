import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface ViewerProps {
  mode?: 'normal' | 'dissection' | 'pathology';
  selectedOrgan?: string;
}

export function Viewer({ mode = 'normal', selectedOrgan }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    // Dynamic import to ensure single Three.js instance
    import('./three').then(({
      Scene,
      Color,
      PerspectiveCamera,
      WebGLRenderer,
      IcosahedronGeometry,
      MeshStandardMaterial,
      Mesh,
      AmbientLight,
      DirectionalLight,
      PointLight,
    }) => {
      if (!mounted || !containerRef.current) return;

      // Scene setup
      const scene = new Scene();
      scene.background = new Color(mode === 'normal' ? 0x1a1a1a : 0x0a0a0a);
      sceneRef.current = scene;

      // Camera setup
      const camera = new PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Create a placeholder 3D object (rotating anatomical heart-like shape)
      const geometry = new IcosahedronGeometry(1.5, 1);
      const material = new MeshStandardMaterial({
        color: mode === 'pathology' ? 0xef476f : 0x00a896,
        wireframe: mode === 'dissection',
        metalness: 0.3,
        roughness: 0.4,
      });
      const mesh = new Mesh(geometry, material);
      scene.add(mesh);
      meshRef.current = mesh;

      // Lighting
      const ambientLight = new AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const pointLight = new PointLight(0x00a896, 1, 100);
      pointLight.position.set(-5, 5, 5);
      scene.add(pointLight);

      // Animation
      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        if (meshRef.current) {
          meshRef.current.rotation.x += 0.005;
          meshRef.current.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
      };

      setTimeout(() => setIsLoading(false), 500);
      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      // Store cleanup function
      cleanupRef.current = () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        if (containerRef.current && rendererRef.current?.domElement) {
          try {
            containerRef.current.removeChild(rendererRef.current.domElement);
          } catch (e) {
            // Element might already be removed
          }
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }).catch((error) => {
      console.error('Failed to load Three.js:', error);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      mounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [mode, selectedOrgan]);

  return (
    <div className="relative w-full h-full bg-black/5 dark:bg-black/20 rounded-2xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading 3D Model...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Mode Indicator */}
      <motion.div
        className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <p className="text-sm">
          Mode: <span className="text-[#00A896]">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
        </p>
      </motion.div>

      {/* Placeholder for Unity/Babylon.js integration */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
        Ready for Unity WebGL / Babylon.js integration
      </div>
    </div>
  );
}
