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
import bibleCounts from '../data/bible-counts.json'; // Adjust the path as necessary

const QuestionTable = ({ questions, selectedQuestions, onQuestionSelect }) => {
  // Sort questions by book index and then by chapter
  const sortedQuestions = questions.sort((a, b) => {
    const bookAIndex = bibleCounts[a.biblePassage.split(' ')[0]] || Infinity; // Get index of book or Infinity if not found
    const bookBIndex = bibleCounts[b.biblePassage.split(' ')[0]] || Infinity;

    if (bookAIndex === bookBIndex) {
      // If books are the same, sort by chapter
      return (parseInt(a.biblePassage.split(' ')[1]) || 0) - (parseInt(b.biblePassage.split(' ')[1]) || 0);
    }
    return bookAIndex - bookBIndex; // Sort by book index
  });

  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>Bible Passage</TableCell>
            <TableCell>Theme</TableCell>
            <TableCell>Question</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedQuestions.map((question, index) => (
            <TableRow key={index}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedQuestions.includes(index)}
                  onChange={(event) => onQuestionSelect(index, event.target.checked)}
                />
              </TableCell>
              <TableCell>{question.biblePassage}</TableCell>
              <TableCell>{question.theme}</TableCell>
              <TableCell>{question.question}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuestionTable;