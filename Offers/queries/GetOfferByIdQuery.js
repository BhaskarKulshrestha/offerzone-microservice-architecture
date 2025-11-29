const Offer = require("../models/Offers");
const enrichOffers = require("../utils/enrichOffers");
const logger = require("../utils/logger");

const GetOfferByIdQuery = async (offerId) => {
    logger.info("Executing GetOfferByIdQuery", { offerId });

    const offerRaw = await Offer.findById(offerId);
    if (!offerRaw) {
        return null;
    }

    const [offer] = await enrichOffers([offerRaw]);
    return offer;
};

module.exports = GetOfferByIdQuery;
