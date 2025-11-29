const Offer = require("../models/Offers");
const enrichOffers = require("../utils/enrichOffers");
const logger = require("../utils/logger");

const GetMyOffersQuery = async (userId) => {
    logger.info("Executing GetMyOffersQuery", { user: userId });

    const offersRaw = await Offer.find({ retailer: userId });
    const offers = await enrichOffers(offersRaw);

    return offers;
};

module.exports = GetMyOffersQuery;
