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

    // 4. Overbooking prevention check
    const queryNights = getNights(checkInDate, checkOutDate);
    const activeReservations = await Reservation.find({
      roomType: selectedRoom,
      'paymentDetails.status': { $in: ['paid', 'pending'] }
    });

    let maxOccupied = 0;
    for (const night of queryNights) {
      let occupiedOnNight = 0;
      for (const resDoc of activeReservations) {
        const resInStr = resDoc.checkInDate.toISOString().split('T')[0];
        const resOutStr = resDoc.checkOutDate.toISOString().split('T')[0];
        const resNights = getNights(resInStr, resOutStr);

        if (resNights.includes(night)) {
          occupiedOnNight++;
        }
      }
      if (occupiedOnNight > maxOccupied) {
        maxOccupied = occupiedOnNight;
      }
    }

    const availableCount = room.totalRooms - maxOccupied;
    if (availableCount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sorry, ${room.name} is fully booked for the selected dates (${checkInDate} to ${checkOutDate}).`
      });
    }

    // 5. Mask card number (only save last 4 digits for security compliance)
    const rawCard = paymentDetails.cardNumber.replace(/\s/g, '');
    const last4 = rawCard.slice(-4);

    // 6. Create reservation document
    const reservation = new Reservation({
      user: req.user._id,
      roomType: selectedRoom,
      room: room._id,
      checkInDate: new Date(`${checkInDate}T00:00:00.000Z`),
      checkOutDate: new Date(`${checkOutDate}T00:00:00.000Z`),
      checkInTime,
      hours: Number(hours),
      notes: validatedData.notes,
      totalAmount: validatedData.totalAmount,
      paymentDetails: {
        cardName: paymentDetails.cardName,
        cardNumberLast4: last4,
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

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations
};
