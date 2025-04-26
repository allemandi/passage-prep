// src/components/Footer.jsx
import { Box, Typography, IconButton, Tooltip, Link, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function Footer({ onHelpClick }) {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        py: 0.5,
        px: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} allemandi
      </Typography>

      <Tooltip title="View GitHub Repo">
        <IconButton
          component={Link}
          href="https://github.com/allemandi/passage-prep"
          target="_blank"
          rel="noopener"
          color="inherit"
          aria-label="GitHub"
          size="small"
        >
          <GitHubIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Help & Instructions">
        <IconButton
          onClick={onHelpClick}
          color="inherit"
          aria-label="Help"
          size="small"
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>


      
    </Box>
  );
}
