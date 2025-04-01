// 📁 seeders/seed.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ✅ Renare & inga warnings

    console.log("🔗 MongoDB connected");

    // 🧹 Rensa databasen
    await Promise.all([
      User.deleteMany(),
      Room.deleteMany(),
      Booking.deleteMany(),
    ]);
    console.log("🧼 Databasen rensad");

    // 👤 Skapa användare
    const [admin, user1, user2] = await Promise.all([
      User.create({ username: "admin", password: "admin123", role: "Admin" }),
      User.create({ username: "user1", password: "password1" }),
      User.create({ username: "user2", password: "password2" }),
    ]);

    // 🏢 Skapa rum
    const [room1, room2] = await Promise.all([
      Room.create({ name: "Konferensrum A", capacity: 10, type: "conference" }),
      Room.create({ name: "Arbetsplats 1", capacity: 1, type: "workspace" }),
    ]);

    // 📆 Skapa bokning
    await Booking.create({
      roomId: room1._id,
      userId: user1._id,
      startTime: new Date(Date.now() + 3600000), // +1h
      endTime: new Date(Date.now() + 7200000), // +2h
    });

    console.log("✅ Testdata seedad!");
  } catch (err) {
    console.error("❌ Fel vid seeding:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seed();
