import { useEffect, useState } from 'react';
import Icon from './Icon';

type Os = 'mac' | 'win' | 'linux';
type Texts = {
  title: string; pickOs: string; pickWin: string; pickLinux: string; setup: string; portable: string; smartscreen: string; linuxNote: string; close: string; macNote: string;
  cta: Record<Pkg, string>;
  os: Record<Os, string[]>;
};
type Pkg = 'mac' | 'winSetup' | 'winPortable' | 'linuxX64' | 'linuxArm64';
type Urls = Record<Pkg, string>;

function isArm(): boolean {
  return /aarch64|arm64|armv8/i.test(navigator.userAgent);
}

function detect(): Os {
  const p = ((navigator as any).userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  if (p.includes('win')) return 'win';
  if (p.includes('linux') && !p.includes('android')) return 'linux';
  return 'mac';
}

// 页面上任何带 data-download 的按钮都会打开这个弹窗
export default function DownloadModal({ t, urls }: { t: Texts; urls: Urls }) {
  const [open, setOpen] = useState(false);
  const [os, setOs] = useState<Os>('mac');
  const [pkg, setPkg] = useState<'winSetup' | 'winPortable'>('winSetup');
  const [arch, setArch] = useState<'linuxX64' | 'linuxArm64'>('linuxX64');

  useEffect(() => {
    setOs(detect());
    if (isArm()) setArch('linuxArm64');
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('[data-download]')) { e.preventDefault(); setOpen(true); }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.documentElement.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const key: Pkg = os === 'win' ? pkg : os === 'linux' ? arch : 'mac';
  const file = urls[key].split('/').pop();

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dl-title">
        <span className="modal-handle" aria-hidden="true" />
        <div className="modal-head">
          <h2 id="dl-title">{t.title}</h2>
          <button className="modal-close" aria-label={t.close} onClick={() => setOpen(false)}><Icon name="close" size={20} /></button>
        </div>
        <p className="modal-label">{t.pickOs}</p>
        <div className="os-tiles" role="radiogroup" aria-label={t.pickOs}>
          {(['mac', 'win', 'linux'] as Os[]).map((o) => (
            <button key={o} role="radio" aria-checked={os === o} className={`os-tile${os === o ? ' on' : ''}`} onClick={() => setOs(o)}>
              {os === o && <Icon name="check-circle" size={20} className="os-check" />}
              <strong>{t.os[o][0]}</strong>
              <span>{t.os[o][1]}</span>
            </button>
          ))}
        </div>
        {os === 'win' ? (
          <>
            <p className="modal-label">{t.pickWin}</p>
            <div className="segmented" role="radiogroup" aria-label={t.pickWin}>
              <button role="radio" aria-checked={pkg === 'winSetup'} className={pkg === 'winSetup' ? 'on' : ''} onClick={() => setPkg('winSetup')}>{t.setup}</button>
              <button role="radio" aria-checked={pkg === 'winPortable'} className={pkg === 'winPortable' ? 'on' : ''} onClick={() => setPkg('winPortable')}>{t.portable}</button>
            </div>
            {pkg === 'winSetup' && <p className="modal-note">{t.smartscreen}</p>}
          </>
        ) : os === 'linux' ? (
          <>
            <p className="modal-label">{t.pickLinux}</p>
            <div className="segmented" role="radiogroup" aria-label={t.pickLinux}>
              <button role="radio" aria-checked={arch === 'linuxX64'} className={arch === 'linuxX64' ? 'on' : ''} onClick={() => setArch('linuxX64')}>x64</button>
              <button role="radio" aria-checked={arch === 'linuxArm64'} className={arch === 'linuxArm64' ? 'on' : ''} onClick={() => setArch('linuxArm64')}>arm64</button>
            </div>
            <div className="file-row">
              <code>{file}</code>
              <span>{t.linuxNote}</span>
            </div>
          </>
        ) : (
          <div className="file-row">
            <code>{file}</code>
            <span>{t.macNote}</span>
          </div>
        )}
        <a className="btn btn-white btn-block" href={urls[key]}>
          <Icon name="download" size={20} />
          {t.cta[key]}
        </a>
      </div>
    </div>
  );
}
