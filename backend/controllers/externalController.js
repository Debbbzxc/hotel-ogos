const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');
const mongoose = require('mongoose');
const notifyAdmin = require('../utils/notifyAdmin');


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

const externalReservation = async (req, res) => {
  try {
    const {
      userId,
      checkInDate,
      checkOutDate,
      checkInTime,
      selectedRoom,
      hours,
      notes,
      totalAmount,
      paymentDetails,
    } = req.body;

    const status = paymentDetails?.status || "pending";

    if (
      !userId ||
      !selectedRoom ||
      !checkInDate ||
      !checkOutDate ||
      !checkInTime ||
      !hours ||
      !totalAmount
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Security Check: Verify userId format to prevent DB cast errors
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId format" });
    }

    const room = await Room.findOne({ roomId: selectedRoom });
    if (!room) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Selected room type does not exist in the database.",
        });
    }

    const [ciYear, ciMonth, ciDay] = checkInDate.split("-").map(Number);
    const [ciHour, ciMin] = checkInTime.split(":").map(Number);
    const queryStart = new Date(
      Date.UTC(ciYear, ciMonth - 1, ciDay, ciHour, ciMin, 0),
    );
    const queryEnd = new Date(
      queryStart.getTime() + Number(hours) * 60 * 60 * 1000,
    );

    const activeReservations = await Reservation.find({
      roomType: selectedRoom,
      "paymentDetails.status": { $in: ["paid", "pending"] },
    });

    let occupiedCount = 0;
    const occupiedRoomNumbers = new Set();
    for (const r of activeReservations) {
      const resCiDate = new Date(r.checkInDate);
      const [resCiHour, resCiMin] = r.checkInTime.split(":").map(Number);
      const resStart = new Date(
        Date.UTC(
          resCiDate.getUTCFullYear(),
          resCiDate.getUTCMonth(),
          resCiDate.getUTCDate(),
          resCiHour,
          resCiMin,
          0,
        ),
      );
      const resEnd = new Date(resStart.getTime() + r.hours * 60 * 60 * 1000);
      const resHousekeepingEnd = new Date(resEnd.getTime() + 30 * 60 * 1000);

      const overlap = queryStart < resHousekeepingEnd && resStart < queryEnd;
      if (overlap) {
        occupiedCount++;
        if (r.roomNumber) {
          occupiedRoomNumbers.add(r.roomNumber);
        }
      }
    }

    const availableCount = room.totalRooms - occupiedCount;
    if (availableCount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sorry, ${room.name} is fully booked for the selected stay period (including housekeeping cleaning buffer).`,
      });
    }

    let assignedRoomNumber = "";
    if (room.roomNumbers && room.roomNumbers.length > 0) {
      for (const num of room.roomNumbers) {
        if (!occupiedRoomNumbers.has(num)) {
          assignedRoomNumber = num;
          break;
        }
      }
    }

    if (!assignedRoomNumber) {
      assignedRoomNumber =
        room.roomNumbers && room.roomNumbers.length > 0
          ? room.roomNumbers[0]
          : "TBD";
    }

    const [hour, minute] = checkInTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + Number(hours) * 60;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    const computedCheckOutTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    const reservation = new Reservation({
      user: userId,
      roomType: selectedRoom,
      room: room._id,
      checkInDate: new Date(`${checkInDate}T00:00:00.000Z`),
      checkOutDate: new Date(`${checkOutDate}T00:00:00.000Z`),
      checkInTime,
      checkOutTime: computedCheckOutTime,
      hours: Number(hours),
      notes: notes || "",
      totalAmount: Number(totalAmount),
      roomNumber: assignedRoomNumber,
      paymentDetails: {
        status,
        paidAt: status === "paid" ? new Date() : null,
      },
    });

    await reservation.save();

    // Real-time integration: Notify admin system to refresh data
    notifyAdmin();

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Error creating external reservation:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const externalTransaction = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { paymentDetails } = req.body;

    if (!paymentDetails || !paymentDetails.status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details or status" });
    }

    // Bugfix/Integrity Check: Validate payment status value
    const status = paymentDetails.status;
    if (!["paid", "pending", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment status value" });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    // Bugfix/Integrity Check: Block payments on already cancelled reservations
    if (reservation.paymentDetails.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot update payment status for a cancelled reservation" });
    }

    // Bugfix: Dynamically set status from body, instead of hardcoding "paid"
    reservation.paymentDetails.status = status;
    if (status === "paid") {
      reservation.paymentDetails.paidAt = new Date();
    } else {
      reservation.paymentDetails.paidAt = null;
    }

    await reservation.save();

    // Real-time integration: Notify admin system to refresh data
    notifyAdmin();

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: reservation.roomNumber
        ? { roomNumber: reservation.roomNumber }
        : {},
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const externalCancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }

    if (reservation.paymentDetails.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Reservation is already cancelled" });
    }

    reservation.paymentDetails.status = "cancelled";
    reservation.roomNumber = null;
    await reservation.save();

    // Real-time integration: Notify admin system to refresh data
    notifyAdmin();

    res.json({
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getSummary,
  getTransactions,
  externalReservation,
  externalTransaction,
  externalCancelReservation,
};
