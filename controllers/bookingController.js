const Booking = require('../models/Booking');
const Room = require('../models/Room');

exports.createBooking = async (req, res) => {
  try {
    const { roomId, startTime, endTime } = req.body;

    // Kontrollera dubbelbokning
    const overlap = await Booking.findOne({
      roomId,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'Rummet är redan bokat under den tiden' });
    }

    const booking = await Booking.create({
      roomId,
      userId: req.user.id,
      startTime,
      endTime,
    });

    // Notifiering via socket.io
    const io = req.app.get('io');
    io.emit('bookingUpdate', { type: 'created', booking });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: 'Kunde inte skapa bokning' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(filter).populate('roomId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Fel vid hämtning av bokningar' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Bokning hittades inte' });

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Du får inte ändra denna bokning' });
    }

    Object.assign(booking, req.body);
    await booking.save();

    const io = req.app.get('io');
    io.emit('bookingUpdate', { type: 'updated', booking });

    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: 'Kunde inte uppdatera bokning' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Bokning hittades inte' });

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Du får inte ta bort denna bokning' });
    }

    await booking.deleteOne();

    const io = req.app.get('io');
    io.emit('bookingUpdate', { type: 'deleted', bookingId: booking._id });

    res.json({ message: 'Bokning borttagen' });
  } catch (err) {
    res.status(400).json({ message: 'Fel vid borttagning av bokning' });
  }
};
