const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, isAdmin, roomController.createRoom);
router.get('/', protect, roomController.getAllRooms);
router.put('/:id', protect, isAdmin, roomController.updateRoom);
router.delete('/:id', protect, isAdmin, roomController.deleteRoom);

module.exports = router;