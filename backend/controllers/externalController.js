const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');


const getSummary = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    
    const roomsResult = await Room.aggregate([
      { $group: { _id: null, total: { $sum: '$totalRooms' } } }
    ]);
    const totalRooms = roomsResult[0]?.total || 0;

    const uniqueGuests = await Reservation.distinct('user');
    const totalGuests = uniqueGuests.length;

    const revenueResult = await Reservation.aggregate([
      { $match: { 'paymentDetails.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const paid = await Reservation.countDocuments({ 'paymentDetails.status': 'paid' });
    const pending = await Reservation.countDocuments({ 'paymentDetails.status': 'pending' });
    const cancelled = await Reservation.countDocuments({ 'paymentDetails.status': 'cancelled' });

    const topRooms = await Reservation.aggregate([
      { $group: { _id: '$roomType', totalReservations: { $sum: 1 } } },
      { $sort: { totalReservations: -1 } },
      { $limit: 3 }
    ]);
    const topRoomTypes = topRooms.map(r => ({ name: r._id, totalReservations: r.totalReservations }));

    res.json({
      success: true,
      data: {
        totalReservations,
        totalRooms,
        totalGuests,
        totalRevenue,
        reservationsByStatus: {
          paid,
          pending,
          cancelled
        },
        topRoomTypes
      }
    });
  } catch (error) {
    console.error('Error fetching external summary:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const transactions = reservations.map(r => ({
      _id: r._id,
      status: r.paymentDetails ? r.paymentDetails.status : 'pending',
      timestamp: r.createdAt,
      createdAt: r.createdAt,
      type: 'reservation',
      amount: r.totalAmount,
      guestName: r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown Guest',
      guestEmail: r.user ? r.user.email : 'unknown@example.com',
      roomType: r.roomType,
      checkInDate: r.checkInDate,
      checkOutDate: r.checkOutDate,
      hours: r.hours
    }));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching external transactions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getSummary,
  getTransactions
};
