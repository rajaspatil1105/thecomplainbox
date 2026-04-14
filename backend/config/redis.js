const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const redis = require('redis');

const inMemoryStore = new Map();

const purgeIfExpired = (key) => {
  const entry = inMemoryStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    inMemoryStore.delete(key);
    return null;
  }

  return entry;
};

const fallbackClient = {
  isOpen: false,
  async exists(key) {
    return purgeIfExpired(key) ? 1 : 0;
  },
  async incr(key) {
    const existing = purgeIfExpired(key);
    const next = (existing ? Number(existing.value) : 0) + 1;
    inMemoryStore.set(key, {
      value: String(next),
      expiresAt: existing ? existing.expiresAt : null,
    });
    return next;
  },
  async expire(key, seconds) {
    const existing = purgeIfExpired(key);
    if (!existing) return 0;
    existing.expiresAt = Date.now() + seconds * 1000;
    inMemoryStore.set(key, existing);
    return 1;
  },
  async ttl(key) {
    const existing = purgeIfExpired(key);
    if (!existing) return -2;
    if (!existing.expiresAt) return -1;
    return Math.max(0, Math.ceil((existing.expiresAt - Date.now()) / 1000));
  },
  async get(key) {
    const existing = purgeIfExpired(key);
    return existing ? existing.value : null;
  },
  async setEx(key, seconds, value) {
    inMemoryStore.set(key, {
      value: String(value),
      expiresAt: Date.now() + seconds * 1000,
    });
    return 'OK';
  },
  async del(key) {
    return inMemoryStore.delete(key) ? 1 : 0;
  },
};

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Max Redis reconnection attempts reached, using in-memory fallback');
        return new Error('Max Redis retries exceeded');
      }
      return Math.min(retries * 200, 2000);
    },
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});
redisClient.on('connect', () => console.log('Redis Client Connected'));

const connectPromise = redisClient.connect().then(() => true).catch((err) => {
  console.warn(`Redis unavailable. Falling back to in-memory store. Reason: ${err.message}`);
  return false;
});

const safeClient = new Proxy(redisClient, {
  get(target, prop) {
    if (prop === 'isFallback') {
      return !target.isOpen;
    }

    if (typeof fallbackClient[prop] === 'function') {
      return async (...args) => {
        await connectPromise;

        if (target.isOpen) {
          return target[prop](...args);
        }

        return fallbackClient[prop](...args);
      };
    }

    return target[prop];
  },
});

module.exports = safeClient;
