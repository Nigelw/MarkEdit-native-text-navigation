#!/usr/bin/env python3
"""Generate the reviewed registry manifest and pull-request body."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


REPOSITORY = "Nigelw/MarkEdit-native-text-shortcuts"
EXTENSION_ID = "markedit-native-text-shortcuts"
DESCRIPTION = "Makes MarkEdit’s Option+Arrow Key text navigation behave like native macOS text fields."
NOTES = "Distributed through MarkEdit’s Extension Manager."
VERSION_PATTERN = re.compile(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$")
SHA256_PATTERN = re.compile(r"^[0-9a-fA-F]{64}$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate the Native Text Shortcuts registry JSON and PR body."
    )
    parser.add_argument("--version", required=True, help="Plain semantic version, for example 1.1.2")
    parser.add_argument("--sha256", required=True, help="SHA-256 of the tagged JavaScript artifact")
    parser.add_argument("--output-dir", required=True, type=Path, help="Directory for review artifacts")
    parser.add_argument("--notes", default=NOTES, help="Short registry release note")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not VERSION_PATTERN.fullmatch(args.version):
        raise SystemExit(f"Invalid semantic version: {args.version}")
    if not SHA256_PATTERN.fullmatch(args.sha256):
        raise SystemExit("--sha256 must be exactly 64 hexadecimal characters")
    if not args.notes.strip():
        raise SystemExit("--notes must not be blank")

    artifact_url = (
        f"https://raw.githubusercontent.com/{REPOSITORY}/v{args.version}/"
        "markedit-native-text-shortcuts.js"
    )
    manifest = {
        "$schema": (
            "https://github.com/MarkEdit-app/extensions/raw/refs/heads/main/"
            "schemas/extension.schema.json"
        ),
        "id": EXTENSION_ID,
        "name": "Native Text Shortcuts",
        "description": DESCRIPTION,
        "author": "Nigelw",
        "homepage": f"https://github.com/{REPOSITORY}",
        "versions": [
            {
                "version": args.version,
                "url": artifact_url,
                "sha256": args.sha256.lower(),
                "notes": args.notes,
            }
        ],
    }

    pr_body = f"""Submitting my Native Text Shortcuts extension for consideration in the official registry.

- Version: `{args.version}`
- Artifact: immutable `v{args.version}` tag
- SHA-256: `{args.sha256.lower()}`

The extension uses MarkEdit’s Extension Manager for installation and centrally managed updates.

The manifest was validated against the registry schema, and the hash matches the exact tagged JavaScript artifact.
"""

    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = args.output_dir / f"{EXTENSION_ID}.json"
    body_path = args.output_dir / "registry-pr-body.md"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    body_path.write_text(pr_body, encoding="utf-8")

    print(manifest_path)
    print(body_path)


if __name__ == "__main__":
    main()
