# Bible Study Preparation Application

This is a React-based application for creating Bible study materials, based on a refactored Google Apps Script project.

## Features

- Generate Bible study questions based on scripture references and themes
- Filter questions by subcategories
- Contribute new questions to the database
- View study materials in a modal dialog
- Print study materials
- MongoDB integration for data storage

## Setup and Installation

1. Make sure you have Node.js and Yarn installed on your system.

2. Clone this repository:
```bash
git clone <repository-url>
cd bible-study-app
```

3. Configure MongoDB:
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:<password>@yourcluster.mongodb.net/?retryWrites=true&w=majority
   PORT=3001
   ```
   - Replace `<password>` with your actual database password

4. Run the setup script:
```bash
./run.sh
```

This script will:
- Install dependencies using Yarn
- Start the development server

## MongoDB Integration

The application uses MongoDB to store Bible books and questions data.

### Importing Data to MongoDB

If you have existing CSV data files in the `data` directory, you can import them to MongoDB with:

```bash
yarn import-data
```

This command will:
- Connect to your MongoDB database
- Import data from `data/Books.csv` and `data/Questions.csv` 
- Replace any existing data in the MongoDB collections

## Using the Application

### Requesting a Bible Study

1. Enter Bible references in the "Bible References" section 
2. Select at least one theme in the "Themes" section
3. Choose subcategory settings and maximum number of questions
4. Click "Submit"
5. View your study in the modal that appears
6. You can print the study using the "Print Study" button

### Contributing Questions

1. Select a theme for your question
2. Enter a Bible reference or "General"
3. Write your question
4. Click "Submit"
5. The question will be added to the MongoDB database

## Project Structure

- `/public` - Static assets and HTML entry point
- `/data` - CSV files for initial data import
- `/config` - Configuration files including database connection
- `/models` - Mongoose models for MongoDB
- `/scripts` - Utility scripts including database import
- `/src` - React application source code
  - `/components` - React components
  - `/data` - Data services for handling API calls

## Server Component

The application includes an Express server to handle API requests, including:
- Saving questions to MongoDB
- Retrieving books and questions from MongoDB

In development mode, both the React app and the server will run concurrently.

## Building for Production

To build the app for production:

```bash
yarn build
```

Then you can run the server, which will serve the static files:

```bash
yarn server
```

## License

All Rights Reserved 