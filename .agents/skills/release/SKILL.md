---
name: release
description: Cut a registry-ready release of the markedit-native-text-shortcuts extension by updating the version and changelog, tagging the exact script bytes, and preparing the MarkEdit extension-registry entry.
---

# Release markedit-native-text-shortcuts

The MarkEdit Extension Manager is the distribution and update channel. The root `markedit-native-text-shortcuts.js` file is the artifact, and the registry serves the exact bytes committed at an immutable version tag. There is no build step and no in-app self-updater.

A registry release is usable only if all of these agree:

1. `package.json` `version` is the new plain semver version.
2. The `// Version:` header in `markedit-native-text-shortcuts.js` is the same version.
3. The registry entry uses the `v<version>` tag, an HTTPS raw URL for that tagged script, and the SHA-256 of those exact bytes.

## Before Starting

- Confirm the working tree is clean with `git status` and that the branch is `main`. If there are unrelated uncommitted changes, stop and ask the user how to proceed.
- Determine the new version. If the user did not specify one, ask whether it is a patch, minor, or major bump and compute it from `package.json` `version`. Use plain semver in files and a `v` prefix for the Git tag.

## Steps

1. Bump the version in `package.json`.

2. Update the `// Version:` header in `markedit-native-text-shortcuts.js` to match.

3. Draft user-facing release notes in `CHANGELOG.md`:
   - Find the previous tag with `git describe --tags --abbrev=0`. If there is no previous tag, use all history.
   - Gather commits since the previous release with:
     ```sh
     git log --no-merges <prev-tag>..HEAD --pretty='%s%n%b'
     ```
   - Draft a new release section directly below `# Changelog` and above the latest existing release.
   - Author short user-facing entries under `New`, `Improved`, and `Fixed` headings as applicable. Omit internal-only changes.
   - Show the new section to the user and get explicit confirmation before committing or tagging.

4. Verify the version in both files:
   ```sh
   grep -n "<new-version>" package.json markedit-native-text-shortcuts.js
   ```

5. Commit the release files:
   ```sh
   git add package.json markedit-native-text-shortcuts.js CHANGELOG.md README.md
   git commit -m "Release v<version>"
   ```

6. Tag the release commit:
   ```sh
   git tag -a v<version> -m "v<version>"
   ```

7. Push the branch and tag:
   ```sh
   git push origin main
   git push origin v<version>
   ```

8. Compute the hash of the immutable tagged artifact:
   ```sh
   curl -fsSL -o /tmp/markedit-native-text-shortcuts.js \
     "https://raw.githubusercontent.com/Nigelw/MarkEdit-native-text-shortcuts/v<version>/markedit-native-text-shortcuts.js"
   shasum -a 256 /tmp/markedit-native-text-shortcuts.js
   ```

9. Prepare `extensions/markedit-native-text-shortcuts.json` in a fork of `MarkEdit-app/extensions` using the registry schema. Add versions newest-first, and retain prior verified versions when updating the entry. Do not edit the generated `index.json`.

10. Prepare the registry PR body, show the JSON and PR body to the user, and wait for explicit approval before opening the PR.

## Registry entry

The initial entry should have this shape, with the computed hash substituted:

```json
{
  "$schema": "https://github.com/MarkEdit-app/extensions/raw/refs/heads/main/schemas/extension.schema.json",
  "id": "markedit-native-text-shortcuts",
  "name": "Native Text Shortcuts",
  "description": "Makes MarkEdit’s Option+Arrow Key text navigation behave like native macOS text fields.",
  "author": "Nigelw",
  "homepage": "https://github.com/Nigelw/MarkEdit-native-text-shortcuts",
  "versions": [
    {
      "version": "<version>",
      "url": "https://raw.githubusercontent.com/Nigelw/MarkEdit-native-text-shortcuts/v<version>/markedit-native-text-shortcuts.js",
      "sha256": "<64-character SHA-256>",
      "notes": "<short user-facing release note>"
    }
  ]
}
```

The registry CI validates the schema, `id`/filename match, URL reachability, and SHA-256 integrity. On merge, it regenerates the app feed and gallery.

## Notes

- A GitHub Release is optional and is not the installation artifact. Do not attach a release asset solely for the registry.
- Existing manually installed copies from v1.1.1 still contain the old self-updater. A one-time asset-bearing migration release can move them to the updater-free build, but users must install the registry entry through the Extension Manager to receive centrally managed future updates.
