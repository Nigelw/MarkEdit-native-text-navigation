# MarkEdit Native Text Shortcuts

Makes MarkEdit’s <kbd>Option</kbd>+<kbd>Arrow Key</kbd> text navigation behave like native macOS text fields.

## Features

### Move by paragraph

- <kbd>⌥</kbd><kbd>↑/↓</kbd> moves the insertion point to the beginning or end of a paragraph.
- <kbd>⌥</kbd><kbd>⇧</kbd><kbd>↑/↓</kbd> extends the selection to the beginning or end of a paragraph.

*Overrides MarkEdit’s default behavior for these shortcuts, which is to move or copy paragraphs.*

### Move by word

- <kbd>⌥</kbd><kbd>←/→</kbd> moves the insertion point by native-style word boundaries.
- <kbd>⌥</kbd><kbd>⇧</kbd><kbd>←/→</kbd> extends the selection by those boundaries.

*Overrides MarkEdit’s default behavior for these shortcuts, which is to stop the cursor at apostrophes and symbols like `> < - – — / . , : ; ! ? # @ * () [] {}`.*

### Collapse a selection vertically

- <kbd>↑/↓</kbd> collapses a text selection range and moves the insertion point one line.
- The source column follows the selection head, so forward and backward selections match native macOS text fields.

## Install

1. Open MarkEdit's Extension Manager.
2. Search for **Native Text Shortcuts** and choose **Install**.
3. The Extension Manager manages future updates for you.

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

## Releases

Release notes live in [CHANGELOG.md](CHANGELOG.md). Releases are published from immutable version tags and distributed through MarkEdit's Extension Manager.
