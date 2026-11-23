#!/usr/bin/env python3
"""生成只有一个版本的 Sparkle / WinSparkle appcast。

每个 Release 都带一份，应用从 releases/latest/download/appcast-<系统>.xml 读，
所以永远指向最新的正式版。

用法：
  appcast.py --os macos --version 3.0.0 --url <下载地址> --length <字节数> \
             --signature 'sparkle:edSignature="..."' --notes <发布页> > appcast-macos.xml
"""

import argparse
import email.utils
from xml.sax.saxutils import escape, quoteattr

p = argparse.ArgumentParser()
p.add_argument("--os", choices=["macos", "windows"], required=True)
p.add_argument("--version", required=True)
p.add_argument("--build", default="", help="CFBundleVersion；默认等于 --version")
p.add_argument("--url", required=True)
p.add_argument("--length", required=True)
p.add_argument(
    "--signature",
    required=True,
    help='签名属性，例如 sparkle:edSignature="..." 或 sparkle:dsaSignature="..."',
)
p.add_argument("--notes", required=True, help="发布说明页面")
p.add_argument("--min-os", default="")
a = p.parse_args()

extra = ""
if a.os == "macos" and a.min_os:
    extra = f"\n      <sparkle:minimumSystemVersion>{escape(a.min_os)}</sparkle:minimumSystemVersion>"
installer = ' sparkle:installerArguments="/SILENT /SP- /NOICONS"' if a.os == "windows" else ""

print(f"""<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle">
  <channel>
    <title>YesPlayMusic</title>
    <item>
      <title>{escape(a.version)}</title>
      <pubDate>{email.utils.formatdate(usegmt=True)}</pubDate>
      <sparkle:version>{escape(a.build or a.version)}</sparkle:version>
      <sparkle:shortVersionString>{escape(a.version)}</sparkle:shortVersionString>
      <sparkle:releaseNotesLink>{escape(a.notes)}</sparkle:releaseNotesLink>{extra}
      <enclosure url={quoteattr(a.url)} length={quoteattr(a.length)} type="application/octet-stream"{installer} {a.signature} />
    </item>
  </channel>
</rss>""")
