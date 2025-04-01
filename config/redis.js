const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    reconnectStrategy: () => 1000, // reconnect every second
  },
});

client.on('error', (err) => console.error('❌ Redis error:', err));
client.on('connect', () => console.log('✅ Redis connected'));

client.connect();

module.exports = client;
