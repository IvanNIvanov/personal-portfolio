# Ivan Ivanov - Personal Portfolio & Automation Architect Showcase

A modern, high-performance personal portfolio website built with **React**, **TypeScript**, **Tailwind CSS**, and **Express**. It showcases professional experience in enterprise automation, RPA (UiPath, Power Automate), software development, and technical leadership.

---

## 🌟 Key Features

- **Executive Portfolio Showcase**:
  - Hero section with live CV document download
  - Comprehensive "About Me" profile with key metrics (10+ years experience, 50+ enterprise projects)
  - Interactive Work History timeline with detailed achievement bullet points
  - Categorized Technical & Automation Expertise (UiPath, Python, Power Platform, SQL, etc.)
  - Certifications gallery with credential verification and interactive drag-and-drop reordering
  - Contact section with one-click direct email, LinkedIn integration, and location information

- **Built-in Administrative Dashboard (Admin Panel)**:
  - **Live Editing**: Update bio, metrics, hero badges, work positions, and skills in real time.
  - **CV Version Management**: Upload new versions of your CV (`.pdf`, `.doc`, `.docx`) which visitors can download directly via the *Download CV* button.
  - **Profile Photo Customization**: Upload profile portraits directly from device or specify an image URL.
  - **Drag & Drop Reordering**: Reorder certifications with intuitive drag-and-drop grip handles or quick ↑ / ↓ controls.
  - **Secure Password Authentication**: Change administrator password anytime directly in the dashboard.

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 19 + TypeScript
  - Tailwind CSS + Lucide Icons
  - Motion / Framer Motion for smooth animations
  - Vite for ultra-fast bundling and HMR
- **Backend & Persistence**:
  - Node.js + Express API server (`server.ts`)
  - REST endpoints for portfolio data (`/api/portfolio`), admin authentication (`/api/admin/*`), binary CV downloads (`/api/cv`), and file uploads (`/api/upload`)
  - Server-side JSON & binary storage in `data/`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `bun`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/IvanNIvanov/personal-portfolio.git
   cd personal-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (runs full-stack with Express + Vite on port 3000):
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🔐 Administrative Access

- To open the Admin Panel, click the **Lock icon** in the left navigation sidebar (or at the bottom of the footer).
- **Default password**: `ivanov2026`
- Once logged in, you can update content, upload a new CV or profile photo, reorder certifications via drag-and-drop, and change your password in the **Security** tab.

---

## 📦 Production Build

```bash
# Build frontend bundle
npm run build

# Start production server
npm start
```

---

## 📄 License

MIT © [Ivan Ivanov](https://github.com/IvanNIvanov)
