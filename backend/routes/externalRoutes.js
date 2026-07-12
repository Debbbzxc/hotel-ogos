const express = require('express');
const router = express.Router();
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const {
  getSummary,
  getTransactions,
  externalReservation,
  externalTransaction,
  externalCancelReservation
} = require('../controllers/externalController');

// All external integration endpoints are protected by API key middleware
router.use(apiKeyMiddleware);

router.get('/summary', getSummary);
router.get('/transactions', getTransactions);

router.post('/reservations', externalReservation);
router.put('/transactions/:reservationId', externalTransaction);
router.put('/reservations/:reservationId/cancel', externalCancelReservation);

module.exports = router;
