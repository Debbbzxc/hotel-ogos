const express = require('express');
const router = express.Router();
const { getAllRooms, createRoom } = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllRooms);
router.post('/', protect, adminOnly, createRoom);

module.exports = router;
