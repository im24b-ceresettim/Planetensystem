import { useEffect, useState } from 'react';
import {
  DEFAULT_SPEED_PRESET_ID,
  SPEED_PRESETS,
  speedFromOrbitSeconds,
} from '../data/constants';
import { simState } from '../state/simulation';

export function TimeControls() {
  const [activeId, setActiveId] = useState(DEFAULT_SPEED_PRESET_ID);
  const [days, setDays] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setDays(simState.days), 250);
    return () => window.clearInterval(timer);
  }, []);

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
      <span className="sim-clock">T+{days.toFixed(0)} d</span>
    </div>
  );
}
