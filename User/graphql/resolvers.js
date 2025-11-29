const User = require("../Models/User");
const logger = require("../utils/logger");

const resolvers = {
    Query: {
        getUsers: async () => {
            try {
                return await User.find();
            } catch (err) {
                logger.error("GraphQL GetUsers Error", { error: err.message });
                throw new Error("Error fetching users");
            }
        },
        getUser: async (_, { id }) => {
            try {
                const user = await User.findById(id);
                if (!user) throw new Error("User not found");
                return user;
            } catch (err) {
                logger.error("GraphQL GetUser Error", { error: err.message });
                throw new Error("Error fetching user");
            }
        },
    },
    Mutation: {
        updateUser: async (_, { id, ...updates }) => {
            try {
                const user = await User.findByIdAndUpdate(id, updates, { new: true });
                if (!user) throw new Error("User not found");
                return user;
            } catch (err) {
                logger.error("GraphQL UpdateUser Error", { error: err.message });
                throw new Error("Error updating user");
            }
        },
        deleteUser: async (_, { id }) => {
            try {
                const user = await User.findByIdAndDelete(id);
                if (!user) throw new Error("User not found");
                return { success: true, message: "User deleted" };
            } catch (err) {
                logger.error("GraphQL DeleteUser Error", { error: err.message });
                throw new Error("Error deleting user");
            }
        },
    },
};

module.exports = resolvers;
