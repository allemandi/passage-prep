# 📖 Passage Prep

**A tool to format, organize, and export Bible study questions.**
Build reusable Bible studies in seconds.

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
   - Preload questions and book context:
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
   There are two main ways to run the application:

   ### Production-like Mode (Serving Built Files)
   To run the server and serve the built frontend files, simulating a production environment:
   1.  **Build the frontend:** If you haven't already, or if you've made frontend changes, you need to build the application. This will create a `build` directory with the static assets.
       ```bash
       npm run build
       # or
       yarn build
       ```
   2.  **Start the server:**
       ```bash
       npm start
       # or
       yarn start
       ```
   This command starts only the Express backend server, which will also serve the static files from the `build` directory.
   **Important:** If you run `npm start` or `yarn start` without having run the build command first (i.e., without the `build` directory present), the server will exit with an error message prompting you to build the application.

   ### Development Mode
   To run the application in development mode with hot reloading for the frontend and the server running concurrently:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   This command starts the Vite frontend development server (typically on [localhost:3000](http://localhost:3000)) and the Express backend server (typically on [localhost:3001](http://localhost:3001)). This is the recommended way for active development.

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
- Connect your repo
- Set `MONGODB_URI` in Netlify environment variables
- Netlify auto-detects build (`yarn build`) and publish (`build/`)
- API routes handled by Netlify Functions (`netlify/functions/`)
- See `netlify.toml` for redirects and SPA routing

## ⚙️ Scripts
- `yarn dev` — Starts both the Vite frontend development server and the Express backend server concurrently. Recommended for development due to hot reloading and immediate feedback.
- `yarn build` — Compiles the frontend application into static assets, outputting them to the `build` directory. This step is necessary before running the application in production-like mode.
- `yarn start` — Starts the Express backend server, which serves the static frontend assets from the `build` directory. **Requires the frontend to be built first using `yarn build` or `npm run build`.**
- `yarn import-data` — Imports initial CSV data (questions and book context) into the MongoDB database.
- `yarn setup-admin` — Creates or updates the admin user in the database based on credentials in the `.env` file.
- `yarn lint` - Lints the codebase using ESLint to check for code quality and style issues.

## ⚙️ Built With
- **Frontend:** React, Vite, MUI
- **Backend:** Express, MongoDB, Mongoose
- **Serverless:** Netlify Functions

## 🔗 Related Projects
Check out these related projects that might interest you:
- **[Drag And Preach](https://github.com/allemandi/drag-and-preach)**
  A modern drag-and-drop sermon planner. Organize, structure, and export your sermons with ease.

- **[Vector Knowledge Base](https://github.com/allemandi/vector-knowledge-base)**  
  A minimalist command-line knowledge system with semantic memory capabilities using vector embeddings for information retrieval.


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
This project was developed with the help of AI tools (e.g., GitHub Copilot, Cursor, v0) for code suggestions, debugging, and optimizations.

## 📄 License
MIT