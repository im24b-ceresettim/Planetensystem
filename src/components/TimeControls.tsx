import { useEffect, useState } from 'react';
import { SPEED_PRESETS } from '../data/constants';
import { simState } from '../state/simulation';

function label(speed: number): string {
  if (speed === 0) return 'Pause';
  return `${speed} d/s`;
}

export function TimeControls() {
  const [speed, setSpeed] = useState(simState.speedDaysPerSec);
  const [days, setDays] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setDays(simState.days), 250);
    return () => window.clearInterval(timer);
  }, []);

  const pick = (value: number, target: HTMLButtonElement) => {
    simState.speedDaysPerSec = value;
    setSpeed(value);
    target.blur(); // keep Space free for camera movement
  };

  return (
    <div className="time-controls" title="Simulation speed (simulated days per second)">
      {SPEED_PRESETS.map((preset) => (
        <button
          key={preset}
          className={speed === preset ? 'active' : ''}
          onClick={(e) => pick(preset, e.currentTarget)}
        >
          {label(preset)}
        </button>
      ))}
      <span className="sim-clock">T+{days.toFixed(0)} d</span>
    </div>
  );
}
