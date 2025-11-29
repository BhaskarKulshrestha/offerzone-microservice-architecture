const express = require("express");
const {
  addFavorite,
  getFavoritesByUser,
  removeFavorite,
} = require("../controller/Favorites");

const router = express.Router();

router.post("/", addFavorite);
router.get("/:userId", getFavoritesByUser);
router.delete("/:id", removeFavorite);

module.exports = router;
