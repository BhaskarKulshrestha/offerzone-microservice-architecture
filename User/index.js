require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
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