const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getCustomerDetails, getBills, payBill } = require('../controllers/utilityController');

// All utility integration routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

// GET /api/utility-bills/customer
router.get('/customer', getCustomerDetails);

// GET /api/utility-bills/bills
router.get('/bills', getBills);

// POST /api/utility-bills/pay
router.post('/pay', payBill);

module.exports = router;
