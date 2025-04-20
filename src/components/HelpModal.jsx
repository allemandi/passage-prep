// src/components/HelpModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

export default function HelpModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🖥️ Usage</DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Search & Format Section */}
          <Typography variant="body1">
            <strong>Search & Format</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Add scripture references." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Click Search Questions." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Select questions, then Generate Study to preview/copy." />
            </ListItem>
          </List>

          {/* Contribute Section */}
          <Typography variant="body1">
            <strong>Contribute</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Select a theme." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Enter a Bible reference." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Write your question." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Submit." />
            </ListItem>
          </List>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
