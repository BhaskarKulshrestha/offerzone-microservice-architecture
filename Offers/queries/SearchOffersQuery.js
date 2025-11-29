const Offer = require("../Models/Offers");
const enrichOffers = require("../utils/enrichOffers");
const { searchProducts } = require("../utils/serviceCommunicator");
const logger = require("../utils/logger");

const SearchOffersQuery = async (params, queryParams) => {
    logger.info("Executing SearchOffersQuery", { params, queryParams });

    const { city, query } = params;
    const { area, page = 1, limit = 10, sort = "-createdAt" } = queryParams;

    const offerFilters = { city: new RegExp(city, "i") };
    if (area) offerFilters.area = new RegExp(area, "i");

    const matchedProducts = await searchProducts({ search: query });
    const productIds = matchedProducts.map(p => p._id);

    if (productIds.length === 0) {
        return { offers: [], total: 0 };
    }

    offerFilters.product = { $in: productIds };

    const skip = (Number(page) - 1) * Number(limit);

    const offersRaw = await Offer.find(offerFilters)
        .sort(sort.split(",").join(" "))
        .skip(skip)
        .limit(Number(limit));

    const offers = await enrichOffers(offersRaw);

    return { offers, total: offers.length }; // Note: Total might be inaccurate for pagination here if we don't count all matches
};

module.exports = SearchOffersQuery;
