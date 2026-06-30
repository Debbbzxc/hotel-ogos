const express = require('express');
const router = express.Router();
const { getAllRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllRooms);
router.post('/', protect, adminOnly, createRoom);
router.put('/:roomId', protect, adminOnly, updateRoom);
router.delete('/:roomId', protect, adminOnly, deleteRoom);

module.exports = router;
