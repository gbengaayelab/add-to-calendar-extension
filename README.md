# Add To Calendar Chrome Extension — Developer Setup Guide

Welcome to the Add To Calendar project! 🚀
This guide will help you **clone**, **set up**, **build**, and **run** the project **locally** on your PC using **Visual Studio Code (VS Code)**.

---

## 🧰 Prerequisites

Make sure you have the following installed:

| Tool           | Why You Need It | Where to Get It |
|----------------|-----------------|-----------------|
| **Node.js**    | To run build commands (Webpack, Babel) | [Download Node.js](https://nodejs.org/) |
| **Git**        | To clone the repository | [Download Git](https://git-scm.com/) |
| **VS Code**    | (Recommended) Code editor + Terminal + Git integration | [Download Visual Studio Code](https://code.visualstudio.com/) |
| **Chrome Browser** | To load and test the extension | Already installed or [Download Chrome](https://www.google.com/chrome/) |

---

## 📆 Project Structure Overview

| File / Folder         | Purpose                                              |
|------------------------|------------------------------------------------------|
| `background.js`         | Main logic: right-click menu, date parsing, event creation. |
| `welcome.html`          | Beautiful onboarding page after install.           |
| `welcome.css`           | Styling for welcome.html.                           |
| `manifest.json`         | Defines how Chrome reads and loads the extension.   |
| `webpack.config.js`     | Bundles JavaScript files for production.             |
| `player.js`             | Vimeo video embed script for the welcome page.       |
| `package.json`          | Lists dependencies and defines scripts for building. |

---

## 🛠️ Step-by-Step Setup

### 1. Clone the Repository (in VS Code)

Open VS Code → open a **new Terminal** inside VS Code (`Ctrl + ~`).

```bash
git clone https://github.com/YOUR_USERNAME/add-to-calendar-extension.git
cd add-to-calendar-extension
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

This creates a `dist/` folder containing the production-ready files.

### 4. Load the Extension into Chrome

- Open Chrome.
- Go to **chrome://extensions/**
- **Enable Developer Mode** (toggle at the top-right).
- Click **Load Unpacked**.
- Select the **`dist/`** folder created after build.

---

## 🗋 Building and Rebuilding During Development

If you make code changes:

```bash
npm run build
```

Then go to **chrome://extensions** and click **Reload** under the extension.

---

## ⚙️ How the Development Build Works

- **Webpack** bundles your JS/CSS/HTML files.
- **Babel** ensures your JavaScript works across browsers.
- Files are placed in `/dist` which Chrome loads.

---

## 🔥 How to Compile & Build in VS Code (Quick Reference)

| Step | Action | Command |
|------|--------|---------|
| 1    | Open Terminal (`Ctrl + ~`) | — |
| 2    | Clone project | `git clone https://github.com/YOUR_USERNAME/add-to-calendar-extension.git` |
| 3    | Navigate into folder | `cd add-to-calendar-extension` |
| 4    | Install Node packages | `npm install` |
| 5    | Build compiled files | `npm run build` |
| 6    | Load `dist/` in Chrome Extensions | via Chrome UI |

---

## 🧑‍💻 Helpful VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| **Prettier** | Auto-format code. |
| **ESLint** | JavaScript error checking. |
| **Live Server** | Quick preview for welcome.html (optional). |

---

## 📜 Privacy and Permissions

- No personal information is collected.
- No browsing history or location data is accessed.
- All event creation is performed **locally** in your browser.
- Fully privacy-compliant.

---

## 📈 What's Next?

| Task | Priority |
|------|----------|
| Add Microsoft Outlook support | Future |
| Improve natural language recognition | Future |
| Automatic hot-reload for dev builds | Future |

---

# ✅ You're Ready!

You can now build, customize, and extend the **Add To Calendar** Chrome Extension!

Happy coding! 🚀
