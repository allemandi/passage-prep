import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from '@mui/material';

const QuestionTable = ({ questions, selectedQuestions, onQuestionSelect }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>Bible Passage</TableCell>
            <TableCell>Question</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((question, index) => (
            <TableRow key={index}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedQuestions.includes(index)}
                  onChange={(event) => onQuestionSelect(index, event.target.checked)}
                />
              </TableCell>
              <TableCell>{question.biblePassage}</TableCell>
              <TableCell>{question.question}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuestionTable;