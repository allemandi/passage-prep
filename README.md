# 📖 Passage Prep

> **Format, organize, and export Bible study questions**
>
> Build reusable Bible studies in seconds

🚀 [Netlify Live Demo](https://passage-prep.netlify.app/)

## ✨ Key Features
- Question Memory Bank - Save your best questions
- Smart Formatting - Copy and paste outlines in Rich Text or Markdown
- Book Context - Automatic authorship/theme notes for each passage
- Fetch & Filter - "Just the best Genesis passages about forgiveness, please"
- Collaborative - Add new questions to shared database

## 🚀 Getting Started

### 🛠️ Prerequisites
- **Node.js 18+** (Required for React 19 and Vite 8)
- **Yarn 1.22+**
- **MongoDB Atlas cluster** (or a local MongoDB instance)

### ⚡ Setup
1. **Clone & Install:**
   ```bash
   git clone <repository-url>
   cd passage-prep
   yarn install
   ```
2. **Configure MongoDB:**
   - Create a `.env` file in the root directory. You can use `.env.example` as a template:
     ```bash
     cp .env.example .env
     ```
   - Update `MONGODB_URI` in `.env` with your connection string.
   - *Note: If using MongoDB Atlas, ensure you include the database name `bible_study_app` in the URI.*

3. **Import Data:**
   - Preload sample questions into your database:
     ```bash
     yarn import-data
     ```

4. **(Optional) Admin Setup:**
   - Define your admin credentials in `.env`:
     ```
     ADMINUSER=<your-admin-username>
     ADMINPASSWORD=<your-admin-password>
     ```
   - Create the admin user in the database:
     ```bash
     yarn setup-admin
     ```

5. **Run Locally:**
   To run the application locally, which includes the Vite frontend development server and emulation of Netlify Functions for the backend:
   ```bash
   yarn dev
   ```
   This will typically make the application available at `http://localhost:8888`.

## 🖥️ Usage

### Search & Format
- Add scripture references
- Filter by theme
- Click **Search Questions**
- Select questions, then **Generate Study** to preview/copy

### Submit a Question
- Select a theme
- Enter a Bible reference
- Write your question
- Submit

### Admin
- Login with admin credentials at `/admin`
- Approve, edit, or delete questions
- Download CSV of filtered or all questions
- Bulk upload questions

## 🌐 Deployment

### Netlify (Recommended)
1. **Connect your Git repo** to Netlify.
2. **Configure Environment Variables:**
   In the Netlify UI, go to **Site settings > Environment variables** and add:
   - `MONGODB_URI`: Your full MongoDB Atlas connection string.
   - `ADMINUSER`: Username for admin access.
   - `ADMINPASSWORD`: Password for admin access.
   - `VITE_APP_TITLE`, `VITE_APP_TAGLINE`, etc. (Optional, see `.env.example`).
3. **Build Settings:**
   - Netlify should auto-detect:
     - Build command: `yarn build`
     - Publish directory: `build`
     - Functions directory: `netlify/functions`

## ⚙️ Scripts
- `yarn dev` — Start local dev environment (Vite + Netlify Functions).
- `yarn build` — Build production-ready frontend assets.
- `yarn import-data` — Load sample questions into MongoDB.
- `yarn setup-admin` — Create or update admin user from `.env`.
- `yarn lint` — Check code quality with ESLint.
- `yarn test` — Run the test suite with Vitest.

## ⚙️ Built With
- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Netlify Functions, MongoDB, Mongoose

## 🔗 Related Projects
- **[Drag And Preach](https://github.com/allemandi/drag-and-preach)** — A modern drag-and-drop sermon planner.
- **[Vector Knowledge Base](https://github.com/allemandi/vector-knowledge-base)** — Minimalist knowledge system with semantic memory.

## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ☕ Support
If this project has helped you, consider [buying me a coffee](https://www.buymeacoffee.com/allemandi)!

## 📄 License
MIT
