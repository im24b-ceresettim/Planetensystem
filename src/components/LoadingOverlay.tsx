import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingOverlay() {
  const { active, progress } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = window.setTimeout(() => setDone(true), 500);
      return () => window.clearTimeout(t);
    }
  }, [active, progress]);

  // Safety net: never trap the user on the loader.
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 15000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={done ? 'loading-overlay hidden' : 'loading-overlay'}>
      <div className="loading-title">Solar System</div>
      <div className="loading-bar">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-subtitle">Loading textures — {progress.toFixed(0)}%</div>
    </div>
  );
}
