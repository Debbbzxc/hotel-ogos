const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { validateReservation } = require('../utils/validateReservation');

// Import getNights helper for database overlap calculations
const { getNights } = require('./roomController');

/**
 * @desc    Create a new reservation (with price forgery and real-time inventory checks)
 * @route   POST /api/reservations
 * @access  Private
 */
const createReservation = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      checkInTime,
      selectedRoom,
      hours,
      notes,
      totalAmount, // clientTotalAmount
      paymentDetails
    } = req.body;

    // 1. Validate card fields exist in request
    if (!paymentDetails || !paymentDetails.cardName || !paymentDetails.cardNumber) {
      return res.status(400).json({ success: false, message: 'Card payment details are required.' });
    }

    // 2. Perform price recalculation, date validation, and notes sanitization
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

    // 3. Find Room in database to check base properties and capacity
    const room = await Room.findOne({ roomId: selectedRoom });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Selected room type does not exist in the database.' });
    }

    // 4. Overbooking prevention check and occupied room tracking
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
      const resHousekeepingEnd = new Date(resEnd.getTime() + 30 * 60 * 1000); // 30-minute buffer

      // Check overlap
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

    // Assign a room number
    let assignedRoomNumber = '';
    if (room.roomNumbers && room.roomNumbers.length > 0) {
      for (const num of room.roomNumbers) {
        if (!occupiedRoomNumbers.has(num)) {
          assignedRoomNumber = num;
          break;
        }
      }
    }

    // Fallback if roomNumbers array is empty or somehow all match
    if (!assignedRoomNumber) {
      if (room.roomNumbers && room.roomNumbers.length > 0) {
        assignedRoomNumber = room.roomNumbers[0];
      } else {
        assignedRoomNumber = 'TBD';
      }
    }

    // 5. Calculate checkout time string (24h format, e.g. "14:30")
    const [hour, minute] = checkInTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + Number(hours) * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    const computedCheckOutTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // 6. Create reservation document
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
        status: 'paid',
        paidAt: new Date()
      }
    });

    const savedReservation = await reservation.save();

    return res.status(201).json({
      success: true,
      message: 'Reservation created and paid successfully.',
      reservation: savedReservation
    });
  } catch (error) {
    console.error('Create reservation error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current user's reservations list
 * @route   GET /api/reservations/my-reservations
 * @access  Private
 */
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 }); // Newest bookings first

    return res.json({ success: true, reservations });
  } catch (error) {
    console.error('Get my reservations error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all reservations list (Admin only)
 * @route   GET /api/reservations
 * @access  Private/Admin
 */
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

/**
 * @desc    Update reservation status (Admin only)
 * @route   PUT /api/reservations/:id/status
 * @access  Private/Admin
 */
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
    await reservation.save();

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

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus
};
