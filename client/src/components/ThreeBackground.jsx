import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingSpheres() {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.05;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[1, 64, 64]} position={[-6, 2, -5]}>
          <MeshDistortMaterial color="#4f46e5" opacity={0.1} transparent attach="material" distort={0.3} speed={1} roughness={1} metalness={0} />
        </Sphere>
      </Float>
      
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1.5}>
        <Sphere args={[0.8, 64, 64]} position={[6, -2, -8]}>
          <MeshDistortMaterial color="#6366f1" opacity={0.05} transparent attach="material" distort={0.2} speed={1.5} roughness={1} metalness={0} />
        </Sphere>
      </Float>
    </group>
  );
}

function Grid() {
  const gridHelper = useRef();
  
  useFrame((state) => {
    if (gridHelper.current) {
      gridHelper.current.position.z = (state.clock.elapsedTime * 0.2) % 1;
    }
  });

  return (
    <gridHelper 
      ref={gridHelper}
      args={[100, 40, '#e2e8f0', '#f1f5f9']} 
      position={[0, -4, 0]} 
    />
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#4f46e5" />
        
        <FloatingSpheres />
        <Grid />
        
        {/* Subtle Fog for depth */}
        <fog attach="fog" args={['#f8fafc', 8, 30]} />
      </Canvas>
    </div>
  );
}
