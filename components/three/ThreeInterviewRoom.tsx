"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useDemoStore } from "@/store/useDemoStore";

function Microphone({ isSpeaking, audioLevel }: { isSpeaking: boolean; audioLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + audioLevel * 0.3;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1));
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1 + audioLevel * 0.5);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = isSpeaking ? 0.3 + audioLevel * 0.3 : 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[-2, 0, 0]}>
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} />
        </mesh>
        <mesh ref={meshRef}>
          <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
          <MeshDistortMaterial
            color={isSpeaking ? "#22d3ee" : "#a78bfa"}
            emissive={isSpeaking ? "#22d3ee" : "#a78bfa"}
            emissiveIntensity={isSpeaking ? 0.5 : 0.2}
            distort={isSpeaking ? 0.2 : 0.05}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

function TimerRing({ timeRemaining, totalTime = 1800 }: { timeRemaining: number; totalTime?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const progress = timeRemaining / totalTime;

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.2, 0, Math.PI * 2 * progress, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, [progress]);

  return (
    <group position={[2, 0.5, -1]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[1, 1.2, 64]} />
        <meshBasicMaterial color="#1f2937" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <primitive object={ringGeometry} attach="geometry" />
        <meshBasicMaterial
          color={progress > 0.5 ? "#34d399" : progress > 0.25 ? "#fbbf24" : "#ef4444"}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function HintBeacon({ hintReady, onClick }: { hintReady: boolean; onClick: () => void }) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beaconRef.current && hintReady) {
      beaconRef.current.rotation.y = state.clock.elapsedTime;
      beaconRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (pulseRef.current && hintReady) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      pulseRef.current.scale.setScalar(scale);
      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 - Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={[0, 1.5, -0.5]} onClick={onClick} style={{ cursor: hintReady ? "pointer" : "default" } as React.CSSProperties}>
        {hintReady && (
          <mesh ref={pulseRef}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
          </mesh>
        )}
        <mesh ref={beaconRef}>
          <octahedronGeometry args={[0.2, 0]} />
          <MeshDistortMaterial
            color={hintReady ? "#fbbf24" : "#4b5563"}
            emissive={hintReady ? "#fbbf24" : "#000000"}
            emissiveIntensity={hintReady ? 0.8 : 0}
            distort={hintReady ? 0.1 : 0}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Desk() {
  return (
    <group position={[0, -1.5, 0]}>
      <RoundedBox args={[6, 0.15, 2.5]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.15, 1.2, 0.15]} radius={0.02} smoothness={4} position={[-2.5, -0.6, 1]}>
        <meshStandardMaterial color="#0f0f1a" metalness={0.5} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.15, 1.2, 0.15]} radius={0.02} smoothness={4} position={[2.5, -0.6, 1]}>
        <meshStandardMaterial color="#0f0f1a" metalness={0.5} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.15, 1.2, 0.15]} radius={0.02} smoothness={4} position={[-2.5, -0.6, -1]}>
        <meshStandardMaterial color="#0f0f1a" metalness={0.5} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.15, 1.2, 0.15]} radius={0.02} smoothness={4} position={[2.5, -0.6, -1]}>
        <meshStandardMaterial color="#0f0f1a" metalness={0.5} roughness={0.5} />
      </RoundedBox>
    </group>
  );
}

function Monitor() {
  return (
    <group position={[0, 0.3, -0.8]}>
      <RoundedBox args={[2.5, 1.5, 0.08]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#0a0a14" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.3, 1.35]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
      <RoundedBox args={[0.3, 0.4, 0.1]} radius={0.02} smoothness={4} position={[0, -0.95, 0.2]}>
        <meshStandardMaterial color="#0f0f1a" metalness={0.5} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.05, 0.4]} radius={0.02} smoothness={4} position={[0, -1.1, 0.2]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.3} roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#a78bfa" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene({ onHintClick }: { onHintClick: () => void }) {
  const { interview } = useDemoStore();

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#a78bfa" />
      <pointLight position={[-5, 3, 2]} intensity={0.3} color="#22d3ee" />
      <spotLight position={[0, 5, 0]} intensity={0.4} angle={0.5} penumbra={0.5} color="#ffffff" />
      
      <Desk />
      <Monitor />
      <Microphone isSpeaking={interview.isSpeaking} audioLevel={interview.audioLevel} />
      <TimerRing timeRemaining={interview.timeRemaining} />
      <HintBeacon hintReady={interview.hintReady} onClick={onHintClick} />
      <Particles />
      
      <Environment preset="night" />
    </>
  );
}

interface ThreeInterviewRoomProps {
  onHintClick?: () => void;
  className?: string;
}

export function ThreeInterviewRoom({ onHintClick = () => {}, className }: ThreeInterviewRoomProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene onHintClick={onHintClick} />
      </Canvas>
    </div>
  );
}
