const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  roomType: {
    type: String,
    required: [true, 'Room Type string identifier is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required']
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  checkInTime: {
    type: String,
    required: [true, 'Check-in time is required']
  },
  checkOutTime: {
    type: String,
    required: [true, 'Check-out time is required']
  },
  hours: {
    type: Number,
    required: [true, 'Stay hours duration is required']
  },
  notes: {
    type: String,
    default: '',
    maxLength: 500
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  roomNumber: {
    type: String,
    trim: true
  },
  paymentDetails: {
    status: {
      type: String,
      enum: ['paid', 'pending', 'cancelled'],
      default: 'paid'
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for query speed optimization (Normalization & Optimization)
reservationSchema.index({ user: 1 });
reservationSchema.index({ roomType: 1, 'paymentDetails.status': 1 });
reservationSchema.index({ checkInDate: 1, checkOutDate: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
