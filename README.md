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

## Environment Variables

The application uses the following environment variables:

- `MONGODB_URI`: The MongoDB connection string. This is required for the application to connect to your database. It should be in the format `mongodb+srv://username:password@hostname/?options`
- `PORT`: The port number on which the server will run (default: 3001)

Example `.env` file:
```
MONGODB_URI=mongodb+srv://myusername:mypassword@cluster0.example.mongodb.net/?retryWrites=true&w=majority
PORT=3001
```

## MongoDB Integration

The application uses MongoDB to store Bible books and questions data.

### Seed Script

The application includes a seed script (`scripts/import-data.js`) that imports data from CSV files in the `data` directory to MongoDB. This script:

1. Connects to your MongoDB database using the connection string from your `.env` file
2. Reads the CSV files from the `data` directory:
   - `Books.csv`: Contains Bible book information (Index, Book, Author, Context)
   - `Questions.csv`: Contains Bible study questions (Theme, Question, Subcategory)
3. **Completely replaces** existing data in the collections:
   - Removes all existing records from the Books and Questions collections
   - Inserts fresh data from the CSV files

To run the seed script:

```bash
node scripts/import-data.js
```

Or using the npm script:

```bash
yarn import-data
```

**Note**: This operation is destructive - it will delete all existing data in the Books and Questions collections before importing new data.

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
- `/netlify` - Netlify-specific files for deployment
  - `/functions` - Serverless functions for the backend API

## Server Component

The application includes an Express server for local development and Netlify Functions for production deployment.

In development mode, both the React app and the Express server will run concurrently.

## Netlify Deployment

This application is configured to be deployed on Netlify. The backend Express API has been converted to serverless Netlify Functions.

### Deployment Steps

1. Push your code to a GitHub repository

2. Sign up for a Netlify account if you don't have one

3. Connect your GitHub repository to Netlify:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your repositories
   - Select your repository

4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`

5. Configure environment variables:
   - Go to Site settings > Environment variables
   - Add your `MONGODB_URI` environment variable with your MongoDB connection string

6. Deploy the site:
   - Netlify will automatically build and deploy your site
   - Functions will be deployed to `/.netlify/functions/`

### Testing Locally with Netlify Functions

To test your Netlify deployment locally:

1. Install the Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Run the Netlify development server:
```bash
netlify dev
```

This will start both the React app and the Netlify Functions locally, mimicking the production environment.

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