const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { validateReservation } = require('../utils/validateReservation');
const notifyAdmin = require('../utils/notifyAdmin');

const { getNights } = require('./roomController');


const createReservation = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      checkInTime,
      selectedRoom,
      hours,
      notes,
      totalAmount, 
      paymentDetails
    } = req.body;

    const status = paymentDetails?.status || 'paid';

    if (status === 'paid') {
      if (!paymentDetails || !paymentDetails.cardName || !paymentDetails.cardNumber) {
        return res.status(400).json({ success: false, message: 'Card payment details are required.' });
      }
    }

    
    let validatedData;
    try {
      validatedData = validateReservation({
        checkInDate,
        checkOutDate,
        checkInTime,
        selectedRoom,
        hours,
        notes,
        clientTotalAmount: totalAmount
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    
    const room = await Room.findOne({ roomId: selectedRoom });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Selected room type does not exist in the database.' });
    }

    
    const [ciYear, ciMonth, ciDay] = checkInDate.split('-').map(Number);
    const [ciHour, ciMin] = checkInTime.split(':').map(Number);
    const queryStart = new Date(ciYear, ciMonth - 1, ciDay, ciHour, ciMin, 0);
    const queryEnd = new Date(queryStart.getTime() + Number(hours) * 60 * 60 * 1000);

    const activeReservations = await Reservation.find({
      roomType: selectedRoom,
      'paymentDetails.status': { $in: ['paid', 'pending'] }
    });

    let occupiedCount = 0;
    const occupiedRoomNumbers = new Set();
    for (const res of activeReservations) {
      const resCiDate = new Date(res.checkInDate);
      const [resCiHour, resCiMin] = res.checkInTime.split(':').map(Number);
      const resStart = new Date(
        resCiDate.getUTCFullYear(),
        resCiDate.getUTCMonth(),
        resCiDate.getUTCDate(),
        resCiHour,
        resCiMin,
        0
      );
      const resEnd = new Date(resStart.getTime() + res.hours * 60 * 60 * 1000);
      const resHousekeepingEnd = new Date(resEnd.getTime() + 30 * 60 * 1000); 

      
      const overlap = queryStart < resHousekeepingEnd && resStart < queryEnd;
      if (overlap) {
        occupiedCount++;
        if (res.roomNumber) {
          occupiedRoomNumbers.add(res.roomNumber);
        }
      }
    }

    const availableCount = room.totalRooms - occupiedCount;
    if (availableCount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sorry, ${room.name} is fully booked for the selected stay period (including housekeeping cleaning buffer).`
      });
    }

    
    let assignedRoomNumber = '';
    if (room.roomNumbers && room.roomNumbers.length > 0) {
      for (const num of room.roomNumbers) {
        if (!occupiedRoomNumbers.has(num)) {
          assignedRoomNumber = num;
          break;
        }
      }
    }

    
    if (!assignedRoomNumber) {
      if (room.roomNumbers && room.roomNumbers.length > 0) {
        assignedRoomNumber = room.roomNumbers[0];
      } else {
        assignedRoomNumber = 'TBD';
      }
    }

    
    const [hour, minute] = checkInTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + Number(hours) * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    const computedCheckOutTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    
    const reservation = new Reservation({
      user: req.user._id,
      roomType: selectedRoom,
      room: room._id,
      checkInDate: new Date(`${checkInDate}T00:00:00.000Z`),
      checkOutDate: new Date(`${checkOutDate}T00:00:00.000Z`),
      checkInTime,
      checkOutTime: computedCheckOutTime,
      hours: Number(hours),
      notes: validatedData.notes,
      totalAmount: validatedData.totalAmount,
      roomNumber: assignedRoomNumber,
      paymentDetails: {
        status: status,
        paidAt: status === 'paid' ? new Date() : null
      }
    });

    const savedReservation = await reservation.save();

    // Notify admin system to refresh data
    notifyAdmin();

    return res.status(201).json({
      success: true,
      message: status === 'paid' ? 'Reservation created and paid successfully.' : 'Reservation created successfully (Pending payment).',
      reservation: savedReservation
    });
  } catch (error) {
    console.error('Create reservation error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 }); 

    return res.json({ success: true, reservations });
  } catch (error) {
    console.error('Get my reservations error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('user', 'firstName lastName username email')
      .populate('room')
      .sort({ createdAt: -1 });

    return res.json({ success: true, reservations });
  } catch (error) {
    console.error('Get all reservations error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['paid', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.paymentDetails.status = status;
    if (status === 'paid') {
      reservation.paymentDetails.paidAt = new Date();
    }
    await reservation.save();

    // Notify admin system to refresh data
    notifyAdmin();

    return res.json({
      success: true,
      message: `Reservation status updated to ${status} successfully.`,
      reservation
    });
  } catch (error) {
    console.error('Update reservation status error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const payReservation = async (req, res) => {
  try {
    const { paymentDetails } = req.body;
    if (!paymentDetails || !paymentDetails.cardName || !paymentDetails.cardNumber) {
      return res.status(400).json({ success: false, message: 'Card payment details are required.' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to pay for this reservation.' });
    }

    if (reservation.paymentDetails.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Reservation is already paid.' });
    }

    if (reservation.paymentDetails.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot pay for a cancelled reservation.' });
    }

    reservation.paymentDetails.status = 'paid';
    reservation.paymentDetails.paidAt = new Date();
    await reservation.save();

    // Notify admin system to refresh data
    notifyAdmin();

    return res.json({
      success: true,
      message: 'Reservation paid successfully.',
      reservation
    });
  } catch (error) {
    console.error('Pay reservation error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this reservation.' });
    }

    if (reservation.paymentDetails.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending reservations can be cancelled.' });
    }

    reservation.paymentDetails.status = 'cancelled';
    await reservation.save();

    // Notify admin system to refresh data
    notifyAdmin();

    return res.json({
      success: true,
      message: 'Reservation cancelled successfully.',
      reservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  payReservation,
  cancelReservation
};
