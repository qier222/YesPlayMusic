import { useEffect, useRef, useState } from 'react';

type Slide = { src: string; alt: string; width: number; height: number };

// 中间一张完整显示，左右露出前后两张；可以拖动，点两侧那张切过去，每 5 秒自动切换
export default function Carousel({ slides, start = 0 }: { slides: Slide[]; start?: number }) {
  const [i, setI] = useState(start);
  const [drag, setDrag] = useState(0);
  const [paused, setPaused] = useState(false);
  const from = useRef<number | null>(null);
  const n = slides.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((k) => (k + 1) % n), 5000);
    return () => clearInterval(id);
  }, [paused, n]);

  const end = () => {
    if (from.current === null) return;
    if (Math.abs(drag) > 60) go(i + (drag < 0 ? 1 : -1));
    from.current = null;
    setDrag(0);
  };

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); end(); }}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); }}
      onPointerDown={(e) => { from.current = e.clientX; }}
      onPointerMove={(e) => { if (from.current !== null) setDrag(e.clientX - from.current); }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="carousel-track">
        {slides.map((s, k) => {
          let off = k - i;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const hidden = Math.abs(off) > 1;
          return (
            <figure
              key={s.src}
              className={`slide${off === 0 ? ' current' : ''}`}
              aria-hidden={off !== 0}
              style={{
                transform: `translateX(calc(${off} * (var(--slide-w) + var(--slide-gap)) + ${drag}px))`,
                opacity: hidden ? 0 : off === 0 ? 1 : 0.45,
                transition: from.current !== null ? 'none' : undefined,
              }}
              onClick={() => off !== 0 && go(k)}
            >
              <img src={s.src} alt={s.alt} width={s.width} height={s.height} draggable={false} loading={Math.abs(off) <= 1 ? 'eager' : 'lazy'} />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
