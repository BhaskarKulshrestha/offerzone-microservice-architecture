const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controller/Products");
const { protect, authorize } = require("../Middleware/authMiddleware");

router.post("/", protect, authorize("retailer"), createProduct);
router.get("/", getAllProducts);
router.get("/mine", protect, authorize("retailer"), getMyProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, authorize("retailer"), updateProduct);
router.delete("/:id", protect, authorize("retailer"), deleteProduct);


module.exports = router;
