const Offer = require("../models/Offers");
const logger = require("../utils/logger");

const DeleteOfferCommand = async (offerId, userId) => {
    logger.info("Executing DeleteOfferCommand", { offerId, user: userId });

    const offer = await Offer.findById(offerId);
    if (!offer) {
        throw new Error("Offer not found.");
    }

    if (offer.retailer.toString() !== userId.toString()) {
        throw new Error("Unauthorized.");
    }

    await offer.deleteOne();

    logger.info("Offer deleted successfully", { offerId });
    return true;
};

module.exports = DeleteOfferCommand;
