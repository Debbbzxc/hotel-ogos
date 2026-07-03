const express = require('express');
const router = express.Router();
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const { getSummary, getTransactions } = require('../controllers/externalController');

// All external integration endpoints are protected by API key middleware
router.use(apiKeyMiddleware);

router.get('/summary', getSummary);
router.get('/transactions', getTransactions);

module.exports = router;
