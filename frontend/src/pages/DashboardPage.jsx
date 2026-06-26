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
  InputAdornment,
  CircularProgress
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NoteIcon from '@mui/icons-material/Note';
import LogoutIcon from '@mui/icons-material/Logout';
import logoImg from '../assets/logo.png';
import roomPlaceholder from '../assets/room_placeholder.png';
import premiumImg from '../assets/premium.jpg';
import deluxeImg from '../assets/deluxe.jpg';
import regencyImg from '../assets/regency.jpg';
import regency2Img from '../assets/regency2.jpg';
import megaSuiteImg from '../assets/mega_suite.jpg';
import './DashboardPage.css';

const roomImages = {
  premium: premiumImg,
  deluxe: deluxeImg,
  regency: regencyImg,
  regency2: regency2Img,
  mega_suite: megaSuiteImg
};

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

const TabButton = styled(Button)(({ active }) => ({
  fontFamily: "'Poppins', sans-serif",
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  color: active ? '#ffffff' : '#333333',
  backgroundColor: active ? '#990000' : 'transparent',
  border: active ? '1.5px solid #990000' : '1.5px solid #e5e4e7',
  borderRadius: '24px',
  padding: '6px 20px',
  marginRight: '12px',
  '&:hover': {
    backgroundColor: active ? '#d31027' : 'rgba(0,0,0,0.04)',
    borderColor: active ? '#d31027' : '#b2b2b2',
  }
}));

export default function DashboardPage({ user, onLogout, onReservationComplete }) {
  const firstName = user?.firstName || 'Guest';

  // Navigation state
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'history'

  // Dynamic Room Options from API
  const [roomOptions, setRoomOptions] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Booking history from API
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

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

  // Helper to format today's date in local YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  // Validate check-in/out date sequence and prevent past dates
  const isValidDateRange = (ci, co) => {
    if (!ci || !co) return false;
    const checkIn = new Date(ci);
    const checkOut = new Date(co);
    const today = new Date(todayStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return false;
    if (checkIn < today) return false;
    if (checkOut < checkIn) return false;

    return true;
  };

  // Fetch rooms list based on date ranges
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        let url = '/api/rooms';
        if (isValidDateRange(checkInDate, checkOutDate)) {
          url += `?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const mapped = data.rooms.map(room => ({
            ...room,
            image: roomImages[room.id] || roomPlaceholder
          }));
          setRoomOptions(mapped);

          // Clear selection if the currently selected room has 0 available
          if (selectedRoom) {
            const selectedRoomDetails = mapped.find(r => r.id === selectedRoom);
            if (selectedRoomDetails && selectedRoomDetails.available <= 0) {
              setSelectedRoom('');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
      setLoadingRooms(false);
    };

    fetchRooms();
  }, [checkInDate, checkOutDate]);

  // Auto-adjust Check-out Date if Check-in Date is set later than Check-out Date
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const ci = new Date(checkInDate);
      const co = new Date(checkOutDate);
      if (ci > co) {
        setCheckOutDate(checkInDate);
      }
    }
  }, [checkInDate]);

  // Auto-adjust Check-in Date if Check-out Date is set earlier than Check-in Date
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const ci = new Date(checkInDate);
      const co = new Date(checkOutDate);
      if (co < ci) {
        setCheckInDate(checkOutDate);
      }
    }
  }, [checkOutDate]);

  // Fetch Guest's past bookings
  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reservations/my-reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMyBookings(data.reservations);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
    setLoadingBookings(false);
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Helper to calculate stay duration in days
  const getDiffDays = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const diffDays = getDiffDays();
  const isHoursLocked = diffDays > 1;

  // Auto-lock Hours of Stay to 24 when stay range is multi-day (> 1 day)
  useEffect(() => {
    if (isHoursLocked) {
      setHours(24);
    }
  }, [isHoursLocked]);

  // Dynamic price calculation based on room, duration, and stay days
  useEffect(() => {
    const room = roomOptions.find((r) => r.id === selectedRoom);
    if (!room) {
      setTotalAmount(0);
      return;
    }

    if (isHoursLocked) {
      const dayRate = room.rates[24] || 0;
      setTotalAmount(dayRate * diffDays);
    } else {
      const price = hours ? (room.rates[hours] || 0) : 0;
      setTotalAmount(price);
    }
  }, [selectedRoom, hours, isHoursLocked, diffDays, roomOptions]);

  // Strip HTML tags to prevent XSS injection
  const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '').replace(/[<>]/g, '');
  };

  // Form submission handler
  const handleReservation = (e) => {
    e.preventDefault();
    setError('');

    // 1. Check Required Fields
    if (!checkInDate) {
      setError('Check-in Date is required.');
      return;
    }
    if (!checkOutDate) {
      setError('Check-out Date is required.');
      return;
    }
    if (!checkInTime) {
      setError('Check-in Time is required.');
      return;
    }
    if (!selectedRoom) {
      setError('Please select a room card.');
      return;
    }
    if (!hours) {
      setError('Please select stay duration.');
      return;
    }

    // 2. Validate Date Format and Chronology
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date(todayStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      setError('Invalid date format selected.');
      return;
    }

    if (checkIn < today) {
      setError('Check-in Date cannot be in the past.');
      return;
    }

    if (checkOut < checkIn) {
      setError('Check-out Date must be greater than or equal to Check-in Date.');
      return;
    }

    // 3. Same-Day Time Validation
    if (checkInDate === todayStr) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      const [inputHour, inputMin] = checkInTime.split(':').map(Number);
      if (isNaN(inputHour) || isNaN(inputMin)) {
        setError('Invalid check-in time format.');
        return;
      }

      if (inputHour < currentHour || (inputHour === currentHour && inputMin <= currentMin)) {
        setError('Check-in Time cannot be in the past for today.');
        return;
      }
    }

    // 4. Whitelist Stay Duration Check
    const duration = Number(hours);
    if (![12, 24].includes(duration)) {
      setError('Invalid stay duration selected.');
      return;
    }

    // 5. Room Verification & Availability check
    const room = roomOptions.find((r) => r.id === selectedRoom);
    if (!room) {
      setError('Invalid room type selected.');
      return;
    }

    if (room.available <= 0) {
      setError('This room is fully booked for the selected dates. Please choose another room or change your stay dates.');
      return;
    }

    // 6. Server-Side Verification Simulation (Recalculate Price)
    let calculatedPrice = 0;
    if (isHoursLocked) {
      const dayRate = room.rates[24] || 0;
      calculatedPrice = dayRate * diffDays;
    } else {
      calculatedPrice = room.rates[duration] || 0;
    }

    if (calculatedPrice !== totalAmount) {
      setError(`Price verification failed. Expected PHP ${calculatedPrice}, but got PHP ${totalAmount}.`);
      return;
    }

    // 7. Sanitize Notes
    const sanitizedNotes = sanitizeString(notes).slice(0, 500);

    const reservationData = {
      checkInDate,
      checkOutDate,
      checkInTime,
      selectedRoom,
      hours: duration,
      notes: sanitizedNotes,
      totalAmount: calculatedPrice
    };

    setSuccess(true);

    setTimeout(() => {
      if (onReservationComplete) {
        onReservationComplete(reservationData);
      }
    }, 1200);
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
            {/* Welcome banner */}
            <div className="welcome-banner">
              <Typography variant="h4" className="welcome-title">
                Welcome, {firstName}!
              </Typography>
              <Typography variant="body2" className="welcome-subtitle">
                Manage your stays and reserve rooms below.
              </Typography>
            </div>

            {/* Premium Tab Toggles */}
            <Box sx={{ display: 'flex', mb: 3.5 }}>
              <TabButton active={activeTab === 'book'} onClick={() => setActiveTab('book')}>
                New Reservation
              </TabButton>
              <TabButton
                active={activeTab === 'history'}
                onClick={() => {
                  setActiveTab('history');
                  fetchMyBookings();
                }}
              >
                My Bookings ({myBookings.length})
              </TabButton>
            </Box>

            {/* TAB CONTENT: NEW RESERVATION FORM */}
            {activeTab === 'book' && (
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
                        inputProps={{ min: todayStr }}
                        slotProps={{ htmlInput: { min: todayStr } }}
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
                        inputProps={{ min: checkInDate || todayStr }}
                        slotProps={{ htmlInput: { min: checkInDate || todayStr } }}
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
                        disabled={isHoursLocked}
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

                  {/* Select Room - Image Gallery Section */}
                  <Box className="gallery-section">
                    <Typography className="field-label">Select Room</Typography>
                    {loadingRooms ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress size={32} sx={{ color: '#990000' }} />
                      </Box>
                    ) : (
                      <div className="room-gallery">
                        {roomOptions.map((room) => {
                          const isSelected = selectedRoom === room.id;
                          let rateText = '';
                          if (isHoursLocked) {
                            const dayRate = room.rates[24] || 0;
                            const totalRoomPrice = dayRate * diffDays;
                            rateText = `PHP ${totalRoomPrice.toLocaleString()} for ${diffDays} Days`;
                          } else if (hours) {
                            const rate = room.rates[hours] || 0;
                            rateText = `PHP ${rate.toLocaleString()} / ${hours} Hrs`;
                          } else {
                            rateText = 'Select stay hours';
                          }

                          return (
                            <div
                              key={room.id}
                              className={`room-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedRoom(room.id)}
                            >
                              <div className="room-card-image-container">
                                <img src={room.image} className="room-card-image" alt={room.name} />
                                {isSelected && (
                                  <div className="selected-badge">
                                    ✓
                                  </div>
                                )}
                              </div>
                              <div className="room-card-info">
                                <Typography className="room-card-name">{room.name}</Typography>
                                <div className="room-card-meta">
                                  <Typography className="room-card-rate">
                                    {rateText}
                                  </Typography>
                                  <Typography className={`room-card-status ${room.available <= 2 ? 'low' : ''}`}>
                                    {room.available} {room.available === 1 ? 'room left' : 'rooms available'}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Box>

                  {/* Special Notes Section */}
                  <Box className="notes-section">
                    <Typography className="field-label">Special Notes</Typography>
                    <FormField
                      multiline
                      rows={2}
                      placeholder="Add any requests or notes here..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      inputProps={{ maxLength: 500 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NoteIcon className="form-icon" />
                          </InputAdornment>
                        ),
                      }}
                    />
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
            )}

            {/* TAB CONTENT: BOOKINGS HISTORY */}
            {activeTab === 'history' && (
              <Box>
                {loadingBookings ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#990000' }} />
                  </Box>
                ) : myBookings.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }} elevation={2}>
                    <Typography variant="h6" sx={{ color: '#555', fontWeight: 600, mb: 1 }}>
                      No Reservations Found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#777' }}>
                      You haven't reserved any rooms yet. Click on "New Reservation" to make your first stay!
                    </Typography>
                  </Paper>
                ) : (
                  myBookings.map((booking) => {
                    const formattedCheckInDate = new Date(booking.checkInDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const formattedCheckOutDate = new Date(booking.checkOutDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <Paper
                        key={booking._id}
                        elevation={2}
                        sx={{
                          p: 3.5,
                          mb: 2.5,
                          borderRadius: '10px',
                          borderLeft: '5.5px solid #FFD700',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ flex: 1, minWidth: '280px' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#990000', mb: 0.5 }}>
                              {booking.room?.name || booking.roomType.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#777', display: 'block', mb: 2 }}>
                              Booking ID: {booking._id} | Placed on {new Date(booking.createdAt).toLocaleDateString()}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.5px' }}>
                                  Check-in
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  {formattedCheckInDate}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  at {booking.checkInTime}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.5px' }}>
                                  Check-out
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  {formattedCheckOutDate}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.5px' }}>
                                  Duration
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  {booking.hours} Hours
                                </Typography>
                              </Box>
                            </Box>

                            {booking.notes && (
                              <Box sx={{ p: 1.5, bgcolor: '#fdfbfe', borderRadius: '6px', border: '1.5px dashed #E5E4E7' }}>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.5px', mb: 0.5 }}>
                                  Special Requests
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#444' }}>
                                  "{booking.notes}"
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', minWidth: '150px' }}>
                            <Box
                              sx={{
                                backgroundColor: 'rgba(255, 215, 0, 0.12)',
                                color: '#b8860b',
                                border: '1px solid #FFD700',
                                borderRadius: '12px',
                                px: 2,
                                py: 0.4,
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                              }}
                            >
                              {booking.paymentDetails?.status || 'PAID'}
                            </Box>
                            <Box sx={{ mt: { xs: 2, sm: 0 }, textAlign: { xs: 'left', sm: 'right' } }}>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                {/* Total Paid via Card (***{booking.paymentDetails?.cardNumberLast4}) */}
                                Total Paid via Card
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: '#990000' }}>
                                PHP {booking.totalAmount.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })
                )}
              </Box>
            )}
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
