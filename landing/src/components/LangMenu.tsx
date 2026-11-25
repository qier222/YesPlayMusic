import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

type Item = { code: string; label: string; href: string };

export default function LangMenu({ current, items, up = false }: { current: string; items: Item[]; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = items.find((i) => i.code === current)?.label ?? current;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="lang" ref={ref}>
      <button className="nav-item" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
        <Icon name="globe" size={20} className="muted" />
        <span className="label">{label}</span>
        <Icon name="chevron-down" size={16} className="faint" />
      </button>
      {open && (
        <div className={up ? 'lang-menu up' : 'lang-menu'} role="menu">
          {items.map((i) => (
            <a
              key={i.code}
              role="menuitemradio"
              aria-checked={i.code === current}
              href={i.href}
              hrefLang={i.code}
              className={i.code === current ? 'on' : undefined}
              // Remember the manual choice so the worker redirects / to it next time
              onClick={() => (document.cookie = `lang=${i.code}; path=/; max-age=31536000; samesite=lax`)}
            >
              {i.label}
              {i.code === current && <Icon name="check" size={18} />}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
