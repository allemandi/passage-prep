# 📖 PassagePrep
**Build reusable Bible studies in seconds.**

A React-powered tool to organize, format, and export your study questions with contextual notes.

🚀 Live Demo: [https://your-app-url.here]

## Why this exists
- 🏗️ Wanted clean, simple formatting for group studies
- 📚 Needed quick study outlines with contextual notes
- ♻️ Needed a personal repository of reusable questions

## ✨ Key Features
- Question Memory Bank - Save your best questions
- Smart Formatting - Copy and paste outlines in Rich Text or Markdown
- Book Context - Automatic authorship/theme notes for each passage
- Fetch & Filter - "Just the best Genesis passages about forgiveness, please"
- Collaborative - Add new questions to shared database

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Yarn 1.22+
- MongoDB Atlas account + cluster

## Setup and Installation

1. Make sure you have Node.js and Yarn installed on your system.

2. Clone this repository:
```bash
git clone <repository-url>
cd passage-prep
yarn install
```

3. Configure MongoDB:
   - Create an account 
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   PORT=3001
   ```
   - Replace `<your_mongodb_connection_string>` with your actual MongoDB cluster details

4. Preload MongoDB with questions and context
   ```
   # Importing file information from /data
   # Run:
   node ./data/import-data
   ```

5. Start the application locally:
```bash
yarn dev
```
or consider deploying to your own website like Netlify

## 🖥️ Usage
### Requesting Studies

1. Add scripture references (multiple supported)
2. Toggle themes to exclude
3. Click Search Questions to generate the table
4. Tick checkboxes on questions
5. Click Generate Study to preview and copy study

### Contributing Questions

1. Select a theme for your question
2. Enter a Bible reference
3. Write your question
4. Click "Submit"
5. The question will be added to the MongoDB database

## 🌐 Deployment
### Building for Production
```bash
yarn build
```

### Netlify (Recommended)
1. Connect your GitHub repository
2. Set `MONGODB_URI` environment variable
3. Deploy!


## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.