import { useMemo } from 'react';
import { Stars, useTexture } from '@react-three/drei';
import { BackSide, SRGBColorSpace } from 'three';
import { STARFIELD_RADIUS, STARFIELD_TEXTURE } from '../data/constants';

export function Starfield() {
  const map = useTexture(STARFIELD_TEXTURE);
  useMemo(() => {
    map.colorSpace = SRGBColorSpace;
  }, [map]);

  return (
    <>
      <mesh raycast={() => {}}>
        <sphereGeometry args={[STARFIELD_RADIUS, 64, 32]} />
        <meshBasicMaterial map={map} side={BackSide} depthWrite={false} />
      </mesh>
      <Stars radius={5200} depth={2600} count={6000} factor={26} saturation={0} fade speed={0.4} />
    </>
  );
}
