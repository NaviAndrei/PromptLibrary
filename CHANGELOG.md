# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2026-03-28

### Added 🚀
- **IndexedDB Persistence**: Unlimited local storage capacity, bypassing the 5MB browser limit.
- **Full-Text Local Search**: High-performance semantic searching via FlexSearch (title, body, tags).
- **PWA v2 + Offline Sync**: Background asset caching and offline functionality with connectivity badging.
- **Cleanup Assistant AI**: Automatic identification of large, stale, or duplicate prompts.
- **Advanced Filtering**: New filter bar with Model selection and inclusive Date-Range normalization.
- **CI/CD Build Audit**: Integrated GitHub Actions with CodeQL security and build size auditing.

### Changed 🎨
- **O(1) Reactive Refactoring**: Massive architectural cleanup using specialized custom hooks and modular components.
- **Sidebar UX**: Optimized layout with flexbox vertical docking for tools and system monitors.

## [1.2.0] - 2026-03-27

### Added 🚀
- **Smart Workspaces**: Virtual folder organization for grouping related prompts.
- **Dynamic Variable Injector**: Regex-based detection of `{{variable}}` with live UI input fields.
- **Prompt Version History**: Automatic snapshots of prompt bodies on every edit.
- **Visual Diff Algorithm**: Custom LCS (Longest Common Subsequence) implementation for comparing prompt versions.
- **English Translation**: Complete transition of the UI and documentation to English.

### Changed 🎨
- Improved Grid layout for high-resolution displays (3+ columns).
- Styled Version History modal and Workspace accent colors.
- Sidebar structure updated to include Workspace Manager.

## [1.1.1] - 2026-03-26

### Added ✨
- **Dark Mode**: High-contrast theme with persistent storage.
- **Smart Tags Autocomplete**: Multi-tag detection in the input form.
- **Markdown Highlighting**: Improved syntax rendering for code blocks.

### Fixed 🛠️
- Resolved critical state sync issue where JSON imports didn't trigger immediate UI refreshes.
- Cleaned up Git merge conflicts across the main app shell.

## [1.0.0] - 2026-03-25

### Added 🎉
- Initial release of the Prompt Library PWA.
- Basic CRUD operations, Tagging, and Search.
- GitHub Gist Cloud Sync and Local JSON Backup/Restore.
