const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "offer_created",
        "offer_expiring",
        "new_retailer_approved",
        "registration_rejected",
        "new_city_deals",
        "admin_alert",
        "system",
      ],
      required: true,
    },

    action: {
      label: String,
      url: String,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    deliveredChannels: {
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// CommonJS export
module.exports = mongoose.model("Notification", NotificationSchema);
