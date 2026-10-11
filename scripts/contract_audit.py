#!/usr/bin/env python3
"""AbsBox <-> Hastructure wire-contract audit (maintenance routine).

Hastructure encodes with Aeson ``deriveJSON defaultOptions``, i.e.
``TaggedObject "tag" "contents"``: sum constructors are tagged, record fields are
flattened beside ``"tag"``, and single-constructor types carry no tag. Every tag
AbsBox emits or parses must therefore exist as a constructor somewhere in the
Hastructure Haskell source.

This script extracts the constructor names from the Haskell source and the tag
literals from the AbsBox Python package, then reports AbsBox tags that do not
appear anywhere in Hastructure -- the first-line check for a renamed/removed
engine type.

NOTE: ``swagger.json`` is lossy for some sum types (e.g. it lists only 2 of
``InterestInfo``'s constructors), so the ``.hs`` source is authoritative.

Usage:
    python scripts/contract_audit.py \
        --absbox ~/repo/AbsBox --hastructure ~/repo/Hastructure

Paths may also come from ``ABSBOX_REPO`` / ``HASTRUCTURE_REPO``. Exit code is 1
when candidates are found (CI-friendly). The tag diff is necessary but not
sufficient -- also check ``contents`` arity/order and record field names, see
``doc/contract-audit.md``.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

TAG_PATTERNS = [
    re.compile(r'mkTag\(\s*\(\s*"([^"]+)"'),
    re.compile(r'mkTag\(\s*"([^"]+)"'),
    re.compile(r'["\']tag["\']\s*:\s*["\']([^"\']+)["\']'),
    re.compile(r"['\"]tag['\"]\s*:\s*['\"]([A-Za-z][A-Za-z0-9]+)['\"]"),
]
FILTER_PATTERN = re.compile(r"filter_by_tags\([^,]+,\s*\[([^\]]*)\]")
WORD_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


def _find(name: str, explicit: str | None, env: str) -> Path:
    if explicit:
        p = Path(explicit).expanduser()
        if p.is_dir():
            return p
        sys.exit(f"error: {name} path not a directory: {p}")
    if os.environ.get(env):
        p = Path(os.environ[env]).expanduser()
        if p.is_dir():
            return p
        sys.exit(f"error: {env}={p} is not a directory")
    for cand in (Path.cwd(), Path.cwd().parent, Path.home() / "repo", Path.home()):
        p = cand / name
        if p.is_dir():
            return p
    sys.exit(f"error: could not locate {name}; pass --{name.lower()} or set {env}")


def hastructure_words(hs_repo: Path) -> set[str]:
    words: set[str] = set()
    for f in hs_repo.rglob("*.hs"):
        if "dist-newstyle" in f.parts:
            continue
        words.update(WORD_RE.findall(f.read_text(errors="ignore")))
    return words


def absbox_tags(absbox_repo: Path) -> dict[str, set[str]]:
    tags: dict[str, set[str]] = {}
    for f in (absbox_repo / "absbox").rglob("*.py"):
        if "tests" in f.parts:
            continue
        txt = f.read_text(errors="ignore")
        rel = str(f.relative_to(absbox_repo))
        for pat in TAG_PATTERNS:
            for m in pat.finditer(txt):
                tags.setdefault(m.group(1), set()).add(rel)
        for m in FILTER_PATTERN.finditer(txt):
            for t in re.findall(r'["\']([^"\']+)["\']', m.group(1)):
                tags.setdefault(t, set()).add(rel)
    return tags


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--absbox", default=None)
    ap.add_argument("--hastructure", default=None)
    args = ap.parse_args()

    absbox_repo = _find("AbsBox", args.absbox, "ABSBOX_REPO")
    hs_repo = _find("Hastructure", args.hastructure, "HASTRUCTURE_REPO")

    words = hastructure_words(hs_repo)
    tags = absbox_tags(absbox_repo)

    missing = {t: sorted(v) for t, v in tags.items() if t not in words}

    print(f"AbsBox repo:     {absbox_repo}")
    print(f"Hastructure repo:{hs_repo}")
    print(f"Hastructure constructor/identifier words: {len(words)}")
    print(f"AbsBox tag literals:                      {len(tags)}")
    print(f"AbsBox tags with no Hastructure match:    {len(missing)}\n")

    for t in sorted(missing):
        print(f"  {t}  <- {', '.join(missing[t])}")

    if missing:
        print(
            "\nCandidate mismatches. Confirm against the Haskell source, then file/fix. "
            "Also re-check contents arity/order and record field names "
            "(doc/contract-audit.md)."
        )
        return 1
    print("No tag mismatches found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
