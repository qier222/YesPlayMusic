"""把 assets/icons 里三档 SVG（24、20/、16/）渲染成 1x/2x/3x 的 PNG，
输出到 assets/icons/png/<档>/。Ico 显示的是这些 PNG（原因见 lib/ui.dart 的 Ico）。

改了任何图标 SVG 后运行：
    pip install resvg-py pillow
    python3 tool/render_icons.py
"""
import io
import os

import resvg_py
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons')

for size, src in ((24, ROOT), (20, os.path.join(ROOT, '20')), (16, os.path.join(ROOT, '16'))):
    for f in sorted(os.listdir(src)):
        if not f.endswith('.svg'):
            continue
        svg = open(os.path.join(src, f)).read()
        for scale in (1, 2, 3):
            out = os.path.join(ROOT, 'png', str(size), '' if scale == 1 else f'{scale}.0x')
            os.makedirs(out, exist_ok=True)
            png = bytes(resvg_py.svg_to_bytes(svg_string=svg, width=size * scale, height=size * scale))
            Image.open(io.BytesIO(png)).save(os.path.join(out, f[:-4] + '.png'), optimize=True)
print('done')
