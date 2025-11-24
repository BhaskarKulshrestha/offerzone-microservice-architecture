const Product = require("../Models/Product");
const logger = require("../utils/logger");
const sendError = (res, code, message) => {
  logger.warn(`Error Response: ${message}`);
  return res.status(code).json({ success: false, message });
};

// -------------------------------------------------------
// CREATE PRODUCT
// -------------------------------------------------------
exports.createProduct = async (req, res) => {
  try {
    logger.info("Creating new product", {
      body: req.body,
      user: req.user?._id,
    });

    if (!req.body || Object.keys(req.body).length === 0)
      return sendError(res, 400, "Request body is empty.");

    const { name, brand, category, description, price, city, area, image } =
      req.body;

    if (!name || !brand || !category || !price || !city || !area)
      return sendError(res, 400, "All required fields must be provided.");

    const product = await Product.create({
      name,
      brand,
      category,
      description,
      price,
      city,
      area,
      image,
      retailer: req.user._id,
    });

    logger.info("Product created successfully", { productId: product._id });

    res.status(201).json({
      success: true,
      message: "Product created",
      product,
    });
  } catch (err) {
    logger.error("Create Product Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error creating product.");
  }
};

// -------------------------------------------------------
// GET ALL PRODUCTS (filters + sorting + pagination)
// -------------------------------------------------------
exports.getAllProducts = async (req, res) => {
  try {
    logger.info("Fetching all products", { query: req.query });

    const {
      city,
      area,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filters = {};

    // Basic filters
    if (city) filters.city = city;
    if (area) filters.area = area;
    if (category) filters.category = category;
    if (brand) filters.brand = brand;

    // Price filters
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      filters.$or = [
        { name: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }

    logger.info("Applied product filters", { filters });

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filters)
        .sort(sort.split(",").join(" "))
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filters),
    ]);

    logger.info("Products fetched successfully", {
      total,
      returned: products.length,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    logger.error("Get Products Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error fetching products.");
  }
};

// -------------------------------------------------------
// GET PRODUCT BY ID
// -------------------------------------------------------
exports.getProductById = async (req, res) => {
  try {
    logger.info("Fetching product by ID", { id: req.params.id });

    const product = await Product.findById(req.params.id).populate(
      "retailer",
      "name email"
    );

    if (!product) {
      logger.warn("Product not found", { id: req.params.id });
      return sendError(res, 404, "Product not found.");
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    logger.error("Get Product Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error fetching product.");
  }
};

// -------------------------------------------------------
// UPDATE PRODUCT
// -------------------------------------------------------
exports.updateProduct = async (req, res) => {
  try {
    logger.info("Updating product", {
      id: req.params.id,
      body: req.body,
      user: req.user._id,
    });

    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, "Product not found.");

    if (product.retailer.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized product update attempt", {
        user: req.user._id,
        owner: product.retailer,
      });
      return sendError(res, 403, "Unauthorized.");
    }

    Object.assign(product, req.body);
    await product.save();

    logger.info("Product updated successfully", { id: product._id });

    res.status(200).json({
      success: true,
      message: "Product updated",
      product,
    });
  } catch (err) {
    logger.error("Update Product Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error updating product.");
  }
};

// -------------------------------------------------------
// DELETE PRODUCT
// -------------------------------------------------------
exports.deleteProduct = async (req, res) => {
  try {
    logger.info("Deleting product", { id: req.params.id, user: req.user._id });

    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, "Product not found.");

    if (product.retailer.toString() !== req.user._id.toString()) {
      logger.warn("Unauthorized delete attempt", {
        user: req.user._id,
        owner: product.retailer,
      });
      return sendError(res, 403, "Unauthorized.");
    }

    await product.deleteOne();

    logger.info("Product deleted successfully", { id: req.params.id });

    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    logger.error("Delete Product Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error deleting product.");
  }
};

// -------------------------------------------------------
// GET MY PRODUCTS (retailer)
// -------------------------------------------------------
exports.getMyProducts = async (req, res) => {
  try {
    logger.info("Fetching retailer's products", { user: req.user._id });

    const products = await Product.find({ retailer: req.user._id });

    if (!products.length) {
      logger.warn("No products found for retailer", { user: req.user._id });
      return sendError(res, 404, "No products found.");
    }

    logger.info("Retailer products fetched", {
      count: products.length,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    logger.error("Get My Products Error", {
      error: err.message,
      stack: err.stack,
    });
    sendError(res, 500, "Error fetching retailer products.");
  }
};
