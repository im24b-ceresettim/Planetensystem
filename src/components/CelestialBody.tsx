import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, Line, useCursor, useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  DoubleSide,
  MathUtils,
  RingGeometry,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type Texture,
} from 'three';
import { childrenOf, type BodyDef } from '../data/bodies';
import { EARTH_CLOUDS_TEXTURE, EARTH_NIGHT_TEXTURE } from '../data/constants';
import { bodyRegistry, simState } from '../state/simulation';
import { bodyRadiusUnits, orbitRadiusUnits } from '../utils/scales';

function prepare(tex: Texture) {
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
}

function OrbitLine({ radius, moon }: { radius: number; moon: boolean }) {
  const points = useMemo(() => {
    const n = Math.min(512, Math.max(96, Math.round(radius * 2)));
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, -Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);
  return (
    <Line
      points={points}
      color="#b8c0cc"
      transparent
      opacity={moon ? 0.2 : 0.26}
      lineWidth={moon ? 0.25 : 0.5}
    />
  );
}

function PlanetRing({ def, radius }: { def: BodyDef; radius: number }) {
  const ring = def.ring!;
  const map = useTexture(ring.texture);
  useMemo(() => prepare(map), [map]);

  const geometry = useMemo(() => {
    const inner = radius * ring.innerScale;
    const outer = radius * ring.outerScale;
    const geo = new RingGeometry(inner, outer, 160, 1);
    // Remap UVs so the ring texture strip runs radially outwards.
    const pos = geo.attributes.position as BufferAttribute;
    const uv = geo.attributes.uv as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const t = (Math.hypot(pos.getX(i), pos.getY(i)) - inner) / (outer - inner);
      uv.setXY(i, t, 0.5);
    }
    return geo;
  }, [radius, ring]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshBasicMaterial
        map={map}
        color="#cfc8bb"
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function EarthSurface({ radius, dayMap }: { radius: number; dayMap: Texture }) {
  const [night, clouds] = useTexture([EARTH_NIGHT_TEXTURE, EARTH_CLOUDS_TEXTURE]);
  useMemo(() => {
    prepare(night);
    prepare(clouds);
  }, [night, clouds]);

  const cloudRef = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += dt * simState.speedDaysPerSec * 0.4;
    }
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshStandardMaterial
          map={dayMap}
          emissiveMap={night}
          emissive="#ffe0a8"
          emissiveIntensity={0.55}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.015}>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshStandardMaterial
          map={clouds}
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

const SUN_TINT = new Color(2.1, 1.8, 1.45);

function BodySurface({ def, radius }: { def: BodyDef; radius: number }) {
  const map = useTexture(def.texture);
  useMemo(() => prepare(map), [map]);

  if (def.type === 'star') {
    return (
      <mesh>
        <sphereGeometry args={[radius, 96, 48]} />
        <meshBasicMaterial map={map} color={SUN_TINT} toneMapped={false} />
      </mesh>
    );
  }
  if (def.id === 'earth') {
    return <EarthSurface radius={radius} dayMap={map} />;
  }
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 32]} />
      <meshStandardMaterial map={map} color={def.tint ?? '#ffffff'} roughness={1} metalness={0} />
    </mesh>
  );
}

export interface CelestialBodyProps {
  def: BodyDef;
  onSelect: (id: string) => void;
}

export function CelestialBody({ def, onSelect }: CelestialBodyProps) {
  const orbitGroup = useRef<Group>(null);
  const spinAnchor = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const radius = useMemo(() => bodyRadiusUnits(def), [def]);
  const orbitR = useMemo(() => orbitRadiusUnits(def), [def]);
  const tiltRad = MathUtils.degToRad(def.axialTiltDeg ?? 0);
  const isStar = def.type === 'star';
  // Small bodies get an invisible, larger pick sphere so they stay clickable.
  const pickRadius = Math.max(radius * 1.35, def.type === 'moon' ? 0.32 : 1.05);

  useEffect(() => {
    if (!orbitGroup.current || !spinAnchor.current) return;
    bodyRegistry.set(def.id, {
      def,
      orbitGroup: orbitGroup.current,
      spinAnchor: spinAnchor.current,
      radiusUnits: radius,
      orbitRadiusUnits: orbitR,
    });
    return () => {
      bodyRegistry.delete(def.id);
    };
  }, [def, radius, orbitR]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta <= 5) onSelect(def.id); // ignore drag-release "clicks"
  };

  return (
    <>
      {orbitR > 0 && <OrbitLine radius={orbitR} moon={def.type === 'moon'} />}
      <group ref={orbitGroup}>
        <group rotation={[0, 0, tiltRad]}>
          <group ref={spinAnchor}>
            <BodySurface def={def} radius={radius} />
          </group>
          {def.ring && <PlanetRing def={def} radius={radius} />}
          {!isStar &&
            childrenOf(def.id).map((child) => (
              <CelestialBody key={child.id} def={child} onSelect={onSelect} />
            ))}
        </group>
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[pickRadius, 16, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        {hovered && (
          <Html position={[0, radius + 0.4, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="body-label">{def.name}</div>
          </Html>
        )}
      </group>
    </>
  );
}
