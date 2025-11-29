const Offer = require("../Models/Offers");
const logger = require("../utils/logger");
const redisClient = require("../utils/redisClient");

const CACHE_TTL = 3600; // 1 hour

const clearOfferCache = async (id = null) => {
    try {
        if (id) {
            await redisClient.del(`offer:${id} `);
        }
        const keys = await redisClient.keys("offers:list:*");
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) {
        logger.error("Redis Cache Clear Error", err);
    }
};

const resolvers = {
    Query: {
        getOffers: async (_, args) => {
            const cacheKey = `offers: list:${JSON.stringify(args)} `;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const {
                    city,
                    area,
                    minDiscount,
                    maxPrice,
                    isPremium,
                    page = 1,
                    limit = 10,
                    sort = "-createdAt",
                } = args;

                const filters = {};
                if (city) filters.city = city;
                if (area) filters.area = area;
                if (minDiscount) filters.discountPercent = { $gte: minDiscount };
                if (maxPrice) filters.offerPrice = { $lte: maxPrice };
                if (isPremium !== undefined) filters.isPremium = isPremium;

                const skip = (page - 1) * limit;

                const [offers, total] = await Promise.all([
                    Offer.find(filters)
                        .sort(sort.split(",").join(" "))
                        .skip(skip)
                        .limit(limit),
                    Offer.countDocuments(filters),
                ]);

                const result = {
                    success: true,
                    count: offers.length,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    offers,
                };

                try {
                    await redisClient.set(cacheKey, JSON.stringify(result), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }

                return result;
            } catch (err) {
                logger.error("GraphQL GetOffers Error", { error: err.message });
                throw new Error("Error fetching offers");
            }
        },
        getOffer: async (_, { id }) => {
            const cacheKey = `offer:${id} `;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const offer = await Offer.findById(id);
                if (!offer) throw new Error("Offer not found");

                try {
                    await redisClient.set(cacheKey, JSON.stringify(offer), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }

                return offer;
            } catch (err) {
                logger.error("GraphQL GetOffer Error", { error: err.message });
                throw new Error("Error fetching offer");
            }
        },
    },
    Mutation: {
        createOffer: async (_, args, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const offer = await Offer.create({
                    ...args,
                    retailer: user._id,
                });
                await clearOfferCache();
                return offer;
            } catch (err) {
                logger.error("GraphQL CreateOffer Error", { error: err.message });
                throw new Error("Error creating offer");
            }
        },
        updateOffer: async (_, { id, ...updates }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const offer = await Offer.findById(id);
                if (!offer) throw new Error("Offer not found");

                if (offer.retailer.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                Object.assign(offer, updates);
                await offer.save();
                await clearOfferCache(id);
                return offer;
            } catch (err) {
                logger.error("GraphQL UpdateOffer Error", { error: err.message });
                throw new Error("Error updating offer");
            }
        },
        deleteOffer: async (_, { id }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const offer = await Offer.findById(id);
                if (!offer) throw new Error("Offer not found");

                if (offer.retailer.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                await offer.deleteOne();
                await clearOfferCache(id);
                return { success: true, message: "Offer deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteOffer Error", { error: err.message });
                throw new Error("Error deleting offer");
            }
        },
    },
};

module.exports = resolvers;
