// ✅ FULLSTÄNDIG BACKEND – NU MED SEEDERS

// 📁 seeders/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔗 MongoDB connected');

  await User.deleteMany();
  await Room.deleteMany();
  await Booking.deleteMany();

  const admin = await User.create({ username: 'admin', password: 'admin123', role: 'Admin' });
  const user1 = await User.create({ username: 'user1', password: 'password1' });
  const user2 = await User.create({ username: 'user2', password: 'password2' });

  const room1 = await Room.create({ name: 'Konferensrum A', capacity: 10, type: 'conference' });
  const room2 = await Room.create({ name: 'Arbetsplats 1', capacity: 1, type: 'workspace' });

  const booking = await Booking.create({
    roomId: room1._id,
    userId: user1._id,
    startTime: new Date(Date.now() + 3600000),
    endTime: new Date(Date.now() + 7200000),
  });

  console.log('✅ Data seedad!');
  process.exit();
};

seed();
