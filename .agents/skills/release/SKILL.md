---
name: release
description: Cut a new release of the markedit-native-text-shortcuts extension by updating its version and changelog, tagging and pushing the release, and verifying the immutable tagged JavaScript artifact. Use when preparing or publishing a release of this extension; do not use it for extension-registry submission.
---

# Release markedit-native-text-shortcuts

The root `markedit-native-text-shortcuts.js` file is the distributed artifact. There is no build step and no in-app self-updater; MarkEdit's Extension Manager manages installation and updates after a separate registry submission.

A release is ready when all of these agree:

1. `package.json` `version` is the new plain semver version.
2. The `// Version:` header in `markedit-native-text-shortcuts.js` matches it.
3. The `v<version>` tag points to the release commit.
4. The JavaScript file fetched from that tag has the expected bytes.

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

8. Verify the immutable tagged artifact:
   ```sh
   curl -fsSL -o /tmp/markedit-native-text-shortcuts.js \
     "https://raw.githubusercontent.com/Nigelw/MarkEdit-native-text-shortcuts/v<version>/markedit-native-text-shortcuts.js"
   shasum -a 256 /tmp/markedit-native-text-shortcuts.js
   ```

9. Report the released version, commit, tag, artifact URL, and SHA-256. Stop after release verification. Registry submission is a separate activity handled by the `submit-registry` skill.

## Notes

- A GitHub Release is optional and is not required for distribution.
- Do not alter an existing release tag; prepare a new version instead.
- Existing manually installed copies from before the Extension Manager transition may need a one-time migration release asset, but that is separate from this release workflow.
