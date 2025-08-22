import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
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
