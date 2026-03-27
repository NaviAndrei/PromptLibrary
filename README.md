# 🚀 Prompt Library

A professional, local-first **AI Prompt Management System** built for speed, organization, and portability.

[![Deployment Status](https://github.com/NaviAndrei/PromptLibrary/actions/workflows/deploy.yml/badge.svg)](https://github.com/NaviAndrei/PromptLibrary/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](package.json)

## ✨ Features

- **📂 Smart Workspaces**: Organize prompts into dedicated project folders with custom icons and colors.
- **🌗 Dark Mode**: Premium dark/light themes that persist across sessions.
- **🧩 Variable Injection**: Use `{{variable}}` syntax to create dynamic templates with live input fields.
- **🕐 Version History**: Automatic snapshots of your prompts with a built-in visual code diff (LCS algorithm).
- **☁️ Cloud Sync**: Bidirectional synchronization using GitHub Gists (Secret) – keeps your data private and mobile.
- **📱 PWA Ready**: Install it as a desktop or mobile app for offline access.
- **🏷️ Multi-Tag Autocomplete**: Smart tag suggestions even for multiple tag entries.
- **🚀 Masonry Grid**: Optimized layout for wide screens (3+ columns).

## 🛠️ Tech Stack

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS (CSS Variables)
- **Icons**: Lucide React
- **Storage**: LocalStorage + GitHub Gist API
- **Formatting**: React Markdown + Syntax Highlighting (Prism)

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
