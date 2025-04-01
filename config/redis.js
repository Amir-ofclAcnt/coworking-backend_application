// ✅ REDIS: Dynamisk anslutning per request (Render/Upstash-vänlig)

// 📁 config/redis.js
const redis = require('redis');

const getRedisClient = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = redis.createClient({
    url: redisUrl,
    socket: {
      tls: redisUrl.startsWith('rediss://'),
    },
  });

  client.on('error', (err) => {
    console.error('❌ Redis error:', err.name, err.message);
  });

  await client.connect();
  return client;
};

module.exports = getRedisClient;