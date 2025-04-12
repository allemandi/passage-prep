import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

const StudyModal = ({ show, onHide, data }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  
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
  
  const generateTextContent = () => {
    // Format the study content for clipboard
    let content = "Bible Study Preparation\n\n";
    
    // Add references
    content += "Bible References:\n";
    if (data.refArr && data.refArr.filter(ref => ref).length > 0) {
      data.refArr.filter(ref => ref).forEach(reference => {
        content += `- ${reference}\n`;
      });
    } else {
      content += "- No Bible references specified.\n";
    }
    
    // Add context
    content += "\nGeneral Context:\n";
    if (data.contextArr && data.contextArr.length > 0) {
      data.contextArr.forEach(context => {
        content += `- ${context}\n`;
      });
    } else {
      content += "- No context information available.\n";
    }
    
    // Add questions
    content += "\nQuestions:\n";
    if (totalQuestions > 0) {
      data.themeArr.filter(theme => theme).forEach((theme, themeIndex) => {
        content += `\n${theme}:\n`;
        if (data.questionArr[themeIndex] && data.questionArr[themeIndex].length > 0) {
          data.questionArr[themeIndex].forEach(question => {
            content += `- ${question}\n`;
          });
        } else {
          content += "- No questions found for this theme.\n";
        }
      });
    } else {
      content += "- No questions found that match your criteria.\n";
    }
    
    return content;
  };
  
  const copyToClipboard = () => {
    try {
      const content = generateTextContent();
      
      // Modern way - try navigator.clipboard first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(content)
          .then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
          })
          .catch(err => {
            console.error('Clipboard API error:', err);
            fallbackCopyMethod(content);
          });
      } else {
        // Fallback for older browsers
        fallbackCopyMethod(content);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy text. Please try manually selecting and copying the content.');
    }
  };
  
  const fallbackCopyMethod = (text) => {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make it non-visible
    textArea.style.position = "fixed";  
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    
    // Focus and select the text
    textArea.focus();
    textArea.select();
    
    let succeeded = false;
    try {
      // Execute the copy command
      succeeded = document.execCommand('copy');
    } catch (err) {
      console.error('execCommand error', err);
      succeeded = false;
    }
    
    // Clean up
    document.body.removeChild(textArea);
    
    // Show success or failure message
    if (succeeded) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } else {
      alert('Copy failed. Please try manually selecting and copying the content.');
    }
  };
  
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
          onClick={copyToClipboard}
        >
          {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudyModal; 