const redis = require("redis");
const logger = require("./logger");

const client = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => logger.error("Redis Client Error", err));
client.on("connect", () => logger.info("Connected to Redis"));

(async () => {
    await client.connect();
})();

module.exports = client;
