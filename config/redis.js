// ✅ FULLSTÄNDIG BACKEND – NU MED RENDER-FIX (REDIS KEEP-ALIVE MED PING-FIX)

// 📁 config/redis.js
const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({
  url: redisUrl,
  socket: {
    tls: redisUrl.startsWith('rediss://'),
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 3000);
      console.warn(`🔁 Redis reconnect (#${retries}), waiting ${delay}ms`);
      return delay;
    },
  },
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err.name, err.message);
});

client.on('connect', () => {
  console.log('✅ Redis connected');
});

client.on('ready', () => {
  console.log('⚡ Redis ready – setting up keep-alive ping');
  setInterval(async () => {
    try {
      await client.ping();
      console.log('📡 Redis ping successful');
    } catch (err) {
      console.warn('⚠️ Redis ping failed:', err.message);
    }
  }, 25000); // ping var 25:e sekund
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('❌ Redis initial connect failed:', err.message);
  }
})();

module.exports = client;
