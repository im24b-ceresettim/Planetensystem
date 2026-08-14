import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { AsteroidBelt } from './AsteroidBelt';
import { CameraController } from './CameraController';
import { SolarSystem } from './SolarSystem';
import { Starfield } from './Starfield';

export interface SceneProps {
  focusedId: string | null;
  onSelect: (id: string) => void;
  onReleaseFocus: () => void;
}

export function Scene({ focusedId, onSelect, onReleaseFocus }: SceneProps) {
  return (
    <div className="scene-root" onContextMenu={(e) => e.preventDefault()}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 40000, position: [0, 70, 190] }}
        onPointerMissed={(e) => {
          if (e.button === 0 && focusedId) onReleaseFocus();
        }}
      >
        <color attach="background" args={['#02030a']} />
        <ambientLight intensity={0.07} />
        <Suspense fallback={null}>
          <Starfield />
          <SolarSystem onSelect={onSelect} />
          <AsteroidBelt />
        </Suspense>
        <CameraController focusedId={focusedId} />
        <EffectComposer multisampling={4}>
          <Bloom intensity={1.0} luminanceThreshold={1.0} luminanceSmoothing={0.25} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
