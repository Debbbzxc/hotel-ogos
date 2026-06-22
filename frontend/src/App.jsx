import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === 'register' && (
        <RegisterPage onNavigate={setCurrentPage} onRegisterSuccess={handleRegisterSuccess} />
      )}
      {currentPage === 'dashboard' && (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
