# PromptLibrary

A browser-based prompt manager for storing, organizing, and reusing AI prompts. Built to replace scattered note files and markdown docs with something searchable and structured.

## Stack

React 19.2 · TypeScript 5.9 · Vite 8 · IndexedDB (native browser API) · FlexSearch 0.7 · Sonner 2.0 · Lucide React 1.7

## Features

- Create, edit, and delete prompts with title, body, tags, and model target
- Workspaces with custom color and icon for grouping related prompts
- Tag filtering via the sidebar tag cloud; the prompt form suggests existing tags and accepts comma-separated input
- Full-text search across title, body, and tags, powered by FlexSearch (in-memory index)
- Export individual prompts as `.md` or `.json` via a format picker modal
- Batch export all prompts with workspace and tag filters applied
- Import prompts from a JSON file with a choice of merge or replace strategy
- Version history per prompt with visual line-level diff
- Variable injector: write `{{VARIABLE}}` in a prompt body and get live input fields rendered per variable
- Template manager for storing and converting reusable prompt skeletons into full prompts
- Dark/light mode toggle, persisted to localStorage
- Cleanup assistant to surface large, stale, or duplicate prompts
- Storage usage indicator showing current IndexedDB consumption

## Getting Started

```bash
npm install
npm run dev      # dev server at localhost:5173
npm run build    # type-check + bundle to dist/
npm run preview  # serve the built dist/ locally
```

## Project Structure

```
src/components/  — UI components, modals, and workspace views
src/hooks/       — custom hooks for filters, storage, drawer state
src/services/    — FlexSearch index setup and search logic
src/utils/       — IndexedDB read/write helpers
src/types/       — feature-specific TypeScript declarations
```

## Notes

- All data lives in the browser: localStorage for settings and preferences, IndexedDB for prompts and workspaces. There is no backend or sync.
- Concurrent writes from two open tabs can race in IndexedDB — documented in `docs/TEST_STRATEGY.md`, deferred pending a larger refactor.
