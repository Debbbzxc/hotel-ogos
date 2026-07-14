require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const externalRoutes = require('./routes/externalRoutes');
const utilityRoutes = require('./routes/utilityRoutes');

const app = express();


connectDB();


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/utility-bills', utilityRoutes);



app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hotel Ogos API is running.' });
});


app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});


app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
