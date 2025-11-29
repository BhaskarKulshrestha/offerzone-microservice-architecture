const Offer = require("../models/Offers");
const logger = require("../utils/logger");

const CreateOfferCommand = async (offerData, userId) => {
    logger.info("Executing CreateOfferCommand", { user: userId });

    const {
        product,
        title,
        description,
        discountPercent,
        originalPrice,
        offerPrice,
        validFrom,
        validTill,
        city,
        area,
        isPremium,
    } = offerData;

    if (
        !product ||
        !title ||
        !discountPercent ||
        !originalPrice ||
        !offerPrice ||
        !validFrom ||
        !validTill ||
        !city ||
        !area
    ) {
        throw new Error("All required fields must be provided.");
    }

    const offer = await Offer.create({
        product,
        retailer: userId,
        title,
        description,
        discountPercent,
        originalPrice,
        offerPrice,
        validFrom,
        validTill,
        city,
        area,
        isPremium,
    });

    logger.info("Offer created successfully", { offerId: offer._id });
    return offer;
};

module.exports = CreateOfferCommand;
