import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
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
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import NoteIcon from '@mui/icons-material/Note';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import logoImg from '../assets/logo.png';
import roomPlaceholder from '../assets/room_placeholder.png';
import premiumImg from '../assets/premium.jpg';
import deluxeImg from '../assets/deluxe.jpg';
import regencyImg from '../assets/regency.jpg';
import regency2Img from '../assets/regency2.jpg';
import megaSuiteImg from '../assets/mega_suite.jpg';
import './DashboardPage.css';
import BisitaNVBanner from '../components/BisitaNVBanner';

const parseRoomNumber = (roomNumber) => {
  if (!roomNumber) return { floor: '', room: '' };
  const digits = roomNumber.replace(/\D/g, '');
  if (!digits) {
    return { floor: 'Unknown', room: roomNumber };
  }
  const num = parseInt(digits, 10);
  if (digits.length >= 3) {
    const floorStr = digits.slice(0, -2);
    const roomStr = digits.slice(-2);
    return {
      floor: parseInt(floorStr, 10),
      room: roomStr
    };
  } else {
    return {
      floor: 1,
      room: String(num).padStart(2, '0')
    };
  }
};

const roomImages = {
  premium: premiumImg,
  deluxe: deluxeImg,
  regency: regencyImg,
  regency2: regency2Img,
  mega_suite: megaSuiteImg
};


const ogosTheme = createTheme({
  palette: {
    primary: {
      main: '#990000', 
      light: '#D31027', 
      dark: '#730000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFD700', 
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


const HOURS_OPTIONS = [
  { value: 12, label: '12 Hours Short Stay' },
  { value: 24, label: '1 Day (24 Hours)' },
  { value: 48, label: '2 Days (48 Hours)' },
  { value: 72, label: '3 Days (72 Hours)' },
  { value: 96, label: '4 Days (96 Hours)' },
  { value: 120, label: '5 Days (120 Hours)' },
  { value: 144, label: '6 Days (144 Hours)' },
  { value: 168, label: '7 Days (168 Hours)' }
];

const STAY_OPTIONS = [
  { value: 12, label: '12 Hours' },
  { value: 24, label: '1 Day' },
  { value: 48, label: '2 Days' },
  { value: 72, label: '3 Days' },
  { value: 96, label: '4 Days' },
  { value: 120, label: '5 Days' },
  { value: 144, label: '6 Days' },
  { value: 168, label: '7 Days' }
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

  const getStatusStyles = (status) => {
    const normalized = (status || 'paid').toLowerCase();
    switch (normalized) {
      case 'paid':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.12)',
          color: '#2e7d32',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        };
      case 'pending':
        return {
          backgroundColor: 'rgba(255, 215, 0, 0.12)',
          color: '#b8860b',
          border: '1px solid #FFD700'
        };
      case 'cancelled':
        return {
          backgroundColor: 'rgba(211, 16, 39, 0.1)',
          color: '#d31027',
          border: '1px solid rgba(211, 16, 39, 0.3)'
        };
      default:
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          color: '#666666',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        };
    }
  };

  const getStatusBorderColor = (status) => {
    const normalized = (status || 'paid').toLowerCase();
    switch (normalized) {
      case 'paid':
        return '#2e7d32';
      case 'pending':
        return '#FFD700';
      case 'cancelled':
        return '#d31027';
      default:
        return '#cccccc';
    }
  };

  
  const formatTimeToAMPM = (time24) => {
    if (!time24) return '';
    try {
      const [hour, minute] = time24.split(':').map(Number);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      displayHour = displayHour ? displayHour : 12;
      const displayMin = String(minute).padStart(2, '0');
      return `${displayHour}:${displayMin} ${ampm}`;
    } catch (err) {
      return time24;
    }
  };

  
  const getCheckoutTime = (checkInTimeStr, durationHours) => {
    if (!checkInTimeStr || !durationHours) return '';
    const [hour, minute] = checkInTimeStr.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + durationHours * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    const ampm = endHour >= 12 ? 'PM' : 'AM';
    let displayHour = endHour % 12;
    displayHour = displayHour ? displayHour : 12;
    const displayMin = String(endMinute).padStart(2, '0');
    return `${displayHour}:${displayMin} ${ampm}`;
  };

  
  const [activeTab, setActiveTab] = useState('book'); 

  
  const [roomOptions, setRoomOptions] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelAlert, setCancelAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  
  const getCalculatedCheckout = () => {
    if (!checkInDate || !checkInTime || !hours) {
      return { dateStr: '', timeStr: '', display: 'Fill in Check-in details...' };
    }
    try {
      const [hour, minute] = checkInTime.split(':').map(Number);
      const [year, month, day] = checkInDate.split('-').map(Number);
      const checkInDateTime = new Date(year, month - 1, day, hour, minute, 0);
      const checkOutDateTime = new Date(checkInDateTime.getTime() + Number(hours) * 60 * 60 * 1000);

      const coYear = checkOutDateTime.getFullYear();
      const coMonth = String(checkOutDateTime.getMonth() + 1).padStart(2, '0');
      const coDay = String(checkOutDateTime.getDate()).padStart(2, '0');
      const dateStr = `${coYear}-${coMonth}-${coDay}`;

      const hr = String(checkOutDateTime.getHours()).padStart(2, '0');
      const min = String(checkOutDateTime.getMinutes()).padStart(2, '0');
      const timeStr = `${hr}:${min}`;

      const formattedDate = checkOutDateTime.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      const ampm = checkOutDateTime.getHours() >= 12 ? 'PM' : 'AM';
      let displayHour = checkOutDateTime.getHours() % 12;
      displayHour = displayHour ? displayHour : 12;
      const displayHourPadded = String(displayHour).padStart(2, '0');
      const displayMin = String(checkOutDateTime.getMinutes()).padStart(2, '0');
      const display = `${formattedDate} at ${displayHourPadded}:${displayMin} ${ampm}`;

      return { dateStr, timeStr, display };
    } catch (err) {
      return { dateStr: '', timeStr: '', display: 'Error calculating checkout...' };
    }
  };

  const checkoutDetails = getCalculatedCheckout();

  
  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  
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

  
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        let url = `${API_URL}/api/rooms`;
        if (checkInDate && checkOutDate && checkInTime && checkoutDetails.timeStr) {
          url += `?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&checkInTime=${checkInTime}&checkOutTime=${checkoutDetails.timeStr}`;
        } else if (checkInDate && checkOutDate) {
          url += `?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const mapped = data.rooms.map(room => ({
            ...room,
            image: room.imageUrl || roomImages[room.id] || roomPlaceholder
          }));
          
          
          mapped.sort((a, b) => {
            const rateA = a.rates?.[12] || 0;
            const rateB = b.rates?.[12] || 0;
            return rateA - rateB;
          });

          setRoomOptions(mapped);

          
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
  }, [checkInDate, checkOutDate, checkInTime, checkoutDetails.timeStr]);

  
  useEffect(() => {
    if (checkoutDetails.dateStr) {
      setCheckOutDate(checkoutDetails.dateStr);
    } else {
      setCheckOutDate(checkInDate);
    }
  }, [checkInDate, checkInTime, hours]);

  
  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reservations/my-reservations`, {
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

  
  useEffect(() => {
    const room = roomOptions.find((r) => r.id === selectedRoom);
    if (!room) {
      setTotalAmount(0);
      return;
    }
    let price = 0;
    if (hours > 24) {
      const dayRate = room.rates[24] || 0;
      price = dayRate * (hours / 24);
    } else {
      price = hours ? (room.rates[hours] || 0) : 0;
    }
    setTotalAmount(price);
  }, [selectedRoom, hours, roomOptions]);

  
  const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '').replace(/[<>]/g, '');
  };

  
  const handleReservation = async (e) => {
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

    
    const checkIn = new Date(checkInDate);
    const today = new Date(todayStr);

    if (isNaN(checkIn.getTime())) {
      setError('Invalid date format selected.');
      return;
    }

    if (checkIn < today) {
      setError('Check-in Date cannot be in the past.');
      return;
    }

    
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

    
    const duration = Number(hours);
    const isValidDuration = duration === 12 || (duration % 24 === 0 && duration > 0);
    if (!isValidDuration) {
      setError('Invalid stay duration selected.');
      return;
    }

    
    const room = roomOptions.find((r) => r.id === selectedRoom);
    if (!room) {
      setError('Invalid room type selected.');
      return;
    }

    if (room.available <= 0) {
      setError('This room is fully booked for the selected stay period (including housekeeping cleaning buffer).');
      return;
    }

    
    let calculatedPrice = 0;
    if (duration > 24) {
      const dayRate = room.rates[24] || 0;
      calculatedPrice = dayRate * (duration / 24);
    } else {
      calculatedPrice = room.rates[duration] || 0;
    }

    if (calculatedPrice !== totalAmount) {
      setError(`Price verification failed. Expected PHP ${calculatedPrice}, but got PHP ${totalAmount}.`);
      return;
    }

    
    const sanitizedNotes = sanitizeString(notes).slice(0, 500);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          checkInDate,
          checkOutDate,
          checkInTime,
          selectedRoom,
          hours: duration,
          notes: sanitizedNotes,
          totalAmount: calculatedPrice,
          paymentDetails: {
            status: 'pending'
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        const reservationData = {
          ...data.reservation,
          roomName: room.name,
          roomImage: room.imageUrl || roomImages[room.id] || roomPlaceholder
        };
        setTimeout(() => {
          if (onReservationComplete) {
            onReservationComplete(reservationData);
          }
        }, 1200);
      } else {
        setError(data.message || 'Failed to create pending reservation.');
      }
    } catch (err) {
      console.error('Error creating pending reservation:', err);
      setError('Failed to reach reservation server. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/reservations/${bookingToCancel._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCancelAlert({
          open: true,
          message: 'Booking cancelled successfully.',
          severity: 'success'
        });
        fetchMyBookings();
      } else {
        setCancelAlert({
          open: true,
          message: data.message || 'Failed to cancel booking.',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setCancelAlert({
        open: true,
        message: 'Failed to reach server. Please try again.',
        severity: 'error'
      });
    } finally {
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCloseCancelAlert = () => {
    setCancelAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={ogosTheme}>
      <div className="dashboard-viewport">
        
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

        
        <main className="dashboard-main">
          <Box className="dashboard-content">
            <BisitaNVBanner />
            
            <div className="welcome-banner">
              <Typography variant="h4" className="welcome-title">
                Welcome, {firstName}!
              </Typography>
              <Typography variant="body2" className="welcome-subtitle">
                Manage your stays and reserve rooms below.
              </Typography>
            </div>

            
            <Box className="tabs-desktop-container" sx={{ display: 'flex', mb: 3.5 }}>
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

            
            {activeTab === 'book' && (
              <Paper className="reservation-card" elevation={3}>
                <Typography variant="h5" className="form-header">
                  Room Reservation
                </Typography>
                <Divider className="form-divider" />

                <form id="reservation-form" onSubmit={handleReservation} className="reservation-form">
                  <Box className="form-row">
                    
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
                  </Box>

                  
                  <Box sx={{ mb: 3 }}>
                    <Typography className="field-label">How long are you staying?</Typography>
                    <div className="duration-chips-grid">
                      {HOURS_OPTIONS.map((option) => {
                        const isSelected = hours === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`duration-chip ${isSelected ? 'selected' : ''}`}
                            onClick={() => setHours(option.value)}
                          >
                            <span className="duration-chip-title">
                              {option.value === 12 ? '12 Hours' : `${option.value / 24} ${option.value === 24 ? 'Day' : 'Days'}`}
                            </span>
                            <span className="duration-chip-subtitle">
                              ({option.value} Hrs)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Box>

                  
                  <Box className="expected-checkout-minimal">
                    <AccessTimeIcon className="expected-checkout-minimal-icon" />
                    <Typography className="expected-checkout-minimal-text">
                      Expected Checkout:
                      <span className="expected-checkout-minimal-value">
                        {checkoutDetails.display || 'Fill in Check-in details...'}
                      </span>
                    </Typography>
                  </Box>

                  
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
                          if (hours) {
                            const duration = Number(hours);
                            let rate = 0;
                            if (duration > 24) {
                              const dayRate = room.rates[24] || 0;
                              rate = dayRate * (duration / 24);
                            } else {
                              rate = room.rates[duration] || 0;
                            }
                            rateText = `PHP ${rate.toLocaleString()}`;
                          } else {
                            rateText = `PHP ${(room.rates[12] || 0).toLocaleString()}`;
                          }

                          return (
                            <div
                              key={room.id}
                              className={`room-card ${isSelected ? 'selected' : ''} ${room.available === 0 ? 'sold-out' : ''}`}
                              onClick={() => {
                                if (room.available > 0) {
                                  setSelectedRoom(room.id);
                                }
                              }}
                            >
                              <div className="room-card-image-container">
                                <img src={room.image} className="room-card-image" alt={room.name} />
                                <div className={`room-availability-badge ${room.available === 0 ? 'sold-out' : room.available <= 2 ? 'low-stock' : 'in-stock'}`}>
                                  {room.available === 0 ? 'Sold Out' : room.available === 1 ? '1 Room Left' : `${room.available} Rooms Available`}
                                </div>
                                {isSelected && (
                                  <div className="selected-badge">
                                    ✓
                                  </div>
                                )}
                              </div>
                              <div className="room-card-info">
                                <Typography className="room-card-name">{room.name}</Typography>
                                <Typography className="room-card-description">
                                  {room.description}
                                </Typography>
                                
                                <Divider sx={{ my: 1.5, borderColor: '#f0edf2' }} />
                                
                                <div className="room-card-footer">
                                  <Box>
                                    <Typography className="room-card-rate-label">
                                      {hours ? `${hours} Hours Rate` : 'Starting Rate (12h)'}
                                    </Typography>
                                    <Typography className="room-card-rate">
                                      {rateText}
                                    </Typography>
                                  </Box>
                                  <Button
                                    type="button"
                                    variant={isSelected ? "contained" : "outlined"}
                                    size="small"
                                    className={`room-select-btn ${isSelected ? 'selected' : ''}`}
                                    disabled={room.available === 0}
                                    sx={{
                                      textTransform: 'none',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      borderRadius: '6px',
                                      py: 0.5,
                                      px: 1.5,
                                    }}
                                  >
                                    {room.available === 0 ? 'Sold Out' : isSelected ? 'Selected' : 'Select'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Box>

                  
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
                          borderLeft: `5.5px solid ${getStatusBorderColor(booking.paymentDetails?.status)}`,
                          backgroundColor: '#ffffff',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ flex: 1, minWidth: '280px' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#990000', mb: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                              {booking.room?.name || booking.roomType.toUpperCase()}
                              {booking.roomNumber && (
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    color: '#FFD700', 
                                    px: 1, 
                                    py: 0.2, 
                                    bgcolor: '#990000', 
                                    borderRadius: '4px', 
                                    fontSize: '11.5px',
                                    fontFamily: "'Poppins', sans-serif"
                                  }}
                                >
                                  Room {booking.roomNumber} (Floor {parseRoomNumber(booking.roomNumber).floor}, Room {parseRoomNumber(booking.roomNumber).room})
                                </Typography>
                              )}
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
                                  at {formatTimeToAMPM(booking.checkInTime)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.5px' }}>
                                  Check-out
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  {formattedCheckOutDate}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  at {getCheckoutTime(booking.checkInTime, booking.hours)}
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
                                ...getStatusStyles(booking.paymentDetails?.status),
                                borderRadius: '12px',
                                px: 2,
                                py: 0.4,
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                              }}
                            >
                              {booking.paymentDetails?.status || 'paid'}
                            </Box>
                            <Box sx={{ mt: { xs: 2, sm: 0 }, textAlign: { xs: 'left', sm: 'right' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                {booking.paymentDetails?.status === 'pending' ? 'Total Amount' : 'Total Paid'}
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: '#990000', mb: 1 }}>
                                PHP {booking.totalAmount.toLocaleString()}
                              </Typography>
                              {booking.paymentDetails?.status === 'pending' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, width: '100%' }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disableElevation
                                    sx={{
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      fontSize: '12px',
                                      borderRadius: '6px',
                                      backgroundColor: '#990000',
                                      '&:hover': {
                                        backgroundColor: '#d31027'
                                      }
                                    }}
                                    onClick={() => {
                                      const parsedCheckIn = booking.checkInDate ? booking.checkInDate.split('T')[0] : '';
                                      const parsedCheckOut = booking.checkOutDate ? booking.checkOutDate.split('T')[0] : '';
                                      
                                      const bookingForPayment = {
                                        _id: booking._id,
                                        checkInDate: parsedCheckIn,
                                        checkOutDate: parsedCheckOut,
                                        checkInTime: booking.checkInTime,
                                        hours: booking.hours,
                                        notes: booking.notes,
                                        totalAmount: booking.totalAmount,
                                        selectedRoom: booking.roomType,
                                        roomName: booking.room?.name,
                                        roomImage: booking.room?.imageUrl
                                      };
                                      if (onReservationComplete) {
                                        onReservationComplete(bookingForPayment);
                                      }
                                    }}
                                  >
                                    Proceed to Payment
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    sx={{
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      fontSize: '12px',
                                      borderRadius: '6px',
                                      borderColor: '#d31027',
                                      color: '#d31027',
                                      '&:hover': {
                                        borderColor: '#990000',
                                        backgroundColor: 'rgba(211, 16, 39, 0.04)'
                                      }
                                    }}
                                    onClick={() => {
                                      setBookingToCancel(booking);
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    Cancel Booking
                                  </Button>
                                </Box>
                              )}
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

      {/* Cancel Reservation confirmation dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle className="ogos-dialog-title" style={{ color: '#d31027' }}>
          Cancel Reservation
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ fontFamily: "'Poppins', sans-serif", color: '#1a1a1a' }}>
            Are you sure you want to cancel your reservation for <strong>{bookingToCancel?.room?.name || bookingToCancel?.roomType?.toUpperCase()}</strong>?
            This will release the room block and cancel the reservation. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="ogos-dialog-actions">
          <Button
            onClick={() => setCancelDialogOpen(false)}
            sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: '#666' }}
          >
            No, Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
          >
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel action alerts */}
      <Snackbar
        open={cancelAlert.open}
        autoHideDuration={4000}
        onClose={handleCloseCancelAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseCancelAlert}
          severity={cancelAlert.severity}
          variant="filled"
          sx={{ width: '100%', fontFamily: "'Poppins', sans-serif", borderRadius: '8px' }}
        >
          {cancelAlert.message}
        </Alert>
      </Snackbar>

      {/* Mobile Sticky Bottom Summary Bar */}
      {activeTab === 'book' && selectedRoom && (
        <div className="mobile-sticky-summary-bar">
          <div className="sticky-summary-info">
            <Typography className="sticky-room-name">
              {roomOptions.find(r => r.id === selectedRoom)?.name || 'Selected Room'}
            </Typography>
            <Typography className="sticky-price-value">
              PHP {totalAmount.toLocaleString()}
            </Typography>
          </div>
          <Button
            type="submit"
            form="reservation-form"
            variant="contained"
            className="sticky-book-btn"
            disableElevation
          >
            Next
          </Button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <button
          type="button"
          className={`mobile-bottom-nav-item ${activeTab === 'book' ? 'selected' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          <CalendarTodayIcon />
          <span>Book Stay</span>
        </button>
        <button
          type="button"
          className={`mobile-bottom-nav-item ${activeTab === 'history' ? 'selected' : ''}`}
          onClick={() => {
            setActiveTab('history');
            fetchMyBookings();
          }}
        >
          <ReceiptIcon />
          <span>My Stays</span>
        </button>
      </div>
    </ThemeProvider>
  );
}
