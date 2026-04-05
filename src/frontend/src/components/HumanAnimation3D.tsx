import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type * as THREE from "three";

interface HumanAnimation3DProps {
  exerciseType: string;
  speed?: number;
  mirrored?: boolean;
}

function getExerciseKey(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("squat")) return "squat";
  if (lower.includes("push")) return "pushup";
  if (lower.includes("plank")) return "plank";
  if (lower.includes("deadlift")) return "deadlift";
  if (lower.includes("bicep") || lower.includes("curl")) return "bicepcurl";
  if (lower.includes("lunge")) return "lunge";
  if (lower.includes("shoulder press") || lower.includes("overhead press"))
    return "shoulderpress";
  if (lower.includes("mountain")) return "mountainclimber";
  if (lower.includes("burpee")) return "burpee";
  if (lower.includes("high knee")) return "highknees";
  if (lower.includes("jumping jack")) return "jumpingjack";
  if (lower.includes("crunch") || lower.includes("sit-up")) return "crunch";
  if (lower.includes("pull-up") || lower.includes("pull up")) return "pullup";
  if (lower.includes("dip")) return "dip";
  return "default";
}

interface BodyRefs {
  head: React.RefObject<THREE.Mesh | null>;
  torso: React.RefObject<THREE.Mesh | null>;
  hips: React.RefObject<THREE.Mesh | null>;
  upperArmL: React.RefObject<THREE.Group | null>;
  upperArmR: React.RefObject<THREE.Group | null>;
  foreArmL: React.RefObject<THREE.Group | null>;
  foreArmR: React.RefObject<THREE.Group | null>;
  thighL: React.RefObject<THREE.Group | null>;
  thighR: React.RefObject<THREE.Group | null>;
  shinL: React.RefObject<THREE.Group | null>;
  shinR: React.RefObject<THREE.Group | null>;
  root: React.RefObject<THREE.Group | null>;
}

function applyAnimation(refs: BodyRefs, key: string, t: number, speed: number) {
  const s = t * speed;
  const sin = Math.sin;
  const cos = Math.cos;

  // Reset all rotations first
  if (refs.torso.current) refs.torso.current.rotation.set(0, 0, 0);
  if (refs.hips.current) refs.hips.current.rotation.set(0, 0, 0);
  if (refs.upperArmL.current) refs.upperArmL.current.rotation.set(0, 0, 0);
  if (refs.upperArmR.current) refs.upperArmR.current.rotation.set(0, 0, 0);
  if (refs.foreArmL.current) refs.foreArmL.current.rotation.set(0, 0, 0);
  if (refs.foreArmR.current) refs.foreArmR.current.rotation.set(0, 0, 0);
  if (refs.thighL.current) refs.thighL.current.rotation.set(0, 0, 0);
  if (refs.thighR.current) refs.thighR.current.rotation.set(0, 0, 0);
  if (refs.shinL.current) refs.shinL.current.rotation.set(0, 0, 0);
  if (refs.shinR.current) refs.shinR.current.rotation.set(0, 0, 0);
  if (refs.root.current) refs.root.current.position.y = 0;

  switch (key) {
    case "squat": {
      const squat = (sin(s * 1.5) + 1) * 0.5;
      if (refs.root.current) refs.root.current.position.y = -squat * 0.35;
      if (refs.torso.current) refs.torso.current.rotation.x = squat * 0.25;
      if (refs.thighL.current) refs.thighL.current.rotation.x = squat * 1.1;
      if (refs.thighR.current) refs.thighR.current.rotation.x = squat * 1.1;
      if (refs.shinL.current) refs.shinL.current.rotation.x = -squat * 1.2;
      if (refs.shinR.current) refs.shinR.current.rotation.x = -squat * 1.2;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.x = squat * 0.5;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.x = squat * 0.5;
      break;
    }
    case "pushup": {
      const push = sin(s * 2);
      if (refs.root.current) {
        refs.root.current.rotation.x = Math.PI / 2.2;
        refs.root.current.position.y = push * 0.08 - 0.5;
      }
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = Math.PI / 2 + push * 0.3;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -Math.PI / 2 - push * 0.3;
      if (refs.foreArmL.current) refs.foreArmL.current.rotation.x = push * 0.5;
      if (refs.foreArmR.current) refs.foreArmR.current.rotation.x = push * 0.5;
      break;
    }
    case "plank": {
      const breathe = sin(s * 0.8) * 0.02;
      if (refs.root.current) {
        refs.root.current.rotation.x = Math.PI / 2.2;
        refs.root.current.position.y = -0.45 + breathe;
      }
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = Math.PI / 2;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -Math.PI / 2;
      break;
    }
    case "deadlift": {
      const hinge = (sin(s * 1.5) + 1) * 0.5;
      if (refs.torso.current) refs.torso.current.rotation.x = hinge * 1.0;
      if (refs.hips.current) refs.hips.current.rotation.x = hinge * 0.5;
      if (refs.thighL.current) refs.thighL.current.rotation.x = hinge * 0.4;
      if (refs.thighR.current) refs.thighR.current.rotation.x = hinge * 0.4;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.x = hinge * 0.8;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.x = hinge * 0.8;
      if (refs.root.current) refs.root.current.position.y = -hinge * 0.15;
      break;
    }
    case "bicepcurl": {
      const curl = (sin(s * 2) + 1) * 0.5;
      if (refs.foreArmL.current) refs.foreArmL.current.rotation.x = -curl * 1.8;
      if (refs.foreArmR.current) refs.foreArmR.current.rotation.x = -curl * 1.8;
      if (refs.upperArmL.current) refs.upperArmL.current.rotation.z = 0.15;
      if (refs.upperArmR.current) refs.upperArmR.current.rotation.z = -0.15;
      break;
    }
    case "lunge": {
      const bob = sin(s * 1.2);
      const step = (sin(s * 1.2) + 1) * 0.5;
      if (refs.root.current) refs.root.current.position.y = -step * 0.25;
      if (refs.thighL.current) refs.thighL.current.rotation.x = step * 0.9;
      if (refs.thighR.current) refs.thighR.current.rotation.x = -step * 0.6;
      if (refs.shinL.current) refs.shinL.current.rotation.x = -step * 0.9;
      if (refs.torso.current) refs.torso.current.rotation.x = bob * 0.05;
      break;
    }
    case "shoulderpress": {
      const press = (sin(s * 2) + 1) * 0.5;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = Math.PI / 2 - press * 1.2;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -(Math.PI / 2 - press * 1.2);
      if (refs.foreArmL.current)
        refs.foreArmL.current.rotation.x = -press * 0.3;
      if (refs.foreArmR.current)
        refs.foreArmR.current.rotation.x = -press * 0.3;
      break;
    }
    case "mountainclimber": {
      if (refs.root.current) {
        refs.root.current.rotation.x = Math.PI / 2.5;
        refs.root.current.position.y = -0.4;
      }
      if (refs.thighL.current)
        refs.thighL.current.rotation.x = sin(s * 3) * 0.7 - 0.3;
      if (refs.thighR.current)
        refs.thighR.current.rotation.x = cos(s * 3) * 0.7 - 0.3;
      if (refs.shinL.current) refs.shinL.current.rotation.x = sin(s * 3) * 0.5;
      if (refs.shinR.current) refs.shinR.current.rotation.x = cos(s * 3) * 0.5;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = Math.PI / 2;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -Math.PI / 2;
      break;
    }
    case "burpee": {
      const cycle = (s * 0.8) % (Math.PI * 2);
      const phase = cycle / (Math.PI * 2);
      if (phase < 0.3) {
        // Stand
        const p = phase / 0.3;
        if (refs.root.current) refs.root.current.position.y = 0;
        if (refs.upperArmL.current) refs.upperArmL.current.rotation.z = p * 0.3;
        if (refs.upperArmR.current)
          refs.upperArmR.current.rotation.z = -p * 0.3;
      } else if (phase < 0.6) {
        // Squat down
        const p = (phase - 0.3) / 0.3;
        if (refs.root.current) refs.root.current.position.y = -p * 0.35;
        if (refs.thighL.current) refs.thighL.current.rotation.x = p * 1.1;
        if (refs.thighR.current) refs.thighR.current.rotation.x = p * 1.1;
        if (refs.shinL.current) refs.shinL.current.rotation.x = -p * 1.2;
        if (refs.shinR.current) refs.shinR.current.rotation.x = -p * 1.2;
      } else {
        // Jump up
        const p = (phase - 0.6) / 0.4;
        if (refs.root.current)
          refs.root.current.position.y =
            Math.sin(p * Math.PI) * 0.2 - 0.35 * (1 - p);
        if (refs.upperArmL.current)
          refs.upperArmL.current.rotation.z = Math.sin(p * Math.PI) * 1.2;
        if (refs.upperArmR.current)
          refs.upperArmR.current.rotation.z = -Math.sin(p * Math.PI) * 1.2;
      }
      break;
    }
    case "highknees": {
      if (refs.thighL.current)
        refs.thighL.current.rotation.x = -sin(s * 3) * 0.8;
      if (refs.thighR.current)
        refs.thighR.current.rotation.x = -cos(s * 3) * 0.8;
      if (refs.shinL.current)
        refs.shinL.current.rotation.x = Math.max(0, sin(s * 3)) * 0.8;
      if (refs.shinR.current)
        refs.shinR.current.rotation.x = Math.max(0, cos(s * 3)) * 0.8;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.x = cos(s * 3) * 0.5;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.x = sin(s * 3) * 0.5;
      if (refs.root.current)
        refs.root.current.position.y = Math.abs(sin(s * 3)) * 0.07;
      break;
    }
    case "jumpingjack": {
      const spread = (sin(s * 2.5) + 1) * 0.5;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = spread * 1.4;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -spread * 1.4;
      if (refs.thighL.current) refs.thighL.current.rotation.z = spread * 0.5;
      if (refs.thighR.current) refs.thighR.current.rotation.z = -spread * 0.5;
      if (refs.root.current) refs.root.current.position.y = spread * 0.08;
      break;
    }
    case "crunch": {
      const crunch = (sin(s * 1.8) + 1) * 0.5;
      if (refs.root.current) refs.root.current.position.y = -crunch * 0.15;
      if (refs.torso.current) refs.torso.current.rotation.x = crunch * 0.7;
      if (refs.thighL.current) refs.thighL.current.rotation.x = crunch * 0.8;
      if (refs.thighR.current) refs.thighR.current.rotation.x = crunch * 0.8;
      if (refs.shinL.current) refs.shinL.current.rotation.x = -crunch * 0.6;
      if (refs.shinR.current) refs.shinR.current.rotation.x = -crunch * 0.6;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = crunch * 0.5;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -crunch * 0.5;
      break;
    }
    case "pullup": {
      const pull = (sin(s * 1.5) + 1) * 0.5;
      if (refs.root.current) refs.root.current.position.y = pull * 0.25;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = 1.3 - pull * 0.4;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -(1.3 - pull * 0.4);
      if (refs.foreArmL.current) refs.foreArmL.current.rotation.x = -pull * 1.2;
      if (refs.foreArmR.current) refs.foreArmR.current.rotation.x = -pull * 1.2;
      if (refs.thighL.current) refs.thighL.current.rotation.x = pull * 0.3;
      if (refs.thighR.current) refs.thighR.current.rotation.x = pull * 0.3;
      break;
    }
    case "dip": {
      const dip = (sin(s * 2) + 1) * 0.5;
      if (refs.root.current) refs.root.current.position.y = -dip * 0.3;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = Math.PI / 2 - dip * 0.5;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -(Math.PI / 2 - dip * 0.5);
      if (refs.foreArmL.current) refs.foreArmL.current.rotation.x = dip * 1.0;
      if (refs.foreArmR.current) refs.foreArmR.current.rotation.x = dip * 1.0;
      break;
    }
    default: {
      // breathing/sway
      const breathe = sin(s * 0.9) * 0.03;
      const sway = sin(s * 0.5) * 0.02;
      if (refs.torso.current) refs.torso.current.rotation.z = sway;
      if (refs.upperArmL.current)
        refs.upperArmL.current.rotation.z = 0.15 + breathe;
      if (refs.upperArmR.current)
        refs.upperArmR.current.rotation.z = -0.15 - breathe;
      break;
    }
  }
}

function HumanoidModel({
  exerciseKey,
  speed,
}: { exerciseKey: string; speed: number }) {
  const refs: BodyRefs = {
    head: useRef<THREE.Mesh | null>(null),
    torso: useRef<THREE.Mesh | null>(null),
    hips: useRef<THREE.Mesh | null>(null),
    upperArmL: useRef<THREE.Group | null>(null),
    upperArmR: useRef<THREE.Group | null>(null),
    foreArmL: useRef<THREE.Group | null>(null),
    foreArmR: useRef<THREE.Group | null>(null),
    thighL: useRef<THREE.Group | null>(null),
    thighR: useRef<THREE.Group | null>(null),
    shinL: useRef<THREE.Group | null>(null),
    shinR: useRef<THREE.Group | null>(null),
    root: useRef<THREE.Group | null>(null),
  };

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    applyAnimation(refs, exerciseKey, timeRef.current, speed);
  });

  const bodyColor = "#60A5FA";
  const limbColor = "#93C5FD";
  const headColor = "#F9FAFB";

  return (
    <group ref={refs.root}>
      {/* Head */}
      <mesh ref={refs.head} position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={headColor} roughness={0.4} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.15, 8]} />
        <meshStandardMaterial color={headColor} roughness={0.4} />
      </mesh>

      {/* Torso */}
      <mesh ref={refs.torso} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.25]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Hips */}
      <mesh ref={refs.hips} position={[0, 0.75, 0]}>
        <boxGeometry args={[0.45, 0.2, 0.22]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Left Upper Arm */}
      <group ref={refs.upperArmL} position={[0.35, 1.25, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.055, 0.28, 8]} />
          <meshStandardMaterial color={limbColor} roughness={0.4} />
        </mesh>
        {/* Left Forearm */}
        <group ref={refs.foreArmL} position={[0, -0.3, 0]}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.26, 8]} />
            <meshStandardMaterial color={limbColor} roughness={0.4} />
          </mesh>
          {/* Left Hand */}
          <mesh position={[0, -0.27, 0]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color={headColor} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Right Upper Arm */}
      <group ref={refs.upperArmR} position={[-0.35, 1.25, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.055, 0.28, 8]} />
          <meshStandardMaterial color={limbColor} roughness={0.4} />
        </mesh>
        {/* Right Forearm */}
        <group ref={refs.foreArmR} position={[0, -0.3, 0]}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.26, 8]} />
            <meshStandardMaterial color={limbColor} roughness={0.4} />
          </mesh>
          {/* Right Hand */}
          <mesh position={[0, -0.27, 0]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color={headColor} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Left Thigh */}
      <group ref={refs.thighL} position={[0.15, 0.65, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.085, 0.075, 0.34, 8]} />
          <meshStandardMaterial color={limbColor} roughness={0.4} />
        </mesh>
        {/* Left Shin */}
        <group ref={refs.shinL} position={[0, -0.37, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.07, 0.055, 0.3, 8]} />
            <meshStandardMaterial color={limbColor} roughness={0.4} />
          </mesh>
          {/* Left Foot */}
          <mesh position={[0, -0.32, 0.04]}>
            <boxGeometry args={[0.1, 0.06, 0.18]} />
            <meshStandardMaterial color={headColor} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Right Thigh */}
      <group ref={refs.thighR} position={[-0.15, 0.65, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.085, 0.075, 0.34, 8]} />
          <meshStandardMaterial color={limbColor} roughness={0.4} />
        </mesh>
        {/* Right Shin */}
        <group ref={refs.shinR} position={[0, -0.37, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.07, 0.055, 0.3, 8]} />
            <meshStandardMaterial color={limbColor} roughness={0.4} />
          </mesh>
          {/* Right Foot */}
          <mesh position={[0, -0.32, 0.04]}>
            <boxGeometry args={[0.1, 0.06, 0.18]} />
            <meshStandardMaterial color={headColor} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Scene({
  exerciseType,
  speed,
}: { exerciseType: string; speed: number }) {
  const key = getExerciseKey(exerciseType);
  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 2]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-2, 2, -2]} intensity={0.4} color="#3B82F6" />
      <HumanoidModel exerciseKey={key} speed={speed} />
      <OrbitControls
        enablePan={false}
        autoRotate={false}
        enableDamping
        minDistance={2}
        maxDistance={6}
      />
    </>
  );
}

export default function HumanAnimation3D({
  exerciseType,
  speed = 1,
  mirrored = false,
}: HumanAnimation3DProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: mirrored ? "scaleX(-1)" : undefined,
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60A5FA",
              fontSize: 14,
            }}
          >
            Loading 3D...
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 1.2, 3.5], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Scene exerciseType={exerciseType} speed={speed} />
        </Canvas>
      </Suspense>
    </div>
  );
}
