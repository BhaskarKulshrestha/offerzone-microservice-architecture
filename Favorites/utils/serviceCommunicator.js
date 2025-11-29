const axios = require("axios");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const logger = require("./logger");

const OFFER_SERVICE_URL = "http://localhost:8002/offerzone/offers";

// Load Product Proto
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../protos/product.proto");
const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productPackageDefinition).product;

const productClient = new productProto.ProductService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

const getProductById = (productId) => {
    return new Promise((resolve, reject) => {
        productClient.GetProduct({ id: productId }, (error, response) => {
            if (error) {
                logger.error(`gRPC GetProduct Failed: ${productId}`, { error: error.message });
                resolve(null);
            } else {
                resolve({ ...response, _id: response.id });
            }
        });
    });
};

const getOfferById = async (offerId) => {
    try {
        const response = await axios.get(`${OFFER_SERVICE_URL}/${offerId}`);
        return response.data.offer;
    } catch (error) {
        logger.error(`Failed to fetch offer ${offerId}`, { error: error.message });
        return null;
    }
};

module.exports = {
    getProductById,
    getOfferById,
};
