const express = require("express");
const router = express.Router();
const { signup, login, getCurrentUser, getUserById } = require("../controller/User");
const { protect } = require("../Middleware/authMiddleware");

router.post("/", signup);
router.post("/session", login);
router.get("/me", protect, getCurrentUser);
router.get("/:id", getUserById);

module.exports = router;
