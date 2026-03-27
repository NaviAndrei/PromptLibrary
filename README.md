# 📝 Prompt Library

A sleek, production-quality web application designed to help AI enthusiasts and developers manage their collection of LLM prompts. Built with **React**, **TypeScript**, and **Vite**, it features full CRUD functionality with zero backend dependencies.

---

## ✨ Features

- **🚀 PWA Support**: Work offline and install as a native app on mobile or desktop.
- **☁️ Cloud Sync**: Securely sync your prompts using GitHub Gists (No database needed!).
- **📑 Rich Formatting**: Markdown support with syntax highlighting for code blocks.
- **🔍 Advanced Search**: Instant filtering by title, body, or tags.
- **🏷️ Smart Tags**: Interactive sidebar to organize your library and intelligent autocomplete when adding new prompts.
- **💾 Data Control**: Export/Import your entire library as JSON or individual prompts as Markdown.
- **📊 Token Estimator**: Real-time token count estimation for each prompt.
- **🛡️ Secure & Private**: All data stays in your browser or your private GitHub Gist.
- **🌓 Modern UI**: Responsive design with Grid (Masonry) and List view modes.

## 🛠️ Technology Stack

- **React 19** & **TypeScript**
- **Vite** (Build Tool & PWA)
- **Lucide React** (Icons)
- **Sonner** (Toast Notifications)
- **Markdown** (remark-gfm, react-syntax-highlighter)
- **GitHub Actions** (CI/CD)
- **GitHub Pages** (Hosting)

## 📋 Changelog

Detailed changes for each release can be found in the [CHANGELOG.md](./CHANGELOG.md) file.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/NaviAndrei/PromptLibrary.git
   ```
2. Navigate to the project directory:
   ```bash
   cd PromptLibrary
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Build
Build the project for production:
```bash
npm run build
```

### 🗺️ Roadmap

- [x] PWA Support & Offline Mode
- [x] JSON Import/Export & Markdown Export
- [x] GitHub Gist Cloud Sync
- [x] Markdown Rendering & Syntax Highlighting
- [x] Smart Tag Autocomplete
- [ ] Dark Mode Toggle
- [ ] Multiple Gist support for shared libraries
- [ ] Advanced prompt templates with input variables

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

Copyright (c) 2026 **Ivan Andrei (NaviAndrei)**

---
*Developed with ❤️ as a modern prompt management solution.*
