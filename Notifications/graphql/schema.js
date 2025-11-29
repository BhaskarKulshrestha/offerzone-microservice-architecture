const { buildSchema } = require("graphql");

module.exports = `
  type Notification {
    id: ID!
    userId: ID!
    title: String!
    message: String!
    type: String!
    action: Action
    isRead: Boolean
    scheduledAt: String
    expiresAt: String
    createdAt: String
    updatedAt: String
  }

  type Action {
    label: String
    url: String
  }

  type Query {
    getNotifications: [Notification]
  }

  type Mutation {
    createNotification(
      userId: ID!
      title: String!
      message: String!
      type: String!
      actionLabel: String
      actionUrl: String
    ): Notification
    markAsRead(id: ID!): Notification
    deleteNotification(id: ID!): MessageResponse
  }

  type MessageResponse {
    success: Boolean!
    message: String!
  }
`;
