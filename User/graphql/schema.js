const { buildSchema } = require("graphql");

module.exports = `
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    city: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    updateUser(id: ID!, name: String, city: String): User
    deleteUser(id: ID!): MessageResponse
  }

  type MessageResponse {
    success: Boolean!
    message: String!
  }
`;
