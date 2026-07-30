# MarkEdit Native Text Shortcuts

Makes MarkEdit’s <kbd>Option</kbd>+<kbd>Arrow Key</kbd> text navigation behave like native macOS text fields.

**[Download the latest release](https://github.com/Nigelw/MarkEdit-native-text-shortcuts/releases/latest/download/markedit-native-text-shortcuts.js)** then see [Install](#install) below.

## Features

### Move by paragraph

- <kbd>⌥</kbd><kbd>↑/↓</kbd> moves the insertion point to the beginning or end of a paragraph.
- <kbd>⌥</kbd><kbd>⇧</kbd><kbd>↑/↓</kbd> extends the selection to the beginning or end of a paragraph.

*Overrides MarkEdit’s default behavior for these shortcuts, which is to move or copy paragraphs.*

### Move by word

- <kbd>⌥</kbd><kbd>←/→</kbd> moves the insertion point by native-style word boundaries.
- <kbd>⌥</kbd><kbd>⇧</kbd><kbd>←/→</kbd> extends the selection by those boundaries.

*Overrides MarkEdit’s default behavior for these shortcuts, which is to stop the cursor at apostrophes and symbols like `> < - – — / . , : ; ! ? # @ * () [] {}`.*

## Install

1. [Download the latest release](https://github.com/Nigelw/MarkEdit-native-text-shortcuts/releases/latest/download/markedit-native-text-shortcuts.js).
2. Copy `markedit-native-text-shortcuts.js` into MarkEdit's scripts folder:

```
~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/
```

3. Relaunch MarkEdit. After that the extension [keeps itself up to date](#updates) so there's no need to download it again by hand.

## Word navigation settings

By default, macOS-style word navigation applies everywhere, including code blocks. Turn on *Extensions -> Native Text Shortcuts -> Use Code-Style Word Navigation in Code Blocks* to use MarkEdit's default word navigation logic inside fenced and indented code blocks. The change takes effect immediately and is saved in MarkEdit's `settings.json`.

To turn it on manually, add this to MarkEdit's `settings.json` and relaunch the app:

```json
{
  "extension.markeditNativeTextShortcuts": {
    "codeNavigationInCodeBlocks": true
  }
}
```

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

Supported `update` values are:

- `automatic`: install new releases silently, then prompt you to restart MarkEdit.
- `notify`: ask before installing.
- `never`: disable automatic checks. Manual checks still work from the menu.

## Releases

Release notes live in [CHANGELOG.md](CHANGELOG.md). This repo also includes a `release` skill at `.agents/skills/release/SKILL.md` for bumping versions, updating the changelog, tagging, pushing, and publishing the script as the GitHub release asset used by the updater.
