const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const logger = require("./logger");

// Load Protos
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../protos/product.proto");
const USER_PROTO_PATH = path.join(__dirname, "../../protos/user.proto");

const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const productProto = grpc.loadPackageDefinition(productPackageDefinition).product;
const userProto = grpc.loadPackageDefinition(userPackageDefinition).user;

// Create Clients
const productClient = new productProto.ProductService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);
const userClient = new userProto.UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
);

// Promisify gRPC Calls
const getProductById = (productId) => {
    return new Promise((resolve, reject) => {
        productClient.GetProduct({ id: productId }, (error, response) => {
            if (error) {
                logger.error(`gRPC GetProduct Failed: ${productId}`, { error: error.message });
                resolve(null); // Return null on error (fallback)
            } else {
                // Map response to expected format (if needed, but proto matches well)
                // Note: Proto response has 'id', but Mongoose expects '_id'.
                // We might need to map 'id' to '_id' for compatibility.
                resolve({ ...response, _id: response.id });
            }
        });
    });
};

const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        userClient.GetUser({ id: userId }, (error, response) => {
            if (error) {
                logger.error(`gRPC GetUser Failed: ${userId}`, { error: error.message });
                resolve(null);
            } else {
                resolve({ ...response, _id: response.id });
            }
        });
    });
};

const searchProducts = (params) => {
    return new Promise((resolve, reject) => {
        // Map params to SearchRequest
        const request = {
            category: params.category,
            brand: params.brand,
            search: params.search,
        };

        productClient.SearchProducts(request, (error, response) => {
            if (error) {
                logger.error("gRPC SearchProducts Failed", { error: error.message });
                resolve([]);
            } else {
                // Map products list
                const products = response.products.map((p) => ({ ...p, _id: p.id }));
                resolve(products);
            }
        });
    });
};

module.exports = {
    getProductById,
    getUserById,
    searchProducts,
};
