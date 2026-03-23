import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingSpheres() {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.05;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
        <Sphere args={[1, 64, 64]} position={[-4, 2, -5]}>
          <MeshDistortMaterial color="#aa3bff" attach="material" distort={0.5} speed={1.5} roughness={0.1} metalness={0.8} />
        </Sphere>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[0.8, 64, 64]} position={[5, -1, -6]}>
          <MeshDistortMaterial color="#4f46e5" attach="material" distort={0.3} speed={2} roughness={0.2} metalness={0.9} />
        </Sphere>
      </Float>
      
      <Float speed={2.5} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[0.5, 32, 32]} position={[-2, -3, -4]}>
          <MeshDistortMaterial color="#06b6d4" attach="material" distort={0.4} speed={1.2} roughness={0.1} metalness={0.8} />
        </Sphere>
      </Float>
    </group>
  );
}

function Grid() {
  const gridHelper = useRef();
  
  useFrame((state) => {
    // Animate grid towards user
    if (gridHelper.current) {
      gridHelper.current.position.z = (state.clock.elapsedTime * 0.5) % 1;
    }
  });

  return (
    <gridHelper 
      ref={gridHelper}
      args={[100, 50, '#1a1a2e', '#0f0f1a']} 
      position={[0, -5, 0]} 
    />
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-darker">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#08060d']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#aa3bff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#06b6d4" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <FloatingSpheres />
        <Grid />
        
        {/* Subtle Fog for depth */}
        <fog attach="fog" args={['#08060d', 5, 25]} />
      </Canvas>
    </div>
  );
}
