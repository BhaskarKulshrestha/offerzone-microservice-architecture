const express = require("express");
const router = express.Router();
const { signup, login, getCurrentUser } = require("../controller/User");
const { protect } = require("../Middleware/authMiddleware");

router.post("/", signup); 
router.post("/session", login); 
router.get("/me", protect, getCurrentUser); 

module.exports = router;
