# MarkEdit Native Text Navigation Plugin

Adopts standard macOS text-editing behavior for Option-Up/Down in [MarkEdit](https://github.com/MarkEdit-app/MarkEdit).

**[⬇ Download the latest release](https://github.com/Nigelw/MarkEdit-native-text-navigation/releases/latest/download/markedit-native-text-navigation.js)** then see [Install](#install) below.

## Features

- Restores native macOS paragraph navigation shortcuts in MarkEdit.
- Adds *Extensions -> Native Text Navigation -> Visit GitHub Project*.
- Adds *Extensions -> Native Text Navigation -> Check for Updates...*.
- Checks GitHub releases for newer versions on launch and offers to install them.

## Behavior

By default, MarkEdit key bindings follow the conventions used by source code editors such as VS Code. This means that by default:
- `Option-Up/Down` moves the current paragraph up or down.
- `Shift-Option-Up/Down` duplicates the current paragraph above or below.

This extension overrides these defaults so that:
- `Option-Up/Down` moves the insertion point to the beginning/end of the current paragraph.
- `Shift-Option-Up/Down` extends the selection to the beginning/end of the current paragraph.

When the insertion point or selection head is already at the requested boundary, the same shortcut advances to the matching boundary of the previous or next paragraph.

In CodeMirror terms, a paragraph here is the current document line, which matches native macOS text fields for hard-wrapped plain text and Markdown paragraphs.

## Install

1. Download the [latest release](https://github.com/Nigelw/MarkEdit-native-text-navigation/releases/latest/download/markedit-native-text-navigation.js)
2. Copy `markedit-native-text-navigation.js` into MarkEdit's scripts folder:

```
~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/
```

3. Relaunch MarkEdit. After that the extension [keeps itself up to date](#updates) — no need to download it again by hand.

## Updates

The extension checks the latest GitHub release once per week. When a newer release is available, it downloads the `markedit-native-text-navigation.js` release asset and overwrites the installed script. Restart MarkEdit after updating.

You can also check manually from *Extensions -> Native Text Navigation -> Check for Updates...*.

By default, update behavior is `notify`. To change it, add this to MarkEdit's `settings.json`:

```json
{
  "extension.markeditNativeTextNavigation": {
    "update": "notify"
  }
}
```

Supported values are:

- `automatic`: install new releases silently, then prompt you to restart MarkEdit.
- `notify`: ask before installing.
- `never`: disable automatic checks. Manual checks still work from the menu.

## Releases

Release notes live in [CHANGELOG.md](CHANGELOG.md). This repo also includes a `release` skill at `.claude/skills/release/SKILL.md` for bumping versions, updating the changelog, tagging, pushing, and publishing the script as the GitHub release asset used by the updater.
