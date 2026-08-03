---
name: submit-registry
description: Submit the latest tagged Native Text Shortcuts release to the official MarkEdit extensions registry. Use when preparing or updating extensions/markedit-native-text-shortcuts.json, calculating the immutable artifact hash, and opening a registry pull request; always review the complete JSON manifest and PR body with the user before any registry mutation or draft PR submission.
---

# Submit to the MarkEdit extension registry

Use this skill after the extension release has been committed, tagged, and pushed. It prepares a reviewable registry manifest and pull-request body, pauses for explicit approval, then writes the manifest to a fork and opens a draft PR against `MarkEdit-app/extensions`.

## 1. Verify the latest release

- Confirm the extension repository is on `main` and has no unrelated changes: `git status --short --branch`.
- Read the plain semver version from `package.json` and confirm the `// Version:` header in `markedit-native-text-shortcuts.js` matches.
- Require the corresponding immutable tag `v<version>` to exist locally and on `origin`. Stop if the release has not been pushed.
- Set the artifact URL to:
  `https://raw.githubusercontent.com/Nigelw/MarkEdit-native-text-shortcuts/v<version>/markedit-native-text-shortcuts.js`.
- Download that URL to a temporary directory and calculate its SHA-256:
  ```sh
  tmp_dir=$(mktemp -d)
  curl -fsSL -o "$tmp_dir/markedit-native-text-shortcuts.js" "<artifact-url>"
  shasum -a 256 "$tmp_dir/markedit-native-text-shortcuts.js"
  ```
- Confirm the downloaded hash matches the exact tagged file. Treat any mismatch as a release blocker.

## 2. Generate review artifacts

Run the bundled generator with the verified version and hash:

```sh
review_dir=$(mktemp -d)
python3 .agents/skills/submit-registry/scripts/prepare_submission.py \
  --version "<version>" \
  --sha256 "<sha256>" \
  --output-dir "$review_dir"
```

The generator writes:

- `$review_dir/markedit-native-text-shortcuts.json`, the exact file to add under the registry's `extensions/` directory.
- `$review_dir/registry-pr-body.md`, the proposed pull-request body.

Display both complete files to the user. The manifest must use this project metadata:

- `id`: `markedit-native-text-shortcuts`
- `name`: `Native Text Shortcuts`
- `description`: `Makes MarkEdit’s Option+Arrow Key text navigation behave like native macOS text fields.`
- `author`: `Nigelw`
- `homepage`: `https://github.com/Nigelw/MarkEdit-native-text-shortcuts`

The version entry must point to the immutable `v<version>` raw URL and its exact 64-character SHA-256. Preserve existing versions newest-first when updating an existing registry entry; for a first submission, one version is sufficient. Do not add generated `index.json` content.

## 3. Mandatory review gate

Stop after displaying the JSON and PR body. Ask the user to approve or request edits. Do not create a fork branch, commit the manifest, upload files, or open a PR until the user explicitly approves both artifacts.

If the user requests edits, regenerate the artifacts, display the complete replacements, and pause again. Do not infer approval from a request to “prepare” or “show” the files.

## 4. Create the registry branch and manifest

After explicit approval:

1. Prefer the connected GitHub tools for repository reads and writes. Confirm `MarkEdit-app/extensions` is public, its default branch is `main`, and the authenticated user has a writable fork (normally `Nigelw/extensions`).
2. Fetch the upstream registry README/schema or use the current registry instructions before mutation. The source-of-truth file is `extensions/<id>.json`; generated `index.json` must not be edited.
3. Check for an existing open PR or branch for this release. Avoid duplicate submissions.
4. Create a unique fork branch, for example `agent/add-native-text-shortcuts-v<version>`, from the fork's current `main`.
5. Add or update only `extensions/markedit-native-text-shortcuts.json`, preserving prior verified versions when appropriate. Use the approved JSON exactly, including the approved description and hash.
6. Fetch the committed file back from the branch and verify its JSON syntax, version, URL, description, and SHA-256 before opening the PR.

If the GitHub connector cannot create a cross-fork PR, use the signed-in GitHub browser compare page or an authenticated `gh` fallback. Never claim that a PR was opened after a permission or authentication error.

## 5. Open the draft PR

Open a draft pull request from the fork branch to `MarkEdit-app/extensions:main`:

- Title: `Add Native Text Shortcuts to the official registry`
- Body: use the approved `registry-pr-body.md` verbatim.
- Set `draft` to `true`.
- Allow maintainer edits unless the user says otherwise.

The body must begin with:

> Submitting my Native Text Shortcuts extension for consideration in the official registry.

After creation, verify the PR URL, base/head repositories and branches, draft status, title, body, changed file count, and mergeability. Report the PR URL and the artifact hash to the user.

## Safety and failure handling

- Never submit a manifest or PR before the explicit review gate.
- Stop if the release tag is missing, the raw URL is unreachable, or the fetched SHA-256 differs from the tagged artifact.
- Do not edit `index.json`, generated site files, or unrelated registry entries.
- Do not publish a GitHub release asset solely for registry distribution; the registry uses the immutable raw tagged file.
- Preserve existing user changes and never force-push, delete branches, or close PRs as part of this skill.
