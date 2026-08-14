import { useCallback, useEffect, useState } from 'react';
import { ControlsHint } from './components/ControlsHint';
import { InfoPanel, InfoReopenButton } from './components/InfoPanel';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Scene } from './components/Scene';
import { TimeControls } from './components/TimeControls';

export default function App() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);

  const handleReleaseFocus = useCallback(() => {
    setFocusedId(null);
    setPanelId(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedId) handleReleaseFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedId, handleReleaseFocus]);

  const handleSelect = useCallback((id: string) => {
    setFocusedId(id);
    setPanelId(null);
  }, []);
  const handleClosePanel = useCallback(() => setPanelId(null), []);

  return (
    <>
      <Scene
        focusedId={focusedId}
        onSelect={handleSelect}
        onReleaseFocus={handleReleaseFocus}
      />
      <InfoPanel panelId={panelId} onClose={handleClosePanel} />
      {focusedId && !panelId && (
        <InfoReopenButton bodyId={focusedId} onOpen={() => setPanelId(focusedId)} />
      )}
      <TimeControls />
      <ControlsHint />
      <LoadingOverlay />
    </>
  );
}
