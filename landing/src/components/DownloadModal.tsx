import { useEffect, useState } from 'react';
import Icon from './Icon';
import { fetchLatestRelease, links, type DownloadPackage, type LatestRelease } from '../lib/site';

type Os = 'mac' | 'win' | 'linux';
type Texts = {
  title: string; pickOs: string; pickWin: string; pickLinux: string; pickMac: string; setup: string; portable: string; smartscreen: string; linuxNote: string; close: string; macArm64: string; macIntel: string; latestRelease: string;
  cta: Record<Exclude<DownloadPackage, 'macIntel'>, string>;
  os: Record<Os, string[]>;
};

function isArm(): boolean {
  return /aarch64|arm64|armv8/i.test(navigator.userAgent);
}

function detect(): Os {
  const p = ((navigator as any).userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  if (p.includes('win')) return 'win';
  if (p.includes('linux') && !p.includes('android')) return 'linux';
  return 'mac';
}

function track(event: string, params: Record<string, string>) {
  (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.('event', event, params);
}

export default function DownloadModal({ t, lang }: { t: Texts; lang: string }) {
  const [open, setOpen] = useState(false);
  const [os, setOs] = useState<Os>('mac');
  const [pkg, setPkg] = useState<'winSetup' | 'winPortable'>('winSetup');
  const [arch, setArch] = useState<'linuxX64' | 'linuxArm64'>('linuxX64');
  const [macArch, setMacArch] = useState<'mac' | 'macIntel'>('mac');
  const [release, setRelease] = useState<LatestRelease | null>(null);

  useEffect(() => {
    setOs(detect());
    if (isArm()) setArch('linuxArm64');
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = (e.target as Element).closest('[data-download]');
      if (trigger) {
        e.preventDefault();
        setOpen(true);
        track('download_modal_open', {
          location: trigger.getAttribute('data-download') || 'unknown',
          lang,
        });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lang]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.documentElement.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open || release) return;
    let active = true;
    fetchLatestRelease().then(result => {
      if (active && result) setRelease(result);
    });
    return () => { active = false; };
  }, [open, release]);

  if (!open) return null;
  const urls = release?.downloads;
  const macPackage = !urls?.mac && urls?.macIntel ? 'macIntel' : macArch;
  const key = os === 'win' ? pkg : os === 'linux' ? arch : macPackage;
  const url = urls?.[key];
  const file = url?.split('/').pop();

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
            {file && <div className="file-row">
              <code>{file}</code>
              <span>{t.linuxNote}</span>
            </div>}
          </>
        ) : (
          <>
            {urls?.mac && urls.macIntel && (
              <>
                <p className="modal-label">{t.pickMac}</p>
                <div className="segmented" role="radiogroup" aria-label={t.pickMac}>
                  <button role="radio" aria-checked={macArch === 'mac'} className={macArch === 'mac' ? 'on' : ''} onClick={() => setMacArch('mac')}>{t.macArm64}</button>
                  <button role="radio" aria-checked={macArch === 'macIntel'} className={macArch === 'macIntel' ? 'on' : ''} onClick={() => setMacArch('macIntel')}>{t.macIntel}</button>
                </div>
              </>
            )}
            {file && <div className="file-row">
              <code>{file}</code>
              <span>{key === 'macIntel' ? t.macIntel : t.macArm64}</span>
            </div>}
          </>
        )}
        <a
          className="btn btn-white btn-block"
          href={url ?? links.latestRelease}
          onClick={() => track('download_click', { os, package: url ? key : 'latestRelease', app_version: release?.version ?? 'unknown', lang })}
        >
          <Icon name="download" size={20} />
          {url ? t.cta[key === 'macIntel' ? 'mac' : key] : t.latestRelease}
        </a>
      </div>
    </div>
  );
}
