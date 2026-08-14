import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, type InstancedMesh } from 'three';
import { AU_TO_UNITS } from '../data/constants';
import { simState } from '../state/simulation';

const COUNT = 1500;
const TWO_PI = Math.PI * 2;

interface BeltData {
  radius: Float32Array;
  angle0: Float32Array;
  y: Float32Array;
  scale: Float32Array;
  /** Radians per simulated day, Kepler-like falloff with distance. */
  angVel: Float32Array;
}

export function AsteroidBelt() {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const data = useMemo<BeltData>(() => {
    const d: BeltData = {
      radius: new Float32Array(COUNT),
      angle0: new Float32Array(COUNT),
      y: new Float32Array(COUNT),
      scale: new Float32Array(COUNT),
      angVel: new Float32Array(COUNT),
    };
    for (let i = 0; i < COUNT; i++) {
      const rAu = 2.1 + Math.random() * 1.25;
      d.radius[i] = rAu * AU_TO_UNITS;
      d.angle0[i] = Math.random() * TWO_PI;
      d.y[i] = (Math.random() - 0.5) * 5;
      d.scale[i] = 0.05 + Math.random() * Math.random() * 0.22;
      d.angVel[i] = TWO_PI / (1680 * Math.pow(rAu / 2.77, 1.5));
    }
    return d;
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const days = simState.days;
    for (let i = 0; i < COUNT; i++) {
      const a = data.angle0[i] + days * data.angVel[i];
      dummy.position.set(Math.cos(a) * data.radius[i], data.y[i], -Math.sin(a) * data.radius[i]);
      dummy.rotation.set(a * 2.3, a * 3.1, 0);
      dummy.scale.setScalar(data.scale[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8a8071" roughness={1} metalness={0} />
    </instancedMesh>
  );
}
