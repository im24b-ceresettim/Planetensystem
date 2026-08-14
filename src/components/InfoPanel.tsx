import { useEffect, useState, type ReactNode } from 'react';
import { bodyById, childrenOf, type BodyDef } from '../data/bodies';
import { AU_KM } from '../data/constants';
import { simState } from '../state/simulation';
import { distanceAu } from '../utils/orbits';

function formatMass(kg: number): ReactNode {
  const exp = Math.floor(Math.log10(kg));
  const mantissa = kg / 10 ** exp;
  return (
    <>
      {mantissa.toFixed(2)} × 10<sup>{exp}</sup> kg
    </>
  );
}

function formatPeriod(days: number): string {
  const abs = Math.abs(days);
  const retro = days < 0 ? ' (retrograde)' : '';
  if (abs >= 2 * 365.25) return `${(abs / 365.25).toFixed(1)} years${retro}`;
  if (abs < 2) return `${(abs * 24).toFixed(1)} hours${retro}`;
  return `${abs.toFixed(1)} days${retro}`;
}

function formatRotation(hours: number): string {
  const abs = Math.abs(hours);
  const retro = hours < 0 ? ' (retrograde)' : '';
  if (abs >= 48) return `${(abs / 24).toFixed(1)} days${retro}`;
  return `${abs.toFixed(1)} hours${retro}`;
}

function formatDistance(au: number): string {
  const km = au * AU_KM;
  if (au < 0.02) return `${Math.round(km).toLocaleString('en-US')} km`;
  return `${au.toFixed(3)} AU (${(km / 1e6).toFixed(1)} M km)`;
}

function typeLabel(def: BodyDef): string {
  switch (def.type) {
    case 'star':
      return 'Star';
    case 'planet':
      return 'Planet';
    case 'dwarf':
      return 'Dwarf planet';
    case 'moon':
      return `Moon of ${bodyById.get(def.parentId!)?.name ?? '?'}`;
  }
}

function Stat({ label, value, live }: { label: string; value: ReactNode; live?: boolean }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={live ? 'stat-value live' : 'stat-value'}>{value}</span>
    </div>
  );
}

export interface InfoPanelProps {
  panelId: string | null;
  onClose: () => void;
}

export function InfoPanel({ panelId, onClose }: InfoPanelProps) {
  const def = panelId ? bodyById.get(panelId) : undefined;
  const [dist, setDist] = useState({ sun: 0, earth: 0 });

  useEffect(() => {
    if (!def) return;
    const update = () =>
      setDist({
        sun: distanceAu(def.id, 'sun', simState.days),
        earth: distanceAu(def.id, 'earth', simState.days),
      });
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [def]);

  if (!def) return null;

  const moonCount = childrenOf(def.id).filter((c) => c.type === 'moon').length;

  return (
    <aside className="info-panel">
      <div className="info-panel-header">
        <h2>{def.name}</h2>
        <button className="close-button" onClick={onClose} title="Close panel">
          ✕
        </button>
      </div>
      <span className="body-type">{typeLabel(def)}</span>
      <p className="description">{def.facts.description}</p>

      <div className="stats-grid">
        <Stat label="Diameter" value={`${Math.round(def.radiusKm * 2).toLocaleString('en-US')} km`} />
        <Stat label="Mass" value={formatMass(def.massKg)} />
        {def.orbitalPeriodDays !== undefined && (
          <Stat label="Orbital period" value={formatPeriod(def.orbitalPeriodDays)} />
        )}
        {def.rotationPeriodHours !== undefined && (
          <Stat label="Rotation period" value={formatRotation(def.rotationPeriodHours)} />
        )}
        {def.axialTiltDeg !== undefined && (
          <Stat label="Axial tilt" value={`${def.axialTiltDeg.toFixed(1)}°`} />
        )}
        {def.id !== 'sun' && (
          <Stat label="Distance to Sun" value={formatDistance(dist.sun)} live />
        )}
        {def.id !== 'earth' && (
          <Stat label="Distance to Earth" value={formatDistance(dist.earth)} live />
        )}
        {moonCount > 0 && <Stat label="Moons shown here" value={moonCount} />}
        {def.facts.atmosphere && <Stat label="Atmosphere" value={def.facts.atmosphere} />}
        {def.facts.discovered && <Stat label="Discovered" value={def.facts.discovered} />}
      </div>

      <p className="esc-hint">
        Camera is locked to {def.name}. <kbd>Esc</kbd> or click empty space to release ·{' '}
        <kbd>right-drag</kbd> orbit · <kbd>scroll</kbd> zoom
      </p>
    </aside>
  );
}

export function InfoReopenButton({ bodyId, onOpen }: { bodyId: string; onOpen: () => void }) {
  const name = bodyById.get(bodyId)?.name ?? 'Body';
  return (
    <button className="info-reopen" onClick={onOpen} title={`Show ${name} info`} type="button">
      <span className="info-reopen-label">{name}</span>
      <span className="info-reopen-icon" aria-hidden>
        ℹ
      </span>
    </button>
  );
}
