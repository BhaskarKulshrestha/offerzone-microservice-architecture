const express = require("express");
const {
  createNotification,
  getNotificationsByUser,
  markAsRead,
  deleteNotification,
} = require("../controller/Notifications");

const router = express.Router();

router.post("/", createNotification);
router.get("/:userId", getNotificationsByUser);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
