# PromptLibrary — Claude Code Context

## Stack
React 18 + TypeScript + Vite + CSS Modules (React 19 in package.json dependencies)

## Build & Test Commands
- Dev Server: `npm run dev`
- Build Project: `npm run build`
- Lint Code: `npm run lint`
- Deploy to GitHub Pages: `npm run deploy`

## Key Architecture Decisions
- `types.ts` = shared global types; `src/types/` = feature-specific types
- `index.css` is being migrated to CSS Modules (in progress)
- Mobile-first responsive design target: 320px → 1440px

## Do Not Touch
- `package-lock.json` (do not regenerate unless explicitly asked)

## Commit Convention
- fix(responsive): [component]
- feat: [description]
- refactor: [scope]

## Known Non-Issues
- `.agent/workflows/` is inactive legacy tooling from a different AI assistant (Windsurf/Cascade) — Claude Code does not read this directory. Safe to ignore or remove.