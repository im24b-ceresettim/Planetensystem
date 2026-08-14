import { useState } from 'react';

const STORAGE_KEY = 'ss-hint-collapsed';

export function ControlsHint() {
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== '1');

  const toggle = (next: boolean) => {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, next ? '0' : '1');
  };

  if (!open) {
    return (
      <button className="hint-toggle" title="Show controls" onClick={() => toggle(true)}>
        ?
      </button>
    );
  }

  return (
    <div className="controls-hint">
      <h3>
        Controls
        <button title="Hide" onClick={() => toggle(false)}>
          —
        </button>
      </h3>
      <ul>
        <li>
          <b>Left-drag</b> <span>move horizontally</span>
        </li>
        <li>
          <b>Right-drag</b> <span>look around</span>
        </li>
        <li>
          <b>Scroll</b> <span>zoom in / out</span>
        </li>
        <li>
          <b>Space / Shift</b> <span>move up / down</span>
        </li>
        <li>
          <b>Search</b> <span>find and focus any body</span>
        </li>
        <li>
          <b>Click a body</b> <span>focus camera</span>
        </li>
        <li>
          <b>Esc</b> <span>release camera focus</span>
        </li>
        <li>
          <b>Click empty space</b> <span>release camera focus</span>
        </li>
      </ul>
      <p className="fine-print">
        Sizes and distances are compressed for visibility; orbits, spins and distances use real
        periods and values. Textures © Solar System Scope (CC BY 4.0) and NASA.
      </p>
    </div>
  );
}
