# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## v0.7.0 - 2026-10-06

### Added

- Backspace between an empty pair removes both characters
- "Restore defaults" button in the options
- Brackets work in editors embedded in iframes (e.g. TinyMCE)
- Brackets work in inputs inside open Shadow DOM components
- Translated popup and options validation messages

### Changed

- The extension is enabled right after installation
- A pair is inserted only when the caret is followed by whitespace, the end of the text or one of `;:.,=}])>`
- Text is inserted with the browser's editing commands, so undo works and rich-text editors stay in sync
- Surrounding text in rich-text editors keeps the formatting of the selection
- The options reject a character that is already used by another pair
- The popup icon is bundled instead of loaded from Google Fonts; Font Awesome is no longer bundled
- Removed the unneeded host permission
- License changed from CC BY-SA 4.0 to Apache 2.0

### Fixed

- Typing a closing bracket no longer inserts a pair
- Auto-pairing after a space in rich-text editors
- Auto-pairing and skipping a closing bracket next to line breaks and formatted text in rich-text editors
- Password fields are no longer modified
- Code editors (Monaco, CodeMirror, Ace) are left to pair brackets on their own
- The popup power button switched only once per opening
- Validation errors in the options never cleared
- Bracket checkboxes were not always disabled together with their column

### Links

- [Release](https://github.com/Andret2344/surround-it/releases/tag/v0.7.0)

---

## v0.6.0 - 2025-12-21

### Added

- Separated checkboxes for inserting and surrounding text with brackets

### Links

- [Release](https://github.com/Andret2344/surround-it/releases/tag/v0.6.0)

---

## v0.5.0 - 2025-08-17

> **Note:** This is the first release on GitHub! 🎉

### Fixed

- Extension mechanics now work reliably and consistently

### Links

- [Release](https://github.com/Andret2344/surround-it/releases/tag/v0.5.0)
