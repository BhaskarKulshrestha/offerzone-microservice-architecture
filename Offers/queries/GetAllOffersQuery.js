const Offer = require("../models/Offers");
const enrichOffers = require("../utils/enrichOffers");
const { searchProducts } = require("../utils/serviceCommunicator");
const logger = require("../utils/logger");

const GetAllOffersQuery = async (queryParams) => {
    logger.info("Executing GetAllOffersQuery", { queryParams });

    const {
        city,
        area,
        category,
        brand,
        product,
        page = 1,
        limit = 10,
        sort = "-createdAt",
    } = queryParams;

    const offerFilters = {};
    const productFilters = {};

    if (city) offerFilters.city = city;
    if (area) offerFilters.area = area;

    if (category) productFilters.category = category;
    if (brand) productFilters.brand = brand;
    if (product) productFilters.search = product;

    if (Object.keys(productFilters).length > 0) {
        const matchedProducts = await searchProducts(productFilters);
        const productIds = matchedProducts.map((p) => p._id);

        if (productIds.length === 0) {
            return { offers: [], total: 0 };
        }
        offerFilters.product = { $in: productIds };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [offersRaw, total] = await Promise.all([
        Offer.find(offerFilters)
            .sort(sort.split(",").join(" "))
            .skip(skip)
            .limit(Number(limit)),
        Offer.countDocuments(offerFilters),
    ]);

    const offers = await enrichOffers(offersRaw);

    return { offers, total };
};

module.exports = GetAllOffersQuery;
