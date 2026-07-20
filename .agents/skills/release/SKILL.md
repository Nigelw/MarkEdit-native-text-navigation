---
name: release
description: Cut a new release of the markedit-native-text-shortcuts extension: bump the version, update the changelog, tag, push, and publish a GitHub release with the user script attached for the in-app updater.
---

# Release markedit-native-text-shortcuts

This extension has an in-app self-updater in `markedit-native-text-shortcuts.js`. Installed copies poll `api.github.com/repos/Nigelw/MarkEdit-native-text-shortcuts/releases/latest`, compare the release tag against the script's `CURRENT_VERSION`, and when a newer version exists, download the release's `markedit-native-text-shortcuts.js` asset and overwrite their own installed script file with it.

A release is usable by the updater only if all of these agree:

1. `package.json` `version` is the new version.
2. The `CURRENT_VERSION` constant and header comment in `markedit-native-text-shortcuts.js` are the new version.
3. The GitHub release for `v<version>` has a `markedit-native-text-shortcuts.js` asset that is exactly that updated script.

There is no build step in this repo. The root `markedit-native-text-shortcuts.js` file is the distributed asset.

## Before Starting

- Confirm the working tree is clean with `git status` and that the branch is `main`. If there are unrelated uncommitted changes, stop and ask the user how to proceed.
- Determine the new version. If the user did not specify one, ask whether it is a patch, minor, or major bump and compute it from `package.json` `version`. Use plain semver in files and a `v` prefix for the git tag and GitHub release.

## Steps

1. Bump the version in `package.json` to the new version.

2. Update `markedit-native-text-shortcuts.js` so both the `// Version:` header and `CURRENT_VERSION` constant match the new version.

3. Draft user-facing release notes in `CHANGELOG.md`:
   - Find the previous tag with `git describe --tags --abbrev=0`. If there is no previous tag, use all history.
   - Gather commits since the previous release with:
     ```sh
     git log --no-merges <prev-tag>..HEAD --pretty='%s%n%b'
     ```
   - Move the `## Unreleased` notes into a new release section for the chosen version:
     ```markdown
     ## <version> (YYYY-MM-DD)

     ### New

     - ...
     ```
   - If `## Unreleased` is empty, draft the release section from the commits.
   - Author the section as short user-facing Markdown, applying these rules:
     - Draft release note entries under three Markdown `###` headings in this order: `New` for major, headline features; `Improved` for quality-of-life updates and polish; `Fixed` for bug fixes. Omit a bucket if it has no entries.
     - Rewrite every entry from the user's perspective. Describe what changed for someone using the extension.
     - Drop anything with no user-visible impact: internal refactors, test or CI changes, dependency bumps, and doc edits.
     - Use one succinct line per entry, with no jargon, file names, symbols, or implementation detail.
   - Keep a fresh empty `## Unreleased` section above the new release section.
   - After writing the draft, show the new `CHANGELOG.md` section to the user and offer to open the file with `${EDITOR:-${VISUAL:-open}} CHANGELOG.md`, or to take edits in conversation.
   - Get explicit confirmation before continuing. The GitHub release body must use the confirmed `CHANGELOG.md` section.

4. Verify the script carries the new version:
   `grep -c "<new-version>" markedit-native-text-shortcuts.js`
   The count should be at least 2 because both the header and `CURRENT_VERSION` should have changed.

5. Commit the release files:
   `git add package.json markedit-native-text-shortcuts.js CHANGELOG.md`
   `git commit -m "Release v<version>"`

6. Tag the release commit:
   `git tag -a v<version> -m "v<version>"`

7. Push the branch and tag:
   `git push origin main`
   `git push origin v<version>`

8. Publish the GitHub release with the script attached as the updater asset:
   `gh release create v<version> --title "v<version>" --notes "<changelog section>" markedit-native-text-shortcuts.js`

9. Verify the latest release exposes the asset the updater downloads:
   ```sh
   url=$(curl -sS "https://api.github.com/repos/Nigelw/MarkEdit-native-text-shortcuts/releases/latest" \
     | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const a=JSON.parse(d).assets||[];const m=a.find(x=>x.name==='markedit-native-text-shortcuts.js');console.log(m?m.browser_download_url:'MISSING')})")
   echo "asset url: $url"
   [ "$url" = MISSING ] || curl -sSfI "$url" | head -1
   ```

## Report Back

Tell the user the released version, the GitHub release URL, and the result of the asset check so they know the auto-updater can serve it.

## Notes

- The repo must stay public for unauthenticated GitHub API and release asset requests.
- Do not tag or publish the release before updating the script version. Installed copies compare against the `CURRENT_VERSION` literal baked into the script.
- GitHub's latest-release API only advances after a release is published. Pushing a tag alone will not trigger the updater.
