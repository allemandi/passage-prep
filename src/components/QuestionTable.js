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
    const bookAIndex = bibleCounts[a.book] || Infinity;
    const bookBIndex = bibleCounts[b.book] || Infinity;

    if (bookAIndex === bookBIndex) {
      return (parseInt(a.chapter) || 0) - (parseInt(b.chapter) || 0);
    }
    return bookAIndex - bookBIndex;
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
              <TableCell>{`${question.book} ${question.chapter}:${question.verseStart}-${question.verseEnd}`}</TableCell>
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