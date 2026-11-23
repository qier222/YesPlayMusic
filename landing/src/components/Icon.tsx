import { svg } from '../lib/icons';

export default function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  return <span className={className ? `icon ${className}` : 'icon'} dangerouslySetInnerHTML={{ __html: svg(name, size) }} />;
}
