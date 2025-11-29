const Favorite = require("../Models/Favorites");
const logger = require("../utils/logger");
const redisClient = require("../utils/redisClient");

const CACHE_TTL = 3600; // 1 hour

const clearFavoriteCache = async (userId) => {
    try {
        await redisClient.del(`favorites:${userId}`);
    } catch (err) {
        logger.error("Redis Cache Clear Error", err);
    }
};

const resolvers = {
    Query: {
        getFavorites: async (_, __, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            const cacheKey = `favorites:${user._id}`;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const favorites = await Favorite.find({ userId: user._id });
                try {
                    await redisClient.set(cacheKey, JSON.stringify(favorites), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }
                return favorites;
            } catch (err) {
                logger.error("GraphQL GetFavorites Error", { error: err.message });
                throw new Error("Error fetching favorites");
            }
        },
    },
    Mutation: {
        addFavorite: async (_, { productId, offerId }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            if (!productId && !offerId) {
                throw new Error("Either productId or offerId is required");
            }

            try {
                const favorite = await Favorite.create({
                    userId: user._id,
                    productId,
                    offerId,
                });
                await clearFavoriteCache(user._id);
                return favorite;
            } catch (err) {
                logger.error("GraphQL AddFavorite Error", { error: err.message });
                throw new Error("Error adding favorite");
            }
        },
        removeFavorite: async (_, { id }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const favorite = await Favorite.findById(id);
                if (!favorite) throw new Error("Favorite not found");

                if (favorite.userId.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                await favorite.deleteOne();
                await clearFavoriteCache(user._id);
                return { success: true, message: "Favorite removed" };
            } catch (err) {
                logger.error("GraphQL RemoveFavorite Error", { error: err.message });
                throw new Error("Error removing favorite");
            }
        },
    },
};

module.exports = resolvers;
