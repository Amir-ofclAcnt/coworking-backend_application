const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const Room = require('../models/Room');

router.post('/', protect, isAdmin, roomController.createRoom);
router.get('/', protect, roomController.getAllRooms);
router.put('/:id', protect, isAdmin, roomController.updateRoom);
router.delete('/:id', protect, isAdmin, roomController.deleteRoom);

router.get('/', async (req, res) => {
    try {
      const rooms = await Room.find({});
      res.json({ success: true, data: rooms });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Kunde inte hämta rum', error: err.message });
    }
  });
  

module.exports = router;