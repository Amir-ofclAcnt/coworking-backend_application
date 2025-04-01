// ✅ FULLSTÄNDIG BACKEND – NU MED RENDER-FIX

// 📁 config/redis.js
const redis = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const client = redis.createClient({
  url: redisUrl,
  socket: {
    tls: redisUrl.startsWith("rediss://"),
  },
});

client.on("error", (err) => console.error("❌ Redis error:", err));
client.on("connect", () => console.log("✅ Redis connected"));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error("❌ Redis connect failed:", err);
  }
})();

module.exports = client;
