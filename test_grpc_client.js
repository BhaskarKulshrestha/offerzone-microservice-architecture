const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load Protos
const productProtoPath = path.join(__dirname, "protos/product.proto");
const userProtoPath = path.join(__dirname, "protos/user.proto");

const productPackageDefinition = protoLoader.loadSync(productProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userPackageDefinition = protoLoader.loadSync(userProtoPath, {
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

// Test Functions
const testGetProduct = (id) => {
    console.log(`\nCalling GetProduct with ID: ${id}`);
    productClient.GetProduct({ id }, (error, response) => {
        if (error) {
            console.error("GetProduct Error:", error.details);
        } else {
            console.log("GetProduct Response:", response);
        }
    });
};

const testSearchProducts = (query) => {
    console.log(`\nCalling SearchProducts with query:`, query);
    productClient.SearchProducts(query, (error, response) => {
        if (error) {
            console.error("SearchProducts Error:", error.details);
        } else {
            console.log("SearchProducts Response:", response);
        }
    });
};

const testGetUser = (id) => {
    console.log(`\nCalling GetUser with ID: ${id}`);
    userClient.GetUser({ id }, (error, response) => {
        if (error) {
            console.error("GetUser Error:", error.details);
        } else {
            console.log("GetUser Response:", response);
        }
    });
};

// Run Tests
console.log("Starting gRPC Client Tests...");

// Example Usage: Replace with valid IDs from your database
const sampleProductId = "67475d635070409d1b7b6348"; // Replace with a real Product ID
const sampleUserId = "67475d635070409d1b7b6349";    // Replace with a real User ID

// 1. Search Products (should work without ID)
testSearchProducts({ search: "phone" });

// 2. Get Product (might fail if ID doesn't exist)
testGetProduct(sampleProductId);

// 3. Get User (might fail if ID doesn't exist)
testGetUser(sampleUserId);
