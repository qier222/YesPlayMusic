#!/usr/bin/env python3
"""发版前的准备：检查版本号、改版本号、从提交记录起草更新日志。

只改本地文件，不提交、不打标签、不推送。

用法（在仓库根目录）：
  scripts/release/prepare.py check            # 检查能不能发当前版本
  scripts/release/prepare.py notes [--since v3.0.0]
                                              # 从上个标签以来的提交起草更新日志
  scripts/release/prepare.py bump 3.0.1       # 改两处版本号，把 [Unreleased] 移到 3.0.1 下
"""

import argparse
import datetime
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBSPEC = ROOT / "pubspec.yaml"
VERSION_DART = ROOT / "lib" / "version.dart"
CHANGELOG = ROOT / "CHANGELOG.md"
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")


def git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], cwd=ROOT, capture_output=True, text=True, check=True
    ).stdout.strip()


def pubspec_version() -> str:
    m = re.search(r"^version:\s*([0-9.]+)", PUBSPEC.read_text(), re.M)
    return m.group(1) if m else ""


def dart_version() -> str:
    m = re.search(r"appVersion\s*=\s*'([^']*)'", VERSION_DART.read_text())
    return m.group(1) if m else ""


def changelog_sections(text: str) -> dict[str, str]:
    """「## [版本]」下面的内容。"""
    parts = re.split(r"^## \[([^\]]+)\].*$", text, flags=re.M)
    return {parts[i]: parts[i + 1].strip() for i in range(1, len(parts) - 1, 2)}


def last_tag() -> str:
    try:
        return git("describe", "--tags", "--abbrev=0", "--match", "v*")
    except subprocess.CalledProcessError:
        return ""


# ── check ──


def check(_: argparse.Namespace) -> int:
    problems, notes = [], []
    pub, dart = pubspec_version(), dart_version()
    if not SEMVER.match(pub):
        problems.append(f"pubspec.yaml 的版本 {pub!r} 不是 x.y.z")
    if pub != dart:
        problems.append(f"pubspec.yaml 是 {pub}，lib/version.dart 是 {dart}")
    sections = changelog_sections(CHANGELOG.read_text())
    if pub not in sections:
        problems.append(f"CHANGELOG.md 里没有 [{pub}]")
    elif not sections[pub]:
        problems.append(f"CHANGELOG.md 的 [{pub}] 是空的")
    elif re.search(rf"^## \[{re.escape(pub)}\].*未发布", CHANGELOG.read_text(), re.M):
        notes.append(f"CHANGELOG.md 的 [{pub}] 标题还写着「未发布」，改成发布日期")
    if sections.get("Unreleased"):
        notes.append("CHANGELOG.md 的 [Unreleased] 还有内容，是不是忘了移到新版本下")
    if git("tag", "--list", f"v{pub}"):
        problems.append(f"标签 v{pub} 已经存在")
    if git("status", "--porcelain"):
        notes.append("工作区有未提交的改动")
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    if branch != "main":
        notes.append(f"当前在 {branch} 分支，不在 main")

    for n in notes:
        print(f"注意：{n}")
    for e in problems:
        print(f"问题：{e}")
    if problems:
        return 1
    print(f"可以发 v{pub}：")
    print(f"  git tag v{pub} && git push origin main v{pub}")
    return 0


# ── notes ──

# 提交标题里的词 → 更新日志的分组（按顺序匹配第一个）
GROUPS = [
    ("修复", re.compile(r"修复|修正|不再|崩溃|报错|失败|卡住|错误|bug|fix", re.I)),
    ("新增", re.compile(r"新增|加入|添加|支持|^加|add|feat", re.I)),
    ("改进", re.compile(r".")),
]
# 不进更新日志的提交
SKIP = re.compile(r"^(测试|test|ci|docs?|文档|chore|格式|format|merge)\b|^Merge ", re.I)


def notes(a: argparse.Namespace) -> int:
    since = a.since if a.since is not None else last_tag()
    rng = f"{since}..HEAD" if since else "HEAD"
    subjects = [s for s in git("log", "--no-merges", "--format=%s", rng).splitlines() if s]
    grouped: dict[str, list[str]] = {g: [] for g, _ in GROUPS}
    skipped = 0
    for s in reversed(subjects):
        if SKIP.search(s):
            skipped += 1
            continue
        for g, pat in GROUPS:
            if pat.search(s):
                grouped[g].append(s)
                break
    print(f"<!-- {rng} 共 {len(subjects)} 个提交，跳过 {skipped} 个（测试、文档等）。")
    print("     这只是草稿：按用户看得懂的话改写、合并，再贴进 [Unreleased]。 -->\n")
    for g, items in grouped.items():
        if not items:
            continue
        print(f"### {g}\n")
        for s in items:
            print(f"- {s}")
        print()
    return 0


# ── bump ──


def bump(a: argparse.Namespace) -> int:
    new = a.version.removeprefix("v")
    if not SEMVER.match(new):
        print(f"版本号要是 x.y.z：{new}")
        return 1
    old = pubspec_version()
    text = CHANGELOG.read_text()
    sections = changelog_sections(text)
    if new in sections:
        print(f"CHANGELOG.md 里已经有 [{new}]")
        return 1
    if not sections.get("Unreleased"):
        print("CHANGELOG.md 的 [Unreleased] 是空的，先写更新内容（可以用 notes 起草）")
        return 1

    PUBSPEC.write_text(
        re.sub(r"^version:\s*[0-9.]+(\+\d+)?", lambda m: f"version: {new}+1", PUBSPEC.read_text(), count=1, flags=re.M)
    )
    VERSION_DART.write_text(
        re.sub(r"(appVersion\s*=\s*')[^']*(')", rf"\g<1>{new}\g<2>", VERSION_DART.read_text(), count=1)
    )

    today = datetime.date.today().isoformat()
    text = re.sub(
        r"^## \[Unreleased\][ \t]*$",
        f"## [Unreleased]\n\n## [{new}] - {today}",
        text,
        count=1,
        flags=re.M,
    )
    # 底部的比较链接
    m = re.search(r"^\[Unreleased\]: (\S+)/compare/v([0-9.]+)\.\.\.HEAD$", text, re.M)
    if m:
        base, prev = m.group(1), m.group(2)
        text = text.replace(
            m.group(0),
            f"[Unreleased]: {base}/compare/v{new}...HEAD\n[{new}]: {base}/compare/v{prev}...v{new}",
        )
    CHANGELOG.write_text(text)
    print(f"{old} → {new}：已改 pubspec.yaml、lib/version.dart、CHANGELOG.md")
    print("接着：flutter test，提交，然后 scripts/release/prepare.py check")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check", help="检查版本号和更新日志").set_defaults(fn=check)
    n = sub.add_parser("notes", help="从提交记录起草更新日志")
    n.add_argument("--since", help="从这个标签或提交开始，默认上一个 v* 标签；空字符串表示全部")
    n.set_defaults(fn=notes)
    b = sub.add_parser("bump", help="改版本号")
    b.add_argument("version")
    b.set_defaults(fn=bump)
    a = p.parse_args()
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
