const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

router.delete("/reset", async (req, res) => {
  try {
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({});
    res.json({ message: "🧹 All data deleted: users, rooms, bookings" });
  } catch (err) {
    res.status(500).json({ message: "❌ Reset failed", error: err.message });
  }
});
router.post("/seed", async (req, res) => {
  try {
    // Skapa en användare
    const hashedPassword = await bcrypt.hash("test123", 10);
    const user = await User.create({
      username: "amir",
      password: hashedPassword,
      role: "User",
    });

    // Skapa två rum
    const room1 = await Room.create({
      name: "Arbetsplats A",
      capacity: 2,
      type: "workspace",
    });
    const room2 = await Room.create({
      name: "Konferensrum B",
      capacity: 10,
      type: "conference",
    });

    // Skapa en bokning
    const booking = await Booking.create({
      userId: user._id,
      roomId: room1._id,
      startTime: new Date("2025-04-05T09:00:00Z"),
      endTime: new Date("2025-04-05T10:00:00Z"),
    });

    // Generera token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Testdata skapad ✅",
      user: { username: user.username, id: user._id },
      token,
      rooms: [room1, room2],
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Seed failed", error: err.message });
  }
});

module.exports = router;
