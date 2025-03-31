// 📁 index.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectSocket = require('./sockets/notificationSocket');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const errorHandler = require('./middleware/errorHandler');
const responseWrapper = require('./middleware/responseWrapper');
const logger = require('./utils/logger');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
connectSocket(io);
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(responseWrapper);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handler
app.use(errorHandler);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));


// 📁 models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);


// 📁 models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['workspace', 'conference'], required: true },
});

module.exports = mongoose.model('Room', roomSchema);


// 📁 models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

module.exports = mongoose.model('Booking', bookingSchema);


// 📁 controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/errorHandler');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
    next(new AppError('Användarnamnet är upptaget', 400));
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Fel användarnamn eller lösenord', 401));
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};


// 📁 controllers/roomController.js
const Room = require('../models/Room');
const redisClient = require('../config/redis');
const AppError = require('../utils/errorHandler');

exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    await redisClient.del('rooms');
    res.status(201).json(room);
  } catch (err) {
    next(new AppError('Kunde inte skapa rum', 400));
  }
};

exports.getAllRooms = async (req, res) => {
  const cached = await redisClient.get('rooms');
  if (cached) return res.json(JSON.parse(cached));

  const rooms = await Room.find();
  await redisClient.setEx('rooms', 60, JSON.stringify(rooms));
  res.json(rooms);
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await redisClient.del('rooms');
    res.json(room);
  } catch (err) {
    next(new AppError('Kunde inte uppdatera rum', 400));
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    await redisClient.del('rooms');
    res.json({ message: 'Rum borttaget' });
  } catch (err) {
    next(new AppError('Kunde inte ta bort rum', 400));
  }
};
