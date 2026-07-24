"""Stamp the build version into the installed headroom package.

Reads HEADROOM_BUILD_VERSION and PYTHON_SITE_PACKAGES from the
environment.  When HEADROOM_BUILD_VERSION is ``source-build`` it resolves
the git revision (from /context, bind-mounted by Docker) or falls back to
a source-tree content digest.
"""

import hashlib
import os
from pathlib import Path


def git_revision(context: Path) -> str | None:
    git_dir = context / ".git"
    head_path = git_dir / "HEAD"
    if not head_path.exists():
        return None
    head = head_path.read_text(encoding="utf-8").strip()
    if head.startswith("ref: "):
        ref_name = head.removeprefix("ref: ").strip()
        ref_path = git_dir / ref_name
        if ref_path.exists():
            head = ref_path.read_text(encoding="utf-8").strip()
        else:
            packed_refs = git_dir / "packed-refs"
            if not packed_refs.exists():
                return None
            for line in packed_refs.read_text(encoding="utf-8").splitlines():
                if line.startswith("#") or not line.strip():
                    continue
                sha, _, name = line.partition(" ")
                if name.strip() == ref_name:
                    head = sha
                    break
            else:
                return None
    return head[:12] if len(head) >= 7 and all(c in "0123456789abcdef" for c in head.lower()) else None


def source_digest(root: Path) -> str:
    digest = hashlib.sha256()
    inputs = (
        "pyproject.toml",
        "uv.lock",
        "README.md",
        "Cargo.toml",
        "Cargo.lock",
        "rust-toolchain.toml",
        "crates",
        "headroom",
    )
    for name in inputs:
        path = root / name
        if not path.exists():
            continue
        files = [path] if path.is_file() else sorted(p for p in path.rglob("*") if p.is_file())
        for file in files:
            digest.update(file.relative_to(root).as_posix().encode("utf-8"))
            digest.update(b"\0")
            digest.update(file.read_bytes())
            digest.update(b"\0")
    return digest.hexdigest()[:12]


def main() -> None:
    build_version = os.environ["HEADROOM_BUILD_VERSION"].strip()
    if not build_version:
        print("no Headroom build version override provided; using installed package metadata")
        return
    if build_version == "source-build":
        revision = git_revision(Path("/context"))
        build_version = (
            f"source-build+g{revision}"
            if revision
            else f"source-build+sha256.{source_digest(Path('/build'))}"
        )

    package_dir = Path(os.environ["PYTHON_SITE_PACKAGES"]) / "headroom"
    (package_dir / "_build_info.py").write_text(
        "BUILD_VERSION = " + repr(build_version) + "\n",
        encoding="utf-8",
    )
    print("baked Headroom build version: " + build_version)


if __name__ == "__main__":
    main()
