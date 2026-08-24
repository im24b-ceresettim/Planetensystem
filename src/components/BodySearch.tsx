import { useEffect, useMemo, useRef, useState } from 'react';
import { BODIES, bodyById, type BodyDef } from '../data/bodies';

// test comment

function bodySubtitle(def: BodyDef): string {
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

function bodySearchText(def: BodyDef): string {
  return `${def.name} ${def.id} ${bodySubtitle(def)}`.toLowerCase();
}

function matchesQuery(def: BodyDef, q: string): boolean {
  return bodySearchText(def).includes(q);
}

export interface BodySearchProps {
  onSelect: (id: string) => void;
}

export function BodySearch({ onSelect }: BodySearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? BODIES.filter((b) => matchesQuery(b, q)) : [...BODIES];
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (id: string) => {
    onSelect(id);
    close();
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (!open) {
    return (
      <button
        className="body-search-toggle"
        type="button"
        title="Search objects"
        aria-label="Search objects"
        onClick={() => setOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="body-search" ref={rootRef}>
      <div className="body-search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          className="body-search-input"
          type="search"
          placeholder="Search planets, moons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search celestial objects"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="body-search-close" type="button" title="Close search" onClick={close}>
          ✕
        </button>
      </div>
      <ul className="body-search-results" role="listbox">
        {results.length === 0 ? (
          <li className="body-search-empty">No matching objects</li>
        ) : (
          results.map((b) => (
            <li key={b.id}>
              <button
                className="body-search-result"
                type="button"
                role="option"
                onClick={() => pick(b.id)}
              >
                <span className="body-search-result-name">{b.name}</span>
                <span className="body-search-result-type">{bodySubtitle(b)}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
