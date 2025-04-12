# Bible Study Preparation Application

A React-based web application for generating Bible study questions and managing study materials.

## Features

- Generate Bible study questions based on scripture references and themes
- Contribute new questions to the database
- View study materials in a modal dialog
- Print study materials
- MongoDB integration for data storage
- Dark/Light mode support
- Responsive design

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

4. Install dependencies and start the application:
```bash
yarn install
yarn dev
```

## Using the Application

### Requesting a Bible Study

1. Enter Bible references in the "Bible References" section 
2. Select themes in the "Themes" section
3. Choose maximum number of questions per theme
4. Click "Generate Study"
5. View your study in the modal that appears
6. Use the "Print" button to print the study

### Contributing Questions

1. Select a theme for your question
2. Enter a Bible reference
3. Write your question
4. Click "Submit"
5. The question will be added to the MongoDB database

## Project Structure

The application follows a modular structure:

- `/src` - React application source code
  - `/components` - React components
  - `/data` - Data services and API integration
  - `/theme` - Theme configuration
  - `/utils` - Utility functions
- `/models` - MongoDB schemas
- `/netlify/functions` - Serverless functions for API endpoints

## MongoDB Integration

The application uses MongoDB to store Bible books and questions data.

### Database Collections

- `books` - Bible book information and context
- `questions` - Study questions with themes and references

## Development

### Local Development

1. Start the development server:
```bash
yarn dev
```

2. The application will be available at `http://localhost:3000`

### Building for Production

1. Build the application:
```bash
yarn build
```

2. The build output will be in the `build` directory

## Deployment

The application is configured for deployment on Netlify with serverless functions.

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Set to 'production' in production environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.