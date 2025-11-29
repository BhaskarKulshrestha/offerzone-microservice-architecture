const CreateOfferCommand = require("../commands/CreateOfferCommand");
const UpdateOfferCommand = require("../commands/UpdateOfferCommand");
const DeleteOfferCommand = require("../commands/DeleteOfferCommand");
const GetOfferByIdQuery = require("../queries/GetOfferByIdQuery");
const GetAllOffersQuery = require("../queries/GetAllOffersQuery");
const SearchOffersQuery = require("../queries/SearchOffersQuery");
const GetMyOffersQuery = require("../queries/GetMyOffersQuery");
const GetOffersByFilterQuery = require("../queries/GetOffersByFilterQuery");
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
    const offer = await CreateOfferCommand(req.body, req.user._id);
    res.status(201).json({ success: true, message: "Offer created", offer });
  } catch (err) {
    logger.error("Create Offer Error", { error: err.message, stack: err.stack });
    const statusCode = err.message === "All required fields must be provided." ? 400 : 500;
    sendError(res, statusCode, err.message);
  }
};

// -------------------------------------------------------
// GET ALL OFFERS
// -------------------------------------------------------
exports.getAllOffers = async (req, res) => {
  try {
    const { offers, total } = await GetAllOffersQuery(req.query);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page,
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
    const offer = await GetOfferByIdQuery(req.params.id);

    if (!offer) {
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
    const offer = await UpdateOfferCommand(req.params.id, req.body, req.user._id);
    res.status(200).json({ success: true, message: "Offer updated", offer });
  } catch (err) {
    logger.error("Update Offer Error", { error: err.message, stack: err.stack });
    const statusCode = err.message === "Offer not found." ? 404 : err.message === "Unauthorized." ? 403 : 500;
    sendError(res, statusCode, err.message);
  }
};

// -------------------------------------------------------
// DELETE OFFER
// -------------------------------------------------------
exports.deleteOffer = async (req, res) => {
  try {
    await DeleteOfferCommand(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    logger.error("Delete Offer Error", { error: err.message, stack: err.stack });
    const statusCode = err.message === "Offer not found." ? 404 : err.message === "Unauthorized." ? 403 : 500;
    sendError(res, statusCode, err.message);
  }
};

// -------------------------------------------------------
// GET MY OFFERS
// -------------------------------------------------------
exports.getMyOffers = async (req, res) => {
  try {
    const offers = await GetMyOffersQuery(req.user._id);

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
    const { offers, total } = await GetOffersByFilterQuery(req.query);

    if (!offers.length) {
      return sendError(res, 404, "No offers found for given filters.");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      offers,
    });
  } catch (err) {
    logger.error("Get Offers By Filter Error", { error: err.message, stack: err.stack });
    const statusCode = err.message === "City is required." ? 400 : 500;
    sendError(res, statusCode, err.message);
  }
};

// -------------------------------------------------------
// SEARCH OFFERS
// -------------------------------------------------------
exports.searchOffers = async (req, res) => {
  try {
    const { offers, total } = await SearchOffersQuery(req.params, req.query);

    if (!offers.length) {
      return sendError(res, 404, "No matching offers found.");
    }

    const page = Number(req.query.page) || 1;

    res.status(200).json({
      success: true,
      count: offers.length,
      page,
      offers,
    });
  } catch (err) {
    logger.error("Search Offers Error", { error: err.message, stack: err.stack });
    sendError(res, 500, "Error searching offers.");
  }
};
