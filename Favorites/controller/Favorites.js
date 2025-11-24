const Favorite = require("../Models/Favorites.js");

// Add a favorite
const addFavorite = async (req, res) => {
  try {
    const { userId, productId, offerId } = req.body;

    // Prevent invalid empty favorite
    if (!productId && !offerId) {
      return res.status(400).json({
        success: false,
        message: "Either productId or offerId is required",
      });
    }

    // Prevent duplicate favorite
    const exists = await Favorite.findOne({ userId, productId, offerId });
    if (exists) {
      return res.status(200).json({
        success: true,
        message: "Already in favorites",
        data: exists,
      });
    }

    const favorite = await Favorite.create({ userId, productId, offerId });

    return res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add favorite",
      error: error.message,
    });
  }
};

// Get all favorites of a user
const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const favorites = await Favorite.find({ userId })
      .populate("productId")
      .populate("offerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
      error: error.message,
    });
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    await Favorite.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  getFavoritesByUser,
  removeFavorite,
};
