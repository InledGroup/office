<p align="center">
  <img src="./public/logo.svg" width="120" height="120" alt="InSuite Logo">
</p>

<h1 align="center">Inled InSuite</h1>

<p align="center">
  <strong>A modern, local-first Office document preview and editing solution.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/framework-Next.js%2015-black.svg" alt="Framework">
  <img src="https://img.shields.io/badge/license-AGPL%20v3-orange.svg" alt="License">
  <a href="https://office.inled.es/">
    <img src="https://img.shields.io/badge/website-office.inled.es-blue.svg" alt="Website">
  </a>
</p>

<p align="center">
  <a href="https://office.inled.es/"><strong>🚀 Live Demo</strong></a> | <a href="README.zh-CN.md">中文版</a> | <span>English</span>
</p>

<p align="center">
  <strong>Quick Create:</strong>
  <a href="https://office.inled.es/editor?new=docx">📄 Word</a> | 
  <a href="https://office.inled.es/editor?new=xlsx">📊 Excel</a> | 
  <a href="https://office.inled.es/editor?new=pptx">📽️ PowerPoint</a>
</p>

---

## 🚀 Overview

**Inled InSuite** is a powerful web application designed to provide a seamless experience for viewing and editing Office documents (Word, Excel, PowerPoint) directly in your browser. Built with a "local-first" philosophy, it ensures your documents remain private and secure while providing a desktop-class editing experience.

### 🌍 Access Options

- **Main Domain ([office.inled.es](https://office.inled.es/))**: Recommended for all users.

## ✨ Key Features

- **📂 Multi-Format Support**: Open and edit `.docx`, `.xlsx`, and `.pptx` files.
- **🔒 Local-First**: Files are processed locally in your browser, ensuring data privacy.
- **⚡ Fast & Responsive**: Built with Next.js 15+ and optimized for performance.
- **🛠️ Rich Tools**: Integrated with advanced editing capabilities.
- **📦 Persistent Storage**: Uses IndexedDB for local file management.
- **🌐 Cloud Integration**: Easy file selection via Uppy (Google Drive, Dropbox, OneDrive).

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb`)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 🛠️ Getting Started

### Prerequisites

- Node.js 22+
- pnpm (recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd website
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment

The project is configured for Cloudflare Pages.

- **Production Build**: `pnpm build`
- **Deploy to Production**: `pnpm deploy`
- **Deploy Preview**: `pnpm deploy:preview`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

## 📜 License

This project is licensed under the **GNU Affero General Public License Version 3 (AGPL v3)**.

## 🙏 Acknowledgments

Special thanks to the following projects that made this possible:

- [ONLYOFFICE Web Apps](https://github.com/ONLYOFFICE/web-apps)
- [OnlyOffice x2t WASM](https://github.com/cryptpad/onlyoffice-x2t-wasm) - High-performance document conversion in the browser.
- [ONLYOFFICE SDKJS](https://github.com/ONLYOFFICE/sdkjs)
- [Office Converters](https://github.com/cryptpad/office-converters)

---

<p align="center">
  Built with ❤️ for a better office experience.
</p>
