import React, { useState } from 'react';
import {
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  styled,
  Button,
  TextField,
  Paper,
  Divider,
  Grid,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import logoImg from '../assets/logo.png';
import roomPlaceholder from '../assets/room_placeholder.png';
import premiumImg from '../assets/premium.jpg';
import deluxeImg from '../assets/deluxe.jpg';
import regencyImg from '../assets/regency.jpg';
import regency2Img from '../assets/regency2.jpg';
import megaSuiteImg from '../assets/mega_suite.jpg';
import './PaymentPage.css';

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

const ROOM_OPTIONS = [
  { id: 'premium', name: 'Premium Room', image: premiumImg },
  { id: 'deluxe', name: 'Deluxe Room', image: deluxeImg },
  { id: 'regency', name: 'Regency', image: regencyImg },
  { id: 'regency2', name: 'Regency II', image: regency2Img },
  { id: 'mega_suite', name: 'Mega Suite', image: megaSuiteImg }
];

const FormField = styled(TextField)({
  marginBottom: '16px',
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

export default function PaymentPage({ user, reservation, onLogout, onBackToDashboard, onPaymentSuccess }) {
  const firstName = user?.firstName || 'Guest';

  // State management
  const [isPaying, setIsPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState('');

  // Form inputs states (only Card Payment fields)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!reservation) return null;

  // Retrieve room configuration
  const room = ROOM_OPTIONS.find((r) => r.id === reservation.selectedRoom) || {
    name: reservation.selectedRoom,
    image: roomPlaceholder
  };

  // Price invoice breakdown
  const totalAmount = reservation.totalAmount;
  const baseRate = totalAmount / 1.12;
  const vatAmount = totalAmount - baseRate;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberInput = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format Card Expiration MM/YY
  const handleExpiryInput = (val) => {
    let cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    setCardExpiry(cleaned);
  };

  // Format CVV (max 3 digits)
  const handleCvvInput = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setCardCvv(cleaned);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (!cardName.trim()) {
      setError('Cardholder name is required.');
      return;
    }
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) {
      setError('Card number must be exactly 16 digits.');
      return;
    }
    if (cardExpiry.length !== 5) {
      setError('Expiration date is required in MM/YY format.');
      return;
    }
    const [month, year] = cardExpiry.split('/').map(Number);
    if (month < 1 || month > 12) {
      setError('Invalid expiration month.');
      return;
    }
    if (cardCvv.length !== 3) {
      setError('CVV must be exactly 3 digits.');
      return;
    }

    setIsPaying(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          checkInTime: reservation.checkInTime,
          selectedRoom: reservation.selectedRoom,
          hours: reservation.hours,
          notes: reservation.notes,
          totalAmount: reservation.totalAmount,
          paymentDetails: {
            cardName: cardName.trim(),
            cardNumber: rawCard
          }
        })
      });

      const data = await res.json();

      if (data.success) {
        setIsPaying(false);
        setSuccessOpen(true);
      } else {
        setIsPaying(false);
        setError(data.message || 'Booking submission failed.');
      }
    } catch (err) {
      console.error('Payment booking error:', err);
      setIsPaying(false);
      setError('Failed to reach payment server. Please try again.');
    }
  };

  const handleFinish = () => {
    setSuccessOpen(false);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <ThemeProvider theme={ogosTheme}>
      <div className="payment-viewport">
        {/* HEADER BAR */}
        <header className="payment-header">
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
        <main className="payment-main">
          <Box className="payment-content">
            {/* Header intro */}
            <div className="payment-intro">
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBackToDashboard}
                className="back-link-btn"
              >
                Back to Reservation
              </Button>
              <Typography variant="h4" className="payment-title">
                Settle Payment
              </Typography>
              <Typography variant="body2" className="payment-subtitle">
                Review your reservation information and complete your card payment.
              </Typography>
            </div>

            <Box className="payment-stack-container">
              {/* COMBINED BOOKING & BILLING SUMMARY CARD */}
              <Paper className="payment-summary-card" elevation={2}>
                <Typography variant="h6" className="summary-header">
                  Booking Summary
                </Typography>
                <Divider className="summary-divider" />
                
                <Box className="summary-room-card">
                  <img src={room.image} className="summary-room-image" alt={room.name} />
                  <Box className="summary-room-details">
                    <Typography className="summary-room-name">{room.name}</Typography>
                    <Typography className="summary-room-hours" variant="caption">
                      {reservation.hours} Hours Stay
                    </Typography>
                  </Box>
                </Box>

                <Box className="summary-details-list">
                  <div className="summary-item">
                    <Typography className="summary-item-label">Check-in Date:</Typography>
                    <Typography className="summary-item-val">{reservation.checkInDate}</Typography>
                  </div>
                  <div className="summary-item">
                    <Typography className="summary-item-label">Check-out Date:</Typography>
                    <Typography className="summary-item-val">{reservation.checkOutDate}</Typography>
                  </div>
                  <div className="summary-item">
                    <Typography className="summary-item-label">Check-in Time:</Typography>
                    <Typography className="summary-item-val">{reservation.checkInTime}</Typography>
                  </div>
                  {reservation.notes && (
                    <div className="summary-item notes">
                      <Typography className="summary-item-label">Special Notes:</Typography>
                      <Typography className="summary-item-val notes-text">{reservation.notes}</Typography>
                    </div>
                  )}
                </Box>

                <Divider className="summary-divider" style={{ margin: '28px 0 16px 0' }} />

                <Typography variant="h6" className="summary-header">
                  Billing Details
                </Typography>
                <Divider className="summary-divider" />
                
                <Box className="invoice-list">
                  <div className="invoice-item">
                    <Typography variant="body2">Room Base Charge</Typography>
                    <Typography variant="body2">PHP {baseRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                  </div>
                  <div className="invoice-item">
                    <Typography variant="body2">VAT (12% inclusive)</Typography>
                    <Typography variant="body2">PHP {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                  </div>
                  <Divider className="invoice-divider" />
                  <div className="invoice-item total">
                    <Typography variant="body1" className="total-label">Total to Pay</Typography>
                    <Typography variant="h5" className="total-price">
                      PHP {totalAmount.toLocaleString()}
                    </Typography>
                  </div>
                </Box>
              </Paper>

              {/* CARD PAYMENT DETAILS CARD (LAST) */}
              <Paper className="payment-form-card" elevation={2}>
                <Typography variant="h6" className="payment-section-header">
                  Card Payment Details
                </Typography>
                <Divider className="payment-section-divider" />

                {/* Card input form directly */}
                <form onSubmit={handleConfirmPayment} className="payment-input-form">
                  <Box className="form-group-fields">
                    <FormField
                      label="Cardholder Name"
                      placeholder="Juan Dela Cruz"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                    <FormField
                      label="Card Number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberInput(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CreditCardIcon style={{ color: '#888888' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormField
                          label="Expiry Date"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryInput(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormField
                          label="CVV"
                          placeholder="123"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => handleCvvInput(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {error && (
                    <Typography className="payment-error-text" variant="caption">
                      {error}
                    </Typography>
                  )}

                  {/* Action buttons */}
                  <div className="payment-form-actions">
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      className="pay-now-btn"
                      disabled={isPaying}
                      disableElevation
                    >
                      {isPaying ? (
                        <CircularProgress size={24} style={{ color: '#ffffff' }} />
                      ) : (
                        `Pay PHP ${totalAmount.toLocaleString()}`
                      )}
                    </Button>
                  </div>

                </form>
              </Paper>
            </Box>
          </Box>
        </main>
      </div>

      {/* Payment success modal */}
      <Dialog
        open={successOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleFinish();
        }}
        maxWidth="xs"
        fullWidth
        className="success-dialog-wrapper"
      >
        <DialogTitle className="dialog-icon-header">
          <CheckCircleIcon className="success-lottie-icon" />
        </DialogTitle>
        <DialogContent className="dialog-success-content">
          <Typography variant="h5" className="success-dialog-title">
            Booking Confirmed!
          </Typography>
          <Typography variant="body2" className="success-dialog-msg">
            Payment of PHP {totalAmount.toLocaleString()} was successfully processed. Thank you for choosing Hotel Ogos!
          </Typography>
          <Button
            onClick={handleFinish}
            variant="contained"
            className="success-dialog-btn"
            fullWidth
            disableElevation
          >
            Back to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
