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
- Node.js 16+
- Yarn 1.22+
- MongoDB Atlas cluster

### ⚡ Setup
1. **Clone & Install:**
   ```bash
   git clone <repository-url>
   cd passage-prep
   yarn install
   ```
2. **Configure MongoDB:**
   - Create `.env` in the root:
     ```
     MONGODB_URI=<your_mongodb_connection_string>
     ```
3. **Import Data:**
   - Preload sample questions:
     ```bash
     yarn import-data
     ```
4. **(Optional) Admin Setup:**
   - Add to `.env`:
     ```
     ADMINUSER=<admin username>
     ADMINPASSWORD=<admin password>
     ```
   - Run:
     ```bash
     yarn setup-admin
     ```
5. **Run Locally:**
   To run the application locally, which includes the Vite frontend development server and emulation of Netlify Functions for the backend:
   1. Ensure you have completed the setup steps (cloning, `yarn install`, `.env` file with `MONGODB_URI`).
   2. Run the following command:
      ```bash
      netlify dev
      ```
   This will typically make the application available at a local URL like `http://localhost:8888` (Netlify Dev will specify the port). It provides hot reloading for the frontend and live emulation for serverless functions.

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
- Login with admin credentials
- Approve, edit, or delete questions
- Download CSV of filtered or all questions
- Bulk upload questions

## 🌐 Deployment

### Netlify (Recommended)
- Connect your Git repo
- Set `MONGODB_URI` in Netlify environment variables
- Netlify auto-detects build `yarn build` and serves from `build/`
- Backend runs as Netlify Functions located in `netlify/functions/`
- SPA routing and redirects configured in `netlify.toml`

## ⚙️ Scripts
- `yarn dev` — Start local dev environment with frontend and serverless backend.
- `yarn build` — Build production-ready frontend assets.
- `yarn import-data` — Load sample questions into MongoDB.
- `yarn setup-admin` — Create or update admin user from `.env`
- `yarn lint` - Lints the codebase using ESLint to check for code quality and style issues.

## ⚙️ Built With
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Netlify Functions, MongoDB, Mongoose

## 🔗 Related Projects
Check out these related projects that might interest you:
**[Drag And Preach](https://github.com/allemandi/drag-and-preach)**
- A modern drag-and-drop sermon planner. Organize, structure, and export your sermons with ease.

**[Vector Knowledge Base](https://github.com/allemandi/vector-knowledge-base)** 
- A minimalist command-line knowledge system with semantic memory capabilities using vector embeddings for information retrieval.


## 🤝 Contributing
If you have ideas, improvements, or new features:

1. Fork the project
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## ☕ Support
If this project has helped you or saved you time, consider [buying me a coffee](https://www.buymeacoffee.com/allemandi) to help fuel more ideas and improvements!

## 💡 Acknowledgments
Powered by AI-assisted tools like GitHub Copilot and Cursor for enhanced coding efficiency.

## 📄 License
MIT