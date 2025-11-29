require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const Product = require("./Models/Product"); // Ensure Product model is available
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
const app = express();

app.use(express.json());
app.use(cors());

const stream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream }));

// Load Routes
const productRoutes = require("./Routes/Products");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    logger.error("MongoDB connection error", { error: err.message });
  });

app.get("/", (req, res) => {
  res.send("Welcome to OfferZone product microservice");
  logger.info("Root endpoint accessed");
});


app.use("/offerzone/products", productRoutes);

// GraphQL Setup
const { createYoga, createSchema } = require("graphql-yoga");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: ({ req }) => ({ req }), // Pass request to context for auth
  graphqlEndpoint: "/graphql",
});

app.use("/graphql", yoga);





// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled API Error", {
    message: err.message,
    route: req.originalUrl,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const port = process.env.PORT || 8000;

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info(`Server started on port ${port}`);
});

// -------------------------------------------------------
// gRPC Server Setup
// -------------------------------------------------------
const PROTO_PATH = path.join(__dirname, "../protos/product.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

const getProduct = async (call, callback) => {
  try {
    const product = await Product.findById(call.request.id);
    if (product) {
      const response = {
        id: product._id.toString(),
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image || "",
      };
      callback(null, response);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Product not found",
      });
    }
  } catch (err) {
    logger.error("gRPC GetProduct Error", { error: err.message });
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal Server Error",
    });
  }
};

const searchProducts = async (call, callback) => {
  try {
    const { category, brand, search } = call.request;
    const query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query);
    const response = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image || "",
    }));

    callback(null, { products: response });
  } catch (err) {
    logger.error("gRPC SearchProducts Error", { error: err.message });
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal Server Error",
    });
  }
};

const GRPC_PORT = 50051;
const server = new grpc.Server();
server.addService(productProto.ProductService.service, {
  GetProduct: getProduct,
  SearchProducts: searchProducts,
});

server.bindAsync(
  `0.0.0.0:${GRPC_PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      logger.error("gRPC Server bind error", { error: error.message });
      return;
    }
    console.log(`gRPC Server running on port ${port}`);
    logger.info(`gRPC Server running on port ${port}`);
  }
);
