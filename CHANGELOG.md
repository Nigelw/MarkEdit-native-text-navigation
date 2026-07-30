# Changelog

## 1.1.0 (2026-07-29)

### New

- Adds native-style Option-Left/Right word navigation, including selection with Shift-Option-Left/Right, to move through Markdown punctuation and markers more like a native macOS text field.
- Adds a *Use Code-Style Word Navigation in Code Blocks* menu toggle. It is off by default, so macOS-style word navigation applies everywhere unless you opt to preserve code-style navigation in code blocks.

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
