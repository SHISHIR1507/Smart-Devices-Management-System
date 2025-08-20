import redis from "../lib/redis.js";

export function cache(ttlSeconds, keyBuilder) {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cached = await redis.get(key);
      if (cached) {
        // mark cache hit for logs/benchmarks
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cached));
      }
      res.setHeader("X-Cache", "MISS");
      // monkey-patch res.json to store in cache
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          await redis.setex(key, ttlSeconds, JSON.stringify(body));
        } catch {}
        return originalJson(body);
      };
      next();
    } catch (e) {
      next(); // if redis fails, just proceed
    }
  };
}

// helpers
export const keys = {
  devicesList: (userId, query) => `devices:list:${userId}:${JSON.stringify(query)}`,
  user: (userId) => `user:${userId}`,
  usage: (deviceId, range) => `usage:${deviceId}:${range}`,
};

// invalidation helpers
export async function invalidateDeviceLists(userId) {
  // simple pattern delete (use SCAN for production)
  const pattern = `devices:list:${userId}:*`;
  const stream = redis.scanStream({ match: pattern, count: 100 });
  stream.on("data", (keys) => keys.length && redis.del(keys));
}
