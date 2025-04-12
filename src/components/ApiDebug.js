import React, { useState } from 'react';
import { Button, Alert, Card, ListGroup } from 'react-bootstrap';

const ApiDebug = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [booksStatus, setBooksStatus] = useState(null);
  const [questionsStatus, setQuestionsStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [booksData, setBooksData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    try {
      console.log('Checking server health...');
      const response = await fetch('/api/health');
      const data = await response.json();
      console.log('Health response:', data);
      setHealthStatus(data.status === 'OK' ? 'OK' : 'Failed');
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus('Failed');
      setError(`Health check failed: ${error.message}`);
    }
  };

  const getBooks = async () => {
    try {
      console.log('Fetching books...');
      const response = await fetch('/api/books');
      const data = await response.json();
      console.log('Books response:', data);
      setBooksStatus('Success');
      setBooksData(data.slice(0, 5)); // Show just the first 5 books
    } catch (error) {
      console.error('Books fetch failed:', error);
      setBooksStatus('Failed');
      setError(`Books fetch failed: ${error.message}`);
    }
  };

  const getQuestions = async () => {
    try {
      console.log('Fetching questions...');
      const response = await fetch('/api/questions');
      const data = await response.json();
      console.log('Questions response:', data);
      setQuestionsStatus('Success');
      setQuestionsData(data.slice(0, 5)); // Show just the first 5 questions
    } catch (error) {
      console.error('Questions fetch failed:', error);
      setQuestionsStatus('Failed');
      setError(`Questions fetch failed: ${error.message}`);
    }
  };

  const saveQuestion = async () => {
    try {
      console.log('Saving test question...');
      const testQuestion = {
        Theme: 'Faith',
        Question: 'Test question from debug component',
        Subcategory: 'General'
      };
      
      const response = await fetch('/api/save-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newData: testQuestion }),
      });
      
      const data = await response.json();
      console.log('Save response:', data);
      setSaveStatus(data.success ? 'Success' : 'Failed');
    } catch (error) {
      console.error('Save question failed:', error);
      setSaveStatus('Failed');
      setError(`Save question failed: ${error.message}`);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">API Connection Debug</Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Button onClick={checkHealth} className="me-2">Check Server Health</Button>
          {healthStatus && (
            <Alert variant={healthStatus === 'OK' ? 'success' : 'danger'}>
              Health Check: {healthStatus}
            </Alert>
          )}
        </div>
        
        <div className="mb-3">
          <Button onClick={getBooks} className="me-2">Get Books</Button>
          {booksStatus && (
            <Alert variant={booksStatus === 'Success' ? 'success' : 'danger'}>
              Books Fetch: {booksStatus}
            </Alert>
          )}
          {booksData && (
            <ListGroup className="mt-2">
              {booksData.map((book, index) => (
                <ListGroup.Item key={index}>
                  {book.Index}: {book.Book} - {book.Author}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
        
        <div className="mb-3">
          <Button onClick={getQuestions} className="me-2">Get Questions</Button>
          {questionsStatus && (
            <Alert variant={questionsStatus === 'Success' ? 'success' : 'danger'}>
              Questions Fetch: {questionsStatus}
            </Alert>
          )}
          {questionsData && (
            <ListGroup className="mt-2">
              {questionsData.map((question, index) => (
                <ListGroup.Item key={index}>
                  {question.Theme}: {question.Question} ({question.Subcategory})
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
        
        <div className="mb-3">
          <Button onClick={saveQuestion} className="me-2">Save Test Question</Button>
          {saveStatus && (
            <Alert variant={saveStatus === 'Success' ? 'success' : 'danger'}>
              Save Question: {saveStatus}
            </Alert>
          )}
        </div>
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ApiDebug; 