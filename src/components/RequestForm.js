import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { themes, subcategories, processForm } from '../data/dataService';

const RequestForm = ({ onStudyGenerated, isLoading }) => {
  const [scripture1, setScripture1] = useState('');
  const [scripture2, setScripture2] = useState('');
  const [scripture3, setScripture3] = useState('');
  const [scripture4, setScripture4] = useState('');
  const [scripture5, setScripture5] = useState('');
  
  const [theme1, setTheme1] = useState('');
  const [theme2, setTheme2] = useState('');
  const [theme3, setTheme3] = useState('');
  const [theme4, setTheme4] = useState('');
  const [theme5, setTheme5] = useState('');
  
  const [subChoice, setSubChoice] = useState(subcategories[0]);
  const [maxLimit, setMaxLimit] = useState('5');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noQuestionsFound, setNoQuestionsFound] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setNoQuestionsFound(false);
    
    // Gather all scripture references and themes
    const refArr = [scripture1, scripture2, scripture3, scripture4, scripture5];
    const themeArr = [theme1, theme2, theme3, theme4, theme5];
    
    // Check if at least one theme is selected
    if (!themeArr.some(theme => theme)) {
      setShowError(true);
      setErrorMessage('Please select at least one theme.');
      setIsSubmitting(false);
      return;
    }
    
    // Process the form data
    const formData = {
      refArr,
      themeArr,
      subChoice,
      maxLimit: parseInt(maxLimit, 10)
    };
    
    try {
      const studyData = await processForm(formData);
      
      let totalQuestions = 0;
      studyData.questionArr.forEach(themeQuestions => {
        totalQuestions += themeQuestions.length;
      });
      
      if (totalQuestions === 0) {
        setNoQuestionsFound(true);
      } else {
        onStudyGenerated(studyData);
        setShowSuccess(true);
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage('An error occurred while generating your study. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeAlert = (alertType) => {
    if (alertType === 'success') setShowSuccess(false);
    if (alertType === 'error') setShowError(false);
    if (alertType === 'noQuestions') setNoQuestionsFound(false);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <p className="card-text"><strong>Request Bible Study</strong></p>
      
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm">
            <h3>Bible References</h3>
          </div>
          <div className="col-sm">
            <h3>Themes</h3>
          </div>
          <div className="col-sm">
            <h3>General Settings</h3>
          </div>
        </div>
        
        <div className="row">
          <div className="col-sm">
            <Form.Group className="mb-3">
              <Form.Label htmlFor="scripture1">Scripture 1</Form.Label>
              <Form.Control 
                id="scripture1" 
                type="text" 
                placeholder="Write a passage" 
                value={scripture1}
                onChange={(e) => setScripture1(e.target.value)}
                required
              />
              
              <Form.Label htmlFor="scripture2">Scripture 2</Form.Label>
              <Form.Control 
                id="scripture2" 
                type="text" 
                value={scripture2}
                onChange={(e) => setScripture2(e.target.value)}
              />
              
              <Form.Label htmlFor="scripture3">Scripture 3</Form.Label>
              <Form.Control 
                id="scripture3" 
                type="text" 
                value={scripture3}
                onChange={(e) => setScripture3(e.target.value)}
              />
              
              <Form.Label htmlFor="scripture4">Scripture 4</Form.Label>
              <Form.Control 
                id="scripture4" 
                type="text" 
                value={scripture4}
                onChange={(e) => setScripture4(e.target.value)}
              />
              
              <Form.Label htmlFor="scripture5">Scripture 5</Form.Label>
              <Form.Control 
                id="scripture5" 
                type="text" 
                value={scripture5}
                onChange={(e) => setScripture5(e.target.value)}
              />
            </Form.Group>
          </div>
          
          <div className="col-sm">
            <Form.Group className="mb-3">
              <Form.Label htmlFor="theme1">Theme 1</Form.Label>
              <Form.Select 
                id="theme1" 
                value={theme1}
                onChange={(e) => setTheme1(e.target.value)}
                required
              >
                <option value=""></option>
                {themes.map((theme, index) => (
                  <option key={index} value={theme}>{theme}</option>
                ))}
              </Form.Select>
              
              <Form.Label htmlFor="theme2">Theme 2</Form.Label>
              <Form.Select 
                id="theme2" 
                value={theme2}
                onChange={(e) => setTheme2(e.target.value)}
              >
                <option value=""></option>
                {themes.map((theme, index) => (
                  <option key={index} value={theme}>{theme}</option>
                ))}
              </Form.Select>
              
              <Form.Label htmlFor="theme3">Theme 3</Form.Label>
              <Form.Select 
                id="theme3" 
                value={theme3}
                onChange={(e) => setTheme3(e.target.value)}
              >
                <option value=""></option>
                {themes.map((theme, index) => (
                  <option key={index} value={theme}>{theme}</option>
                ))}
              </Form.Select>
              
              <Form.Label htmlFor="theme4">Theme 4</Form.Label>
              <Form.Select 
                id="theme4" 
                value={theme4}
                onChange={(e) => setTheme4(e.target.value)}
              >
                <option value=""></option>
                {themes.map((theme, index) => (
                  <option key={index} value={theme}>{theme}</option>
                ))}
              </Form.Select>
              
              <Form.Label htmlFor="theme5">Theme 5</Form.Label>
              <Form.Select 
                id="theme5" 
                value={theme5}
                onChange={(e) => setTheme5(e.target.value)}
              >
                <option value=""></option>
                {themes.map((theme, index) => (
                  <option key={index} value={theme}>{theme}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          
          <div className="col-sm">
            <Form.Group className="mb-3">
              <Form.Label htmlFor="subChoice">Subcategories</Form.Label>
              <Form.Select 
                id="subChoice" 
                value={subChoice}
                onChange={(e) => setSubChoice(e.target.value)}
              >
                {subcategories.map((sub, index) => (
                  <option key={index} value={sub}>{sub}</option>
                ))}
              </Form.Select>
              
              <Form.Label htmlFor="maxLimit">Max Questions</Form.Label>
              <Form.Select 
                id="maxLimit" 
                value={maxLimit}
                onChange={(e) => setMaxLimit(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num.toString()}>{num}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                More themes, more questions
              </Form.Text>
            </Form.Group>
          </div>
        </div>
      </div>
      
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
      
      {showSuccess && (
        <Alert 
          className="mt-3"
          variant="success" 
          dismissible 
          onClose={() => closeAlert('success')}
        >
          <strong>Success!</strong> Your Bible study has been generated. You can keep clicking the Submit button if you want more based on the above.
        </Alert>
      )}
      
      {showError && (
        <Alert 
          className="mt-3"
          variant="danger" 
          dismissible 
          onClose={() => closeAlert('error')}
        >
          <strong>Error:</strong> {errorMessage}
        </Alert>
      )}
      
      {noQuestionsFound && (
        <Alert 
          className="mt-3"
          variant="warning" 
          dismissible 
          onClose={() => closeAlert('noQuestions')}
        >
          <strong>No Questions Found</strong> There are not enough questions for that theme against your subcategory settings. Try a different combination or contribute questions to expand the pool.
        </Alert>
      )}
    </Form>
  );
};

export default RequestForm; 