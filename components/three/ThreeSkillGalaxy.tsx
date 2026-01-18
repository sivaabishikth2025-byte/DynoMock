"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Float, Text, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useDemoStore } from "@/store/useDemoStore";
import { mockUser } from "@/lib/mockData";

interface SkillSphereProps {
  category: string;
  strength: number;
  wobble: number;
  color: string;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}

function SkillSphere({ category, strength, wobble, color, position, onClick, isSelected }: SkillSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const size = 0.3 + strength * 0.5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
      
      if (wobble > 0.3) {
        meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * wobble * 0.15;
        meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 1.5 + position[1]) * wobble * 0.15;
      }
    }
    if (glowRef.current) {
      const scale = (hovered || isSelected) ? 1.8 : 1.4;
      glowRef.current.scale.setScalar(size * scale + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = (hovered || isSelected) ? 0.4 : 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        <mesh
          ref={glowRef}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <sphereGeometry args={[size * 1.4, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
        
        <mesh
          ref={meshRef}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <icosahedronGeometry args={[size, wobble > 0.3 ? 1 : 2]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={(hovered || isSelected) ? 0.6 : 0.3}
            distort={wobble * 0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        <Text
          position={[0, size + 0.3, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {category}
        </Text>
        
        <Text
          position={[0, size + 0.1, 0]}
          fontSize={0.1}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(strength * 100)}%
        </Text>
      </group>
    </Float>
  );
}

function OrbitRing({ radius, opacity = 0.1 }: { radius: number; opacity?: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
      <meshBasicMaterial color="#a78bfa" transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

function CenterCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });
  
  return (
    <group>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.3, 2]} />
        <MeshDistortMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={0.5}
          distort={0.2}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#22d3ee" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Scene({ onCategorySelect, selectedCategory }: { onCategorySelect: (category: string | null) => void; selectedCategory: string | null }) {
  const skills = mockUser.skills;
  
  const positions: [number, number, number][] = useMemo(() => {
    return skills.map((_, i) => {
      const angle = (i / skills.length) * Math.PI * 2;
      const radius = 2.5;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle * 0.5) * 0.5,
        Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, [skills]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#22d3ee" />
      <spotLight position={[0, 10, 0]} intensity={0.4} angle={0.5} penumbra={0.5} color="#ffffff" />
      
      <CenterCore />
      <OrbitRing radius={2.5} opacity={0.15} />
      <OrbitRing radius={3.5} opacity={0.08} />
      <OrbitRing radius={4.5} opacity={0.04} />
      
      {skills.map((skill, i) => (
        <SkillSphere
          key={skill.category}
          category={skill.category}
          strength={skill.strength}
          wobble={skill.wobble}
          color={skill.color}
          position={positions[i]}
          onClick={() => onCategorySelect(selectedCategory === skill.category ? null : skill.category)}
          isSelected={selectedCategory === skill.category}
        />
      ))}
      
      <Particles />
      <Environment preset="night" />
    </>
  );
}

interface ThreeSkillGalaxyProps {
  className?: string;
}

export function ThreeSkillGalaxy({ className }: ThreeSkillGalaxyProps) {
  const { selectedCategory, setSelectedCategory } = useDemoStore();

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene onCategorySelect={setSelectedCategory} selectedCategory={selectedCategory} />
      </Canvas>
    </div>
  );
}
