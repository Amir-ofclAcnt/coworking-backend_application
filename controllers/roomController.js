const Room = require("../models/Room");
const redisClient = require("../config/redis");

const ROOM_LIST_CACHE_KEY = "rooms";

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);

    // Rensa cache (för listor)
    await redisClient.del(ROOM_LIST_CACHE_KEY);

    res.status(201).json(room);
  } catch (err) {
    console.error("Create Room Error:", err.message);
    res.status(400).json({ message: "Kunde inte skapa rum" });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const cachedRooms = await redisClient.get(ROOM_LIST_CACHE_KEY);

    if (cachedRooms) {
      return res.json(JSON.parse(cachedRooms));
    }

    const rooms = await Room.find();

    // Cache i 60 sekunder
    await redisClient.setEx(ROOM_LIST_CACHE_KEY, 60, JSON.stringify(rooms));

    res.json(rooms);
  } catch (err) {
    console.error("Get Rooms Error:", err.message);
    res.status(500).json({ message: "Fel vid hämtning av rum" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ message: "Rum hittades inte" });
    }

    // Rensa hela cachelistan + enskild room-cache (om du implementerar det)
    await redisClient.del(ROOM_LIST_CACHE_KEY);
    await redisClient.del(`room:${req.params.id}`);

    res.json(updatedRoom);
  } catch (err) {
    console.error("Update Room Error:", err.message);
    res.status(400).json({ message: "Kunde inte uppdatera rum" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Rum hittades inte" });
    }

    // Rensa cache
    await redisClient.del(ROOM_LIST_CACHE_KEY);
    await redisClient.del(`room:${req.params.id}`);

    res.json({ message: "Rummet är borttaget" });
  } catch (err) {
    console.error("Delete Room Error:", err.message);
    res.status(400).json({ message: "Kunde inte ta bort rum" });
  }
};
