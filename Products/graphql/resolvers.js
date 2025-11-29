const Product = require("../Models/Product");
const logger = require("../utils/logger");
const redisClient = require("../utils/redisClient");

const CACHE_TTL = 3600; // 1 hour

const clearProductCache = async (id = null) => {
    try {
        if (id) {
            await redisClient.del(`product:${id}`);
        }
        // Invalidate all list queries
        const keys = await redisClient.keys("products:list:*");
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) {
        logger.error("Redis Cache Clear Error", err);
    }
};

const resolvers = {
    Query: {
        getProducts: async (_, args) => {
            const cacheKey = `products:list:${JSON.stringify(args)}`;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

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

                const result = {
                    success: true,
                    count: products.length,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    products,
                };

                try {
                    await redisClient.set(cacheKey, JSON.stringify(result), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }

                return result;
            } catch (err) {
                logger.error("GraphQL GetProducts Error", { error: err.message });
                throw new Error("Error fetching products");
            }
        },
        getProduct: async (_, { id }) => {
            const cacheKey = `product:${id}`;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const product = await Product.findById(id);
                if (!product) throw new Error("Product not found");

                try {
                    await redisClient.set(cacheKey, JSON.stringify(product), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }

                return product;
            } catch (err) {
                logger.error("GraphQL GetProduct Error", { error: err.message });
                throw new Error("Error fetching product");
            }
        },
        getMyProducts: async (_, __, context) => {
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
                await clearProductCache();
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
                await clearProductCache(id);
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
                await clearProductCache(id);
                return { success: true, message: "Product deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteProduct Error", { error: err.message });
                throw new Error("Error deleting product");
            }
        },
    },
};

module.exports = resolvers;
