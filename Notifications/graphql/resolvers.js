const Notification = require("../Models/Notifications");
const logger = require("../utils/logger");
const redisClient = require("../utils/redisClient");

const CACHE_TTL = 3600; // 1 hour

const clearNotificationCache = async (userId) => {
    try {
        await redisClient.del(`notifications:${userId}`);
    } catch (err) {
        logger.error("Redis Cache Clear Error", err);
    }
};

const resolvers = {
    Query: {
        getNotifications: async (_, __, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            const cacheKey = `notifications:${user._id}`;
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            } catch (err) {
                logger.error("Redis Get Error", err);
            }

            try {
                const notifications = await Notification.find({ userId: user._id }).sort("-createdAt");
                try {
                    await redisClient.set(cacheKey, JSON.stringify(notifications), { EX: CACHE_TTL });
                } catch (err) {
                    logger.error("Redis Set Error", err);
                }
                return notifications;
            } catch (err) {
                logger.error("GraphQL GetNotifications Error", { error: err.message });
                throw new Error("Error fetching notifications");
            }
        },
    },
    Mutation: {
        createNotification: async (_, args) => {
            try {
                const { actionLabel, actionUrl, ...rest } = args;
                const notificationData = { ...rest };

                if (actionLabel || actionUrl) {
                    notificationData.action = {
                        label: actionLabel,
                        url: actionUrl,
                    };
                }

                const notification = await Notification.create(notificationData);
                if (notification.userId) {
                    await clearNotificationCache(notification.userId);
                }
                return notification;
            } catch (err) {
                logger.error("GraphQL CreateNotification Error", { error: err.message });
                throw new Error("Error creating notification");
            }
        },
        markAsRead: async (_, { id }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const notification = await Notification.findById(id);
                if (!notification) throw new Error("Notification not found");

                if (notification.userId.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                notification.isRead = true;
                await notification.save();
                await clearNotificationCache(user._id);
                return notification;
            } catch (err) {
                logger.error("GraphQL MarkAsRead Error", { error: err.message });
                throw new Error("Error marking notification as read");
            }
        },
        deleteNotification: async (_, { id }, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                const notification = await Notification.findById(id);
                if (!notification) throw new Error("Notification not found");

                if (notification.userId.toString() !== user._id.toString()) {
                    throw new Error("Unauthorized");
                }

                await notification.deleteOne();
                await clearNotificationCache(user._id);
                return { success: true, message: "Notification deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteNotification Error", { error: err.message });
                throw new Error("Error deleting notification");
            }
        },
    },
};

module.exports = resolvers;
