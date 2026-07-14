# MarkEdit Native Text Navigation Plugin

Adopts standard macOS text-editing behavior for Option-Up/Down in [MarkEdit](https://github.com/MarkEdit-app/MarkEdit).

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

Copy `markedit-native-text-navigation.js` into MarkEdit's user scripts folder, or install this folder as a MarkEdit customization extension if you manage your extensions as directories.

The script uses the public `MarkEdit.addExtension` API and registers a highest-precedence CodeMirror keymap so it runs before MarkEdit's default paragraph move/duplicate bindings.
