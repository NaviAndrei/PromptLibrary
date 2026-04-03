# 🚀 Prompt Library

A professional, local-first **AI Prompt Management System** built for speed, organization, and portability.

[![Deployment Status](https://github.com/NaviAndrei/PromptLibrary/actions/workflows/deploy.yml/badge.svg)](https://github.com/NaviAndrei/PromptLibrary/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/badge/version-1.3.1-blue.svg)](package.json)

## ✨ Features

- **📂 Smart Workspaces**: Virtual folder organization for grouping related prompts.
- **🎛️ Unified Control Bar**: Search, view toggles, model filters, and date range live together in one compact header.
- **⚡ Full-Text Search**: High-performance local search across title, body, and tags (powered by **FlexSearch**).
- **🧭 Sidebar Polish**: Helpful section notes, clearer dividers, and an inset scrollbar keep the left panel readable.
- **🏷️ Sidebar-Driven Tags**: The Add New Prompt form suggests tags from the sidebar cloud and supports comma-separated multi-tag entry.
- **🗂️ Prompt Templates**: Reusable templates can be edited in a modal and added as prompts with one click.
- **🌗 Dark Mode**: Premium dark/light themes that persist across sessions.
- **🧩 Variable Injection**: Use `{{variable}}` syntax with dynamic UI inputs.
- **💄 Advanced Filtering**: Specific Model and Date-Range (inclusive) filters.
- **📝 Plain-Text Prompt View**: Expanded prompt content stays selectable for easier copy and reuse.
- **🕐 Version History**: Automatic snapshots of your prompts with visual diffing.
- **🏛️ IndexedDB**: Massive local capacity (hundreds of MBs) replacing the 5MB browser limit.
- **📱 PWA v2 Native**: Full offline access with background asset caching and connectivity monitoring.
- **🧼 Cleanup Assistant**: Identify and remove large, stale, or duplicate prompts.

## 🛠️ Tech Stack

- **Core**: React 19 + TypeScript 5.9 + Vite 8
- **Storage**: IndexedDB (Primary) + LocalStorage (Settings)
- **Search**: FlexSearch (In-Memory Engine)
- **Styling**: Vanilla CSS (Global Variables + responsive shells)
- **Icons**: Lucide React
- **Security**: CodeQL Workflow Analysis

## 🚀 Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/NaviAndrei/PromptLibrary.git
   cd PromptLibrary
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run in development mode**:

   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🌐 Deployment

The project is automatically deployed to **GitHub Pages** via GitHub Actions on every push to the `main` branch.

**Live Demo**: [https://naviandrei.github.io/PromptLibrary/](https://naviandrei.github.io/PromptLibrary/)

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by **NaviAndrei**
