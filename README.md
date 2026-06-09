# 📖 Passage Prep

**Build reusable Bible studies in seconds.**
Format, organize, and export Bible study questions with ease.

🚀 **[Live Demo](https://passage-prep.netlify.app/)**

---

## ✨ Features

- **Question Bank:** Centralized storage for your best study questions.
- **Smart Formatting:** Copy and paste outlines in Rich Text or Markdown.
- **Automatic Context:** Instant authorship and theme notes for each passage.
- **Admin Tools:** Dashboard for approving, editing, and bulk-uploading data.

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js:** 18.0.0 or higher
- **Yarn:** 1.22+
- **MongoDB:** A local instance or an Atlas cluster.

### 🛠️ Local Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd passage-prep
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your `MONGODB_URI`.
   *Note: Ensure your URI includes the database name (e.g., `/bible_study_app`).*

4. **Initialize Database**
   ```bash
   # Seed with sample questions
   yarn import-data

   # Create admin user
   yarn setup-admin
   ```

5. **Start Development**
   ```bash
   yarn dev
   ```
   The app will be available at `http://localhost:8888`.

---

## 🌐 Deployment

### Netlify Setup

1. **Connect Repository:** Link your Git repo to a new Netlify site.
2. **Environment Variables:** Navigate to **Site settings > Environment variables** and add:

| Key | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://...` |
| `ADMINUSER` | Admin username for dashboard | `admin` |
| `ADMINPASSWORD` | Admin password for dashboard | `password` |
| `VITE_APP_TITLE` | Custom app title (Optional) | `PassagePrep` |

3. **Build Settings:** Netlify will automatically detect:
   - **Build Command:** `yarn build`
   - **Publish Directory:** `build`
   - **Functions Directory:** `netlify/functions`

---

## 💻 Scripts

- `yarn dev` — Run the local dev environment (Vite + Netlify Functions).
- `yarn build` — Compile frontend for production.
- `yarn test` — Run the test suite with Vitest.
- `yarn lint` — Check code for quality and style issues.
- `yarn import-data` — Load sample data into MongoDB.
- `yarn setup-admin` — Provision admin credentials in the database.

## 🛠️ Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Netlify Functions (Node.js)
- **Database:** MongoDB, Mongoose

---

## 🔗 Related Projects

- **[Drag And Preach](https://github.com/allemandi/drag-and-preach)** — Modern drag-and-drop sermon planner.
- **[Vector Knowledge Base](https://github.com/allemandi/vector-knowledge-base)** — Minimalist knowledge system with semantic memory.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

## ☕ Support

If this project helps you, consider **[buying me a coffee](https://www.buymeacoffee.com/allemandi)**!

## 💡 Acknowledgments

Built with the assistance of AI tools like GitHub Copilot and Cursor for rapid development.

## 📄 License

[MIT License](LICENSE)
