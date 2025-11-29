const Product = require("../Models/Product");
const logger = require("../utils/logger");

const resolvers = {
    Query: {
        getProducts: async (_, args) => {
            try {
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
                } = args;

                const filters = {};

                if (city) filters.city = city;
                if (area) filters.area = area;
                if (category) filters.category = category;
                if (brand) filters.brand = brand;

                if (minPrice || maxPrice) {
                    filters.price = {};
                    if (minPrice) filters.price.$gte = minPrice;
                    if (maxPrice) filters.price.$lte = maxPrice;
                }

                if (search) {
                    filters.$or = [
                        { name: new RegExp(search, "i") },
                        { brand: new RegExp(search, "i") },
                        { category: new RegExp(search, "i") },
                    ];
                }

                const skip = (page - 1) * limit;

                const [products, total] = await Promise.all([
                    Product.find(filters)
                        .sort(sort.split(",").join(" "))
                        .skip(skip)
                        .limit(limit),
                    Product.countDocuments(filters),
                ]);

                return {
                    success: true,
                    count: products.length,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    products,
                };
            } catch (err) {
                logger.error("GraphQL GetProducts Error", { error: err.message });
                throw new Error("Error fetching products");
            }
        },
        getProduct: async (_, { id }) => {
            try {
                const product = await Product.findById(id);
                if (!product) throw new Error("Product not found");
                return product;
            } catch (err) {
                logger.error("GraphQL GetProduct Error", { error: err.message });
                throw new Error("Error fetching product");
            }
        },
        getMyProducts: async (_, __, context) => {
            // Note: Context should contain user info from auth middleware
            // For now, we'll assume context.user is populated if auth is working
            // If not, this might fail or return empty.
            // Given the current setup, we might need to ensure auth middleware runs before GraphQL

            // Checking if context.req.user exists (standard express-jwt/custom auth pattern)
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const products = await Product.find({ retailer: user._id });
                return products;
            } catch (err) {
                logger.error("GraphQL GetMyProducts Error", { error: err.message });
                throw new Error("Error fetching retailer products");
            }
        },
    },
    Mutation: {
        createProduct: async (_, args, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const product = await Product.create({
                    ...args,
                    retailer: user._id,
                });
                return product;
            } catch (err) {
                logger.error("GraphQL CreateProduct Error", { error: err.message });
                throw new Error("Error creating product");
            }
        },
        updateProduct: async (_, { id, ...updates }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const product = await Product.findById(id);
                if (!product) throw new Error("Product not found");

                if (product.retailer.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                Object.assign(product, updates);
                await product.save();
                return product;
            } catch (err) {
                logger.error("GraphQL UpdateProduct Error", { error: err.message });
                throw new Error("Error updating product");
            }
        },
        deleteProduct: async (_, { id }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const product = await Product.findById(id);
                if (!product) throw new Error("Product not found");

                if (product.retailer.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                await product.deleteOne();
                return { success: true, message: "Product deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteProduct Error", { error: err.message });
                throw new Error("Error deleting product");
            }
        },
    },
};

module.exports = resolvers;
