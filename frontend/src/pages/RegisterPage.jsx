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
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './RegisterPage.css';
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
  marginBottom: '16px',
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

export default function RegisterPage({ onNavigate, onRegisterSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // API submission handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required.');
      return;
    }
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
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
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(data.user, data.token);
          }
        }, 1200);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Connection to server failed. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <ThemeProvider theme={ogosTheme}>
      <div className="register-viewport">
        <div className="register-card">
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
              {/* Register Title & Subtitle */}
              <div className="register-intro">
                <Typography variant="h5" component="h1" className="register-title">
                  Register
                </Typography>
                <Typography variant="body2" className="register-subtitle">
                  Create your account to get started.
                </Typography>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegister} className="register-form">
                {/* First Name input */}
                <StyledTextField
                  placeholder="First Name"
                  variant="outlined"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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

                {/* Last Name input */}
                <StyledTextField
                  placeholder="Last Name"
                  variant="outlined"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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

                {/* Email input */}
                <StyledTextField
                  placeholder="Email Address"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconWrapper>
                          <EmailIcon fontSize="small" />
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

                {/* Confirm Password input */}
                <StyledTextField
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{ marginRight: '8px', color: '#888888' }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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

                {/* Register Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  className="register-btn"
                  disableElevation
                >
                  Register
                </Button>
              </form>

              {/* Already have an account? Login */}
              <Box className="login-link-container">
                <Typography variant="body2" className="login-link-text">
                  Already have an account?{' '}
                  <Link href="#login" className="login-link">
                    Login
                  </Link>
                </Typography>
              </Box>
            </div>
          </div>
        </div>
      </div>

      {/* Registration success message */}
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
          Account created successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
