# MarkEdit Native Text Shortcuts

Enable standard macOS text-editing keyboard shortcuts in [MarkEdit](https://github.com/MarkEdit-app/MarkEdit).

**[Download the latest release](https://github.com/Nigelw/MarkEdit-native-text-shortcuts/releases/latest/download/markedit-native-text-shortcuts.js)** then see [Install](#install) below.

## Behavior

By default, MarkEdit key bindings follow the conventions used by source code editors such as VS Code:
- `Option-Up/Down` moves the current paragraph up or down.
- `Shift-Option-Up/Down` duplicates the current paragraph above or below.

This extension overrides these defaults so that:
- `Option-Up/Down` moves the insertion point to the beginning/end of the current paragraph.
- `Shift-Option-Up/Down` extends the selection to the beginning/end of the current paragraph.
- Repeat presses of these shortcuts continue to advance to the previous/next paragraphs.

In CodeMirror terms, a paragraph here is the current document line, which matches native macOS text fields for hard-wrapped plain text and Markdown paragraphs.

## Install

1. [Download the latest release](https://github.com/Nigelw/MarkEdit-native-text-shortcuts/releases/latest/download/markedit-native-text-shortcuts.js).
2. Copy `markedit-native-text-shortcuts.js` into MarkEdit's scripts folder:

```
~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/
```

3. Relaunch MarkEdit. After that the extension [keeps itself up to date](#updates) so there's no need to download it again by hand.

## Updates

The extension checks the latest GitHub release once per week. When a newer release is available, it downloads the `markedit-native-text-shortcuts.js` release asset and overwrites the installed script. Restart MarkEdit after updating.

You can also check manually from *Extensions -> Native Text Shortcuts -> Check for Updates...*.

By default, update behavior is `notify`. To change it, add this to MarkEdit's `settings.json`:

```json
{
  "extension.markeditNativeTextShortcuts": {
    "update": "notify"
  }
}
```

Supported values are:

- `automatic`: install new releases silently, then prompt you to restart MarkEdit.
- `notify`: ask before installing.
- `never`: disable automatic checks. Manual checks still work from the menu.

## Releases

Release notes live in [CHANGELOG.md](CHANGELOG.md). This repo also includes a `release` skill at `.agents/skills/release/SKILL.md` for bumping versions, updating the changelog, tagging, pushing, and publishing the script as the GitHub release asset used by the updater.
