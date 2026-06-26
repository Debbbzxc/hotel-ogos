const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createReservation);
router.get('/my-reservations', protect, getMyReservations);
router.get('/', protect, adminOnly, getAllReservations);

module.exports = router;
