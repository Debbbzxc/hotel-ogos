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
        imageUrl: room.imageUrl,
        roomNumbers: room.roomNumbers
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
          imageUrl: room.imageUrl,
          roomNumbers: room.roomNumbers
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
        imageUrl: room.imageUrl,
        roomNumbers: room.roomNumbers
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
    const { roomId, name, baseRate12, baseRate24, totalRooms, description, imageUrl, roomNumbers } = req.body;

    if (!roomId || !name || !baseRate12 || !baseRate24 || !totalRooms) {
      return res.status(400).json({ success: false, message: 'Please provide all required room fields.' });
    }

    const roomExists = await Room.findOne({ roomId: roomId.toLowerCase() });
    if (roomExists) {
      return res.status(400).json({ success: false, message: 'Room type with this ID already exists.' });
    }

    let parsedRoomNumbers = [];
    if (Array.isArray(roomNumbers)) {
      parsedRoomNumbers = roomNumbers.map(n => n.trim()).filter(Boolean);
    } else if (typeof roomNumbers === 'string') {
      parsedRoomNumbers = roomNumbers.split(',').map(n => n.trim()).filter(Boolean);
    }

    const capacity = parsedRoomNumbers.length > 0 ? parsedRoomNumbers.length : Number(totalRooms);
    
    // Auto-generate room numbers if none provided
    if (parsedRoomNumbers.length === 0 && capacity > 0) {
      for (let i = 1; i <= capacity; i++) {
        parsedRoomNumbers.push(`1${String(i).padStart(2, '0')}`);
      }
    }

    // 1. Self duplicates check
    const uniqueNumbers = [...new Set(parsedRoomNumbers)];
    if (uniqueNumbers.length !== parsedRoomNumbers.length) {
      return res.status(400).json({ success: false, message: 'Duplicate room numbers are not allowed within the same room.' });
    }

    // 2. Database duplicates check
    const duplicateRooms = await Room.find({
      roomNumbers: { $in: parsedRoomNumbers }
    });
    if (duplicateRooms.length > 0) {
      const duplicates = [];
      for (const dupRoom of duplicateRooms) {
        const overlappingNumbers = dupRoom.roomNumbers.filter(n => parsedRoomNumbers.includes(n));
        duplicates.push({
          name: dupRoom.name,
          roomId: dupRoom.roomId,
          numbers: overlappingNumbers
        });
      }
      const msg = duplicates.map(d => `Room number(s) ${d.numbers.join(', ')} already in use by ${d.name} (${d.roomId})`).join('; ');
      return res.status(400).json({ success: false, message: msg });
    }

    const room = await Room.create({
      roomId: roomId.toLowerCase(),
      name,
      baseRate12,
      baseRate24,
      totalRooms: capacity,
      roomNumbers: parsedRoomNumbers,
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
    const { name, baseRate12, baseRate24, totalRooms, description, imageUrl, roomNumbers } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId.toLowerCase() });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    let targetRoomNumbers = [...room.roomNumbers];
    let targetTotalRooms = room.totalRooms;

    if (roomNumbers !== undefined) {
      let parsedRoomNumbers = [];
      if (Array.isArray(roomNumbers)) {
        parsedRoomNumbers = roomNumbers.map(n => n.trim()).filter(Boolean);
      } else if (typeof roomNumbers === 'string') {
        parsedRoomNumbers = roomNumbers.split(',').map(n => n.trim()).filter(Boolean);
      }
      targetRoomNumbers = parsedRoomNumbers;
      targetTotalRooms = parsedRoomNumbers.length;
    } else if (totalRooms !== undefined) {
      targetTotalRooms = Number(totalRooms);
      // Adjust roomNumbers array length if it doesn't match totalRooms
      if (targetRoomNumbers.length !== targetTotalRooms) {
        const diff = targetTotalRooms - targetRoomNumbers.length;
        if (diff > 0) {
          const startNum = targetRoomNumbers.length > 0 ? (Math.max(...targetRoomNumbers.map(n => parseInt(n.replace(/\D/g, '')) || 0)) + 1) : 101;
          for (let i = 0; i < diff; i++) {
            targetRoomNumbers.push(String(startNum + i));
          }
        } else {
          targetRoomNumbers = targetRoomNumbers.slice(0, targetTotalRooms);
        }
      }
    }

    // 1. Self duplicates check
    const uniqueNumbers = [...new Set(targetRoomNumbers)];
    if (uniqueNumbers.length !== targetRoomNumbers.length) {
      return res.status(400).json({ success: false, message: 'Duplicate room numbers are not allowed within the same room.' });
    }

    // 2. Database duplicates check (excluding current room)
    const duplicateRooms = await Room.find({
      roomId: { $ne: req.params.roomId.toLowerCase() },
      roomNumbers: { $in: targetRoomNumbers }
    });
    if (duplicateRooms.length > 0) {
      const duplicates = [];
      for (const dupRoom of duplicateRooms) {
        const overlappingNumbers = dupRoom.roomNumbers.filter(n => targetRoomNumbers.includes(n));
        duplicates.push({
          name: dupRoom.name,
          roomId: dupRoom.roomId,
          numbers: overlappingNumbers
        });
      }
      const msg = duplicates.map(d => `Room number(s) ${d.numbers.join(', ')} already in use by ${d.name} (${d.roomId})`).join('; ');
      return res.status(400).json({ success: false, message: msg });
    }

    // Apply updates if valid
    if (name) room.name = name;
    if (baseRate12 !== undefined) room.baseRate12 = baseRate12;
    if (baseRate24 !== undefined) room.baseRate24 = baseRate24;
    if (description !== undefined) room.description = description;
    if (imageUrl !== undefined) room.imageUrl = imageUrl;
    room.roomNumbers = targetRoomNumbers;
    room.totalRooms = targetTotalRooms;

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
