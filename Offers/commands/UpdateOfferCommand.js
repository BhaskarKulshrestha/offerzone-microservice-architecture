const Offer = require("../models/Offers");
const logger = require("../utils/logger");

const UpdateOfferCommand = async (offerId, updateData, userId) => {
    logger.info("Executing UpdateOfferCommand", { offerId, user: userId });

    const offer = await Offer.findById(offerId);
    if (!offer) {
        throw new Error("Offer not found.");
    }

    if (offer.retailer.toString() !== userId.toString()) {
        throw new Error("Unauthorized.");
    }

    Object.assign(offer, updateData);
    await offer.save();

    logger.info("Offer updated successfully", { offerId: offer._id });
    return offer;
};

module.exports = UpdateOfferCommand;
