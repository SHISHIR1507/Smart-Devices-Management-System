import Redis from "ioredis";

// Debug logging
console.log('🔍 DEBUG - All Redis env vars:');
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);

// Build Redis URL from environment variables
const redisUrl = process.env.REDIS_URL || 
  `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

console.log('🔍 DEBUG - Using Redis URL:', redisUrl);

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (e) => console.error("❌ Redis error:", e));

export async function setCache(key, value, ttlSeconds) {
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (err) {
    console.error("Redis set error:", err);
  }
}

export async function getCache(key) {
  try {
    return await redis.get(key);
  } catch (err) {
    console.error("Redis get error:", err);
    return null;
  }
}

export default redis;