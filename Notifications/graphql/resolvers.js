const Notification = require("../Models/Notifications");
const logger = require("../utils/logger");

const resolvers = {
    Query: {
        getNotifications: async (_, __, context) => {
            const user = context.req.user;
            if (!user) throw new Error("Unauthorized");

            try {
                return await Notification.find({ userId: user._id }).sort("-createdAt");
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
                return { success: true, message: "Notification deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteNotification Error", { error: err.message });
                throw new Error("Error deleting notification");
            }
        },
    },
};

module.exports = resolvers;
