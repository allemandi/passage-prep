import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

const StudyModal = ({ show, onHide, data }) => {
  if (!data) {
    return null;
  }
  
  // Calculate total questions
  let totalQuestions = 0;
  if (data.questionArr) {
    data.questionArr.forEach(questions => {
      totalQuestions += questions.length;
    });
  }
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      id="myModal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="modal-text">
          Bible Study Preparation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4 className="modal-text">Bible References</h4>
        {data.refArr && data.refArr.filter(ref => ref).length > 0 ? (
          <ul>
            {data.refArr.filter(ref => ref).map((reference, index) => (
              <li key={index} className="modal-text">{reference}</li>
            ))}
          </ul>
        ) : (
          <Alert variant="info">No Bible references specified.</Alert>
        )}
        
        <h4 className="modal-text">General Context</h4>
        {data.contextArr && data.contextArr.length > 0 ? (
          <ul>
            {data.contextArr.map((context, index) => (
              <li key={index} className="modal-text">{context}</li>
            ))}
          </ul>
        ) : (
          <Alert variant="info">No context information available for the selected references.</Alert>
        )}
        
        <h4 className="modal-text">Questions</h4>
        {totalQuestions > 0 ? (
          data.themeArr.filter(theme => theme).map((theme, themeIndex) => (
            <div key={themeIndex}>
              <h5 className="modal-text">{theme}</h5>
              {data.questionArr[themeIndex] && data.questionArr[themeIndex].length > 0 ? (
                <ul>
                  {data.questionArr[themeIndex].map((question, qIndex) => (
                    <li key={qIndex} className="modal-text">{question}</li>
                  ))}
                </ul>
              ) : (
                <Alert variant="warning">No questions found for this theme.</Alert>
              )}
            </div>
          ))
        ) : (
          <Alert variant="warning">
            No questions found that match your criteria. Try different themes or subcategory settings.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button 
          variant="primary" 
          onClick={() => window.print()}
        >
          Print Study
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudyModal; 