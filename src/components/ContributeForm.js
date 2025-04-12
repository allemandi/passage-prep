import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { themes, saveQuestion } from '../data/dataService';

const ContributeForm = ({ isLoading }) => {
  const [themeSubmission, setThemeSubmission] = useState('');
  const [subSubmission, setSubSubmission] = useState('');
  const [questSubmission, setQuestSubmission] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInvalid, setShowInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setShowInvalid(false);
    
    try {
      // Validate the reference
      const reference = subSubmission.trim();
      const question = questSubmission.trim();
      const theme = themeSubmission;
      
      // Check for empty fields
      if (!theme || !question || !reference) {
        setShowError(true);
        setErrorMessage('All fields are required. Please fill them in and try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Basic validation - should be more robust in production
      if (reference.toLowerCase() === 'general' || validateBibleReference(reference)) {
        console.log("Saving question with theme:", theme);
        console.log("Question:", question);
        console.log("Reference:", reference);
        
        const success = await saveQuestion(theme, question, reference);
        
        if (success) {
          setShowSuccess(true);
          
          // Reset form
          setThemeSubmission('');
          setSubSubmission('');
          setQuestSubmission('');
        } else {
          setShowError(true);
          setErrorMessage('Failed to save question. Please try again or contact the admin.');
        }
      } else {
        setShowInvalid(true);
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      setShowError(true);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // A simple Bible reference validator
  const validateBibleReference = (reference) => {
    // This is a simplified validation, should be more robust in production
    const bibleBooks = [
      'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth',
      '1 samuel', '2 samuel', '1 kings', '2 kings', '1 chronicles', '2 chronicles', 'ezra',
      'nehemiah', 'esther', 'job', 'psalms', 'psalm', 'proverbs', 'ecclesiastes', 'song of solomon',
      'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah',
      'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi',
      'matthew', 'mark', 'luke', 'john', 'acts', 'romans', '1 corinthians', '2 corinthians',
      'galatians', 'ephesians', 'philippians', 'colossians', '1 thessalonians', '2 thessalonians',
      '1 timothy', '2 timothy', 'titus', 'philemon', 'hebrews', 'james', '1 peter', '2 peter',
      '1 john', '2 john', '3 john', 'jude', 'revelation'
    ];
    
    const lowercaseRef = reference.toLowerCase();
    
    // Check if the reference starts with a Bible book
    return bibleBooks.some(book => lowercaseRef.startsWith(book));
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <p className="card-text"><strong>Contribute a Question</strong></p>
      
      <Form.Group className="mb-3">
        <Form.Label htmlFor="themeSubmission">Theme</Form.Label>
        <Form.Select 
          id="themeSubmission" 
          value={themeSubmission}
          onChange={(e) => setThemeSubmission(e.target.value)}
          required
        >
          <option value=""></option>
          {themes.map((theme, index) => (
            <option key={index} value={theme}>{theme}</option>
          ))}
        </Form.Select>
        <Form.Text className="text-muted">
          Pick your question's theme. If none fit, contact your admin
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label htmlFor="subSubmission">Bible Reference</Form.Label>
        <Form.Control 
          id="subSubmission" 
          type="text" 
          placeholder="John 3:16" 
          value={subSubmission}
          onChange={(e) => setSubSubmission(e.target.value)}
          required
        />
        <Form.Text className="text-muted">
          Write a passage or write 'General'
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label htmlFor="questSubmission">Question</Form.Label>
        <Form.Control 
          id="questSubmission" 
          type="text" 
          placeholder="Why?" 
          value={questSubmission}
          onChange={(e) => setQuestSubmission(e.target.value)}
          required
        />
        <Form.Text className="text-muted">
          Write your contributing question to the database
        </Form.Text>
      </Form.Group>
      
      <Button 
        className="btn btn-primary btn-lg btn-block" 
        type="submit" 
        disabled={isLoading || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Submitting...
          </>
        ) : 'Submit'}
      </Button>
      
      {showInvalid && (
        <Alert 
          className="mt-3"
          variant="warning" 
          dismissible 
          onClose={() => setShowInvalid(false)}
        >
          <strong>Invalid Reference</strong> Sorry, reference not accepted. Either write a book in the Bible or write "General"
        </Alert>
      )}
      
      {showSuccess && (
        <Alert 
          className="mt-3"
          variant="success" 
          dismissible 
          onClose={() => setShowSuccess(false)}
        >
          <strong>Question Saved!</strong> Thank you for contributing a question to the database.
        </Alert>
      )}
      
      {showError && (
        <Alert 
          className="mt-3"
          variant="danger" 
          dismissible 
          onClose={() => setShowError(false)}
        >
          <strong>Error:</strong> {errorMessage}
        </Alert>
      )}
    </Form>
  );
};

export default ContributeForm; 