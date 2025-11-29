require("dotenv").config();
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger"); // <-- ADDED LOGGER

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const errorResponse = (res, statusCode, message) => {
  logger.warn(`Auth Error Response: ${message}`);
  return res.status(statusCode).json({
    success: false,
    message: message || "Something went wrong",
  });
};

// -----------------------------------------------------------
// SIGNUP
// -----------------------------------------------------------
exports.signup = async (req, res) => {
  try {
    logger.info("Signup attempt", { body: req.body });

    if (!req.body || Object.keys(req.body).length === 0)
      return errorResponse(res, 400, "Request body is empty.");

    const { name, email, password, role, city } = req.body;

    if (!name || !email || !password || !role)
      return errorResponse(res, 400, "Missing required fields.");

    if (!["retailer", "customer"].includes(role))
      return errorResponse(
        res,
        400,
        "Invalid role. Use 'retailer' or 'customer'."
      );

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("Signup failed - email already exists", { email });
      return errorResponse(res, 409, "User already exists with this email.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      city,
    });

    const token = generateToken(user);

    logger.info("Signup successful", { userId: user._id, role: user.role });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
      },
    });
  } catch (err) {
    logger.error("Signup Error", { error: err.message, stack: err.stack });
    return errorResponse(res, 500, "Internal server error during signup.");
  }
};

// -----------------------------------------------------------
// LOGIN
// -----------------------------------------------------------
exports.login = async (req, res) => {
  try {
    logger.info("Login attempt", { email: req.body?.email });

    if (!req.body || Object.keys(req.body).length === 0)
      return errorResponse(res, 400, "Request body is empty.");

    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse(res, 400, "Both email and password are required.");

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login failed - user not found", { email });
      return errorResponse(res, 404, "User not found.");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn("Login failed - invalid password", { email });
      return errorResponse(res, 401, "Invalid credentials.");
    }

    const token = generateToken(user);

    logger.info("Login successful", { userId: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
      },
    });
  } catch (err) {
    logger.error("Login Error", { error: err.message, stack: err.stack });
    return errorResponse(res, 500, "Internal server error during login.");
  }
};

// -----------------------------------------------------------
// GET CURRENT USER
// -----------------------------------------------------------
exports.getCurrentUser = async (req, res) => {
  try {
    logger.info("Fetching current user", { userId: req.user?.id });

    if (!req.user || !req.user.id)
      return errorResponse(res, 401, "Unauthorized access.");

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      logger.warn("Current user lookup failed - user not found", {
        userId: req.user.id,
      });
      return errorResponse(res, 404, "User not found.");
    }

    logger.info("Current user fetched successfully", { userId: user._id });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    logger.error("Get Current User Error", {
      error: err.message,
      stack: err.stack,
    });
    return errorResponse(res, 500, "Error fetching user details.");
  }
};

// -----------------------------------------------------------
// GET USER BY ID (Internal/Public)
// -----------------------------------------------------------
exports.getUserById = async (req, res) => {
  try {
    logger.info("Fetching user by ID", { userId: req.params.id });

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      logger.warn("User lookup failed - user not found", { id: req.params.id });
      return errorResponse(res, 404, "User not found.");
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    logger.error("Get User By ID Error", {
      error: err.message,
      stack: err.stack,
    });
    return errorResponse(res, 500, "Error fetching user.");
  }
};
