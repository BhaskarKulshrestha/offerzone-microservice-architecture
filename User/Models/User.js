const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["retailer", "customer"],
      required: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.models.User || mongoose.model("User", userSchema);