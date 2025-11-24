const express = require("express");
const router = express.Router();

const {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getMyOffers,
  getOffersByFilter,
  searchOffers,
} = require("../controller/Offers");

const { protect, authorize } = require("../Middleware/authMiddleware");

// ------------------------------------
// Retailer-only routes
// ------------------------------------
router.post("/", protect, authorize("retailer"), createOffer);
router.put("/:id", protect, authorize("retailer"), updateOffer);
router.delete("/:id", protect, authorize("retailer"), deleteOffer);
router.get("/mine", protect, authorize("retailer"), getMyOffers);

// ------------------------------------
// Public routes
// ------------------------------------
router.get("/", getAllOffers);

// Advanced filtering
router.get("/filter", getOffersByFilter);

// Search offers by product name/brand/category
// must come before "/:id"
router.get("/search/:city/:query", searchOffers);

// Single offer by ID (keep last to avoid override)
router.get("/:id", getOfferById);

module.exports = router;
