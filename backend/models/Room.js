const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: [true, 'Room ID is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  baseRate12: {
    type: Number,
    required: [true, '12 hours rate is required']
  },
  baseRate24: {
    type: Number,
    required: [true, '24 hours rate is required']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms capacity is required'],
    default: 1
  },
  roomNumbers: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  }
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
