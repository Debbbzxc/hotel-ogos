import React, { useState } from 'react';
import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  styled,
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Link
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './LoginPage.css';
import logoImg from '../assets/logo.png';

// Custom MUI Theme matching the Hotel Ogos (Sogo-inspired) palette
const ogosTheme = createTheme({
  palette: {
    primary: {
      main: '#990000', // Dark Sogo Red
      light: '#D31027', // Vibrant Red
      dark: '#730000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFD700', // Gold/Yellow
      light: '#FFF2A3',
      dark: '#B8860B',
      contrastText: '#000000',
    },
  },
  typography: {
    fontFamily: "'Poppins', system-ui, -apple-system, sans-serif",
    h5: {
      fontWeight: 700,
      color: '#990000',
    },
    body2: {
      color: '#555555',
    },
  },
});

// Styled input field to mimic the mockup's flat icon block
const StyledTextField = styled(TextField)({
  marginBottom: '20px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    paddingLeft: 0, // Removes padding to let the icon wrapper touch the left border
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    '& fieldset': {
      borderColor: '#e5e4e7',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#b2b2b2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#990000',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12.5px 14px',
    fontSize: '14.5px',
    color: '#1a1a1a',
  },
});

// The left-aligned icon block styled as a red square badge
const IconWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#990000',
  color: '#ffffff',
  width: '46px',
  height: '48px',
  minWidth: '46px',
  borderRight: '1px solid #e5e4e7',
});

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Simple validation and submission handler
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username or Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Simulate successful login
    console.log('Login attempt:', { username, password });
    setSuccess(true);

    // Derive capitalized first name from username
    const nameParts = username.trim().split(' ');
    const derivedFirstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();

    // Redirect to dashboard after a short delay to display success message
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({ firstName: derivedFirstName });
      }
    }, 1200);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <ThemeProvider theme={ogosTheme}>
      <div className="login-viewport">
        <div className="login-card">
          {/* LEFT SIDE: RED BRAND PANEL */}
          <div className="brand-panel">
            <div className="wordmark-container">
              <div className="logo-wrapper">
                <img src={logoImg} className="hotel-logo" alt="Hotel Ogos Logo" />
              </div>
              <Typography className="hotel-title" variant="h1">
                HOTEL OGOS
              </Typography>
              <Typography className="tagline">
                "So Cozy... So Comfy!"
              </Typography>
              <Typography className="branch-location">
                Bayombong, Nueva Vizcaya
              </Typography>
            </div>
          </div>

          {/* RIGHT SIDE: WHITE FORM PANEL */}
          <div className="form-panel">
            {/* Center Container to keep things neatly positioned */}
            <div className="form-content-wrapper">
              {/* Login Title & Subtitle */}
              <div className="login-intro">
                <Typography variant="h5" component="h1" className="login-title">
                  Login
                </Typography>
                <Typography variant="body2" className="login-subtitle">
                  Welcome back! Please login to your account.
                </Typography>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="login-form">
                {/* Username input */}
                <StyledTextField
                  placeholder="Username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconWrapper>
                          <PersonIcon fontSize="small" />
                        </IconWrapper>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password input */}
                <StyledTextField
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconWrapper>
                          <LockIcon fontSize="small" />
                        </IconWrapper>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ marginRight: '8px', color: '#888888' }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Helper text display for validation errors */}
                {error && (
                  <Typography className="error-text" variant="caption">
                    {error}
                  </Typography>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  className="login-btn"
                  disableElevation
                >
                  Login
                </Button>
              </form>

              {/* Don't have an account? Register */}
              <Box className="register-container">
                <Typography variant="body2" className="register-text">
                  Don't have an account?{' '}
                  <Link
                    href="#register"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigate) onNavigate('register');
                    }}
                    className="register-link"
                  >
                    Register
                  </Link>
                </Typography>
              </Box>
            </div>
          </div>
        </div>
      </div>

      {/* Login success message */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
          Welcome back to Hotel Ogos! Logged in successfully.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
