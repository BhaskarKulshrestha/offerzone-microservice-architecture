const Favorite = require("../Models/Favorites");
const logger = require("../utils/logger");

const resolvers = {
    Query: {
        getFavorites: async (_, __, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                return await Favorite.find({ userId: user._id });
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
                return { success: true, message: "Favorite removed" };
            } catch (err) {
                logger.error("GraphQL RemoveFavorite Error", { error: err.message });
                throw new Error("Error removing favorite");
            }
        },
    },
};

module.exports = resolvers;
