import { useFrame } from '@react-three/fiber';
import { bodyById, childrenOf } from '../data/bodies';
import { bodyRegistry, simState } from '../state/simulation';
import { orbitAngleRad, spinAngleRad } from '../utils/orbits';
import { CelestialBody } from './CelestialBody';

export function SolarSystem({ onSelect }: { onSelect: (id: string) => void }) {
  // Advance the clock and move every registered body. Runs at priority -10 so
  // positions are final before the camera (priority -5) reads them.
  useFrame((_, dt) => {
    simState.days += Math.min(dt, 0.1) * simState.speedDaysPerSec;
    const days = simState.days;
    for (const h of bodyRegistry.values()) {
      if (h.orbitRadiusUnits > 0 && h.def.orbitalPeriodDays) {
        const a = orbitAngleRad(h.def, days);
        h.orbitGroup.position.set(
          Math.cos(a) * h.orbitRadiusUnits,
          0,
          -Math.sin(a) * h.orbitRadiusUnits,
        );
      }
      if (h.def.rotationPeriodHours) {
        h.spinAnchor.rotation.y = spinAngleRad(h.def, days);
      }
    }
  }, -10);

  const sun = bodyById.get('sun')!;

  return (
    <>
      <pointLight intensity={2.6} decay={0} distance={0} color="#fff2dd" />
      <CelestialBody def={sun} onSelect={onSelect} />
      {childrenOf('sun').map((def) => (
        <CelestialBody key={def.id} def={def} onSelect={onSelect} />
      ))}
    </>
  );
}
