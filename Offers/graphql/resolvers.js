const Offer = require("../models/Offers");
const logger = require("../utils/logger");

const resolvers = {
    Query: {
        getOffers: async (_, args) => {
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

                return {
                    success: true,
                    count: offers.length,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    offers,
                };
            } catch (err) {
                logger.error("GraphQL GetOffers Error", { error: err.message });
                throw new Error("Error fetching offers");
            }
        },
        getOffer: async (_, { id }) => {
            try {
                const offer = await Offer.findById(id);
                if (!offer) throw new Error("Offer not found");
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
                return { success: true, message: "Offer deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteOffer Error", { error: err.message });
                throw new Error("Error deleting offer");
            }
        },
    },
};

module.exports = resolvers;
