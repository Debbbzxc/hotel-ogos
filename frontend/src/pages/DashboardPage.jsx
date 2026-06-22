import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  styled,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Divider,
  InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NoteIcon from '@mui/icons-material/Note';
import LogoutIcon from '@mui/icons-material/Logout';
import logoImg from '../assets/logo.png';
import './DashboardPage.css';

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
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
      color: '#990000',
    },
    body2: {
      color: '#555555',
    },
  },
});

// Available room options and hourly rates
const ROOM_OPTIONS = [
  { id: 'premium', name: 'Premium Room', rate: 150 },
  { id: 'deluxe', name: 'Deluxe Room', rate: 200 },
  { id: 'regency', name: 'Regency', rate: 250 },
  { id: 'regency2', name: 'Regency II', rate: 300 },
  { id: 'mega_suite', name: 'Mega Suite', rate: 400 }
];

// Available stay hour options
const HOURS_OPTIONS = [
  { value: 12, label: '12 Hours' },
  { value: 24, label: '24 Hours' }
];

const FormField = styled(TextField)({
  marginBottom: '20px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    '& fieldset': {
      borderColor: '#e5e4e7',
    },
    '&:hover fieldset': {
      borderColor: '#b2b2b2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#990000',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    '&.Mui-focused': {
      color: '#990000',
    },
  },
});

export default function DashboardPage({ user, onLogout }) {
  const firstName = user?.firstName || 'Guest';

  // State variables for the reservation form
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Dynamic price calculation
  useEffect(() => {
    const room = ROOM_OPTIONS.find((r) => r.id === selectedRoom);
    const hourlyRate = room ? room.rate : 0;
    const duration = parseInt(hours) || 0;
    setTotalAmount(hourlyRate * duration);
  }, [selectedRoom, hours]);

  // Form submission handler
  const handleReservation = (e) => {
    e.preventDefault();
    setError('');

    if (!checkInDate) {
      setError('Check-in Date is required.');
      return;
    }
    if (!checkOutDate) {
      setError('Check-out Date is required.');
      return;
    }
    if (new Date(checkInDate) > new Date(checkOutDate)) {
      setError('Check-out Date must be after or on Check-in Date.');
      return;
    }
    if (!checkInTime) {
      setError('Check-in Time is required.');
      return;
    }
    if (!selectedRoom) {
      setError('Please select a room type.');
      return;
    }
    if (!hours) {
      setError('Please select stay duration.');
      return;
    }

    console.log('Reservation details submitted:', {
      checkInDate,
      checkOutDate,
      checkInTime,
      selectedRoom,
      hours,
      notes,
      totalAmount
    });
    setSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <ThemeProvider theme={ogosTheme}>
      <div className="dashboard-viewport">
        {/* HEADER BAR */}
        <header className="dashboard-header">
          <div className="header-brand-group">
            <div className="header-logo-wrapper">
              <img src={logoImg} className="header-logo" alt="Hotel Ogos Logo" />
            </div>
            <div className="header-brand-text">
              <Typography className="header-title" variant="h6">
                HOTEL OGOS
              </Typography>
              <Typography className="header-subtitle" variant="caption">
                Bayombong, Nueva Vizcaya
              </Typography>
            </div>
          </div>

          <div className="header-user-group">
            <Typography className="header-user-welcome" variant="body2">
              Hello, <strong>{firstName}</strong>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              className="logout-btn"
              onClick={onLogout}
              startIcon={<LogoutIcon fontSize="small" />}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="dashboard-main">
          <Box className="dashboard-content">
            {/* Welcome message */}
            <div className="welcome-banner">
              <Typography variant="h4" className="welcome-title">
                Welcome, {firstName}!
              </Typography>
              <Typography variant="body2" className="welcome-subtitle">
                Manage your stays and reserve rooms below.
              </Typography>
            </div>

            {/* Reservation Form Card */}
            <Paper className="reservation-card" elevation={3}>
              <Typography variant="h5" className="form-header">
                Room Reservation
              </Typography>
              <Divider className="form-divider" />

              <form onSubmit={handleReservation} className="reservation-form">
                <Box className="form-row">
                  {/* Check-in Date */}
                  <Box className="form-field-wrapper">
                    <Typography className="field-label">Check-in Date</Typography>
                    <FormField
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Check-out Date */}
                  <Box className="form-field-wrapper">
                    <Typography className="field-label">Check-out Date</Typography>
                    <FormField
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>

                <Box className="form-row">
                  {/* Check-in Time */}
                  <Box className="form-field-wrapper">
                    <Typography className="field-label">Check-in Time</Typography>
                    <FormField
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Hours of Stay (Dropdown) */}
                  <Box className="form-field-wrapper">
                    <Typography className="field-label">Hours of Stay</Typography>
                    <FormField
                      select
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HourglassEmptyIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {HOURS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </FormField>
                  </Box>
                </Box>

                <Box className="form-row">
                  {/* Select Room */}
                  <Box className="form-field-wrapper">
                    <Typography className="field-label">Select Room</Typography>
                    <FormField
                      select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MeetingRoomIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {ROOM_OPTIONS.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name} (PHP {option.rate}/hr)
                        </MenuItem>
                      ))}
                    </FormField>
                  </Box>

                  {/* Notes */}
                  <Box className="form-field-wrapper">
                    <Typography className="field-label">Special Notes</Typography>
                    <FormField
                      multiline
                      rows={1}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NoteIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>

                {/* Display Total Price */}
                <Box className="price-display-box">
                  <Typography variant="body1" className="price-label">
                    Total Amount To Be Paid:
                  </Typography>
                  <Typography variant="h4" className="price-value">
                    PHP {totalAmount.toLocaleString()}
                  </Typography>
                </Box>

                {error && (
                  <Typography className="error-text" variant="caption">
                    {error}
                  </Typography>
                )}

                {/* Next button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  className="next-btn"
                  disableElevation
                >
                  Next
                </Button>
              </form>
            </Paper>
          </Box>
        </main>
      </div>

      {/* Reservation success message */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%' }}>
          Reservation details saved! Proceeding to the next step...
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
