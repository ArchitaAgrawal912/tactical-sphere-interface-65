import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const HelmetMesh = () => {
  const meshRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow gentle rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
    if (scanLineRef.current) {
      // Scanning line effect - moves up and down
      const scanY = Math.sin(state.clock.elapsedTime * 0.8) * 0.8;
      scanLineRef.current.position.y = scanY;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Main helmet body */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            color="#1E2228"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 0.1, 0.6]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[1.2, 0.5, 0.3]} />
          <meshStandardMaterial
            color="#0A0C10"
            metalness={1}
            roughness={0.1}
            envMapIntensity={2}
          />
        </mesh>

        {/* Visor glow */}
        <mesh position={[0, 0.1, 0.75]} rotation={[0.2, 0, 0]}>
          <planeGeometry args={[1.1, 0.4]} />
          <meshBasicMaterial
            color="#4FD1C5"
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Scanning line */}
        <mesh ref={scanLineRef} position={[0, 0, 1.1]}>
          <planeGeometry args={[1.5, 0.02]} />
          <meshBasicMaterial
            color="#4FD1C5"
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Side accents */}
        <mesh position={[0.9, 0, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.4]} />
          <meshStandardMaterial
            color="#4FD1C5"
            emissive="#4FD1C5"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.4]} />
          <meshStandardMaterial
            color="#4FD1C5"
            emissive="#4FD1C5"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Top sensor */}
        <mesh position={[0, 0.85, 0.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial
            color="#F6AD55"
            emissive="#F6AD55"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
};

const Helmet3D = () => {
  return (
    <div className="w-full h-[500px] relative">
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-teal/10 rounded-full blur-[100px]" />
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          color="#4FD1C5"
        />
        <spotLight
          position={[-10, -10, -10]}
          angle={0.15}
          penumbra={1}
          intensity={0.5}
          color="#F6AD55"
        />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
        
        <HelmetMesh />
        
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
          far={4}
          color="#4FD1C5"
        />
        
        <Environment preset="city" />
      </Canvas>

      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 border border-teal/20 rounded-full animate-spin-slow" />
        <div className="absolute w-96 h-96 border border-dashed border-teal/10 rounded-full animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "30s" }} />
      </div>
    </div>
  );
};

export default Helmet3D;
