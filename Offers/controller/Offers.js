const Offer = require("../Models/Offers");
const Product = require("../Models/Product");
const logger = require("../utils/logger"); // <-- ADDED LOGGER

const sendError = (res, code, message) => {
  logger.warn(`Error Response: ${message}`); // log warnings
  return res.status(code).json({ success: false, message });
};

// -------------------------------------------------------
// CREATE OFFER
// -------------------------------------------------------
exports.createOffer = async (req, res) => {
  try {
    logger.info("Creating a new offer", { body: req.body, user: req.user._id });

    if (!req.body || Object.keys(req.body).length === 0)
      return sendError(res, 400, "Request body is empty.");

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
    )
      return sendError(res, 400, "All required fields must be provided.");

    const offer = await Offer.create({
      product,
      retailer: req.user._id,
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
    logger.error("Create Offer Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error creating offer.");
  }
};

// -------------------------------------------------------
// GET ALL OFFERS
// -------------------------------------------------------
exports.getAllOffers = async (req, res) => {
  try {
    logger.info("Fetching all offers", { query: req.query });

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

    if (category) productFilters.category = new RegExp(category, "i");
    if (brand) productFilters.brand = new RegExp(brand, "i");
    if (product) productFilters.name = new RegExp(product, "i");

    let productIds = [];

    if (Object.keys(productFilters).length > 0) {
      logger.info("Product filters applied", { productFilters });

      const matched = await Product.find(productFilters).select("_id");
      productIds = matched.map((p) => p._id);
      offerFilters.product = { $in: productIds };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [offers, total] = await Promise.all([
      Offer.find(offerFilters)
        .populate("product", "name brand category")
        .populate("retailer", "name email")
        .sort(sort.split(",").join(" "))
        .skip(skip)
        .limit(Number(limit)),
      Offer.countDocuments(offerFilters),
    ]);

    logger.info("Offers fetched successfully", {
      total,
      returned: offers.length,
      filters: offerFilters,
    });

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      offers,
    });
  } catch (err) {
    logger.error("Get All Offers Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error fetching offers.");
  }
};

// -------------------------------------------------------
// GET OFFER BY ID
// -------------------------------------------------------
exports.getOfferById = async (req, res) => {
  try {
    logger.info("Fetching offer by ID", { id: req.params.id });

    const offer = await Offer.findById(req.params.id)
      .populate("product", "name brand category")
      .populate("retailer", "name email");

    if (!offer) {
      logger.warn("Offer not found", { id: req.params.id });
      return sendError(res, 404, "Offer not found.");
    }

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
    logger.info("Updating offer", {
      id: req.params.id,
      body: req.body,
      user: req.user._id,
    });

    const offer = await Offer.findById(req.params.id);
    if (!offer) return sendError(res, 404, "Offer not found.");

    if (offer.retailer.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized offer update attempt", {
        user: req.user._id,
        offerOwner: offer.retailer,
      });
      return sendError(res, 403, "Unauthorized.");
    }

    Object.assign(offer, req.body);
    await offer.save();

    logger.info("Offer updated successfully", { id: offer._id });

    res.status(200).json({ success: true, message: "Offer updated", offer });
  } catch (err) {
    logger.error("Update Offer Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error updating offer.");
  }
};

// -------------------------------------------------------
// DELETE OFFER
// -------------------------------------------------------
exports.deleteOffer = async (req, res) => {
  try {
    logger.info("Deleting offer", { id: req.params.id, user: req.user._id });

    const offer = await Offer.findById(req.params.id);
    if (!offer) return sendError(res, 404, "Offer not found.");

    if (offer.retailer.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized delete attempt", {
        user: req.user._id,
        offerOwner: offer.retailer,
      });
      return sendError(res, 403, "Unauthorized.");
    }

    await offer.deleteOne();

    logger.info("Offer deleted successfully", { id: req.params.id });

    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    logger.error("Delete Offer Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error deleting offer.");
  }
};

// -------------------------------------------------------
// GET MY OFFERS
// -------------------------------------------------------
exports.getMyOffers = async (req, res) => {
  try {
    logger.info("Fetching retailer offers", { user: req.user._id });

    const offers = await Offer.find({ retailer: req.user._id }).populate(
      "product",
      "name brand category"
    );

    if (!offers.length) {
      logger.warn("No offers found for retailer", { user: req.user._id });
      return sendError(res, 404, "No offers found.");
    }

    res.status(200).json({ success: true, count: offers.length, offers });
  } catch (err) {
    logger.error("Get My Offers Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error fetching retailer offers.");
  }
};

// -------------------------------------------------------
// FILTER OFFERS
// -------------------------------------------------------
exports.getOffersByFilter = async (req, res) => {
  try {
    logger.info("Filtering offers", { query: req.query });

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
    if (category) productFilters.category = new RegExp(category, "i");
    if (brand) productFilters.brand = new RegExp(brand, "i");
    if (product) productFilters.name = new RegExp(product, "i");

    let productIds = [];

    if (Object.keys(productFilters).length > 0) {
      logger.info("Product filters applied", { productFilters });

      const matched = await Product.find(productFilters).select("_id");
      productIds = matched.map((p) => p._id);

      if (!productIds.length)
        return sendError(res, 404, "No products found for given filters.");

      offerFilters.product = { $in: productIds };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [offers, total] = await Promise.all([
      Offer.find(offerFilters)
        .populate("product", "name brand category")
        .populate("retailer", "name email")
        .sort(sort.split(",").join(" "))
        .skip(skip)
        .limit(Number(limit)),
      Offer.countDocuments(offerFilters),
    ]);

    if (!offers.length) {
      logger.warn("No offers found for applied filters", { offerFilters });
      return sendError(res, 404, "No offers found for given filters.");
    }

    logger.info("Filtered offers fetched", { count: offers.length });

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      offers,
    });
  } catch (err) {
    logger.error("Get Offers By Filter Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error fetching offers.");
  }
};

// -------------------------------------------------------
// SEARCH OFFERS
// -------------------------------------------------------
exports.searchOffers = async (req, res) => {
  try {
    logger.info("Searching offers", {
      params: req.params,
      query: req.query,
    });

    const { city, query } = req.params;
    const { area, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    if (!query || !city)
      return sendError(res, 400, "City and search query are required.");

    const offerFilters = { city: new RegExp(city, "i") };
    if (area) offerFilters.area = new RegExp(area, "i");

    const skip = (Number(page) - 1) * Number(limit);

    const offers = await Offer.find(offerFilters)
      .populate({
        path: "product",
        match: {
          $or: [
            { name: new RegExp(query, "i") },
            { brand: new RegExp(query, "i") },
            { category: new RegExp(query, "i") },
          ],
        },
        select: "name brand category",
      })
      .populate("retailer", "name email")
      .sort(sort.split(",").join(" "))
      .skip(skip)
      .limit(Number(limit));

    const filtered = offers.filter((o) => o.product);

    if (!filtered.length) {
      logger.warn("No offers matched search query", { query });
      return sendError(res, 404, "No matching offers found.");
    }

    logger.info("Search results fetched", { count: filtered.length });

    res.status(200).json({
      success: true,
      count: filtered.length,
      page: Number(page),
      offers: filtered,
    });
  } catch (err) {
    logger.error("Search Offers Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error searching offers.");
  }
};
