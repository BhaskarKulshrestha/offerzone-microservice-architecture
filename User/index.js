require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // Added dotenv import
const grpc = require("@grpc/grpc-js"); // Added grpc import
const protoLoader = require("@grpc/proto-loader"); // Added protoLoader import
const path = require("path"); // Added path import
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
const User = require("./Models/User"); // Ensure User model is available
const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());
app.use(cors());

const stream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream }));

// Load Routes
const UserRoutes = require("./Routes/User");

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
  res.send("Welcome to OfferZone User microservice");
  logger.info("Root endpoint accessed");
});


app.use("/offerzone/users", UserRoutes);

// GraphQL Setup
const { createYoga, createSchema } = require("graphql-yoga");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: ({ req }) => ({ req }),
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

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info(`Server started on port ${port}`);
});

// -------------------------------------------------------
// gRPC Server Setup
// -------------------------------------------------------
const PROTO_PATH = path.join(__dirname, "../protos/user.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const getUser = async (call, callback) => {
  try {
    const user = await User.findById(call.request.id);
    if (user) {
      const response = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city || "",
        phone: user.phone || "",
      };
      callback(null, response);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    }
  } catch (err) {
    logger.error("gRPC GetUser Error", { error: err.message });
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal Server Error",
    });
  }
};

const GRPC_PORT = 50052;
const server = new grpc.Server();
server.addService(userProto.UserService.service, {
  GetUser: getUser,
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