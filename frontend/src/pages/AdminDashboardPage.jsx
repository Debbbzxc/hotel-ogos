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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KingBedIcon from '@mui/icons-material/KingBed';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import logoImg from '../assets/logo.png';
import roomPlaceholder from '../assets/room_placeholder.png';
import premiumImg from '../assets/premium.jpg';
import deluxeImg from '../assets/deluxe.jpg';
import regencyImg from '../assets/regency.jpg';
import regency2Img from '../assets/regency2.jpg';
import megaSuiteImg from '../assets/mega_suite.jpg';

import './AdminDashboardPage.css';

// Default static room images matching standard types
const staticRoomImages = {
  premium: premiumImg,
  deluxe: deluxeImg,
  regency: regencyImg,
  regency2: regency2Img,
  mega_suite: megaSuiteImg
};

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

// MUI theme matching style guide
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

export default function AdminDashboardPage({ user, onLogout }) {
  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Administrator';

  // Helper to calculate exact checkout date and time for display
  const getCheckoutDateTimeDisplay = (res) => {
    if (!res.checkInDate || !res.checkInTime || !res.hours) return '—';
    try {
      const [hour, minute] = res.checkInTime.split(':').map(Number);
      const date = new Date(res.checkInDate);
      
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      
      const checkInDateTime = new Date(year, month, day, hour, minute, 0);
      const checkOutDateTime = new Date(checkInDateTime.getTime() + Number(res.hours) * 60 * 60 * 1000);
      
      const dateDisplay = checkOutDateTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const ampm = checkOutDateTime.getHours() >= 12 ? 'PM' : 'AM';
      let displayHour = checkOutDateTime.getHours() % 12;
      displayHour = displayHour ? displayHour : 12;
      const displayMin = String(checkOutDateTime.getMinutes()).padStart(2, '0');
      
      return `${dateDisplay} at ${displayHour}:${displayMin} ${ampm}`;
    } catch (err) {
      return new Date(res.checkOutDate).toLocaleDateString();
    }
  };

  // Helper to format 24h time string (e.g. "14:30") to 12h AM/PM
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

  // Helper to count occupied and housekeeping units for a room type
  const getLiveRoomStatuses = (room, reservationsList) => {
    const now = new Date();
    let occupied = 0;
    let housekeeping = 0;

    const roomRes = reservationsList.filter(
      r => r.roomType === room.id && 
      r.paymentDetails?.status !== 'cancelled'
    );

    for (const res of roomRes) {
      if (!res.checkInDate || !res.checkInTime || !res.hours) continue;
      
      const [hour, minute] = res.checkInTime.split(':').map(Number);
      const date = new Date(res.checkInDate);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      
      const start = new Date(year, month, day, hour, minute, 0);
      const end = new Date(start.getTime() + res.hours * 60 * 60 * 1000);
      const housekeepingEnd = new Date(end.getTime() + 30 * 60 * 1000); // 30-min cleanup

      if (now >= start && now < end) {
        occupied++;
      } else if (now >= end && now < housekeepingEnd) {
        housekeeping++;
      }
    }

    const available = Math.max(0, room.available - occupied - housekeeping);
    return { occupied, housekeeping, available };
  };

  // Helper to determine exact real-time reservation status (including housekeeping)
  const getReservationStatus = (res) => {
    if (!res.paymentDetails) return 'pending';
    if (res.paymentDetails.status === 'cancelled') return 'cancelled';
    
    const now = new Date();
    try {
      const [hour, minute] = res.checkInTime.split(':').map(Number);
      const date = new Date(res.checkInDate);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      
      const start = new Date(year, month, day, hour, minute, 0);
      const end = new Date(start.getTime() + res.hours * 60 * 60 * 1000);
      const housekeepingEnd = new Date(end.getTime() + 30 * 60 * 1000);
      
      if (now >= end && now < housekeepingEnd) {
        return 'housekeeping';
      }
    } catch (err) {}
    
    return res.paymentDetails.status;
  };
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview, reservations, rooms, guests

  // Core Data Lists
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  // Loadings
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filter states
  const [reservationsSearch, setReservationsSearch] = useState('');
  const [reservationsStatusFilter, setReservationsStatusFilter] = useState('all');
  const [reservationsRoomFilter, setReservationsRoomFilter] = useState('all');
  const [usersSearch, setUsersSearch] = useState('');

  // Dialog / Modal Form States
  // Rooms Modal
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    roomId: '',
    name: '',
    baseRate12: '',
    baseRate24: '',
    totalRooms: '',
    description: '',
    imageUrl: '',
    roomNumbers: ''
  });

  // Users Modal
  const [openUserModal, setOpenUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  });

  // Delete Confirm Dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'room'|'user', id: string, name: string }

  // Alert State
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success' // success, error, warning, info
  });

  // Load API Data
  const fetchData = async () => {
    setLoadingData(true);
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }

    try {
      // 1. Fetch Reservations
      const resReservations = await fetch(`${API_URL}/api/reservations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataReservations = await resReservations.json();

      // 2. Fetch Rooms
      const resRooms = await fetch(`${API_URL}/api/rooms`);
      const dataRooms = await resRooms.json();

      // 3. Fetch Users
      const resUsers = await fetch(`${API_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataUsers = await resUsers.json();

      if (dataReservations.success) {
        setReservations(dataReservations.reservations);
      }
      if (dataRooms.success) {
        // Sort rooms from cheapest to most expensive based on 12h rate
        const sortedRooms = [...dataRooms.rooms].sort((a, b) => {
          const rateA = a.rates?.[12] || 0;
          const rateB = b.rates?.[12] || 0;
          return rateA - rateB;
        });
        setRooms(sortedRooms);
      }
      if (dataUsers.success) {
        setUsers(dataUsers.users);
      }

      // Check auth status
      if (
        dataReservations.status === 401 || 
        dataUsers.status === 401 ||
        (dataReservations.success === false && dataReservations.message?.includes('Not authorized'))
      ) {
        onLogout();
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      triggerAlert('Failed to connect to the server. Please try again.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // ----------------------------------------------------
  // Room Actions
  // ----------------------------------------------------
  const handleOpenAddRoom = () => {
    setIsEditingRoom(false);
    setRoomFormData({
      roomId: '',
      name: '',
      baseRate12: '',
      baseRate24: '',
      totalRooms: '5',
      description: '',
      imageUrl: '',
      roomNumbers: ''
    });
    setOpenRoomModal(true);
  };

  const handleOpenEditRoom = (room) => {
    setIsEditingRoom(true);
    setRoomFormData({
      roomId: room.id,
      name: room.name,
      baseRate12: room.rates[12].toString(),
      baseRate24: room.rates[24].toString(),
      totalRooms: room.available.toString(), // normalise value
      description: room.description || '',
      imageUrl: room.imageUrl || '',
      roomNumbers: room.roomNumbers ? room.roomNumbers.join(', ') : ''
    });
    setOpenRoomModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerAlert('Image size should be less than 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setRoomFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const { roomId, name, baseRate12, baseRate24, totalRooms, description, imageUrl, roomNumbers } = roomFormData;

    if (!roomId || !name || !baseRate12 || !baseRate24 || !totalRooms) {
      triggerAlert('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      roomId: roomId.toLowerCase(),
      name,
      baseRate12: Number(baseRate12),
      baseRate24: Number(baseRate24),
      totalRooms: Number(totalRooms),
      description,
      imageUrl,
      roomNumbers: roomNumbers ? roomNumbers.split(',').map(n => n.trim()).filter(Boolean) : []
    };

    try {
      let res;
      if (isEditingRoom) {
        res = await fetch(`${API_URL}/api/rooms/${roomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        triggerAlert(isEditingRoom ? 'Room updated successfully!' : 'Room created successfully!', 'success');
        setOpenRoomModal(false);
        fetchData();
      } else {
        triggerAlert(data.message || 'Error occurred while saving room.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Connection error, failed to save room.', 'error');
    }
  };

  const handleOpenDeleteConfirm = (type, target) => {
    setDeleteTarget({
      type,
      id: target.id || target.roomId || target._id,
      name: target.name || `${target.firstName} ${target.lastName}` || target.username
    });
    setOpenDeleteConfirm(true);
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem('token');
    const { type, id } = deleteTarget;

    try {
      let res;
      if (type === 'room') {
        res = await fetch(`${API_URL}/api/rooms/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (type === 'user') {
        res = await fetch(`${API_URL}/api/auth/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const data = await res.json();
      if (data.success) {
        triggerAlert(`${type === 'room' ? 'Room type' : 'Guest account'} deleted successfully!`, 'success');
        setOpenDeleteConfirm(false);
        setDeleteTarget(null);
        fetchData();
      } else {
        triggerAlert(data.message || 'Action failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Connection error, action failed.', 'error');
    }
  };

  // ----------------------------------------------------
  // User Profile / Role Actions
  // ----------------------------------------------------
  const handleOpenEditUser = (u) => {
    setUserFormData({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      email: u.email
    });
    setOpenUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const { id, firstName, lastName, username, email } = userFormData;

    if (!firstName || !lastName || !username || !email) {
      triggerAlert('Please fill in all fields.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ firstName, lastName, username, email })
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert('Guest profile updated successfully!', 'success');
        setOpenUserModal(false);
        fetchData();
      } else {
        triggerAlert(data.message || 'Failed to update user profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Connection error, failed to update user profile.', 'error');
    }
  };

  const handleToggleUserRole = async (u) => {
    const token = localStorage.getItem('token');
    const newRole = u.role === 'admin' ? 'guest' : 'admin';

    // Prevent demoting self
    if (u._id === user?.id && newRole === 'guest') {
      triggerAlert('You cannot demote your own admin account.', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/users/${u._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert(`User role updated to ${newRole}!`, 'success');
        fetchData();
      } else {
        triggerAlert(data.message || 'Failed to update user role.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Connection error, failed to toggle role.', 'error');
    }
  };

  // ----------------------------------------------------
  // Reservation Status Actions
  // ----------------------------------------------------
  const handleUpdateReservationStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert(`Reservation marked as ${newStatus}!`, 'success');
        fetchData();
      } else {
        triggerAlert(data.message || 'Failed to update reservation status.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Connection error, action failed.', 'error');
    }
  };

  // ----------------------------------------------------
  // Analytics Helpers (Overview tab)
  // ----------------------------------------------------
  const calculateOverviewMetrics = () => {
    // 1. Total revenue (from reservations that are 'paid')
    const totalRev = reservations
      .filter(r => r.paymentDetails?.status === 'paid')
      .reduce((sum, r) => sum + r.totalAmount, 0);

    // 2. Active occupancy rate for today
    // Total rooms capacity in hotel
    const totalCapacity = rooms.reduce((sum, r) => sum + r.available, 0); // using available as capacity

    const localToday = new Date();
    const year = localToday.getFullYear();
    const month = String(localToday.getMonth() + 1).padStart(2, '0');
    const day = String(localToday.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const occupiedToday = reservations
      .filter(r => r.paymentDetails?.status === 'paid' || r.paymentDetails?.status === 'pending')
      .filter(r => {
        const inStr = new Date(r.checkInDate).toISOString().split('T')[0];
        const outStr = new Date(r.checkOutDate).toISOString().split('T')[0];
        if (inStr === outStr) {
          return todayStr === inStr;
        }
        return todayStr >= inStr && todayStr < outStr;
      }).length;

    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedToday / totalCapacity) * 100) : 0;
    const availableRooms = Math.max(0, totalCapacity - occupiedToday);

    return {
      revenue: totalRev,
      bookings: reservations.length,
      occupancy: occupancyRate,
      available: availableRooms,
      totalCapacity
    };
  };

  const metrics = calculateOverviewMetrics();

  // Popular Room Types Count
  const getRoomPopularity = () => {
    const counts = {};
    // Seed counts
    rooms.forEach(r => {
      counts[r.id] = 0;
    });

    reservations.forEach(res => {
      if (counts[res.roomType] !== undefined) {
        counts[res.roomType]++;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    return rooms.map(r => ({
      name: r.name,
      count: counts[r.id] || 0,
      percentage: Math.round(((counts[r.id] || 0) / maxCount) * 100)
    })).sort((a, b) => b.count - a.count);
  };

  const popularityList = getRoomPopularity();

  // Generate SVG Line Chart Data points for last 7 days
  const getLineChartPoints = () => {
    const points = [];
    const days = [];
    const counts = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push(displayStr);

      const count = reservations.filter(res => {
        const createDate = new Date(res.createdAt).toISOString().split('T')[0];
        return createDate === dateStr;
      }).length;
      counts.push(count);
    }

    const maxCount = Math.max(...counts, 4); // default height scale at least 4 bookings
    const width = 500;
    const height = 180;
    const padding = 30;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xCoords = days.map((_, index) => padding + (index * chartWidth) / (days.length - 1));
    const yCoords = counts.map(count => height - padding - (count * chartHeight) / maxCount);

    let pathD = '';
    xCoords.forEach((x, index) => {
      const y = yCoords[index];
      if (index === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    // Filled area path
    let areaD = pathD;
    if (xCoords.length > 0) {
      areaD += ` L ${xCoords[xCoords.length - 1]} ${height - padding} L ${xCoords[0]} ${height - padding} Z`;
    }

    return {
      width,
      height,
      padding,
      days,
      counts,
      xCoords,
      yCoords,
      pathD,
      areaD
    };
  };

  const chartData = getLineChartPoints();

  // ----------------------------------------------------
  // List Filter Processors
  // ----------------------------------------------------
  const getFilteredReservations = () => {
    return reservations.filter(res => {
      // Search term
      const guestName = `${res.user?.firstName || ''} ${res.user?.lastName || ''}`.toLowerCase();
      const guestEmail = (res.user?.email || '').toLowerCase();
      const guestUsername = (res.user?.username || '').toLowerCase();
      const matchesSearch = 
        guestName.includes(reservationsSearch.toLowerCase()) || 
        guestEmail.includes(reservationsSearch.toLowerCase()) ||
        guestUsername.includes(reservationsSearch.toLowerCase()) ||
        res.roomType.toLowerCase().includes(reservationsSearch.toLowerCase());

      // Status
      const matchesStatus = 
        reservationsStatusFilter === 'all' || 
        res.paymentDetails?.status === reservationsStatusFilter;

      // Room Type
      const matchesRoom = 
        reservationsRoomFilter === 'all' || 
        res.roomType === reservationsRoomFilter;

      return matchesSearch && matchesStatus && matchesRoom;
    });
  };

  const filteredReservations = getFilteredReservations();

  const getFilteredUsers = () => {
    return users.filter(u => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return name.includes(usersSearch.toLowerCase()) || 
             email.includes(usersSearch.toLowerCase()) ||
             username.includes(usersSearch.toLowerCase());
    });
  };

  const filteredUsers = getFilteredUsers();

  return (
    <ThemeProvider theme={ogosTheme}>
      <div className="admin-dashboard-viewport">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-sidebar-top">
            <div className="admin-logo-wrapper">
              <img src={logoImg} alt="Hotel Ogos Logo" className="admin-logo-img" />
            </div>
            <h1 className="admin-brand-title">HOTEL OGOS</h1>
            <p className="admin-brand-tagline">"So Cozy... So Comfy!"</p>
            <span className="admin-badge">ADMIN CONSOLE</span>

            {/* Sidebar Navigation Options */}
            <div className="admin-sidebar-menu">
              <div 
                className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <DashboardIcon fontSize="small" />
                <span>Overview</span>
              </div>
              <div 
                className={`admin-menu-item ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => setActiveTab('reservations')}
              >
                <ReceiptIcon fontSize="small" />
                <span>Reservations</span>
              </div>
              <div 
                className={`admin-menu-item ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                <KingBedIcon fontSize="small" />
                <span>Room Inventory</span>
              </div>
              <div 
                className={`admin-menu-item ${activeTab === 'guests' ? 'active' : ''}`}
                onClick={() => setActiveTab('guests')}
              >
                <PeopleIcon fontSize="small" />
                <span>Guests Manager</span>
              </div>
            </div>
          </div>

          <div className="admin-sidebar-bottom">
            <div className="admin-user-profile">
              <div className="admin-user-avatar">
                {user ? user.firstName.charAt(0) : 'A'}
              </div>
              <div className="admin-user-info">
                <p className="admin-user-name">{adminName}</p>
                <p className="admin-user-role">System Admin</p>
              </div>
            </div>
            <button className="admin-logout-btn" onClick={onLogout}>
              <LogoutIcon fontSize="small" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="admin-content-area">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h2 className="admin-header-title">
                {activeTab === 'overview' && 'Overview & Analytics'}
                {activeTab === 'reservations' && 'Manage Reservations'}
                {activeTab === 'rooms' && 'Room Inventory & Pricing'}
                {activeTab === 'guests' && 'Registered Guests Directory'}
              </h2>
              <p className="admin-header-subtitle">
                {activeTab === 'overview' && 'Real-time performance metrics and booking stats.'}
                {activeTab === 'reservations' && 'Confirm, modify, or cancel system bookings.'}
                {activeTab === 'rooms' && 'Configure room specifications, rates, and upload graphics.'}
                {activeTab === 'guests' && 'Edit user profiles, adjust access levels, or delete accounts.'}
              </p>
            </div>
            <div className="admin-badge" style={{ margin: 0, padding: '6px 14px', fontSize: '11px', color: '#1a1a1a', backgroundColor: '#ffd700' }}>
              Bayombong, Nueva Vizcaya
            </div>
          </div>

          <Divider sx={{ mb: 4, borderColor: '#e5e4e7' }} />

          {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress sx={{ color: '#990000' }} />
            </Box>
          ) : (
            <>
              {/* ---------------------------------------------------- */}
              {/* TAB: OVERVIEW */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'overview' && (
                <div>
                  {/* Stats Grid */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-card-left">
                        <span className="stat-card-label">Total Revenue</span>
                        <h3 className="stat-card-value">₱{metrics.revenue.toLocaleString()}</h3>
                      </div>
                      <div className="stat-card-icon-wrapper">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>₱</Typography>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-card-left">
                        <span className="stat-card-label">Total Bookings</span>
                        <h3 className="stat-card-value">{metrics.bookings}</h3>
                      </div>
                      <div className="stat-card-icon-wrapper">
                        <ReceiptIcon />
                      </div>
                    </div>


                    <div className="stat-card gold-card">
                      <div className="stat-card-left">
                        <span className="stat-card-label">Rooms Available</span>
                        <h3 className="stat-card-value">{metrics.available} <span style={{ fontSize: '12px', color: '#666' }}>/ {metrics.totalCapacity}</span></h3>
                      </div>
                      <div className="stat-card-icon-wrapper">
                        <KingBedIcon />
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="analytics-section">
                    {/* Line Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <h4 className="chart-title">Daily Bookings (Last 7 Days)</h4>
                        <span className="admin-badge" style={{ margin: 0 }}>Trends</span>
                      </div>
                      <div className="svg-chart-container">
                        <svg width="100%" height="100%" viewBox={`0 0 ${chartData.width} ${chartData.height}`} preserveAspectRatio="xMidYMid meet">
                          <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#990000" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#990000" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1={chartData.padding} y1={chartData.padding} x2={chartData.padding} y2={chartData.height - chartData.padding} className="chart-axis-line" />
                          <line x1={chartData.padding} y1={chartData.height - chartData.padding} x2={chartData.width - chartData.padding} y2={chartData.height - chartData.padding} className="chart-axis-line" />

                          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                            const y = chartData.height - chartData.padding - ratio * (chartData.height - chartData.padding * 2);
                            return (
                              <line key={i} x1={chartData.padding} y1={y} x2={chartData.width - chartData.padding} y2={y} className="chart-grid-line" />
                            );
                          })}

                          {/* Line and Area */}
                          <path d={chartData.areaD} className="chart-area" />
                          <path d={chartData.pathD} className="chart-line" />

                          {/* Data Points */}
                          {chartData.xCoords.map((x, index) => {
                            const y = chartData.yCoords[index];
                            return (
                              <g key={index}>
                                <circle cx={x} cy={y} r="5" className="chart-point" />
                                <Tooltip title={`${chartData.counts[index]} bookings`} placement="top" arrow>
                                  <circle cx={x} cy={y} r="15" fill="transparent" style={{ cursor: 'pointer' }} />
                                </Tooltip>
                                <text x={x} y={chartData.height - 10} className="chart-label">
                                  {chartData.days[index]}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Popularity Card */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <h4 className="chart-title">Popular Room Types</h4>
                      </div>
                      <div className="popularity-list">
                        {popularityList.map((item, index) => (
                          <div key={index} className="popularity-item">
                            <div className="popularity-item-header">
                              <span className="popularity-item-name">{item.name}</span>
                              <span className="popularity-item-value">{item.count} bookings</span>
                            </div>
                            <div className="popularity-progress-bg">
                              <div 
                                className={`popularity-progress-fill ${index === 0 ? 'gold' : ''}`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Bookings Card */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h4 className="admin-card-title">Recent Booking Activities</h4>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                        onClick={() => setActiveTab('reservations')}
                        sx={{ fontFamily: "'Poppins', sans-serif", textTransform: 'none', fontWeight: 600 }}
                      >
                        View All Bookings
                      </Button>
                    </div>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e4e7', borderRadius: '8px' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell className="ogos-table-header">Guest</TableCell>
                            <TableCell className="ogos-table-header">Room Type</TableCell>
                            <TableCell className="ogos-table-header">Check In</TableCell>
                            <TableCell className="ogos-table-header">Duration</TableCell>
                            <TableCell className="ogos-table-header">Paid</TableCell>
                            <TableCell className="ogos-table-header" align="right">Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reservations.slice(0, 5).map((res) => (
                            <TableRow key={res._id} className="ogos-table-row">
                              <TableCell sx={{ fontWeight: 500 }}>
                                {res.user ? `${res.user.firstName} ${res.user.lastName}` : 'Guest'}
                              </TableCell>
                              <TableCell sx={{ textTransform: 'capitalize' }}>
                                <Typography sx={{ fontSize: '13.5px', fontWeight: 500 }}>
                                  {res.room?.name || res.roomType.replace('_', ' ')}
                                </Typography>
                                {res.roomNumber && (
                                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#990000', mt: 0.5 }}>
                                    Room {res.roomNumber}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                                  In: {new Date(res.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {formatTimeToAMPM(res.checkInTime)}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#990000', mt: 0.5 }}>
                                  Out: {getCheckoutDateTimeDisplay(res)}
                                </Typography>
                              </TableCell>
                              <TableCell>{res.hours} Hours</TableCell>
                              <TableCell>
                                <span className={`status-badge ${res.paymentDetails?.status || 'pending'}`}>
                                  {res.paymentDetails?.status || 'pending'}
                                </span>
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#990000' }}>
                                ₱{res.totalAmount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          {reservations.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#666' }}>
                                No recent reservations found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: RESERVATIONS */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'reservations' && (
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h4 className="admin-card-title">All Reservations List ({filteredReservations.length})</h4>
                    <div className="admin-card-actions">
                      {/* Search */}
                      <div className="search-field-wrapper">
                        <SearchIcon className="search-icon" fontSize="small" />
                        <input 
                          type="text" 
                          placeholder="Search guest or room..." 
                          className="search-input"
                          value={reservationsSearch}
                          onChange={(e) => setReservationsSearch(e.target.value)}
                        />
                      </div>

                      {/* Room Filter */}
                      <TextField
                        select
                        size="small"
                        value={reservationsRoomFilter}
                        onChange={(e) => setReservationsRoomFilter(e.target.value)}
                        sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                      >
                        <MenuItem value="all">All Rooms</MenuItem>
                        {rooms.map(room => (
                          <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                        ))}
                      </TextField>

                      {/* Status Filter */}
                      <TextField
                        select
                        size="small"
                        value={reservationsStatusFilter}
                        onChange={(e) => setReservationsStatusFilter(e.target.value)}
                        sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </TextField>
                    </div>
                  </div>

                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e4e7', borderRadius: '8px' }}>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell className="ogos-table-header">Guest Details</TableCell>
                          <TableCell className="ogos-table-header">Room Booked</TableCell>
                          <TableCell className="ogos-table-header">Stay Schedule</TableCell>
                          <TableCell className="ogos-table-header">Price Details</TableCell>
                          <TableCell className="ogos-table-header">Status</TableCell>
                          <TableCell className="ogos-table-header">Notes</TableCell>
                          <TableCell className="ogos-table-header" align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredReservations.map((res) => {
                          const userDetails = res.user || { firstName: 'Deleted', lastName: 'User', email: 'N/A', username: 'deleted' };
                          return (
                            <TableRow key={res._id} className="ogos-table-row">
                              <TableCell>
                                <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                                  {userDetails.firstName} {userDetails.lastName}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                  @{userDetails.username} | {userDetails.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 500, textTransform: 'capitalize', fontSize: '13.5px' }}>
                                  {res.room?.name || res.roomType.replace('_', ' ')}
                                </Typography>
                                {res.roomNumber && (
                                  <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#990000', mt: 0.5 }}>
                                    Room {res.roomNumber}
                                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 400, marginLeft: '6px' }}>
                                      (Floor {parseRoomNumber(res.roomNumber).floor}, Room {parseRoomNumber(res.roomNumber).room})
                                    </span>
                                  </Typography>
                                )}
                                <Typography sx={{ fontSize: '11px', color: '#888', mt: 0.5 }}>
                                  ID: {res.roomType}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                                  In: {new Date(res.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTimeToAMPM(res.checkInTime)}
                                </Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#990000', mt: 0.5 }}>
                                  Out: {getCheckoutDateTimeDisplay(res)}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#666', mt: 0.5 }}>
                                  Duration: {res.hours} Hours Stay
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 600, color: '#990000', fontSize: '14px' }}>
                                  ₱{res.totalAmount.toLocaleString()}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                  Method: Card
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const status = getReservationStatus(res);
                                  return (
                                    <span className={`status-badge ${status}`}>
                                      {status}
                                    </span>
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={{ maxWidth: '180px', wordBreak: 'break-word', fontSize: '12.5px', fontStyle: 'italic', color: '#555' }}>
                                {res.notes || '—'}
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  {res.paymentDetails?.status === 'pending' && (
                                    <Tooltip title="Mark as Paid">
                                      <IconButton 
                                        size="small" 
                                        color="success" 
                                        onClick={() => handleUpdateReservationStatus(res._id, 'paid')}
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {res.paymentDetails?.status !== 'cancelled' && (
                                    <Tooltip title="Cancel Booking">
                                      <IconButton 
                                        size="small" 
                                        color="primary" 
                                        onClick={() => handleUpdateReservationStatus(res._id, 'cancelled')}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {res.paymentDetails?.status === 'cancelled' && (
                                    <Tooltip title="Reactivate (Mark Pending)">
                                      <IconButton 
                                        size="small" 
                                        color="default" 
                                        onClick={() => handleUpdateReservationStatus(res._id, 'pending')}
                                      >
                                        <CheckCircleIcon fontSize="small" sx={{ color: '#888' }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredReservations.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#666' }}>
                              No matching reservations found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: ROOMS */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'rooms' && (
                <div>
                  <div className="admin-card" style={{ paddingBottom: '32px' }}>
                    <div className="admin-card-header">
                      <h4 className="admin-card-title">Hotel Room Inventory</h4>
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddRoom}
                        sx={{ fontFamily: "'Poppins', sans-serif", textTransform: 'none', fontWeight: 600 }}
                      >
                        Add Room Type
                      </Button>
                    </div>

                    <div className="room-grid">
                      {rooms.map((room) => {
                        const imageSrc = room.imageUrl || staticRoomImages[room.id] || roomPlaceholder;
                        return (
                          <div key={room.id} className="admin-room-card">
                            <div className="admin-room-image-wrapper">
                              <img src={imageSrc} alt={room.name} className="admin-room-img" />
                            </div>
                            <div className="admin-room-content">
                              <h5 className="admin-room-name">{room.name}</h5>
                              <p className="admin-room-desc">{room.description}</p>
                              
                              <div className="admin-room-rates">
                                <div>
                                  <span className="admin-room-rate-label">12 Hours Rate:</span>
                                </div>
                                <div>
                                  <span className="admin-room-rate-val">₱{room.rates[12]}</span>
                                </div>
                              </div>

                              <div className="admin-room-rates" style={{ borderTop: 'none', marginTop: '-12px' }}>
                                <div>
                                  <span className="admin-room-rate-label">24 Hours Rate:</span>
                                </div>
                                <div>
                                  <span className="admin-room-rate-val">₱{room.rates[24]}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #e5e4e7', paddingTop: '10px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                  <span style={{ color: '#666', fontFamily: "'Poppins', sans-serif" }}>Total Inventory:</span>
                                  <span style={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>{room.available} Units</span>
                                </div>
                                {room.roomNumbers && room.roomNumbers.length > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', alignItems: 'center' }}>
                                    <span style={{ color: '#666', fontFamily: "'Poppins', sans-serif" }}>Room Numbers:</span>
                                    <span style={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif", color: '#990000', wordBreak: 'break-all', textAlign: 'right', maxWidth: '65%' }}>
                                      {room.roomNumbers.join(', ')}
                                    </span>
                                  </div>
                                )}
                                {(() => {
                                  const stats = getLiveRoomStatuses(room, reservations);
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12.5px', fontFamily: "'Poppins', sans-serif" }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#555' }}>● Clean & Available:</span>
                                        <span style={{ fontWeight: 600, color: '#2e7d32' }}>{stats.available} Units</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#555' }}>● Occupied:</span>
                                        <span style={{ fontWeight: 600, color: '#d31027' }}>{stats.occupied} Units</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#555' }}>● Housekeeping (30m):</span>
                                        <span style={{ fontWeight: 600, color: '#b8860b' }}>{stats.housekeeping} Units</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="admin-room-actions">
                                <Button 
                                  variant="outlined" 
                                  color="primary" 
                                  size="small"
                                  startIcon={<EditIcon />}
                                  className="admin-room-btn"
                                  onClick={() => handleOpenEditRoom(room)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="error" 
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  className="admin-room-btn"
                                  onClick={() => handleOpenDeleteConfirm('room', room)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB: GUESTS */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'guests' && (
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h4 className="admin-card-title">Registered Guests Accounts ({filteredUsers.length})</h4>
                    <div className="admin-card-actions">
                      <div className="search-field-wrapper">
                        <SearchIcon className="search-icon" fontSize="small" />
                        <input 
                          type="text" 
                          placeholder="Search name, username, email..." 
                          className="search-input"
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e4e7', borderRadius: '8px' }}>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell className="ogos-table-header">Guest Name</TableCell>
                          <TableCell className="ogos-table-header">Username</TableCell>
                          <TableCell className="ogos-table-header">Email Address</TableCell>
                          <TableCell className="ogos-table-header">Account Role</TableCell>
                          <TableCell className="ogos-table-header">Created At</TableCell>
                          <TableCell className="ogos-table-header" align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u._id} className="ogos-table-row">
                            <TableCell sx={{ fontWeight: 600 }}>
                              {u.firstName} {u.lastName}
                              {u._id === user?.id && ' (You)'}
                            </TableCell>
                            <TableCell>@{u.username}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Switch
                                  size="small"
                                  checked={u.role === 'admin'}
                                  onChange={() => handleToggleUserRole(u)}
                                  disabled={u._id === user?.id} // Don't allow demoting yourself
                                  color="primary"
                                />
                                <span style={{ 
                                  fontSize: '12px', 
                                  fontWeight: u.role === 'admin' ? 600 : 400,
                                  color: u.role === 'admin' ? '#990000' : '#666'
                                }}>
                                  {u.role === 'admin' ? 'Admin' : 'Guest'}
                                </span>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <Tooltip title="Edit Profile Details">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenEditUser(u)}
                                    color="default"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Account">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenDeleteConfirm('user', u)}
                                    color="error"
                                    disabled={u._id === user?.id} // Can't delete self
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#666' }}>
                              No registered accounts found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODAL: ADD / EDIT ROOM */}
        {/* ---------------------------------------------------- */}
        <Dialog 
          open={openRoomModal} 
          onClose={() => setOpenRoomModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '12px' } }}
        >
          <form onSubmit={handleSaveRoom}>
            <DialogTitle className="ogos-dialog-title">
              {isEditingRoom ? 'Modify Room Properties' : 'Create New Room Type'}
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2, pt: 1 }}>
              {!isEditingRoom && (
                <FormField
                  label="Room ID (Unique String)"
                  value={roomFormData.roomId}
                  onChange={(e) => setRoomFormData(prev => ({ ...prev, roomId: e.target.value }))}
                  disabled={isEditingRoom}
                  required
                  helperText="e.g. deluxe, premium, regency_suite (lowercase, no spaces)"
                  placeholder="deluxe"
                />
              )}
              <FormField
                label="Room Display Name"
                value={roomFormData.name}
                onChange={(e) => setRoomFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Deluxe Room"
              />

              <Box sx={{ display: 'flex', gap: '20px' }}>
                <FormField
                  label="12 Hours Rate (₱)"
                  type="number"
                  value={roomFormData.baseRate12}
                  onChange={(e) => setRoomFormData(prev => ({ ...prev, baseRate12: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
                <FormField
                  label="24 Hours Rate (₱)"
                  type="number"
                  value={roomFormData.baseRate24}
                  onChange={(e) => setRoomFormData(prev => ({ ...prev, baseRate24: e.target.value }))}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
              </Box>

              <FormField
                label="Room Numbers (Comma Separated)"
                value={roomFormData.roomNumbers || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const count = val.split(',').map(n => n.trim()).filter(Boolean).length;
                  setRoomFormData(prev => ({ 
                    ...prev, 
                    roomNumbers: val,
                    totalRooms: count > 0 ? String(count) : prev.totalRooms
                  }));
                }}
                helperText="e.g. 101, 102, 103. The count of room numbers will automatically update the Total Rooms Capacity."
                placeholder="101, 102, 103"
              />

              <FormField
                label="Total Rooms Capacity"
                type="number"
                value={roomFormData.totalRooms}
                onChange={(e) => setRoomFormData(prev => ({ ...prev, totalRooms: e.target.value }))}
                required
                helperText="Number of physical rooms of this type in stock."
              />

              <FormField
                label="Room Description"
                multiline
                rows={3}
                value={roomFormData.description}
                onChange={(e) => setRoomFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe features, bed sizes, visual layout, amenities..."
              />

              {/* Upload Base64 Image */}
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                Room Cover Graphic
              </Typography>
              {roomFormData.imageUrl ? (
                <div className="upload-preview-wrapper">
                  <img src={roomFormData.imageUrl} alt="Room Upload Preview" className="upload-preview-img" />
                  <IconButton 
                    size="small" 
                    className="remove-upload-btn"
                    onClick={handleRemoveImage}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </div>
              ) : (
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <div className="image-upload-zone">
                    <CloudUploadIcon sx={{ fontSize: '32px', color: '#990000', mb: 1 }} />
                    <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: '#990000' }}>
                      Click to Upload Image File
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#666', mt: 0.5 }}>
                      PNG, JPG, JPEG up to 2MB (Converted to Base64)
                    </Typography>
                  </div>
                </label>
              )}
            </DialogContent>

            <DialogActions className="ogos-dialog-actions">
              <Button 
                onClick={() => setOpenRoomModal(false)}
                sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: '#666' }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
              >
                Save Room
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* ---------------------------------------------------- */}
        {/* MODAL: EDIT USER PROFILE */}
        {/* ---------------------------------------------------- */}
        <Dialog 
          open={openUserModal} 
          onClose={() => setOpenUserModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '12px' } }}
        >
          <form onSubmit={handleSaveUser}>
            <DialogTitle className="ogos-dialog-title">
              Edit Guest Account Profile
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: '16px' }}>
                <FormField
                  label="First Name"
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <FormField
                  label="Last Name"
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Box>

              <FormField
                label="Username"
                value={userFormData.username}
                onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">@</InputAdornment>,
                }}
              />

              <FormField
                label="Email Address"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </DialogContent>

            <DialogActions className="ogos-dialog-actions">
              <Button 
                onClick={() => setOpenUserModal(false)}
                sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: '#666' }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
              >
                Save Details
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* ---------------------------------------------------- */}
        {/* DIALOG: CONFIRM DELETE */}
        {/* ---------------------------------------------------- */}
        <Dialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          PaperProps={{ sx: { borderRadius: '12px' } }}
        >
          <DialogTitle className="ogos-dialog-title" style={{ color: '#d31027' }}>
            Confirm Deletion Action
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText sx={{ fontFamily: "'Poppins', sans-serif", color: '#1a1a1a' }}>
              Are you absolutely sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? 
              This action is destructive and cannot be undone. 
              {deleteTarget?.type === 'room' && " Any reservations associated with this room must be completed or cancelled first."}
              {deleteTarget?.type === 'user' && " Any active user sessions or settings for this user will be cleared."}
            </DialogContentText>
          </DialogContent>
          <DialogActions className="ogos-dialog-actions">
            <Button 
              onClick={() => setOpenDeleteConfirm(false)}
              sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: '#666' }}
            >
              No, Keep
            </Button>
            <Button 
              onClick={handleDeleteExecute}
              variant="contained"
              color="error"
              sx={{ textTransform: 'none', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
            >
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification Alerts */}
        <Snackbar 
          open={alert.open} 
          autoHideDuration={4000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={alert.severity} 
            variant="filled" 
            sx={{ width: '100%', fontFamily: "'Poppins', sans-serif", borderRadius: '8px' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}
