# Bible Study Preparation Application

This is a React-based application for creating Bible study materials, based on a refactored Google Apps Script project.

## Features

- Generate Bible study questions based on scripture references and themes
- Filter questions by subcategories
- Contribute new questions to the database
- View study materials in a modal dialog
- Print study materials

## Setup and Installation

1. Make sure you have Node.js and Yarn installed on your system.

2. Clone this repository:
```
git clone <repository-url>
cd bible-study-app
```

3. Run the setup script:
```
./run.sh
```

This script will:
- Install dependencies using Yarn
- Create the document directory if it doesn't exist
- Copy CSV files from the parent directory if available
- Create placeholder CSV files if needed
- Start the development server

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
5. The question will be added to the database (or downloaded as a CSV if server-side saving isn't available)

## Project Structure

- `/public` - Static assets and HTML entry point
  - `/document` - CSV files for Bible books and questions
- `/src` - React application source code
  - `/components` - React components
  - `/data` - Data services for handling CSV files

## CSV Files

The application reads from and writes to CSV files:

- `document/Books.csv` - Contains information about books of the Bible
- `document/Questions.csv` - Contains the questions for Bible study

These files should be in the public/document directory. The run.sh script will copy them there if they exist in the parent directory.

## Server Component

The application includes a simple Express server to handle saving questions to the CSV files. In development mode, both the React app and the server will run concurrently.

## Building for Production

To build the app for production:

```
yarn build
```

Then you can run the server, which will serve the static files:

```
yarn server
```

## License

All Rights Reserved 