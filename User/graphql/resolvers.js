const User = require("../Models/User");
const logger = require("../utils/logger");
const redisClient = require("../utils/redisClient");

const CACHE_TTL = 3600; // 1 hour

const clearUserCache = async (id = null) => {
    try {
        if (id) {
            await redisClient.del(`user:${id}`);
        }
        await redisClient.del("users:list");
    } catch (err) {
        logger.error("Redis Cache Clear Error", err);
    }
};

const resolvers = {
    Query: {
        getUsers: async () => {
            const cacheKey = "users:list";
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const users = await User.find();
                try {
                    await redisClient.set(cacheKey, JSON.stringify(users), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }
                return users;
            } catch (err) {
                logger.error("GraphQL GetUsers Error", { error: err.message });
                throw new Error("Error fetching users");
            }
        },
        getUser: async (_, { id }) => {
            const cacheKey = `user:${id}`;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const user = await User.findById(id);
                if (!user) throw new Error("User not found");

                try {
                    await redisClient.set(cacheKey, JSON.stringify(user), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }

                return user;
            } catch (err) {
                logger.error("GraphQL GetUser Error", { error: err.message });
                throw new Error("Error fetching user");
            }
        },
    },
    Mutation: {
        updateUser: async (_, { id, ...updates }) => {
            try {
                const user = await User.findByIdAndUpdate(id, updates, { new: true });
                if (!user) throw new Error("User not found");
                await clearUserCache(id);
                return user;
            } catch (err) {
                logger.error("GraphQL UpdateUser Error", { error: err.message });
                throw new Error("Error updating user");
            }
        },
        deleteUser: async (_, { id }) => {
            try {
                const user = await User.findByIdAndDelete(id);
                if (!user) throw new Error("User not found");
                await clearUserCache(id);
                return { success: true, message: "User deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteUser Error", { error: err.message });
                throw new Error("Error deleting user");
            }
        },
    },
};

module.exports = resolvers;
