const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const logger = require("./logger");
const createBreaker = require("./circuitBreaker");

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
    "127.0.0.1:50051",
    grpc.credentials.createInsecure()
);
const userClient = new userProto.UserService(
    "127.0.0.1:50052",
    grpc.credentials.createInsecure()
);

// Raw gRPC Calls
const getProductByIdRaw = (productId) => {
    return new Promise((resolve, reject) => {
        productClient.GetProduct({ id: productId }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve({ ...response, _id: response.id });
            }
        });
    });
};

const getUserByIdRaw = (userId) => {
    return new Promise((resolve, reject) => {
        userClient.GetUser({ id: userId }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve({ ...response, _id: response.id });
            }
        });
    });
};

const searchProductsRaw = (params) => {
    return new Promise((resolve, reject) => {
        const request = {
            category: params.category,
            brand: params.brand,
            search: params.search,
        };

        productClient.SearchProducts(request, (error, response) => {
            if (error) {
                reject(error);
            } else {
                const products = response.products.map((p) => ({ ...p, _id: p.id }));
                resolve(products);
            }
        });
    });
};

// Circuit Breakers
const productBreaker = createBreaker(getProductByIdRaw, () => null);
const userBreaker = createBreaker(getUserByIdRaw, () => null);
const searchBreaker = createBreaker(searchProductsRaw, () => []);

// Exported Functions
const getProductById = (productId) => productBreaker.fire(productId);
const getUserById = (userId) => userBreaker.fire(userId);
const searchProducts = (params) => searchBreaker.fire(params);

module.exports = {
    getProductById,
    getUserById,
    searchProducts,
};
