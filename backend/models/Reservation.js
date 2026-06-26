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
  hours: {
    type: Number,
    required: [true, 'Stay hours duration is required'],
    enum: [12, 24]
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
  paymentDetails: {
    cardName: {
      type: String,
      required: [true, 'Cardholder name is required']
    },
    cardNumberLast4: {
      type: String,
      required: [true, 'Last 4 digits of card number are required']
    },
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

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
