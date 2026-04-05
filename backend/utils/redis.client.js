import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3, // Lower retries, rely on strategy
  enableReadyCheck: true,
  retryStrategy: (times) => {
    if (times > 10) { // Try for a longer period
      console.error("Redis: Exhausted retry strategy. Could not connect.");
      return null; // Stop retrying
    }
    // Exponential backoff
    return Math.min(times * 100, 3000);
  },
};

const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("close", () => {
  console.log("Redis connection closed.");
});

redis.on("reconnecting", () => {
  console.log("Redis is reconnecting...");
});

export default redis;