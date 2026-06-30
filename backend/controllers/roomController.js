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
    const { checkInDate, checkOutDate, checkInTime, checkOutTime } = req.query;
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

    // Fetch all active reservations
    const activeReservations = await Reservation.find({
      'paymentDetails.status': { $in: ['paid', 'pending'] }
    });

    // Check if we have precise times for time-interval overlap validation
    if (checkInTime && checkOutTime) {
      const [ciYear, ciMonth, ciDay] = checkInDate.split('-').map(Number);
      const [ciHour, ciMin] = checkInTime.split(':').map(Number);
      const queryStart = new Date(ciYear, ciMonth - 1, ciDay, ciHour, ciMin, 0);

      const [coYear, coMonth, coDay] = checkOutDate.split('-').map(Number);
      const [coHour, coMin] = checkOutTime.split(':').map(Number);
      const queryEnd = new Date(coYear, coMonth - 1, coDay, coHour, coMin, 0);

      if (isNaN(queryStart.getTime()) || isNaN(queryEnd.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid query stay check-in/out datetime.' });
      }

      const result = rooms.map(room => {
        // Find active reservations for this room type
        const roomReservations = activeReservations.filter(
          res => res.roomType === room.roomId
        );

        let occupiedCount = 0;
        for (const res of roomReservations) {
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

          // Interval overlap formula
          const overlap = queryStart < resHousekeepingEnd && resStart < queryEnd;
          if (overlap) {
            occupiedCount++;
          }
        }

        const availableCount = Math.max(0, room.totalRooms - occupiedCount);

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
    }

    // Fallback: Date-only nights-based overlap (backward compatibility)
    const queryNights = getNights(checkInDate, checkOutDate);
    if (queryNights.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date format.' });
    }

    const result = rooms.map(room => {
      const roomReservations = activeReservations.filter(
        res => res.roomType === room.roomId
      );

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

/**
 * @desc    Update a room type (Admin only)
 * @route   PUT /api/rooms/:roomId
 * @access  Private/Admin
 */
const updateRoom = async (req, res) => {
  try {
    const { name, baseRate12, baseRate24, totalRooms, description, imageUrl } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId.toLowerCase() });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    if (name) room.name = name;
    if (baseRate12 !== undefined) room.baseRate12 = baseRate12;
    if (baseRate24 !== undefined) room.baseRate24 = baseRate24;
    if (totalRooms !== undefined) room.totalRooms = totalRooms;
    if (description !== undefined) room.description = description;
    if (imageUrl !== undefined) room.imageUrl = imageUrl;

    await room.save();
    return res.json({ success: true, message: 'Room type updated successfully', room });
  } catch (error) {
    console.error('Update room error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a room type (Admin only)
 * @route   DELETE /api/rooms/:roomId
 * @access  Private/Admin
 */
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId.toLowerCase() });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    // Check for active reservations
    const activeReservation = await Reservation.findOne({
      roomType: room.roomId,
      'paymentDetails.status': { $in: ['paid', 'pending'] }
    });
    if (activeReservation) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room type. There are active reservations associated with it.'
      });
    }

    await Room.findOneAndDelete({ roomId: room.roomId });
    return res.json({ success: true, message: 'Room type deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getNights // Export for reuse in booking validation
};
