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
  
  // 🔁 Håll anslutningen aktiv med ping var 25 sek
  setInterval(async () => {
    try {
      await client.ping();
      console.log('📡 Redis ping');
    } catch (err) {
      console.warn('⚠️ Redis ping failed:', err.message);
    }
  }, 25000);
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('❌ Redis initial connect failed:', err.message);
  }
})();

module.exports = client;
