# 📖 Passage Prep

Build reusable Bible studies in seconds. Format, organize, and export Bible study questions with ease.

🚀 **[Live Demo on Netlify](https://passage-prep.netlify.app/)**

---

## ✨ Key Features

- **Question Memory Bank** — Save and retrieve your best study questions.
- **Smart Formatting** — Export studies in Rich Text or Markdown formats.
- **Book Context** — Automatic authorship and theme notes for each passage.
- **Admin Dashboard** — Approve, edit, and bulk-manage your data.

## 🚀 Getting Started

### 🛠️ Prerequisites

- **Node.js:** 18.0.0 or higher
- **Yarn:** 1.22+
- **MongoDB:** A local instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

### ⚡ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd passage-prep
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Update the `MONGODB_URI` in your `.env` file. If you are using MongoDB Atlas, make sure to include the database name `bible_study_app` in your connection string.

4. **Initialize the Database:**
   ```bash
   # Preload sample questions
   yarn import-data

   # Set up admin credentials
   yarn setup-admin
   ```

5. **Run Locally:**
   ```bash
   yarn dev
   ```
   Access the app at `http://localhost:8888`.

---

## ⚙️ Configuration

### Environment Variables

When deploying to **Netlify**, add these variables in **Site settings > Environment variables**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/bible_study_app` |
| `ADMINUSER` | Admin dashboard username | `admin` |
| `ADMINPASSWORD` | Admin dashboard password | `your-secure-password` |
| `VITE_APP_TITLE` | Application Title | `PassagePrep` |

---

## 💻 Development Scripts

- `yarn dev` — Start the local development environment (Vite + Netlify Functions).
- `yarn build` — Build production-ready frontend assets.
- `yarn test` — Run the test suite with Vitest.
- `yarn lint` — Check for code quality and style issues.
- `yarn import-data` — Load sample data into MongoDB.
- `yarn setup-admin` — Create or update admin user credentials.

## 🛠️ Built With

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Netlify Functions, Node.js
- **Database:** MongoDB, Mongoose

## 🔗 Related Projects

- **[Drag And Preach](https://github.com/allemandi/drag-and-preach)** — A modern drag-and-drop sermon planner.
- **[Vector Knowledge Base](https://github.com/allemandi/vector-knowledge-base)** — Minimalist knowledge system with semantic memory.

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request for any improvements or features.

## ☕ Support

If this project has helped you, consider **[buying me a coffee](https://www.buymeacoffee.com/allemandi)** to help fuel more improvements!

## 💡 Acknowledgments

Powered by AI-assisted tools like GitHub Copilot and Cursor for enhanced coding efficiency.

## 📄 License

This project is licensed under the MIT License.
