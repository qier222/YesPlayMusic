// 图标来自应用的 assets/icons，颜色改成 currentColor 方便用 CSS 控制
const files = import.meta.glob('../icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function svg(name: string, size = 20) {
  const raw = files[`../icons/${name}.svg`];
  if (!raw) throw new Error(`没有这个图标：${name}`);
  return raw
    .replaceAll('#F7F7F8', 'currentColor')
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`)
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
}
