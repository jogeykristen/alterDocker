const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1", // Redis server host
  port: 6379, // Redis default port
  // password: "your_redis_password", // Uncomment if Redis has a password
  db: 0, // Default database (Redis supports multiple DBs, usually 0-15)
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

module.exports = redis;
