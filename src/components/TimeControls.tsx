import { useState } from 'react';
import {
  DEFAULT_SPEED_PRESET_ID,
  SPEED_PRESETS,
  speedFromOrbitSeconds,
} from '../data/constants';
import { simState } from '../state/simulation';

export function TimeControls() {
  const [activeId, setActiveId] = useState(DEFAULT_SPEED_PRESET_ID);

  const pick = (presetId: string, orbitSeconds: number, target: HTMLButtonElement) => {
    simState.speedDaysPerSec = speedFromOrbitSeconds(orbitSeconds);
    setActiveId(presetId);
    target.blur(); // keep Space free for camera movement
  };

  return (
    <div className="time-controls">
      {SPEED_PRESETS.map((preset) => (
        <button
          key={preset.id}
          className={activeId === preset.id ? 'active' : ''}
          title={preset.tooltip}
          onClick={(e) => pick(preset.id, preset.orbitSeconds, e.currentTarget)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
