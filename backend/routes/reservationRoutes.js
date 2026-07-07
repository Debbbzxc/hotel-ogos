const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus
} = require('../controllers/reservationController');
const { getSummary, getTransactions } = require('../controllers/externalController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createReservation);
router.get('/my-reservations', protect, getMyReservations);
router.get('/summary', protect, adminOnly, getSummary);
router.get('/transactions', protect, adminOnly, getTransactions);
router.get('/', protect, adminOnly, getAllReservations);
router.put('/:id/status', protect, adminOnly, updateReservationStatus);

module.exports = router;
