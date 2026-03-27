# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-03-27

### Added
- **Tag Autocomplete**: Built-in form autocomplete when typing tags based on your existing library.

### Changed
- Relocated the **Grid/List View Toggle** next to the search bar for an improved user experience.

### Fixed
- **State Sync Bug**: Fixed a core rendering issue where JSON Import and Cloud Sync operations wouldn't automatically re-render the prompt list.
- Removed intrusive browser `window.confirm` pop-ups from automated sync flows to prevent PWA blocking limits.

## [1.1.0] - 2026-03-27

### Added
- **PWA Support**: Full offline capabilities and installable application icon.
- **Cloud Sync**: GitHub Gist integration for secure, serverless cloud storage.
- **Data Portability**: JSON Export/Import for backups and individual Markdown export per prompt.
- **Rich Text Rendering**: Integrated `ReactMarkdown` with `GitHub Flavored Markdown` support.
- **Syntax Highlighting**: Code blocks within prompts are now highlighted using `Prism`.
- **UI Enhancements**:
    - Interactive **Tags Cloud Sidebar** for quick filtering.
    - **Grid (Masonry)** vs **List** view modes.
    - Premium toast notifications using `sonner`.
    - Modern iconography with `lucide-react`.
- **Token Counter**: Real-time token usage estimator for each prompt.
- **CI/CD Pipeline**: GitHub Actions workflow for automated build and lint validation on every PR.

### Changed
- Refactored `PromptList` for better performance and rich display.
- Enhanced `index.css` with responsive, modern layout systems.
- Updated `package.json` with production deployment scripts.

## [1.0.0] - 2026-03-25

### Added
- Initial project structure with Vite, React, and TypeScript.
- Core CRUD operations for AI prompts stored in `localStorage`.
- Basic real-time search and tag filtering.
- Responsive CSS design system.
- MIT License and basic README documentation.
- Automated deployment to GitHub Pages via `gh-pages`.

[1.1.1]: https://github.com/NaviAndrei/PromptLibrary/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/NaviAndrei/PromptLibrary/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/NaviAndrei/PromptLibrary/releases/tag/v1.0.0
