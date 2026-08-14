import { useCallback, useEffect, useState } from 'react';
import { ControlsHint } from './components/ControlsHint';
import { InfoPanel } from './components/InfoPanel';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Scene } from './components/Scene';
import { TimeControls } from './components/TimeControls';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleClose = useCallback(() => setSelectedId(null), []);

  return (
    <>
      <Scene selectedId={selectedId} onSelect={handleSelect} />
      <InfoPanel selectedId={selectedId} onClose={handleClose} />
      <TimeControls />
      <ControlsHint />
      <LoadingOverlay />
    </>
  );
}
