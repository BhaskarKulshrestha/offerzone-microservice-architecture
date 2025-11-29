const Offer = require("../Models/Offers");
const enrichOffers = require("../utils/enrichOffers");
const { searchProducts } = require("../utils/serviceCommunicator");
const logger = require("../utils/logger");

const sendError = (res, code, message) => {
  logger.warn(`Error Response: ${message}`);
  return res.status(code).json({ success: false, message });
};

// -------------------------------------------------------
// CREATE OFFER
// -------------------------------------------------------
exports.createOffer = async (req, res) => {
  try {
    const userId = req.user._id;
    logger.info("Executing CreateOffer", { user: userId });

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
    } = req.body;

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
      return sendError(res, 400, "All required fields must be provided.");
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
    res.status(201).json({ success: true, message: "Offer created", offer });
  } catch (err) {
    logger.error("Create Offer Error", { error: err.message, stack: err.stack });
    sendError(res, 500, err.message);
  }
};

// -------------------------------------------------------
// GET ALL OFFERS
// -------------------------------------------------------
exports.getAllOffers = async (req, res) => {
  try {
    logger.info("Executing GetAllOffers", { queryParams: req.query });

    const {
      city,
      area,
      category,
      brand,
      product,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

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
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: Number(page),
          totalPages: 0,
          offers: [],
        });
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

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      offers,
    });
  } catch (err) {
    logger.error("Get All Offers Error", { error: err.message, stack: err.stack });
    sendError(res, 500, "Error fetching offers.");
  }
};

// -------------------------------------------------------
// GET OFFER BY ID
// -------------------------------------------------------
exports.getOfferById = async (req, res) => {
  try {
    const offerId = req.params.id;
    logger.info("Executing GetOfferById", { offerId });

    const offerRaw = await Offer.findById(offerId);

    if (!offerRaw) {
      return sendError(res, 404, "Offer not found.");
    }

    const [offer] = await enrichOffers([offerRaw]);

    res.status(200).json({ success: true, offer });
  } catch (err) {
    logger.error("Get Offer Error", { error: err.message, stack: err.stack });
    sendError(res, 500, "Error fetching offer.");
  }
};

// -------------------------------------------------------
// UPDATE OFFER
// -------------------------------------------------------
exports.updateOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user._id;
    const updateData = req.body;

    logger.info("Executing UpdateOffer", { offerId, user: userId });

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return sendError(res, 404, "Offer not found.");
    }

    if (offer.retailer.toString() !== userId.toString()) {
      return sendError(res, 403, "Unauthorized.");
    }

    Object.assign(offer, updateData);
    await offer.save();

    logger.info("Offer updated successfully", { offerId: offer._id });
    res.status(200).json({ success: true, message: "Offer updated", offer });
  } catch (err) {
    logger.error("Update Offer Error", { error: err.message, stack: err.stack });
    sendError(res, 500, err.message);
  }
};

// -------------------------------------------------------
// DELETE OFFER
// -------------------------------------------------------
exports.deleteOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user._id;

    logger.info("Executing DeleteOffer", { offerId, user: userId });

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return sendError(res, 404, "Offer not found.");
    }

    if (offer.retailer.toString() !== userId.toString()) {
      return sendError(res, 403, "Unauthorized.");
    }

    await offer.deleteOne();

    logger.info("Offer deleted successfully", { offerId });
    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    logger.error("Delete Offer Error", { error: err.message, stack: err.stack });
    sendError(res, 500, err.message);
  }
};

// -------------------------------------------------------
// GET MY OFFERS
// -------------------------------------------------------
exports.getMyOffers = async (req, res) => {
  try {
    const userId = req.user._id;
    logger.info("Executing GetMyOffers", { user: userId });

    const offersRaw = await Offer.find({ retailer: userId });
    const offers = await enrichOffers(offersRaw);

    if (!offers.length) {
      return sendError(res, 404, "No offers found.");
    }

    res.status(200).json({ success: true, count: offers.length, offers });
  } catch (err) {
    logger.error("Get My Offers Error", { error: err.message, stack: err.stack });
    sendError(res, 500, "Error fetching retailer offers.");
  }
};

// -------------------------------------------------------
// FILTER OFFERS
// -------------------------------------------------------
exports.getOffersByFilter = async (req, res) => {
  try {
    logger.info("Executing GetOffersByFilter", { queryParams: req.query });

    const {
      city,
      area,
      category,
      brand,
      product,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    if (!city) return sendError(res, 400, "City is required.");

    const offerFilters = { city: new RegExp(city, "i") };
    if (area) offerFilters.area = new RegExp(area, "i");

    const productFilters = {};
    if (category) productFilters.category = category;
    if (brand) productFilters.brand = brand;
    if (product) productFilters.search = product;

    if (Object.keys(productFilters).length > 0) {
      const matchedProducts = await searchProducts(productFilters);
      const productIds = matchedProducts.map((p) => p._id);

      if (!productIds.length) {
        return sendError(res, 404, "No offers found for given filters.");
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

    if (!offers.length) {
      return sendError(res, 404, "No offers found for given filters.");
    }

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      offers,
    });
  } catch (err) {
    logger.error("Get Offers By Filter Error", { error: err.message, stack: err.stack });
    sendError(res, 500, err.message);
  }
};

// -------------------------------------------------------
// SEARCH OFFERS
// -------------------------------------------------------
exports.searchOffers = async (req, res) => {
  try {
    logger.info("Executing SearchOffers", { params: req.params, queryParams: req.query });

    const { city, query } = req.params;
    const { area, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const offerFilters = { city: new RegExp(city, "i") };
    if (area) offerFilters.area = new RegExp(area, "i");

    const matchedProducts = await searchProducts({ search: query });
    const productIds = matchedProducts.map(p => p._id);

    if (productIds.length === 0) {
      return sendError(res, 404, "No matching offers found.");
    }

    offerFilters.product = { $in: productIds };

    const skip = (Number(page) - 1) * Number(limit);

    const offersRaw = await Offer.find(offerFilters)
      .sort(sort.split(",").join(" "))
      .skip(skip)
      .limit(Number(limit));

    const offers = await enrichOffers(offersRaw);

    if (!offers.length) {
      return sendError(res, 404, "No matching offers found.");
    }

    res.status(200).json({
      success: true,
      count: offers.length,
      page: Number(page),
      offers,
    });
  } catch (err) {
    logger.error("Search Offers Error", { error: err.message, stack: err.stack });
    sendError(res, 500, "Error searching offers.");
  }
};
