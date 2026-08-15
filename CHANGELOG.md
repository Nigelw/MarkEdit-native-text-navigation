# Changelog

## 1.1.3 (2026-08-15)

### New

- When text is selected and you press the up or down arrow, move the text cursor using the same logic as native macOS text fields.
  - Instead of moving to then beginning/end of selection range, it moves up/down a line, preserving the column position depending on the text selection direction.

## 1.1.2 (2026-08-01)

### Improved

- Updates are managed centrally by MarkEdit's Extension Manager.

## 1.1.1 (2026-07-30)

### Improved

- Simplifies the macOS- vs. code-style word navigation setting to a single menu toggle.

## 1.1.0 (2026-07-29)

### New

- Adds native-style Option-Left/Right word navigation, including selection with Shift-Option-Left/Right, to move through Markdown punctuation and markers more like a native macOS text field.
- Adds menu options for choosing macOS-style word navigation everywhere, only in prose, or nowhere.

## 1.0.5 (2026-07-22)

### Improved

- Adds a menu item for opening the release notes on GitHub.

## 1.0.4 (2026-07-20)

### Fixed

- Update repo and code to use correct repo name capitalization.

## 1.0.3 (2026-07-20)

### Changed

- Renamed from `markedit-native-text-navigation` → `markedit-native-text-shortcuts`.

## 1.0.2 (2026-07-18)

### Improved

- Reduces automatic update checks from daily to weekly.

## 1.0.1 (2026-07-18)

### New

- Adds an in-app update checker that can install newer GitHub release builds.
- Adds an Extensions menu with links to visit the GitHub project and check for updates manually.
- Adds release notes and a release workflow for publishing updater-compatible GitHub assets.

### Improved

- Documents the latest-version download link and update settings in the README.

## 1.0.0 (2026-07-14)

### New

- Initial release: restores native macOS-style `Option-Up/Down` paragraph navigation in MarkEdit.
- `Shift-Option-Up/Down` extends the current selection to the beginning or end of the paragraph.
