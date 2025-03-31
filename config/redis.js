const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => console.error('❌ Redis error:', err));
client.on('connect', () => console.log('✅ Redis connected'));

client.connect(); // OBS: ny Redis-version använder async connect

module.exports = client;

