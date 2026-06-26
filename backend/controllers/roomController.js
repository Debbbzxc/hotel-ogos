const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

/**
 * Helper to generate an array of YYYY-MM-DD date strings for a stay.
 * Uses UTC date calculations to avoid timezone shifts.
 */
function getNights(checkInStr, checkOutStr) {
  const nights = [];
  const start = new Date(`${checkInStr}T00:00:00.000Z`);
  const end = new Date(`${checkOutStr}T00:00:00.000Z`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  if (checkInStr === checkOutStr) {
    nights.push(checkInStr);
  } else {
    const current = new Date(start);
    while (current < end) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, '0');
      const day = String(current.getUTCDate()).padStart(2, '0');
      nights.push(`${year}-${month}-${day}`);
      current.setUTCDate(current.getUTCDate() + 1);
    }
  }
  return nights;
}

/**
 * @desc    Get all rooms (calculates real-time availability if dates are provided)
 * @route   GET /api/rooms
 * @access  Public
 */
const getAllRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    const rooms = await Room.find({});

    // If dates are not provided, return rooms with default availability
    if (!checkInDate || !checkOutDate) {
      const result = rooms.map(room => ({
        id: room.roomId,
        name: room.name,
        rates: { 12: room.baseRate12, 24: room.baseRate24 },
        available: room.totalRooms,
        description: room.description,
        imageUrl: room.imageUrl
      }));
      return res.json({ success: true, rooms: result });
    }

    const queryNights = getNights(checkInDate, checkOutDate);
    if (queryNights.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date format.' });
    }

    // Fetch all active reservations
    const activeReservations = await Reservation.find({
      paymentDetails: { $exists: true },
      'paymentDetails.status': { $in: ['paid', 'pending'] }
    });

    const result = rooms.map(room => {
      // Find active reservations for this room type
      const roomReservations = activeReservations.filter(
        res => res.roomType === room.roomId
      );

      // Calculate max occupied rooms on any night during the query stay
      let maxOccupied = 0;
      for (const night of queryNights) {
        let occupiedOnNight = 0;
        for (const res of roomReservations) {
          const resInStr = res.checkInDate.toISOString().split('T')[0];
          const resOutStr = res.checkOutDate.toISOString().split('T')[0];
          const resNights = getNights(resInStr, resOutStr);

          if (resNights.includes(night)) {
            occupiedOnNight++;
          }
        }
        if (occupiedOnNight > maxOccupied) {
          maxOccupied = occupiedOnNight;
        }
      }

      const availableCount = Math.max(0, room.totalRooms - maxOccupied);

      return {
        id: room.roomId,
        name: room.name,
        rates: { 12: room.baseRate12, 24: room.baseRate24 },
        available: availableCount,
        description: room.description,
        imageUrl: room.imageUrl
      };
    });

    return res.json({ success: true, rooms: result });
  } catch (error) {
    console.error('Get rooms error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new room type (Admin only)
 * @route   POST /api/rooms
 * @access  Private/Admin
 */
const createRoom = async (req, res) => {
  try {
    const { roomId, name, baseRate12, baseRate24, totalRooms, description, imageUrl } = req.body;

    if (!roomId || !name || !baseRate12 || !baseRate24 || !totalRooms) {
      return res.status(400).json({ success: false, message: 'Please provide all required room fields.' });
    }

    const roomExists = await Room.findOne({ roomId: roomId.toLowerCase() });
    if (roomExists) {
      return res.status(400).json({ success: false, message: 'Room type with this ID already exists.' });
    }

    const room = await Room.create({
      roomId: roomId.toLowerCase(),
      name,
      baseRate12,
      baseRate24,
      totalRooms,
      description,
      imageUrl
    });

    return res.status(201).json({ success: true, room });
  } catch (error) {
    console.error('Create room error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRooms,
  createRoom,
  getNights // Export for reuse in booking validation
};
