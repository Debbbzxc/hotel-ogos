import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from './config';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRef = useRef(null);
  const reservationRef = useRef(null);

  
  useEffect(() => {
    userRef.current = user;
    reservationRef.current = reservation;
  }, [user, reservation]);

  
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success) {
            userRef.current = data.user;
            setUser(data.user);
            
            const hash = window.location.hash;
            if (hash === '' || hash === '#login' || hash === '#register') {
              if (data.user.role === 'admin') {
                window.location.hash = '#admin-dashboard';
              } else {
                window.location.hash = '#dashboard';
              }
            }
          } else {
            localStorage.removeItem('token');
            window.location.hash = '#login';
          }
        } catch (error) {
          console.error('Error fetching session:', error);
          
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  
  useEffect(() => {
    if (loading) return; 

    const handleHashChange = () => {
      const hash = window.location.hash;
      const currentUser = userRef.current;
      const currentReservation = reservationRef.current;

      if (hash === '#register') {
        setCurrentPage('register');
      } else if (hash === '#dashboard') {
        if (currentUser) {
          if (currentUser.role === 'admin') {
            setCurrentPage('admin-dashboard');
            window.location.hash = '#admin-dashboard';
          } else {
            setCurrentPage('dashboard');
          }
        } else {
          setCurrentPage('login');
          window.location.hash = '#login';
        }
      } else if (hash === '#admin-dashboard') {
        if (currentUser) {
          if (currentUser.role === 'admin') {
            setCurrentPage('admin-dashboard');
          } else {
            setCurrentPage('dashboard');
            window.location.hash = '#dashboard';
          }
        } else {
          setCurrentPage('login');
          window.location.hash = '#login';
        }
      } else if (hash === '#payment') {
        if (currentUser && currentReservation) {
          setCurrentPage('payment');
        } else if (currentUser) {
          if (currentUser.role === 'admin') {
            setCurrentPage('admin-dashboard');
            window.location.hash = '#admin-dashboard';
          } else {
            setCurrentPage('dashboard');
            window.location.hash = '#dashboard';
          }
        } else {
          setCurrentPage('login');
          window.location.hash = '#login';
        }
      } else {
        setCurrentPage('login');
        if (hash !== '#login') {
          window.location.hash = '#login';
        }
      }
    };

    
    window.addEventListener('hashchange', handleHashChange);

    
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loading]);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    userRef.current = userData;
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
      setTimeout(() => {
        window.location.hash = '#admin-dashboard';
      }, 0);
    } else {
      setCurrentPage('dashboard');
      setTimeout(() => {
        window.location.hash = '#dashboard';
      }, 0);
    }
  };

  const handleRegisterSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    userRef.current = userData;
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
      setTimeout(() => {
        window.location.hash = '#admin-dashboard';
      }, 0);
    } else {
      setCurrentPage('dashboard');
      setTimeout(() => {
        window.location.hash = '#dashboard';
      }, 0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    userRef.current = null;
    reservationRef.current = null;
    setUser(null);
    setReservation(null);
    setCurrentPage('login');
    setTimeout(() => {
      window.location.hash = '#login';
    }, 0);
  };

  const handleReservationComplete = (reservationData) => {
    reservationRef.current = reservationData;
    setReservation(reservationData);
    setCurrentPage('payment');
    setTimeout(() => {
      window.location.hash = '#payment';
    }, 0);
  };

  const handlePaymentSuccess = () => {
    reservationRef.current = null;
    setReservation(null);
    setCurrentPage('dashboard');
    setTimeout(() => {
      window.location.hash = '#dashboard';
    }, 0);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setTimeout(() => {
      window.location.hash = '#dashboard';
    }, 0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#f6f5f8'
        }}
      >
        <CircularProgress sx={{ color: '#990000' }} />
      </Box>
    );
  }

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === 'register' && (
        <RegisterPage onRegisterSuccess={handleRegisterSuccess} />
      )}
      {currentPage === 'dashboard' && (
        <DashboardPage
          user={user}
          onLogout={handleLogout}
          onReservationComplete={handleReservationComplete}
        />
      )}
      {currentPage === 'admin-dashboard' && (
        <AdminDashboardPage
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'payment' && (
        <PaymentPage
          user={user}
          reservation={reservation}
          onLogout={handleLogout}
          onBackToDashboard={handleBackToDashboard}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default App;
