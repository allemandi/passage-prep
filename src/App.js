import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import RequestForm from './components/RequestForm';
import ContributeForm from './components/ContributeForm';
import StudyModal from './components/StudyModal';
import ApiDebug from './components/ApiDebug';
import { getBooks, getQuestions } from './data/dataService';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(true); // Set to true to show debug panel
  
  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([getBooks(), getQuestions()]);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);
  
  const handleShowStudy = (data) => {
    setStudyData(data);
    setShowModal(true);
  };
  
  return (
    <div className="app-container">
      <Container fluid id="component-container">
        {showDebug && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>API Debug Panel</h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDebug(false)}
              >
                Hide
              </button>
            </div>
            <ApiDebug />
          </div>
        )}
        
        <Card className="text-dark bg-light mb-3 mx-auto" id="card-container">
          <Card.Header>Bible Study Preparation</Card.Header>
          <Card.Body>
            <Card.Title>Made with React</Card.Title>
            <Card.Text>
              Bible References should be written in the format of Genesis 1:1, John 3:16-18, etc.
              Please spell correctly, with proper spacing.
            </Card.Text>
            <Card.Text>
              You must select at least one theme. If no questions show up after submission, 
              there are not enough questions for that theme against your subcategory settings. 
              Contribute questions to expand the pool.
            </Card.Text>
          </Card.Body>
        </Card>
        
        <Container fluid>
          <div className="row">
            <div className="col-md-12 col-lg-8" id="requestBody">
              <RequestForm onStudyGenerated={handleShowStudy} isLoading={isLoading} />
            </div>
            <div className="col-sm" id="contributeBody">
              <ContributeForm isLoading={isLoading} />
            </div>
          </div>
        </Container>
        
        <StudyModal 
          show={showModal} 
          onHide={() => setShowModal(false)} 
          data={studyData}
        />
      </Container>
      
      <footer className="container">
        Copyright &copy; <span id="copyright">{new Date().getFullYear()}</span> allemandi, All Rights Reserved
      </footer>
    </div>
  );
}

export default App; 